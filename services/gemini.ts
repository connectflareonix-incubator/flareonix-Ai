
import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationResult, ResearchSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const EVALUATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    successRate: { type: Type.NUMBER },
    improvedSuccessRate: { type: Type.NUMBER },
    metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          A: { type: Type.NUMBER },
          fullMark: { type: Type.NUMBER }
        }
      }
    },
    competitors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          stage: { type: Type.STRING },
          strategy: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    historicalTrends: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.STRING },
          successRate: { type: Type.NUMBER }
        }
      }
    },
    marketGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
    strategicSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    technicalRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    specialistHiringGuide: { type: Type.ARRAY, items: { type: Type.STRING } },
    deepMarketMap: {
      type: Type.OBJECT,
      properties: {
        sectors: { type: Type.ARRAY, items: { type: Type.STRING } },
        riskHeatmap: { type: Type.STRING }
      },
      required: ["sectors", "riskHeatmap"]
    }
  },
  required: ["summary", "successRate", "metrics", "competitors", "historicalTrends", "marketGaps", "strategicSuggestions", "technicalRequirements", "specialistHiringGuide", "deepMarketMap"]
};

export async function evaluateIdea(prompt: string, userProfile?: any): Promise<{ evaluation: EvaluationResult; sources: ResearchSource[] }> {
  const systemInstruction = `
    You are the Flareonix Intelligence Brain, a world-class startup economist and research scientist.
    Provide a hyper-detailed, Perplexity-style analysis of the user's startup idea.
    
    CRITICAL INSTRUCTIONS:
    1. DEEP COMPETITION: Identify top 3 specific real-world competitors. Analyze their core strategy, specific strengths, and exploitable weaknesses.
    2. HISTORICAL CONTEXT: Provide 5 years of historical success trends for this specific niche.
    3. SPECIALIST HIRING: Do not promote Flareonix directly. Instead, identify the specific types of engineers (e.g., "Full-stack with Rust expertise," "NLP Specialist") and marketing talent required.
    4. MARKET MAP: Break down the ecosystem sectors and provide a textual risk heatmap.
    5. KNOWLEDGE DEPTH: Use advanced business terminology (TAM/SAM/SOM, Unit Economics, Burn Rate, Moat).
    
    Respond in JSON format following the schema provided.
  `;

  try {
    const [evalPromise, searchPromise] = [
      ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: EVALUATION_SCHEMA,
          temperature: 0.7,
        }
      }),
      ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Research deep market analysis, real competitors, and specific talent requirements for: ${prompt}`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      })
    ];

    const [evalResponse, searchResponse] = await Promise.all([evalPromise, searchPromise]);

    const evaluation: EvaluationResult = JSON.parse(evalResponse.text || "{}");
    const rawSources = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: ResearchSource[] = rawSources
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web?.title || "Market Insight",
        url: chunk.web?.uri || "#",
        relevance: "High"
      }))
      .slice(0, 5);

    return { evaluation, sources };
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    throw new Error("Flareonix intelligence modules are recalibrating. Please refine your prompt and try again.");
  }
}
