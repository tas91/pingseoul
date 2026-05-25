'use client'

import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

const NO_SIDEBAR_PATHS = ['/admin/login', '/admin/set-password']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (NO_SIDEBAR_PATHS.includes(pathname)) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#111] text-white flex">
      <AdminSidebar />
      <main className="flex-1 p-6 pt-20 md:pt-6 md:ml-56">
        {children}
      </main>
    </div>
  )
}
