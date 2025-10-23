-- ============================================
-- Supabase Database Verification & Debugging
-- ============================================

-- 1. View all biographies and their portrait URLs
SELECT 
  name,
  display_name,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN '❌ Missing'
    WHEN image_url LIKE '%drive.google.com%' THEN '✅ Google Drive'
    WHEN image_url = '/MG.png' THEN '⚠️ Fallback'
    ELSE '✅ Custom'
  END as image_status,
  created_at
FROM biographies
ORDER BY created_at DESC;

-- 2. Find people without portrait URLs
SELECT name, display_name 
FROM biographies 
WHERE image_url IS NULL;

-- 3. Count total biographies
SELECT COUNT(*) as total_biographies FROM biographies;

-- 4. Check for duplicates (shouldn't have any due to unique constraint)
SELECT name, COUNT(*) as count 
FROM biographies 
GROUP BY name 
HAVING COUNT(*) > 1;

-- ============================================
-- Cleaning Operations (Run if needed)
-- ============================================

-- Clear specific person (they'll be regenerated on next search)
-- DELETE FROM biographies WHERE name = 'shah rukh khan';

-- Clear all portrait URLs (keeps biographies, regenerates images)
-- UPDATE biographies SET image_url = NULL;

-- Delete all data (start completely fresh)
-- DELETE FROM biographies;

-- ============================================
-- Manual Data Entry (if webhook is down)
-- ============================================

-- Update a specific person's portrait URL manually
-- UPDATE biographies 
-- SET image_url = 'https://drive.google.com/uc?export=view&id=YOUR_FILE_ID'
-- WHERE name = 'shah rukh khan';

-- ============================================
-- Schema Verification
-- ============================================

-- Check table structure (make sure image_url column exists)
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'biographies';

-- Expected columns:
-- - name (text, NO)
-- - display_name (text, YES)
-- - biography (text, YES)
-- - image_url (text, YES)  <-- MUST EXIST
-- - created_at (timestamp, YES)

