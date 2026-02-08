import { GoogleGenAI } from "@google/genai";
import { ComponentData } from '../types';
import { COMPONENT_LIBRARY } from '../constants';

// Available Gemini models
export const GEMINI_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)', description: 'Next-gen reasoning' },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]['id'];

// Create AI client with user-provided API key
const createAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

export const getGeminiApiKey = (): string | null => {
  // 1. Check Local Storage (User Override)
  const localKey = localStorage.getItem("robo-sparrow-api-key");
  if (localKey && localKey.trim().length > 0) {
    console.log("[GeminiService] Using API Key from LocalStorage");
    return localKey;
  }
  
  // 2. Check Vite Env Var (Standard way)
  // @ts-ignore
  if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
     // @ts-ignore
     const rawVal = import.meta.env.VITE_GEMINI_API_KEY;
     // Remove any surrounding quotes that might have been picked up from .env
     const cleanVal = rawVal.replace(/^"|"$/g, '').trim();
          
     return cleanVal;
  }

  // 3. Fallback to old custom define (Legacy support support)
  try {
    // @ts-ignore
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey) {
        console.log("[GeminiService] Using API Key from process.env");
        return envKey;
    }
  } catch (e) {
    // Ignore
  }
  
  console.warn("[GeminiService] No API Key found in LocalStorage or Env!");
  return null;
};
const getLibraryContext = (): string => {
  return COMPONENT_LIBRARY.map(c => 
    `- ID: "${c.id}" (${c.name}): ${c.description}. Pins: ${c.pins.map(p => p.id).join(', ')}`
  ).join('\n');
};

export const generateCodeHelp = async (
  apiKey: string, 
  model: GeminiModelId,
  prompt: string, 
  currentCode: string,
  components: any[] = [],
  connections: any[] = [],
  agentMode: 'auto' | 'manual' = 'manual'
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
        // pins: c.pins.map((p: any) => p.id), // Context reduction
        position: c.position 
      })),
      connections: connections.map(c => ({
        from: c.from,
        to: c.to,
        color: c.color
      }))
    }, null, 2);

    const libraryContext = getLibraryContext();

    const fullPrompt = `
      You are an expert Robotics Engineer with "God View" control over a virtual studio. Your name is RoboBuddy.
      You are currently in **${agentMode.toUpperCase()}** mode.
      
      You can Answer questions, Write Code, and directly MODIFY the circuit.
      
      AVAILABLE COMPONENT LIBRARY (Use these IDs for ADD_COMPONENT):
      ${libraryContext}
      
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
          { "type": "ADD_COMPONENT", "componentId": "led-red", "x": 300, "y": 300, "tempId": "my-led" },
          { "type": "ADD_COMPONENT", "componentId": "arduino-uno", "x": 100, "y": 300, "tempId": "my-arduino" },
          { "type": "CONNECT", "from": { "tempId": "my-arduino", "pinId": "D13" }, "to": { "tempId": "my-led", "pinId": "POS" }, "color": "red" },
          { "type": "UPDATE_CODE", "targetTempId": "my-arduino", "code": "// New code here..." },
          { "type": "OPEN_PANEL", "panel": "editor" },
          { "type": "DELETE_COMPONENT", "uid": "existing-uid" },
        ]
      }
      \`\`\`
      
      CRITICAL RULES:
      - **IDs**: Use valid IDs from the Library.
      - **Temp IDs**: When adding components, assign a unique \`tempId\`. Use this \`tempId\` in \`CONNECT\` and \`UPDATE_CODE\` to reference them in the same block.
      - **Code Injection**: When writing code for a Microcontroller, ALWAYS include the \`UPDATE_CODE\` action targeting its \`tempId\` (if new) or \`uid\` (if existing).
      - **Open Editor**: If you update code, ALWAYS include \`{ "type": "OPEN_PANEL", "panel": "editor" }\` so the user sees it.
      - **Multiple MCUs**:
        - If \`agentMode\` is **AUTO**: Automatically select the most relevant Microcontroller for the code. Do not ask.
        - If \`agentMode\` is **MANUAL** and multiple MCUs exist: You may ASK the user which one to program, OR make a best guess if obvious.
      
      Keep explanations concise/helpful.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
    });

    return response.text || "No response generated.";
  } catch (error: any) {
     // ... (Error handling remains same)
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
export const transpileCode = async (
  apiKey: string,
  model: GeminiModelId,
  code: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key required");

  const ai = createAIClient(apiKey);
  const prompt = `
    Turn this Arduino C++ code into a single valid JavaScript function body for a simulation sandbox.
    
    RULES:
    1. The output will be executed as: "new Function(..., body)".
    2. Map 'digitalWrite/analogWrite' to '__writePin/__pwmPin'.
    3. Map 'digitalRead/analogRead' to '__readPin/__readAnalog'.
    4. Map 'delay()' to '__delay()' (or ignore it).
    5. Map 'Serial.print' to '__log'.
    6. Convert C++ constants/types (int, float, const) to Let/Const.
    7. PRESERVE GLOBAL VARIABLES! They must be at the top level of the function body.
    8. Convert 'void setup()' to 'function setup()'.
    9. Convert 'void loop()' to 'function loop()'.
    10. END the code with "return { setup, loop };" so I can extract the functions.
    
    Example Output Format:
    "
    let led = 13;
    function setup() { __writePin(led, 0); }
    function loop() { __writePin(led, 1); }
    return { setup, loop };
    "

    C++ CODE:
    ${code}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  
  let text = response.text || "";
  // Clean markdown
  text = text.replace(/```javascript|```js|```/g, "").trim();
  return text;
};
