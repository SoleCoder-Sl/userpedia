# Deployment Guide - Netlify

This guide will help you deploy UserPedia to Netlify for production use.

---

## 🚀 Quick Deployment

### Prerequisites

✅ GitHub account
✅ Netlify account (free tier works!)
✅ All environment variables ready

---

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"

# Push to GitHub
git push origin main
```

---

### 2. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Select your **userpedia** repository
5. Click **"Deploy site"**

---

### 3. Configure Build Settings

Netlify should auto-detect Next.js, but verify:

#### Build Settings:
```
Framework: Next.js
Build command: npm run build
Publish directory: .next
```

#### Functions:
```
Functions directory: .netlify/functions
```

---

### 4. Add Environment Variables

**Critical Step!** Add these in Netlify Dashboard:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** for each:

#### Required Variables:

```
OPENAI_API_KEY=sk-proj-your-actual-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
PORTRAIT_WEBHOOK_URL=https://your-webhook-url.com/generate-portrait
```

**⚠️ Important**: Use your ACTUAL keys, not the example values!

---

### 5. Deploy!

1. Netlify will automatically start building
2. Wait for "Site is live" message (~2-3 minutes)
3. Visit your site at: `https://your-site-name.netlify.app`

---

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to:
   - Add domain
   - Configure DNS
   - Enable HTTPS (automatic with Netlify)

---

### Environment Variables Management

#### To Update Variables:

1. **Site settings** → **Environment variables**
2. Find the variable
3. Click **"..."** → **"Edit"**
4. Update value
5. Click **"Trigger deploy"** to rebuild with new values

#### Variable Scopes:

- **Production**: Used for live site
- **Deploy preview**: Used for PR previews
- **Branch deploys**: Used for branch-specific deployments

---

## 🧪 Testing Your Deployment

### 1. Check Homepage

Visit `https://your-site.netlify.app`

✅ Should see UserPedia logo
✅ Search bar should expand/collapse
✅ Typing should show suggestions

### 2. Test Search

Search for **"Narendra Modi"** or **"Bill Gates"**

✅ Biography should generate (~10s first time)
✅ Portrait should load (~30s first time)
✅ Content should be scrollable

### 3. Test Caching

Search for the SAME person again

✅ Should load instantly (~200ms)
✅ Same portrait should display
✅ Biography should be identical

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Check Build Logs**:
1. Netlify Dashboard → **Deploys**
2. Click failed deploy
3. Check error message

**Common Fixes**:
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solution**:
```bash
# Test build locally first
npm run build

# Fix any errors, then push again
git push
```

---

### Issue: "Function invocation failed"

**Cause**: Environment variables not set

**Fix**:
1. Check all 4 variables are added
2. No extra spaces in values
3. Trigger new deploy

---

### Issue: Portraits Not Saving

**Cause**: Supabase RLS not disabled

**Fix**: Run this SQL in Supabase:
```sql
ALTER TABLE biographies DISABLE ROW LEVEL SECURITY;
```

---

### Issue: CORS Errors

**Cause**: Image proxy not working

**Fix**: Already handled! Image proxy is automatic. If issues persist:
1. Check Google Drive links are public
2. Check image URL format in webhook response

---

## 📊 Monitoring

### Netlify Analytics

1. Go to **Analytics** tab
2. View:
   - Visitors
   - Page views
   - Top pages
   - Performance

### Function Logs

1. Go to **Functions** tab
2. Click a function (e.g., `api/biography`)
3. View real-time logs

### Supabase Monitoring

1. Go to Supabase Dashboard
2. Check:
   - Database size
   - API requests
   - Query performance

---

## 🚀 Performance Optimization

### Enable Caching

Already optimized! The app uses:
- Supabase caching (150x faster)
- Image proxy caching (CDN)
- Next.js static optimization

### CDN Distribution

Netlify automatically distributes your site globally:
- ✅ 100+ edge locations
- ✅ Automatic HTTPS
- ✅ Instant cache invalidation

---

## 🔒 Security Best Practices

### Environment Variables

✅ Never commit `.env.local` to Git
✅ Use Netlify's secure variable storage
✅ Rotate keys periodically

### API Keys

✅ Use read-only Supabase keys for public access
✅ Restrict OpenAI API key to your domain (in OpenAI dashboard)
✅ Monitor API usage regularly

### Database

✅ RLS disabled for API access (secure through Next.js API routes)
✅ No sensitive data exposed in client
✅ All database queries server-side only

---

## 📈 Scaling

### Free Tier Limits (Netlify)

- Build minutes: 300/month
- Bandwidth: 100 GB/month
- Function runs: 125K/month

**Typical Usage**:
- 1 deploy = ~2-3 build minutes
- 1 user visit = ~1-2 MB bandwidth
- 1 search = 3-4 function calls

**Estimated Capacity**: ~10,000 searches/month on free tier

### Upgrade Path

If you exceed free tier:
1. **Netlify Pro**: $19/mo (better limits)
2. **OpenAI Tier 2**: Pay-as-you-go
3. **Supabase Pro**: $25/mo (better performance)

---

## 🔄 Continuous Deployment

### Automatic Deploys

Already enabled! Every `git push` to `main` triggers:
1. Build on Netlify
2. Run tests (if configured)
3. Deploy to production
4. Invalidate CDN cache

### Branch Previews

Push to a branch → Get a preview URL:
```bash
git checkout -b feature/new-design
git push origin feature/new-design
# Netlify creates: https://feature-new-design--your-site.netlify.app
```

---

## 📝 Deployment Checklist

Before going live:

- [ ] All environment variables added
- [ ] Supabase RLS disabled
- [ ] Test search functionality
- [ ] Test caching (search twice)
- [ ] Test portrait loading
- [ ] Check mobile responsiveness
- [ ] Verify custom domain (if used)
- [ ] Monitor initial usage
- [ ] Set up usage alerts

---

## 🎉 You're Live!

Your UserPedia is now deployed and accessible worldwide!

**Next Steps**:
1. Share your site URL
2. Monitor usage in Netlify Dashboard
3. Check Supabase for cached data
4. Optimize based on real usage

**Your URL**: `https://your-site-name.netlify.app`

---

## 📧 Support

**Issues with deployment?**
- Check [Netlify Docs](https://docs.netlify.com/)
- Review build logs
- Check environment variables
- Test locally first: `npm run build && npm start`

---

**🎊 Congratulations on deploying UserPedia!** 🎊

