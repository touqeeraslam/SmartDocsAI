import React, { useRef, useEffect } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onQuickSend?: (t: string) => void
  loading?: boolean
}

export default function ChatInput({ value, onChange, onSend, onQuickSend, loading = false }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // auto-resize
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

  return (
    <div className="flex items-center gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your documents... (Shift+Enter for newline)"
        className="flex-1 min-h-[44px] max-h-48 resize-none px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={() => !loading && onSend()}
          disabled={loading}
          className={`p-3 rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200 transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          title="Send"
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
