'use client'

import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import ReservationStatusBadge from './reservations/ReservationStatusBadge'
import type { ReservationListItem, ReservationStatus } from '@/lib/types'

type DisplayStatus = 'available' | 'pending' | 'confirmed' | 'in_use' | 'blocked'
type TabKey = 'assigned' | 'pending'

interface TableWithStatus {
  id: string
  type: 'VIP' | 'Standard' | 'Standing'
  capacity: number
  is_active: boolean
  displayStatus: DisplayStatus
  reservation?: { reservation_number: string; people_count: number; status: string; count: number }
}

interface Props {
  table: TableWithStatus
  selectedTableIds: string[]
  date: string
  onClose: () => void
  onUpdated: () => void
}

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00', slot_02: '02:00', slot_04: '04:00', slot_06: '06:00',
}

const STATUS_COLOR: Record<DisplayStatus, string> = {
  available: 'text-emerald-400', pending: 'text-amber-400', confirmed: 'text-[#E63027]',
  in_use: 'text-violet-400', blocked: 'text-white/40',
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  available: '예약 가능', pending: '대기중', confirmed: '확정', in_use: '이용중', blocked: '사용 불가',
}

async function patchReservation(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/reservations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('업데이트 실패')
}

async function patchTable(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/tables/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('업데이트 실패')
}

