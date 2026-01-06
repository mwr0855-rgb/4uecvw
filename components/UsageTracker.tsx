
import React, { useState, useEffect } from 'react';
import { Usage, Plan, User, USAGE_LIMITS } from '../types';

interface UsageTrackerProps {
    usage: Usage;
    user: User;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({ usage, user }) => {
    const isFree = user.plan === Plan.FREE;
    const limits = (USAGE_LIMITS as any)[user.plan] || USAGE_LIMITS[Plan.FREE];
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        const targetDate = user.expirationDate || usage.linkedExpirationDate;
        if (!targetDate) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [user.expirationDate, usage.linkedExpirationDate]);

    return (
        <div className="space-y-6 mb-10 animate-enter text-right" dir="rtl">
            {/* بطاقة الوقت المتبقي المطورة */}
            {!isFree && timeLeft && (
                <div className="glass-card p-8 border-sky-500/30 bg-gradient-to-tr from-sky-950/40 to-indigo-950/40 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] -z-10 group-hover:bg-sky-500/20 transition-all"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-sky-500/20 rounded-[24px] flex items-center justify-center text-3xl shadow-lg border border-sky-500/20 animate-float">⏳</div>
                            <div>
                                <h3 className="text-white font-black text-2xl holographic-text">الوقت المتبقي لاشتراكك</h3>
                                <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest mt-1">نظام الحماية اللحظي مفعل • التجميد التلقائي نشط</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 md:gap-6">
                            {[
                                { val: timeLeft.d, label: 'يوم' },
                                { val: timeLeft.h, label: 'ساعة' },
                                { val: timeLeft.m, label: 'دقيقة' },
                                { val: timeLeft.s, label: 'ثانية' }
                            ].map((unit, i) => (
                                <div key={i} className="text-center group/unit">
                                    <div className="w-16 md:w-20 h-16 md:h-20 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center mb-2 shadow-inner group-hover/unit:border-sky-500/50 transition-all">
                                        <span className="text-2xl md:text-3xl font-black text-white font-mono">{unit.val < 10 ? `0${unit.val}` : unit.val}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{unit.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-card p-6 border-sky-500/20 bg-sky-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">🎯</div>
                    <div>
                        <h3 className="text-white font-black text-lg">حصصك اليومية المتاحة</h3>
                        <p className="text-[10px] text-sky-400 font-black uppercase">{user.plan}</p>
                    </div>
                </div>
                {!isFree && <div className="bg-yellow-500/10 px-5 py-2.5 rounded-2xl border border-yellow-500/30 text-yellow-400 font-black text-xs animate-pulse">🚀 طاقة غير محدودة مفعلة</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-b-4 border-purple-500 bg-purple-950/10">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl">❓</span>
                        <div className="text-left text-right">
                            <p className="text-[10px] text-purple-400 font-black uppercase mb-1 tracking-widest">تحليل الأسئلة</p>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-3xl font-black text-white">{usage.questionsToday}</span>
                                <span className="text-gray-600 text-sm">/ {limits.questions === Infinity ? '∞' : limits.questions}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: limits.questions === Infinity ? '100%' : `${Math.min(100, (usage.questionsToday / limits.questions) * 100)}%` }}></div>
                    </div>
                </div>

                <div className="glass-card p-6 border-b-4 border-emerald-500 bg-emerald-950/10">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl">🖼️</span>
                        <div className="text-left text-right">
                            <p className="text-[10px] text-emerald-400 font-black uppercase mb-1 tracking-widest">تحليل الصور</p>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-3xl font-black text-white">{usage.imagesThisMonth}</span>
                                <span className="text-gray-600 text-sm">/ {limits.images === Infinity ? '∞' : limits.images}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: limits.images === Infinity ? '100%' : `${Math.min(100, (usage.imagesThisMonth / limits.images) * 100)}%` }}></div>
                    </div>
                </div>

                <div className="glass-card p-6 border-b-4 border-orange-500 bg-orange-950/10">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl">🧩</span>
                        <div className="text-left text-right">
                            <p className="text-[10px] text-orange-400 font-black uppercase mb-1 tracking-widest">رسائل الشرح</p>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-3xl font-black text-white">{usage.chatMessagesCount}</span>
                                <span className="text-gray-600 text-sm">/ ∞</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageTracker;
