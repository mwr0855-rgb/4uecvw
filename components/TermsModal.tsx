
import React, { useState } from 'react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 perspective-[2000px]">
            {/* Dark Void Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500"
                onClick={onClose}
            ></div>

            {/* 3D Holographic Tablet Container */}
            <div className="relative w-full max-w-2xl transform transition-all duration-500 animate-enter rotate-x-2 hover:rotate-x-0">
                
                {/* Glowing Border Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500 rounded-2xl opacity-75 blur-lg animate-pulse"></div>
                
                <div className="relative glass-card bg-gray-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                    
                    {/* Header with Amr Ai Branding */}
                    <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                        <div>
                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-wide uppercase">
                                {activeTab === 'terms' ? 'بروتوكول الاستخدام' : 'ملف الخصوصية'}
                            </h3>
                            <p className="text-[10px] text-sky-400 font-mono tracking-[0.2em] mt-1">SECURE DOCUMENT • AMR AI SYSTEMS</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all border border-white/5 hover:border-red-500/30 group"
                        >
                            <span className="group-hover:rotate-90 transition-transform duration-300">✕</span>
                        </button>
                    </div>

                    {/* 3D Tabs */}
                    <div className="flex bg-black/40 p-2 gap-2">
                        <button 
                            onClick={() => setActiveTab('terms')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${activeTab === 'terms' ? 'bg-sky-600 text-white shadow-[0_0_20px_rgba(2,132,199,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="relative z-10">شروط الخدمة</span>
                            {activeTab === 'terms' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] animate-[shine_3s_infinite]"></div>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('privacy')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${activeTab === 'privacy' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="relative z-10">الخصوصية والأمان</span>
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-950 text-gray-300 text-sm md:text-base space-y-6 leading-relaxed relative">
                        {/* Watermark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] font-black text-white/5 -rotate-45 pointer-events-none whitespace-nowrap z-0">
                            AMR AI
                        </div>

                        <div className="relative z-10 space-y-6">
                            {activeTab === 'terms' ? (
                                <>
                                    <div className="bg-sky-900/20 p-4 rounded-xl border-l-4 border-sky-500">
                                        <p className="text-white font-bold mb-1">1. حقوق الملكية الحصرية</p>
                                        <p className="text-xs opacity-80">هذه المنصة بجميع أكوادها، خوارزمياتها، وتصميماتها هي ملكية فكرية حصرية ومسجلة باسم <strong>"Amr Ai"</strong>. يُمنع منعاً باتاً النسخ أو الاقتباس.</p>
                                    </div>
                                    
                                    <div>
                                        <p className="font-bold text-white mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span> 2. ترخيص الاستخدام</p>
                                        <p>تمنحك <strong>Amr Ai</strong> رخصة محدودة لاستخدام المنصة للأغراض التعليمية والشخصية فقط. أي استخدام تجاري غير مصرح به يعرضك للمساءلة القانونية.</p>
                                    </div>

                                    <div>
                                        <p className="font-bold text-white mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span> 3. التحديثات والتطوير</p>
                                        <p>تحتفظ <strong>Amr Ai</strong> بالحق في تحديث النظام، تغيير الأسعار، أو تعديل الخوارزميات لتحسين كفاءة "المحرك الهجين" في أي وقت.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-purple-900/20 p-4 rounded-xl border-l-4 border-purple-500">
                                        <p className="text-white font-bold mb-1">1. الحماية المشفرة</p>
                                        <p className="text-xs opacity-80">تستخدم <strong>Amr Ai</strong> تقنيات تشفير متقدمة (End-to-End) لضمان أن بياناتك وصورك لا يمكن الاطلاع عليها من قبل أي طرف ثالث.</p>
                                    </div>

                                    <div>
                                        <p className="font-bold text-white mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> 2. سياسة البيانات</p>
                                        <p>نحن لا نبيع بياناتك. البيانات المستخدمة تُعالج لحظياً بواسطة محركات <strong>Amr Ai</strong> الذكية لغرض التحليل التعليمي فقط.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-400 font-mono">SYSTEM STATUS: OPERATIONAL</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Designed & Engineered by</p>
                            <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-l from-sky-400 to-white">AMR AI</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
