# Academic Portfolio Website

A modern, responsive academic portfolio website built with React, Vite, and Tailwind CSS, with Supabase backend for content management and GitHub Pages deployment.

**Live Demo:** https://jukomol.github.io/test-site/

## Features

✨ **Modern Design**
- Responsive dark/light design
- Tailwind CSS for styling
- Smooth navigation with React Router

📄 **Portfolio Sections**
- Home with profile picture and research interests
- CV page with timeline view
- Blog system with individual post pages
- Publications showcase
- Social media links integration

🔐 **Admin Panel**
- Secure login with Supabase authentication
- Edit profile information
- Manage CV and profile picture uploads
- Add/edit blog posts, news, publications
- All data stored in Supabase

☁️ **Cloud Backend**
- Supabase for database and authentication
- Storage for profile pictures and documents
- Automatic GitHub Pages deployment via GitHub Actions

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **GitHub Account** - [Create one](https://github.com/signup)
- **Supabase Account** - [Create one](https://supabase.com) (free tier available)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jukomol/test-site.git
cd test-site
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root (or use `.env.local`):

```bash
# Copy the example
cp .env.example .env

# Edit .env with your Supabase credentials (see Supabase Setup section below)
```

The `.env` file should contain:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important:** Never commit `.env` to Git! It's already in `.gitignore`.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser. The site will hot-reload as you make changes.

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create
4. Wait for project initialization (takes 1-2 minutes)

### 2. Get Your Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (starts with `https://`)
   - **Anon Key** (public API key)
3. Paste into your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Create a new query and paste this SQL:

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

3. Click **Run** to execute

### 4. Set Up Storage Bucket

1. Go to **Storage** in Supabase
2. Click **Create a new bucket**
3. Name it: `portfolio-assets`
4. **Toggle "Public bucket"** to enable public access
5. Click **Create bucket**

### 5. Create Storage Policies (RLS)

Go to **Storage** → **portfolio-assets** → **Policies** tab

Create these four policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (SELECT auth.role()) = 'authenticated'
);
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');
```

**Policy 3: Allow authenticated users to update**
```sql
CREATE POLICY "Allow authenticated users to update"
ON storage.objects FOR UPDATE
WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (SELECT auth.role()) = 'authenticated'
);
```

**Policy 4: Allow authenticated users to delete**
```sql
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'portfolio-assets'
    AND (SELECT auth.role()) = 'authenticated'
);
```

## GitHub Pages Deployment

### 1. Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

```
Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: your-anon-key-here
```

⚠️ These secrets are encrypted and never exposed in logs.

### 2. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` (auto-created by workflow)
3. Click **Save**

### 3. Deploy

The site automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Update portfolio content"
git push origin main
```

**Deployment process:**
1. ✅ GitHub Actions workflow triggers
2. ✅ Installs dependencies
3. ✅ Builds the app
4. ✅ Deploys to `gh-pages` branch
5. ✅ Site available at `https://username.github.io/test-site/`

Check deployment status: **Actions** tab → Latest workflow run

## Customization Guide

### Update Your Profile

1. **Local admin panel:** Visit `http://localhost:5173/#/?/admin`
2. **Live site admin:** Visit `https://username.github.io/test-site/#/?/admin`
3. Log in with your Supabase credentials
4. Go to **Profile** tab:
   - Upload profile picture (JPG/PNG)
   - Edit name, position, bio, affiliation
   - Add social media links
   - Add research interests

### Add Blog Posts

1. In admin panel, go to **Blogs** tab
2. Click **Add Post**
3. Fill in:
   - **Title:** Blog post title
   - **Slug:** URL-friendly identifier (e.g., `my-research-findings`)
   - **Content:** Markdown or HTML
   - **Date:** Publication date
   - **Category:** Topic category
4. Click **Save**

View at: `https://username.github.io/test-site/#/?/blog/slug`

### Add Publications

1. Go to **Publications** tab
2. Fill in:
   - **Title:** Paper title
   - **Authors:** Author list
   - **Venue:** Conference/Journal name
   - **Date:** Publication year
   - **Link:** URL to paper
3. Click **Save**

### Upload CV

