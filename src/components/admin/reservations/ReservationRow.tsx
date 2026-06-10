import type { ReservationListItem } from '@/lib/types'
import ReservationStatusBadge from './ReservationStatusBadge'

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00',
  slot_02: '02:00',
  slot_04: '04:00',
  slot_06: '06:00',
}

const INCENTIVE_LABEL: Record<string, string> = {
  champagne_free: '샴페인 무료',
  discount_10:    '10% 할인',
  discount_5:     '5% 할인',
  none:           '—',
}

export default function ReservationRow({
  item,
  onClick,
}: {
  item: ReservationListItem
  onClick?: () => void
}) {
  return (
    <tr
      className={`border-b border-white/5 last:border-0 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-white/[0.05]' : 'hover:bg-white/[0.02]'
      }`}
      onClick={onClick}
    >
      <td className="px-4 py-3 text-xs text-ping-gray font-mono whitespace-nowrap">
        {item.reservation_number}
      </td>
      <td className="px-4 py-3 text-xs text-ping-gray whitespace-nowrap">
        {new Date(item.created_at).toLocaleString('ko-KR', {
          month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        })}
      </td>
      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
        {item.business_date}
      </td>
      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
        {SLOT_LABEL[item.arrival_slot] ?? item.arrival_slot}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-white">{item.guest_name ?? '—'}</p>
        {item.guest_phone && (
          <p className="text-xs text-ping-gray mt-0.5">{item.guest_phone}</p>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-white text-center">
        {item.people_count}
      </td>
      <td className="px-4 py-3 text-sm text-ping-gray">
        {item.table ? `${item.table.type} (${item.table.id})` : '—'}
      </td>
      <td className="px-4 py-3">
        <ReservationStatusBadge status={item.status} />
      </td>
      <td className="px-4 py-3 text-xs text-ping-gray whitespace-nowrap">
        {INCENTIVE_LABEL[item.incentive_type] ?? '—'}
      </td>
      <td className="px-4 py-3 text-xs text-ping-gray max-w-[160px]">
        {item.request_note
          ? <span className="line-clamp-2">{item.request_note}</span>
          : '—'}
      </td>
    </tr>
  )
}
