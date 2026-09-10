# Migration Guide: test-site → jukomol.github.io

Complete documentation of all issues encountered and their solutions. This guide covers all the problems we faced and how to fix them when migrating or rebuilding the site in a different repository.

---

## 📋 Problem Summary

When deploying to GitHub Pages, we encountered 8 major issues:

1. ❌ **LightningCSS Native Binaries** - Build failed on Linux runners
2. ❌ **GitHub Actions Workflow** - Didn't build/deploy app correctly
3. ❌ **Vite Base Path** - Assets loading from wrong URL
4. ❌ **React Router Basename** - Routes not matching subdirectory
5. ❌ **Invalid Module Specifiers** - Vite config had broken external modules
6. ❌ **File Paths Hardcoded** - Profile picture and CV couldn't load
7. ❌ **GitHub Pages Routing** - Page reload went to wrong URL
8. ❌ **Supabase Storage** - Bucket didn't exist, RLS policies missing

---

## 🔧 Detailed Solutions

### ISSUE #1: LightningCSS Native Binaries Compilation Failure

**Error Message:**
```
[Failed to load PostCSS config: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

**Root Cause:**
- `@tailwindcss/postcss` uses LightningCSS which requires platform-specific native binaries
- Windows machine compiled binaries for Windows
- GitHub Actions (Ubuntu) couldn't use Windows binaries
- `npm ci` restored cached Windows binaries instead of rebuilding for Linux

**Solution:**

**Step 1:** Update `.github/workflows/deploy.yml`

Add these steps in the build job:

```yaml
      - name: Install build dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y python3 build-essential

      - name: Clear npm cache
        run: npm cache clean --force

      - name: Remove node_modules and package-lock
        run: rm -rf node_modules package-lock.json

      - name: Install dependencies with clean build
        run: npm install
```

**Step 2:** Remove npm cache setting from Node.js setup

Change from:
```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
```

To:
```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
```

**Why it works:**
- `python3` and `build-essential` allow native modules to compile
- Clearing cache removes Windows-specific binaries
- Removing `node_modules` and `package-lock.json` forces fresh install
- Using `npm install` instead of `npm ci` regenerates binaries for Linux

**Commands to apply:**
```bash
# In your new repo, update the workflow file:
# Edit .github/workflows/deploy.yml with the changes above
```

---

### ISSUE #2: GitHub Actions Workflow Incorrect

**Error Message:**
```
[none - deployment just uploaded the entire repo instead of building it]
```

**Root Cause:**
- Original workflow uploaded entire repo (path: `.`) to GitHub Pages
- Never ran `npm install` or `npm run build`
- No environment variables passed to build

**Solution:**

**Complete fixed `.github/workflows/deploy.yml`:**

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  pages: write
  id-token: write
  contents: read

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout main branch
        uses: actions/checkout@v4
        with:
          ref: main

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install build dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y python3 build-essential

      - name: Clear npm cache
        run: npm cache clean --force

      - name: Remove node_modules and package-lock
        run: rm -rf node_modules package-lock.json

      - name: Install dependencies with clean build
        run: npm install

      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Key points:**
- ✅ Builds app first (`npm run build`)
- ✅ Uploads only `dist/` folder (not entire repo)
- ✅ Passes Supabase secrets to build process
- ✅ Installs build tools for native modules
- ✅ Two-job workflow: build → deploy

**Commands to apply:**
```bash
# Copy this workflow to your new repo:
cp .github/workflows/deploy.yml ../jukomol.github.io/.github/workflows/deploy.yml

# Then commit and push:
cd ../jukomol.github.io
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

---

### ISSUE #3: Vite Base Path Configuration

**Problem:**
- Site deployed to `https://jukomol.github.io/test-site/` (subdirectory)
- Vite configured with `base: '/'` (root only)
- Assets loaded from `/assets/` instead of `/test-site/assets/`
- Page appeared blank because CSS/JS couldn't load

**Solution:**

**Update `vite.config.js`:**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/test-site/',
  // Remove build.rollupOptions - keep it simple
})
```

**For `jukomol.github.io` (root domain):**

If deploying to `https://jukomol.github.io/` (root, not subdirectory), use:
```javascript
base: '/',
```

**If deploying to `https://jukomol.github.io/portfolio/` (subdirectory):**
```javascript
base: '/portfolio/',
```

**Commands to apply:**
```bash
# Update vite.config.js in your new repo
# Change the base path to match your deployment location

# Then rebuild:
npm run build

# Verify the built index.html has correct paths:
# Look for: href="/your-path/assets/index-*.css"
#           src="/your-path/assets/index-*.js"
cat dist/index.html | grep "/assets/"

# Commit and push:
git add vite.config.js
git commit -m "Configure Vite base path for deployment"
git push origin main
```

---

