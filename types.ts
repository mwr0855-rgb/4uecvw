
export enum AuthState {
    UNAUTHENTICATED,
    AUTHENTICATED,
    SUBSCRIBED
}

export enum Plan {
    FREE = "الخطة المجانية",
    STANDARD = "الخطة القياسية",
    PRO = "الخطة المميزة",
    ADMIN = "خطة الأدمن"
}

export enum AIProvider {
    AUTO = "نظام AmrAi الموحد",
    GEMINI = "AmrAi Vision Core (Gemini 3)",
    OPENAI = "AmrAi Tutor Core (GPT-4o-mini)",
    DEEPSEEK = "AmrAi Reasoning Core (DeepSeek)"
}

export type EducationLevel = 'primary' | 'middle' | 'high' | 'university' | 'auto';
export type Subject = 'math' | 'physics' | 'chemistry' | 'biology' | 'arabic' | 'english' | 'social' | 'tech' | 'auto';

export type Language = 'ar' | 'en';

export interface User {
    name: string;
    email: string;
    plan: Plan;
    startDate?: string;
    expirationDate?: string | null;
    subscriptionDurationDays?: number;
    activeSubscriptionCode?: string;
    status: 'active' | 'frozen' | 'expired' | 'revoked';
    lastLogin?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface LearningProfile {
    level_summary: string;
    strengths: string[];
    weaknesses: string[];
    preferred_style: 'detailed' | 'concise' | 'visual' | 'step-by-step';
    last_analyzed_at: string;
}

export interface Usage {
    questionsToday: number;
    lastQuestionDate: string;
    imagesThisMonth: number;
    lastImageMonth: string;
    analysesCount: number;
    chatMessagesCount: number;
    linkedExpirationDate: string | null;
    attemptsPerQuestion?: Record<string, number>;
    learningProfile?: LearningProfile;
}

export interface SubscriptionCode {
    code: string;
    plan: Plan;
    durationDays: number;
    status: 'unused' | 'active' | 'expired' | 'revoked' | 'frozen';
    activatedBy?: string | null;
    activationDate?: string | null;
    expirationDate?: string | null;
    clientName?: string | null;
    createdAt: string;
}

export interface DashboardStats {
    totalCodes: number;
    activeUsers: number;
    revenue: number;
    revokedCount: number;
    expiredCount: number;
    frozenCount: number;
    systemHealth: string;
    totalAnalyses: number;
    totalImages: number;
    totalChats: number;
}

export interface TestResult {
    provider: AIProvider;
    text: string;
    responseTime: number;
    status: 'success' | 'error';
    timestamp: string;
}

export const USAGE_LIMITS = {
    [Plan.FREE]: { questions: 5, images: 2, chatMessages: 0 },
    [Plan.STANDARD]: { questions: Infinity, images: Infinity, chatMessages: 250 },
    [Plan.PRO]: { questions: Infinity, images: Infinity, chatMessages: Infinity },
    [Plan.ADMIN]: { questions: Infinity, images: Infinity, chatMessages: Infinity }
};
