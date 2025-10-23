# Production Readiness Checklist

Use this checklist before pushing to GitHub and deploying to Netlify.

---

## 🔒 Security

- [ ] `.gitignore` created and configured
- [ ] `.env.local` file exists locally (with real keys)
- [ ] `env.example` created (with example values)
- [ ] NO real API keys in any committed files
- [ ] No sensitive data in code comments
- [ ] Supabase RLS disabled for API access
- [ ] All environment variables documented

---

## 📦 Code Quality

- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] All linter warnings addressed
- [ ] Code formatted consistently
- [ ] No unused imports
- [ ] No debug `console.log` statements (except intentional)

---

## 🧪 Testing

### Local Testing:
- [ ] `npm run dev` works without errors
- [ ] `npm run build` completes successfully
- [ ] `npm start` (production build) works
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] Autocomplete suggestions appear
- [ ] Biography generation works (first search)
- [ ] Caching works (second search)
- [ ] Portrait displays correctly
- [ ] Image proxy working (no CORS errors)
- [ ] Mobile responsive

### Database:
- [ ] Supabase connection working
- [ ] Biographies table exists
- [ ] `image_url` column exists
- [ ] RLS disabled
- [ ] Data saving correctly
- [ ] Data retrieving correctly

---

## 📚 Documentation

- [ ] `README.md` complete
- [ ] `DEPLOYMENT.md` created
- [ ] `SETUP.md` up to date
- [ ] `env.example` has all required variables
- [ ] `GIT_SETUP.md` created
- [ ] All API routes documented
- [ ] Environment variables documented

---

## 🌐 Configuration Files

- [ ] `package.json` metadata updated
  - Name: `userpedia`
  - Description added
  - Repository URL set
  - License: MIT
- [ ] `next.config.ts` configured
  - Image domains for Google Drive
- [ ] `tailwind.config.ts` configured
- [ ] `tsconfig.json` correct

---

## 🎨 Assets

- [ ] All images in `public/` folder
- [ ] Logo.png exists
- [ ] MG.png (fallback portrait) exists
- [ ] No unnecessary backup files
- [ ] Fonts loaded correctly

---

## 🔗 External Services

### OpenAI:
- [ ] API key valid
- [ ] Usage limits understood
- [ ] Billing set up
- [ ] Rate limits considered

### Supabase:
- [ ] Project created
- [ ] Database schema set up
- [ ] API keys copied
- [ ] RLS disabled for `biographies` table
- [ ] Free tier limits understood

### Portrait Webhook (Optional):
- [ ] n8n workflow running
- [ ] Webhook URL accessible
- [ ] Returns valid Google Drive URLs
- [ ] Response format correct (JSON or plain text)

---

## 📊 Performance

- [ ] No duplicate API calls (check terminal logs)
- [ ] Caching working correctly
- [ ] Image proxy caching enabled
- [ ] No memory leaks
- [ ] No infinite loops
- [ ] Loading states implemented

---

## 🐛 Known Issues Resolved

- [ ] CORS errors fixed (image proxy)
- [ ] Duplicate API calls fixed (in-flight tracking)
- [ ] Supabase RLS disabled
- [ ] `image_url` column added
- [ ] Google Drive URL conversion working
- [ ] React Strict Mode duplicates handled

---

## 🚀 Git & GitHub

- [ ] Git initialized
- [ ] `.gitignore` working
- [ ] Initial commit made
- [ ] GitHub repository created
- [ ] Repository URL correct in `package.json`
- [ ] Code pushed to GitHub
- [ ] Repository public/private as desired
- [ ] README displays correctly on GitHub
- [ ] No `.env` files in GitHub

---

## 🌐 Netlify Deployment

- [ ] Netlify account created
- [ ] Repository connected
- [ ] Build settings configured:
  - Build command: `npm run build`
  - Publish directory: `.next`
- [ ] Environment variables added:
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `PORTRAIT_WEBHOOK_URL`
- [ ] First deploy successful
- [ ] Site loads at Netlify URL
- [ ] All functionality working in production

---

## 🧪 Production Testing

After deployment to Netlify:

### Homepage:
- [ ] Site loads at Netlify URL
- [ ] Logo displays
- [ ] Search bar works
- [ ] Autocomplete appears

### Search:
- [ ] Search for "Narendra Modi"
- [ ] Biography generates
- [ ] Portrait loads
- [ ] Content scrollable

### Caching:
- [ ] Search same person again
- [ ] Loads instantly (~200ms)
- [ ] Same portrait displays
- [ ] Same biography

### Mobile:
- [ ] Open on mobile device
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] No horizontal scroll

---

## 🎯 Final Verification

- [ ] Site accessible at Netlify URL
- [ ] No console errors in production
- [ ] All features working
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Search suggestions working
- [ ] Biography generation working
- [ ] Caching working
- [ ] Portraits displaying

---

## 📈 Monitoring Setup

- [ ] Netlify Analytics enabled (optional)
- [ ] Supabase usage monitored
- [ ] OpenAI usage monitored
- [ ] Error tracking set up (optional)

---

## 🎉 Launch Checklist

Before announcing your site:

- [ ] Everything above verified
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Site performance tested
- [ ] Multiple personalities tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Share URL ready

---

## 🚨 Emergency Procedures

If something breaks in production:

### Quick Rollback:
1. Go to Netlify Dashboard
2. **Deploys** → Find last working deploy
3. Click **"Publish deploy"**

### Fix and Redeploy:
1. Fix issue locally
2. Test thoroughly: `npm run build && npm start`
3. Commit and push
4. Netlify auto-deploys

### Environment Variable Issues:
1. Check Netlify → **Site settings** → **Environment variables**
2. Verify all 4 variables present
3. No extra spaces
4. Trigger new deploy

---

## ✅ Production Ready?

Count your checkmarks:

- **100% checked**: 🎉 You're production-ready!
- **90-99%**: Review unchecked items
- **< 90%**: Address critical issues first

---

**When all critical items are checked, you're ready to deploy!** 🚀