### ISSUE #4: React Router Not Aware of Subdirectory

**Error:**
```
No routes matched location "/test-site/"
```

**Root Cause:**
- BrowserRouter configured with `basename="/test-site"`
- Routes defined as `/`, `/cv`, `/blog` (without `/test-site/` prefix)
- Router couldn't match paths that started with `/test-site/`

**Solution - Part A: Using Hash-Based Routing (RECOMMENDED for GitHub Pages)**

**Update `src/App.jsx`:**

```javascript
import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CV from './pages/CV'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Publications from './pages/Publications'
import Admin from './pages/Admin'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cv" element={<CV />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/publications" element={<Publications />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  )
}

export default App
```

**Key points:**
- ✅ Use `HashRouter` (not `BrowserRouter`)
- ✅ Remove `basename` prop
- ✅ Routes stay simple (`/`, `/cv`, etc.)
- ✅ URLs will have `#` in them: `https://site.com/#/?/cv`

**Update `404.html` for subdirectory:**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Academic Portfolio</title>
    <script type="text/javascript">
      // For /test-site/ subdirectory: segmentCount = 1
      // For root domain (https://jukomol.github.io/): segmentCount = 0
      var segmentCount = 0;  // Change to 1 if using subdirectory
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + segmentCount).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(segmentCount).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

**segmentCount values:**
- `0` for root domain: `https://jukomol.github.io/`
- `1` for subdirectory: `https://jukomol.github.io/portfolio/`
- `2` for nested subdirectory: `https://jukomol.github.io/repo/portfolio/`

**Commands to apply:**
```bash
# Update App.jsx
# Find and replace BrowserRouter with HashRouter
# Remove basename prop

# Update 404.html segmentCount based on your deployment path

# Test locally:
npm run dev
# Navigate to http://localhost:5173/#/?/cv - should work

# Build and push:
npm run build
git add src/App.jsx 404.html
git commit -m "Use HashRouter for GitHub Pages SPA routing"
git push origin main
```

**Solution - Part B: Using BrowserRouter (If you have server-side routing)**

If your server can handle all routes and redirect to `index.html`:

```javascript
<BrowserRouter basename="/test-site">
  <Routes>
    // ... routes
  </Routes>
</BrowserRouter>
```

And update 404.html to redirect to index.html instead of using hash routing.

---

### ISSUE #5: Invalid Module Specifiers in Vite Config

**Error:**
```
Failed to resolve module specifier "#minpath"
```

**Root Cause:**
- `vite.config.js` marked `#minpath`, `#minproc`, `#minurl` as external modules
- These are internal Node.js aliases that don't exist in browser
- Caused runtime errors

**Solution:**

**Update `vite.config.js`:**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/test-site/',
  // Remove external modules and rollupOptions entirely
})
```

**Before (broken):**
```javascript
build: {
  rollupOptions: {
    external: ['#minpath', '#minproc', '#minurl'],  // ❌ WRONG
    output: {
      manualChunks: {}
    }
  }
}
```

**After (fixed):**
```javascript
// Remove the entire build section
```

**Commands to apply:**
```bash
# Update vite.config.js - remove build.rollupOptions

# Verify the config is valid:
npm run build

# Should build without "Failed to resolve module specifier" errors

git add vite.config.js
git commit -m "Remove invalid external modules from Vite config"
git push origin main
```

---

### ISSUE #6: Hardcoded File Paths

**Problem:**
- Profile picture: `src="/profile.jpg"` (hardcoded to root)
- CV download: `href="/Jahir_Uddin_CV.pdf"` (hardcoded to root)
- Files uploaded to Supabase but app didn't know about them

**Solution:**

**Update `src/pages/Home.jsx` (line ~44):**

```javascript
// BEFORE (broken):
<img src="/profile.jpg" alt={profile.name} />

// AFTER (fixed):
<img
  src={`${supabase?.storage.from('portfolio-assets').getPublicUrl('profile.jpg').data.publicUrl || '/profile.jpg'}`}
  alt={profile.name}
  className="w-56 h-56 rounded-full object-cover border-4 border-cyan-500 shadow-lg mb-6"
  onError={(e) => e.target.src = '/profile.jpg'}
/>
```

**Update `src/pages/CV.jsx` (line ~49):**

```javascript
// BEFORE (broken):
<a href="/Jahir_Uddin_CV.pdf" download>

// AFTER (fixed):
<a
  href={`${supabase?.storage.from('portfolio-assets').getPublicUrl('cv-latest.pdf').data.publicUrl || '/Jahir_Uddin_CV.pdf'}`}
  download="Jahir_Uddin_CV.pdf"
  className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition flex items-center gap-2 font-semibold"
>
  <Download size={20} /> Download Full CV
