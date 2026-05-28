import { RefreshCw } from 'lucide-react'
import type { ReservationFilters, ReservationStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all',       label: '전체' },
  { value: 'pending',   label: '대기중' },
  { value: 'confirmed', label: '예약확정' },
  { value: 'in_use',    label: '이용중' },
  { value: 'completed', label: '완료' },
  { value: 'rejected',  label: '거절됨' },
  { value: 'cancelled', label: '취소됨' },
  { value: 'no_show',   label: '노쇼' },
]

interface Props {
  filters: ReservationFilters
  subscribed: boolean
  onFilterChange: (filters: ReservationFilters) => void
  onRefresh: () => void
}

export default function ReservationFilterBar({ filters, subscribed, onFilterChange, onRefresh }: Props) {
  const inputClass =
    'bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors'

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <input
        type="date"
        value={filters.business_date ?? ''}
        onChange={(e) => onFilterChange({ ...filters, business_date: e.target.value || undefined })}
        className={inputClass}
      />

      <select
        value={filters.status ?? 'all'}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value as ReservationFilters['status'] })}
        className={inputClass}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
            {opt.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="예약번호 검색"
        value={filters.keyword ?? ''}
        onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value || undefined })}
        className={`${inputClass} w-44`}
      />

      {!subscribed && (
        <button
          onClick={onRefresh}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-ping-gray border border-white/10 rounded-lg hover:text-white hover:border-white/30 transition-colors"
        >
          <RefreshCw size={13} />
          새로고침
        </button>
      )}
    </div>
  )
}
