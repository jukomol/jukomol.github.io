import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft, Pin, Archive, ArchiveRestore, Eye, PenLine, Plus, Palette, Tag, EllipsisVertical,
  Bold, Italic, Heading, List, ListOrdered, ListTodo, Link, Code, Quote, Send, Copy, Trash2, X,
  Check, LoaderCircle, CircleAlert,
} from 'lucide-react'
import NoteMarkdown from './NoteMarkdown'
import CommandMenu from './CommandMenu'
import { ColorSwatch } from './NoteCard'
import {
  NOTE_COLORS, colorOf, formatEdited, wordCount, toggleTaskAt, filterCommands, SLASH_COMMANDS,
  applyCommand, wrapSelection, insertLink, toggleLineFormat, cycleHeading, handleListEnter,
  handleListTab, getCaretCoordinates, replaceRange,
} from './noteUtils'

const FIELDS = ['title', 'content', 'color', 'pinned', 'archived', 'labels']
const SAVE_DELAY = 700

const snapshotOf = (d) => ({
  title: d.title ?? '',
  content: d.content ?? '',
  color: d.color || 'default',
  pinned: !!d.pinned,
  archived: !!d.archived,
  labels: [...(d.labels || [])],
})

const diff = (cur, last) => {
  const patch = {}
  for (const key of FIELDS) {
    const changed = key === 'labels' ? JSON.stringify(cur[key]) !== JSON.stringify(last[key]) : cur[key] !== last[key]
    if (changed) patch[key] = cur[key]
  }
  return patch
}

function useIsMobile() {
  const query = '(max-width: 639px)'
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return mobile
}

// Keeps the full-screen mobile editor above the on-screen keyboard.
function useVisualViewport() {
  const [vv, setVv] = useState(null)
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () => setVv({ height: viewport.height, top: viewport.offsetTop })
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])
  return vv
}

