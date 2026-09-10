-- ACADEMIC PORTFOLIO SUPABASE SCHEMA
-- Updated with all profile, CV, news, publications, and blog management features
--
-- SETUP INSTRUCTIONS:
-- 1. Go to your Supabase project SQL Editor
-- 2. Create a new query and paste this entire script
-- 3. Execute all queries
-- 4. Navigate to Storage and create a new public bucket named "portfolio-assets"
-- 5. Copy the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from project settings
-- 6. Create a .env.local file with these credentials
--
-- TABLE OVERVIEW:
-- - profile: Personal information, bio, contact details, social links, research interests
-- - news: Recent news/updates with dates and categories
-- - publications: Academic publications with authors, venue, and links
-- - cv_timeline: CV entries (experience, education, projects, etc.) with logo support
-- - blogs: Blog posts with markdown content, tags, and pinned status

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILE TABLE
-- =====================================================
-- Stores personal/professional information, social links, and contact details
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  name TEXT NOT NULL,
  current_position TEXT, -- e.g., "PhD Student", "Research Assistant", "Postdoctoral Fellow"
  bio TEXT,
  affiliation TEXT,

  -- Contact Information
  email TEXT,
  address TEXT,

  -- Professional Information
  research_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  social_links JSONB DEFAULT '{}'::JSONB, -- Contains: github_url, linkedin_url, twitter_url, scholar_url, orcid_url

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NEWS TABLE
-- =====================================================
-- Recent news, updates, and announcements
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  date TIMESTAMPTZ DEFAULT NOW(),
  content TEXT NOT NULL,
  category TEXT,
  link TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PUBLICATIONS TABLE
-- =====================================================
-- Academic publications, papers, and research outputs
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Publication Information
  date TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  venue TEXT NOT NULL,
  link TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CV_TIMELINE TABLE
-- =====================================================
-- CV entries: experience, education, projects, achievements, licenses, etc.
-- Supports custom categories and logo uploads
CREATE TABLE IF NOT EXISTS cv_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Timeline Information
  start_date DATE,
  end_date DATE, -- Optional, leave NULL for current/ongoing

  -- Content
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT, -- Examples: 'Experience', 'Education', 'Projects', 'Achievements', 'Licenses', etc.
  description TEXT,

  -- Logo/Image
  logo_url TEXT, -- Stored in 'portfolio-assets' bucket

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BLOGS TABLE
-- =====================================================
-- Blog posts with markdown content, tags, and pinning capability
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Blog Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  content TEXT NOT NULL, -- Markdown format
  author TEXT, -- Blog post author name

  -- Settings
  is_pinned BOOLEAN DEFAULT FALSE, -- Pin important posts to top
  tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- Post categories/tags

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ POLICIES (Allow anyone to view content)
-- =====================================================
CREATE POLICY "Allow public read on profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Allow public read on news" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public read on publications" ON publications FOR SELECT USING (true);
CREATE POLICY "Allow public read on cv_timeline" ON cv_timeline FOR SELECT USING (true);
CREATE POLICY "Allow public read on blogs" ON blogs FOR SELECT USING (true);

-- =====================================================
-- AUTHENTICATED WRITE POLICIES (Admin only)
-- =====================================================
-- Profile policies
CREATE POLICY "Allow authenticated insert on profile" ON profile FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on profile" ON profile FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on profile" ON profile FOR DELETE USING (auth.role() = 'authenticated');

-- News policies
CREATE POLICY "Allow authenticated insert on news" ON news FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on news" ON news FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on news" ON news FOR DELETE USING (auth.role() = 'authenticated');

-- Publications policies
CREATE POLICY "Allow authenticated insert on publications" ON publications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on publications" ON publications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on publications" ON publications FOR DELETE USING (auth.role() = 'authenticated');

-- CV Timeline policies
CREATE POLICY "Allow authenticated insert on cv_timeline" ON cv_timeline FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on cv_timeline" ON cv_timeline FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on cv_timeline" ON cv_timeline FOR DELETE USING (auth.role() = 'authenticated');

-- Blogs policies
CREATE POLICY "Allow authenticated insert on blogs" ON blogs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on blogs" ON blogs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on blogs" ON blogs FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE CONFIGURATION
-- =====================================================
-- Run this separately in Storage section:
-- 1. Create new bucket: "portfolio-assets"
-- 2. Make bucket PUBLIC
-- 3. Set bucket policy to allow authenticated uploads
--
-- Objects stored:
-- - profile.jpg / profile.png (profile picture)
-- - cv-*.pdf (CV files)
-- - logo-{entryId}.jpg / logo-{entryId}.png (CV entry logos)

-- =====================================================
-- SAMPLE DATA (OPTIONAL - comment out if not needed)
-- =====================================================
-- Uncomment and run separately to add sample data

-- INSERT INTO profile (name, affiliation, bio, email, address, research_interests, social_links)
-- VALUES (
--   'Your Name',
--   'University Affiliation',
--   'Your professional bio here',
--   'your.email@example.com',
--   'Omaha, Nebraska',
--   ARRAY['AI', 'Machine Learning', 'Computer Vision'],
--   '{"github_url": "https://github.com/username", "linkedin_url": "https://linkedin.com/in/username"}'::JSONB
-- );

-- INSERT INTO cv_timeline (title, organization, category, start_date, end_date, description)
-- VALUES (
--   'PhD Student',
--   'University of Nebraska Medical Center',
--   'Education',
--   '2022-01-01'::DATE,
--   NULL,
--   'Pursuing PhD in Human Factors Engineering'
-- );

-- =====================================================
-- USEFUL QUERIES
-- =====================================================
-- Get all CV entries by category:
-- SELECT category, COUNT(*) as count FROM cv_timeline GROUP BY category ORDER BY category;

-- Get published papers:
-- SELECT title, authors, venue, date FROM publications ORDER BY date DESC;

-- Get recent news:
-- SELECT content, category, date FROM news ORDER BY date DESC LIMIT 5;

-- Get pinned blog posts:
-- SELECT title, slug, created_at FROM blogs WHERE is_pinned = true ORDER BY created_at DESC;
