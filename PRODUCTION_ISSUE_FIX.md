# Production Deployment Issues - Complete Fix Guide

## 🚨 Issues You're Experiencing

After deploying to Netlify:
1. ❌ **Webhook not being called** for new people
2. ❌ **Supabase not storing image URLs** (`image_url` remains `null`)
3. ❌ **Duplicate API calls** still happening
4. ❌ **Images not displaying** for new biographies

---

## 🔍 Root Causes

### Issue 1: Missing Environment Variables in Netlify

**Your logs show**: `⚠️ No rows updated for: Elon Musk. Row might not exist yet.`

**This means**: Supabase credentials might be missing or incorrect in Netlify.

### Issue 2: Row Level Security (RLS) Still Enabled

**Critical**: You need to disable RLS in Supabase for the `biographies` table.

### Issue 3: Webhook URL Not Set in Production

**The webhook** might not be configured in Netlify's environment variables.

---

## ✅ Step-by-Step Fix

### **STEP 1: Disable Supabase RLS (CRITICAL)**

🚨 **This is the #1 reason image URLs aren't saving!**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Paste this SQL:

```sql
ALTER TABLE biographies DISABLE ROW LEVEL SECURITY;
```

5. Click **Run**
6. You should see: ✅ **Success. No rows returned**

**Verify it worked**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'biographies';
```

You should see `rowsecurity = false`

---

### **STEP 2: Set Environment Variables in Netlify**

Go to your Netlify dashboard:

1. **Site settings** → **Environment variables**
2. **Add these 4 variables**:

| Variable Name | Where to Find It | Example Value |
|---------------|------------------|---------------|
| `OPENAI_API_KEY` | [OpenAI Dashboard](https://platform.openai.com/api-keys) | `sk-proj-...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | `eyJhbGciOiJIUzI1...` |
| `PORTRAIT_WEBHOOK_URL` | Your n8n/Make.com webhook | `https://your-webhook.app.n8n.cloud/webhook/...` |

3. **Important**: After adding, click **Save** and **Trigger deploy** (redeploy your site)

---

### **STEP 3: Verify Supabase Table Structure**

Make sure your `biographies` table has all columns:

```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'biographies';
```

**Required columns**:
- `name` (TEXT, PRIMARY KEY)
- `display_name` (TEXT)
- `biography` (TEXT)
- `image_url` (TEXT) ← **Must exist!**
- `created_at` (TIMESTAMP)

**If `image_url` is missing**, run:
```sql
ALTER TABLE biographies ADD COLUMN IF NOT EXISTS image_url TEXT;
NOTIFY pgrst, 'reload schema';
```

---

### **STEP 4: Test Webhook Locally First**

Before deploying, test if your webhook works:

```bash
curl -X POST https://your-webhook-url.com/webhook/portrait \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Person"}'
```

**Expected response**: A Google Drive URL like:
```
https://drive.google.com/uc?export=view&id=XXXXXXXXX
```

If it doesn't work, **fix your webhook first** before deploying.

---

### **STEP 5: Fix Duplicate API Calls (Final)**

The current fix uses `useRef`, but in production we need a more robust solution.

Replace the entire `useEffect` in `app/person/[name]/page.tsx`:

```typescript
useEffect(() => {
  let bioAborted = false;
  let portraitAborted = false;

  const fetchBiography = async () => {
    if (bioFetchingRef.current || bioAborted) {
      console.log('⏭️ Skipping duplicate biography fetch');
      return;
    }
    bioFetchingRef.current = true;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/biography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: personName }),
      });

      if (!bioAborted && response.ok) {
        const data = await response.json();
        setBiography(data.biography);
      } else if (!bioAborted) {
        setBiography(`<p>Unable to load biography for ${personName}.</p>`);
      }
    } catch (error) {
      if (!bioAborted) {
        console.error('Error fetching biography:', error);
        setBiography(`<p>Unable to load biography for ${personName}.</p>`);
      }
    } finally {
      setIsLoading(false);
      bioFetchingRef.current = false;
    }
  };

  const fetchPortrait = async () => {
    if (portraitFetchingRef.current || portraitAborted) {
      console.log('⏭️ Skipping duplicate portrait fetch');
      return;
    }
    portraitFetchingRef.current = true;
    
    setIsImageLoading(true);
    try {
      const response = await fetch('/api/portrait', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: personName }),
      });

      if (!portraitAborted && response.ok) {
        const data = await response.json();
        let portraitUrl = data.imageUrl || '/MG.png';
        
        if (portraitUrl.includes('drive.google.com')) {
          portraitUrl = `/api/image-proxy?url=${encodeURIComponent(portraitUrl)}`;
        }

        console.log(`🖼️ Portrait URL for ${personName}:`, portraitUrl);
        setImageUrl(portraitUrl);
      } else if (!portraitAborted) {
        console.error('Failed to fetch portrait:', response.statusText);
        setImageUrl('/MG.png');
      }
    } catch (error) {
      if (!portraitAborted) {
        console.error('Error fetching portrait:', error);
        setImageUrl('/MG.png');
      }
    } finally {
      setIsImageLoading(false);
      portraitFetchingRef.current = false;
    }
  };

  fetchBiography();
  fetchPortrait();

  // Cleanup function to prevent state updates if component unmounts
  return () => {
    bioAborted = true;
    portraitAborted = true;
  };
}, [personName]);
```

