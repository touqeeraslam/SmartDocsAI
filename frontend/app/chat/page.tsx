"use client"

import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/Chat/Sidebar'
import ChatHeader from '../../components/Chat/ChatHeader'
import MessageBubble from '../../components/Chat/MessageBubble'
import ChatInput from '../../components/Chat/ChatInput'
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          setMessages([])
          setSidebarOpen(false)
        }}
        documents={docs}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader onToggleSidebar={() => setSidebarOpen((s) => !s)} />

        <main className="flex-1 overflow-hidden p-4">
          <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] bg-white rounded-lg shadow flex flex-col">
            {backendOffline && (
              <div className="m-4 mb-0 rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
                Couldn’t reach the backend. Make sure the API is running and{' '}
                <code className="font-mono">NEXT_PUBLIC_API_BASE</code> points to it.
              </div>
            )}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 mt-12">
                  <p>Ask a question about the documents.</p>
                  {docs.length > 0 && (
                    <p className="text-xs mt-2">
                      {docs.length} document{docs.length > 1 ? 's' : ''} available — try “What
                      is the vacation policy?”
                    </p>
                  )}
                </div>
              )}

              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {loading && (
                <div className="flex items-start justify-start animate-fade-in-up">
                  <div className="mr-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">🤖</div>
                  </div>
                  <div className="bg-slate-100 rounded-lg rounded-bl-none p-4 shadow-sm flex items-center gap-1.5">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-4">
              <ChatInput
                value={input}
                onChange={(v: string) => setInput(v)}
                onSend={() => send()}
                loading={loading}
                onQuickSend={(t: string) => send(t)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
