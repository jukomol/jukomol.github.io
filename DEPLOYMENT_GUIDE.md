# Portfolio Website Deployment Guide

Complete setup and deployment instructions for the jukomol.github.io portfolio website.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Workflow](#development-workflow)
4. [Building the Project](#building-the-project)
5. [Deploying to GitHub Pages](#deploying-to-github-pages)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v20 or higher): [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git**: [Download](https://git-scm.com/)
- **GitHub Account** with access to the jukomol/jukomol.github.io repository

### Verify Installation

```bash
node --version
npm --version
git --version
```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jukomol/jukomol.github.io.git
cd jukomol.github.io
```

### 2. Configure Git (First Time Only)

```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### 3. Install Dependencies

```bash
npm install
```

This installs all required packages:
- **React** - UI library
- **Vite** - Build tool
- **Supabase** - Backend database
- **Tailwind CSS** - Styling
- **react-hook-form** - Form management
- **react-markdown** - Markdown rendering
- **date-fns** - Date formatting
- **lucide-react** - Icons

### 4. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

Add your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project settings.

---

## Development Workflow

### View Project Structure

```
jukomol.github.io/
├── src/
│   ├── pages/          # Page components (CV, Publications, Blog, etc.)
│   ├── components/     # Reusable components
│   │   └── admin/      # Admin panel components
│   ├── lib/            # Utilities (Supabase config)
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── dist/               # Build output (generated)
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── package.json        # Dependencies and scripts
├── 404.html            # SPA routing configuration
└── DEPLOYMENT_GUIDE.md # This file
```

### Start Development Server

```bash
npm run dev
```

This starts a local development server at `http://localhost:5173`

### Edit Code

- Make changes in `src/` directory
- Changes auto-refresh in the browser
- Check browser console for errors

### Stop Development Server

Press `Ctrl+C` in the terminal

---

## Building the Project

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder:
- Minifies JavaScript and CSS
- Optimizes images
- Creates source maps for debugging

**Output:**
```
dist/
├── index.html
├── 404.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

### View Build Size

```bash
npm run build
```

Check the console output for bundle sizes. Common sizes:
- CSS: ~43KB (gzip: ~9KB)
- JS: ~1070KB (gzip: ~323KB)

---

## Deploying to GitHub Pages

### Full Deployment Workflow

#### Step 1: Make Code Changes

```bash
# Ensure you're on the main branch
git checkout main

# Make your code changes in src/
# Test locally: npm run dev
```

#### Step 2: Commit to Main Branch

```bash
# Check what files changed
git status

# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "Description of what changed

- More details about changes
- Add any relevant context

Co-Authored-By: Your Name <email@example.com>"

# View recent commits
git log --oneline -5
```

**Commit Message Convention:**
- First line: Short summary (50 chars max)
- Blank line
- Bullet points with details
- Include co-author info at bottom

Example:
```
Add logo display to CV entries

- Display 80x80px logos alongside entry titles
- Support both file upload and image URLs
- Consistent sizing across all views

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Step 3: Push to Main Branch

```bash
# Push changes to GitHub
git push origin main

# Verify push succeeded
git log --oneline -5
```

#### Step 4: Build for Production

```bash
# Install latest dependencies (optional but recommended)
npm install

# Build the project
npm run build

# Verify dist/ folder was created
ls dist/
```

#### Step 5: Deploy to gh-pages Branch

```bash
# Switch to gh-pages branch
git checkout gh-pages

# Remove all old files
git rm -rf .

# Copy new build files
cp -r dist/* .

# Ensure .nojekyll exists (tells GitHub to serve as-is)
touch .nojekyll

# Stage all new files
git add .

# Commit deployment
git commit -m "Deploy updates

Co-Authored-By: Your Name <email@example.com>"

# Push to gh-pages
git push origin gh-pages

# Switch back to main for next changes
git checkout main

echo "✅ Deployment complete!"
```

#### Step 6: Verify Deployment

- Visit https://jukomol.github.io in browser
- Check that changes appear (may take 1-2 minutes)
- Open browser DevTools (F12) to check for errors

---

## Quick Reference Commands

### Setup (One Time)
```bash
git clone https://github.com/jukomol/jukomol.github.io.git
cd jukomol.github.io
npm install
```

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
```

### Git Workflow
```bash
git status              # See what changed
git add -A              # Stage all changes
git commit -m "message" # Commit changes
git push origin main    # Push to main branch
git log --oneline       # View commit history
```

### Deployment (Full Pipeline)
```bash
# 1. Ensure main branch is up-to-date
git checkout main
git pull origin main

# 2. Make changes, commit, and push to main
git add -A
git commit -m "Your message"
git push origin main

# 3. Build the project
npm install
npm run build

# 4. Deploy to gh-pages
git checkout gh-pages
git rm -rf .
cp -r dist/* .
touch .nojekyll
git add .
git commit -m "Deploy updates"
git push origin gh-pages

# 5. Return to main branch
git checkout main
echo "✅ Done!"
```

### Emergency Deploy Script

If you just want to quickly rebuild and deploy after making code changes:

```bash
#!/bin/bash
# Save as deploy.sh and run with: bash deploy.sh

echo "Building project..."
npm run build

echo "Deploying to gh-pages..."
git checkout gh-pages
git rm -rf .
cp -r dist/* .
touch .nojekyll
git add .
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"
git push origin gh-pages

git checkout main
echo "✅ Deployment complete!"
```

---

## Project Structure Details

### Key Files

- **src/pages/CV.jsx** - CV page (displays entries with logos)
- **src/pages/Publications.jsx** - Publications page
- **src/pages/Blog.jsx** - Blog page
- **src/pages/Home.jsx** - Homepage
- **src/components/admin/CVTab.jsx** - CV admin panel (create/edit/delete entries, upload logos)
- **src/components/admin/NewsTab.jsx** - News admin panel
- **src/components/admin/PublicationsTab.jsx** - Publications admin panel
- **src/components/admin/BlogsTab.jsx** - Blog admin panel
- **src/components/admin/ProfileTab.jsx** - Profile admin panel
- **src/lib/supabase.js** - Supabase configuration
- **vite.config.js** - Build configuration (base: '/')
- **404.html** - SPA routing (segmentCount: 0)
- **.env.local** - Environment variables (not in git)

### Database Tables (Supabase)

- **profile** - Site profile info (professional_summary, etc.)
- **cv_timeline** - CV entries (title, organization, logo_url, etc.)
- **news** - News items (title, content, created_at)
- **publications** - Publications (title, authors, venue, etc.)
- **blogs** - Blog posts (title, content, created_at)

---

## Common Tasks

### Update a Single Feature

```bash
git checkout main
# Edit files in src/
npm run dev           # Test changes
git add -A
git commit -m "Update feature"
git push origin main
npm run build
git checkout gh-pages && git rm -rf . && cp -r dist/* . && touch .nojekyll
git add . && git commit -m "Deploy" && git push origin gh-pages
git checkout main
```

### Revert Last Commit (Before Push)

```bash
git reset HEAD~1  # Undo last commit, keep changes
git reset --hard HEAD~1  # Undo last commit, discard changes
```

### Check Deployment Status

```bash
# View last 5 commits
git log --oneline -5

# Check current branch
git branch -v

# View remote branches
git branch -r
```

### Pull Latest Changes

```bash
git pull origin main
npm install  # Install any new dependencies
```

---

## Troubleshooting

### Issue: "vite command not found"

**Solution:**
```bash
npm install
npm run build  # Use npm script instead of vite directly
```

### Issue: Build fails with Supabase error

**Solution:**
```bash
# Ensure .env.local has correct values
cat .env.local  # Check configuration

# Rebuild with fresh dependencies
rm -rf node_modules
npm install
npm run build
```

### Issue: Changes not appearing on website

**Solution:**
```bash
# 1. Verify gh-pages branch has latest build
git checkout gh-pages
git log --oneline -3

# 2. Check if .nojekyll file exists
ls -la | grep nojekyll

# 3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

# 4. Wait 1-2 minutes for GitHub Pages to update
```

### Issue: Git push fails

**Solution:**
```bash
# Ensure you're tracking the remote branch
git branch -u origin/main main

# Try pulling first
git pull origin main

# Then push
git push origin main
```

### Issue: Node version incompatible

**Solution:**
```bash
# Check current version
node --version

# Downgrade if needed (requires nvm - Node Version Manager)
nvm install 20
nvm use 20
npm install
npm run build
```

---

## Environment Variables Reference

File: `.env.local`

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Note: Never commit .env.local to git!
# These are sensitive credentials
```

Get values from: Supabase Dashboard → Project Settings → API

---

## Important Notes

⚠️ **Never commit these to git:**
- `.env.local`
- `node_modules/`
- `dist/` folder (regenerate from source)

✅ **Always commit these:**
- `src/` folder (source code)
- `package.json` and `package-lock.json`
- Configuration files (vite.config.js, tailwind.config.js, etc.)
- `DEPLOYMENT_GUIDE.md` and other documentation

---

## Summary Checklist

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] `.env.local` created with Supabase credentials
- [ ] Dependencies installed: `npm install`
- [ ] Development server works: `npm run dev`
- [ ] Code changes committed to main: `git push origin main`
- [ ] Production build created: `npm run build`
- [ ] Build deployed to gh-pages: `git push origin gh-pages`
- [ ] Website updated at https://jukomol.github.io

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review recent commits: `git log --oneline -10`
3. Check git status: `git status`
4. Review browser console errors (F12)
5. Check Supabase dashboard for database issues

---

**Last Updated:** 2026-09-13  
**Project:** jukomol.github.io (Portfolio Website)  
**Technology Stack:** React + Vite + Supabase + Tailwind CSS
