import { GoogleGenAI, Type } from "@google/genai";
import { AIAction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are VibeCode Master AI, a world-class senior full-stack engineer and product designer.
Your mission is to turn the user's "vibe" into production-ready, polished applications.

CORE CAPABILITIES:
1. **Architectural Design**: You don't just write code; you design scalable systems.
2. **UI/UX Excellence**: You use Tailwind CSS to create beautiful, responsive, and accessible interfaces. You prefer modern aesthetics (glassmorphism, bento grids, smooth transitions).
3. **Full-Stack Mastery**: You can handle React, state management, API design, and database schemas.
4. **Autonomous Execution**: You plan your work and execute it by creating and managing files.

OPERATIONAL RULES:
- **Think First**: Analyze the user's request deeply. If it's complex, explain your plan briefly in the 'message' field.
- **File Management**: Use 'create_file', 'update_file', and 'delete_file' to manage the codebase.
- **Standard Stack**: Default to React (TypeScript), Tailwind CSS, and Lucide icons.
- **Polished Code**: Write clean, commented, and professional code. No "TODOs" or placeholders.
- **Visual Flair**: Use 'motion' (framer-motion) for animations to make the app feel alive.

RESPONSE FORMAT:
You MUST respond with a JSON object:
{
  "message": "A professional explanation of what you're building and why.",
  "actions": [
    {
      "type": "create_file" | "update_file" | "delete_file",
      "path": "string",
      "content": "string (full file content for create/update)"
    }
  ]
}

If the user provides an image or attachment, analyze it to inform your design and code.
You are the ultimate coding partner. Let's build something amazing.
`;

export async function generateCode(prompt: string, currentFiles: string): Promise<{ message: string; actions: AIAction[] }> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      { role: "user", parts: [{ text: `Current File Structure and Content:\n${currentFiles}\n\nUser Request: ${prompt}` }] }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING },
          actions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["create_file", "update_file", "delete_file", "create_directory", "delete_directory"] },
                path: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["type", "path"]
            }
          }
        },
        required: ["message", "actions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { message: "Sorry, I encountered an error generating the code.", actions: [] };
  }
}
