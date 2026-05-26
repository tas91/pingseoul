'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <p className="text-ping-gray text-sm">불러오는 중...</p>
      </div>
    )
  }

  const displayName = user?.user_metadata?.name ?? user?.email ?? ''

  return (
    <div className="min-h-screen bg-[#111] text-white px-4 py-20">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-8">마이페이지</h1>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ping-gray uppercase tracking-wide">이름</span>
            <span className="text-white font-medium">{user?.user_metadata?.name ?? '—'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ping-gray uppercase tracking-wide">이메일</span>
            <span className="text-white">{user?.email}</span>
          </div>
        </div>

        <Link
          href="/mypage/reservations"
          className="flex items-center justify-between mt-6 px-5 py-4 bg-white/5 border border-white/10
                     rounded-xl hover:border-white/20 transition-colors"
        >
          <span className="text-sm text-white font-medium">예약 내역</span>
          <ChevronRight size={16} className="text-ping-gray" />
        </Link>

        <button
          onClick={handleLogout}
          className="mt-6 w-full py-3 border border-white/10 text-ping-gray hover:text-ping-red hover:border-ping-red/30 rounded-lg text-sm transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
