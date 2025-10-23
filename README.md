# UserPedia - AI-Powered Biography Explorer

**UserPedia** is a modern, AI-powered web application that provides instant, beautifully formatted biographies for personalities around the world. Search for anyone, get AI-generated content, and explore their life story with dynamic portraits.

![UserPedia](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

---

## ✨ Features

- 🔍 **Smart Search** - AI-powered autocomplete suggests personalities as you type
- 📖 **AI-Generated Biographies** - Detailed, well-formatted life stories using GPT-4o-mini
- 🖼️ **Dynamic Portraits** - Webhook-generated unique portraits for each personality
- ⚡ **Lightning Fast** - Supabase caching makes second searches 150x faster
- 🎨 **Beautiful UI** - Glass morphism design with smooth animations
- 🌐 **CORS-Free** - Built-in image proxy for seamless Google Drive integration
- 💾 **Smart Caching** - Biography and portrait data cached for instant retrieval

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19, App Router, TypeScript)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + Custom Molecule UI
- **AI**: [OpenAI GPT-4o-mini](https://openai.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Image Generation**: Custom n8n Webhook
- **Font**: [Google Fonts](https://fonts.google.com/) (Poppins, Playfair Display)

---

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Supabase account
- n8n webhook (optional, for portrait generation)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/userpedia.git
cd userpedia
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your keys:

```env
OPENAI_API_KEY=sk-proj-your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
PORTRAIT_WEBHOOK_URL=https://your-webhook-url.com/generate-portrait
```

### 4. Set Up Supabase Database

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Create biographies table
CREATE TABLE IF NOT EXISTS biographies (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  biography TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disable Row Level Security (for API access)
ALTER TABLE biographies DISABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_biographies_name ON biographies(name);
```

📄 **See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed setup**

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app! 🎉

---

## 🌐 Deployment

### Deploy to Netlify

UserPedia is optimized for Netlify deployment:

1. **Push to GitHub** (this repo)

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose your GitHub repo

3. **Configure Build Settings**:
   ```
   Build command: npm run build
   Publish directory: .next
   ```

4. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all variables from `.env.local`:
     - `OPENAI_API_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `PORTRAIT_WEBHOOK_URL`

5. **Deploy!** 🚀

📄 **See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide**

---

## 📖 Usage

### Search for a Personality

1. Start typing a name in the search bar
2. AI suggests personalities as you type (prioritizing Indian personalities)
3. Select from suggestions or press Enter

### View Biography

- **First visit**: Generates biography (~10s) and portrait (~30s)
- **Subsequent visits**: Instant load from cache (~200ms)

### Features

- **Glass morphism design** with smooth animations
- **Scrollable biographies** with important words bolded
- **Dynamic portraits** half-in, half-out design
- **Go back to home** button for easy navigation

---

## 🗂️ Project Structure

```
userpedia/
├── app/
│   ├── api/
│   │   ├── biography/       # AI biography generation
│   │   ├── suggestions/     # Search autocomplete
│   │   ├── portrait/        # Webhook portrait generation
│   │   └── image-proxy/     # CORS bypass proxy
│   ├── person/[name]/       # Dynamic person pages
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── molecule-ui/
│   │   └── expandable-button.tsx  # Search component
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Utilities
├── public/                  # Static assets
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
├── next.config.ts           # Next.js config
├── tailwind.config.ts       # Tailwind config
└── tsconfig.json            # TypeScript config
```

---

## 🔧 Configuration

### OpenAI API

- Model: `gpt-4o-mini`
- Temperature: 0.7
- Max tokens: 1000
- Formatted with HTML `<p>` and `<strong>` tags

### Supabase Caching

- **Biography**: Cached on first generation
- **Portrait URL**: Saved after webhook call
- **Lookup**: ~200ms (vs ~40s for fresh generation)

### Portrait Webhook

**Expected Response**:
- JSON: `{ "imageUrl": "https://drive.google.com/..." }`
- Plain text: `https://drive.google.com/...`

**Supported Formats**:
- Google Drive sharing links
- Direct image URLs

---

## 🐛 Troubleshooting

### Issue: Portraits not saving

**Solution**: Run this SQL in Supabase:
```sql
ALTER TABLE biographies DISABLE ROW LEVEL SECURITY;
```

### Issue: CORS errors for images

**Solution**: Images are automatically proxied through `/api/image-proxy`. Make sure Google Drive links are public.

### Issue: Duplicate API calls

**Solution**: Already handled! In-flight request tracking prevents React Strict Mode duplicates.

📄 **See [FINAL_FIX_SUMMARY.md](FINAL_FIX_SUMMARY.md) for all fixes**

---

## 📚 Documentation

- [SETUP.md](SETUP.md) - Complete setup instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Netlify deployment guide
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Database setup
- [WEBHOOK_INTEGRATION.md](WEBHOOK_INTEGRATION.md) - Portrait webhook guide
- [FINAL_FIX_SUMMARY.md](FINAL_FIX_SUMMARY.md) - All fixes and solutions

---

## 🎯 Performance

- **First search**: ~40s (AI generation + webhook)
- **Cached search**: ~200ms (**150x faster!**)
- **Search suggestions**: ~1s
- **Image proxy**: ~2s

---

## 🤝 Contributing

This is a personal project, but feel free to:
- Report issues
- Suggest features
- Fork and customize!

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - Amazing React framework
- [OpenAI](https://openai.com/) - Powerful AI models
- [Supabase](https://supabase.com/) - PostgreSQL as a service
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Molecule UI](https://moleculeui.design/) - Expandable button

---

## 📧 Contact

Built with ❤️ for exploring the lives of remarkable people.

---

**⭐ Star this repo if you found it useful!**

