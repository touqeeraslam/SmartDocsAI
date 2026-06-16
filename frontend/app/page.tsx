import Link from 'next/link'
import { SparkleIcon } from '../components/Chat/icons'

const features = [
  { title: 'Upload PDFs', desc: 'Admin uploads documents — text is extracted, chunked, and embedded automatically.' },
  { title: 'Vector search', desc: 'Questions are embedded and matched against document chunks using cosine similarity in ChromaDB.' },
  { title: 'Grounded answers', desc: 'An LLM answers using only the retrieved context and cites the source page for every answer.' }
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-panel">
            <SparkleIcon className="h-6 w-6" />
          </div>
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            RAG · FastAPI · Next.js · ChromaDB
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          AI Document Q&amp;A
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Ask natural-language questions about your PDFs and get answers grounded in
          the source documents, with page-level citations. A full Retrieval-Augmented
          Generation pipeline — upload, chunk, embed, retrieve, answer.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/chat"
            className="rounded-xl bg-brand-600 px-6 py-3 font-medium text-white shadow-soft transition hover:bg-brand-700"
          >
            Try the Assistant →
          </Link>
          <Link
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 shadow-soft transition hover:border-slate-300 hover:bg-slate-50"
          >
            Admin panel
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-sm text-slate-400">
          A demo document is pre-loaded so you can start asking questions right away.
        </p>
      </div>
    </main>
  )
}
