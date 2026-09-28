import { useLayoutEffect, useRef, useState } from 'react'
import { Pin, PinOff, Palette, Archive, ArchiveRestore, Trash2, ListTodo, Send, Check } from 'lucide-react'
import NoteMarkdown from './NoteMarkdown'
import { NOTE_COLORS, colorOf, taskProgress } from './noteUtils'

const PREVIEW_CHARS = 1500

export default function NoteCard({ note, onOpen, onUpdate, onArchive, onDelete, onToggleTask }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const bodyRef = useRef(null)
  const color = colorOf(note.color)
  const preview = note.content.length > PREVIEW_CHARS ? note.content.slice(0, PREVIEW_CHARS) : note.content
  const tasks = taskProgress(note.content)
  const isEmpty = !note.title.trim() && !note.content.trim()

  useLayoutEffect(() => {
    const el = bodyRef.current
    setOverflowing(!!el && (el.scrollHeight > el.clientHeight + 2 || note.content.length > PREVIEW_CHARS))
  }, [preview, note.content.length])

  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && onOpen(note)}
      className="group relative mb-3 break-inside-avoid cursor-pointer rounded-xl border transition-shadow duration-150 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
      style={{ backgroundColor: color.bg, borderColor: color.id === 'default' ? '#e5e7eb' : 'transparent' }}
    >
      <button
        type="button"
        onClick={stop(() => onUpdate(note, { pinned: !note.pinned }))}
        className={`absolute right-1.5 top-1.5 z-10 hidden rounded-full p-2 text-gray-600 transition hover:bg-black/10 hover:text-gray-900 sm:flex ${
          note.pinned ? 'sm:opacity-100' : 'sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
        }`}
        title={note.pinned ? 'Unpin note' : 'Pin note'}
        aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
      >
        {note.pinned ? <PinOff size={16} /> : <Pin size={16} />}
      </button>

      <div className="px-4 pb-2 pt-3">
        {note.title.trim() && (
          <h3 className="mb-1 break-words pr-7 text-[15px] font-semibold leading-snug text-gray-900">{note.title}</h3>
        )}
        {note.content.trim() && (
          <div ref={bodyRef} className="relative max-h-72 overflow-hidden">
            <NoteMarkdown content={preview} onToggleTask={(offset) => onToggleTask(note, offset)} />
            {overflowing && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                style={{ background: `linear-gradient(to bottom, transparent, ${color.bg})` }}
              />
            )}
          </div>
        )}
        {isEmpty && <p className="text-sm italic text-gray-400">Empty note</p>}

        {(note.labels?.length > 0 || tasks.total > 0 || note.published) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {tasks.total > 0 && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tasks.done === tasks.total ? 'bg-emerald-600/15 text-emerald-800' : 'bg-black/5 text-gray-700'}`}>
                <ListTodo size={12} /> {tasks.done}/{tasks.total}
              </span>
            )}
            {note.published && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-600/15 px-2 py-0.5 text-[11px] font-medium text-cyan-800">
                <Send size={11} /> Published
              </span>
            )}
            {note.labels?.map(label => (
              <span key={label} className="max-w-full truncate rounded-full bg-black/[0.07] px-2 py-0.5 text-[11px] font-medium text-gray-700">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className={`relative hidden items-center gap-0.5 px-1.5 pb-1.5 transition sm:flex ${
          paletteOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
        }`}
      >
        <CardAction label="Background color" onClick={stop(() => setPaletteOpen(o => !o))}><Palette size={16} /></CardAction>
        <CardAction label={note.archived ? 'Unarchive' : 'Archive'} onClick={stop(() => onArchive(note, !note.archived))}>
          {note.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
        </CardAction>
        <CardAction label="Delete" onClick={stop(() => onDelete(note))}><Trash2 size={16} /></CardAction>

        {paletteOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={stop(() => setPaletteOpen(false))} />
            <div
              className="absolute bottom-full left-1 z-30 mb-1 grid grid-cols-6 gap-1.5 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/10 note-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {NOTE_COLORS.map(c => (
                <ColorSwatch
                  key={c.id}
                  color={c}
                  selected={color.id === c.id}
                  onClick={() => {
                    onUpdate(note, { color: c.id })
                    setPaletteOpen(false)
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function CardAction({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-full p-2 text-gray-600 transition hover:bg-black/10 hover:text-gray-900"
    >
      {children}
    </button>
  )
}

export function ColorSwatch({ color, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={color.name}
      aria-label={color.name}
      aria-pressed={selected}
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition hover:scale-110 ${
        selected ? 'border-cyan-600' : color.id === 'default' ? 'border-gray-300' : 'border-transparent'
      }`}
      style={{ backgroundColor: color.bg }}
    >
      {selected && <Check size={14} className="text-cyan-700" />}
    </button>
  )
}
