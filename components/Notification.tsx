
import React, { useEffect, useState } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => setVisible(true), 10);
        const dismissTimer = setTimeout(() => {
            handleDismiss();
        }, 5000); 
        
        return () => {
            clearTimeout(showTimer);
            clearTimeout(dismissTimer);
        };
    }, [message, type]);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(onDismiss, 300);
    };

    const baseClasses = "fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-md min-h-[70px] flex flex-col justify-center rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-white z-[99999] transition-all duration-500 ease-in-out border backdrop-blur-3xl pointer-events-auto";
    
    const typeStyles = {
        success: "bg-gradient-to-r from-emerald-600/95 to-teal-700/95 border-emerald-400/50 shadow-emerald-900/40",
        error: "bg-gradient-to-r from-red-600/95 to-rose-700/95 border-red-400/50 shadow-red-900/40"
    };
    
    const visibilityClasses = visible 
        ? "opacity-100 translate-y-0 scale-100" 
        : "opacity-0 -translate-y-20 scale-95 pointer-events-none";

    const progressStyle = `
        @keyframes notif-progress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
        }
        .animate-notif-progress {
            animation: notif-progress 5s linear forwards;
        }
    `;

    return (
        <div className={`${baseClasses} ${typeStyles[type]} ${visibilityClasses}`}>
            <style dangerouslySetInnerHTML={{ __html: progressStyle }} />
            <div className="p-4 md:p-5 flex items-center justify-between gap-4 overflow-hidden">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/20">
                    {type === 'success' ? '✓' : '⚠️'}
                </div>
                
                {/* Message */}
                <div className="flex-grow text-right overflow-hidden">
                    <p className="text-sm md:text-base font-bold leading-relaxed break-words whitespace-normal py-1">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button 
                    onClick={handleDismiss} 
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-lg"
                    aria-label="إغلاق"
                >
                    ✕
                </button>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1.5 bg-white/30 rounded-full animate-notif-progress origin-left w-full"></div>
        </div>
    );
};

export default Notification;
