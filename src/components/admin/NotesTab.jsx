import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Trash2, Plus, Pin, PinOff, AlertCircle, CheckCircle } from 'lucide-react'

const NOTE_COLORS = {
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-200' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-200' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-300', badge: 'bg-pink-200' },
  green: { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-200' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-200' },
}

export default function NotesTab() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: '', content: '', color: 'yellow' })

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('pinned', { ascending: false })
          .order('updated_at', { ascending: false })

        if (error) throw error
        setNotes(data || [])
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load notes: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required' })
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: formData.title,
            content: formData.content,
            color: formData.color,
            updated_at: new Date(),
          })
          .eq('id', editingId)

        if (error) throw error
        setMessage({ type: 'success', text: 'Note updated successfully' })
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{
            title: formData.title,
            content: formData.content,
            color: formData.color,
          }])

        if (error) throw error
        setMessage({ type: 'success', text: 'Note created successfully' })
      }

      setFormData({ title: '', content: '', color: 'yellow' })
      setEditingId(null)
      await fetchNotes()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save note: ' + error.message })
    }
  }

  const handleEdit = (note) => {
    setEditingId(note.id)
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color,
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Note deleted' })
      await fetchNotes()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete note: ' + error.message })
    }
  }

  const handlePin = async (id, isPinned) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ pinned: !isPinned })
        .eq('id', id)

      if (error) throw error
      await fetchNotes()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update note' })
    }
  }

  if (loading) return <p className="text-gray-500">Loading notes...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Personal Notes</h2>

      {message && (
        <div className={`flex gap-3 mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Notes Grid */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Your Notes ({notes.length})</h3>
          {notes.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {notes.map(note => {
                const colors = NOTE_COLORS[note.color] || NOTE_COLORS.yellow
                return (
                  <div
                    key={note.id}
                    className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4 relative group hover:shadow-lg transition`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 flex-1 pr-2 line-clamp-2">{note.title}</h4>
                      <button
                        onClick={() => handlePin(note.id, note.pinned)}
                        className="p-1 text-gray-500 hover:bg-white rounded opacity-0 group-hover:opacity-100 transition"
                        title={note.pinned ? 'Unpin' : 'Pin'}
                      >
                        {note.pinned ? <Pin size={16} className="fill-current" /> : <PinOff size={16} />}
                      </button>
                    </div>

                    <p className="text-gray-700 text-sm mb-3 line-clamp-3 whitespace-pre-wrap">
                      {note.content}
                    </p>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No notes yet. Create your first note!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Note' : 'New Note'}</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
              <div className="flex gap-2">
                {Object.keys(NOTE_COLORS).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded ${NOTE_COLORS[color].badge} border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-transparent'
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={18} /> {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({ title: '', content: '', color: 'yellow' })
                  }}
                  className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
