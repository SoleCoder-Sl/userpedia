-- Run this in your Supabase SQL Editor to fix the schema error

-- Add the image_url column
ALTER TABLE biographies 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'biographies';

