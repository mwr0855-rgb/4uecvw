
import React from 'react';

interface LoginScreenProps {
    onLogin: () => void;
    onSwitchToAdminLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToAdminLogin }) => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="glass-card p-10 md:p-16 max-w-lg w-full text-center relative overflow-hidden animate-enter border-sky-500/20 shadow-[0_0_50px_rgba(56,189,248,0.1)]">
                
                {/* Visual Accent */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-sky-500/20 to-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-white/10 shadow-inner group">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🧠</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight holographic-text">فَهِيم AI</h2>
                    <p className="text-gray-400 mb-10 text-sm md:text-base leading-relaxed">
                        مرحباً بك في الجيل القادم من التعليم الذكي. <br/> سجل دخولك لتفعيل محرك Amr AI.
                    </p>
                    
                    <button
                        onClick={onLogin}
                        className="btn-3d w-full flex items-center justify-center gap-4 bg-white text-gray-900 px-8 py-5 rounded-2xl font-black hover:bg-sky-50 transition-all duration-300 mb-8 shadow-2xl text-lg"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
                        <span>تسجيل الدخول الآمن</span>
                    </button>
                    
                    <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                        <button
                            onClick={onSwitchToAdminLogin}
                            className="text-[10px] font-mono text-gray-500 hover:text-sky-400 transition-colors uppercase tracking-[0.3em]"
                        >
                            Admin Terminal Access
                        </button>
                        
                        <div className="px-5 py-2 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">System Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
