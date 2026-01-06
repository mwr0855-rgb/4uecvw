
import React, { useState } from 'react';

interface SubscriptionModalProps {
    onSubmit: (code: string) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onSubmit }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            onSubmit(code.trim());
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="glass-card p-10 max-w-md w-full text-center animate-enter border-sky-500/20">
                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-sky-500/20">
                    <span className="text-3xl">🔑</span>
                </div>
                
                <h2 className="text-3xl font-black text-white mb-4">تفعيل الترخيص</h2>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                    تم تسجيل دخولك! يرجى إدخال رمز التفعيل الخاص بك لبدء تجربة "فهيم AI" الكاملة.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="AMR-XXXX-XXXX"
                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-center font-mono tracking-widest focus:border-sky-500 focus:outline-none text-white font-bold"
                    />
                    <button
                        type="submit"
                        className="btn-3d w-full bg-sky-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-sky-500 shadow-xl shadow-sky-900/30 disabled:opacity-50 transition-all"
                        disabled={!code.trim()}
                    >
                        تنشيط المحرك الآن
                    </button>
                </form>
                
                <p className="mt-8 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                    Secured by Amr AI Neural Link
                </p>
            </div>
        </div>
    );
};

export default SubscriptionModal;
