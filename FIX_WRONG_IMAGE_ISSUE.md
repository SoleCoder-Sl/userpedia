# 🐛 Fix: Wrong Image Displayed for Person

## The Problem

**Symptom**: Searching for "Virat Kohli" shows the correct biography but displays Narendra Modi's image (or another person's image).

**Root Causes**:
1. ❌ State not resetting when navigating between people
2. ❌ Wrong `image_url` stored in Supabase for that person
3. ❌ Portrait API returning cached image from wrong person

---

## ✅ Fix Applied

### 1. State Reset on Person Change

**Updated**: `app/person/[name]/page.tsx`

Now when you navigate from one person to another:
```typescript
useEffect(() => {
  // Reset state immediately when person changes
  setImageUrl('/MG.png');      // Reset to default
  setBiography('');             // Clear old bio
  setIsLoading(true);
  setIsImageLoading(true);
  
  // Then fetch new data...
}, [personName]);
```

**What this fixes**: Prevents showing old person's data while new person is loading.

---

## 🔍 Debugging Steps

### Step 1: Check What's in Your Supabase Database

1. Go to **Supabase Dashboard** → **Table Editor** → `biographies`
2. Find the entry for "Virat Kohli" (or whoever showed wrong image)
3. Check the `image_url` column

**Example**:
```
name: virat kohli
display_name: Virat Kohli
image_url: https://drive.google.com/uc?export=view&id=XXXXX  ← Is this correct?
```

**If `image_url` is from another person**:
- This is your problem! The database has wrong data.

### Step 2: Run This SQL to Check All Entries

```sql
SELECT 
  name,
  display_name,
  image_url,
  created_at
FROM biographies
ORDER BY created_at DESC
LIMIT 20;
```

**Look for**:
- Same `image_url` for different people
- `image_url` = null for some entries
- Name mismatch (e.g., `name = "virat kohli"` but `display_name = "Narendra Modi"`)

---

## 🔧 Fix Wrong Data in Supabase

### If Virat Kohli has wrong image URL:

**Option 1: Delete the entry (will regenerate on next search)**

```sql
DELETE FROM biographies WHERE name = 'virat kohli';
```

Then search for "Virat Kohli" again - it will generate fresh data.

### Option 2: Clear only the image_url (keeps bio, regenerates image)

```sql
UPDATE biographies 
SET image_url = NULL 
WHERE name = 'virat kohli';
```

Then search for "Virat Kohli" again - it will generate new image.

### Option 3: Fix all corrupted entries at once

```sql
-- Find entries with potentially wrong images
SELECT name, display_name, image_url
FROM biographies
WHERE image_url IS NOT NULL
ORDER BY created_at DESC;

-- Clear all image URLs (will regenerate on next search)
UPDATE biographies SET image_url = NULL;
```

---

## 🧪 Testing the Fix

### Test 1: Navigate Between People

1. **Open your site** (localhost:3000)
2. **Search for "Narendra Modi"**
   - ✅ Biography loads
   - ✅ Image loads
