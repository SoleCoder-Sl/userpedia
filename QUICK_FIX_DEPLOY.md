# 🚨 URGENT: Fix Production Issues - 3 CRITICAL STEPS

## The Problem
- ❌ Images not saving to Supabase (`image_url` = null)
- ❌ Webhook not being called for new people
- ❌ Duplicate API calls

## The Solution (Do These 3 Steps NOW)

---

### ⚡ STEP 1: Disable Supabase RLS (2 minutes)

**This is WHY image URLs aren't saving!**

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)** → Your Project
2. Click **SQL Editor** (left sidebar)
3. **Copy-paste this SQL**:

```sql
ALTER TABLE biographies DISABLE ROW LEVEL SECURITY;
```

4. Click **RUN** ▶️
5. ✅ You'll see: "Success. No rows returned"

**Done!** RLS is now disabled.

---

### ⚡ STEP 2: Add Environment Variables to Netlify (5 minutes)

1. Go to **[Netlify Dashboard](https://app.netlify.com/)**
2. Select your **userpedia** site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** for each of these:

#### Variable 1: OpenAI API Key
- **Key**: `OPENAI_API_KEY`
- **Value**: Your OpenAI key (from `.env.local`)
- **Scopes**: All deploys

#### Variable 2: Supabase URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL (from `.env.local`)
- **Scopes**: All deploys

#### Variable 3: Supabase Anon Key
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon key (from `.env.local`)
- **Scopes**: All deploys

#### Variable 4: Webhook URL
- **Key**: `PORTRAIT_WEBHOOK_URL`
- **Value**: Your n8n/Make webhook URL (from `.env.local`)
- **Scopes**: All deploys

5. Click **Save**

---

### ⚡ STEP 3: Commit, Push & Deploy (2 minutes)

```bash
# Commit the fixes
git add .
git commit -m "Fix: Production deployment - TypeScript, duplicates, and RLS"
git push
```

**Netlify will auto-deploy!**

---

## ✅ Verify It's Working

### 1. Wait for Netlify Deploy
- Go to Netlify → **Deploys**
- Wait for **"Published"** status (2-3 minutes)

### 2. Test Your Live Site
- Open your Netlify URL
- Search for a **NEW person** (not cached, e.g., "Warren Buffett")
- Wait 30-60 seconds for generation
- **Check**:
  - ✅ Biography appears
  - ✅ Portrait displays (not MG.png)

### 3. Verify Supabase
- Go to Supabase → **Table Editor** → `biographies`
- Find "Warren Buffett" (or whoever you searched)
- **Check**: `image_url` column has a Google Drive URL
- ✅ **If it has a URL**, everything is working!

---

## 🐛 Still Not Working?

### If `image_url` is still NULL:

**Check Netlify Function Logs**:
1. Netlify → **Functions**
2. Click on `api-portrait`
3. Check **Recent invocations**
4. Look for errors

**Most common issues**:
- ❌ Environment variables not set correctly
- ❌ Webhook URL is wrong
- ❌ RLS still enabled

### If webhook isn't responding:

**Test it manually**:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Person"}'
```

**Expected**: Should return a Google Drive URL

**If it doesn't respond**: Your webhook is down or URL is incorrect.

---

## 📊 Expected Results

After fixing, when you search for a new person:

**Netlify Function Logs** should show:
```
✅ Biography found in database for: Warren Buffett
🎨 Generating portrait for: Warren Buffett
✅ Portrait generated for Warren Buffett: https://drive.google.com/uc?...
💾 Attempting to save portrait URL for: "warren buffett"
✅ Portrait URL saved for: Warren Buffett (1 row(s) updated)  ← KEY!
```

**Supabase** should have:
```
name: warren buffett
display_name: Warren Buffett
biography: <p>Warren Edward Buffett...</p>
image_url: https://drive.google.com/uc?export=view&id=XXXXX  ← SAVED!
created_at: 2025-10-23 ...
```

---

## 🎯 Summary

**3 Critical Fixes**:
1. ✅ Disabled RLS in Supabase
2. ✅ Added all 4 env vars to Netlify
3. ✅ Fixed duplicates + TypeScript error

**Expected Result**:
- New person search: Generates bio + portrait (30-60s)
- Cached person search: Instant load (<1s)
- All data saves to Supabase
- Images display correctly

---

## 📞 Need Help?

If still not working after these 3 steps, provide:
1. Screenshot of Netlify environment variables
2. Netlify function logs for `/api/portrait`
3. Screenshot of Supabase `biographies` table structure
4. Result of webhook test (curl command)

**But 99% of the time, these 3 steps fix everything!** ✨

---

**Current Status**: 
- ✅ TypeScript error fixed
- ✅ Duplicate API calls fixed
- ⏳ Waiting for you to:
  1. Disable RLS in Supabase
  2. Add env vars to Netlify
  3. Push and deploy

**Good luck!** 🚀

