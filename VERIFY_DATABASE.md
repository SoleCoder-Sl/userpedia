# Verify & Fix Supabase Database

## Step 1: Check Your Data

Go to your **Supabase Dashboard** → **SQL Editor** and run this query to see what's saved:

```sql
SELECT 
  name,
  display_name,
  image_url,
  created_at
FROM biographies
ORDER BY created_at DESC;
```

### What You Should See:

| name | display_name | image_url | created_at |
|------|--------------|-----------|------------|
| shah rukh khan | Shah Rukh Khan | https://drive.google.com/uc?export=view&id=... | 2024-... |
| mahatma gandhi | Mahatma Gandhi | null or URL | 2024-... |

## Step 2: Check for Issues

### Problem: `image_url` is NULL

If you see `null` in the `image_url` column, it means the portrait wasn't saved. This could be because:
1. The webhook didn't return a valid URL
2. The row didn't exist when we tried to update it (timing issue)
3. The name formats didn't match

### Problem: Wrong Images Showing

If different people show the same image, there might be duplicate or incorrect entries.

## Step 3: Clear Bad Data (Optional)

If you want to start fresh and regenerate everything, run:

```sql
-- Option 1: Delete specific person
DELETE FROM biographies 
WHERE name = 'shah rukh khan';

-- Option 2: Clear image URLs only (keeps biographies)
UPDATE biographies 
SET image_url = NULL;

-- Option 3: Delete ALL data (start completely fresh)
DELETE FROM biographies;
```

⚠️ **Warning**: After deleting, the next search will regenerate the data and call the webhook again.

## Step 4: Test with Enhanced Logging

1. Clear your browser cache or hard refresh (Ctrl+Shift+R)
2. Search for "Shah Rukh Khan"
3. Watch the terminal logs - you should now see:

```
🔍 Checking cache for: "shah rukh khan"
📊 Database query result: { data: { image_url: null }, error: null }
❌ No cached portrait for: Shah Rukh Khan (image_url: null)
🎨 Generating portrait for: Shah Rukh Khan
✅ Portrait generated for Shah Rukh Khan: https://drive.google.com/uc?export=view&id=...
💾 Attempting to save portrait URL for: "shah rukh khan" -> https://...
✅ Portrait URL saved for: Shah Rukh Khan (1 row(s) updated)
```

## Step 5: Verify Caching Works

1. Search for the same person again (e.g., "Shah Rukh Khan")
2. This time you should see:

```
🔍 Checking cache for: "shah rukh khan"
📊 Database query result: { data: { image_url: 'https://...' }, error: null }
✅ Portrait found in cache for: Shah Rukh Khan -> https://drive.google.com/uc?...
```

3. The image should load INSTANTLY (no webhook call!)

## Common Issues & Solutions

### Issue: "⚠️ No rows updated for: [name]. Row might not exist yet."

**Cause**: The biography API hasn't created the row before the portrait API tries to update it.

**Solution**: This is a race condition. The biography is created asynchronously. Try searching for the person again - the second time it should work.

### Issue: Image shows MG.png for everyone

**Cause**: `image_url` is null or invalid in the database.

**Solution**: 
1. Check the webhook is returning valid URLs (see terminal logs)
2. Delete the row and search again to regenerate
3. Verify the Google Drive links are public

### Issue: Different image every time I search

**Cause**: Portrait isn't being cached, webhook generates new image each time.

**Solution**: Check terminal logs to see if the UPDATE query is actually updating rows:
- If you see "✅ Portrait URL saved (1 row(s) updated)" - it's working!
- If you see "⚠️ No rows updated" - the row doesn't exist yet, try again

## Quick Fix: Force Regenerate Specific Person

```sql
-- Clear specific person's data
DELETE FROM biographies WHERE name = 'shah rukh khan';

-- Then search for them again - fresh data will be generated
```

---

## After Making Changes

Search for any person and check:
1. ✅ The correct image loads
2. ✅ The same person shows the same image each time (cached)
3. ✅ Different people show different images
4. ✅ Terminal shows "Portrait found in cache" on second search

**Your database is working correctly!** 🎉

