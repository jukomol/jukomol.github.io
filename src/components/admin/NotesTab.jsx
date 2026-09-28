import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Trash2, Plus, Send, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function NotesTab() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [publishingId, setPublishingId] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
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

  const handleNewNote = () => {
    setEditTitle('')
    setEditContent('')
    setSelectedNote(null)
  }

  const handleSelectNote = (note) => {
    setSelectedNote(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required' })
      return
    }

    try {
      if (selectedNote) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title: editTitle,
            content: editContent,
            updated_at: new Date(),
          })
          .eq('id', selectedNote)

        if (error) throw error
        setMessage({ type: 'success', text: 'Note updated' })
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert([{
            title: editTitle,
            content: editContent,
          }])
          .select()

        if (error) throw error
        setMessage({ type: 'success', text: 'Note created' })
        setSelectedNote(data[0].id)
      }

      await fetchNotes()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save note: ' + error.message })
    }
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
      if (selectedNote === id) {
        setSelectedNote(null)
        setEditTitle('')
        setEditContent('')
      }
      await fetchNotes()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete note: ' + error.message })
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

  const handlePublish = async () => {
    if (!selectedNote || !editTitle.trim() || !editContent.trim()) {
      setMessage({ type: 'error', text: 'Note must have title and content' })
      return
    }

    setPublishingId(selectedNote)

    try {
      const slug = generateSlug(editTitle)

      const { error } = await supabase
        .from('blogs')
        .insert([{
          title: editTitle,
          slug: slug,
          content: editContent,
          created_at: new Date(),
        }])

      if (error) throw error
      setMessage({ type: 'success', text: '🎉 Published as blog post!' })

      // Update note to mark it as published
      await supabase
        .from('notes')
        .update({ published: true })
        .eq('id', selectedNote)

      await fetchNotes()
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        setMessage({ type: 'error', text: 'Blog post with this slug already exists' })
      } else {
        setMessage({ type: 'error', text: 'Failed to publish: ' + error.message })
      }
    } finally {
      setPublishingId(null)
    }
  }

  if (loading) return <p className="text-gray-500">Loading notes...</p>

  return (
    <div className="h-screen flex flex-col bg-white">
      {message && (
        <div className={`flex gap-3 p-4 ${
          message.type === 'success'
            ? 'bg-green-50 border-b border-green-200'
            : 'bg-red-50 border-b border-red-200'
        }`}>
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Notes List - Left Sidebar */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleNewNote}
              className="w-full bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Plus size={18} /> New Note
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`p-4 cursor-pointer transition hover:bg-gray-100 ${
                  selectedNote === note.id ? 'bg-cyan-50 border-l-4 border-cyan-600' : ''
                }`}
              >
                <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                  {note.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {note.content.substring(0, 50)}...
                </p>
              </div>
            ))}
          </div>

          {notes.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No notes yet</p>
            </div>
          )}
        </div>

        {/* Editor - Right Side */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedNote || editTitle || editContent ? (
            <>
              {/* Editor Header */}
              <div className="border-b border-gray-200 p-6 flex justify-between items-center bg-white">
                <div className="flex-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note title..."
                    className="text-3xl font-bold text-gray-900 bg-transparent border-none focus:outline-none w-full"
                  />
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Save
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={publishingId === selectedNote}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Send size={16} /> {publishingId === selectedNote ? 'Publishing...' : 'Publish'}
                  </button>
                  {selectedNote && (
                    <button
                      onClick={() => handleDelete(selectedNote)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Editor Content - Split View */}
              <div className="flex flex-1 overflow-hidden">
                {/* Markdown Editor */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
                  <div className="p-6 overflow-y-auto flex-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Write your note in markdown... You can publish this as a blog post!"
                      className="w-full h-full font-mono text-sm bg-transparent border-none focus:outline-none resize-none"
                      spellCheck="true"
                    />
                  </div>
                </div>

                {/* Markdown Preview */}
                <div className="flex-1 overflow-y-auto bg-white p-6">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{editContent}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Eye size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">Select a note or create a new one</p>
                <p className="text-sm mt-2">Write in markdown and preview in real-time</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
