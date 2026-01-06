
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://mpfrtiftdltxjdnzfbcb.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZnJ0aWZ0ZGx0eGpkbnpmYmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODg3MTksImV4cCI6MjA4MDg2NDcxOX0.TShMMV42tU9RretHwgDViW-LqNLcSUK2NPhwnuWjWsI";

export const isSupabaseConfigured = () => {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        }
    }
);
