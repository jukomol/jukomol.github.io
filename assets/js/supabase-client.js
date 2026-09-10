// Supabase client initialization
const SUPABASE_URL = 'https://ctavbergopvzeqnxrbbo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0YXZiZXJnb3B2emVxbnhyYmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTQzMzIsImV4cCI6MjEwNDU5MDMzMn0.19N6SSYdigteGL1DdAfZd-_g82AAxJolioH5O6uFHBU';

let supabase = null;

// Get or initialize Supabase client
async function getSupabaseClient() {
  if (supabase) return supabase;

  if (!window.supabase) {
    throw new Error('Supabase library not loaded. Make sure @supabase/supabase-js is loaded before calling this function.');
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

// Fetch functions for various data types
async function fetchProfile() {
  const client = await getSupabaseClient();
  const { data, error } = await client.from('profile').select('*').single();
  if (error) console.error('Error fetching profile:', error);
  return data;
}

async function fetchContact() {
  const client = await getSupabaseClient();
  const { data, error } = await client.from('contact').select('*').single();
  if (error) console.error('Error fetching contact:', error);
  return data;
}

async function fetchPublications() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('publications')
    .select('*')
    .order('date', { ascending: false });
  if (error) console.error('Error fetching publications:', error);
  return data || [];
}

async function fetchTalks() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('talks')
    .select('*')
    .order('date', { ascending: false });
  if (error) console.error('Error fetching talks:', error);
  return data || [];
}

async function fetchResources() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('resources')
    .select('*')
    .order('date', { ascending: false });
  if (error) console.error('Error fetching resources:', error);
  return data || [];
}

async function fetchProjects() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('Error fetching projects:', error);
  return data || [];
}

async function fetchServices() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('services')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) console.error('Error fetching services:', error);
  return data || [];
}

async function fetchPosts() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('posts')
    .select('*')
    .order('date', { ascending: false });
  if (error) console.error('Error fetching posts:', error);
  return data || [];
}

async function fetchNews() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('news')
    .select('*')
    .order('date', { ascending: false });
  if (error) console.error('Error fetching news:', error);
  return data || [];
}

async function fetchCVEntries() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('cv_entries')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) console.error('Error fetching CV entries:', error);
  return data || [];
}

async function fetchPageSettings() {
  const client = await getSupabaseClient();
  const { data, error } = await client.from('page_settings').select('*');
  if (error) console.error('Error fetching page settings:', error);
  return data || [];
}

async function isPagePublic(pageKey) {
  const settings = await fetchPageSettings();
  const page = settings.find(p => p.page_key === pageKey);
  return page ? page.is_public : true;
}

// Auth functions
async function getCurrentUser() {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return data?.user || null;
}

async function signInWithGithub() {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin + '/pages/admin/'
    }
  });
  if (error) console.error('Sign in error:', error);
  return data;
}

async function signOut() {
  const client = await getSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) console.error('Sign out error:', error);
  return !error;
}

// Check if user is admin
async function isUserAdmin(userId) {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .single();
  return !!data && !error;
}

// Simple markdown to HTML converter
function simpleMarkdownToHtml(text) {
  if (!text) return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  html = '<p>' + html + '</p>';
  return html;
}
