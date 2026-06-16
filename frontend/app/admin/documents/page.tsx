"use client"

import React, { useEffect, useState } from 'react'
import { listDocuments, deleteDocument, DocumentRow } from '@/lib/api'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listDocuments()
      setDocs(res.data.documents || [])
    } catch {
      setError('Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async (id: string) => {
    if (!confirm('Delete this document and all its embeddings?')) return
    setDeleting(id)
    try {
      await deleteDocument(id)
      setDocs((d) => d.filter((x) => x.document_id !== id))
    } catch {
      alert('Failed to delete document.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Documents</h2>
        <button
          onClick={load}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Loading…</div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No documents yet. Upload one from the “Upload & Ingest” page.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-3.5 text-left font-semibold">Title</th>
                <th className="p-3.5 text-left font-semibold">Pages</th>
                <th className="p-3.5 text-left font-semibold">Chunks</th>
                <th className="p-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.document_id} className="border-t border-slate-100 transition hover:bg-slate-50">
                  <td className="p-3.5 font-medium text-slate-800">{d.title}</td>
                  <td className="p-3.5 tabular-nums text-slate-600">{d.pages}</td>
                  <td className="p-3.5 tabular-nums text-slate-600">{d.chunks}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => remove(d.document_id)}
                      disabled={deleting === d.document_id}
                      className="font-medium text-red-500 transition hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === d.document_id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
