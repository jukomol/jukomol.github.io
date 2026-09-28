import { format, isToday, isThisYear } from 'date-fns'
import {
  Heading1, Heading2, Heading3, List, ListOrdered, ListTodo, Quote, SquareCode,
  Table, Minus, Bold, Italic, Strikethrough, Code, Link, Image, CalendarDays,
} from 'lucide-react'

export const NOTE_COLORS = [
  { id: 'default', name: 'Default', bg: '#ffffff' },
  { id: 'coral', name: 'Coral', bg: '#faafa8' },
  { id: 'peach', name: 'Peach', bg: '#f39f76' },
  { id: 'sand', name: 'Sand', bg: '#fff8b8' },
  { id: 'mint', name: 'Mint', bg: '#e2f6d3' },
  { id: 'sage', name: 'Sage', bg: '#b4ddd3' },
  { id: 'fog', name: 'Fog', bg: '#d4e4ed' },
  { id: 'storm', name: 'Storm', bg: '#aeccdc' },
  { id: 'dusk', name: 'Dusk', bg: '#d3bfdb' },
  { id: 'blossom', name: 'Blossom', bg: '#f6e2dd' },
  { id: 'clay', name: 'Clay', bg: '#e9e3d4' },
  { id: 'chalk', name: 'Chalk', bg: '#efeff1' },
]

export const colorOf = (id) => NOTE_COLORS.find(c => c.id === id) || NOTE_COLORS[0]