3. **Search for "Virat Kohli"**
   - ✅ Old data clears immediately
   - ✅ Shows loading state
   - ✅ Correct bio appears
   - ✅ **Correct image appears** (not Narendra Modi's!)

### Test 2: Check Browser Console

Open **DevTools** → **Console**, search for someone:

**Expected logs**:
```
🖼️ Setting portrait for "Virat Kohli": /api/image-proxy?url=https://drive...
```

**NOT**:
```
🖼️ Setting portrait for "Virat Kohli": /api/image-proxy?url=... (Narendra Modi's ID)
```

### Test 3: Verify in Supabase

After searching for "Virat Kohli":
1. Go to Supabase → `biographies` table
2. Find "virat kohli" entry
3. Check `image_url` matches a Virat Kohli portrait ID

---

## 🚨 Common Scenarios

### Scenario A: Image URL is Null in Database

**Logs show**:
```
🔍 Checking cache for: "virat kohli"
📊 Database query result: { data: { image_url: null }, error: null }
❌ No cached portrait for: Virat Kohli
🎨 Generating portrait for: Virat Kohli
```

**Status**: ✅ **NORMAL** - Will generate new image

**Wait 30-60s** for webhook to generate image.

---

### Scenario B: Wrong Image URL in Database

**Logs show**:
```
🔍 Checking cache for: "virat kohli"
📊 Database query result: { 
  data: { image_url: 'https://...id=WRONG_ID' }, 
  error: null 
}
✅ Portrait found in cache for: Virat Kohli -> https://...WRONG_ID
```

**Status**: ❌ **BUG** - Database has wrong image for this person

**Fix**: Delete that entry:
```sql
DELETE FROM biographies WHERE name = 'virat kohli';
```

Then search again.

---

### Scenario C: Duplicate Webhook Calls

**Logs show**:
```
🎨 Generating portrait for: Virat Kohli
🎨 Generating portrait for: Virat Kohli  ← DUPLICATE!
✅ Portrait generated for Virat Kohli: https://...id=IMAGE_1
✅ Portrait generated for Virat Kohli: https://...id=IMAGE_2  ← Different!
```

**Status**: ⚠️ **FIXED IN CODE** - But old dev server might still have issue

**Fix**: 
1. **Restart dev server**: `Ctrl+C` then `npm run dev`
2. **Clear browser cache**: Hard refresh (`Ctrl+Shift+R`)
3. **Test again**

---

## 📊 Expected Behavior After Fix

### First Time Searching a Person:

1. **Type "Virat Kohli"** → Select from suggestions
2. **Page loads**:
   - Shows default MG.png (placeholder)
   - Shows "Loading..." for bio
3. **After 10-20s**:
   - Biography appears (generated by OpenAI)
4. **After 30-60s**:
   - Portrait appears (generated by webhook)
5. **In Supabase**:
   - New row created
   - `name = "virat kohli"`
   - `display_name = "Virat Kohli"`
   - `biography = "<p>Virat Kohli is..."`
   - `image_url = "https://drive.google.com/uc?..."`

### Second Time Searching Same Person:

1. **Type "Virat Kohli"** → Select
2. **Page loads instantly (<1s)**:
   - Biography from cache
   - Portrait from cache
3. **In logs**:
   ```
   ✅ Biography found in database for: Virat Kohli
   ✅ Portrait found in cache for: Virat Kohli
   ```

---

## 🛠️ Advanced Debugging

### If issue persists, check these:

#### 1. Clear Next.js Cache
```bash
# Stop dev server (Ctrl+C)
rm -rf .next
npm run dev
```

#### 2. Check for Name Normalization Issues

In Supabase SQL Editor:
```sql
-- Check if there are multiple entries for same person (different casing)
SELECT name, display_name, COUNT(*)
FROM biographies
GROUP BY name, display_name
HAVING COUNT(*) > 1;
```

**If you see duplicates**:
```sql
-- Keep the latest one, delete old ones
DELETE FROM biographies a
USING biographies b
WHERE a.created_at < b.created_at
  AND LOWER(TRIM(a.name)) = LOWER(TRIM(b.name));
```

#### 3. Verify Webhook is Generating Correct Images

Test webhook manually:
```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Virat Kohli"}'
```

**Expected**: Returns Google Drive URL for Virat Kohli's image

**If it returns wrong image**: Your webhook has a bug (check n8n/Make workflow)

---

## 📋 Deployment Checklist

Before deploying to Netlify:

- [ ] Code changes committed (`git add .` / `git commit` / `git push`)
- [ ] Supabase data cleaned (no wrong image URLs)
- [ ] Local testing passed (navigate between people, correct images)
- [ ] Netlify env vars set (all 4 variables)
- [ ] Supabase RLS disabled
- [ ] Build succeeds (`npm run build`)

---

## 🎯 Summary

**Fixes Applied**:
1. ✅ State resets when navigating between people
2. ✅ Better logging to track which image is being set
3. ✅ Duplicate API calls prevented (abort controllers)

**You Need to Do**:
1. ⏳ Check Supabase database for wrong image URLs
2. ⏳ Delete/fix corrupted entries
3. ⏳ Restart dev server
4. ⏳ Test with fresh searches

**Expected Result**:
- ✅ Each person shows their OWN image
- ✅ No mixing of images between people
- ✅ Cached correctly in Supabase
- ✅ Fast load on second search

---

**Quick Test Now**:
1. Restart dev server: `npm run dev`
2. Search for "Virat Kohli"
3. Check browser console for: `🖼️ Setting portrait for "Virat Kohli":`
4. Verify image is correct (not Narendra Modi's)

If still wrong, run the SQL to delete that entry and try again! 🚀

