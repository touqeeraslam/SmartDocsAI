import React from 'react'

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
    <div className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">🤖</div>
        </div>
      )}

      <div
        className={`max-w-[80%] p-3 rounded-lg shadow-sm animate-fade-in-up
          ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-900 rounded-bl-none'}`}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-200">
            <div className="text-xs font-medium text-slate-500 mb-1">Sources</div>
            <ul className="space-y-1">
              {message.sources.map((s, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="inline-block w-4 text-slate-400">{i + 1}.</span>
                  <span className="font-medium">{s.title}</span>
                  <span className="text-slate-400">p.{s.page}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isUser && (
        <div className="ml-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">Y</div>
        </div>
      )}
    </div>
  )
}
