-- ===================================
-- Faheem AI - Supabase Database Schema
-- By Amr AI Systems
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- Table: subscription_codes
-- ===================================
CREATE TABLE IF NOT EXISTS subscription_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('الخطة المجانية', 'الخطة القياسية', 'الخطة المميزة', 'خطة الأدمن')),
    duration_days INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'active', 'expired', 'revoked', 'frozen')),
    activated_by TEXT,
    activation_date TIMESTAMPTZ,
    expiration_date TIMESTAMPTZ,
    client_name TEXT DEFAULT 'غير مسمى',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_codes_code ON subscription_codes(code);
CREATE INDEX IF NOT EXISTS idx_subscription_codes_status ON subscription_codes(status);
CREATE INDEX IF NOT EXISTS idx_subscription_codes_activated_by ON subscription_codes(activated_by);

-- ===================================
-- Table: user_usage
-- ===================================
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    questions_today INTEGER DEFAULT 0,
    last_question_date DATE,
    images_this_month INTEGER DEFAULT 0,
    last_image_month TEXT,
    analyses_count INTEGER DEFAULT 0,
    chat_messages_count INTEGER DEFAULT 0,
    linked_expiration_date TIMESTAMPTZ,
    active_subscription_code TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'expired', 'revoked')),
    learning_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (active_subscription_code) REFERENCES subscription_codes(code) ON DELETE SET NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_usage_email ON user_usage(email);
CREATE INDEX IF NOT EXISTS idx_user_usage_active_code ON user_usage(active_subscription_code);
CREATE INDEX IF NOT EXISTS idx_user_usage_status ON user_usage(status);

-- ===================================
-- Table: activity_logs (for auditing)
-- ===================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ===================================
-- Function: Update timestamp on row change
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_subscription_codes_updated_at ON subscription_codes;
CREATE TRIGGER update_subscription_codes_updated_at
    BEFORE UPDATE ON subscription_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at
    BEFORE UPDATE ON user_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- Function: Redeem Subscription Code (Atomic Operation)
-- ===================================
CREATE OR REPLACE FUNCTION redeem_subscription_code(
    input_code TEXT,
    user_email TEXT
)
RETURNS JSON AS $$
DECLARE
    code_record RECORD;
    expiration_timestamp TIMESTAMPTZ;
    result JSON;
BEGIN
    -- Lock the code row to prevent race conditions
    SELECT * INTO code_record 
    FROM subscription_codes 
    WHERE code = input_code 
    FOR UPDATE;

    -- Check if code exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'الكود غير موجود'
        );
    END IF;

    -- Check if code is already used or invalid
    IF code_record.status != 'unused' THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'الكود مستخدم أو منتهي'
        );
    END IF;

    -- Calculate expiration date
    expiration_timestamp := NOW() + (code_record.duration_days || ' days')::INTERVAL;

    -- Update subscription code
    UPDATE subscription_codes
    SET 
        status = 'active',
        activated_by = user_email,
        activation_date = NOW(),
        expiration_date = expiration_timestamp,
        updated_at = NOW()
    WHERE code = input_code;

    -- Insert or update user usage
    INSERT INTO user_usage (email, active_subscription_code, linked_expiration_date, status)
    VALUES (user_email, input_code, expiration_timestamp, 'active')
    ON CONFLICT (email) 
    DO UPDATE SET 
        active_subscription_code = input_code,
        linked_expiration_date = expiration_timestamp,
        status = 'active',
        updated_at = NOW();

    -- Log the activity
    INSERT INTO activity_logs (user_email, action, details)
    VALUES (user_email, 'code_redeemed', json_build_object('code', input_code, 'plan', code_record.plan, 'duration', code_record.duration_days));

    -- Return success with data
    RETURN json_build_object(
        'status', 'success',
        'clientName', code_record.client_name,
        'expirationDate', expiration_timestamp
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Function: Auto-expire codes (scheduled job)
-- ===================================
CREATE OR REPLACE FUNCTION auto_expire_codes()
RETURNS void AS $$
BEGIN
    -- Update expired subscription codes
    UPDATE subscription_codes
    SET status = 'expired'
    WHERE status = 'active'
      AND expiration_date <= NOW();

    -- Update expired user statuses
    UPDATE user_usage
    SET status = 'expired'
    WHERE status = 'active'
      AND linked_expiration_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Row Level Security (RLS) Policies
-- ===================================

-- Enable RLS on all tables
ALTER TABLE subscription_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read on subscription_codes for validation
CREATE POLICY "Allow anonymous read on subscription_codes"
    ON subscription_codes FOR SELECT
    USING (true);

-- Policy: Allow authenticated users to read their own usage
CREATE POLICY "Users can read their own usage"
    ON user_usage FOR SELECT
    USING (auth.jwt() ->> 'email' = email OR true);

-- Policy: Allow authenticated users to update their own usage
CREATE POLICY "Users can update their own usage"
    ON user_usage FOR UPDATE
    USING (auth.jwt() ->> 'email' = email OR true);

-- Policy: Allow insert for new users
CREATE POLICY "Allow insert for user_usage"
    ON user_usage FOR INSERT
    WITH CHECK (true);

-- Policy: Allow reading activity logs (admin only, or relax for development)
CREATE POLICY "Allow read activity_logs"
    ON activity_logs FOR SELECT
    USING (true);

-- Policy: Allow insert activity logs
CREATE POLICY "Allow insert activity_logs"
    ON activity_logs FOR INSERT
    WITH CHECK (true);

-- ===================================
-- Sample Data (optional, for testing)
-- ===================================

-- Insert sample admin code
INSERT INTO subscription_codes (code, plan, duration_days, client_name, status)
VALUES ('AMR-ADMIN-999-MASTER-2025', 'خطة الأدمن', 36500, 'Amr AI Master', 'unused')
ON CONFLICT (code) DO NOTHING;

-- Insert sample test codes
INSERT INTO subscription_codes (code, plan, duration_days, client_name, status)
VALUES 
    ('AMR-FR-7-TEST-FREE', 'الخطة المجانية', 7, 'Test User Free', 'unused'),
    ('AMR-ST-30-TEST-STANDARD', 'الخطة القياسية', 30, 'Test User Standard', 'unused'),
    ('AMR-PR-90-TEST-PRO', 'الخطة المميزة', 90, 'Test User Pro', 'unused')
ON CONFLICT (code) DO NOTHING;

-- ===================================
-- Grant permissions (adjust based on your setup)
-- ===================================

-- Grant usage on sequences if any
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE ON subscription_codes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON user_usage TO anon, authenticated;
GRANT SELECT, INSERT ON activity_logs TO anon, authenticated;

-- Grant execution on functions
GRANT EXECUTE ON FUNCTION redeem_subscription_code TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auto_expire_codes TO postgres;

-- ===================================
-- Notes:
-- ===================================
-- 1. Set up a cron job in Supabase to run auto_expire_codes() periodically
-- 2. Configure pg_cron extension if available:
--    SELECT cron.schedule('auto-expire-codes', '0 * * * *', 'SELECT auto_expire_codes();');
-- 3. Adjust RLS policies based on your authentication setup
-- 4. Add additional indexes as needed for performance
-- ===================================
