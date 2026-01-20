import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCodeHelp = async (prompt: string, currentCode: string): Promise<string> => {
  try {
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
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with AI Assistant. Please check your API key.";
  }
};

export const analyzeCircuit = async (components: any[], connections: any[]): Promise<string> => {
  try {
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
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not analyze circuit.";
  } catch (error) {
    console.error("Gemini Circuit Analysis Error", error);
    return "Error analyzing circuit.";
  }
}
