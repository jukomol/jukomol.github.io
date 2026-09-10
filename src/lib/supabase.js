import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using fallback data.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const FALLBACK_PROFILE = {
  name: 'Jahir Uddin',
  bio: 'PhD Student and Graduate Research Assistant',
  affiliation: 'University of Nebraska Medical Center (Dept. of Environmental, Agricultural, and Occupational Health)',
  research_interests: ['Physical AI', 'Human Factor Engineering', 'Computer Vision', 'UAV', 'Human Machine Interaction', 'Robotics'],
  social_links: {}
}
