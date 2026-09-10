import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function PublicationsTab() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchPublications()
  }, [])

  const fetchPublications = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('publications')
          .select('*')
          .order('date', { ascending: false })
        if (data) setItems(data)
      }
    } catch (error) {
      console.error('Error fetching:', error)
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
        title: data.title,
        authors: data.authors,
        venue: data.venue,
        link: data.link || null,
        date: dateISO
      }

      if (editingId) {
        await supabase.from('publications').update(payload).eq('id', editingId)
      } else {
        await supabase.from('publications').insert([payload])
      }

      fetchPublications()
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
      title: item.title,
      authors: item.authors,
      venue: item.venue,
      link: item.link || '',
      date: dateStr
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this publication?')) return
    try {
      if (supabase) {
        await supabase.from('publications').delete().eq('id', id)
        fetchPublications()
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
        <h2 className="text-2xl font-bold">Publications</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 font-semibold"
          >
            <Plus size={20} /> Add Publication
          </button>
        )}
      </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Authors (Markdown supported)</label>
            <input
              {...register('authors', { required: 'Authors are required' })}
              placeholder="e.g., John Doe, **Jane Smith**, [Author](link)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Tip: Use **text** for bold, *text* for italic, [link](url) for links</p>
            {errors.authors && <p className="text-red-600 text-sm">{errors.authors.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue (Markdown supported)</label>
            <input
              {...register('venue', { required: 'Venue is required' })}
              placeholder="e.g., *Journal of Examples*, 2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Tip: Use formatting for journal names and styling</p>
            {errors.venue && <p className="text-red-600 text-sm">{errors.venue.message}</p>}
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
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{item.authors}</p>
            <p className="text-sm italic text-gray-500">{item.venue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
