import Sidebar from '@/components/Layout/Sidebar'
import AdminGate from '@/components/Admin/AdminGate'
import React from 'react'

export const metadata = {
  title: 'Admin - AI Doc QA'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <main className="min-h-screen flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </AdminGate>
  )
}
