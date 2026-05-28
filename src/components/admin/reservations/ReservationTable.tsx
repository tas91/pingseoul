import ReservationStatusBadge from './ReservationStatusBadge'
import type { ReservationListItem } from '@/lib/types'

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00',
  slot_02: '02:00',
  slot_04: '04:00',
  slot_06: '06:00',
}

interface Props {
  reservations: ReservationListItem[]
  selectedId: string | null
  onSelect: (r: ReservationListItem) => void
}

export default function ReservationTable({ reservations, selectedId, onSelect }: Props) {
  if (reservations.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl py-16 text-center text-ping-gray text-sm">
        조건에 맞는 예약이 없습니다.
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-ping-gray text-xs uppercase tracking-wide">
            <th className="text-left px-5 py-3">예약번호</th>
            <th className="text-left px-5 py-3">고객</th>
            <th className="text-left px-5 py-3">날짜 / 슬롯</th>
            <th className="text-left px-5 py-3">인원</th>
            <th className="text-left px-5 py-3">상태</th>
            <th className="text-left px-5 py-3">테이블</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr
              key={r.id}
              onClick={() => onSelect(r)}
              className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
                selectedId === r.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <td className="px-5 py-4 font-mono text-xs text-white/70">{r.reservation_number}</td>
              <td className="px-5 py-4">
                <p className="text-white font-medium">{r.guest_name ?? '—'}</p>
                <p className="text-ping-gray text-xs mt-0.5">{r.guest_phone ?? ''}</p>
              </td>
              <td className="px-5 py-4 text-white/80">
                <p>{r.business_date}</p>
                <p className="text-ping-gray text-xs">{SLOT_LABEL[r.arrival_slot]}</p>
              </td>
              <td className="px-5 py-4 text-white/80">{r.people_count}명</td>
              <td className="px-5 py-4">
                <ReservationStatusBadge status={r.status} />
              </td>
              <td className="px-5 py-4 text-white/60">{r.table?.id ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
