
import { GoogleGenAI, Type } from "@google/genai";

export interface ParsedReceiptItem {
  name: string;
  price: number;
}

export const parseReceiptImage = async (base64Data: string): Promise<ParsedReceiptItem[]> => {
  // Always create a fresh instance with the current process.env.API_KEY
  // Fix: Removed unnecessary logical OR to adhere to strict initialization rules
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extract base64 and mime type correctly
  const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: "You are a professional receipt digitizer. Scan this image and extract every single purchased item as a separate object. Extract only the base price for each item. Ignore tax, tips, or service fees unless they are listed as separate specific items you want to keep. Return ONLY a raw JSON array of objects with 'name' (string) and 'price' (number) keys. Do not include markdown formatting or explanation text."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Item description" },
              price: { type: Type.NUMBER, description: "Item cost as a number" }
            },
            required: ["name", "price"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Attempt to clean the text in case the model ignored 'no markdown' instructions
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```[a-z]*\n/, "").replace(/\n```$/, "");
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Scanning Error Details:", error);
    throw error;
  }
};