</a>
```

**How it works:**
- ✅ Tries to load from Supabase Storage first
- ✅ Falls back to local file if Supabase not configured
- ✅ `onError` handler shows fallback image if URL fails

**What files to upload to Supabase:**
- Profile picture: `portfolio-assets/profile.jpg` (or `.png`)
- CV document: `portfolio-assets/cv-latest.pdf`

**Commands to apply:**
```bash
# Update the two files:
# src/pages/Home.jsx - update img src
# src/pages/CV.jsx - update href

npm run build

# Test locally:
npm run dev
# Upload files through admin panel at http://localhost:5173/#/?/admin

# If files show up, you're good!
git add src/pages/Home.jsx src/pages/CV.jsx
git commit -m "Load profile picture and CV from Supabase storage"
git push origin main
```

---

### ISSUE #7: GitHub Pages Routing Breaks on Reload

**Problem:**
- Clicking navigation links worked (hash routing)
- But reloading the page went to wrong URL or 404
- URL looked like: `/?/test-site/cv` instead of `/test-site/#/?/cv`

**Root Cause:**
- GitHub Pages doesn't support client-side routing natively
- Need special 404.html redirect to handle SPA routing
- 404.html must convert paths to hash format
- `segmentCount` must match subdirectory depth

**Solution:**

**Ensure `404.html` is correct:**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Academic Portfolio</title>
    <script type="text/javascript">
      // CRITICAL: Set segmentCount correctly!
      var segmentCount = 0;
      
      // If deploying to root (https://jukomol.github.io/):
      //   segmentCount = 0
      
      // If deploying to subdirectory (https://jukomol.github.io/test-site/):
      //   segmentCount = 1
      
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + segmentCount).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(segmentCount).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

**segmentCount Quick Reference:**

| Deployment URL | segmentCount | Example |
|---|---|---|
| `https://jukomol.github.io/` | `0` | Root domain |
| `https://jukomol.github.io/test-site/` | `1` | One subdirectory |
| `https://jukomol.github.io/repo/site/` | `2` | Two subdirectories |

**Test it:**
```bash
# Build the app:
npm run build

# The routing works like this:
# User requests: /test-site/cv
# → GitHub Pages returns 404
# → 404.html redirects to: /?/test-site/cv
# → Browser loads index.html
# → HashRouter matches the hash: /#/?/test-site/cv
# → Routes to /cv component

# Test with local server simulating GitHub Pages:
npx serve -s dist
# Visit: http://localhost:3000/test-site/cv
# Reload page - should stay at same route
```

**Commands to apply:**
```bash
# Make sure 404.html has correct segmentCount
# Build and test:
npm run build
npx serve -s dist

# If routing works after reload, deploy:
git add 404.html
git commit -m "Configure 404.html for GitHub Pages routing"
git push origin main
```

---

### ISSUE #8: Supabase Storage and Authentication

**Problem:**
- Tried to upload files → "Bucket not found" error
- Bucket created → "RLS policy violation" error
- Admin login not working

**Root Cause:**
- Storage bucket `portfolio-assets` didn't exist
- RLS (Row-Level Security) policies not configured
- Authentication not set up

**Solution:**

**Step 1: Create Storage Bucket**

In Supabase Dashboard:
1. Go to **Storage**
2. Click **Create a new bucket**
3. Name: `portfolio-assets`
4. Toggle **"Public bucket"** ON
5. Click **Create bucket**

**Step 2: Create RLS Policies**

Go to **Storage** → **portfolio-assets** → **Policies**

Create 4 policies by running this SQL (SQL Editor):

```sql
-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (SELECT auth.role()) = 'authenticated'
);

-- Policy 2: Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

-- Policy 3: Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update"
ON storage.objects FOR UPDATE
WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (SELECT auth.role()) = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'portfolio-assets'
    AND (SELECT auth.role()) = 'authenticated'
);
```

**Step 3: Create Database Tables**

Run this SQL in **SQL Editor**:

```sql
-- Profile table
CREATE TABLE profile (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  current_position TEXT,
  bio TEXT,
  affiliation TEXT,
  email TEXT,
  address TEXT,
  research_interests TEXT[],
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  date TIMESTAMP DEFAULT NOW(),
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- News table
CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  category TEXT,
  link TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Publications table
CREATE TABLE publications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  venue TEXT,
  date TIMESTAMP DEFAULT NOW(),
  link TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CV Timeline table
CREATE TABLE cv_timeline (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Step 4: Configure GitHub Secrets**

In your new GitHub repo:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   ```
   Name: VITE_SUPABASE_URL
   Value: https://your-project.supabase.co
   ```
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: (your anon key from Supabase → Settings → API)
   ```

