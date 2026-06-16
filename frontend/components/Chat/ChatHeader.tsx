import React from 'react'
import { SparkleIcon, MenuIcon } from './icons'

type Props = {
  onToggleSidebar: () => void
  online?: boolean
}

export default function ChatHeader({ onToggleSidebar, online = true }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Toggle sidebar"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <SparkleIcon className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">SmartDocs Assistant</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    online ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                {online ? 'Connected' : 'Offline'}
              </div>
            </div>
          </div>
        </div>

        <a
          href="/admin"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          Admin
        </a>
      </div>
    </header>
  )
}
