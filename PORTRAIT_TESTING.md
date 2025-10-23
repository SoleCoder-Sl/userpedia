# Portrait Testing Guide

## What Was Fixed:

### 1. **Webhook Response Handling** ✅
The portrait API now handles multiple response formats:
- ✅ JSON responses: `{ "imageUrl": "..." }` or `{ "url": "..." }` or `{ "link": "..." }`
- ✅ Plain text responses: Just the URL as text
- ✅ Empty/invalid responses: Falls back to default image

### 2. **Google Drive Image Support** ✅
Added Next.js image optimization for Google Drive:
- ✅ `drive.google.com`
- ✅ `lh3.googleusercontent.com`
- ✅ `*.googleusercontent.com`

### 3. **Image Display** ✅
Portrait images will display:
- **Size**: 442px × 442px (same as before)
- **Position**: Half outside, half inside the glass box (left side)
- **Styling**: Drop shadow for depth
- **Fallback**: Shows MG.png if webhook fails

## How to Test:

### Step 1: Search for a New Person
```
1. Go to http://localhost:3000
2. Type a name (e.g., "Steve Jobs")
3. Click the suggestion
```

### Step 2: Watch the Console
You should see:
```
🎨 Generating portrait for: Steve Jobs
✅ Portrait generated for Steve Jobs: https://drive.google.com/...
💾 Portrait URL saved for: Steve Jobs
```

### Step 3: Verify the Image
- Image should appear half-outside, half-inside the glass box
- Same size as the default Mahatma Gandhi image
- Clean edges (no borders on transparent parts)
- Drop shadow for depth

### Step 4: Test Caching
```
1. Go back to home
2. Search for the same person again
3. Should load instantly!
```

Console should show:
```
✅ Portrait found in cache for: Steve Jobs
```

## Webhook Response Format:

Your webhook can return any of these:

### Option 1: JSON with imageUrl
```json
{
  "imageUrl": "https://drive.google.com/uc?export=view&id=FILE_ID"
}
```

### Option 2: JSON with url
```json
{
  "url": "https://drive.google.com/uc?export=view&id=FILE_ID"
}
```

### Option 3: JSON with link
```json
{
  "link": "https://drive.google.com/uc?export=view&id=FILE_ID"
}
```

### Option 4: Plain text
```
https://drive.google.com/uc?export=view&id=FILE_ID
```

## Google Drive Link Setup:

1. **Upload image** to Google Drive
2. **Right-click** → Get link
3. **Change access** to "Anyone with the link"
4. **Copy link** - should look like:
   ```
   https://drive.google.com/file/d/FILE_ID/view
   ```
5. **Convert to direct link** (optional but recommended):
   ```
   https://drive.google.com/uc?export=view&id=FILE_ID
   ```

## Troubleshooting:

### Image not loading?
1. Check console for errors
2. Verify Google Drive link is public
3. Test the link in a new browser tab
4. Check webhook response format

### Shows default image?
1. Check if webhook returned a valid URL
2. Verify the URL is accessible
3. Check console logs for errors

### Portrait generates but doesn't cache?
1. Make sure you ran the migration:
   ```sql
   ALTER TABLE biographies ADD COLUMN IF NOT EXISTS image_url TEXT;
   ```
2. Check Supabase console for the image_url column
3. Verify Supabase credentials in .env.local

## Expected Behavior:

### First Visit (New Person):
```
Loading portrait...     (2-5 seconds - webhook generating)
  ↓
Portrait displays       (Google Drive image)
  ↓
Cached in database      (For next time)
```

### Second Visit (Cached):
```
Loading portrait...     (~0.1 seconds)
  ↓
Portrait displays       (From cache - instant!)
```

## Image Specifications:

The portrait should:
- ✅ Be **442px × 442px** (or proportional)
- ✅ Have **transparent background** (recommended)
- ✅ Be **PNG or JPG** format
- ✅ Show the person's **face/upper body**
- ✅ Be **high quality** (at least 400×400)

## Success Indicators:

✅ Console shows: `🎨 Generating portrait for: [Name]`
✅ Console shows: `✅ Portrait generated for [Name]: [URL]`
✅ Console shows: `💾 Portrait URL saved for: [Name]`
✅ Image displays in the correct position
✅ Image is half-outside, half-inside the box
✅ Second search loads instantly with cached portrait

---

**Ready to test!** Try searching for a new person now! 🎨

