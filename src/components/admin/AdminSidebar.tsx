'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar, LayoutGrid, Megaphone, LogOut, Menu, X, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const BASE_NAV = [
  { label: '예약 현황', href: '/admin/reservations', icon: Calendar },
  { label: '테이블맵', href: '/admin/table-map', icon: LayoutGrid },
  { label: '이벤트 관리', href: '/admin/events', icon: Megaphone },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('admin_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setIsSuperAdmin(data?.role === 'super_admin'))
    })
  }, [])

  const navItems = [
    ...BASE_NAV,
    ...(isSuperAdmin ? [{ label: '관리자 관리', href: '/admin/members', icon: Users }] : []),
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const NavLinks = () => (
    <>
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-ping-red text-white'
                : 'text-ping-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-56 bg-ping-dark border-r border-white/10 z-40">
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-ping-red font-bold tracking-widest text-lg">PING ADMIN</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-ping-gray hover:text-ping-red transition-colors"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-ping-dark border-b border-white/10 flex items-center justify-between px-4 z-40">
        <span className="text-ping-red font-bold tracking-widest">PING ADMIN</span>
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="text-ping-gray hover:text-white transition-colors"
          aria-label="메뉴 토글"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-ping-dark border-b border-white/10 z-30 p-3 flex flex-col gap-1">
          <NavLinks />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-ping-gray hover:text-ping-red transition-colors mt-1 border-t border-white/10 pt-3"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      )}
    </>
  )
}
