import type { ReservationListItem, ReservationStatus } from '@/lib/types'

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00',
  slot_02: '02:00',
  slot_04: '04:00',
  slot_06: '06:00',
}

const STATUS_CONFIG: Record<ReservationStatus, { label: string; className: string }> = {
  pending:   { label: '대기중',   className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  confirmed: { label: '예약확정', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  rejected:  { label: '거절됨',   className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  cancelled: { label: '취소됨',   className: 'bg-white/5 text-white/40 border-white/10' },
  in_use:    { label: '이용중',   className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: '완료',     className: 'bg-white/5 text-white/60 border-white/10' },
  no_show:   { label: '노쇼',     className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
}

export default function ReservationCard({ r }: { r: ReservationListItem }) {
  const { label, className } = STATUS_CONFIG[r.status]

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-ping-gray">{r.reservation_number}</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${className}`}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-ping-gray">영업일</span>
          <span className="text-white">{r.business_date}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-ping-gray">입장 슬롯</span>
          <span className="text-white">{SLOT_LABEL[r.arrival_slot]}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-ping-gray">인원</span>
          <span className="text-white">{r.people_count}명</span>
        </div>
        {r.table && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ping-gray">테이블</span>
            <span className="text-white">{r.table.id}</span>
          </div>
        )}
      </div>

      {r.reject_reason && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          거절 사유: {r.reject_reason}
        </p>
      )}

      {r.request_note && (
        <p className="text-xs text-ping-gray border-t border-white/5 pt-3">
          요청: {r.request_note}
        </p>
      )}
    </div>
  )
}
