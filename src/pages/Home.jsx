import { useEffect, useState } from 'react'
import { supabase, FALLBACK_PROFILE } from '../lib/supabase'
import { format } from 'date-fns'
import { ExternalLink, Mail, MapPin } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [profile, setProfile] = useState(FALLBACK_PROFILE)
  const [news, setNews] = useState([])
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (supabase) {
          const [profileRes, newsRes, pubRes] = await Promise.all([
            supabase.from('profile').select('*').single(),
            supabase.from('news').select('*').order('date', { ascending: false }).limit(5),
            supabase.from('publications').select('*').order('date', { ascending: false }).limit(5)
          ])

          if (profileRes.data) setProfile(profileRes.data)
          if (newsRes.data) setNews(newsRes.data)
          if (pubRes.data) setPublications(pubRes.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start items-center gap-12">
            <div className="flex-1 flex flex-col items-center">
              <img
                src={`${supabase?.storage.from('portfolio-assets').getPublicUrl('profile.jpg').data.publicUrl || '/profile.jpg'}`}
                alt={profile.name}
                className="w-56 h-56 rounded-full object-cover border-4 border-cyan-500 shadow-lg mb-6"
                onError={(e) => e.target.src = '/profile.jpg'}
              />

              {/* Social Links */}
              <div className="flex gap-3 mb-6 flex-wrap justify-center">
                {profile.social_links?.github_url && (
                  <a href={profile.social_links.github_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-full transition duration-200 shadow-md hover:shadow-lg" title="GitHub">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                )}
                {profile.social_links?.linkedin_url && (
                  <a href={profile.social_links.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-full transition duration-200 shadow-md hover:shadow-lg" title="LinkedIn">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                  </a>
                )}
                {profile.social_links?.twitter_url && (
                  <a href={profile.social_links.twitter_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-full transition duration-200 shadow-md hover:shadow-lg" title="X (Twitter)">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                )}
                {profile.social_links?.scholar_url && (
                  <a href={profile.social_links.scholar_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-full transition duration-200 shadow-md hover:shadow-lg text-white font-bold flex items-center justify-center" title="Google Scholar">
                    G
                  </a>
                )}
                {profile.social_links?.orcid_url && (
                  <a href={profile.social_links.orcid_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-full transition duration-200 shadow-md hover:shadow-lg text-white font-bold flex items-center justify-center" title="ORCID">
                    O
                  </a>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex flex-col items-center gap-3 text-gray-300">
                {profile.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-cyan-400" />
                    <span>{profile.address}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={20} className="text-cyan-400" />
                    <a href={`mailto:${profile.email}`} className="hover:text-cyan-400 transition">
                      {profile.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-2">{profile.name}</h1>
              {profile.current_position && (
                <p className="text-2xl text-cyan-400 mb-4 font-semibold">{profile.current_position}</p>
              )}
              <p className="text-xl text-gray-400 mb-4 font-semibold">{profile.affiliation}</p>
              <p className="text-gray-300 mb-6 leading-relaxed text-lg">{profile.bio}</p>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-400 mb-3">Research Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.research_interests?.map((interest, idx) => (
                    <span key={idx} className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-full text-sm transition">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent News Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Recent News</h2>
          {news.length > 0 ? (
            <div className="grid gap-6">
              {news.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-cyan-500 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-500">
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </p>
                    {item.category && (
                      <span className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-semibold">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 mb-2 prose prose-sm max-w-none">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-800 flex items-center gap-2 font-medium">
                      Learn more <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 text-lg">No news available yet</p>
              <p className="text-gray-500 mt-2">Check back later for updates</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Publications Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Recent Publications</h2>
          {publications.length > 0 ? (
            <div className="grid gap-6">
              {publications.map(pub => (
                <div key={pub.id} className="bg-slate-50 p-6 rounded-lg shadow-md border-l-4 border-cyan-600 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">{pub.title}</h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {format(new Date(pub.date), 'yyyy')}
                    </span>
                  </div>
                  <div className="text-gray-700 mb-2 font-medium prose prose-sm max-w-none">
                    <ReactMarkdown>{pub.authors}</ReactMarkdown>
                  </div>
                  <div className="text-gray-600 italic mb-3 prose prose-sm max-w-none">
                    <ReactMarkdown>{pub.venue}</ReactMarkdown>
                  </div>
                  {pub.link && (
                    <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-800 flex items-center gap-2 font-medium">
                      Read paper <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-gray-600 text-lg">No publications available yet</p>
              <p className="text-gray-500 mt-2">Check back later for research publications</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
