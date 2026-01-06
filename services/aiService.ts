
import { GoogleGenAI } from "@google/genai";
import { Plan, AIProvider, Subject, EducationLevel, ChatMessage, TestResult, LearningProfile } from '../types';

// استخدام متغيرات البيئة بشكل آمن
const getAPIKey = (key: string) => {
    return import.meta.env[key] || (process.env as any)[key] || '';
};

const EXTERNAL_KEYS = {
    GEMINI: getAPIKey('VITE_GEMINI_API_KEY'),
    DEEPSEEK: getAPIKey('VITE_DEEPSEEK_API_KEY'),
    OPENROUTER: getAPIKey('VITE_OPENROUTER_API_KEY')
};

// تهيئة GoogleGenAI
const getGemini = () => new GoogleGenAI({ apiKey: EXTERNAL_KEYS.GEMINI });

// تحديد النموذج الصحيح لـ Gemini
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // أو gemini-1.5-flash حسب التوفر

/**
 * بروتوكول الاكتشاف التلقائي الذكي
 */
export const autoDetectContent = async (text: string, imageBase64?: string): Promise<{ subject: Subject, level: EducationLevel, difficulty: string }> => {
    const ai = getGemini();
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: imageBase64 ? { 
                parts: [{ inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }, { text: `Analyze and detect subject, education level, and difficulty in JSON format: ${text}` }] 
            } : `Analyze and detect subject, education level, and difficulty in JSON format: ${text}`,
            config: { 
                responseMimeType: "application/json",
                systemInstruction: "Return ONLY JSON with keys: subject (math, physics, etc), level (primary, middle, high, university), difficulty (easy, medium, hard)."
            }
        });
        return JSON.parse(response.text || '{"subject":"auto","level":"auto","difficulty":"medium"}');
    } catch { return { subject: 'auto', level: 'auto', difficulty: 'medium' }; }
};

/**
 * بروتوكول Zero-Mistake - الحل النهائي الموحد
 */
export const solveWithMightyMind = async (
    prompt: string,
    imageBase64: string | null,
    mimeType: string | null,
    options: { plan: Plan; learningProfile?: LearningProfile }
): Promise<{ text: string; providerUsed: string; sources?: any[] }> => {
    const detection = await autoDetectContent(prompt, imageBase64 || undefined);
    
    const zeroMistakeInstruction = `
        أنت Amr AI - المحرك التعليمي الأكثر دقة في العالم.
        اتبع بروتوكول "Zero-Mistake" الصارم:
        1. استخراج المعطيات بدقة.
        2. تحديد القوانين العلمية المستخدمة.
        3. الحل بخطوات منطقية متسلسلة.
        4. إثبات رياضي أو منطقي للحل.
        5. شرح لماذا الإجابة صحيحة ولماذا الاحتمالات الأخرى خاطئة.
        6. جدول مقارنة شامل إذا لزم الأمر.
        7. مستوى الطالب المستهدف: ${options.learningProfile?.level_summary || 'تلقائي'}.
        8. المادة المكتشفة: ${detection.subject}.
    `;

    // توجيه المسائل الرياضية المعقدة لـ DeepSeek
    if ((detection.subject === 'math' || detection.subject === 'physics') && !imageBase64) {
        try {
            const resp = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${EXTERNAL_KEYS.DEEPSEEK}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: zeroMistakeInstruction },
                        { role: "user", content: prompt }
                    ]
                })
            });
            const data = await resp.json();
            if (data.choices?.[0]?.message?.content) {
                return { text: data.choices[0].message.content, providerUsed: "AmrAi Reasoning Core (DeepSeek)" };
            }
        } catch (e) { console.error("DeepSeek Error", e); }
    }

    // الاستخدام الأساسي لـ Gemini لقدرته البصرية والبحثية
    const ai = getGemini();
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: imageBase64 ? {
            parts: [{ inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }, { text: prompt || "حل هذه المسألة ببروتوكول Zero-Mistake." }]
        } : prompt,
        config: { 
            systemInstruction: zeroMistakeInstruction,
            tools: [{ googleSearch: {} }] 
        }
    });

    return { 
        text: response.text || "عذراً، حدث خطأ في محرك الدمج.", 
        providerUsed: "AmrAi Vision Core (Gemini 2.0)",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks 
    };
};

