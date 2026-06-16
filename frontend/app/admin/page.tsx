"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { listDocuments, DocumentRow } from '@/lib/api'

export default function AdminIndex() {
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDocuments()
      .then((res) => setDocs(res.data.documents || []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false))
  }, [])

  const totalChunks = docs.reduce((s, d) => s + d.chunks, 0)
  const totalPages = docs.reduce((s, d) => s + d.pages, 0)

  const stats = [
    { label: 'Documents', value: docs.length },
    { label: 'Pages indexed', value: totalPages },
    { label: 'Chunks embedded', value: totalChunks }
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-1 text-2xl font-semibold text-slate-900">Dashboard</h2>
      <p className="mb-6 text-sm text-slate-500">Overview of your indexed knowledge base.</p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
              {loading ? '…' : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <h3 className="mb-3 font-semibold text-slate-900">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/upload"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700"
          >
            Upload & Ingest
          </Link>
          <Link
            href="/admin/documents"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Manage Documents
          </Link>
        </div>
      </div>
    </div>
  )
}