// ── 배치된 예약 카드 ──────────────────────────────────────────────
function AssignedCard({ r, onUpdated }: { r: ReservationListItem; onUpdated: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const act = async (body: Record<string, unknown>) => {
    setBusy(true); setError(null)
    try { await patchReservation(r.id, body); onUpdated() }
    catch { setError('처리 중 오류가 발생했습니다.') }
    finally { setBusy(false) }
  }

  const btn = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50'

  return (
    <div className="bg-white/5 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ping-gray">{r.reservation_number}</span>
        <ReservationStatusBadge status={r.status} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
        <div><span className="text-ping-gray">게스트 </span><span className="text-white">{r.guest_name ?? '—'}</span></div>
        <div><span className="text-ping-gray">인원 </span><span className="text-white">{r.people_count}명</span></div>
        <div><span className="text-ping-gray">슬롯 </span><span className="text-white">{SLOT_LABEL[r.arrival_slot] ?? r.arrival_slot}</span></div>
      </div>
      {error && <p className="text-ping-red text-xs">{error}</p>}
      {(r.status === 'pending' || r.status === 'confirmed' || r.status === 'in_use') && (
        <div className="flex gap-2 pt-0.5">
          {r.status === 'pending' && (
            <button onClick={() => act({ status: 'confirmed' as ReservationStatus })} disabled={busy}
              className={`${btn} bg-emerald-600 hover:bg-emerald-500 text-white`}>확정</button>
          )}
          {r.status === 'confirmed' && (<>
            <button onClick={() => act({ status: 'in_use' as ReservationStatus })} disabled={busy}
              className={`${btn} bg-blue-600 hover:bg-blue-500 text-white`}>체크인</button>
            <button onClick={() => act({ status: 'no_show' as ReservationStatus })} disabled={busy}
              className={`${btn} border border-orange-500/50 text-orange-400 hover:bg-orange-500/10`}>노쇼</button>
          </>)}
          {r.status === 'in_use' && (
            <button onClick={() => act({ status: 'completed' as ReservationStatus })} disabled={busy}
              className={`${btn} bg-white/10 hover:bg-white/20 text-white`}>체크아웃</button>
          )}
        </div>
      )}
    </div>
  )
}

// ── 대기중 배치 카드 ──────────────────────────────────────────────
function PendingCard({
  r, tableId, selectedTableIds, onUpdated,
}: { r: ReservationListItem; tableId: string; selectedTableIds: string[]; onUpdated: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAssign = async () => {
    setBusy(true); setError(null)
    try {
      await patchReservation(r.id, { table_id: tableId })
      onUpdated()
    } catch { setError('배치 중 오류가 발생했습니다.') }
    finally { setBusy(false) }
  }

  const targetLabel = selectedTableIds.length > 1
    ? `T${selectedTableIds.join(', T')}에 배치`
    : `T${tableId}에 배치`

  return (
    <div className="bg-white/5 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ping-gray">{r.reservation_number}</span>
        <ReservationStatusBadge status={r.status} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
        <div><span className="text-ping-gray">게스트 </span><span className="text-white">{r.guest_name ?? '—'}</span></div>
        <div><span className="text-ping-gray">인원 </span><span className="text-white">{r.people_count}명</span></div>
        <div><span className="text-ping-gray">슬롯 </span><span className="text-white">{SLOT_LABEL[r.arrival_slot] ?? r.arrival_slot}</span></div>
        {r.table && (
          <div><span className="text-ping-gray">현재 </span><span className="text-amber-400">T{r.table.id}</span></div>
        )}
      </div>
      {error && <p className="text-ping-red text-xs">{error}</p>}
      <button onClick={handleAssign} disabled={busy}
        className="w-full py-1.5 rounded-lg text-xs font-medium bg-ping-red hover:bg-ping-red/80 text-white transition-colors disabled:opacity-50">
        {busy ? '배치 중...' : targetLabel}
      </button>
    </div>
  )
}

// ── 메인 패널 ─────────────────────────────────────────────────────
export default function TableDetailPanel({ table, selectedTableIds, date, onClose, onUpdated }: Props) {
  const [tab, setTab] = useState<TabKey>('assigned')
  const [assigned, setAssigned] = useState<ReservationListItem[]>([])
  const [pending, setPending] = useState<ReservationListItem[]>([])
  const [loadingAssigned, setLoadingAssigned] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true)
  const [busyBlock, setBusyBlock] = useState(false)

  const displayId = table.id.match(/^\d+$/) ? `T${table.id}` : table.id

  // 이 테이블에 배치된 예약 fetch
  const fetchAssigned = useCallback(async () => {
    setLoadingAssigned(true)
    const params = new URLSearchParams({ table_id: table.id, business_date: date })
    const res = await fetch(`/api/admin/reservations?${params}`)
    if (res.ok) {
      const json = await res.json()
      setAssigned(json.reservations ?? [])
    }
    setLoadingAssigned(false)
  }, [table.id, date])

  // 대기중 예약 전체 fetch (해당 날짜 기준, 슬롯 무관)
  const fetchPending = useCallback(async () => {
    setLoadingPending(true)
    const params = new URLSearchParams({ business_date: date, status: 'pending' })
    const res = await fetch(`/api/admin/reservations?${params}`)
    if (res.ok) {
      const json = await res.json()
      setPending(json.reservations ?? [])
    }
    setLoadingPending(false)
  }, [date])

  useEffect(() => { fetchAssigned(); fetchPending() }, [fetchAssigned, fetchPending])

  const handleUpdated = () => { fetchAssigned(); fetchPending(); onUpdated() }

  // 사용불가 토글
  const handleToggleBlock = async () => {
    setBusyBlock(true)
    try {
      await patchTable(table.id, { is_active: !table.is_active })
      onUpdated()
    } finally { setBusyBlock(false) }
  }

  const selectedLabel = selectedTableIds.length > 1
    ? `T${selectedTableIds.join(' · T')}`
    : displayId

  return (
    <aside className="w-72 shrink-0 bg-[#161616] border border-white/10 rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-white/10">
        <div>
          <p className="text-white font-semibold text-sm">
            {selectedLabel}
            <span className="ml-2 text-xs text-ping-gray font-normal">{table.type}</span>
          </p>
          <p className="text-xs text-ping-gray mt-0.5">수용 {table.capacity}명</p>
          <p className={`text-xs mt-0.5 font-medium ${STATUS_COLOR[table.displayStatus]}`}>
            {STATUS_LABEL[table.displayStatus]}
          </p>
        </div>
        <button onClick={onClose} className="text-ping-gray hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Slot + 다중선택 + 사용불가 버튼 */}
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/10 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-ping-gray">{date}</p>
          {selectedTableIds.length > 1 && (
            <p className="text-xs text-ping-red mt-0.5">{selectedTableIds.length}개 테이블 선택됨</p>
          )}
        </div>
        <button
          onClick={handleToggleBlock}
          disabled={busyBlock}
          className={`shrink-0 px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
            table.is_active
              ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
              : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400'
          }`}
        >
          {table.is_active ? '사용불가' : '사용가능'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {([['assigned', '배치된 예약'], ['pending', '대기중 배치']] as [TabKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tab === key ? 'text-white border-b-2 border-ping-red' : 'text-ping-gray hover:text-white'
            }`}
          >
            {label}
            {key === 'assigned' && assigned.length > 0 && (
              <span className="ml-1 text-[10px] bg-white/10 px-1 rounded-full">{assigned.length}</span>
            )}
            {key === 'pending' && pending.length > 0 && (
              <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded-full">{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {tab === 'assigned' && (
          loadingAssigned
            ? <p className="text-ping-gray text-xs text-center py-6">불러오는 중...</p>
            : assigned.length === 0
            ? <p className="text-ping-gray text-xs text-center py-6">배치된 예약 없음</p>
            : assigned.map(r => <AssignedCard key={r.id} r={r} onUpdated={handleUpdated} />)
        )}
        {tab === 'pending' && (
          loadingPending
            ? <p className="text-ping-gray text-xs text-center py-6">불러오는 중...</p>
            : pending.length === 0
            ? <p className="text-ping-gray text-xs text-center py-6">오늘 대기중 예약 없음</p>
            : pending.map(r => (
              <PendingCard key={r.id} r={r} tableId={table.id} selectedTableIds={selectedTableIds} onUpdated={handleUpdated} />
            ))
        )}
      </div>
    </aside>
  )
}