**Commands to apply:**
```bash
# No commands - all manual in Supabase/GitHub UI

# But to verify everything works:
npm run dev

# Visit: http://localhost:5173/#/?/admin
# Try logging in (Supabase will prompt)
# Try uploading a profile picture
# Try uploading a CV file

# If it works locally, it will work on GitHub Pages!
```

---

## 🚀 Complete Step-by-Step Migration Checklist

**For migrating to `jukomol.github.io` repo:**

```bash
# 1. Set up environment
git clone https://github.com/jukomol/jukomol.github.io.git
cd jukomol.github.io
npm install

# 2. Copy files from test-site
cp -r ../test-site/src ./
cp -r ../test-site/public ./
cp ../test-site/vite.config.js ./
cp ../test-site/tailwind.config.js ./
cp ../test-site/postcss.config.js ./
cp ../test-site/package.json ./
cp ../test-site/.github ./
cp ../test-site/404.html ./
cp ../test-site/.env.example ./

# 3. Update base path in vite.config.js
# FROM: base: '/test-site/'
# TO:   base: '/'
nano vite.config.js  # or your favorite editor

# 4. Update segmentCount in 404.html
# FROM: var segmentCount = 1;
# TO:   var segmentCount = 0;
nano 404.html

# 5. Install dependencies
npm install

# 6. Create .env file with Supabase credentials
cp .env.example .env
# Edit .env with your Supabase URL and key
nano .env

# 7. Test locally
npm run dev
# Visit http://localhost:5173
# Test navigation and reload - should work with #/path URLs

# 8. Build
npm run build

# 9. Add GitHub Secrets
# Go to GitHub → Settings → Secrets and variables → Actions
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 10. Set up GitHub Pages
# Go to Settings → Pages
# Source: Deploy from a branch
# Branch: gh-pages

# 11. Commit and push
git add .
git commit -m "Migrate portfolio to main repo with GitHub Pages setup"
git push origin main

# 12. Watch deployment
# Go to Actions tab and check workflow run

# 13. Visit live site
# https://jukomol.github.io

# 14. Set up Supabase (one-time)
# - Create portfolio-assets bucket
# - Add RLS policies (see Issue #8 above)
# - Create database tables (see Issue #8 above)
# - Upload profile picture and CV through admin panel

# 15. Test admin panel
# Visit https://jukomol.github.io/#/?/admin
# Log in and test profile editing
```

---

## ⚡ Quick Reference: Issue vs Fix

| Issue | File | Change |
|-------|------|--------|
| LightningCSS build | `.github/workflows/deploy.yml` | Add build tools, clear cache |
| Wrong workflow | `.github/workflows/deploy.yml` | Add npm install, npm run build |
| Assets not found | `vite.config.js` | Change `base: '/'` to `base: '/path/'` |
| Routes not matching | `src/App.jsx` | Use `HashRouter` without `basename` |
| Module errors | `vite.config.js` | Remove `build.rollupOptions` |
| Files not loading | `src/pages/Home.jsx`, `src/pages/CV.jsx` | Load from Supabase storage |
| Routing breaks on reload | `404.html` | Set correct `segmentCount` |
| Bucket errors | Supabase Dashboard | Create bucket and RLS policies |

---

## 🔍 Verification Checklist

After completing migration:

- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts dev server
- [ ] Navigation works at `http://localhost:5173`
- [ ] Reloading page stays on same route (hash routing)
- [ ] GitHub Actions workflow completes successfully
- [ ] GitHub Pages enabled with `gh-pages` branch
- [ ] Site loads at `https://jukomol.github.io`
- [ ] Navigation works on live site
- [ ] Page reload doesn't break routing
- [ ] Supabase secrets are configured in GitHub
- [ ] Profile/CV can be uploaded through admin panel
- [ ] Profile picture displays on home page
- [ ] CV download works

---

## 📞 Common Issues During Migration

**Problem:** "Cannot find module 'lightningcss'"
**Solution:** Run the workflow and let it build on Linux (don't use npm ci with cache)

**Problem:** "Repository not found" when pushing
**Solution:** Make sure you're in the new repo directory and have push permissions

**Problem:** Assets still not loading
**Solution:** Check browser DevTools → Network tab to see actual asset URLs

**Problem:** Admin login not working
**Solution:** Make sure Supabase secrets are added to GitHub AND .env file exists locally

**Problem:** Files show "Bucket not found" when uploading
**Solution:** Create the `portfolio-assets` bucket and enable public access

---

## 📚 Reference Links

- Supabase Docs: https://supabase.com/docs
- React Router v7: https://reactrouter.com/
- Vite Config: https://vitejs.dev/config/
- GitHub Pages: https://docs.github.com/en/pages
- Tailwind CSS: https://tailwindcss.com/docs

---

**This guide covers all 8 major issues and their solutions. Follow the checklist when migrating to ensure all fixes are applied!**

For questions or issues during migration, refer to the specific issue section above.