1. Go to **Profile** tab
2. Scroll to **CV File Upload**
3. Upload PDF file (saves as `cv-latest.pdf` in storage)

The download link on `/cv` page will update automatically.

### Customize Colors & Styling

Edit [tailwind.config.js](tailwind.config.js) to change the color scheme:

```javascript
theme: {
  colors: {
    cyan: '#06b6d4',  // Primary color (change this)
    // ... other colors
  }
}
```

Common places to customize:
- `src/components/Layout.jsx` - Navigation bar
- `src/pages/Home.jsx` - Hero section
- `src/index.css` - Global styles

### Customize Content Text

Edit fallback content in [src/lib/supabase.js](src/lib/supabase.js):

```javascript
export const FALLBACK_PROFILE = {
  name: 'Your Name',
  bio: 'Your bio here',
  affiliation: 'Your affiliation',
  // ...
}
```

## Project Structure

```
test-site/
├── src/
│   ├── pages/           # Page components (Home, CV, Blog, etc.)
│   ├── components/      # Reusable components
│   │   ├── admin/       # Admin panel components
│   │   └── Layout.jsx   # Navigation & layout
│   ├── lib/
│   │   └── supabase.js  # Supabase client configuration
│   ├── App.jsx          # Main app routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions workflow
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── 404.html             # GitHub Pages SPA routing
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Troubleshooting

### Site shows blank page

**Symptoms:** Page loads but nothing appears

**Solutions:**
1. Check browser console for errors (F12 → Console)
2. Verify `.env` file has correct Supabase credentials
3. Clear browser cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R)
4. Run `npm install` to ensure all dependencies installed

### Profile picture not showing

**Symptoms:** Profile picture displays as placeholder circle

**Solutions:**
1. Upload image to Supabase Storage (`portfolio-assets/profile.jpg`)
2. Ensure image is JPG or PNG format
3. Check that RLS policies are created (see Supabase Setup)
4. Try uploading through admin panel instead of manual upload

### CV download not working

**Symptoms:** CV button doesn't download file

**Solutions:**
1. Upload PDF file named `cv-latest.pdf` to `portfolio-assets` bucket
2. Check Supabase Storage policies are enabled
3. Verify file is less than 50MB
4. Try with different PDF (some may be corrupted)

### GitHub Pages shows 404

**Symptoms:** Site at `https://username.github.io/test-site/` returns 404

**Solutions:**
1. Go to repository **Settings** → **Pages**
2. Ensure **gh-pages** branch is selected as deployment source
3. Check **Actions** tab for failed deployments
4. Verify GitHub Secrets are set correctly
5. Try Manual deploy: Go to **Actions** → **Deploy GitHub Pages** → **Run workflow**

### Navigation breaks on page reload

**Symptoms:** Clicking links works, but reloading page loses route

**Solutions:**
1. This is normal for GitHub Pages (hash-based routing)
2. URLs will have `#/?/` in them (e.g., `/#/?/cv`)
3. If experiencing issues, check browser console for routing errors

## Technologies Used

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** GitHub Pages + GitHub Actions
- **Form Management:** React Hook Form
- **Date Formatting:** date-fns
- **Markdown:** React Markdown
- **Icons:** Lucide React

## Contributing

To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and commit: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the ISC License - see [package.json](package.json) for details.

## Support

For issues or questions:
- Check **Troubleshooting** section above
- Search [existing GitHub issues](https://github.com/jukomol/test-site/issues)
- Create a [new issue](https://github.com/jukomol/test-site/issues/new) with details

## Environment Variables Reference

`.env` file variables (never commit to Git):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |

Get these from Supabase → **Settings** → **API**

## Quick Start Checklist

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create Supabase project
- [ ] Add environment variables to `.env`
- [ ] Create database tables (SQL)
- [ ] Create storage bucket
- [ ] Add RLS policies
- [ ] Configure GitHub Secrets
- [ ] Enable GitHub Pages
- [ ] Test local development: `npm run dev`
- [ ] Push to GitHub and watch deployment
- [ ] Visit live site
- [ ] Upload profile picture and CV
- [ ] Customize profile in admin panel
- [ ] Done! 🎉

---

**Last Updated:** September 10, 2026

For the latest version, visit: https://github.com/jukomol/test-site
