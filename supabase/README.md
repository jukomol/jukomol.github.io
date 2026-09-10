# Supabase Setup Guide

## Prerequisites
- Supabase account (free tier works fine)
- GitHub repository with secrets configured

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Select your organization
4. Fill in:
   - **Name**: `portfolio` (or your choice)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait for initialization (2-3 minutes)

## Step 2: Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **"Create a new bucket"**
3. Name: `portfolio-assets`
4. Toggle **"Public bucket"** ON
5. Click **"Create bucket"**

## Step 3: Create Database Tables

1. Go to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy the entire contents of `schema.sql` (in this folder)
4. Paste it into the SQL editor
5. Click **"Run"**
6. Done! All tables and policies are created

## Step 4: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon Key** (public key, safe to share)

## Step 5: Configure GitHub Secrets

1. Go to your GitHub repo
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add secret #1:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Paste your Project URL
5. Click **"Add secret"**
6. Add secret #2:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Paste your Anon Key
7. Click **"Add secret"**

## Step 6: Test Locally

1. Create `.env.local` file in project root:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Run dev server:
   ```bash
   npm run dev
   ```

3. Visit admin panel: `http://localhost:5173/#/?/admin`

4. Try to create/edit a blog post - you should see the **Date** field

## Step 7: Upload Files

1. In admin panel, go to any tab (Blogs, News, Publications)
2. Create a new entry
3. Select a custom date
4. Save

Done! Your Supabase is ready! 🎉

---

## Troubleshooting

### "Bucket not found" error
- Check that bucket name is exactly `portfolio-assets`
- Verify bucket is set to Public

### "RLS policy violation"
- Run the schema.sql file again to create policies
- Ensure you're logged in as authenticated user in admin panel

### Dates not saving
- Check browser console for errors
- Verify Supabase secrets are correct
- Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set

### Admin login not working
- Supabase will email you a magic link
- Check spam folder if not in inbox
- Make sure you're using the correct Supabase project

## Default Tables

### `blogs`
- `id` - Auto-generated
- `title` - Blog post title
- `slug` - URL-friendly slug
- `content` - Markdown content
- `author` - Author name
- `tags` - Array of tags
- `is_pinned` - Featured flag
- `created_at` - Publication date (user-selectable now!)

### `news`
- `id` - Auto-generated
- `content` - News content
- `date` - News date (user-selectable now!)
- `category` - News category
- `link` - Optional external link

### `publications`
- `id` - Auto-generated
- `title` - Paper title
- `authors` - Author names
- `venue` - Journal/Conference name
- `date` - Publication date (user-selectable now!)
- `link` - Optional DOI/Link

### `cv_timeline`
- `id` - Auto-generated
- `title` - Position/Project title
- `organization` - Company/University
- `category` - Education, Experience, Projects, etc.
- `description` - Details
- `logo_url` - Organization logo
- `start_date` - Start date (user-selectable)
- `end_date` - End date (optional, user-selectable)

### `profile`
- `id` - Auto-generated
- `name` - Your name
- `current_position` - Current role
- `bio` - Biography
- `affiliation` - Current affiliation
- `email` - Contact email
- `research_interests` - Array of interests
- `social_links` - JSON object with social media links

---

## Date Selection Feature

All forms now support **date picker** for posts/updates:

- **Blogs** - Select publication date
- **News** - Select news date
- **Publications** - Select publication date
- **CV Timeline** - Select start and end dates

No more auto-generated "now" dates! 📅
