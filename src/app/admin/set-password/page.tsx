'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: pwError } = await supabase.auth.updateUser({ password })
    if (pwError) {
      setError(pwError.message)
      setLoading(false)
      return
    }

    const res = await fetch('/api/admin/set-name', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-2 text-center">
          <span className="text-ping-red font-bold tracking-widest text-2xl">PING ADMIN</span>
        </div>
        <p className="text-center text-ping-gray text-sm mb-8">
          초대를 수락하셨습니다. 이름과 비밀번호를 설정해주세요.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm text-ping-gray">이름</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
              placeholder="홍길동"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-ping-gray">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
              placeholder="8자 이상"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm" className="text-sm text-ping-gray">비밀번호 확인</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-ping-red text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-ping-red hover:bg-ping-red/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition-colors"
          >
            {loading ? '설정 중...' : '설정 완료'}
          </button>
        </form>
      </div>
    </div>
  )
}
