# UserPedia Setup Instructions

> **📌 Having Issues?** Check [FIX_SUMMARY.md](FIX_SUMMARY.md) or [VERIFY_DATABASE.md](VERIFY_DATABASE.md)!

## Quick Start

UserPedia uses three services:
1. **OpenAI** - For AI suggestions and biography generation
2. **Supabase** - For caching biographies and portraits (30x faster!)
3. **n8n Webhook** - For dynamic portrait generation

> 📝 **Note**: Supabase is optional but **highly recommended** for better performance!

---

## OpenAI API Integration

This project uses OpenAI's GPT-4o-mini to provide intelligent personality suggestions and generate biographies.

### Setup Steps:

1. **Get an OpenAI API Key**
   - Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign up or log in to your OpenAI account
   - Create a new API key

2. **Add the API Key to your project**
   - Create a file named `.env.local` in the root directory of your project
   - Add the following line:
     ```
     OPENAI_API_KEY=your-openai-api-key-here
     ```
   - Replace `your-openai-api-key-here` with your actual API key

3. **Restart the development server**
   ```bash
   npm run dev
   ```

### Features:

- ✅ **Auto-suggestions**: Type 2+ characters to get personality suggestions
- ✅ **Dynamic biographies**: AI-generated comprehensive biographies for any person
- ✅ **Debounced search**: Waits 300ms after you stop typing before fetching suggestions
- ✅ **Fallback mode**: Works with hardcoded suggestions if no API key is provided
- ✅ **Click to select**: Click any suggestion to fill the search bar
- ✅ **Smart collapse**: Search bar collapses when clicking outside

### How it works:

1. Type in the search box (e.g., "El")
2. Wait a moment for suggestions to appear (e.g., "Elon Musk", "Elton John", etc.)
3. Click a suggestion or press Enter to search
4. The person's page loads with:
   - Dynamic name display in the header
   - AI-generated comprehensive biography with important details in bold
   - Scrollable content with hidden scrollbar
   - Professional glass morphism design

### Fallback Suggestions:

If you don't have an OpenAI API key, the app will use pre-defined suggestions for common letter combinations like:
- "el" → Elon Musk, Elton John, Elizabeth Taylor, etc.
- "al" → Albert Einstein, Al Pacino, Alan Turing, etc.
- "st" → Steve Jobs, Stephen Hawking, Steven Spielberg, etc.

And many more!

---

## Supabase Setup (Optional but Recommended)

**Why Supabase?** Makes biography loading **30x faster** by caching!

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

### Quick Setup:

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL from `SUPABASE_SETUP.md` to create the table
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart dev server: `npm run dev`

**Benefits:**
- ⚡ First search: ~2-3 seconds (generate with AI)
- 🚀 Next searches: ~0.1 seconds (load from database)
- 💰 Saves OpenAI API costs
- 🌍 Everyone benefits from cached biographies

---

## Webhook Integration (Dynamic Portraits)

**Already configured!** Webhook URL: `https://n8nlocal.rakeshbash.live/webhook/generate-portrait`

See [WEBHOOK_INTEGRATION.md](./WEBHOOK_INTEGRATION.md) for full details.

**How it works:**
- Automatically calls webhook when new person is searched
- Receives Google Drive public link for portrait
- Caches in Supabase for instant loading
- Falls back to default image if webhook fails

**Migration (if you already have the table):**
```sql
ALTER TABLE biographies ADD COLUMN IF NOT EXISTS image_url TEXT;
```

