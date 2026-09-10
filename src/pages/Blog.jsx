import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { Search } from 'lucide-react'

export default function Blog() {
  const [blogs, setBlogs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) throw error
          if (data) setBlogs(data)
        }
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const searchLower = searchTerm.toLowerCase()
      return (
        blog.title.toLowerCase().includes(searchLower) ||
        (blog.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false)
      )
    })
  }, [blogs, searchTerm])

  const pinnedBlogs = filteredBlogs.filter(b => b.is_pinned)
  const regularBlogs = filteredBlogs.filter(b => !b.is_pinned)

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-8 text-slate-900">Blog</h1>

        <div className="mb-8 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
          />
        </div>

        {/* Pinned Blogs */}
        {pinnedBlogs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-cyan-600 font-semibold">✨ Featured Articles</h2>
            <div className="grid gap-6">
              {pinnedBlogs.map(blog => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug}`}
                  className="block bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-500 rounded-lg p-6 hover:shadow-xl transition hover:scale-105 transform"
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{blog.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm text-gray-600 font-medium">
                      {format(new Date(blog.created_at), 'MMMM dd, yyyy')}
                    </p>
                    {blog.author && <p className="text-sm text-gray-500">by {blog.author}</p>}
                  </div>
                  <p className="text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                    {blog.content.substring(0, 150)}...
                  </p>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-cyan-200 text-cyan-800 px-3 py-1 rounded-full font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Blogs */}
        <div>
          {pinnedBlogs.length > 0 && <h2 className="text-2xl font-bold mb-6 text-slate-900 font-semibold">All Articles</h2>}
          {regularBlogs.length > 0 ? (
            <div className="grid gap-6">
              {regularBlogs.map(blog => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug}`}
                  className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-cyan-300 transition"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{blog.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm text-gray-600 font-medium">
                      {format(new Date(blog.created_at), 'MMMM dd, yyyy')}
                    </p>
                    {blog.author && <p className="text-sm text-gray-500">by {blog.author}</p>}
                  </div>
                  <p className="text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                    {blog.content.substring(0, 150)}...
                  </p>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-gray-600 text-lg">No blogs found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or check back later for new articles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
