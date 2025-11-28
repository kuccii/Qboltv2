-- ============================================
-- UPDATE COUNTRY_SUPPLIERS CATEGORY CONSTRAINT
-- Run this BEFORE running COMPREHENSIVE-SEED-DATA.sql
-- ============================================

-- Drop the old constraint
ALTER TABLE IF EXISTS public.country_suppliers 
DROP CONSTRAINT IF EXISTS country_suppliers_category_check;

-- Add the new constraint with all categories
ALTER TABLE public.country_suppliers 
ADD CONSTRAINT country_suppliers_category_check 
CHECK (category IN (
  'laboratory', 'storage', 'food', 'transport', 'government', 'construction', 'agriculture',
  'testing', 'certification', 'bank', 'fintech', 'insurance', 'finance',
  'customs', 'clearing', 'broker', 'documentation', 'logistics', 'warehousing'
));

