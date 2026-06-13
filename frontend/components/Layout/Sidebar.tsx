"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { clearAdminToken } from '@/lib/api'

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
    <aside className="w-60 bg-white border-r min-h-screen p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Admin</h3>
      <nav className="flex flex-col gap-1 text-sm">
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2 py-1.5 rounded ${
                active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50'
              }`}
            >
              {l.label}
            </Link>
          )
        })}
        <Link href="/chat" className="px-2 py-1.5 rounded hover:bg-slate-50 mt-2">
          Open Chat ↗
        </Link>
      </nav>
      <button
        onClick={logout}
        className="mt-auto text-sm text-slate-500 hover:text-red-600 text-left px-2 py-1.5"
      >
        Log out
      </button>
    </aside>
  )
}
