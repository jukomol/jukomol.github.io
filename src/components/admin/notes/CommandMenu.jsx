import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const GAP = 6
const EDGE = 8

export default function CommandMenu({ items, active, anchor, onSelect, onHover, onPointerDown, onDismiss, title = 'Insert block' }) {
  const ref = useRef(null)
  const [placement, setPlacement] = useState({ visibility: 'hidden', top: 0, left: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const vv = window.visualViewport
    const viewTop = vv ? vv.offsetTop : 0
    const viewH = vv ? vv.height : window.innerHeight
    const viewW = vv ? vv.width : window.innerWidth
    el.style.maxHeight = ''
    const h = el.offsetHeight
    const w = el.offsetWidth
    const below = viewTop + viewH - (anchor.y + anchor.h) - GAP - EDGE
    const above = anchor.y - viewTop - GAP - EDGE
    const left = Math.max(EDGE, Math.min(anchor.x, viewW - w - EDGE))
    if (h <= below || below >= above) {
      setPlacement({ top: anchor.y + anchor.h + GAP, left, maxHeight: Math.min(h, below) })
    } else {
      const height = Math.min(h, above)
      setPlacement({ top: anchor.y - GAP - height, left, maxHeight: height })
    }
  }, [anchor.x, anchor.y, anchor.h, items.length])

  useEffect(() => {
    ref.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  useEffect(() => {
    if (!onDismiss) return
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) onDismiss(e)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [onDismiss])

  return createPortal(
    <div
      ref={ref}
      role="listbox"
      aria-label={title}
      style={{ position: 'fixed', ...placement }}
      className="z-[70] w-64 max-h-80 overflow-y-auto overscroll-contain rounded-xl bg-white py-1.5 shadow-2xl ring-1 ring-black/10 note-fade-in"
      onPointerDown={onPointerDown}
      onMouseDown={(e) => e.preventDefault()}
    >
      <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      {items.map((cmd, i) => {
        const Icon = cmd.icon
        return (
          <button
            key={cmd.id}
            type="button"
            role="option"
            aria-selected={i === active}
            data-active={i === active}
            onClick={() => onSelect(cmd)}
            onMouseEnter={() => onHover?.(i)}
            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${i === active ? 'bg-cyan-50' : 'hover:bg-gray-50'}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700">
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-gray-900">{cmd.label}</span>
              <span className="block truncate text-xs text-gray-500">{cmd.hint}</span>
            </span>
          </button>
        )
      })}
    </div>,
    document.body
  )
}
