import { GoogleGenAI } from "@google/genai";

// Available Gemini models
// Available Gemini models
export const GEMINI_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)', description: 'Next-gen reasoning' },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]['id'];

// Create AI client with user-provided API key
const createAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

export const generateCodeHelp = async (
  apiKey: string, 
  model: GeminiModelId,
  prompt: string, 
  currentCode: string,
  components: any[] = [],
  connections: any[] = []
): Promise<string> => {
  if (!apiKey) {
    return "⚠️ Please enter your Gemini API key in the settings panel to use AI features.";
  }

  try {
    const ai = createAIClient(apiKey);
    
    // Serialize state for the AI
    const stateContext = JSON.stringify({
      components: components.map(c => ({ 
        uid: c.uid, 
        id: c.id, 
        name: c.name, 
        pins: c.pins.map((p: any) => p.id),
        position: c.position 
      })),
      connections: connections.map(c => ({
        from: c.from,
        to: c.to,
        color: c.color
      }))
    }, null, 2);

    const fullPrompt = `
      You are an expert Robotics Engineer with "God View" control over a virtual studio. Your name is RoboBuddy.
      
      You can Answer questions, Write Code, and directly MODIFY the circuit.
      
      CURRENT STUDIO STATE:
      ${stateContext}
      
      USER'S CURRENT CODE EDITOR CONTENT:
      \`\`\`javascript
      ${currentCode}
      \`\`\`
      
      USER REQUEST: ${prompt}
      
      --- INSTRUCTIONS ---
      1. If the user asks for code, provide it in a markdown block.
      2. If the user asks to CHANGE the circuit (add components, wire things), or UPDATE the code directly, output a JSON BLOCK at the end of your response.
      
      JSON ACTION FORMAT:
      \`\`\`json
      {
        "action": "UPDATE_CIRCUIT", 
        "operations": [
          { "type": "ADD_COMPONENT", "componentId": "led-red", "x": 300, "y": 300 },
          { "type": "CONNECT", "from": { "compUid": "arduino-1", "pinId": "D13" }, "to": { "compUid": "LAST_ADDED", "pinId": "POS" }, "color": "red" },
          { "type": "UPDATE_CODE", "targetCompUid": "arduino-1", "code": "// New code here..." },
          { "type": "DELETE_COMPONENT", "uid": "component-uid-to-delete" },
          { "type": "DELETE_CONNECTION", "id": "connection-id-to-delete" }
        ]
      }
      \`\`\`
      
      For 'CONNECT', 'from' and 'to' must match the component UIDs in the state OR use "LAST_ADDED" to refer to a component you just created in the same block.
      
      Keep explanations concise/helpful.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
    });

    return response.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Log full error details for debugging
    if (error.response) {
       console.error("API Response Error Body:", JSON.stringify(error.response, null, 2));
    }
    
    // More specific error messages
    if (error.status === 503) {
      return "[RETRYABLE] ⚠️ The AI model is currently overloaded (503). Please try again in a moment.";
    }
    
    if (error.status === 400) {
      if (error.message?.includes('expired')) {
        return "❌ Your API Key has expired. Please verify and update it in Settings.";
      }
      return `❌ Bad request: ${error.message || 'Please check your input.'}`;
    }
    if (error.status === 401 || error.status === 403) {
      return "❌ Invalid or unauthorized API key. Please check your Gemini API key in Settings.";
    }
    if (error.status === 429) {
      return "⚠️ Rate limit exceeded. You may have hit the free tier quota (RPM/TPM). Please wait a minute or check your Google AI Studio quota.";
    }
    if (error.status === 404) {
      return `❌ Model '${model}' not found. It might be deprecated or not available in your region.`;
    }
    if (error.message?.includes('API key')) {
      return "❌ Invalid API key. Please check your Gemini API key and try again.";
    }
    if (error.message?.includes('fetch')) {
      return "❌ Network error. Please check your internet connection.";
    }
    
    return `Error: ${error.message || 'Unknown error communicating with AI Assistant.'}`;
  }
};

export const analyzeCircuit = async (
  apiKey: string, 
  model: GeminiModelId,
  components: any[], 
  connections: any[]
): Promise<string> => {
  if (!apiKey) {
    return "⚠️ Please enter your Gemini API key in the settings panel to use AI features.";
  }

  try {
    const ai = createAIClient(apiKey);
    const circuitDescription = JSON.stringify({ components, connections }, null, 2);
    const prompt = `
      Analyze this robotics circuit layout JSON:
      ${circuitDescription}
      
      1. Is it a valid setup for a 2WD Robot Car?
      2. Are there any missing connections (e.g., ground loops, power)?
      3. Give one tip to improve it.
      
      Keep it short.
    `;
     
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not analyze circuit.";
  } catch (error: any) {
    console.error("Gemini Circuit Analysis Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      name: error.name,
    });
    
    // More specific error messages
    if (error.status === 400) {
      return `❌ Bad request: ${error.message || 'Please check your input.'}`;
    }
    if (error.status === 401 || error.status === 403) {
      return "❌ Invalid or unauthorized API key. Please check your Gemini API key.";
    }
    if (error.status === 429) {
      return "⚠️ Rate limit exceeded. Please wait a moment and try again, or switch to a different model.";
    }
    if (error.message?.includes('API key')) {
      return "❌ Invalid API key. Please check your Gemini API key and try again.";
    }
    
    return `Error: ${error.message || 'Unknown error analyzing circuit.'}`;
  }
}
