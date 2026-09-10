import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function NewsTab() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('date', { ascending: false })
        if (data) setItems(data)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (!supabase) return

      const dateISO = data.date ? new Date(data.date).toISOString() : new Date().toISOString()
      const payload = {
        content: data.content,
        category: data.category || null,
        link: data.link || null,
        date: dateISO
      }

      if (editingId) {
        await supabase.from('news').update(payload).eq('id', editingId)
      } else {
        await supabase.from('news').insert([payload])
      }

      fetchNews()
      reset()
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    const dateStr = item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    reset({
      content: item.content,
      category: item.category || '',
      link: item.link || '',
      date: dateStr
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this news item?')) return
    try {
      if (supabase) {
        await supabase.from('news').delete().eq('id', id)
        fetchNews()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">News</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 font-semibold"
          >
            <Plus size={20} /> Add News
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-6 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.content && <p className="text-red-600 text-sm">{errors.content.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              {...register('category')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
            <input
              {...register('link')}
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              {...register('date')}
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
            <div className="flex-1">
              <p className="text-gray-600 text-sm mb-1">{format(new Date(item.date), 'MMM dd, yyyy')}</p>
              <p className="text-gray-900 mb-2">{item.content}</p>
              {item.category && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{item.category}</span>}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
