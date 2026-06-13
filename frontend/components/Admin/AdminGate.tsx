"use client"

import React, { useEffect, useState } from 'react'
import { verifyAdmin, setAdminToken, getAdminToken, clearAdminToken } from '@/lib/api'

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
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Checking access…
      </div>
    )
  }

  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4"
      >
        <div>
          <h1 className="text-xl font-semibold">Admin access</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter the admin token to manage documents.
          </p>
        </div>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !token.trim()}
          className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Verifying…' : 'Unlock'}
        </button>
        <a href="/chat" className="block text-center text-sm text-slate-500 hover:text-slate-700">
          ← Back to chat
        </a>
      </form>
    </div>
  )
}
