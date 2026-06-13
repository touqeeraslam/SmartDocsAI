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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Documents</h2>
        <button onClick={load} className="text-sm text-indigo-600 hover:underline">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : docs.length === 0 ? (
        <div className="text-slate-500 text-sm bg-white rounded-md shadow p-6">
          No documents yet. Upload one from the “Upload & Ingest” page.
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Pages</th>
                <th className="p-3 text-left">Chunks</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.document_id} className="border-t">
                  <td className="p-3">{d.title}</td>
                  <td className="p-3">{d.pages}</td>
                  <td className="p-3">{d.chunks}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => remove(d.document_id)}
                      disabled={deleting === d.document_id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
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
