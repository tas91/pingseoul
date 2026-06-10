'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { TimeSlot } from '@/lib/types'

const SLOT_OPTIONS: { value: TimeSlot; label: string }[] = [
  { value: 'slot_00', label: '00:00' },
  { value: 'slot_02', label: '02:00' },
  { value: 'slot_04', label: '04:00' },
  { value: 'slot_06', label: '06:00' },
]

interface TableOption {
  id: string
  type: string
}

interface Props {
  onClose: () => void
  onSuccess: () => void
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DirectReservationModal({ onClose, onSuccess }: Props) {
  const [tables, setTables] = useState<TableOption[]>([])
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestInstagram, setGuestInstagram] = useState('')
  const [visitDate, setVisitDate] = useState(todayStr)
  const [arrivalSlot, setArrivalSlot] = useState<TimeSlot>('slot_00')
  const [peopleCount, setPeopleCount] = useState(1)
  const [status, setStatus] = useState<'confirmed' | 'pending'>('confirmed')
  const [tableId, setTableId] = useState('')
  const [adminMemo, setAdminMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/tables')
      .then(r => r.json())
      .then(d => setTables(d.tables ?? []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: guestName,
          guest_phone: guestPhone || undefined,
          guest_instagram: guestInstagram || undefined,
          visit_date: visitDate,
          arrival_slot: arrivalSlot,
          people_count: peopleCount,
          status,
          table_id: tableId || undefined,
          admin_memo: adminMemo || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '등록 실패')
        return
      }
      onSuccess()
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors'
  const labelCls = 'text-xs text-ping-gray uppercase tracking-wide mb-1 block'

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-[#161616] border-l border-white/10 shadow-2xl overflow-y-auto z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-white font-semibold">예약 직접 등록</h2>
          <button onClick={onClose} className="text-ping-gray hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 flex flex-col gap-5">
          {/* 고객 정보 */}
          <section className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>
                예약자명 <span className="text-ping-red normal-case">*</span>
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="홍길동"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>연락처</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>인스타그램</label>
                <input
                  type="text"
                  value={guestInstagram}
                  onChange={e => setGuestInstagram(e.target.value)}
                  placeholder="@handle"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          <hr className="border-white/10" />

          {/* 예약 정보 */}
          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  방문일 <span className="text-ping-red normal-case">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  타임슬롯 <span className="text-ping-red normal-case">*</span>
                </label>
                <select
                  required
                  value={arrivalSlot}
                  onChange={e => setArrivalSlot(e.target.value as TimeSlot)}
                  className={inputCls}
                >
                  {SLOT_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  인원수 <span className="text-ping-red normal-case">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={peopleCount}
                  onChange={e => setPeopleCount(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>테이블</label>
                <select
                  value={tableId}
                  onChange={e => setTableId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">없음</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.id} ({t.type})</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <hr className="border-white/10" />

          {/* 초기 상태 */}
          <section>
            <label className={labelCls}>
              초기 상태 <span className="text-ping-red normal-case">*</span>
            </label>
            <div className="flex gap-6 mt-1">
              {(['confirmed', 'pending'] as const).map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-ping-red"
                  />
                  <span className="text-sm text-white">{s === 'confirmed' ? '확정' : '대기'}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 관리자 메모 */}
          <section>
            <label className={labelCls}>관리자 메모</label>
            <textarea
              value={adminMemo}
              onChange={e => setAdminMemo(e.target.value)}
              rows={3}
              placeholder="내부 메모 입력..."
              className={`${inputCls} resize-none`}
            />
          </section>

          {error && <p className="text-ping-red text-sm">{error}</p>}

          <div className="flex gap-3 mt-auto pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-ping-red hover:bg-ping-red/90 text-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '등록 중...' : '예약 등록'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-ping-gray hover:text-white transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
