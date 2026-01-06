
import React from 'react';

interface FooterProps {
    onOpenTerms: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenTerms }) => {
    const year = new Date().getFullYear();
    const whatsappSupportLink = "https://wa.me/201090991769?text=" + encodeURIComponent("أحتاج إلى مساعدة في منصة فهيم AI");

    return (
        <footer className="mt-24 pb-12 relative z-10 perspective-[500px]">
            {/* Glass Container */}
            <div className="max-w-4xl mx-auto glass-card border-t border-white/5 bg-gray-900/50 backdrop-blur-xl rounded-full px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
                
                {/* Links */}
                <div className="flex items-center gap-6 text-xs font-bold tracking-wider text-gray-400">
                    <button onClick={onOpenTerms} className="hover:text-sky-400 transition-colors uppercase">سياسة الخصوصية</button>
                    <button onClick={onOpenTerms} className="hover:text-sky-400 transition-colors uppercase">شروط الاستخدام</button>
                    <a href={whatsappSupportLink} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors uppercase flex items-center gap-1">
                        الدعم الفني
                        <span className="block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    </a>
                </div>

                {/* Amr Ai Laser Signature */}
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="text-right">
                        <p className="text-[8px] text-gray-500 uppercase tracking-[0.2em] group-hover:text-sky-400 transition-colors">Sole Creator</p>
                        <p className="text-lg font-black italic text-white tracking-tighter group-hover:text-sky-300 transition-colors">
                            Amr<span className="text-sky-500">Ai</span>
                        </p>
                    </div>
                    {/* Logo Icon */}
                    <div className="w-8 h-8 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:rotate-12 transition-transform duration-500">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-6">
                <p className="text-[10px] text-gray-600 font-mono">© {year} All Rights Reserved to <strong className="text-gray-500">Amr Ai</strong>.</p>
            </div>
        </footer>
    );
};

export default Footer;