// notes timestamps are "timestamp without time zone" holding UTC wall time
export const parseDbDate = (value) => {
  if (!value) return null
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`)
}

export const formatEdited = (value) => {
  const date = parseDbDate(value)
  if (!date || Number.isNaN(date.getTime())) return ''
  if (isToday(date)) return format(date, 'h:mm a')
  return format(date, isThisYear(date) ? 'MMM d' : 'MMM d, yyyy')
}

export const sortNotes = (notes) =>
  [...notes].sort((a, b) => (parseDbDate(b.updated_at)?.getTime() || 0) - (parseDbDate(a.updated_at)?.getTime() || 0))

export const generateSlug = (title) =>
  title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

export const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0)

export const taskProgress = (text) => {
  const boxes = text.match(/^\s*[-*+] \[[ xX]\]/gm) || []
  return { total: boxes.length, done: boxes.filter(b => /\[[xX]\]/.test(b)).length }
}

const findTaskBox = (content, offset) => {
  const lineEnd = content.indexOf('\n', offset)
  const re = /\[( |x|X)\]/g
  re.lastIndex = offset
  const m = re.exec(content)
  if (!m || (lineEnd !== -1 && m.index > lineEnd)) return null
  return m
}

export const isTaskCheckedAt = (content, offset) => {
  const m = findTaskBox(content, offset)
  return !!m && m[1] !== ' '
}

export const toggleTaskAt = (content, offset) => {
  const m = findTaskBox(content, offset)
  if (!m) return content
  return content.slice(0, m.index + 1) + (m[1] === ' ' ? 'x' : ' ') + content.slice(m.index + 2)
}

export const SLASH_COMMANDS = [
  { id: 'h1', label: 'Heading 1', hint: 'Large section heading', icon: Heading1, keywords: 'title h1 big', block: true, insert: '# ' },
  { id: 'h2', label: 'Heading 2', hint: 'Medium section heading', icon: Heading2, keywords: 'subtitle h2', block: true, insert: '## ' },
  { id: 'h3', label: 'Heading 3', hint: 'Small section heading', icon: Heading3, keywords: 'h3', block: true, insert: '### ' },
  { id: 'todo', label: 'Checklist', hint: 'Track tasks with checkboxes', icon: ListTodo, keywords: 'todo task checkbox check', block: true, insert: '- [ ] ' },
  { id: 'bullet', label: 'Bulleted list', hint: 'Simple bulleted list', icon: List, keywords: 'ul unordered bullet', block: true, insert: '- ' },
  { id: 'numbered', label: 'Numbered list', hint: 'List with numbering', icon: ListOrdered, keywords: 'ol ordered number', block: true, insert: '1. ' },
  { id: 'quote', label: 'Quote', hint: 'Capture a quotation', icon: Quote, keywords: 'blockquote citation', block: true, insert: '> ' },
  { id: 'table', label: 'Table', hint: 'Three-column table', icon: Table, keywords: 'grid columns rows', block: true, spaced: true, insert: '| ', select: 'Column 1', after: ' | Column 2 | Column 3 |\n| --- | --- | --- |\n|  |  |  |\n' },
  { id: 'code', label: 'Code block', hint: 'Snippet with monospace text', icon: SquareCode, keywords: 'pre snippet program', block: true, spaced: true, insert: '```\n', after: '\n```\n' },
  { id: 'divider', label: 'Divider', hint: 'Horizontal line', icon: Minus, keywords: 'hr line separator rule', block: true, spaced: true, insert: '---\n\n' },
  { id: 'bold', label: 'Bold', hint: 'Strong emphasis', icon: Bold, keywords: 'strong', insert: '**', select: 'bold text', after: '**' },
  { id: 'italic', label: 'Italic', hint: 'Slanted emphasis', icon: Italic, keywords: 'emphasis em', insert: '*', select: 'italic text', after: '*' },
  { id: 'strike', label: 'Strikethrough', hint: 'Cross text out', icon: Strikethrough, keywords: 'strike delete', insert: '~~', select: 'text', after: '~~' },
  { id: 'inlinecode', label: 'Inline code', hint: 'Monospace text', icon: Code, keywords: 'code mono', insert: '`', select: 'code', after: '`' },
  { id: 'link', label: 'Link', hint: 'Link to a web page', icon: Link, keywords: 'url href web', insert: '[', select: 'link text', after: '](https://)' },
  { id: 'image', label: 'Image', hint: 'Embed an image from a URL', icon: Image, keywords: 'picture photo img', block: true, insert: '![', select: 'description', after: '](https://)' },
  { id: 'date', label: "Today's date", hint: 'Insert the current date', icon: CalendarDays, keywords: 'today time now', dynamic: () => format(new Date(), 'MMMM d, yyyy') },
]

export const filterCommands = (query) => {
  const q = query.toLowerCase()
  if (!q) return SLASH_COMMANDS
  const starts = []
  const contains = []
  for (const cmd of SLASH_COMMANDS) {
    const label = cmd.label.toLowerCase()
    if (label.startsWith(q) || cmd.id.startsWith(q)) starts.push(cmd)
    else if (label.includes(q) || cmd.keywords.includes(q)) contains.push(cmd)
  }
  return [...starts, ...contains]
}

// Edits go through execCommand so the browser's native undo (Ctrl+Z) keeps working.
export function replaceRange(ta, start, end, text, selStart, selEnd) {
  ta.focus()
  ta.setSelectionRange(start, end)
  let ok = false
  try {
    ok = text ? document.execCommand('insertText', false, text) : start === end || document.execCommand('delete')
  } catch {
    ok = false
  }
  if (!ok) {
    ta.setRangeText(text, start, end, 'end')
    ta.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const s = selStart ?? start + text.length
  ta.setSelectionRange(s, selEnd ?? s)
}

export function applyCommand(ta, cmd, start, end) {
  const before = ta.value.slice(0, start)
  let prefix = ''
  if (cmd.block) {
    const lineStart = before.lastIndexOf('\n') + 1
    if (before.slice(lineStart).trim()) prefix = '\n'
    if (cmd.spaced && before.trim() && !(before + prefix).endsWith('\n\n')) prefix += '\n'
  }
  if (cmd.dynamic) {
    replaceRange(ta, start, end, cmd.dynamic())
    return
  }
  const select = cmd.select || ''
  const text = prefix + cmd.insert + select + (cmd.after || '')
  const selStart = start + prefix.length + cmd.insert.length
  replaceRange(ta, start, end, text, selStart, selStart + select.length)
}

export function wrapSelection(ta, marker, placeholder, closing = marker) {
  const { selectionStart: s, selectionEnd: e, value } = ta
  const selected = value.slice(s, e)
  if (selected && value.slice(s - marker.length, s) === marker && value.slice(e, e + closing.length) === closing) {
    replaceRange(ta, s - marker.length, e + closing.length, selected, s - marker.length, e - marker.length)
    return
  }
  const inner = selected || placeholder
  replaceRange(ta, s, e, marker + inner + closing, s + marker.length, s + marker.length + inner.length)
}

export function insertLink(ta) {
  const { selectionStart: s, selectionEnd: e, value } = ta
  const text = value.slice(s, e) || 'link text'
  const inserted = `[${text}](https://)`
  const urlStart = s + text.length + 3
  replaceRange(ta, s, e, inserted, urlStart, urlStart + 8)
}

const ANY_PREFIX = /^(\s*)([-*+] \[[ xX]\] |[-*+] |\d+[.)] |#{1,6} |> )/

export const LINE_FORMATS = {
  bullet: { match: /^(\s*)[-*+] (?!\[[ xX]\] )/, make: () => '- ' },
  todo: { match: /^(\s*)[-*+] \[[ xX]\] /, make: () => '- [ ] ' },
  numbered: { match: /^(\s*)\d+[.)] /, make: (i) => `${i + 1}. ` },
  quote: { match: /^(\s*)> /, make: () => '> ' },
}

