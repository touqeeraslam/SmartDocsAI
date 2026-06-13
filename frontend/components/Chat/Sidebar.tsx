import React from 'react'

type DocumentRow = { document_id: string; title: string; chunks: number; pages: number }

type Props = {
  open: boolean
  onClose: () => void
  onNewChat: () => void
  documents?: DocumentRow[]
}

export default function Sidebar({ open, onClose, onNewChat, documents = [] }: Props) {
  return (
    <>
      {/* overlay for small screens */}
      <div
        className={`fixed inset-0 bg-black/40 z-20 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } md:hidden`}
        onClick={onClose}
      />

      <aside
        className={`z-30 w-80 bg-white border-r h-full fixed left-0 top-0 bottom-0 transform transition-transform shadow-lg ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:shadow-none`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded flex items-center justify-center font-semibold">A</div>
              <div className="font-semibold">AI Doc QA</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewChat}
                className="px-3 py-1 rounded text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition text-sm"
              >
                New Chat
              </button>
              <button onClick={onClose} className="md:hidden p-2 rounded hover:bg-slate-100">✕</button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Available documents
            </div>
            {documents.length === 0 ? (
              <div className="text-sm text-slate-400">No documents indexed yet.</div>
            ) : (
              <ul className="space-y-2">
                {documents.map((d) => (
                  <li
                    key={d.document_id}
                    className="flex items-start gap-3 p-3 rounded hover:bg-slate-50 transition"
                  >
                    <div className="w-9 h-9 bg-slate-100 rounded flex items-center justify-center text-slate-600">📄</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.title}</div>
                      <div className="text-xs text-slate-400">
                        {d.pages} pages • {d.chunks} chunks
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 border-t">
            <a href="/admin" className="text-sm text-indigo-600 hover:underline">
              Admin panel ↗
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}
