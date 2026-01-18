import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_ANALYSIS, MODEL_EDIT, MODEL_PRO_GEN, TAVILY_API_KEY } from "../constants";
import { AspectRatio, ImageSize } from "../types";

// Helper to check for API key
const getApiKey = async (needsPro: boolean = false): Promise<string> => {
  if (needsPro) {
    // Check if window.aistudio exists and handle key selection
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
      // Assuming the key is injected into env after selection or handled internally by the environment
      // For this environment, we still use process.env.API_KEY, but we ensure the selection flow happened.
    }
  }
  
  if (!process.env.API_KEY) {
    console.error("API Key not found in environment");
    // In a real scenario, we might prompt, but for this task we assume it exists or is injected.
    return '';
  }
  return process.env.API_KEY;
};

// 1. Analyze Product
export const analyzeProduct = async (
  name: string,
  description: string,
  imageBase64: string,
  mimeType: string
) => {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this product image along with the name "${name}" and description: "${description}".
    Identify:
    1. Key visual characteristics (shape, material, texture).
    2. A dominant color palette.
    3. Three short, punchy marketing hooks (max 5 words each).
    4. The best banner style among: 'ecommerce', 'lifestyle', 'minimalist'.
    
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ANALYSIS,
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualCharacteristics: { type: Type.STRING },
            colorPalette: { type: Type.STRING },
            marketingHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedBannerStyle: { type: Type.STRING, enum: ['ecommerce', 'lifestyle', 'minimalist'] }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// 2. Generate/Edit Asset (Nano Banana)
export const generateMarketingAsset = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
) => {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_EDIT, // Nano Banana (2.5 Flash Image)
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt }
        ]
      },
      // Note: 2.5 Flash Image does not support responseMimeType/Schema for images usually, but returns image parts
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Asset generation failed:", error);
    throw error;
  }
};

// 3. Pro Generation (Nano Banana Pro)
export const generateProAsset = async (
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize
) => {
  const apiKey = await getApiKey(true); // Requires Pro key selection
  // Re-instantiate to ensure fresh key if changed
  const ai = new GoogleGenAI({ apiKey });

  try {
    // Using generateContent for pro model as per guidelines for image generation
    const response = await ai.models.generateContent({
      model: MODEL_PRO_GEN,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize
        }
      }
    });

     for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;

  } catch (error) {
    console.error("Pro generation failed:", error);
    throw error;
  }
};

// 4. Generate Product Description from Web Search (Tavily + Gemini)
export const generateProductDescription = async (productName: string): Promise<string> => {
  if (!TAVILY_API_KEY) throw new Error("Tavily API Key missing");

  try {
    // Step 1: Search Web using Tavily
    const searchResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: `${productName} product description features specifications from amazon daraz and its use cases`,
        search_depth: "advanced",
        include_answer: false,
        max_results: 8
      })
    });

    if (!searchResponse.ok) {
      throw new Error("Failed to fetch search results");
    }

    const searchData = await searchResponse.json();
    const results = searchData.results || [];
    const context = results.map((r: any) => `${r.title}: ${r.content}`).join("\n\n");

    if (!context) {
      return "Could not find sufficient information on the web. Please enter a description manually.";
    }

    // Step 2: Synthesize description using Gemini
    const apiKey = await getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an e-commerce marketing expert. 
      Write a compelling, professional product description (max 450 characters) for a product named "${productName}".
      Use the following web search results as context for the product's features and benefits:
      
      ${context}
      
      The description should be ready for a Shopify product page. Focus on benefits and key features. 
      Do not include markdown, titles, or "Here is a description" text. Just the description paragraph.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ANALYSIS, // Using 'gemini-3-flash-preview' for text generation
      contents: { parts: [{ text: prompt }] }
    });

    return response.text || "";

  } catch (error) {
    console.error("Auto-description failed:", error);
    throw error;
  }
};