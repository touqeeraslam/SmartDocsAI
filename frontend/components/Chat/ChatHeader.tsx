import React from 'react'

type Props = {
  onToggleSidebar: () => void
}

export default function ChatHeader({ onToggleSidebar }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="md:hidden p-2 rounded hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded flex items-center justify-center font-semibold">A</div>
            <div>
              <div className="font-semibold">Assistant</div>
              <div className="text-xs text-slate-400">Ask questions about your documents</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="px-3 py-1 rounded text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
          >
            Admin
          </a>
        </div>
      </div>
    </header>
  )
}