export default function NoteEditor({ note, defaults, allLabels, createNote, updateNote, onPublish, onDelete, onClose, notify }) {
  const [initial] = useState(() => snapshotOf(note || { ...defaults }))
  const [title, setTitle] = useState(initial.title)
  const [content, setContent] = useState(initial.content)
  const [color, setColor] = useState(initial.color)
  const [pinned, setPinned] = useState(initial.pinned)
  const [archived, setArchived] = useState(initial.archived)
  const [labels, setLabels] = useState(initial.labels)
  const [published, setPublished] = useState(!!note?.published)
  const [updatedAt, setUpdatedAt] = useState(note?.updated_at || null)
  const [mode, setMode] = useState('edit')
  const [saveState, setSaveState] = useState('idle')
  const [popover, setPopover] = useState(null)
  const [slash, setSlash] = useState(null)
  const [insertMenu, setInsertMenu] = useState(null)
  const [publishing, setPublishing] = useState(false)

  const isMobile = useIsMobile()
  const vv = useVisualViewport()
  const taRef = useRef(null)
  const bodyRef = useRef(null)
  const plusRef = useRef(null)
  const idRef = useRef(note?.id ?? null)
  const lastSavedRef = useRef(initial)
  const chainRef = useRef(Promise.resolve(true))
  const timerRef = useRef(null)
  const blurTimerRef = useRef(null)
  const dismissedRef = useRef(null)
  const hasFocusedRef = useRef(false)
  const closingRef = useRef(false)
  const deletedRef = useRef(false)
  const draftRef = useRef(null)
  draftRef.current = { title, content, color, pinned, archived, labels }

  const noteColor = colorOf(color)

  const doPersist = useCallback(async () => {
    if (deletedRef.current) return true
    const cur = snapshotOf(draftRef.current)
    const patch = diff(cur, lastSavedRef.current)
    if (!Object.keys(patch).length) return true
    try {
      if (idRef.current == null) {
        if (!cur.title.trim() && !cur.content.trim()) return true
        setSaveState('saving')
        const created = await createNote(cur)
        idRef.current = created.id
        setUpdatedAt(created.updated_at)
      } else {
        setSaveState('saving')
        const touch = 'title' in patch || 'content' in patch
        const saved = await updateNote(idRef.current, patch, { touch })
        if (saved?.updated_at) setUpdatedAt(saved.updated_at)
      }
      lastSavedRef.current = cur
      setSaveState('saved')
      return true
    } catch {
      setSaveState('error')
      return false
    }
  }, [createNote, updateNote])

  const persist = useCallback(() => {
    clearTimeout(timerRef.current)
    chainRef.current = chainRef.current.then(doPersist)
    return chainRef.current
  }, [doPersist])

  useEffect(() => {
    if (!Object.keys(diff(snapshotOf(draftRef.current), lastSavedRef.current)).length) return
    setSaveState(s => (s === 'error' ? s : 'pending'))
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(persist, SAVE_DELAY)
  }, [title, content, color, pinned, archived, labels, persist])

  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && persist()
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      persist()
    }
  }, [persist])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  useEffect(() => {
    if (note) return
    const ta = taRef.current
    if (!ta) return
    ta.focus()
    ta.setSelectionRange(ta.value.length, ta.value.length)
  }, [note])

  useLayoutEffect(() => {
    const ta = taRef.current
    if (!ta) return
    const body = bodyRef.current
    const scrollTop = body?.scrollTop
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
    if (body) body.scrollTop = scrollTop
  }, [content, mode, isMobile])

  const handleClose = useCallback(async (extra = {}) => {
    if (closingRef.current) return
    closingRef.current = true
    const ok = await persist()
    if (!ok && !window.confirm("Your latest changes couldn't be saved. Close anyway and lose them?")) {
      closingRef.current = false
      return
    }
    onClose({ id: idRef.current, ...extra })
  }, [persist, onClose])

  const toggleArchive = () => {
    const next = !archived
    draftRef.current = { ...draftRef.current, archived: next, pinned: next ? false : draftRef.current.pinned }
    setArchived(next)
    if (next) setPinned(false)
    handleClose({ archivedChange: next })
  }

  const handleDelete = async () => {
    setPopover(null)
    clearTimeout(timerRef.current)
    deletedRef.current = true
    await chainRef.current
    if (idRef.current == null) {
      onClose({ id: null })
      return
    }
    onDelete(idRef.current)
  }

  const handlePublish = async () => {
    setPopover(null)
    if (!(await persist())) return
    if (idRef.current == null) {
      notify('Write something before publishing')
      return
    }
    setPublishing(true)
    const ok = await onPublish({ id: idRef.current, title, content })
    setPublishing(false)
    if (ok) setPublished(true)
  }

  const handleCopy = async () => {
    setPopover(null)
    try {
      await navigator.clipboard.writeText(content)
      notify('Markdown copied to clipboard')
    } catch {
      notify("Couldn't access the clipboard")
    }
  }

  const syncSlash = useCallback(() => {
    const ta = taRef.current
    if (!ta || document.activeElement !== ta) return
    const pos = ta.selectionStart
    if (pos !== ta.selectionEnd) {
      setSlash(null)
      return
    }
    const value = ta.value
    const lineStart = value.lastIndexOf('\n', pos - 1) + 1
    const match = value.slice(lineStart, pos).match(/(^|\s)\/([a-zA-Z0-9]{0,20})$/)
    if (!match) {
      dismissedRef.current = null
      setSlash(null)
      return
    }
    const start = pos - match[2].length - 1
    const items = filterCommands(match[2])
    if (dismissedRef.current === start || !items.length) {
      setSlash(null)
      return
    }
    const caret = getCaretCoordinates(ta, start)
    const rect = ta.getBoundingClientRect()
    const anchor = { x: rect.left + caret.left - ta.scrollLeft, y: rect.top + caret.top - ta.scrollTop, h: caret.height }
    setSlash(prev => ({
      start,
      query: match[2],
      anchor,
      active: prev && prev.start === start && prev.query === match[2] ? Math.min(prev.active, items.length - 1) : 0,
    }))
  }, [])

  const slashItems = slash ? filterCommands(slash.query) : []

  const runSlash = (cmd) => {
    const ta = taRef.current
    if (!ta || !slash) return
    const end = slash.start + 1 + slash.query.length
    setSlash(null)
    dismissedRef.current = null
    applyCommand(ta, cmd, slash.start, end)
  }

  const onTextKeyDown = (e) => {
    const ta = e.currentTarget
    if (slash && slashItems.length) {
      const count = slashItems.length
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const step = e.key === 'ArrowDown' ? 1 : -1
        setSlash(s => ({ ...s, active: (s.active + step + count) % count }))
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        runSlash(slashItems[slash.active])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        dismissedRef.current = slash.start
        setSlash(null)
        return
      }
    }
    const mod = e.metaKey || e.ctrlKey
    if (mod && !e.shiftKey && !e.altKey) {
      const key = e.key.toLowerCase()
      if (key === 'b' || key === 'i' || key === 'k') {
        e.preventDefault()
        if (key === 'b') wrapSelection(ta, '**', 'bold text')
        else if (key === 'i') wrapSelection(ta, '*', 'italic text')
        else insertLink(ta)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && !mod && !e.nativeEvent.isComposing && handleListEnter(ta)) {
      e.preventDefault()
      return
    }
    if (e.key === 'Tab' && handleListTab(ta, e.shiftKey)) e.preventDefault()
  }

  const withTextarea = (fn) => () => {
    const ta = taRef.current
    if (!ta) return
    if (!hasFocusedRef.current) {
      ta.focus()
      ta.setSelectionRange(ta.value.length, ta.value.length)
    }
    fn(ta)
  }

  const codeAction = (ta) => {
    const { selectionStart: s, selectionEnd: e, value } = ta
    const selected = value.slice(s, e)
    if (selected.includes('\n')) replaceRange(ta, s, e, `\`\`\`\n${selected}\n\`\`\``, s + 4, s + 4 + selected.length)
    else wrapSelection(ta, '`', 'code')
  }

  const toggleInsertMenu = (e) => {
    if (insertMenu) {
      setInsertMenu(null)
      return
    }
    const ta = taRef.current
    if (!ta) return
    const rect = e.currentTarget.getBoundingClientRect()
    const atEnd = !hasFocusedRef.current
    setPopover(null)
    setSlash(null)
    setInsertMenu({
      anchor: { x: rect.left, y: rect.top, h: rect.height },
      start: atEnd ? ta.value.length : ta.selectionStart,
      end: atEnd ? ta.value.length : ta.selectionEnd,
    })
  }

  const runInsert = (cmd) => {
    const ta = taRef.current
    if (!ta || !insertMenu) return
    const { start, end } = insertMenu
    setInsertMenu(null)
    applyCommand(ta, cmd, start, end)
  }

  const togglePopover = (name) => {
    setInsertMenu(null)
    setPopover(p => (p === name ? null : name))
  }

  const toggleLabel = (label) =>
    setLabels(prev => (prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]))

  const onPanelKeyDown = (e) => {
    if (e.key !== 'Escape') return
    if (popover) setPopover(null)
    else if (insertMenu) setInsertMenu(null)
    else handleClose()
  }

  const editing = mode === 'edit'
  const words = wordCount(content)
  const mobileFrame = isMobile && vv ? { position: 'fixed', top: vv.top, left: 0, right: 0, height: vv.height } : {}

  const formatting = [
    { label: 'Bold (Ctrl+B)', icon: Bold, run: (ta) => wrapSelection(ta, '**', 'bold text') },
    { label: 'Italic (Ctrl+I)', icon: Italic, run: (ta) => wrapSelection(ta, '*', 'italic text') },
    { label: 'Heading', icon: Heading, run: cycleHeading },
    { label: 'Checklist', icon: ListTodo, run: (ta) => toggleLineFormat(ta, 'todo') },
    { label: 'Bulleted list', icon: List, run: (ta) => toggleLineFormat(ta, 'bullet') },
    { label: 'Numbered list', icon: ListOrdered, run: (ta) => toggleLineFormat(ta, 'numbered') },
    { label: 'Quote', icon: Quote, run: (ta) => toggleLineFormat(ta, 'quote') },
    { label: 'Link (Ctrl+K)', icon: Link, run: insertLink },
    { label: 'Code', icon: Code, run: codeAction },
  ]

  return createPortal(
    <div className="fixed inset-0 z-50" onKeyDown={onPanelKeyDown}>
      <div className="absolute inset-0 bg-slate-900/50 note-fade-in" onClick={() => handleClose()} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={note ? 'Edit note' : 'New note'}
          className="pointer-events-auto relative flex h-full w-full flex-col shadow-2xl note-pop-in sm:h-auto sm:max-h-[min(88vh,860px)] sm:max-w-2xl sm:rounded-2xl"
          style={{ backgroundColor: noteColor.bg, ...mobileFrame }}
        >
          <div className="flex items-center gap-1 px-2 pt-2 sm:px-3">
            <IconButton label="Save and close" onClick={() => handleClose()} className="sm:hidden">
              <ArrowLeft size={22} />
            </IconButton>
            <div className="flex-1" />
            <div className="mr-1 flex rounded-full bg-black/[0.06] p-0.5 text-sm font-medium">
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${editing ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                aria-pressed={editing}
              >
                <PenLine size={15} /> <span className="hidden min-[380px]:inline">Write</span>
              </button>
              <button
                type="button"
                onClick={() => { setSlash(null); setInsertMenu(null); setMode('preview') }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${!editing ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                aria-pressed={!editing}
              >
                <Eye size={15} /> <span className="hidden min-[380px]:inline">Preview</span>
              </button>
            </div>
            <IconButton label={pinned ? 'Unpin note' : 'Pin note'} onClick={() => setPinned(p => !p)} active={pinned}>
              <Pin size={20} fill={pinned ? 'currentColor' : 'none'} />
            </IconButton>
            <IconButton label={archived ? 'Unarchive' : 'Archive'} onClick={toggleArchive}>
              {archived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
            </IconButton>
          </div>

          <div
            ref={bodyRef}
            onScroll={() => slash && syncSlash()}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 sm:px-6"
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                setMode('edit')
                requestAnimationFrame(() => taRef.current?.focus())
              }}
              placeholder="Title"
              aria-label="Note title"
              className="w-full bg-transparent py-2 text-xl font-semibold text-gray-900 outline-none placeholder:text-gray-500/70 sm:text-[22px]"
            />
            {editing ? (
              <textarea
                ref={taRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  syncSlash()
                }}
                onSelect={syncSlash}
                onKeyDown={onTextKeyDown}
                onFocus={() => {
                  hasFocusedRef.current = true
                  clearTimeout(blurTimerRef.current)
                }}
                onBlur={() => {
                  blurTimerRef.current = setTimeout(() => setSlash(null), 150)
                }}
                rows={1}
                spellCheck
                aria-label="Note content"
                placeholder="Take a note…  Type / for headings, checklists, tables and more"
                className="block min-h-[45vh] w-full resize-none overflow-hidden bg-transparent text-[15px] leading-relaxed text-gray-800 outline-none placeholder:text-gray-500/70 sm:min-h-[240px]"
              />
            ) : content.trim() ? (
              <div className="pb-2 pt-1" onDoubleClick={() => setMode('edit')}>
                <NoteMarkdown content={content} className="text-[15px]" onToggleTask={(offset) => setContent(c => toggleTaskAt(c, offset))} />
              </div>
            ) : (
              <p className="py-2 text-sm italic text-gray-500">Nothing to preview yet.</p>
            )}

            {labels.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {labels.map(label => (
                  <span key={label} className="group inline-flex items-center gap-1 rounded-full bg-black/[0.07] py-1 pl-2.5 pr-1 text-xs font-medium text-gray-700">
                    {label}
                    <button
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className="rounded-full p-0.5 text-gray-500 hover:bg-black/10 hover:text-gray-900"
                      aria-label={`Remove label ${label}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-black/[0.06]">
            <div className="flex items-center justify-between gap-3 px-4 pt-2 text-xs text-gray-600 sm:px-5">
              <span className="truncate">
                {updatedAt ? `Edited ${formatEdited(updatedAt)}` : 'New note'} · {words} {words === 1 ? 'word' : 'words'}
                {published && ' · Published'}
              </span>
              <SaveIndicator state={saveState} onRetry={persist} />
            </div>
            <div className="relative flex items-center gap-0.5 px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 sm:px-2">
              <span ref={plusRef}>
                <ToolButton label="Insert block (/)" onClick={toggleInsertMenu} disabled={!editing} active={!!insertMenu}>
                  <Plus size={20} />
                </ToolButton>
              </span>
              <ToolButton label="Background color" onClick={() => togglePopover('color')} active={popover === 'color'}>
                <Palette size={19} />
              </ToolButton>
              <ToolButton label="Labels" onClick={() => togglePopover('labels')} active={popover === 'labels'}>
                <Tag size={19} />
              </ToolButton>
              <span className="mx-1 h-5 w-px shrink-0 bg-black/10" />
              <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto no-scrollbar">
                {formatting.map(({ label, icon: Icon, run }) => (
                  <ToolButton key={label} label={label} onClick={withTextarea(run)} disabled={!editing}>
                    <Icon size={18} />
                  </ToolButton>
                ))}
              </div>
              <ToolButton label="More actions" onClick={() => togglePopover('more')} active={popover === 'more'}>
                <EllipsisVertical size={19} />
              </ToolButton>
              <button
                type="button"
                onClick={() => handleClose()}
                className="ml-1 hidden rounded-lg px-4 py-1.5 text-sm font-semibold text-gray-800 transition hover:bg-black/[0.07] sm:inline-flex"
              >
                Close
              </button>

              {popover && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPopover(null)} />
                  {popover === 'color' && (
                    <div className="absolute bottom-full left-2 z-20 mb-1 grid grid-cols-6 gap-2 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/10 note-fade-in">
                      {NOTE_COLORS.map(c => (
                        <ColorSwatch key={c.id} color={c} selected={noteColor.id === c.id} onClick={() => setColor(c.id)} />
                      ))}
                    </div>
                  )}
                  {popover === 'labels' && (
                    <div className="absolute bottom-full left-2 z-20 mb-1 note-fade-in">
                      <LabelPicker allLabels={allLabels} selected={labels} onToggle={toggleLabel} />
                    </div>
                  )}
                  {popover === 'more' && (
                    <div className="absolute bottom-full right-2 z-20 mb-1 w-56 rounded-xl bg-white py-1.5 shadow-xl ring-1 ring-black/10 note-fade-in">
                      <MenuItem icon={Send} onClick={handlePublish} disabled={publishing}>
                        {publishing ? 'Publishing…' : published ? 'Update blog post' : 'Publish to blog'}
                      </MenuItem>
                      <MenuItem icon={Copy} onClick={handleCopy}>Copy as Markdown</MenuItem>
                      <div className="my-1 h-px bg-gray-100" />
                      <MenuItem icon={Trash2} onClick={handleDelete} danger>Delete note</MenuItem>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {slash && slashItems.length > 0 && (
        <CommandMenu
          items={slashItems}
          active={slash.active}
          anchor={slash.anchor}
          onSelect={runSlash}
          onHover={(i) => setSlash(s => (s ? { ...s, active: i } : s))}
          onPointerDown={() => clearTimeout(blurTimerRef.current)}
        />
      )}
      {insertMenu && (
        <CommandMenu
          items={SLASH_COMMANDS}
          active={-1}
          anchor={insertMenu.anchor}
          onSelect={runInsert}
          onDismiss={(e) => { if (!plusRef.current?.contains(e.target)) setInsertMenu(null) }}
        />
      )}
    </div>,
    document.body
  )
}

function IconButton({ label, onClick, children, className = '', active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-full p-2.5 transition hover:bg-black/[0.07] ${active ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'} ${className}`}
    >
      {children}
    </button>
  )
}

function ToolButton({ label, onClick, children, disabled = false, active = false }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`shrink-0 rounded-lg p-2 transition disabled:pointer-events-none disabled:opacity-35 ${
        active ? 'bg-black/10 text-gray-900' : 'text-gray-700 hover:bg-black/[0.07] hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function MenuItem({ icon: Icon, onClick, children, danger = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition disabled:opacity-50 ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-800 hover:bg-gray-50'
      }`}
    >
      <Icon size={17} /> {children}
    </button>
  )
}

function SaveIndicator({ state, onRetry }) {
  if (state === 'saving' || state === 'pending') {
    return (
      <span className="flex shrink-0 items-center gap-1 text-gray-500">
        <LoaderCircle size={13} className="animate-spin" /> Saving…
      </span>
    )
  }
  if (state === 'saved') {
    return <span className="flex shrink-0 items-center gap-1 text-emerald-700"><Check size={13} /> Saved</span>
  }
  if (state === 'error') {
    return (
      <button type="button" onClick={onRetry} className="flex shrink-0 items-center gap-1 font-medium text-red-700 hover:underline">
        <CircleAlert size={13} /> Not saved · Retry
      </button>
    )
  }
  return null
}

function LabelPicker({ allLabels, selected, onToggle }) {
  const [query, setQuery] = useState('')
  const trimmed = query.trim()
  const options = [...new Set([...allLabels, ...selected])].sort((a, b) => a.localeCompare(b))
  const shown = options.filter(l => l.toLowerCase().includes(trimmed.toLowerCase()))
  const exists = options.some(l => l.toLowerCase() === trimmed.toLowerCase())

  const create = () => {
    if (!trimmed) return
    const match = options.find(l => l.toLowerCase() === trimmed.toLowerCase())
    if (!match || !selected.includes(match)) onToggle(match || trimmed)
    setQuery('')
  }

  return (
    <div className="w-64 rounded-xl bg-white shadow-xl ring-1 ring-black/10">
      <div className="px-3 pb-2 pt-3">
        <p className="mb-2 text-sm font-semibold text-gray-900">Label note</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              create()
            }
          }}
          placeholder="Enter label name"
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
        />
      </div>
      <div className="max-h-52 overflow-y-auto pb-1.5">
        {shown.map(label => (
          <label key={label} className="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selected.includes(label)}
              onChange={() => onToggle(label)}
              className="h-4 w-4 accent-cyan-600"
            />
            <span className="truncate">{label}</span>
          </label>
        ))}
        {trimmed && !exists && (
          <button type="button" onClick={create} className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50">
            <Plus size={16} /> Create “{trimmed}”
          </button>
        )}
        {!shown.length && !trimmed && <p className="px-3 py-2 text-xs text-gray-500">No labels yet. Type a name to create one.</p>}
      </div>
    </div>
  )
}
