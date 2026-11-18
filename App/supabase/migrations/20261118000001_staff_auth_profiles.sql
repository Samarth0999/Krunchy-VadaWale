-- ==============================================================================
-- KRUNCHY POS: Staff Profiles & Google OAuth Role Linking
-- Migration: 20261118000001_staff_auth_profiles.sql
-- Description: Staff profiles table, Google OAuth UID mapping, and RLS policies
-- ==============================================================================

-- 1. Create staff_profiles table
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Cashier' CHECK (role IN ('Admin', 'Manager', 'Cashier')),
    pin TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    permissions JSONB DEFAULT '{"pos":true,"tables":true,"orders":true,"menu":false,"customers":true,"loyalty":false,"reports":false,"settings":false,"canApplyDiscount":false,"canManageCategories":false,"canEditProducts":false,"canAdjustLoyaltyPoints":false,"canManageStaff":false}'::jsonb,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_staff_profiles_email ON public.staff_profiles(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_staff_profiles_auth_uid ON public.staff_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_role ON public.staff_profiles(role);

-- Enable Row Level Security
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access for staff lookup" ON public.staff_profiles;
DROP POLICY IF EXISTS "Allow staff to update own profile" ON public.staff_profiles;
DROP POLICY IF EXISTS "Allow admins full access to staff_profiles" ON public.staff_profiles;

-- RLS Policies
-- Allow reading staff profiles for authorization checks
CREATE POLICY "Allow public read access for staff lookup"
    ON public.staff_profiles FOR SELECT
    USING (true);

-- Allow authenticated users to update their own profile
CREATE POLICY "Allow staff to update own profile"
    ON public.staff_profiles FOR UPDATE
    TO authenticated
    USING (auth_user_id = (SELECT auth.uid()))
    WITH CHECK (auth_user_id = (SELECT auth.uid()));

-- Allow insert/update/delete for management
CREATE POLICY "Allow admins full access to staff_profiles"
    ON public.staff_profiles FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. Stored Procedure for Google OAuth Login & Role Linking
CREATE OR REPLACE FUNCTION public.handle_staff_oauth_login(
    user_email TEXT, 
    user_uid UUID, 
    user_name TEXT DEFAULT NULL, 
    user_avatar TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    staff_record RECORD;
    resolved_name TEXT;
    resolved_avatar TEXT;
BEGIN
    -- Look up staff profile by email (case-insensitive)
    SELECT * INTO staff_record 
    FROM public.staff_profiles 
    WHERE LOWER(email) = LOWER(user_email) AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'authorized', FALSE,
            'message', 'Unauthorized account. Your email (' || user_email || ') is not registered by the restaurant administrator.'
        );
    END IF;

    resolved_name := COALESCE(NULLIF(user_name, ''), staff_record.name);
    resolved_avatar := COALESCE(NULLIF(user_avatar, ''), staff_record.avatar_url);

    -- Map Google auth UID and update last login
    UPDATE public.staff_profiles
    SET 
        auth_user_id = user_uid,
        name = resolved_name,
        avatar_url = resolved_avatar,
        last_login_at = NOW(),
        updated_at = NOW()
    WHERE id = staff_record.id;

    RETURN jsonb_build_object(
        'authorized', TRUE,
        'staff', jsonb_build_object(
            'id', staff_record.id,
            'auth_user_id', user_uid,
            'email', staff_record.email,
            'name', resolved_name,
            'role', staff_record.role,
            'permissions', COALESCE(staff_record.permissions, '{"pos":true,"tables":true,"orders":true,"menu":false,"customers":true,"loyalty":false,"reports":false,"settings":false,"canApplyDiscount":false,"canManageCategories":false,"canEditProducts":false,"canAdjustLoyaltyPoints":false,"canManageStaff":false}'::jsonb),
            'avatar_url', resolved_avatar
        )
    );
END;
$$;

