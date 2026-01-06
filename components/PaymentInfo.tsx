
import React from 'react';

const PaymentInfo: React.FC = () => {
    const vodafoneNumber = "01090991769";
    const instapayLink = "https://ipn.eg/S/amraicompany/instapay/6QavFT";
    const whatsappLink = `https://wa.me/20${vodafoneNumber}?text=${encodeURIComponent("أرغب في الاشتراك في خطة فهيم AI. لقد قمت بالتحويل وأرفقت إيصال الدفع.")}`;

    return (
        <section id="payment-section" className="relative mt-24 mb-16 animate-enter delay-200">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black skew-y-3 -z-20 transform origin-top-left scale-110"></div>
            
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 holographic-text">كيفية الاشتراك والدفع</h2>
                    <p className="text-gray-400 text-lg">اتبع الخطوات البسيطة التالية لتفعيل حسابك فوراً</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    
                    {/* STEP 1: CHOOSE PAYMENT METHOD */}
                    <div className="relative">
                        <div className="absolute -left-6 -top-6 w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-sky-600/30 z-10 rotate-12 border border-white/20">
                            1
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-8 pl-12 flex items-center">اختر طريقة الدفع</h3>
                        
                        <div className="space-y-6">
                            {/* Vodafone Cash Card */}
                            <div className="group relative perspective-1000">
                                <div className="glass-card bg-gradient-to-r from-gray-900 to-red-900/20 border-r-4 border-r-red-600 p-6 rounded-2xl hover:translate-x-2 transition-transform duration-300">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-xl font-black text-white flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                                                فودافون كاش
                                            </h4>
                                            <p className="text-red-400 font-mono text-2xl font-bold mt-2 tracking-wider select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(vodafoneNumber)} title="اضغط للنسخ">{vodafoneNumber}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(vodafoneNumber)}
                                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-3 rounded-xl transition-all"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* InstaPay Card */}
                            <div className="group relative perspective-1000">
                                <div className="glass-card bg-gradient-to-r from-gray-900 to-purple-900/20 border-r-4 border-r-purple-600 p-6 rounded-2xl hover:translate-x-2 transition-transform duration-300">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div>
                                            <h4 className="text-xl font-black text-white flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></span>
                                                إنستا باي (InstaPay)
                                            </h4>
                                            <p className="text-purple-300 font-mono text-sm mt-1">اضغط على الرابط للدفع</p>
                                            <p className="text-purple-400 font-mono text-lg font-bold mt-1 tracking-wide break-all">amraicompany@instapay</p>
                                        </div>
                                        <a 
                                            href={instapayLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-purple-900/50 hover:bg-purple-500 transition-all text-center whitespace-nowrap"
                                        >
                                            ادفع الآن ↗
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: SEND RECEIPT */}
                    <div className="relative mt-12 lg:mt-0">
                        <div className="absolute -left-6 -top-6 w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-green-600/30 z-10 rotate-12 border border-white/20">
                            2
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-8 pl-12 flex items-center">أرسل الإيصال للتفعيل</h3>
                        
                        <div className="glass-card bg-gray-900/50 p-8 rounded-3xl border border-gray-700 relative overflow-hidden group hover:border-green-500/50 transition-colors duration-500">
                            {/* Scanline Effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-[scan_3s_linear_infinite] opacity-50"></div>
                            
                            <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                                بعد إتمام عملية الدفع، يرجى إرسال <strong className="text-white">لقطة شاشة (سكرين شوت)</strong> من إيصال التحويل على واتساب لتستلم كود التفعيل الخاص بك فوراً.
                            </p>

                            <a 
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full group relative"
                            >
                                <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 group-hover:opacity-40 transition duration-500 rounded-2xl"></div>
                                <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 rounded-2xl flex items-center justify-center gap-4 font-bold text-xl shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                    إرسال الإيصال عبر واتساب
                                </div>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default PaymentInfo;
