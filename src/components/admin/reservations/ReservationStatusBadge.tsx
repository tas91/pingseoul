import type { ReservationStatus } from '@/lib/types'

const CONFIG: Record<ReservationStatus, { label: string; className: string }> = {
  pending:   { label: '대기중',   className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  confirmed: { label: '예약확정', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  rejected:  { label: '거절됨',   className: 'bg-ping-red/15 text-ping-red border-ping-red/30' },
  cancelled: { label: '취소됨',   className: 'bg-white/5 text-white/40 border-white/10' },
  in_use:    { label: '이용중',   className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: '완료',     className: 'bg-white/5 text-white/60 border-white/10' },
  no_show:   { label: '노쇼',     className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
}

export default function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