---

### **STEP 6: Deploy and Test**

After making all fixes:

1. **Commit changes**:
```bash
git add .
git commit -m "Fix: Production deployment issues - RLS, env vars, and duplicates"
git push
```

2. **Netlify will auto-deploy** (or manually trigger deploy)

3. **Test in production**:
   - Go to your live Netlify URL
   - Search for a **new person** (not cached)
   - Open browser **DevTools** → **Network** tab
   - Check if:
     - ✅ `/api/biography` is called **once**
     - ✅ `/api/portrait` is called **once**
     - ✅ Webhook is triggered
     - ✅ Image URL is returned

4. **Check Supabase**:
   - Go to **Table Editor** → `biographies`
   - Find the new entry
   - **Verify**: `image_url` column has a Google Drive URL

---

## 🧪 Testing Checklist

### Local Testing (before deploying):

- [ ] `npm run build` succeeds
- [ ] `.env.local` has all 4 environment variables
- [ ] Supabase RLS is disabled
- [ ] Webhook responds with image URL
- [ ] `image_url` saves to Supabase

### Production Testing (after deploying):

- [ ] Netlify has all 4 environment variables
- [ ] Build succeeds on Netlify
- [ ] Search for a new person
- [ ] Biography appears
- [ ] Portrait displays (not MG.png)
- [ ] Supabase shows `image_url` saved
- [ ] Second search for same person loads instantly (cached)

---

## 🐛 Debugging Production Issues

### If image URL is still null in Supabase:

**Check Netlify Deploy Logs**:
1. Netlify Dashboard → **Deploys**
2. Click latest deploy → **Deploy log**
3. Search for errors

**Check Netlify Function Logs**:
1. Netlify Dashboard → **Functions**
2. Find `/api/portrait`
3. Check **Recent invocations**
4. Look for errors like:
   - ❌ `Webhook error`
   - ❌ `Failed to save portrait URL`
   - ❌ `PGRST204` (RLS blocking)

### If webhook isn't being called:

**Verify webhook URL**:
```bash
# From your terminal
curl -X POST $PORTRAIT_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

**Expected**: Image URL returned

**If no response**: Your webhook is down or URL is wrong.

---

## 📊 Expected Logs (Success)

After the fix, your logs should show:

```
GET /person/New%20Person 200 in 50ms
🔍 Checking cache for: "new person"
📊 Database query result: { data: null, error: null }
❌ No cached portrait for: New Person (image_url: null)
🎨 Generating portrait for: New Person
💾 Biography saved to database for: New Person
✅ Portrait generated for New Person: https://drive.google.com/uc?...
💾 Attempting to save portrait URL for: "new person" -> https://...
✅ Portrait URL saved for: New Person (1 row(s) updated)  ← THIS IS KEY!
POST /api/portrait 200 in 30s
GET /api/image-proxy?url=... 200 in 2.5s
```

**Key indicator**: `✅ Portrait URL saved for: ... (1 row(s) updated)`

If you see `⚠️ No rows updated`, **RLS is still blocking**.

---

## 🔐 Security Note

After disabling RLS, your `biographies` table is **public read/write**.

**For production, you should**:
1. Keep RLS disabled for development
2. Before going live, create a proper RLS policy:

```sql
-- Enable RLS
ALTER TABLE biographies ENABLE ROW LEVEL SECURITY;

-- Allow public reads
CREATE POLICY "Allow public reads"
ON biographies FOR SELECT
TO anon
USING (true);

-- Allow authenticated writes
CREATE POLICY "Allow service writes"
ON biographies FOR INSERT
TO authenticated
USING (true);

CREATE POLICY "Allow service updates"
ON biographies FOR UPDATE
TO authenticated
USING (true);
```

But for now, **keep it disabled** until everything works!

---

## 📞 Quick Checklist

Before asking for help, verify:

- [ ] RLS is disabled (`ALTER TABLE biographies DISABLE ROW LEVEL SECURITY;`)
- [ ] `image_url` column exists in Supabase
- [ ] All 4 env vars are in Netlify
- [ ] Webhook URL is correct and responding
- [ ] Build succeeds on Netlify
- [ ] Logs show `✅ Portrait URL saved`

If all checked and still not working, share:
1. Netlify deploy logs
2. Netlify function logs for `/api/portrait`
3. Screenshot of Supabase `biographies` table structure
4. Output of webhook test (`curl` command)

---

## 🚀 Next Steps

1. **Run the RLS SQL** in Supabase (most important!)
2. **Add env vars** to Netlify
3. **Test webhook** with curl
4. **Commit and push** the duplicate fix
5. **Test in production**
6. **Verify Supabase** has image URLs

**Once working**, you'll see:
- ✅ First search: Generates bio + portrait (30s)
- ✅ Second search: Instant load from cache (<1s)
- ✅ Images display correctly
- ✅ Supabase has all data

Good luck! 🎉

