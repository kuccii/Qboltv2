-- ============================================
-- TEMPORARY FIX - Disable RLS for Testing
-- WARNING: This disables security temporarily!
-- Run this in Supabase SQL Editor
-- ============================================

-- Option 1: Disable RLS completely (for testing only!)
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- This will allow all operations on user_profiles
-- Use this ONLY for testing, then re-enable RLS
-- ============================================

-- To re-enable later (after testing):
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;



