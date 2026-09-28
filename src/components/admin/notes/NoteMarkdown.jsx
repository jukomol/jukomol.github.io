import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { isTaskCheckedAt } from './noteUtils'

export default function NoteMarkdown({ content, onToggleTask, className = '' }) {
  const components = useMemo(() => ({
    a: ({ node, ...props }) => (
      <a {...props} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />
    ),
    input: ({ node, ...props }) =>
      props.type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={!!props.checked}
          readOnly
          tabIndex={-1}
          aria-label="Toggle item"
          className={`note-task-box ${onToggleTask ? '' : 'pointer-events-none'}`}
        />
      ) : (
        <input {...props} />
      ),
    li: ({ node, className: cls, children, ...props }) => {
      if (!cls?.includes('task-list-item')) return <li className={cls} {...props}>{children}</li>
      const offset = node?.position?.start?.offset
      const checked = offset != null && isTaskCheckedAt(content, offset)
      return (
        <li
          {...props}
          className={`${cls}${checked ? ' is-checked' : ''}`}
          onClick={(e) => {
            if (!onToggleTask || offset == null || e.target.tagName !== 'INPUT') return
            e.stopPropagation()
            onToggleTask(offset)
          }}
        >
          {children}
        </li>
      )
    },
  }), [content, onToggleTask])

  return (
    <div className={`note-md ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
    </div>
  )
}
