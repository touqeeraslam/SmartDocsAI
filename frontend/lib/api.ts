import axios from 'axios'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

const ADMIN_TOKEN_KEY = 'admin_token'

export const getAdminToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null

export const setAdminToken = (token: string) =>
  localStorage.setItem(ADMIN_TOKEN_KEY, token)

export const clearAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY)

const adminHeaders = (extra: Record<string, string> = {}) => ({
  ...extra,
  'X-Admin-Token': getAdminToken() || ''
})

// ---- Types ----
export type DocumentRow = {
  document_id: string
  title: string
  chunks: number
  pages: number
}

export type Source = { title: string; page: number; score: number }

export type QueryResponse = { answer: string; sources: Source[] }

// ---- Admin auth ----
export const verifyAdmin = (token: string) =>
  axios.post(
    `${API_BASE}/admin/verify`,
    {},
    { headers: { 'X-Admin-Token': token } }
  )

// ---- Admin: one-click ingest ----
export const ingestDocument = (
  formData: FormData,
  onProgress?: (p: number) => void
) =>
  axios.post(`${API_BASE}/admin/ingest`, formData, {
    headers: adminHeaders({ 'Content-Type': 'multipart/form-data' }),
    onUploadProgress: (ev) =>
      onProgress?.(Math.round((ev.loaded / (ev.total || 1)) * 100))
  })

// ---- Documents ----
export const listDocuments = () =>
  axios.get<{ documents: DocumentRow[] }>(`${API_BASE}/documents`)

export const deleteDocument = (documentId: string) =>
  axios.delete(`${API_BASE}/admin/documents/${documentId}`, {
    headers: adminHeaders()
  })

// ---- Public query ----
export const queryDocument = (question: string) =>
  axios.post<QueryResponse>(
    `${API_BASE}/query-document/`,
    { question },
    { headers: { 'Content-Type': 'application/json' } }
  )

export default {
  ingestDocument,
  listDocuments,
  deleteDocument,
  queryDocument,
  verifyAdmin,
  getAdminToken,
  setAdminToken,
  clearAdminToken
}
