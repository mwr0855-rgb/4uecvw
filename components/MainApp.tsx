
import React, { useState, useCallback, useEffect } from 'react';
import { User, Usage, Plan, Language, ChatMessage, USAGE_LIMITS } from '../types';
import { solveWithMightyMind, generateTutorResponse, updateAdaptiveProfile } from '../services/aiService';
import ImageUploader from './ImageUploader';
import ResultsDisplay from './ResultsDisplay';
import UsageTracker from './UsageTracker';
import ChatTutor from './ChatTutor';
import { db } from '../services/dbBridge';

const MainApp: React.FC<{ user: User, lang: Language, isFrozen?: boolean }> = ({ user, lang, isFrozen = false }) => {
    const [imageData, setImageData] = useState<any>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isTutorLoading, setIsTutorLoading] = useState(false);
    const [usage, setUsage] = useState<Usage>({ questionsToday: 0, lastQuestionDate: '', imagesThisMonth: 0, lastImageMonth: '', analysesCount: 0, chatMessagesCount: 0, linkedExpirationDate: null });

    const refreshUsage = useCallback(async () => {
        if (user?.email) {
            const currentUsage = await db.getUserUsage(user.email);
            setUsage(currentUsage);
        }
    }, [user]);

    useEffect(() => { refreshUsage(); }, [refreshUsage]);

    const handleAnalysis = useCallback(async () => {
        if (isFrozen) return;
        const limits = (USAGE_LIMITS as any)[user.plan];
        
        if (limits.questions !== Infinity && usage.questionsToday >= limits.questions) {
            setError(lang === 'ar' ? "⚠️ استنفدت حصة اليوم. يرجى الانتظار للغد أو الترقية." : "Daily limit reached.");
            return;
        }

        setIsLoading(true); setError(''); setResult(null); setChatHistory([]);
        try {
            // إرسال السؤال لنظام Amr AI الهجين
            const apiResult = await solveWithMightyMind(
                prompt, 
                imageData?.base64 || null, 
                imageData?.mimeType || null, 
                { plan: user.plan, learningProfile: usage.learningProfile }
            );
            
            setResult(apiResult);
            await db.incrementUsage(user.email, 'question');
            if (imageData) await db.incrementUsage(user.email, 'image');
            
            // تحديث ملف التعلم بشكل غير متزامن
            updateAdaptiveProfile(prompt, apiResult.text, usage.learningProfile).then(newProfile => {
                db.updateLearningProfile(user.email, newProfile);
            });

            await refreshUsage();
        } catch (err: any) { 
            setError(`فشل النظام: ${err.message}`); 
        } finally { 
            setIsLoading(false); 
        }
    }, [imageData, prompt, user, lang, isFrozen, usage, refreshUsage]);

    const handleTutorMessage = async (msg: string) => {
        if (isFrozen || isTutorLoading) return;
        
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: msg }];
        setChatHistory(newHistory); setIsTutorLoading(true);
        try {
            const response = await generateTutorResponse(newHistory, { 
                problemContext: result?.text,
                learningProfile: usage.learningProfile 
            });
            setChatHistory([...newHistory, { role: 'model', content: response.text }]);
            // Fix: incrementUsage only accepts 2 arguments (email and type)
            await db.incrementUsage(user.email, 'chat');
            await refreshUsage();
        } catch (e) {
            setError("عذراً، المعلم الكوني غير متاح حالياً.");
        } finally { setIsTutorLoading(false); }
    };

    return (
        <div className="space-y-12 animate-enter pb-24">
            {/* مؤشر الحالة الذكية */}
            <div className="relative">
                <UsageTracker usage={usage} user={user} />
                {usage.learningProfile && (
                    <div className="absolute -top-4 right-4 bg-sky-500/20 border border-sky-500/50 text-sky-400 px-4 py-1.5 rounded-full text-[9px] font-black animate-pulse z-20 backdrop-blur-xl">
                        نظام التعلم التكيفي نشط: {usage.learningProfile.level_summary}
                    </div>
                )}
            </div>

            {/* منطقة الإدخال الرئيسية */}
            <section className="glass-card p-6 md:p-12 relative overflow-hidden border-sky-500/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] -z-10"></div>
                
                <h2 className="text-4xl font-black text-white holographic-text mb-2">محرك Amr AI الموحد</h2>
                <p className="text-[10px] text-sky-400 font-bold mb-10 uppercase tracking-[0.3em]">
                    Intelligence Fusion: Gemini + DeepSeek + GPT
                </p>
                
                <ImageUploader onFileSelect={setImageData} />
                
                <div className="mt-8 relative">
                    <textarea 
                        rows={3} 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        className="w-full p-8 bg-gray-950/80 border border-white/10 rounded-[32px] text-white text-right focus:border-sky-500 outline-none transition-all placeholder:text-gray-600 text-lg shadow-inner" 
                        placeholder="اكتب سؤالك هنا أو ارفع صورته..." 
                    />
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold text-center animate-shake">
                        {error}
                    </div>
                )}

                <button 
                    onClick={handleAnalysis} 
                    disabled={isLoading || (!prompt && !imageData)} 
                    className="btn-3d w-full mt-10 bg-sky-600 hover:bg-sky-500 text-white p-8 rounded-[32px] font-black text-2xl shadow-2xl flex items-center justify-center gap-6 disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                    {isLoading ? (
                        <>
                            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>جاري معالجة البيانات...</span>
                        </>
                    ) : (
                        <>
                            <span>بدء التحليل الذكي</span>
                            <span className="group-hover:translate-x-2 transition-transform">⚡</span>
                        </>
                    )}
                </button>
            </section>

            {/* عرض النتائج والدردشة */}
            {result && (
                <div className="space-y-16 animate-enter">
                    <ResultsDisplay result={result} isLoading={isLoading} />
                    <div className="glass-card p-2 bg-gradient-to-b from-sky-500/10 to-transparent rounded-[42px]">
                        <ChatTutor 
                            history={chatHistory} 
                            onSendMessage={handleTutorMessage} 
                            isLoading={isTutorLoading} 
                            error="" 
                            plan={user.plan} 
                            messagesSent={usage.chatMessagesCount} 
                            user={user} 
                            lang={lang} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainApp;
