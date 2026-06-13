import Sidebar from '@/components/Layout/Sidebar'
import AdminGate from '@/components/Admin/AdminGate'
import React from 'react'

export const metadata = {
  title: 'Admin - AI Doc QA'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 bg-slate-50 min-h-screen">{children}</main>
      </div>
    </AdminGate>
  )
}
