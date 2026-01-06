
import React, { useState } from 'react';

interface AdminLoginProps {
    onAdminLogin: (username: string, password: string) => void;
    onBackToUserLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminLogin, onBackToUserLogin }) => {
    const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // التحقق المبدئي
        if (username === 'Fahim_AlphaUserAi' && password === 'Fh!m@2025#Xr9LAi.Amr') {
            setStep('2fa'); // الانتقال لخطوة الكود
        } else {
            setError('بيانات الدخول غير صحيحة.');
        }
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // الأكواد السرية: الأساسي والاحتياطي
        const validOTPs = ['987789', '55555'];

        if (validOTPs.includes(otp)) {
            onAdminLogin(username, password);
        } else {
            setError('رمز التحقق (OTP) غير صحيح.');
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center flex flex-col items-center max-w-md w-full mx-auto animate-fadeIn text-gray-800">
            <div className="mb-6">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-2 text-sky-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">بوابة المشرفين الآمنة</h2>
                <p className="text-gray-500 text-sm">نظام حماية مزدوج (2FA Enabled)</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 w-full border border-red-100">{error}</div>}

            {step === 'credentials' ? (
                <form onSubmit={handleCredentialsSubmit} className="w-full">
                    <div className="mb-4 text-right">
                        <label className="text-xs font-bold text-gray-600">اسم المستخدم</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-gray-50 text-gray-900 font-bold"
                            placeholder="Username"
                        />
                    </div>
                    <div className="mb-6 text-right">
                        <label className="text-xs font-bold text-gray-600">كلمة المرور</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-gray-50 text-gray-900 font-bold"
                            placeholder="Password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-sky-600 text-white p-3 rounded-lg font-bold hover:bg-sky-700 transition-colors shadow-lg"
                        disabled={!username || !password}
                    >
                        متابعة
                    </button>
                </form>
            ) : (
                <form onSubmit={handleOtpSubmit} className="w-full">
                     <p className="text-gray-600 mb-6 text-sm">
                        تم إرسال رمز تحقق مؤقت إلى جهازك المصرح به.
                        <br/><span className="text-xs text-sky-600 font-bold">(أدخل الرمز السري للمتابعة)</span>
                    </p>
                    <div className="mb-6">
                        <input
                            type="password"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="● ● ● ● ●"
                            className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 font-bold"
                            maxLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg"
                        disabled={otp.length < 5}
                    >
                        تحقق ودخول
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setStep('credentials')}
                        className="mt-4 text-sm text-gray-400 hover:text-gray-600"
                    >
                        العودة للخلف
                    </button>
                </form>
            )}

            {step === 'credentials' && (
                <button
                    onClick={onBackToUserLogin}
                    className="mt-6 text-sm text-gray-500 hover:text-sky-600 hover:underline"
                >
                    العودة لتسجيل دخول المستخدم
                </button>
            )}
        </div>
    );
};

export default AdminLogin;
