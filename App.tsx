
import React, { useState, useCallback, useEffect } from 'react';
import { AuthState, Plan, User, Language } from './types';
import LoginScreen from './components/LoginScreen';
import SubscriptionModal from './components/SubscriptionModal';
import MainApp from './components/MainApp';
import Header from './components/Header';
import PricingTable from './components/PricingTable';
import PaymentInfo from './components/PaymentInfo';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { activateCode, verifyUserSubscription } from './services/codeService';
import { db } from './services/dbBridge';
import Notification from './components/Notification';
import TermsModal from './components/TermsModal';

const USER_SESSION_KEY = 'faheem_v11_session';
const GUEST_ID_KEY = 'faheem_guest_id';

interface AppNotification {
    message: string;
    type: 'success' | 'error';
}

const App: React.FC = () => {
    const [authState, setAuthState] = useState<AuthState>(AuthState.UNAUTHENTICATED);
    const [user, setUser] = useState<User | null>(null);
    const [isFrozen, setIsFrozen] = useState<boolean>(false);
    const [frozenReason, setFrozenReason] = useState<User['status']>('frozen');
    const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
    const [notification, setNotification] = useState<AppNotification | null>(null);
    const [showTerms, setShowTerms] = useState(false);
    const [lang] = useState<Language>('ar');

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
        setAuthState(AuthState.UNAUTHENTICATED);
        setIsFrozen(false);
        localStorage.removeItem(USER_SESSION_KEY);
    }, []);

    // نظام الحماية اللحظي: فحص السحاب كل 15 ثانية
    useEffect(() => {
        let isMounted = true;
        const runSecurityCheck = async () => {
            if (user && authState === AuthState.SUBSCRIBED && user.plan !== Plan.ADMIN) {
                try {
                    const verification = await verifyUserSubscription(user);
                    if (isMounted) {
                        if (!verification.isValid) {
                            setFrozenReason(verification.reason || 'expired');
                            setIsFrozen(true);
                            
                            // تحديث الحالة محلياً إذا تغيرت في السحاب
                            const updatedUser = { ...user, status: verification.reason || 'expired' };
                            setUser(updatedUser);
                            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));

                            if (verification.reason === 'revoked') {
                                showNotification('🚫 تم حظر الوصول من الإدارة.', 'error');
                                setTimeout(() => { if (isMounted) handleLogout(); }, 4000);
                            } else if (verification.reason === 'expired') {
                                showNotification('⚠️ انتهت صلاحية اشتراكك. يرجى التجديد.', 'error');
                            }
                        } else if (isFrozen) {
                            setIsFrozen(false);
                            const updatedUser = { ...user, status: 'active' as const };
                            setUser(updatedUser);
                            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
                        }
                    }
                } catch (e) {
                    console.error("Security Check Failed:", e);
                }
            }
        };
        runSecurityCheck();
        const interval = setInterval(runSecurityCheck, 15000); 
        return () => { isMounted = false; clearInterval(interval); };
    }, [user, authState, handleLogout, isFrozen, showNotification]);

    useEffect(() => {
        try {
            const sessionData = localStorage.getItem(USER_SESSION_KEY);
            if (sessionData) {
                const savedUser: User = JSON.parse(sessionData);
                setUser(savedUser);
                setAuthState(AuthState.SUBSCRIBED);
            }
        } catch (error) { localStorage.removeItem(USER_SESSION_KEY); }
    }, []);

    const handleLogin = useCallback(() => {
        let guestId = localStorage.getItem(GUEST_ID_KEY);
        if (!guestId) {
            guestId = `g-${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(GUEST_ID_KEY, guestId);
        }
        
        const guestEmail = `${guestId}@faheem.ai`;
        setUser({ name: "مستكشف", email: guestEmail, plan: Plan.FREE, status: 'active' });
        setAuthState(AuthState.AUTHENTICATED);
    }, []);

    const handleAdminLogin = useCallback((username: string, password: string) => {
        const adminUser: User = { name: "Master Admin", email: "admin@faheem.ai", plan: Plan.ADMIN, status: 'active' };
        setUser(adminUser);
        setAuthState(AuthState.SUBSCRIBED);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(adminUser));
        setShowAdminLogin(false);
        showNotification('✅ تم الدخول إلى مركز القيادة السري.', 'success');
    }, [showNotification]);

    const handleSubscription = useCallback(async (code: string) => {
        if (!user) return;
        const result = await activateCode(code, user.email);
        if (result.success && result.userUpdate) {
            const updatedUser: User = { ...user, ...result.userUpdate };
            setUser(updatedUser);
            setAuthState(AuthState.SUBSCRIBED);
            setIsFrozen(false);
            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
            showNotification(result.message, 'success');
        } else {
            showNotification(result.message, 'error');
        }
    }, [user, showNotification]);

    const renderContent = () => {
        switch (authState) {
            case AuthState.UNAUTHENTICATED:
                return showAdminLogin ? 
                    <AdminLogin onAdminLogin={handleAdminLogin} onBackToUserLogin={() => setShowAdminLogin(false)} /> : 
                    <LoginScreen onLogin={handleLogin} onSwitchToAdminLogin={() => setShowAdminLogin(true)} />;
            case AuthState.AUTHENTICATED:
                return <SubscriptionModal onSubmit={handleSubscription} />;
            case AuthState.SUBSCRIBED:
                if (user?.plan === Plan.ADMIN) return <AdminPanel showNotification={showNotification} />;
                return user ? <MainApp user={user} lang={lang} isFrozen={isFrozen} /> : null;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 relative text-white">
            {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
            <div className="max-w-6xl mx-auto">
                <Header user={user} onLogout={handleLogout} lang={lang} isFrozen={isFrozen} />
                <main>
                    {renderContent()}
                    {(!user || user.plan !== Plan.ADMIN) && (
                         <>
                            <div className="mt-24"><PricingTable /></div>
                            <div className="mt-24"><PaymentInfo /></div>
                        </>
                    )}
                </main>
                <Footer onOpenTerms={() => setShowTerms(true)} />
            </div>
            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        </div>
    );
};

export default App;
