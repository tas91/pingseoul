import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111] text-white flex">
      <AdminSidebar />
      <main className="flex-1 p-6 pt-20 md:pt-6 md:ml-56">
        {children}
      </main>
    </div>
  )
}
