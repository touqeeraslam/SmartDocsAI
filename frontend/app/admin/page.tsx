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
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className="text-3xl font-semibold mt-1">
              {loading ? '…' : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-medium mb-2">Quick actions</h3>
        <div className="flex gap-3">
          <Link
            href="/admin/upload"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Upload & Ingest
          </Link>
          <Link
            href="/admin/documents"
            className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
          >
            Manage Documents
          </Link>
        </div>
      </div>
    </div>
  )
}
