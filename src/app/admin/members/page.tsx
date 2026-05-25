'use client'

import { useEffect, useState } from 'react'
import { UserPlus, Shield, User, CheckCircle, XCircle } from 'lucide-react'

interface AdminMember {
  id: string
  email: string
  name: string | null
  role: 'super_admin' | 'admin'
  is_active: boolean
  created_at: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const fetchMembers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/members')
    if (res.ok) {
      const data = await res.json()
      setMembers(data.members)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(false)

    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })

    const data = await res.json()
    if (!res.ok) {
      setInviteError(data.error)
    } else {
      setInviteSuccess(true)
      setInviteEmail('')
      setTimeout(() => {
        setShowInviteForm(false)
        setInviteSuccess(false)
        fetchMembers()
      }, 1500)
    }
    setInviting(false)
  }

  const handleToggle = async (id: string, currentActive: boolean) => {
    const res = await fetch('/api/admin/toggle-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !currentActive }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error)
      return
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_active: !currentActive } : m))
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">관리자 관리</h1>
        <button
          onClick={() => {
            setShowInviteForm((v) => !v)
            setInviteError(null)
            setInviteSuccess(false)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-ping-red hover:bg-ping-red/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus size={16} />
          관리자 초대
        </button>
      </div>

      {showInviteForm && (
        <form
          onSubmit={handleInvite}
          className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            placeholder="초대할 이메일 주소"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
          />
          <button
            type="submit"
            disabled={inviting || inviteSuccess}
            className="px-5 py-2 bg-ping-red hover:bg-ping-red/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {inviteSuccess ? '초대 완료!' : inviting ? '발송 중...' : '초대 이메일 발송'}
          </button>
          {inviteError && (
            <p className="w-full text-sm text-ping-red mt-1">{inviteError}</p>
          )}
        </form>
      )}

      {loading ? (
        <p className="text-ping-gray text-sm">불러오는 중...</p>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-ping-gray text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">이름 / 이메일</th>
                <th className="text-left px-5 py-3">역할</th>
                <th className="text-left px-5 py-3">상태</th>
                <th className="text-left px-5 py-3">등록일</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium">{member.name ?? '—'}</p>
                    <p className="text-ping-gray text-xs mt-0.5">{member.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-ping-gray">
                      {member.role === 'super_admin' ? (
                        <>
                          <Shield size={13} className="text-ping-red" />
                          슈퍼어드민
                        </>
                      ) : (
                        <>
                          <User size={13} />
                          일반 관리자
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        member.is_active ? 'text-emerald-400' : 'text-ping-gray'
                      }`}
                    >
                      {member.is_active ? (
                        <><CheckCircle size={13} /> 활성</>
                      ) : (
                        <><XCircle size={13} /> 비활성</>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ping-gray">
                    {new Date(member.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {member.role !== 'super_admin' && (
                      <button
                        onClick={() => handleToggle(member.id, member.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          member.is_active
                            ? 'border-white/10 text-ping-gray hover:text-ping-red hover:border-ping-red/30'
                            : 'border-white/10 text-ping-gray hover:text-emerald-400 hover:border-emerald-400/30'
                        }`}
                      >
                        {member.is_active ? '비활성화' : '활성화'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <p className="text-center text-ping-gray text-sm py-10">등록된 관리자가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}