export function toggleLineFormat(ta, formatId) {
  const { match, make } = LINE_FORMATS[formatId]
  const { value, selectionStart: s, selectionEnd: e } = ta
  const start = value.lastIndexOf('\n', s - 1) + 1
  let end = value.indexOf('\n', e > s && value[e - 1] === '\n' ? e - 1 : e)
  if (end === -1) end = value.length
  const lines = value.slice(start, end).split('\n')
  const removing = lines.every(l => match.test(l))
  const next = lines.map((line, i) => {
    if (removing) return line.replace(match, '$1')
    const m = line.match(ANY_PREFIX)
    const indent = m ? m[1] : line.match(/^\s*/)[0]
    const rest = m ? line.slice(m[0].length) : line.slice(indent.length)
    return indent + make(i) + rest
  }).join('\n')
  if (lines.length === 1) {
    const caret = Math.max(start, s + next.length - (end - start))
    replaceRange(ta, start, end, next, caret)
  } else {
    replaceRange(ta, start, end, next, start, start + next.length)
  }
}

export function cycleHeading(ta) {
  const { value, selectionStart: s } = ta
  const start = value.lastIndexOf('\n', s - 1) + 1
  let end = value.indexOf('\n', s)
  if (end === -1) end = value.length
  const line = value.slice(start, end)
  const m = line.match(/^(#{1,6}) /)
  const level = m ? m[1].length : 0
  const body = m ? line.slice(m[0].length) : line.replace(ANY_PREFIX, '')
  const next = (level >= 3 ? '' : '#'.repeat(level + 1) + ' ') + body
  replaceRange(ta, start, end, next, start + next.length)
}

export function handleListEnter(ta) {
  const { value, selectionStart: s, selectionEnd: e } = ta
  if (s !== e) return false
  const start = value.lastIndexOf('\n', s - 1) + 1
  let end = value.indexOf('\n', s)
  if (end === -1) end = value.length
  const m = value.slice(start, s).match(/^(\s*)([-*+] \[[ xX]\] |[-*+] |(\d+)([.)]) |> )/)
  if (!m) return false
  if (value.slice(start, end).trim() === m[0].trim()) {
    replaceRange(ta, start, end, '')
    return true
  }
  let marker = m[2]
  if (m[3]) marker = `${Number(m[3]) + 1}${m[4]} `
  else if (/\[[xX]\]/.test(marker)) marker = marker.replace(/\[[xX]\]/, '[ ]')
  replaceRange(ta, s, s, `\n${m[1]}${marker}`)
  return true
}

export function handleListTab(ta, outdent) {
  const { value, selectionStart: s } = ta
  const start = value.lastIndexOf('\n', s - 1) + 1
  let end = value.indexOf('\n', s)
  if (end === -1) end = value.length
  const line = value.slice(start, end)
  if (!ANY_PREFIX.test(line) || /^\s*(#|>)/.test(line)) return false
  if (outdent) {
    const remove = line.match(/^ {1,2}/)?.[0].length || 0
    if (remove) replaceRange(ta, start, start + remove, '', Math.max(start, s - remove))
  } else {
    replaceRange(ta, start, start, '  ', s + 2)
  }
  return true
}

const MIRROR_PROPS = [
  'direction', 'boxSizing', 'width', 'overflowX', 'overflowY', 'borderTopWidth', 'borderRightWidth',
  'borderBottomWidth', 'borderLeftWidth', 'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom',
  'paddingLeft', 'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
  'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration',
  'letterSpacing', 'wordSpacing', 'tabSize',
]

// Mirrors the textarea in a hidden div to find the pixel position of a character.
export function getCaretCoordinates(el, position) {
  const computed = window.getComputedStyle(el)
  const div = document.createElement('div')
  const style = div.style
  MIRROR_PROPS.forEach(prop => { style[prop] = computed[prop] })
  style.position = 'absolute'
  style.visibility = 'hidden'
  style.whiteSpace = 'pre-wrap'
  style.overflowWrap = 'break-word'
  style.top = '0'
  style.left = '-9999px'
  style.overflow = 'hidden'
  div.textContent = el.value.slice(0, position)
  const span = document.createElement('span')
  span.textContent = el.value.slice(position) || '.'
  div.appendChild(span)
  document.body.appendChild(div)
  const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5
  const coords = {
    top: span.offsetTop + parseFloat(computed.borderTopWidth),
    left: span.offsetLeft + parseFloat(computed.borderLeftWidth),
    height: lineHeight,
  }
  document.body.removeChild(div)
  return coords
}
