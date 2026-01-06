
import React from 'react';
import { User, Language, Plan } from '../types';
import { translations } from '../translations';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    lang: Language;
    isFrozen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, lang, isFrozen = false }) => {
    const t = translations[lang];

    return (
        <header className="mb-12 perspective-[1000px] relative z-50">
            {user && (
                <div className="flex justify-between items-center glass-card p-4 mb-8 mt-12 md:mt-0 animate-enter backdrop-blur-xl border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4">
                         <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.5)]">
                                <span className="text-xl">{user.plan === Plan.ADMIN ? '🛠️' : '👨‍🎓'}</span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${isFrozen ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
                         </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200">{t.welcome} {user.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${isFrozen ? 'bg-red-900/40 text-red-400 border-red-500/20' : 'bg-sky-900/40 text-sky-400 border-sky-500/20'}`}>
                                    {isFrozen ? 'اشتراك مجمد' : user.plan}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout} 
                        className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all duration-300 btn-3d"
                    >
                        {t.logout}
                    </button>
                </div>
            )}
            <div className="text-center relative py-8 group mt-12 md:mt-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-24 bg-sky-500/5 blur-[60px] rounded-full group-hover:bg-sky-500/10 transition-colors duration-700"></div>
                 <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-2xl flex items-center justify-center gap-4 mb-2 float-slow">
                    <span className="holographic-text">فَهِيم</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-tr from-sky-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">AI</span>
                </h1>
                <div className="flex items-center justify-center gap-3 mt-4 opacity-80">
                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-sky-500"></div>
                    <div className="flex flex-col items-center">
                        <p className="text-lg text-sky-100 font-bold tracking-widest uppercase text-xs md:text-sm drop-shadow-md">
                            Powered by <span className="text-sky-400">Amr Ai</span> Super-Engine
                        </p>
                    </div>
                    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-sky-500"></div>
                </div>
            </div>
        </header>
    );
};

export default Header;
