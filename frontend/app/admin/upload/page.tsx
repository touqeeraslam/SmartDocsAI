"use client"

import React, { useState } from 'react'
import { ingestDocument } from '@/lib/api'

type Result = {
  title: string
  pages: number
  chunks: number
  document_id: string
} | null

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<Result>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return

    setResult(null)
    setMessage('')
    setProgress(0)
    setStatus('uploading')

    const form = new FormData()
    form.append('title', title.trim())
    form.append('file', file)

    try {
      const res = await ingestDocument(form, (p) => {
        setProgress(p)
        if (p >= 100) setStatus('processing')
      })
      setStatus('done')
      setResult(res.data)
      setMessage('Document ingested and ready to query.')
      setTitle('')
      setFile(null)
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.response?.data?.detail || 'Ingestion failed.')
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 text-xl font-semibold text-slate-900">Upload & Ingest</h2>
      <p className="mb-6 text-sm text-slate-500">
        Pick a PDF — the server uploads, extracts text, chunks it, generates
        embeddings, and stores them in the vector database in one step.
      </p>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Financial Report"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">PDF file</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-medium file:text-brand-700 hover:file:bg-brand-100"
          />
        </div>

        <button
          type="submit"
          disabled={!file || !title.trim() || status === 'uploading' || status === 'processing'}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'uploading'
            ? `Uploading… ${progress}%`
            : status === 'processing'
            ? 'Processing & embedding…'
            : 'Upload & Ingest'}
        </button>

        {(status === 'uploading' || status === 'processing') && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-brand-500 transition-all"
              style={{ width: `${status === 'processing' ? 100 : progress}%` }}
            />
          </div>
        )}

        {message && (
          <div className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
            {message}
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="font-medium text-slate-800">{result.title}</div>
            <div>{result.pages} pages · {result.chunks} chunks embedded</div>
          </div>
        )}
      </form>
    </div>
  )
}
