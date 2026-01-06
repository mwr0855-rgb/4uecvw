
import React, { useState, useRef, useEffect } from 'react';
import { Plan, ChatMessage, USAGE_LIMITS, User, Language } from '../types';

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    return (
        <div className="space-y-2">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} className="h-2"></div>;
                if (trimmed.startsWith('### ')) return <h3 key={idx} className="text-sky-400 font-black text-lg mt-4">{trimmed.substring(4)}</h3>;
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) return <li key={idx} className="mr-4 text-gray-300 list-disc">{trimmed.substring(2)}</li>;
                return <p key={idx} className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }} />;
            })}
        </div>
    );
};

interface ChatTutorProps {
    history: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    error: string;
    plan: Plan;
    messagesSent: number;
    user: User;
    lang: Language;
}

const ChatTutor: React.FC<ChatTutorProps> = ({ history, onSendMessage, isLoading, error, plan, messagesSent, user }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && !isLoading) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };
    
    const getLimit = () => {
        if (plan === Plan.PRO || plan === Plan.ADMIN) return Infinity;
        if (plan === Plan.FREE) return 0;
        
        // Fix: Use the available 'chatMessages' property from USAGE_LIMITS[Plan.STANDARD]
        // The properties 'chatMessagesYearly' and 'chatMessagesMonthly' do not exist in the defined type.
        return (USAGE_LIMITS as any)[Plan.STANDARD].chatMessages;
    };

    const limit = getLimit();
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - messagesSent);
    const isLimitReached = limit !== Infinity && remaining <= 0;

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-enter">
            <div className="flex-grow flex flex-col bg-gray-950/80 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl relative">
                
                <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                            🧠
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg">المعلم الكوني</h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${plan === Plan.FREE ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    {plan === Plan.FREE ? 'Feature Locked' : 'Active Protocol'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-right">
                            <p className="text-[8px] text-gray-500 font-bold uppercase">الرسائل المتبقية</p>
                            <p className={`text-sm font-black font-mono ${limit !== Infinity && remaining < 20 ? 'text-red-500' : 'text-sky-400'}`}>
                                {limit === Infinity ? '∞ UNLIMITED' : remaining}
                            </p>
                        </div>
                    </div>
                </div>

                <div 
                    ref={chatContainerRef} 
                    className="h-[500px] overflow-y-auto p-8 space-y-8 custom-scrollbar bg-black/20"
                >
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="text-7xl mb-6">{plan === Plan.FREE ? '🔒' : '🚀'}</div>
                            <h4 className="text-xl font-black text-white mb-2">
                                {plan === Plan.FREE ? 'المعلم الكوني متاح للمشتركين فقط' : 'جلسة المعلم الكوني جاهزة'}
                            </h4>
                            <p className="text-sm max-w-xs leading-relaxed">
                                {plan === Plan.FREE 
                                    ? 'يرجى الاشتراك في الخطة القياسية أو برو لتفعيل ميزة الشرح التفاعلي.'
                                    : 'أنا هنا لأشرح لك كل تفاصيل الحل. اسألني عن أي خطوة.'}
                            </p>
                        </div>
                    ) : (
                        history.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-lg ${msg.role === 'user' ? 'bg-sky-600' : 'bg-white/5 border border-white/10'}`}>
                                    {msg.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className={`max-w-[85%] p-5 rounded-3xl ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-gray-900 border border-white/5 rounded-tl-none shadow-xl'}`}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                                    ) : (
                                        <MarkdownRenderer text={msg.content} />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 bg-white/5 border-t border-white/5 backdrop-blur-xl">
                    {plan === Plan.FREE ? (
                        <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-2xl text-center">
                            <p className="text-sky-400 font-bold text-sm">💡 اشترك الآن لتفعيل "المعلم الكوني" والحصول على شرح تفصيلي.</p>
                        </div>
                    ) : isLimitReached ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                            <p className="text-red-400 font-bold text-sm">⚠️ استنفدت حصة الرسائل. يرجى الترقية لخطة PRO للوصول غير المحدود.</p>
                        </div>
                    ) : (
                        <div className="relative group">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isLoading}
                                placeholder="اطلب من المعلم شرح أي جزء..."
                                className="w-full p-5 pr-6 pl-20 bg-black/60 border border-white/10 rounded-2xl text-white outline-none focus:border-sky-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !newMessage.trim()}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-sky-600 text-white px-6 py-2.5 rounded-xl font-black text-sm transition-all btn-3d disabled:opacity-50"
                            >
                                {isLoading ? 'جاري...' : 'إرسال 🚀'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ChatTutor;
