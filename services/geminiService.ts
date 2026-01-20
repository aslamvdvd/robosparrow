import { GoogleGenAI } from "@google/genai";

// Available Gemini models
export const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Latest, fastest' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast & efficient' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: 'Lightweight' },
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
  currentCode: string
): Promise<string> => {
  if (!apiKey) {
    return "⚠️ Please enter your Gemini API key in the settings panel to use AI features.";
  }

  try {
    const ai = createAIClient(apiKey);
    const fullPrompt = `
      You are an expert Robotics and Arduino Engineer.
      The user is working in a simulated environment called RoboLab.
      
      Current Code:
      \`\`\`javascript
      ${currentCode}
      \`\`\`
      
      User Question: ${prompt}
      
      Provide a helpful response. If the user asks for code, provide valid JavaScript that uses standard Arduino naming conventions (digitalWrite, analogWrite, pinMode, delay, loop, setup).
      Explain the concepts briefly.
      Keep the response concise and formatted with Markdown.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
    });

    return response.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
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
    if (error.status === 404) {
      return "❌ Model not found. Try selecting a different model.";
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
