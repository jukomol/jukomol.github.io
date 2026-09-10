import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Publications() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('publications')
            .select('*')
            .order('date', { ascending: false })

          if (error) throw error
          if (data) setPublications(data)
        }
      } catch (error) {
        console.error('Error fetching publications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPublications()
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-12 text-slate-900">Publications</h1>

        {publications.length > 0 ? (
          <div className="space-y-6">
            {publications.map(pub => (
              <div key={pub.id} className="border-l-4 border-cyan-600 pl-6 py-4">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-3">
                  <h3 className="text-2xl font-bold text-slate-900 flex-1">{pub.title}</h3>
                  <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                    {format(new Date(pub.date), 'yyyy')}
                  </span>
                </div>

                <div className="text-gray-700 mb-2">
                  <span className="font-semibold">Authors:</span>
                  <div className="mt-1 ml-0">
                    <ReactMarkdown>{pub.authors}</ReactMarkdown>
                  </div>
                </div>

                <div className="text-gray-600 italic mb-4">
                  <span className="font-semibold">Venue:</span>
                  <div className="mt-1 ml-0 not-italic">
                    <ReactMarkdown>{pub.venue}</ReactMarkdown>
                  </div>
                </div>

                {pub.link && (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-800 font-semibold transition"
                  >
                    Read paper <ExternalLink size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-gray-600 text-lg mb-2">No publications yet</p>
            <p className="text-gray-500">Publications will appear here once added through the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  )
}
