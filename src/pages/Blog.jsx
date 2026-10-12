import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { Search } from 'lucide-react'

const SUMMARY_CHARS = 320

function getExcerpt(content, title) {
  const lines = content
    .replace(/```[\s\S]*?(```|$)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('|') && !/^([-*_]\s*){3,}$/.test(line))
    .map(line => line.replace(/^#{1,6}\s+/, '').replace(/^>\s?/, '').replace(/^([-*+]|\d+[.)])\s+(\[[ xX]\]\s+)?/, ''))
  if (lines[0] && lines[0].toLowerCase() === title.trim().toLowerCase()) lines.shift()
  const text = lines
    .join(' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/(\*\*|__|~~|`)/g, '')
    .replace(/(^|\s)[*_](\S[^*_]*?)[*_](?=\s|[.,;:!?]|$)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= SUMMARY_CHARS) return text
  const cut = text.slice(0, SUMMARY_CHARS)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : SUMMARY_CHARS)}…`
}

function BlogCard({ blog, featured = false }) {
  const excerpt = getExcerpt(blog.content || '', blog.title || '')
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className={`flex min-w-0 flex-col rounded-lg p-6 transition ${
        featured
          ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-500 hover:shadow-xl'
          : 'bg-white border-2 border-gray-200 hover:shadow-lg hover:border-cyan-300'
      }`}
    >
      <h3 className={`font-bold leading-8 text-slate-900 mb-2 truncate ${featured ? 'text-2xl' : 'text-xl'}`} title={blog.title}>
        {blog.title}
      </h3>
      <div className="flex items-center gap-2 mb-3 text-sm whitespace-nowrap overflow-hidden">
        <span className="text-gray-600 font-medium">{format(new Date(blog.created_at), 'MMMM dd, yyyy')}</span>
        {blog.author && <span className="text-gray-500 truncate">by {blog.author}</span>}
      </div>
      <p className="text-gray-700 text-[15px] leading-6 line-clamp-3 h-18 mb-4">{excerpt}</p>
      <div className="flex gap-2 h-6 overflow-hidden">
        {blog.tags?.map((tag, idx) => (
          <span
            key={idx}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
              featured ? 'bg-cyan-200 text-cyan-800 font-semibold' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}

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
              {pinnedBlogs.map(blog => <BlogCard key={blog.id} blog={blog} featured />)}
            </div>
          </div>
        )}

        {/* Regular Blogs */}
        <div>
          {pinnedBlogs.length > 0 && <h2 className="text-2xl font-bold mb-6 text-slate-900 font-semibold">All Articles</h2>}
          {regularBlogs.length > 0 ? (
            <div className="grid gap-6">
              {regularBlogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
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
