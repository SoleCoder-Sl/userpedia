-- ========================================
-- Fix Wrong Images in Supabase
-- ========================================

-- STEP 1: Check all entries to find wrong images
-- Run this first to see what's in your database
SELECT 
  name,
  display_name,
  SUBSTRING(image_url, 1, 60) as image_url_preview,
  created_at
FROM biographies
ORDER BY created_at DESC;

-- ========================================

-- STEP 2: Find specific person with wrong image
-- Replace 'virat kohli' with the person you're checking
SELECT 
  name,
  display_name,
  image_url,
  created_at
FROM biographies
WHERE name = 'virat kohli';

-- ========================================

-- STEP 3: Fix Options (Choose ONE)

-- Option A: Delete specific person (will regenerate everything)
-- Replace 'virat kohli' with the person name
DELETE FROM biographies WHERE name = 'virat kohli';

-- ========================================

-- Option B: Clear only image_url (keeps bio, regenerates image)
-- Replace 'virat kohli' with the person name
UPDATE biographies 
SET image_url = NULL 
WHERE name = 'virat kohli';

-- ========================================

-- Option C: Clear ALL image URLs (nuclear option - use if many are wrong)
-- This will force all images to regenerate on next search
UPDATE biographies 
SET image_url = NULL;

-- ========================================

-- Option D: Delete ALL entries (complete reset)
-- Only use this if you want to start fresh
-- WARNING: This deletes all cached biographies and images!
-- DELETE FROM biographies;

-- ========================================

-- STEP 4: Verify the fix
-- Check that the entry is deleted or image_url is NULL
SELECT 
  name,
  display_name,
  image_url,
  created_at
FROM biographies
WHERE name = 'virat kohli';

-- Expected: 
-- - No rows (if you deleted)
-- - image_url = NULL (if you cleared)

-- ========================================

-- BONUS: Find duplicate entries (same person, different cases)
SELECT 
  LOWER(name) as normalized_name,
  COUNT(*) as count,
  STRING_AGG(name, ', ') as variations
FROM biographies
GROUP BY LOWER(name)
HAVING COUNT(*) > 1;

-- If you find duplicates, you can delete the older ones:
-- DELETE FROM biographies a
-- USING biographies b
-- WHERE a.created_at < b.created_at
--   AND LOWER(TRIM(a.name)) = LOWER(TRIM(b.name));

-- ========================================

-- AFTER RUNNING THESE:
-- 1. Go back to your website
-- 2. Search for the person again (e.g., "Virat Kohli")
-- 3. Wait 30-60 seconds for new image to generate
-- 4. Verify correct image appears
-- 5. Check this SQL again to verify image_url is now saved

-- ========================================

