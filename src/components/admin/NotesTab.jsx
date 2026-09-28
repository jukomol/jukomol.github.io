import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, X, LayoutGrid, Rows3, Lightbulb, Archive, Tag, Pencil, Plus, ListTodo, Trash2, SearchX } from 'lucide-react'
import NoteCard from './notes/NoteCard'
import NoteEditor from './notes/NoteEditor'
import { generateSlug, sortNotes, toggleTaskAt } from './notes/noteUtils'

const readPref = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

const writePref = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage blocked; the preference just won't persist
  }
}

export default function NotesTab() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [view, setView] = useState('notes')
  const [search, setSearch] = useState('')
  const [layout, setLayout] = useState(() => readPref('notes:layout', 'grid'))
  const [editor, setEditor] = useState(null)
  const [toast, setToast] = useState(null)
  const [labelsOpen, setLabelsOpen] = useState(false)
  const toastTimer = useRef(null)
  const notesRef = useRef(notes)
  notesRef.current = notes

  const showToast = useCallback((text, action) => {
    clearTimeout(toastTimer.current)
    setToast({ text, action, id: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), action ? 6000 : 3500)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const fetchNotes = useCallback(async () => {
    if (!supabase) {
      setLoadError('Supabase is not configured')
      setLoading(false)
      return
    }
    const { data, error } = await supabase.from('notes').select('*').order('updated_at', { ascending: false })
    if (error) {
      setLoadError(error.message)
    } else {
      setNotes(sortNotes(data || []))
      setLoadError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const createNote = useCallback(async (fields) => {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...fields, updated_at: new Date().toISOString() }])
      .select()
      .single()
    if (error) {
      showToast(`Couldn't save note: ${error.message}`)
      throw error
    }
    setNotes(prev => sortNotes([data, ...prev.filter(n => n.id !== data.id)]))
    return data
  }, [showToast])

  const updateNote = useCallback(async (id, patch, { touch = false } = {}) => {
    const full = touch ? { ...patch, updated_at: new Date().toISOString() } : patch
    setNotes(prev => sortNotes(prev.map(n => (n.id === id ? { ...n, ...full } : n))))
    const { data, error } = await supabase.from('notes').update(full).eq('id', id).select().single()
    if (error) {
      showToast(`Couldn't save note: ${error.message}`)
      throw error
    }
    return data
  }, [showToast])

  const quickUpdate = useCallback((note, patch) => {
    updateNote(note.id, patch).catch(fetchNotes)
  }, [updateNote, fetchNotes])

  const toggleTask = useCallback((note, offset) => {
    quickUpdate(note, { content: toggleTaskAt(note.content, offset) })
  }, [quickUpdate])

  const setArchived = useCallback(async (note, archived) => {
    const previous = { archived: note.archived, pinned: note.pinned }
    try {
      await updateNote(note.id, archived ? { archived, pinned: false } : { archived })
    } catch {
      fetchNotes()
      return
    }
    showToast(archived ? 'Note archived' : 'Note moved back to Notes', {
      label: 'Undo',
      run: () => updateNote(note.id, previous).catch(fetchNotes),
    })
  }, [updateNote, fetchNotes, showToast])

  const deleteNote = useCallback(async (note) => {
    setNotes(prev => prev.filter(n => n.id !== note.id))
    const { error } = await supabase.from('notes').delete().eq('id', note.id)
    if (error) {
      showToast(`Couldn't delete note: ${error.message}`)
      fetchNotes()
      return
    }
    showToast('Note deleted', {
      label: 'Undo',
      run: async () => {
        const { data, error: restoreError } = await supabase.from('notes').insert([note]).select().single()
        if (restoreError) {
          showToast(`Couldn't restore note: ${restoreError.message}`)
          return
        }
        setNotes(prev => sortNotes([...prev, data]))
      },
    })
  }, [fetchNotes, showToast])

  const publishNote = useCallback(async ({ id, title, content }) => {
    if (!title.trim()) {
      showToast('Add a title before publishing')
      return false
    }
    if (!content.trim()) {
      showToast('Write something before publishing')
      return false
    }
    const slug = generateSlug(title)
    const note = notesRef.current.find(n => n.id === id)
    const { data: existing, error: lookupError } = await supabase.from('blogs').select('id').eq('slug', slug).maybeSingle()
    if (lookupError) {
      showToast(`Couldn't publish: ${lookupError.message}`)
      return false
    }
    if (existing && !note?.published) {
      showToast('A blog post with this title already exists. Rename the note first.')
      return false
    }
    const { error } = existing
      ? await supabase.from('blogs').update({ title: title.trim(), content, updated_at: new Date().toISOString() }).eq('id', existing.id)
      : await supabase.from('blogs').insert([{ title: title.trim(), slug, content }])
    if (error) {
      showToast(`Couldn't publish: ${error.message}`)
      return false
    }
    if (!note?.published) await updateNote(id, { published: true }).catch(() => {})
    showToast(existing ? 'Blog post updated' : 'Published to your blog', {
      label: 'View',
      run: () => window.open(`#/blog/${slug}`, '_blank', 'noopener'),
    })
    return true
  }, [updateNote, showToast])

  const allLabels = useMemo(
    () => [...new Set(notes.flatMap(n => n.labels || []))].sort((a, b) => a.localeCompare(b)),
    [notes]
  )

  const activeLabel = view.startsWith('label:') ? view.slice(6) : null

  useEffect(() => {
    if (activeLabel && !loading && !allLabels.includes(activeLabel)) setView('notes')
  }, [activeLabel, allLabels, loading])

  const renameLabel = async (from, to) => {
    const next = to.trim()
    if (!next || next === from) return
    const affected = notesRef.current.filter(n => n.labels?.includes(from))
    await Promise.all(affected.map(n =>
      updateNote(n.id, { labels: [...new Set(n.labels.map(l => (l === from ? next : l)))] }).catch(() => {})
    ))
    if (activeLabel === from) setView(`label:${next}`)
    showToast(`Renamed “${from}” to “${next}”`)
  }

  const removeLabel = async (label) => {
    const affected = notesRef.current.filter(n => n.labels?.includes(label))
    await Promise.all(affected.map(n => updateNote(n.id, { labels: n.labels.filter(l => l !== label) }).catch(() => {})))
    showToast(`Deleted label “${label}”`)
  }

  const openNote = useCallback((note) => setEditor({ note, key: note.id }), [])

  const openNew = (defaults = {}) =>
    setEditor({ note: null, defaults: { labels: activeLabel ? [activeLabel] : [], ...defaults }, key: `new-${Date.now()}` })

  const handleEditorClose = useCallback(({ id, archivedChange }) => {
    setEditor(null)
    if (id == null || archivedChange === undefined) return
    showToast(archivedChange ? 'Note archived' : 'Note moved back to Notes', {
      label: 'Undo',
      run: () => updateNote(id, { archived: !archivedChange }).catch(fetchNotes),
    })
  }, [showToast, updateNote, fetchNotes])

  const handleEditorDelete = useCallback((id) => {
    setEditor(null)
    const note = notesRef.current.find(n => n.id === id)
    if (note) deleteNote(note)
  }, [deleteNote])

  const toggleLayout = () => {
    const next = layout === 'grid' ? 'list' : 'grid'
    setLayout(next)
    writePref('notes:layout', next)
  }

  const query = search.trim().toLowerCase()
  const visible = notes.filter(n => {
    if (query) {
      return n.title.toLowerCase().includes(query)
        || n.content.toLowerCase().includes(query)
        || n.labels?.some(l => l.toLowerCase().includes(query))
    }
    if (view === 'archive') return n.archived
    if (activeLabel) return !n.archived && n.labels?.includes(activeLabel)
    return !n.archived
  })
  const showSections = !query && view !== 'archive'
  const pinnedNotes = showSections ? visible.filter(n => n.pinned) : []
  const otherNotes = showSections ? visible.filter(n => !n.pinned) : visible

  const renderNotes = (list) => (
    <div className={layout === 'grid' ? 'columns-2 gap-3 md:columns-3 xl:columns-4' : 'mx-auto max-w-2xl'}>
      {list.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onOpen={openNote}
          onUpdate={quickUpdate}
          onArchive={setArchived}
          onDelete={deleteNote}
          onToggleTask={toggleTask}
        />
      ))}
    </div>
  )

  const labelCounts = useMemo(() => {
    const counts = {}
    notes.forEach(n => n.labels?.forEach(l => { counts[l] = (counts[l] || 0) + 1 }))
    return counts
  }, [notes])

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes"
            aria-label="Search notes"
            className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-10 text-[15px] outline-none transition placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-cyan-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 hover:bg-black/5 hover:text-gray-800"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={toggleLayout}
          className="rounded-xl p-2.5 text-gray-600 transition hover:bg-slate-100 hover:text-gray-900"
          title={layout === 'grid' ? 'List view' : 'Grid view'}
          aria-label={layout === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
        >
          {layout === 'grid' ? <Rows3 size={20} /> : <LayoutGrid size={20} />}
        </button>
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={!query && view === 'notes'} onClick={() => { setSearch(''); setView('notes') }} icon={Lightbulb}>Notes</Chip>
        {allLabels.map(label => (
          <Chip key={label} active={!query && activeLabel === label} onClick={() => { setSearch(''); setView(`label:${label}`) }} icon={Tag}>
            {label}
          </Chip>
        ))}
        <Chip active={!query && view === 'archive'} onClick={() => { setSearch(''); setView('archive') }} icon={Archive}>Archive</Chip>
        {allLabels.length > 0 && (
          <Chip onClick={() => setLabelsOpen(true)} icon={Pencil} subtle>Edit labels</Chip>
        )}
      </div>

      {!query && view !== 'archive' && (
        <div className="mx-auto mb-6 max-w-xl">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <button type="button" onClick={() => openNew()} className="flex-1 cursor-text px-4 py-3 text-left text-[15px] text-gray-500">
              Take a note…
            </button>
            <button
              type="button"
              onClick={() => openNew({ content: '- [ ] ' })}
              className="rounded-xl p-3 text-gray-600 transition hover:bg-slate-100 hover:text-gray-900"
              title="New checklist"
              aria-label="New checklist"
            >
              <ListTodo size={20} />
            </button>
          </div>
          <p className="mt-2 hidden text-center text-xs text-gray-400 sm:block">
            Tip: type <kbd className="rounded border border-gray-300 bg-gray-50 px-1 font-mono text-[11px]">/</kbd> inside a note for headings, checklists, tables and more.
          </p>
        </div>
      )}

      {loadError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn't load notes: {loadError}
          <button type="button" onClick={fetchNotes} className="ml-2 font-semibold underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="columns-2 gap-3 md:columns-3 xl:columns-4">
          {[120, 180, 90, 150, 110, 170].map((h, i) => (
            <div key={i} className="mb-3 break-inside-avoid animate-pulse rounded-xl bg-slate-100" style={{ height: h }} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState query={query} view={view} label={activeLabel} />
      ) : (
        <div className="pb-20 sm:pb-2">
          {pinnedNotes.length > 0 && (
            <section className="mb-6">
              <SectionTitle>Pinned</SectionTitle>
              {renderNotes(pinnedNotes)}
            </section>
          )}
          {otherNotes.length > 0 && (
            <section>
              {pinnedNotes.length > 0 && <SectionTitle>Others</SectionTitle>}
              {renderNotes(otherNotes)}
            </section>
          )}
        </div>
      )}

      {!editor && (
        <button
          type="button"
          onClick={() => openNew()}
          className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-900/25 transition active:scale-95 sm:hidden"
          aria-label="New note"
        >
          <Plus size={26} />
        </button>
      )}

      {editor && (
        <NoteEditor
          key={editor.key}
          note={editor.note}
          defaults={editor.defaults}
          allLabels={allLabels}
          createNote={createNote}
          updateNote={updateNote}
          onPublish={publishNote}
          onDelete={handleEditorDelete}
          onClose={handleEditorClose}
          notify={showToast}
        />
      )}

      {labelsOpen && (
        <LabelManager
          labels={allLabels}
          counts={labelCounts}
          onRename={renameLabel}
          onRemove={removeLabel}
          onClose={() => setLabelsOpen(false)}
        />
      )}

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="fixed bottom-24 left-1/2 z-[80] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl note-fade-in sm:bottom-6 sm:left-6 sm:w-auto sm:translate-x-0"
        >
          <span>{toast.text}</span>
          <div className="flex shrink-0 items-center gap-1">
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  setToast(null)
                  toast.action.run()
                }}
                className="rounded-md px-2 py-1 font-semibold text-cyan-300 hover:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
            <button type="button" onClick={() => setToast(null)} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, icon: Icon, children, subtle = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex max-w-[14rem] shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-cyan-600 bg-cyan-50 text-cyan-800'
          : subtle
            ? 'border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-800'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <Icon size={15} className="shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  )
}

