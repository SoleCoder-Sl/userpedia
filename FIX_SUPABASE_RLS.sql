-- ============================================
-- Fix Supabase RLS (Row Level Security) Issue
-- ============================================
-- Problem: Can SELECT but cannot UPDATE image_url
-- Solution: Disable RLS or add proper policies

-- Step 1: Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'biographies';
-- If rowsecurity = true, RLS is blocking your updates

-- ============================================
-- SOLUTION 1: Disable RLS (Recommended for this use case)
-- ============================================
-- This allows full access to the table from your API
ALTER TABLE biographies DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SOLUTION 2: Keep RLS enabled but allow all operations
-- ============================================
-- If you want to keep RLS enabled for security, use this instead:

-- First, drop any existing policies (if any)
-- DROP POLICY IF EXISTS "Enable read access for all users" ON biographies;
-- DROP POLICY IF EXISTS "Enable insert access for all users" ON biographies;
-- DROP POLICY IF EXISTS "Enable update access for all users" ON biographies;

-- Then create new policies that allow everything:
-- CREATE POLICY "Enable read access for all users" ON biographies FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON biographies FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON biographies FOR UPDATE USING (true);

-- ============================================
-- Verify the fix
-- ============================================
-- After running the fix, test with this:
SELECT name, display_name, image_url 
FROM biographies 
WHERE name = 'elon musk';

-- Try to update manually:
UPDATE biographies 
SET image_url = 'https://test-url.com' 
WHERE name = 'elon musk';

-- Check if it worked:
SELECT name, image_url 
FROM biographies 
WHERE name = 'elon musk';
-- Should show: image_url = 'https://test-url.com'

-- Reset it back to null for testing:
UPDATE biographies 
SET image_url = NULL 
WHERE name = 'elon musk';

