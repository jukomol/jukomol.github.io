-- Profile table
CREATE TABLE IF NOT EXISTS profile (
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
CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  category TEXT,
  link TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Publications table
CREATE TABLE IF NOT EXISTS publications (
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
CREATE TABLE IF NOT EXISTS cv_timeline (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT,
  description TEXT,
  logo_url TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Storage RLS Policies for portfolio-assets bucket

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

-- Policy 2: Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (SELECT auth.role()) = 'authenticated'
);

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
