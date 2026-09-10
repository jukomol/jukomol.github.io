import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft } from 'lucide-react'

export default function BlogDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('slug', slug)
            .single()

          if (error || !data) {
            setNotFound(true)
          } else {
            setBlog(data)
          }
        }
      } catch (error) {
        console.error('Error fetching blog:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [slug])

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    )
  }

  if (notFound || !blog) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">Blog post not found</p>
        <button
          onClick={() => navigate('/blog')}
          className="text-cyan-600 hover:text-cyan-800 flex items-center gap-2 font-semibold"
        >
          <ArrowLeft size={20} /> Back to blog
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <button
          onClick={() => navigate('/blog')}
          className="text-cyan-600 hover:text-cyan-800 flex items-center gap-2 mb-8 font-semibold transition"
        >
          <ArrowLeft size={20} /> Back to blog
        </button>

        <article>
          <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">{blog.title}</h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-8 border-b-2 border-cyan-200 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">
                {format(new Date(blog.created_at), 'MMMM dd, yyyy')}
              </span>
              {blog.author && <span className="text-gray-500">by <span className="font-semibold text-gray-700">{blog.author}</span></span>}
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="prose max-w-none text-gray-700">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  )
}
