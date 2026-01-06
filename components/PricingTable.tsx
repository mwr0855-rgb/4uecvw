
import React, { useState } from 'react';

const CheckIcon = ({ color = "text-green-400" }) => (
    <div className={`w-6 h-6 rounded-full bg-white/5 flex items-center justify-center ${color} flex-shrink-0 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
    </div>
);

const PlanCard: React.FC<{ 
    title: string; 
    price: string; 
    period: string; 
    features: string[]; 
    variant: 'free' | 'standard' | 'pro';
    savings?: string;
    buttonText: string;
    onButtonClick?: () => void;
}> = ({ title, price, period, features, variant, savings, buttonText, onButtonClick }) => {
    
    const styles = {
        free: {
            border: 'border-gray-700',
            bg: 'bg-gray-900/40',
            glow: 'group-hover:shadow-[0_0_30px_rgba(100,116,139,0.2)]',
            titleColor: 'text-gray-300',
            btn: 'bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-800'
        },
        standard: {
            border: 'border-sky-500/50',
            bg: 'bg-sky-900/20',
            glow: 'group-hover:shadow-[0_0_50px_rgba(14,165,233,0.4)]',
            titleColor: 'text-sky-400',
            btn: 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-900/50'
        },
        pro: {
            border: 'border-purple-500/50',
            bg: 'bg-purple-900/20',
            glow: 'group-hover:shadow-[0_0_60px_rgba(168,85,247,0.5)]',
            titleColor: 'text-yellow-400',
            btn: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-amber-900/50 border border-yellow-300/50'
        }
    };

    const style = styles[variant];

    return (
        <div className={`relative group transition-all duration-500 transform hover:-translate-y-4 perspective-1000 h-full`}>
            <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-b ${variant === 'pro' ? 'from-purple-500/20' : variant === 'standard' ? 'from-sky-500/10' : 'from-gray-500/5'} to-transparent blur-xl`}></div>

            <div className={`relative h-full glass-card p-1 rounded-3xl overflow-hidden ${style.border} ${style.bg} ${style.glow} backdrop-blur-xl flex flex-col`}>
                <div className="p-8 text-center relative overflow-hidden z-10">
                    <h3 className={`text-2xl font-black tracking-widest mb-2 ${style.titleColor} uppercase`}>{title}</h3>
                    {savings && (
                        <div className="inline-block bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-black px-3 py-1 rounded-full mb-4 animate-pulse">
                            {savings}
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center my-4 min-h-[80px]">
                        <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">{price}</span>
                        <span className="text-sm font-bold text-gray-400 mt-1">{period}</span>
                    </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent relative z-10"></div>

                <div className="p-8 flex-grow relative z-10">
                    <ul className="space-y-4">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-300 group/item">
                                <CheckIcon color={variant === 'pro' ? 'text-yellow-400' : variant === 'standard' ? 'text-sky-400' : 'text-gray-500'} />
                                <span className="group-hover/item:text-white transition-colors leading-relaxed" dangerouslySetInnerHTML={{__html: feature}} />
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-8 pt-0 mt-auto relative z-10">
                    <button 
                        onClick={onButtonClick}
                        className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300 btn-3d ${style.btn}`}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PricingTable: React.FC = () => {
    const [isMonthly, setIsMonthly] = useState<boolean>(true);

    const scrollToPayment = () => {
        const paymentSection = document.getElementById('payment-section');
        if(paymentSection) paymentSection.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="mt-32 mb-16 relative perspective-[2000px]">
            <div className="text-center mb-20 relative animate-enter">
                <h2 className="text-5xl md:text-6xl font-black text-white mb-6 holographic-text">خطط القوة التعليمية</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-bold">استثمر في ذكائك مع باقات فهيم AI المتطورة</p>
                
                <div className="mt-12 flex justify-center">
                    <div className="bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-inner flex w-80 relative cursor-pointer select-none">
                        <div 
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-gradient-to-b from-sky-500 to-sky-700 shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-all duration-300 ease-out z-0`}
                            style={{ right: '6px', transform: isMonthly ? 'translateX(0)' : 'translateX(-104%)' }}
                        ></div>
                        <div className={`flex-1 relative z-10 py-3 text-center font-bold text-sm transition-colors duration-300 ${isMonthly ? 'text-white' : 'text-gray-400'}`} onClick={() => setIsMonthly(true)}>شهرياً</div>
                        <div className={`flex-1 relative z-10 py-3 text-center font-bold text-sm transition-colors duration-300 ${!isMonthly ? 'text-white' : 'text-gray-400'}`} onClick={() => setIsMonthly(false)}>سنوياً</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
                <PlanCard 
                    title="المجانية" 
                    price="مجانية" 
                    period="(تجريبية)"
                    variant="free"
                    buttonText="طلب كود تجريبي"
                    onButtonClick={() => window.open(`https://wa.me/201090991769?text=${encodeURIComponent("أرغب في كود تجريبي")}`, '_blank')}
                    features={[
                        "⚡ حل <span class='text-white font-bold'>5 أسئلة</span> يومياً (4/5 محاولات)",
                        "📷 تحليل صورتين مجاناً كل شهر",
                        "💬 شات تعليمي محدود (لا رسائل إضافية)",
                        "🧠 نموذج Amr AI الأساسي"
                    ]} 
                />
                
                <PlanCard 
                    title="القياسية" 
                    price={isMonthly ? '100 ج.م' : '1000 ج.م'} 
                    period={isMonthly ? 'شهرياً' : 'سنوياً'}
                    variant="standard"
                    buttonText="ابدأ الآن"
                    onButtonClick={scrollToPayment}
                    features={[
                        "🚀 تحليل <span class='text-sky-400 font-bold'>غير محدود</span> للصور والمسائل",
                        "💬 <span class='text-white font-bold'>250 رسالة</span> شات شهرياً",
                        "⚡ نموذج Amr AI المتقدم (Flash)",
                        "📧 دعم فني عبر البريد"
                    ]} 
                    savings={!isMonthly ? 'وفر 200 جنيه' : undefined}
                />
                
                <PlanCard 
                    title="المميزة (Pro)" 
                    price={isMonthly ? '250 ج.م' : '2500 ج.م'} 
                    period={isMonthly ? 'شهرياً' : 'سنوياً'}
                    variant="pro"
                    buttonText="امتلك القوة الكاملة"
                    onButtonClick={scrollToPayment}
                    features={[
                        "💎 <span class='text-yellow-400 font-bold'>كل مميزات القياسية</span>",
                        "🎓 شات تعليمي <span class='text-yellow-400 font-bold'>غير محدود</span>",
                        "🔥 أقوى نموذج Amr AI (Pro Vision)",
                        "📞 دعم فني واتساب مباشر"
                    ]} 
                    savings={!isMonthly ? 'وفر 500 جنيه' : undefined}
                />
            </div>
        </div>
    );
};

export default PricingTable;
