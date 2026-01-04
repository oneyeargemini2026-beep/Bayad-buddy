
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ParsedReceiptItem {
  name: string;
  price: number;
}

export const parseReceiptImage = async (base64Data: string): Promise<ParsedReceiptItem[]> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data.split(',')[1] || base64Data,
          },
        },
        {
          text: "Extract all items and their individual prices from this receipt. Ignore tax, total, or subtotal lines unless they are actual distinct menu items. Return an array of objects."
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
            name: { type: Type.STRING, description: "Name of the item" },
            price: { type: Type.NUMBER, description: "Price of the item" }
          },
          required: ["name", "price"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};
