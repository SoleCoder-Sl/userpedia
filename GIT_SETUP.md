# Git Setup & GitHub Push Guide

This guide will help you initialize Git, commit your code, and push to GitHub.

---

## 📋 Pre-Push Checklist

Before pushing to GitHub, make sure:

- ✅ `.gitignore` exists (already created!)
- ✅ `env.example` exists (template for others)
- ✅ NO `.env.local` or `.env` files committed
- ✅ `README.md` is complete
- ✅ All code is working locally

---

## 🚀 Step-by-Step Git Setup

### Step 1: Initialize Git (if not already done)

```bash
# Check if Git is already initialized
git status

# If not initialized, run:
git init
```

---

### Step 2: Add Files to Git

```bash
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status

# You should see:
# ✅ All code files
# ✅ README.md, DEPLOYMENT.md, etc.
# ✅ package.json, next.config.ts
# ❌ NO .env files
# ❌ NO node_modules
# ❌ NO .next folder
```

---

### Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: UserPedia - AI-powered biography explorer"
```

---

### Step 4: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. **Repository name**: `userpedia`
3. **Description**: "AI-powered biography explorer with dynamic portraits"
4. **Visibility**: Choose Public or Private
5. **Don't** initialize with README (you already have one)
6. Click **"Create repository"**

---

### Step 5: Connect to GitHub

GitHub will show commands like this:

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/userpedia.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

### Step 6: Verify Push

1. Refresh your GitHub repository page
2. You should see all files uploaded
3. Check that `.gitignore` is working (no `.env` files!)

---

## 🔒 Security Verification

### Before Pushing - Double Check:

```bash
# List all tracked files
git ls-files

# Make sure these are NOT in the list:
# ❌ .env
# ❌ .env.local
# ❌ .env.production
# ❌ node_modules/ contents
```

### If `.env` was accidentally added:

```bash
# Remove from Git (keeps local file)
git rm --cached .env
git rm --cached .env.local

# Commit the removal
git commit -m "Remove .env files from Git"

# Push
git push
```

---

## 📝 Important Files to Include

### ✅ MUST Include:

- `README.md` - Project documentation
- `DEPLOYMENT.md` - Deployment guide
- `SETUP.md` - Setup instructions
- `env.example` - Environment template (NO actual keys!)
- `package.json` - Dependencies
- `next.config.ts` - Next.js config
- `tailwind.config.ts` - Tailwind config
- All `*.ts`, `*.tsx` files - Your code
- `public/` folder - Public assets

### ❌ MUST NOT Include:

- `.env` - Your actual API keys
- `.env.local` - Local environment
- `node_modules/` - Dependencies (installed via npm)
- `.next/` - Build output
- Any backup files

---

## 🌿 Branching Strategy

### Main Branch (Production)

```bash
# This is your main branch
git push origin main
```

### Feature Branches

```bash
# Create a new branch for features
git checkout -b feature/new-design

# Work on your changes
# ... make changes ...

# Commit and push
git add .
git commit -m "Add new design"
git push origin feature/new-design

# Create Pull Request on GitHub
# Merge when ready
```

---

## 🔄 Keeping Repository Updated

### After Making Changes:

```bash
# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "Fix: Resolved duplicate API calls issue"

# Push to GitHub
git push
```

### Good Commit Messages:

```bash
✅ "Add: Supabase caching for faster loads"
✅ "Fix: CORS error for Google Drive images"
✅ "Update: Improved search autocomplete"
✅ "Docs: Added deployment guide"

❌ "changes"
❌ "update"
❌ "fix"
```

---

## 🏷️ Tags & Releases

### Create a Release:

```bash
# Tag current version
git tag -a v1.0.0 -m "Initial release: UserPedia v1.0"

# Push tags
git push --tags
```

### On GitHub:

1. Go to **Releases** → **Create a new release**
2. Choose tag: `v1.0.0`
3. Release title: "UserPedia v1.0 - Initial Release"
4. Add release notes
5. Publish release

---

## 📊 GitHub Repository Settings

### Recommended Settings:

1. **About** (top right):
   - Description: "AI-powered biography explorer"
   - Website: Your Netlify URL
   - Topics: `nextjs`, `typescript`, `ai`, `openai`, `supabase`

2. **README**:
   - Should auto-display from `README.md`

3. **Security**:
   - Go to **Settings** → **Security**
   - Enable **Dependabot alerts**
   - Enable **Code scanning**

4. **Pages** (Optional):
   - If you want GitHub Pages documentation
   - **Settings** → **Pages** → Deploy from `main` branch

---

## 🔐 Protecting Your Keys

### If Keys Were Accidentally Pushed:

**⚠️ CRITICAL: Rotate ALL keys immediately!**

1. **OpenAI**:
   - Go to https://platform.openai.com/api-keys
   - Revoke old key
   - Create new key

2. **Supabase**:
   - Go to Project Settings → API
   - Regenerate keys
   - Update Netlify environment variables

3. **Clean Git History** (advanced):
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   # Better: just rotate keys and move on
   ```

4. **Update Everywhere**:
   - Update `env.example` (if needed)
   - Update Netlify environment variables
   - Test deployment

---

## 📦 Repository Maintenance

### Regular Tasks:

```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Fix vulnerabilities
npm audit fix

# Commit updates
git add package.json package-lock.json
git commit -m "Update: Dependencies security patch"
git push
```

---

## 🎯 Quick Reference

### Common Commands:

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Create branch
git checkout -b branch-name

# Switch branch
git checkout main

# Merge branch
git merge branch-name
```

---

## ✅ Final Checklist

Before considering your push complete:

- [ ] All code pushed to GitHub
- [ ] `.gitignore` working (no `.env` files)
- [ ] `README.md` displays correctly
- [ ] Repository description set
- [ ] Topics/tags added
- [ ] `env.example` included
- [ ] No sensitive data in commits
- [ ] Repository URL updated in `package.json`

---

## 🚀 Ready to Deploy!

After pushing to GitHub:
1. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for Netlify deployment
2. Add environment variables in Netlify
3. Deploy and test!

---

**🎉 Your code is now safely on GitHub!** 🎉

