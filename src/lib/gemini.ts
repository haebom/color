import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
// Expects NEXT_PUBLIC_GEMINI_API_KEY to be set in environment variables
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export interface GradientConfig {
  stops: { color: string; position: number }[];
  angle: number;
  type: "linear" | "radial";
  shadow: {
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    opacity: number;
    color: string;
  };
  reason: string;
}

export interface PaletteSuggestion {
  base: string;
  reason: string;
}

export async function generateGradientConfig(palette: string[]): Promise<GradientConfig | null> {
  try {
    const prompt = `
      You are an expert UI/UX designer.
      Given the following color palette: ${palette.join(", ")}.
      Create a beautiful, modern CSS gradient and a matching box-shadow using these colors (or slight variations if needed for better aesthetics).
      
      Return a JSON object with this structure:
      {
        "stops": [{ "color": "#hex", "position": number (0-100) }],
        "angle": number (0-360),
        "type": "linear" or "radial",
        "shadow": {
          "offsetX": number,
          "offsetY": number,
          "blur": number,
          "spread": number,
          "opacity": number (0-1),
          "color": "#hex"
        },
        "reason": "Short explanation of the design choice"
      }
      
      Ensure the gradient is visually appealing and the shadow adds depth.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return JSON.parse(text) as GradientConfig;
  } catch {
    return null;
  }
}

export async function suggestNewPalette(currentBase: string, request?: string): Promise<PaletteSuggestion | null> {
  try {
    const prompt = `
      You are an expert color theorist.
      The current base color is ${currentBase}.
      ${request ? `User request: "${request}"` : "Suggest a better or more interesting base color for a UI color scale."}
      
      Return a JSON object with:
      {
        "base": "#hex",
        "reason": "Short explanation"
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return JSON.parse(text) as PaletteSuggestion;
  } catch {
    return null;
  }
}
