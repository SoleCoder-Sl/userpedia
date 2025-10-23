# Fix Summary - Image URL Not Saving

## Problems Identified

1. ✅ **CORS Issue** - Google Drive blocks direct image loading
2. ✅ **Name Normalization** - Inconsistent name formats causing mismatches
3. 🔍 **Database Verification Needed** - Can't confirm if updates are working without checking logs

## Fixes Applied

### 1. Image Proxy (CORS Fix) ✅

**Created**: `/app/api/image-proxy/route.ts`

- Fetches Google Drive images server-side (bypasses CORS)
- Automatically used for all Google Drive URLs
- Caches images for fast loading

**Result**: No more CORS errors in console!

---

### 2. Enhanced Logging ✅

**Updated**: 
- `/app/api/portrait/route.ts`
- `/app/api/biography/route.ts`

**New logs you'll see**:

```
🔍 Checking cache for: "shah rukh khan"
📊 Database query result: { data: { image_url: null }, error: null }
❌ No cached portrait for: Shah Rukh Khan (image_url: null)
🎨 Generating portrait for: Shah Rukh Khan
✅ Portrait generated for Shah Rukh Khan: https://drive.google.com/uc?...
💾 Attempting to save portrait URL for: "shah rukh khan" -> https://...
✅ Portrait URL saved for: Shah Rukh Khan (1 row(s) updated)
```

These logs will tell us:
- ✅ If the database query is finding the row
- ✅ If the image_url is null or has a value
- ✅ If the UPDATE query actually updated any rows
- ✅ If the webhook returned a valid URL

---

### 3. Name Normalization ✅

**Problem**: Biography saved as `"Shah Rukh Khan "` (with space), portrait looked for `"shah rukh khan"` (no space) = MISMATCH!

**Fix**: Both APIs now use `.toLowerCase().trim()` consistently

**Before**:
```typescript
name.toLowerCase()  // "shah rukh khan " ❌
```

**After**:
```typescript
name.toLowerCase().trim()  // "shah rukh khan" ✅
```

---

### 4. Better Database Queries ✅

**Changed**: `.single()` → `.maybeSingle()`

- `.single()` throws error if no row found
- `.maybeSingle()` returns null if no row found (cleaner)

**Changed**: UPDATE now returns updated rows

```typescript
const { data: updateData, error: updateError } = await supabase
  .from('biographies')
  .update({ image_url: imageUrl })
  .eq('name', normalizedName)
  .select();  // ← Returns what was updated

if (updateData && updateData.length > 0) {
  console.log(`✅ Portrait URL saved (${updateData.length} row(s) updated)`);
} else {
  console.warn(`⚠️ No rows updated. Row might not exist yet.`);
}
```

---

## What to Do Next

### Step 1: Check Your Supabase Data

**Run this SQL** in Supabase SQL Editor:

```sql
SELECT name, display_name, image_url, created_at
FROM biographies
ORDER BY created_at DESC;
```

**Check**:
- ✅ Do you see rows?
- ✅ Is `image_url` null or does it have Google Drive URLs?
- ✅ Are the `name` values lowercase and trimmed?

📄 **Full guide**: See `VERIFY_DATABASE.md`

---

### Step 2: Clear Bad Data (If Needed)

If you have rows with null `image_url` or wrong data:

```sql
-- Option 1: Delete specific person
DELETE FROM biographies WHERE name = 'shah rukh khan';

-- Option 2: Delete all (start fresh)
DELETE FROM biographies;
```

---

### Step 3: Test with New Logging

1. **Hard refresh** your app (Ctrl+Shift+R)
2. **Search for "Shah Rukh Khan"**
3. **Watch terminal logs** - you should see the detailed logs above
4. **Check the console** - no more CORS errors!
5. **Verify image loads** - SRK's portrait should display

---

### Step 4: Verify Caching Works

