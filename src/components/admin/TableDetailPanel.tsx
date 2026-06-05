'use client'

import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import ReservationStatusBadge from './reservations/ReservationStatusBadge'
import type { ReservationListItem, ReservationStatus } from '@/lib/types'

type DisplayStatus = 'available' | 'pending' | 'confirmed' | 'in_use' | 'blocked'

interface TableWithStatus {
  id: string
  type: 'VIP' | 'Standard' | 'Standing'
  capacity: number
  is_active: boolean
  displayStatus: DisplayStatus
  reservation?: {
    reservation_number: string
    people_count: number
    status: string
    count: number
  }
}

interface Props {
  table: TableWithStatus
  date: string
  slot: string
  onClose: () => void
  onUpdated: () => void
}

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00',
  slot_02: '02:00',
  slot_04: '04:00',
  slot_06: '06:00',
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  available: '예약 가능',
  pending:   '대기중',
  confirmed: '확정',
  in_use:    '이용중',
  blocked:   '사용 불가',
}

const STATUS_COLOR: Record<DisplayStatus, string> = {
  available: 'text-emerald-400',
  pending:   'text-amber-400',
  confirmed: 'text-[#E63027]',
  in_use:    'text-violet-400',
  blocked:   'text-white/30',
}

async function patchReservation(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/reservations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('업데이트 실패')
}

function ReservationCard({
  r,
  onUpdated,
}: {
  r: ReservationListItem
  onUpdated: () => void
}) {
  const [busy, setBusy] = useState(false)
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

  const btnBase = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50'

  return (
    <div className="bg-white/5 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ping-gray">{r.reservation_number}</span>
        <ReservationStatusBadge status={r.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <span className="text-xs text-ping-gray">게스트</span>
          <p className="text-white">{r.guest_name ?? '—'}</p>
        </div>
        <div>
          <span className="text-xs text-ping-gray">인원</span>
          <p className="text-white">{r.people_count}명</p>
        </div>
        <div>
          <span className="text-xs text-ping-gray">슬롯</span>
          <p className="text-white">{SLOT_LABEL[r.arrival_slot] ?? r.arrival_slot}</p>
        </div>
      </div>

      {error && <p className="text-ping-red text-xs">{error}</p>}

      {(r.status === 'pending' || r.status === 'confirmed' || r.status === 'in_use') && (
        <div className="flex gap-2">
          {r.status === 'pending' && (
            <button
              onClick={() => act({ status: 'confirmed' as ReservationStatus })}
              disabled={busy}
              className={`${btnBase} bg-emerald-600 hover:bg-emerald-500 text-white`}
            >
              확정
            </button>
          )}
          {r.status === 'confirmed' && (
            <>
              <button
                onClick={() => act({ status: 'in_use' as ReservationStatus })}
                disabled={busy}
                className={`${btnBase} bg-blue-600 hover:bg-blue-500 text-white`}
              >
                체크인
              </button>
              <button
                onClick={() => act({ status: 'no_show' as ReservationStatus })}
                disabled={busy}
                className={`${btnBase} border border-orange-500/50 text-orange-400 hover:bg-orange-500/10`}
              >
                노쇼
              </button>
            </>
          )}
          {r.status === 'in_use' && (
            <button
              onClick={() => act({ status: 'completed' as ReservationStatus })}
              disabled={busy}
              className={`${btnBase} bg-white/10 hover:bg-white/20 text-white`}
            >
              체크아웃
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function TableDetailPanel({ table, date, slot, onClose, onUpdated }: Props) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([])
  const [loading, setLoading] = useState(true)

  const displayId = table.id.match(/^\d+$/) ? `T${table.id}` : table.id

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ table_id: table.id, business_date: date })
    const res = await fetch(`/api/admin/reservations?${params}`)
    if (res.ok) {
      const json = await res.json()
      const all: ReservationListItem[] = json.reservations ?? []
      setReservations(all.filter((r) => r.arrival_slot === slot))
    }
    setLoading(false)
  }, [table.id, date, slot])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const handleUpdated = () => {
    fetchReservations()
    onUpdated()
  }

  return (
    <aside className="w-72 shrink-0 bg-[#161616] border border-white/10 rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-4 border-b border-white/10">
        <div>
          <p className="text-white font-semibold text-base">
            테이블 {displayId}
            <span className="ml-2 text-xs text-ping-gray font-normal">{table.type}</span>
          </p>
          <p className="text-xs text-ping-gray mt-0.5">수용 {table.capacity}명</p>
          <p className={`text-xs mt-1 font-medium ${STATUS_COLOR[table.displayStatus]}`}>
            {STATUS_LABEL[table.displayStatus]}
          </p>
        </div>
        <button onClick={onClose} className="text-ping-gray hover:text-white transition-colors mt-0.5">
          <X size={18} />
        </button>
      </div>

      {/* Slot info */}
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/10">
        <p className="text-xs text-ping-gray">
          {date} · {SLOT_LABEL[slot] ?? slot} 슬롯
        </p>
      </div>

      {/* Reservations */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-ping-gray text-xs text-center py-6">불러오는 중...</p>
        ) : reservations.length === 0 ? (
          <p className="text-ping-gray text-xs text-center py-6">해당 슬롯에 예약 없음</p>
        ) : (
          reservations.map((r) => (
            <ReservationCard key={r.id} r={r} onUpdated={handleUpdated} />
          ))
        )}
      </div>
    </aside>
  )
}
