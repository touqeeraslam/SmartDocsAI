import React from 'react'
import { SparkleIcon, UserIcon } from './icons'

type Source = { title: string; page: number; score: number }
type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  sources?: Source[]
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex animate-fade-in-up items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full shadow-soft ${
          isUser
            ? 'bg-slate-700 text-white'
            : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
        }`}
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <SparkleIcon className="h-4 w-4" />}
      </div>

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft ${
          isUser
            ? 'rounded-tr-md bg-brand-600 text-white'
            : 'rounded-tl-md border border-slate-200 bg-white text-slate-800'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sources
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {message.sources.map((s, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                  title={`Relevance ${(s.score * 100).toFixed(0)}%`}
                >
                  <span className="font-medium text-slate-700">{s.title}</span>
                  <span className="text-slate-400">p.{s.page}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
