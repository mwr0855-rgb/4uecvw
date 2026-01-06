
import { supabase, isSupabaseConfigured } from './supabaseConfig';
import { SubscriptionCode, DashboardStats, Plan, Usage, LearningProfile } from '../types';

export const db = {
    getUserUsage: async (email: string): Promise<Usage> => {
        if (!isSupabaseConfigured()) throw new Error("Cloud Offline");
        const { data } = await supabase.from('user_usage').select('*').eq('email', email).maybeSingle();
        const today = new Date().toISOString().split('T')[0];
        
        return {
            questionsToday: data?.last_question_date === today ? (data.questions_today || 0) : 0,
            lastQuestionDate: data?.last_question_date || today,
            imagesThisMonth: data?.images_this_month || 0,
            lastImageMonth: data?.last_image_month || '',
            analysesCount: data?.analyses_count || 0,
            chatMessagesCount: data?.chat_messages_count || 0,
            linkedExpirationDate: data?.linked_expiration_date || null,
            learningProfile: data?.learning_profile || null
        };
    },

    incrementUsage: async (email: string, type: 'question' | 'image' | 'chat'): Promise<void> => {
        const { data: ex } = await supabase.from('user_usage').select('*').eq('email', email).maybeSingle();
        const today = new Date().toISOString().split('T')[0];
        let up: any = ex ? { ...ex } : { email };

        if (up.last_question_date !== today) { up.questions_today = 0; up.last_question_date = today; }
        if (type === 'question') { up.questions_today++; up.analyses_count++; }
        else if (type === 'image') up.images_this_month++;
        else if (type === 'chat') up.chat_messages_count++;

        if (ex) await supabase.from('user_usage').update(up).eq('email', email);
        else await supabase.from('user_usage').insert([up]);
    },

    getUsers: async (): Promise<any[]> => {
        // جلب جميع المستخدمين من جدول الاستهلاك مرتبين حسب الأحدث
        const { data, error } = await supabase
            .from('user_usage')
            .select('*')
            .order('last_question_date', { ascending: false });
            
        if (error) {
            console.error("Supabase Error fetching users:", error);
            return [];
        }
        return data || [];
    },

    getCodes: async (): Promise<SubscriptionCode[]> => {
        const { data } = await supabase.from('subscription_codes').select('*').order('created_at', { ascending: false });
        return (data || []).map(r => ({
            code: r.code, plan: r.plan as Plan, durationDays: r.duration_days, status: r.status,
            clientName: r.client_name, createdAt: r.created_at, expirationDate: r.expiration_date
        }));
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        const { data: c } = await supabase.from('subscription_codes').select('status, plan');
        const { data: u } = await supabase.from('user_usage').select('analyses_count');
        return {
            totalCodes: c?.length || 0,
            activeUsers: u?.length || 0,
            revenue: (c || []).filter(x => x.status === 'active').length * 150,
            revokedCount: (c || []).filter(x => x.status === 'revoked').length,
            expiredCount: (c || []).filter(x => x.status === 'expired').length,
            frozenCount: (c || []).filter(x => x.status === 'frozen').length,
            systemHealth: 'Operational',
            totalAnalyses: (u || []).reduce((a, b) => a + (b.analyses_count || 0), 0),
            totalImages: 0, totalChats: 0
        };
    },

    updateUserStatus: async (id: string, status: string): Promise<void> => {
        const isEmail = id.includes('@');
        if (isEmail) {
            const { data } = await supabase.from('user_usage').select('active_subscription_code').eq('email', id).single();
            await supabase.from('user_usage').update({ status }).eq('email', id);
            if (data?.active_subscription_code) await supabase.from('subscription_codes').update({ status }).eq('code', data.active_subscription_code);
        } else {
            const { data } = await supabase.from('subscription_codes').select('activated_by').eq('code', id).single();
            await supabase.from('subscription_codes').update({ status }).eq('code', id);
            if (data?.activated_by) await supabase.from('user_usage').update({ status }).eq('email', data.activated_by);
        }
    },

    saveCode: async (code: SubscriptionCode) => await supabase.from('subscription_codes').insert([{
        code: code.code, plan: code.plan, duration_days: code.durationDays, client_name: code.clientName, status: 'unused'
    }]),

    getCodeStatus: async (code: string) => {
        const { data } = await supabase.from('subscription_codes').select('status').eq('code', code).maybeSingle();
        return data?.status || 'revoked';
    },

    redeemCode: async (code: string, email: string) => {
        const { data, error } = await supabase.rpc('redeem_subscription_code', { input_code: code, user_email: email });
        if (error) return { status: 'error', message: error.message };
        return { status: 'success', clientName: data.clientName, expirationDate: data.expirationDate };
    },

    resetUserUsage: async (email: string) => await supabase.from('user_usage').update({ questions_today: 0, images_this_month: 0, chat_messages_count: 0 }).eq('email', email),
    deleteUser: async (email: string) => await supabase.from('user_usage').delete().eq('email', email),
    updateLearningProfile: async (email: string, p: LearningProfile) => await supabase.from('user_usage').update({ learning_profile: p }).eq('email', email)
};
