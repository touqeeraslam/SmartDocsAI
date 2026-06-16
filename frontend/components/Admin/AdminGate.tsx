"use client"

import React, { useEffect, useState } from 'react'
import { verifyAdmin, setAdminToken, getAdminToken, clearAdminToken } from '@/lib/api'
import { SparkleIcon } from '@/components/Chat/icons'

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Validate any previously stored token on mount.
  useEffect(() => {
    const existing = getAdminToken()
    if (!existing) {
      setChecking(false)
      return
    }
    verifyAdmin(existing)
      .then(() => setAuthed(true))
      .catch(() => clearAdminToken())
      .finally(() => setChecking(false))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await verifyAdmin(token.trim())
      setAdminToken(token.trim())
      setAuthed(true)
    } catch (err: any) {
      const status = err?.response?.status
      setError(
        status === 503
          ? 'Admin access is not configured on the server.'
          : 'Invalid admin token.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Checking access…
      </div>
    )
  }

  if (authed) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-panel"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
            <SparkleIcon className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Admin access</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the admin token to manage documents.
          </p>
        </div>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !token.trim()}
          className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Verifying…' : 'Unlock'}
        </button>
        <a href="/chat" className="block text-center text-sm text-slate-500 transition hover:text-slate-700">
          ← Back to chat
        </a>
      </form>
    </div>
  )
}
