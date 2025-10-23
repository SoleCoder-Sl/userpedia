# Supabase Setup for UserPedia

## Why Supabase?

Supabase stores biographies in a database for **instant loading**! 
- ⚡ **First visit**: Generate with AI (~2-3 seconds)
- 🚀 **Next visits**: Load from database (~0.1 seconds) - **30x faster!**

## Setup Steps:

### 1. Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new project:
   - Choose a project name (e.g., "userpedia")
   - Set a database password (save it!)
   - Choose a region close to you
   - Click "Create new project"

### 2. Create the Biographies Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create biographies table
CREATE TABLE biographies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  biography TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_biographies_name ON biographies(name);

-- Enable Row Level Security (RLS)
ALTER TABLE biographies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" 
ON biographies FOR SELECT 
TO public 
USING (true);

-- Create policy to allow public insert access
CREATE POLICY "Allow public insert access" 
ON biographies FOR INSERT 
TO public 
WITH CHECK (true);
```

4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### 3. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

### 4. Add Credentials to Your Project

1. Open your `.env.local` file (or create it in the project root)
2. Add these two lines:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace the values with your actual credentials from step 3

Your `.env.local` should now look like:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 5. Restart Your Development Server

```bash
npm run dev
```

## How It Works:

### First Time Someone Searches:
1. User searches for "Albert Einstein"
2. Check Supabase database → Not found
3. Generate biography with OpenAI (~2-3 seconds)
4. Save to Supabase for next time
5. Display biography

### Second Time (Anyone Searches):
1. User searches for "Albert Einstein"
2. Check Supabase database → **Found!** ✅
3. Return from database instantly (~0.1 seconds) 🚀
4. Display biography

## Benefits:

- ⚡ **30x faster** loading after first search
- 💰 **Save money** - No repeated OpenAI API calls
- 🌍 **Global cache** - Everyone benefits from cached biographies
- 📊 **Track popularity** - See which personalities are searched most
- 🔄 **Offline mode** - Works even if OpenAI is down

## Verify It's Working:

1. Search for a person (e.g., "Steve Jobs")
2. Check browser console (F12) → Should see: `💾 Biography saved to database for: Steve Jobs`
3. Refresh and search again
4. Check console → Should see: `✅ Biography found in database for: Steve Jobs`
5. Notice how much faster it loads! ⚡

## Optional: View Your Data

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Select **biographies** table
4. See all saved biographies!

---

**That's it!** Your UserPedia now has lightning-fast biography loading! ⚡

