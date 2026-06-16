import React from 'react'
import { SparkleIcon, PlusIcon, CloseIcon, DocIcon } from './icons'

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
        className={`fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 bottom-0 z-30 flex w-80 transform flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0 shadow-panel' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <SparkleIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900">SmartDocs AI</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 md:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <PlusIcon className="h-4 w-4" />
            New chat
          </button>
        </div>

        <div className="scroll-area flex-1 overflow-y-auto px-4 pb-4">
          <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Knowledge base
          </div>
          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
              No documents indexed yet.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {documents.map((d) => (
                <li
                  key={d.document_id}
                  className="flex items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <DocIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-800">{d.title}</div>
                    <div className="text-xs text-slate-400">
                      {d.pages} pages · {d.chunks} chunks
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-4">
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            Admin panel
            <span aria-hidden>↗</span>
          </a>
        </div>
      </aside>
    </>
  )
}
