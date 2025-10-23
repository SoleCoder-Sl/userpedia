# Webhook Integration - Dynamic Portrait Generation

## Overview

UserPedia now automatically generates/retrieves portrait images for any personality using your n8n webhook!

**Webhook URL:** `https://n8nlocal.rakeshbash.live/webhook/generate-portrait`

## How It Works:

### Flow:

1. **User searches** for "Elon Musk"
2. **Person page loads** and calls `/api/portrait`
3. **Check Supabase cache**:
   - ✅ If portrait URL exists → Return instantly
   - ❌ If not found → Call your webhook
4. **Webhook generates/retrieves** portrait image
5. **Returns Google Drive public link**
6. **Save to Supabase** for next time
7. **Display portrait** on the page

### Performance:

| Visit Type | Load Time | Source |
|------------|-----------|--------|
| First visit | ~3-5 seconds | Webhook generation |
| Second visit | ~0.1 seconds | Supabase cache ⚡ |

## Webhook Request Format:

Your webhook will receive:

```json
POST https://n8nlocal.rakeshbash.live/webhook/generate-portrait
Content-Type: application/json

{
  "name": "Elon Musk"
}
```

## Expected Webhook Response:

Your webhook can return in any of these formats:

### Option 1: JSON
```json
{
  "imageUrl": "https://drive.google.com/file/d/FILE_ID/view"
}
```

### Option 2: Plain Text
```
https://drive.google.com/file/d/FILE_ID/view
```

### Option 3: Direct Link
```json
{
  "url": "https://drive.google.com/uc?export=view&id=FILE_ID"
}
```

**Note:** The API automatically converts all Google Drive formats to direct image URLs!

## Google Drive Public Link Format:

Your webhook can return **ANY** of these Google Drive formats:

✅ **Standard sharing link:**
```
https://drive.google.com/file/d/FILE_ID/view
https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

✅ **Open link:**
```
https://drive.google.com/open?id=FILE_ID
```

✅ **Direct link (already converted):**
```
https://drive.google.com/uc?export=view&id=FILE_ID
```

**The API automatically converts all formats to direct image URLs!** 🎯

**Important:** The file must have public access:
1. Right-click file in Google Drive
2. Click "Share" → "Get link"
3. Change to "Anyone with the link" can view

## Features:

✅ **Automatic caching** - Generated portraits saved to Supabase
✅ **Fallback image** - Uses default MG.png if webhook fails
✅ **Loading state** - Shows "Loading portrait..." while generating
✅ **Error handling** - Gracefully handles webhook failures
✅ **Fast subsequent loads** - Cached portraits load instantly

## Testing:

1. Search for a new person (e.g., "Steve Jobs")
2. Watch the console logs:
   ```
   🎨 Generating portrait for: Steve Jobs
   ✅ Portrait generated for Steve Jobs: https://drive.google.com/...
   💾 Portrait URL saved for: Steve Jobs
   ```
3. Search again:
   ```
   ✅ Portrait found in cache for: Steve Jobs
   ```

## Webhook Endpoint Requirements:

Your n8n workflow should:
1. Accept POST requests with JSON body containing `name`
2. Generate or retrieve a portrait image
3. Upload to Google Drive with public access
4. Return the public Google Drive link
5. Handle errors gracefully

## Database Schema:

The `biographies` table now includes:
```sql
CREATE TABLE biographies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  biography TEXT NOT NULL,
  image_url TEXT,              -- 👈 New field for portrait
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting:

### Portrait not loading?
- Check console for error messages
- Verify webhook is accessible
- Ensure Google Drive link is public
- Check response format matches expected format

### Using existing table?
Run this migration:
```sql
ALTER TABLE biographies ADD COLUMN IF NOT EXISTS image_url TEXT;
```

## Console Logs:

You'll see these messages:
- `🎨 Generating portrait for: [Name]` - Calling webhook
- `✅ Portrait generated for [Name]: [URL]` - Success
- `💾 Portrait URL saved for: [Name]` - Saved to cache
- `✅ Portrait found in cache for: [Name]` - Loaded from cache

---

**That's it!** Your portraits are now dynamically generated and cached! 🎨⚡