// Fix: Add missing generateTutorResponse export
export const generateTutorResponse = async (history: ChatMessage[], context: { problemContext?: string, learningProfile?: LearningProfile }): Promise<{ text: string }> => {
    const ai = getGemini();
    const systemInstruction = `أنت المعلم الكوني الصبور والخبير. مهمتك شرح خطوات الحل وتبسيط المفاهيم الصعبة للطالب.
    سياق المسألة التي تم حلها مؤخراً: ${context.problemContext || 'لا يوجد سياق حالي'}
    ملف الطالب التعليمي الحالي: ${context.learningProfile?.level_summary || 'تلقائي'}
    قواعد الشرح:
    1. ابدأ بأسلوب مشجع.
    2. لا تعطِ الإجابة النهائية مباشرة إذا لم يطلبها الطالب، بل اشرح "لماذا" و "كيف".
    3. استخدم لغة عربية بسيطة وسهلة الفهم.
    4. إذا كان هناك مصطلح معقد، قم بتبسيطه.`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: history.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            })),
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return { text: response.text || "عذراً، لم أستطع توليد رد حالياً." };
    } catch (error) {
        console.error("Tutor Error:", error);
        return { text: "حدث خطأ أثناء محاولة التواصل مع المعلم الكوني. يرجى المحاولة لاحقاً." };
    }
};

// Fix: Add missing updateAdaptiveProfile export
export const updateAdaptiveProfile = async (prompt: string, responseText: string, currentProfile?: LearningProfile): Promise<LearningProfile> => {
    const ai = getGemini();
    const analyzerInstruction = `قم بتحليل تفاعل الطالب وتحديث "ملف التعلم التكيفي".
    السؤال المطروح: ${prompt}
    الإجابة المقدمة من النظام: ${responseText}
    الملف الحالي (إن وجد): ${JSON.stringify(currentProfile || {})}
    
    يجب أن يتضمن التحديث:
    1. ملخص لمستوى الطالب الحالي (level_summary).
    2. نقاط القوة (strengths).
    3. نقاط الضعف التي تحتاج لتركيز (weaknesses).
    4. أسلوب التعلم المفضل (preferred_style).
    
    قم بالرد بصيغة JSON فقط.`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: analyzerInstruction,
            config: {
                responseMimeType: "application/json",
                systemInstruction: "You are an AI Education Specialist. Analyze interactions and return updated learning profiles in JSON format ONLY."
            }
        });
        
        const newProfile = JSON.parse(response.text || '{}');
        return {
            ...newProfile,
            last_analyzed_at: new Date().toISOString()
        };
    } catch (error) {
        console.error("Profile Update Error:", error);
        return currentProfile || {
            level_summary: "مستكشف مبتدئ",
            strengths: [],
            weaknesses: [],
            preferred_style: 'detailed',
            last_analyzed_at: new Date().toISOString()
        };
    }
};

export const runModelTest = async (provider: AIProvider, prompt: string): Promise<TestResult> => {
    const start = Date.now();
    let text = "";
    try {
        if (provider === AIProvider.GEMINI) {
            const r = await getGemini().models.generateContent({ model: GEMINI_MODEL, contents: prompt });
            text = r.text || "";
        } else if (provider === AIProvider.DEEPSEEK) {
            const resp = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${EXTERNAL_KEYS.DEEPSEEK}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }] })
            });
            const d = await resp.json(); text = d.choices[0].message.content;
        } else {
            // استخدام OpenRouter بدلاً من OpenAI مباشرة
            const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${EXTERNAL_KEYS.OPENROUTER}`, 
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://faheem.ai",
                    "X-Title": "Faheem AI"
                },
                body: JSON.stringify({ model: "openai/gpt-4o-mini", messages: [{ role: "user", content: prompt }] })
            });
            const d = await resp.json(); text = d.choices[0].message.content;
        }
        return { provider, text, responseTime: Date.now() - start, status: 'success', timestamp: new Date().toISOString() };
    } catch (e: any) {
        return { provider, text: e.message, responseTime: Date.now() - start, status: 'error', timestamp: new Date().toISOString() };
    }
};
