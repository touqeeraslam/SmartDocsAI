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
      <h2 className="text-xl font-semibold mb-1">Upload & Ingest</h2>
      <p className="text-sm text-slate-500 mb-6">
        Pick a PDF — the server uploads, extracts text, chunks it, generates
        embeddings, and stores them in the vector database in one step.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-xl shadow p-6">
        <div>
          <label className="block text-sm mb-1 font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Financial Report"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">PDF file</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <button
          type="submit"
          disabled={!file || !title.trim() || status === 'uploading' || status === 'processing'}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {status === 'uploading'
            ? `Uploading… ${progress}%`
            : status === 'processing'
            ? 'Processing & embedding…'
            : 'Upload & Ingest'}
        </button>

        {(status === 'uploading' || status === 'processing') && (
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-2 transition-all"
              style={{ width: `${status === 'processing' ? 100 : progress}%` }}
            />
          </div>
        )}

        {message && (
          <div
            className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}
          >
            {message}
          </div>
        )}

        {result && (
          <div className="text-sm text-slate-600 border-t pt-3">
            <div><span className="font-medium">{result.title}</span></div>
            <div>{result.pages} pages • {result.chunks} chunks embedded</div>
          </div>
        )}
      </form>
    </div>
  )
}
