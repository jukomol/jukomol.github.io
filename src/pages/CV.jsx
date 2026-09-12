import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { Download, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'

export default function CV() {
  const [timeline, setTimeline] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (supabase) {
          const [timelineRes, profileRes] = await Promise.all([
            supabase.from('cv_timeline').select('*').order('start_date', { ascending: false }),
            supabase.from('profile').select('professional_summary').single()
          ])

          if (timelineRes.error) throw timelineRes.error
          if (timelineRes.data) setTimeline(timelineRes.data)

          if (profileRes.data) setProfile(profileRes.data)
        }
      } catch (error) {
        console.error('Error fetching CV data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const groupedByCategory = timeline.reduce((acc, item) => {
    const cat = item.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold text-slate-900">Curriculum Vitae</h1>
            <p className="text-gray-600 mt-2">PhD Student & Graduate Research Assistant</p>
          </div>
          <a
            href={`${supabase?.storage.from('portfolio-assets').getPublicUrl('cv-latest.pdf').data.publicUrl || '/Jahir_Uddin_CV.pdf'}`}
            download="Jahir_Uddin_CV.pdf"
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition flex items-center gap-2 font-semibold"
          >
            <Download size={20} /> Download Full CV
          </a>
        </div>

        {/* Professional Summary */}
        {profile?.professional_summary && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Professional Summary</h2>
            <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{profile.professional_summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {timeline.length > 0 && Object.entries(groupedByCategory).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-8 capitalize text-slate-900 border-b-2 border-cyan-500 pb-3 font-semibold">
              {category}
            </h2>

            <div className="relative pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>

              {items.map((item, idx) => (
                <div key={item.id} className="mb-8 relative">
                  <div className="absolute -left-5 top-2 w-3 h-3 bg-cyan-500 rounded-full border-4 border-white shadow-md"></div>

                  <div className="bg-white border border-cyan-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-cyan-600 font-medium">{item.organization}</p>
                      </div>
                      <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                        {item.start_date && format(new Date(item.start_date), 'MMM yyyy')}
                        {item.end_date && ` - ${format(new Date(item.end_date), 'MMM yyyy')}`}
                        {!item.end_date && item.start_date && ' - Present'}
                      </span>
                    </div>
                    {item.description && (
                      <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown>{item.description}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {timeline.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-gray-600 text-lg mb-4">No timeline data available yet</p>
            <p className="text-gray-500">CV timeline entries will appear here once added through the admin panel.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading CV data...</p>
          </div>
        )}
      </div>
    </div>
  )
}
