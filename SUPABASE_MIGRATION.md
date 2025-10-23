# Supabase Migration - Add Image URL Column

If you already created the `biographies` table before, you need to add the `image_url` column.

## Run this SQL in Supabase SQL Editor:

```sql
-- Add image_url column to existing biographies table
ALTER TABLE biographies 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

That's it! Now your table will support portrait images from the webhook.

## Verify the Column Was Added:

```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'biographies';
```

You should see `image_url` in the list!

