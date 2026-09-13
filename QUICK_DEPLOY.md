# Quick Deploy Cheatsheet

Copy-paste commands for fast deployment after code changes.

## 🚀 One-Time Setup (New PC)

```bash
# Clone repo
git clone https://github.com/jukomol/jukomol.github.io.git
cd jukomol.github.io

# Check current branch and switch to main
git branch -a              # See all branches
git checkout main          # Switch to main branch

# Configure git
git config user.name "Your Name"
git config user.email "your-email@example.com"

# Install dependencies
npm install

# Create .env.local with Supabase credentials
# (Get from: https://app.supabase.com → Project Settings → API)
cat > .env.local << EOF
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
EOF

# Test dev server
npm run dev
# Then Ctrl+C to stop
```

---

## 📝 Standard Workflow (Make Changes → Deploy)

### Option 1: Manual Steps (Recommended for Learning)

```bash
# 1. Make code changes in src/ folder
# 2. Test locally
npm run dev

# 3. Commit to main branch
git add -A
git commit -m "Your message here"
git push origin main

# 4. Build for production
npm install
npm run build

# 5. Deploy to gh-pages
git checkout gh-pages
git rm -rf .
cp -r dist/* .
touch .nojekyll
git add .
git commit -m "Deploy updates"
git push origin gh-pages

# 6. Return to main
git checkout main

# ✅ Done! Visit https://jukomol.github.io in 1-2 minutes
```

### Option 2: Automated Deploy Script

Save this as `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "📦 Building..."
npm run build

echo "🚀 Deploying to gh-pages..."
git checkout gh-pages
git rm -rf .
cp -r dist/* .
touch .nojekyll
git add .
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"
git push origin gh-pages

git checkout main
echo "✅ Deployment complete! Visit https://jukomol.github.io"
```

Run it:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 Essential Commands Reference

```bash
# See what changed
git status

# View recent commits
git log --oneline -5

# Check current branch
git branch -v

# Switch branch
git checkout main              # or gh-pages
git checkout -b feature/name   # create new branch

# Stage and commit
git add .                      # or git add path/to/file
git commit -m "message"
git push origin main           # or current branch

# Build and deploy
npm install                    # Install/update dependencies
npm run dev                    # Start dev server (Ctrl+C to stop)
npm run build                  # Build for production

# Emergency: Undo last commit
git reset --soft HEAD~1        # Keep changes
git reset --hard HEAD~1        # Discard changes
```

---

## 🔍 Verify Deployment

```bash
# Check last commit
git log --oneline -1

# Verify build exists
ls dist/

# Verify gh-pages branch
git checkout gh-pages
git log --oneline -1
git checkout main
```

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| `npm command not found` | Install Node.js from nodejs.org |
| `vite not found` | Run `npm install` |
| Changes not showing | Hard refresh: Ctrl+Shift+R, wait 1-2 min |
| `git push` fails | Run `git pull origin main` first |
| Merge conflicts | See DEPLOYMENT_GUIDE.md troubleshooting |

---

## 📂 Project Structure

```
src/
├── pages/              CV, Publications, Blog, Home pages
├── components/admin/   Admin panel (CVTab, NewsTab, etc.)
├── lib/                Supabase config
└── App.jsx            Main app

dist/                  Build output (created by: npm run build)
```

---

## 🔑 Environment Variables

File: `.env.local` (keep secret, don't commit)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Get from Supabase → Project Settings → API

---

## 📱 Typical Session

```bash
# Start
git checkout main
npm run dev

# ... make changes in src/ folder ...

# Finish
npm run build
git add -A && git commit -m "message"
git push origin main

# Deploy (run deploy script or manual steps above)

# ✅ Check https://jukomol.github.io
```

---

**See DEPLOYMENT_GUIDE.md for detailed documentation**
