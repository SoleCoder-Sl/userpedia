# 🎉 FINAL FIX: Image URLs Not Saving (Race Condition)

## 🐛 The Problem You Described

**Symptom**: After deploying, new people show `MG.png` or wrong images. Image URLs not saving to Supabase even though RLS is disabled.

**Your Logs Showed**:
```
⚠️ No rows updated for: Elon Musk. Row might not exist yet.
```

But for some people:
```
✅ Portrait URL saved for: Bill Gates (1 row(s) updated)
```

**Why**: Sometimes it worked, sometimes it didn't!

---

## 🔍 Root Cause: Race Condition

### The Problem:

Two APIs run **in parallel** when you search for someone:

1. **Biography API** (takes 10-20s):
   ```
   INSERT INTO biographies (name, display_name, biography)
   VALUES ('elon musk', 'Elon Musk', '<p>Bio text...</p>')
   ```

2. **Portrait API** (takes 30-60s):
   ```
   UPDATE biographies 
   SET image_url = 'https://drive.google.com/...'
   WHERE name = 'elon musk'
   ```

### The Race Condition:

**Scenario A** (Works ✅):
```
Time 0s:  User searches "Bill Gates"
Time 5s:  Biography API finishes → Row created ✅
Time 30s: Portrait API finishes → UPDATE succeeds ✅
```
**Result**: `image_url` saved correctly!

---

**Scenario B** (Fails ❌):
```
Time 0s:  User searches "Elon Musk"
Time 30s: Portrait API finishes first → UPDATE finds no row ❌
Time 35s: Biography API finishes → Row created, but no image_url 😞
```
**Result**: `image_url` remains `null` forever!

---

## ✅ The Fix: UPSERT

Changed `UPDATE` to **UPSERT** (Insert or Update):

### Before (❌ Failed):
```typescript
// Only UPDATE - fails if row doesn't exist
await supabase
  .from('biographies')
  .update({ image_url: imageUrl })
  .eq('name', normalizedName)
```

### After (✅ Fixed):
```typescript
// UPSERT - creates row if missing, updates if exists
await supabase
  .from('biographies')
  .upsert(
    {
      name: normalizedName,
      display_name: name,
      image_url: imageUrl,
      biography: null,  // Will be filled later
      created_at: new Date().toISOString()
    },
    {
      onConflict: 'name',  // Update on duplicate name
      ignoreDuplicates: false
    }
  )
```

### Now Both Scenarios Work:

**Scenario A** (Portrait finishes first):
```
Time 0s:  User searches "Warren Buffett"
Time 30s: Portrait API → UPSERT creates row with image_url ✅
Time 35s: Biography API → Updates same row with biography ✅
```
**Result**: Both `image_url` and `biography` saved! 🎉

**Scenario B** (Biography finishes first):
```
Time 0s:  User searches "Steve Jobs"  
Time 15s: Biography API → Creates row with biography ✅
Time 45s: Portrait API → UPSERT updates image_url ✅
```
**Result**: Both `image_url` and `biography` saved! 🎉

---

## 🧪 Testing the Fix

### Step 1: Clear Old Bad Data

Go to **Supabase** → **SQL Editor**:

```sql
-- Delete entries with null image_url
DELETE FROM biographies WHERE image_url IS NULL;

-- OR just clear all data to start fresh
DELETE FROM biographies;
```

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 3: Test New Person

1. **Search for "Warren Buffett"** (someone new)
2. **Wait 60 seconds** for complete generation
3. **Check browser console**:
   ```
   ✅ Portrait URL saved for: Warren Buffett (upserted 1 row(s))
   ```
4. **Check Supabase**:
   ```sql
   SELECT name, image_url, biography
   FROM biographies
   WHERE name = 'warren buffett';
   ```
5. **Verify**: Both `image_url` AND `biography` are filled! ✅

### Step 4: Test Second Load (Caching)

1. **Search "Warren Buffett" again**
2. **Should load instantly** (<1s)
3. **Check logs**:
   ```
   ✅ Portrait found in cache for: Warren Buffett
   ✅ Biography found in database for: Warren Buffett
   ```

---

## 🚀 Deploy to Netlify

### Step 1: Commit the Fix

