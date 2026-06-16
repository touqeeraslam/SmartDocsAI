"use client"

import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/Chat/Sidebar'
import ChatHeader from '../../components/Chat/ChatHeader'
import MessageBubble from '../../components/Chat/MessageBubble'
import ChatInput from '../../components/Chat/ChatInput'
import { SparkleIcon } from '../../components/Chat/icons'
import { queryDocument, listDocuments, Source, DocumentRow } from '@/lib/api'

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  sources?: Source[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [backendOffline, setBackendOffline] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading])

  useEffect(() => {
    listDocuments()
      .then((res) => {
        setDocs(res.data.documents || [])
        setBackendOffline(false)
      })
      .catch(() => {
        setDocs([])
        setBackendOffline(true)
      })
  }, [])

  const send = async (text?: string) => {
    const toSend = (typeof text === 'string' ? text : input).trim()
    if (!toSend || loading) return

    const userMsg: Message = { id: String(Date.now()), role: 'user', text: toSend }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await queryDocument(userMsg.text)
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: res.data.answer ?? 'No answer',
        sources: res.data.sources
      }
      setMessages((m) => [...m, assistantMsg])
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setMessages((m) => [
        ...m,
        {
          id: String(Date.now() + 2),
          role: 'assistant',
          text:
            typeof detail === 'string'
              ? `Error: ${detail}`
              : 'Error contacting the API. Is the backend running?'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'What is the vacation policy?',
    'Summarize the key points.',
    'What are the main requirements?'
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          setMessages([])
          setSidebarOpen(false)
        }}
        documents={docs}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader onToggleSidebar={() => setSidebarOpen((s) => !s)} online={!backendOffline} />

        <main className="flex flex-1 flex-col overflow-hidden">
          {backendOffline && (
            <div className="mx-auto mt-4 w-full max-w-4xl px-4 sm:px-6">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Couldn’t reach the backend. Make sure the API is running and{' '}
                <code className="font-mono text-amber-900">NEXT_PUBLIC_API_BASE</code> points to it.
              </div>
            </div>
          )}

          <div ref={scrollRef} className="scroll-area flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-6 sm:px-6">
              {messages.length === 0 && (
                <div className="mx-auto mt-8 max-w-lg text-center sm:mt-16">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-panel">
                    <SparkleIcon className="h-7 w-7" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Ask anything about your documents
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    {docs.length > 0
                      ? `${docs.length} document${docs.length > 1 ? 's' : ''} indexed and ready to search.`
                      : 'Answers are grounded in your knowledge base with page-level citations.'}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-soft transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {loading && (
                <div className="flex animate-fade-in-up items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
                    <SparkleIcon className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-4 shadow-soft">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-100/80 backdrop-blur-md">
            <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6">
              <ChatInput
                value={input}
                onChange={(v: string) => setInput(v)}
                onSend={() => send()}
                loading={loading}
                onQuickSend={(t: string) => send(t)}
              />
              <p className="mt-2 text-center text-xs text-slate-400">
                Press Enter to send · Shift+Enter for a new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
