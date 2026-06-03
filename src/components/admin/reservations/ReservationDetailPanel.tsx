'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import ReservationStatusBadge from './ReservationStatusBadge'
import type { ReservationListItem, ReservationStatus } from '@/lib/types'

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00',
  slot_02: '02:00',
  slot_04: '04:00',
  slot_06: '06:00',
}

const INCENTIVE_LABEL: Record<string, string> = {
  champagne_free: '샴페인 무료',
  discount_10: '10% 할인',
  discount_5: '5% 할인',
  none: '—',
}

interface Props {
  reservation: ReservationListItem
  onClose: () => void
  onUpdated: () => void
}

async function patchReservation(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/reservations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('업데이트 실패')
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-ping-gray uppercase tracking-wide">{label}</span>
      <span className="text-white text-sm">{value ?? '—'}</span>
    </div>
  )
}

export default function ReservationDetailPanel({ reservation: r, onClose, onUpdated }: Props) {
  const [busy, setBusy] = useState(false)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [memo, setMemo] = useState(r.admin_memo ?? '')
  const [memoEditing, setMemoEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const act = async (body: Record<string, unknown>) => {
    setBusy(true)
    setError(null)
    try {
      await patchReservation(r.id, body)
      onUpdated()
    } catch {
      setError('처리 중 오류가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  const handleApprove = () => act({ status: 'confirmed' as ReservationStatus })
  const handleReject = () => {
    if (!rejectReason.trim()) return
    act({ status: 'rejected' as ReservationStatus, reject_reason: rejectReason.trim() })
    setRejectMode(false)
  }
  const handleCheckin = () => act({ status: 'in_use' as ReservationStatus })
  const handleCheckout = () => act({ status: 'completed' as ReservationStatus })
  const handleMemoSave = () => {
    act({ admin_memo: memo })
    setMemoEditing(false)
  }

  const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50'

  return (
    <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-[#161616] border-l border-white/10 shadow-2xl overflow-y-auto z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <p className="font-mono text-xs text-ping-gray mb-1">{r.reservation_number}</p>
          <ReservationStatusBadge status={r.status} />
        </div>
        <button onClick={onClose} className="text-ping-gray hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-5 flex flex-col gap-5">
        {/* Guest */}
        <section className="grid grid-cols-2 gap-4">
          <Row label="고객명" value={r.guest_name} />
          <Row label="전화번호" value={r.guest_phone} />
          <Row label="이메일" value={r.guest_email} />
          <Row label="인원" value={r.people_count ? `${r.people_count}명` : null} />
        </section>

        <hr className="border-white/10" />

        {/* Reservation info */}
        <section className="grid grid-cols-2 gap-4">
          <Row label="영업일" value={r.business_date} />
          <Row label="입장 슬롯" value={SLOT_LABEL[r.arrival_slot]} />
          <Row label="테이블" value={r.table ? `${r.table.id} (${r.table.type})` : null} />
          <Row label="인센티브" value={INCENTIVE_LABEL[r.incentive_type]} />
        </section>

        {r.request_note && (
          <>
            <hr className="border-white/10" />
            <section>
              <Row label="요청 메모" value={r.request_note} />
            </section>
          </>
        )}

        {r.reject_reason && (
          <>
            <hr className="border-white/10" />
            <section>
              <Row label="거절 사유" value={r.reject_reason} />
            </section>
          </>
        )}

        <hr className="border-white/10" />

        {/* Admin memo */}
        <section>
          <span className="text-xs text-ping-gray uppercase tracking-wide">관리자 메모</span>
          {memoEditing ? (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors resize-none"
                placeholder="내부 메모 입력..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleMemoSave}
                  disabled={busy}
                  className={`${btnBase} bg-ping-red hover:bg-ping-red/90 text-white`}
                >
                  저장
                </button>
                <button
                  onClick={() => { setMemo(r.admin_memo ?? ''); setMemoEditing(false) }}
                  className={`${btnBase} border border-white/10 text-ping-gray hover:text-white`}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-start justify-between gap-2">
              <p className="text-white text-sm whitespace-pre-wrap">{memo || '—'}</p>
              <button
                onClick={() => setMemoEditing(true)}
                className="text-xs text-ping-gray hover:text-white shrink-0 transition-colors"
              >
                편집
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Action buttons */}
      {(r.status === 'pending' || r.status === 'confirmed' || r.status === 'in_use') && (
        <div className="px-6 py-5 border-t border-white/10 flex flex-col gap-3">
          {error && <p className="text-ping-red text-sm">{error}</p>}

          {r.status === 'pending' && !rejectMode && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={busy}
                className={`${btnBase} flex-1 bg-emerald-600 hover:bg-emerald-500 text-white`}
              >
                승인
              </button>
              <button
                onClick={() => setRejectMode(true)}
                disabled={busy}
                className={`${btnBase} flex-1 border border-ping-red/50 text-ping-red hover:bg-ping-red/10`}
              >
                거절
              </button>
            </div>
          )}

          {r.status === 'pending' && rejectMode && (
            <div className="flex flex-col gap-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                placeholder="거절 사유를 입력하세요"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={busy || !rejectReason.trim()}
                  className={`${btnBase} flex-1 bg-ping-red hover:bg-ping-red/90 text-white`}
                >
                  거절 확정
                </button>
                <button
                  onClick={() => setRejectMode(false)}
                  className={`${btnBase} border border-white/10 text-ping-gray hover:text-white`}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {r.status === 'confirmed' && (
            <button
              onClick={handleCheckin}
              disabled={busy}
              className={`${btnBase} w-full bg-blue-600 hover:bg-blue-500 text-white`}
            >
              체크인
            </button>
          )}

          {r.status === 'in_use' && (
            <button
              onClick={handleCheckout}
              disabled={busy}
              className={`${btnBase} w-full bg-white/10 hover:bg-white/20 text-white`}
            >
              체크아웃
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
