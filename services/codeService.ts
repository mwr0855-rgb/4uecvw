
import { Plan, SubscriptionCode, User } from '../types';
import { db } from './dbBridge';

/**
 * Amr AI Security Lab - Quantum Code Generator V7.0
 * توليد أكواد تعتمد على تشفير عشوائي عالي الكثافة (Non-Guessable)
 */
export const generateNewCode = async (plan: Plan.FREE | Plan.STANDARD | Plan.PRO, durationDays: number, clientName?: string): Promise<SubscriptionCode> => {
    const days = Math.max(1, Math.floor(Number(durationDays) || 30));
    
    // إنشاء كود معقد جداً: UUID + بصمة تشفيرية
    const secureId = crypto.randomUUID().split('-')[0].toUpperCase();
    const entropy = Array.from(crypto.getRandomValues(new Uint8Array(6)))
        .map(b => b.toString(36))
        .join('')
        .toUpperCase();
        
    const planTag = plan === Plan.PRO ? 'PR' : plan === Plan.FREE ? 'FR' : 'ST';
    const finalCode = `AMR-${planTag}-${days}-${secureId}-${entropy}`;

    const newCodeObj: SubscriptionCode = {
        code: finalCode,
        plan: plan,
        durationDays: days,
        status: 'unused',
        activatedBy: null,
        activationDate: null,
        expirationDate: null,
        clientName: clientName || "غير مسمى",
        createdAt: new Date().toISOString()
    };

    const result = await db.saveCode(newCodeObj);
    if (!result.success) throw new Error(`⚠️ فشل التوثيق السحابي: ${result.error}`);
    return newCodeObj;
};

export const activateCode = async (inputCode: string, userEmail: string): Promise<{ success: boolean; userUpdate?: Partial<User>; message: string }> => {
    const cleanCode = inputCode.trim().toUpperCase();
    const status = await db.getCodeStatus(cleanCode);
    
    if (status === 'revoked') return { success: false, message: 'هذا الرمز محظور نهائياً من قبل الإدارة.' };
    if (status === 'expired') return { success: false, message: 'هذا الرمز منتهي الصلاحية.' };
    if (status === 'frozen') return { success: false, message: 'هذا الرمز مجمد حالياً.' };
    if (status !== 'unused') return { success: false, message: 'هذا الرمز مستخدم من قبل حساب آخر.' };

    const redemptionCheck = await db.redeemCode(cleanCode, userEmail);
    if (redemptionCheck.status === 'error') return { success: false, message: redemptionCheck.message || 'خطأ في عملية التوثيق السحابي.' };

    const parts = cleanCode.split('-');
    const plan = parts[1] === 'PR' ? Plan.PRO : parts[1] === 'FR' ? Plan.FREE : Plan.STANDARD;
    const durationDays = parseInt(parts[2], 10);
    
    const startDate = new Date();
    // استخدام تاريخ الانتهاء المرتجع من قاعدة البيانات لضمان الدقة المطلقة
    const expirationDate = redemptionCheck.expirationDate || new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    return { 
        success: true, 
        userUpdate: {
            plan,
            startDate: startDate.toISOString(),
            expirationDate: expirationDate,
            subscriptionDurationDays: durationDays,
            activeSubscriptionCode: cleanCode,
            status: 'active',
            name: redemptionCheck.clientName || "مستكشف"
        },
        message: `مرحباً ${redemptionCheck.clientName || ''}! تم تفعيل بروتوكول Amr AI بنجاح.`
    };
};

export const verifyUserSubscription = async (user: User): Promise<{ isValid: boolean; reason?: User['status'] }> => {
    if (user.plan === Plan.ADMIN) return { isValid: true };
    if (!user.activeSubscriptionCode) return { isValid: false, reason: 'revoked' };

    // 1. فحص الحالة في قاعدة البيانات (للحظر اليدوي أو التجميد الإداري) - هذا هو المصدر الحقيقي
    const cloudStatus = await db.getCodeStatus(user.activeSubscriptionCode);
    
    // 2. الفحص الزمني اللحظي القاتل (Auto-Expire)
    if (user.expirationDate && new Date() >= new Date(user.expirationDate)) {
        if (cloudStatus !== 'expired') {
            await db.updateUserStatus(user.activeSubscriptionCode, 'expired');
        }
        return { isValid: false, reason: 'expired' };
    }

    if (cloudStatus === 'active' || cloudStatus === 'unused') return { isValid: true };

    return { isValid: false, reason: cloudStatus as User['status'] };
};
