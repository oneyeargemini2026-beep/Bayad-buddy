import { GoogleGenAI, Type } from "@google/genai";

export interface ParsedReceiptItem {
  name: string;
  price: number;
}

export const parseReceiptImage = async (base64Data: string): Promise<ParsedReceiptItem[]> => {
  // Use the injected API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Extract base64 and mime type correctly
  const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

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
            text: "You are a professional receipt parser. Extract every individual line item and its unit price from this image. DO NOT include tax, service charges, discounts, or grand totals. If an item name is unclear, use your best guess from context. Format the output as a JSON array of objects with 'name' and 'price' keys."
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
              name: { type: Type.STRING, description: "Detailed name of the item" },
              price: { type: Type.NUMBER, description: "Numeric price of the item" }
            },
            required: ["name", "price"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Scanning Error:", error);
    throw error;
  }
};