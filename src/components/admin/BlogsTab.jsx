import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import SimpleMDE from 'easymde'
import 'easymde/dist/easymde.min.css'

export default function BlogsTab() {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editor, setEditor] = useState(null)
  const [message, setMessage] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const contentWatch = watch('content', '')

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    if (showForm && !editor) {
      const element = document.getElementById('blog-editor')
      if (element) {
        const mde = new SimpleMDE({
          element,
          spellChecker: false,
          autoDownloadFontAwesome: true,
          initialValue: contentWatch || ''
        })
        mde.codemirror.on('change', () => {
          setValue('content', mde.value())
        })
        setEditor(mde)
      }
    }

    return () => {
      if (editor && !showForm) {
        editor.toTextArea()
        setEditor(null)
      }
    }
  }, [showForm])

  const fetchBlogs = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false })
        if (data) setItems(data)
      }
    } catch (error) {
      console.error('Error fetching:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setMessage(null)
    try {
      if (!supabase) return

      const slug = generateSlug(data.title)
      const payload = {
        title: data.title,
        author: data.author || null,
        slug,
        content: data.content,
        is_pinned: data.is_pinned || false,
        tags: data.tags
          ?.split(',')
          .map(t => t.trim())
          .filter(t => t) || []
      }

      if (editingId) {
        await supabase.from('blogs').update(payload).eq('id', editingId)
      } else {
        await supabase.from('blogs').insert([payload])
      }

      setMessage({ type: 'success', text: 'Blog saved successfully' })
      fetchBlogs()
      reset()
      setEditingId(null)
      setShowForm(false)
      if (editor) {
        editor.toTextArea()
        setEditor(null)
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (item) => {
    reset({
      title: item.title,
      author: item.author || '',
      content: item.content,
      tags: item.tags?.join(', ') || '',
      is_pinned: item.is_pinned || false
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog?')) return
    try {
      if (supabase) {
        await supabase.from('blogs').delete().eq('id', id)
        fetchBlogs()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingFile(true)
    try {
      if (!supabase) return

      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('portfolio-assets')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(fileName)

      const markdown = `![${file.name}](${publicUrl})`
      if (editor) {
        const currentContent = editor.value()
        editor.value(currentContent + '\n' + markdown + '\n')
        setValue('content', currentContent + '\n' + markdown + '\n')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload file: ' + error.message })
    } finally {
      setUploadingFile(false)
    }
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setShowForm(false)
    if (editor) {
      editor.toTextArea()
      setEditor(null)
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blogs</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 font-semibold"
          >
            <Plus size={20} /> Add Blog
          </button>
        )}
      </div>

      {message && (
        <div className={`flex gap-3 mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-600" />
          ) : (
            <AlertCircle className="text-red-600" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-6 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              {...register('author')}
              placeholder="Your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
            <textarea id="blog-editor"></textarea>
            {errors.content && <p className="text-red-600 text-sm">{errors.content.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploadingFile}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {uploadingFile && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              {...register('tags')}
              placeholder="e.g., AI, Research, Tutorial"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              {...register('is_pinned')}
              type="checkbox"
              id="is_pinned"
              className="w-4 h-4 border border-gray-300 rounded"
            />
            <label htmlFor="is_pinned" className="text-sm font-medium text-gray-700">
              Pin this blog (show as featured)
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 font-semibold"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  {item.is_pinned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Featured</span>}
                </div>
                <p className="text-sm text-gray-600">/{item.slug}</p>
                <p className="text-xs text-gray-500">{format(new Date(item.created_at), 'MMM dd, yyyy')}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
