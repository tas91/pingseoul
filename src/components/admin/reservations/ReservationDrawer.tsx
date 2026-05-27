'use client'

import { useEffect, useState } from 'react'
import { X, Check, XCircle } from 'lucide-react'
import type { ReservationListItem, ReservationAction } from '@/lib/types'
import ReservationStatusBadge from './ReservationStatusBadge'

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00',
  slot_02: '02:00',
  slot_04: '04:00',
  slot_06: '06:00',
}

interface Props {
  item: ReservationListItem | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<ReservationListItem>) => void
}

export default function ReservationDrawer({ item, onClose, onUpdate }: Props) {
  const [memoValue, setMemoValue] = useState('')
  const [savingMemo, setSavingMemo] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // item이 바뀔 때마다 상태 초기화
  useEffect(() => {
    setMemoValue(item?.admin_memo ?? '')
    setRejecting(false)
    setRejectReason('')
    setActionError(null)
  }, [item?.id])

  if (!item) return null

  async function callAction(body: ReservationAction) {
    if (!item) return
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/admin/reservations/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? '처리 중 오류가 발생했습니다.')
        return
      }
      onUpdate(item.id, data.reservation)
      onClose()
    } catch {
      setActionError('네트워크 오류가 발생했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleMemoSave() {
    if (!item) return
    setSavingMemo(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/admin/reservations/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'memo', admin_memo: memoValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? '메모 저장 중 오류가 발생했습니다.')
        return
      }
      onUpdate(item.id, { admin_memo: memoValue })
    } catch {
      setActionError('네트워크 오류가 발생했습니다.')
    } finally {
      setSavingMemo(false)
    }
  }

  function handleRejectConfirm() {
    if (!rejectReason.trim()) {
      setActionError('거절 사유를 입력해 주세요.')
      return
    }
    callAction({ action: 'reject', reject_reason: rejectReason.trim() })
  }

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* 드로어 패널 */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#1a1a1a] border-l border-white/10 z-50 flex flex-col overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold">예약 상세</span>
            <ReservationStatusBadge status={item.status} />
          </div>
          <button
            onClick={onClose}
            className="text-ping-gray hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-5 py-5">
          {/* 예약 정보 */}
          <section>
            <h3 className="text-xs text-ping-gray uppercase tracking-wide mb-3">예약 정보</h3>
            <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-2.5">
              <Row label="예약번호" value={item.reservation_number} mono />
              <Row
                label="신청일시"
                value={new Date(item.created_at).toLocaleString('ko-KR', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                })}
              />
              <Row label="영업일" value={item.business_date} />
              <Row label="타임슬롯" value={`${SLOT_LABEL[item.arrival_slot] ?? item.arrival_slot} 입장`} />
              <Row label="인원" value={`${item.people_count}명`} />
              <Row
                label="테이블"
                value={item.table ? `${item.table.type} (${item.table.id})` : '미배정'}
              />
            </div>
          </section>

          {/* 예약자 정보 */}
          <section>
            <h3 className="text-xs text-ping-gray uppercase tracking-wide mb-3">예약자 정보</h3>
            <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-2.5">
              <Row label="예약자명" value={item.guest_name ?? '—'} />
              <Row label="연락처" value={item.guest_phone ?? '—'} />
              <Row label="인스타그램" value={item.guest_instagram ?? '—'} />
              {item.request_note && (
                <Row label="기타사항" value={item.request_note} />
              )}
            </div>
          </section>

          {/* 관리자 메모 */}
          <section>
            <h3 className="text-xs text-ping-gray uppercase tracking-wide mb-3">관리자 메모</h3>
            <textarea
              value={memoValue}
              onChange={(e) => setMemoValue(e.target.value)}
              placeholder="내부 메모를 입력하세요 (고객에게 노출되지 않습니다)"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                         placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors resize-none"
            />
            <button
              onClick={handleMemoSave}
              disabled={savingMemo}
              className="mt-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50
                         text-white text-xs font-medium rounded-lg transition-colors"
            >
              {savingMemo ? '저장 중...' : '저장'}
            </button>
          </section>

          {/* 에러 메시지 */}
          {actionError && (
            <p className="text-sm text-ping-red">{actionError}</p>
          )}

          {/* 승인 / 거절 액션 (pending 상태일 때만) */}
          {item.status === 'pending' && (
            <section className="border-t border-white/10 pt-5">
              <h3 className="text-xs text-ping-gray uppercase tracking-wide mb-3">예약 처리</h3>

              {!rejecting ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => callAction({ action: 'approve' })}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5
                               bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30
                               text-emerald-400 text-sm font-medium rounded-lg transition-colors
                               disabled:opacity-50"
                  >
                    <Check size={15} />
                    승인
                  </button>
                  <button
                    onClick={() => { setRejecting(true); setActionError(null) }}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5
                               bg-red-500/20 hover:bg-red-500/30 border border-red-500/30
                               text-ping-red text-sm font-medium rounded-lg transition-colors
                               disabled:opacity-50"
                  >
                    <XCircle size={15} />
                    거절
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-ping-gray">거절 사유</label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    maxLength={255}
                    placeholder="거절 사유를 입력하세요"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                               placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleRejectConfirm}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-ping-red hover:bg-ping-red/90 disabled:opacity-50
                                 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {actionLoading ? '처리 중...' : '거절 확인'}
                    </button>
                    <button
                      onClick={() => { setRejecting(false); setRejectReason(''); setActionError(null) }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10
                                 text-ping-gray text-sm rounded-lg transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-ping-gray shrink-0">{label}</span>
      <span className={`text-sm text-white text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
