import React, { useRef, useEffect } from 'react'
import { SendIcon } from './icons'

type Props = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onQuickSend?: (t: string) => void
  loading?: boolean
}

export default function ChatInput({ value, onChange, onSend, loading = false }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(200, el.scrollHeight)}px`
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!loading) onSend()
    }
  }

  const canSend = value.trim().length > 0 && !loading

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft transition focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask anything about your documents…"
        className="max-h-48 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />

      <button
        onClick={() => canSend && onSend()}
        disabled={!canSend}
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition focus:outline-none focus:ring-2 focus:ring-brand-300 ${
          canSend ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-slate-300'
        }`}
        title="Send"
        aria-label="Send message"
      >
        {loading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <SendIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
