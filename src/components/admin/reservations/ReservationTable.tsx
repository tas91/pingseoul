import type { ReservationListItem } from '@/lib/types'
import ReservationRow from './ReservationRow'

const HEADERS = [
  '예약번호', '신청일시', '영업일', '타임슬롯',
  '예약자명', '인원', '테이블', '상태', '인센티브', '기타',
]

interface Props {
  items: ReservationListItem[]
  loading: boolean
  onRowClick?: (id: string) => void
}

export default function ReservationTable({ items, loading, onRowClick }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-white/10">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-xs text-ping-gray uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-ping-gray text-sm">
                불러오는 중...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-ping-gray text-sm">
                예약 내역이 없습니다.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <ReservationRow
                key={item.id}
                item={item}
                onClick={onRowClick ? () => onRowClick(item.id) : undefined}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
