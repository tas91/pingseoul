'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setError(null)
    setMessage(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    reset()

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    router.push('/mypage')
    router.refresh()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    setLoading(true)
    reset()

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setMessage('이메일을 확인해주세요. 인증 링크를 클릭하면 로그인됩니다.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-ping-red font-bold tracking-widest text-2xl">PING SEOUL</span>
        </div>

        {/* 탭 */}
        <div className="flex mb-6 border-b border-white/10">
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); reset() }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-white border-b-2 border-ping-red -mb-px'
                  : 'text-ping-gray hover:text-white'
              }`}
            >
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="flex flex-col gap-4">
          {tab === 'signup' && (
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
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-ping-gray">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
              placeholder="example@email.com"
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
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
              placeholder={tab === 'signup' ? '8자 이상' : '••••••••'}
            />
          </div>

          {error && <p className="text-sm text-ping-red text-center">{error}</p>}
          {message && <p className="text-sm text-emerald-400 text-center">{message}</p>}

          {!message && (
            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-ping-red hover:bg-ping-red/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition-colors"
            >
              {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
