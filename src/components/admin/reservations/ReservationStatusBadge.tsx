import type { ReservationStatus } from '@/lib/types'

const CONFIG: Record<ReservationStatus, { label: string; className: string }> = {
  pending:   { label: '대기중',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: '확정',    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  rejected:  { label: '거절',    className: 'bg-red-500/15 text-ping-red border-red-500/30' },
  cancelled: { label: '취소',    className: 'bg-white/10 text-ping-gray border-white/20' },
  in_use:    { label: '이용중',   className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: '완료',    className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  no_show:   { label: '노쇼',    className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
}

export default function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
