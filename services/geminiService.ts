
import { GoogleGenAI } from "@google/genai";
import { Plan, ChatMessage, Language } from '../types';

const getAPIKey = (key: string) => {
    return import.meta.env[key] || (process.env as any)[key] || '';
};

const getAiInstance = () => {
  return new GoogleGenAI({ apiKey: getAPIKey('VITE_GEMINI_API_KEY') });
};

const GEMINI_MODEL = 'gemini-2.0-flash-exp';

export const analyzeImageAndPrompt = async (
  prompt: string,
  imageBase64: string,
  mimeType: string,
  plan: Plan,
  lang: Language
): Promise<{ text: string; sources?: any[] }> => {
  const ai = getAiInstance();
  // التوحيد على نموذج Flash حصرياً
  const modelId = GEMINI_MODEL;

  const systemInstruction = `أنت معلم خبير. حلل الصورة وحل المسائل بوضوح ودقة باللغة العربية.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      }
    });

    return { 
      text: response.text || "لم يتم إنتاج رد.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error: any) {
    throw error;
  }
};

export const continueConversation = async (history: ChatMessage[], plan: Plan, lang: Language): Promise<string> => {
  const ai = getAiInstance();
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
      config: { 
        systemInstruction: "أنت مدرس صبور يساعد الطالب في فهم خطوات الحل.",
      }
    });
    return response.text || "...";
  } catch (e) {
    return "عذراً، حدث خطأ في المحادثة.";
  }
};
