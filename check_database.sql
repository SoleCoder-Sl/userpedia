-- Quick check: What's in your database right now?
-- Run this in Supabase SQL Editor

SELECT 
  name,
  display_name,
  CASE 
    WHEN image_url IS NULL THEN '❌ NULL'
    WHEN image_url = '/MG.png' THEN '⚠️ Fallback'
    WHEN image_url LIKE '%drive.google.com%' THEN '✅ ' || RIGHT(image_url, 40)
    ELSE '✅ ' || image_url
  END as image_status,
  created_at
FROM biographies
WHERE name IN ('shah rukh khan', 'mahatma gandhi', 'sachin tendulkar')
ORDER BY created_at DESC;

-- Expected result: image_url should have Google Drive URLs, not NULL

