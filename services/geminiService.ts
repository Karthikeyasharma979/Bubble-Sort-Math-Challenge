import { GoogleGenAI, Type } from "@google/genai";
import { BubbleData } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMathLevel = async (level: number): Promise<BubbleData[]> => {
  // Difficulty Scaling Logic
  let minVal = 1;
  let maxVal = 20;
  let complexityDesc = "simple integers or very basic addition (e.g., '5', '2+3')";
  
  if (level > 2 && level <= 5) {
    maxVal = 50;
    complexityDesc = "addition and subtraction using numbers up to 50 (e.g., '25-5', '12+8', '40')";
  } else if (level > 5 && level <= 10) {
    maxVal = 100;
    complexityDesc = "mixed addition, subtraction, and simple multiplication (e.g., '5*2', '100-15', '20+20')";
  } else if (level > 10) {
    minVal = 10;
    maxVal = 200 + (level * 10);
    complexityDesc = "complex expressions involving multiplication, division, or multiple operators (e.g. '5*5+2', '100/2', '120-45')";
  }
  
  // Create a JSON schema for the response
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        expression: {
          type: Type.STRING,
          description: "A visually concise math expression or number.",
        },
        value: {
          type: Type.INTEGER,
          description: "The calculated integer value of the expression.",
        },
      },
      required: ["expression", "value"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate exactly 3 unique math expressions for a game level (Level ${level}).
      
      Constraints:
      1. The results must be distinct integers between ${minVal} and ${maxVal}.
      2. The expressions should match this complexity: ${complexityDesc}.
      3. Keep expressions visually short (max 6 characters if possible) to fit in a bubble.
      4. Ensure the values are NOT sorted; randomize their order effectively.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1.0, 
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    // Add IDs to the bubbles
    return data.map((item: any, index: number) => ({
      id: `bubble-${Date.now()}-${index}`,
      expression: item.expression,
      value: item.value
    }));

  } catch (error) {
    console.error("Error generating level:", error);
    // Fallback in case of API error
    return [
      { id: '1', expression: '2+3', value: 5 },
      { id: '2', expression: '9', value: 9 },
      { id: '3', expression: '4-1', value: 3 },
    ];
  }
};