
import React, { useState } from 'react';

const LoadingState: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
            <div className="relative w-48 h-48 mb-10">
                <div className="absolute inset-0 border-[6px] border-sky-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-transparent border-t-sky-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl animate-pulse">🧠</div>
                </div>
            </div>
            <h3 className="text-2xl font-black holographic-text">جاري تفعيل طبقات التفكير...</h3>
            <p className="text-sky-500/50 text-xs mt-4 font-mono uppercase tracking-[0.3em]">Quantum Engine Syncing</p>
        </div>
    );
};

const ResultsDisplay: React.FC<{ result: any, isLoading: boolean }> = ({ result, isLoading }) => {
    const [copied, setCopied] = useState(false);
    const contentText = result?.text || '';
    const sources = Array.isArray(result?.sources) ? result.sources : [];
    const provider = result?.providerUsed || 'Amr AI Core';

    if (isLoading) return <LoadingState />;
    if (!contentText) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(contentText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const parseMarkdown = (text: string) => {
        return text
            .replace(/# (.*)/g, '<h1 class="text-3xl font-black text-white my-8 border-b border-white/5 pb-4">$1</h1>')
            .replace(/## (.*)/g, '<h2 class="text-2xl font-bold text-sky-400 my-6">$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-300 font-black">$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="relative p-6 md:p-12 animate-enter max-w-5xl mx-auto glass-card bg-gray-950/40 border-sky-500/10">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-black/60 p-6 rounded-[32px] border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center text-2xl shadow-lg">⚡</div>
                    <div>
                        <span className="block text-[10px] font-black text-sky-400 uppercase tracking-widest">Powered by {provider}</span>
                        <h4 className="text-white font-black text-lg">التحليل التعليمي النهائي</h4>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleCopy}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all border border-white/10"
                    >
                        {copied ? '✅ تم النسخ' : '📋 نسخ الإجابة'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div 
                className="prose prose-invert max-w-none text-gray-200 leading-[2] text-lg text-right overflow-x-hidden"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(contentText) }} 
            />

            {/* Grounding Sources */}
            {sources.length > 0 && (
                <div className="mt-16 p-8 bg-sky-950/20 border border-sky-500/20 rounded-[40px]">
                    <h5 className="text-sky-400 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span>
                        تم التحقق عبر مصادر الويب (Google Search)
                    </h5>
                    <div className="flex flex-wrap gap-3">
                        {sources.map((chunk: any, idx: number) => (
                            chunk.web && (
                                <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-black/40 px-5 py-2.5 rounded-xl hover:bg-sky-500/20 text-gray-400 hover:text-sky-300 border border-white/5 transition-all font-bold flex items-center gap-2">
                                    <span className="opacity-50">🌐</span>
                                    {chunk.web.title || "مرجع خارجي"}
                                </a>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;
