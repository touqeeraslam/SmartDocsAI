"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { clearAdminToken } from '@/lib/api'
import { SparkleIcon } from '@/components/Chat/icons'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/upload', label: 'Upload & Ingest' },
  { href: '/admin/documents', label: 'Documents' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    clearAdminToken()
    router.push('/chat')
  }

  return (
    <aside className="flex min-h-screen w-60 flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
          <SparkleIcon className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-900">SmartDocs AI</div>
          <div className="text-xs text-slate-400">Admin</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 transition ${
                active
                  ? 'bg-brand-50 font-medium text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {l.label}
            </Link>
          )
        })}
        <Link
          href="/chat"
          className="mt-2 rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Open Chat ↗
        </Link>
      </nav>

      <button
        onClick={logout}
        className="mt-auto rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
      >
        Log out
      </button>
    </aside>
  )
}