function SectionTitle({ children }) {
  return <h4 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{children}</h4>
}

function EmptyState({ query, view, label }) {
  const content = query
    ? { icon: SearchX, text: 'No matching notes' }
    : view === 'archive'
      ? { icon: Archive, text: 'Your archived notes appear here' }
      : label
        ? { icon: Tag, text: `No notes with the “${label}” label yet` }
        : { icon: Lightbulb, text: 'Notes you add appear here' }
  const Icon = content.icon
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
      <Icon size={72} strokeWidth={1} className="mb-4 text-gray-300" />
      <p className="text-lg">{content.text}</p>
    </div>
  )
}

function LabelManager({ labels, counts, onRename, onRemove, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 note-fade-in sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit labels"
        className="flex max-h-[80vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl note-pop-in sm:max-w-sm sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h3 className="text-base font-semibold text-gray-900">Edit labels</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-3 pb-2">
          {labels.map(label => (
            <LabelRow key={label} label={label} count={counts[label] || 0} onRename={onRename} onRemove={onRemove} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-500">Add labels from the tag button inside a note.</p>
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-1.5 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function LabelRow({ label, count, onRename, onRemove }) {
  const [value, setValue] = useState(label)
  const commit = () => {
    if (value.trim() && value.trim() !== label) onRename(label, value)
    else setValue(label)
  }
  return (
    <div className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50">
      <Tag size={16} className="shrink-0 text-gray-500" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label={`Rename label ${label}`}
        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm text-gray-800 outline-none focus:border-cyan-500 focus:bg-white"
      />
      <span className="text-xs text-gray-400">{count}</span>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Delete the label “${label}”? It will be removed from ${count} ${count === 1 ? 'note' : 'notes'}; the notes themselves stay.`)) {
            onRemove(label)
          }
        }}
        className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label={`Delete label ${label}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