1. **Search for same person again** (e.g., "Shah Rukh Khan")
2. **Check terminal** - should see:
   ```
   ✅ Portrait found in cache for: Shah Rukh Khan
   ```
3. **Image loads instantly** - no webhook call!

---

## Expected Behavior (After Fixes)

### First Search (Cache Miss):
```
User searches "Shah Rukh Khan"
  ↓
🔍 Check database: image_url is null
  ↓
🎨 Call webhook to generate portrait
  ↓
✅ Receive: https://drive.google.com/uc?export=view&id=...
  ↓
💾 Save to database (1 row updated)
  ↓
🖼️ Proxy through /api/image-proxy (bypass CORS)
  ↓
✅ Display image!
```

### Second Search (Cache Hit):
```
User searches "Shah Rukh Khan" again
  ↓
🔍 Check database: image_url exists!
  ↓
✅ Return cached URL immediately
  ↓
🖼️ Proxy through /api/image-proxy
  ↓
✅ Display image instantly!
```

---

## Troubleshooting

### Issue: Still showing MG.png

**Check terminal for**:
```
⚠️ No rows updated for: [name]. Row might not exist yet.
```

**Solution**: 
1. The biography might not be created yet (race condition)
2. Search for that person again - should work the second time
3. Or delete and regenerate: `DELETE FROM biographies WHERE name = 'shah rukh khan'`

---

### Issue: Different image every search

**Check terminal for**:
```
❌ No cached portrait for: [name] (image_url: null)
```

**Solution**: The `image_url` isn't being saved. Check:
1. Does the `image_url` column exist? Run: `DEBUG_SUPABASE.sql`
2. Is the webhook returning valid URLs? Check terminal logs
3. Are there errors saving to Supabase? Check terminal logs

---

### Issue: CORS errors still appearing

**Check**:
1. Is the image URL being proxied? Should be: `/api/image-proxy?url=...`
2. Check browser console for the image source
3. Hard refresh (Ctrl+Shift+R) to clear cache

---

## Files Changed

- ✅ `app/api/image-proxy/route.ts` - NEW (CORS fix)
- ✅ `app/api/portrait/route.ts` - Enhanced logging & normalization
- ✅ `app/api/biography/route.ts` - Name normalization
- ✅ `app/person/[name]/page.tsx` - Auto-proxy Google Drive URLs

## Files Created (Documentation)

- 📄 `VERIFY_DATABASE.md` - Step-by-step database verification
- 📄 `DEBUG_SUPABASE.sql` - SQL queries for debugging
- 📄 `CORS_FIX.md` - Explanation of CORS fix
- 📄 `FIX_SUMMARY.md` - This file!

---

## Test It Now!

1. **Clear Supabase data** (optional, for clean start):
   ```sql
   DELETE FROM biographies;
   ```

2. **Hard refresh** app (Ctrl+Shift+R)

3. **Search "Shah Rukh Khan"**

4. **Watch terminal** - you'll see detailed logs

5. **Verify**:
   - ✅ No CORS errors in console
   - ✅ Portrait displays correctly
   - ✅ Terminal shows "1 row(s) updated"

6. **Search "Shah Rukh Khan" AGAIN**

7. **Verify caching**:
   - ✅ Terminal shows "Portrait found in cache"
   - ✅ Loads instantly (no webhook call)
   - ✅ Same image displays

8. **Search different person** (e.g., "Sachin Tendulkar")

9. **Verify**:
   - ✅ Different image loads
   - ✅ Both people keep their correct images

---

## Success Criteria ✅

- ✅ **No CORS errors** in browser console
- ✅ **Portraits display** for all searched personalities
- ✅ **Caching works** - second search is instant
- ✅ **Different people show different images**
- ✅ **Terminal logs show**:
  - "Portrait found in cache" on second search
  - "1 row(s) updated" when saving
  - Google Drive URLs being proxied

---

**Need Help?** Check the terminal logs and compare with the examples in this document!

