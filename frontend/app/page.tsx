import Link from 'next/link'

const features = [
  { title: 'Upload PDFs', desc: 'Admin uploads documents — text is extracted, chunked, and embedded automatically.' },
  { title: 'Vector search', desc: 'Questions are embedded and matched against document chunks using cosine similarity in ChromaDB.' },
  { title: 'Grounded answers', desc: 'An LLM answers using only the retrieved context and cites the source page for every answer.' }
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 mb-4">
          RAG • FastAPI • Next.js • ChromaDB
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
          AI Document Q&amp;A
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl">
          Ask natural-language questions about your PDFs and get answers grounded in
          the source documents, with page-level citations. A full Retrieval-Augmented
          Generation pipeline — upload, chunk, embed, retrieve, answer.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/chat"
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Try the Assistant →
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Admin panel
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{f.desc}</p>
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
