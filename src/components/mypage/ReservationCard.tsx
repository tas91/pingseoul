import Link from 'next/link'
import type { ReservationListItem } from '@/lib/types'
import ReservationStatusBadge from '@/components/admin/reservations/ReservationStatusBadge'

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00 입장',
  slot_02: '02:00 입장',
  slot_04: '04:00 입장',
  slot_06: '06:00 입장',
}

export default function ReservationCard({ item }: { item: ReservationListItem }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-ping-gray">{item.reservation_number}</span>
        <ReservationStatusBadge status={item.status} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ping-gray">방문일</span>
          <span className="text-sm text-white font-medium">{item.business_date}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ping-gray">타임슬롯</span>
          <span className="text-sm text-white">{SLOT_LABEL[item.arrival_slot] ?? item.arrival_slot}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ping-gray">테이블</span>
          <span className="text-sm text-white">
            {item.table ? `${item.table.type} (${item.table.id})` : '미배정'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ping-gray">인원</span>
          <span className="text-sm text-white">{item.people_count}명</span>
        </div>
      </div>

      {item.request_note && (
        <p className="text-xs text-ping-gray border-t border-white/5 pt-3">{item.request_note}</p>
      )}

      {item.status === 'rejected' && item.reject_reason && (
        <div className="border-t border-white/5 pt-3">
          <p className="text-xs text-ping-gray mb-0.5">거절 사유</p>
          <p className="text-sm text-ping-red">{item.reject_reason}</p>
        </div>
      )}

      <div className="border-t border-white/5 pt-3">
        <Link
          href={`/mypage/reservations/${item.id}`}
          className="text-xs text-ping-gray hover:text-white transition-colors"
        >
          상세보기 →
        </Link>
      </div>
    </div>
  )
}