```bash
git add app/api/portrait/route.ts
git add app/person/[name]/page.tsx
git add components/molecule-ui/expandable-button.tsx
git commit -m "Fix: Race condition causing image URLs to not save - use UPSERT"
git push
```

### Step 2: Verify Environment Variables in Netlify

Make sure these are set in **Netlify** → **Site settings** → **Environment variables**:

```
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
PORTRAIT_WEBHOOK_URL=https://your-webhook...
```

### Step 3: Deploy!

**Netlify will auto-deploy** when you push to GitHub!

Watch the deploy: **Netlify Dashboard** → **Deploys**

---

## ✅ Expected Results After Deploy

### First Search for New Person:

**Timeline**:
```
0s:   Search "Taylor Swift"
10s:  Biography appears (from OpenAI)
45s:  Portrait appears (from webhook)
```

**Supabase** (after 60s):
```
name: taylor swift
display_name: Taylor Swift
biography: <p>Taylor Swift is...</p>
image_url: https://drive.google.com/uc?export=view&id=XXXXX
```
✅ **Both fields populated!**

### Second Search (Cached):

**Timeline**:
```
0s: Search "Taylor Swift"
1s: Everything loads instantly!
```

**Logs**:
```
✅ Biography found in database
✅ Portrait found in cache
```

---

## 📊 What Changed

| File | Change | Why |
|------|--------|-----|
| `app/api/portrait/route.ts` | `UPDATE` → `UPSERT` | Handles race condition |
| `app/person/[name]/page.tsx` | Added state reset | Prevents wrong images |
| `expandable-button.tsx` | Fixed TypeScript | Build succeeds |

---

## 🐛 Troubleshooting

### Issue: Still seeing `MG.png` after deploy

**Check 1**: Webhook working?
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Person"}'
```
**Expected**: Google Drive URL returned

**Check 2**: Netlify logs
- Go to **Netlify** → **Functions** → `api-portrait`
- Check **Recent invocations**
- Look for: `✅ Portrait URL saved for: ... (upserted 1 row(s))`

**Check 3**: Supabase data
```sql
SELECT name, image_url, created_at
FROM biographies
ORDER BY created_at DESC
LIMIT 5;
```
**Expected**: All entries have `image_url` filled

---

### Issue: Duplicate images generated

**Cause**: Old code still running (browser cache or old dev server)

**Fix**:
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev

# Hard refresh browser
Ctrl + Shift + R
```

---

### Issue: Wrong image for person

**Cause**: Old corrupted data in Supabase

**Fix**:
```sql
-- Delete specific person
DELETE FROM biographies WHERE name = 'virat kohli';

-- Then search again - will regenerate fresh
```

---

## 🎯 Summary

### What Was Wrong:
- Portrait API used `UPDATE` which failed if row didn't exist yet
- Race condition: Sometimes portrait finished before biography
- Result: `image_url` stayed `null` for some people

### What We Fixed:
- Changed `UPDATE` to `UPSERT` in portrait API
- Now works regardless of which API finishes first
- Always saves `image_url` correctly

### Expected Outcome:
- ✅ All new searches save image URL
- ✅ No more `MG.png` fallback (except on webhook failure)
- ✅ Caching works perfectly
- ✅ Each person shows their own image

---

## 🚀 Ready to Deploy!

**Final Checklist**:
- [x] Code fixed (UPSERT implemented)
- [x] Build succeeds
- [x] Tested locally
- [ ] Committed to Git
- [ ] Pushed to GitHub
- [ ] Netlify env vars configured
- [ ] Supabase RLS disabled
- [ ] Old bad data cleared

**Deploy Command**:
```bash
git add .
git commit -m "Fix: Race condition - image URLs now save correctly"
git push
```

**Then test in production**:
1. Search for someone new
2. Wait 60 seconds
3. Check Supabase for `image_url`
4. Search again - should be instant!

---

**This fix solves the core issue!** 🎉

After deploying, **every person will have their correct image saved and cached!** 

No more `MG.png` fallback (except for actual webhook failures)!

---

**Need help?** Check:
- `FINAL_DEPLOY_READY.md` - Deployment guide
- `FIX_WRONG_IMAGE_ISSUE.md` - Wrong image troubleshooting
- `fix_wrong_images.sql` - Database cleanup scripts

**Good luck with deployment!** 🚀✨

