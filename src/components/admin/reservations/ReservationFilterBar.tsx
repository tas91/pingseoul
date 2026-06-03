'use client'

import { Search, X } from 'lucide-react'
import type { ReservationFilters, ReservationStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all',       label: '전체' },
  { value: 'pending',   label: '대기중' },
  { value: 'confirmed', label: '확정' },
  { value: 'in_use',    label: '이용중' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
  { value: 'rejected',  label: '거절' },
  { value: 'no_show',   label: '노쇼' },
]

interface Props {
  filters: ReservationFilters
  onChange: (next: Partial<ReservationFilters>) => void
}

export default function ReservationFilterBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* 날짜 */}
      <input
        type="date"
        value={filters.business_date ?? ''}
        onChange={(e) => onChange({ business_date: e.target.value || undefined })}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                   focus:outline-none focus:border-ping-red transition-colors [color-scheme:dark]"
      />

      {/* 상태 */}
      <select
        value={filters.status ?? 'all'}
        onChange={(e) => onChange({ status: e.target.value as ReservationFilters['status'] })}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                   focus:outline-none focus:border-ping-red transition-colors"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
            {opt.label}
          </option>
        ))}
      </select>

      {/* 검색 */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ping-gray pointer-events-none" />
        <input
          type="text"
          value={filters.keyword ?? ''}
          onChange={(e) => onChange({ keyword: e.target.value || undefined })}
          placeholder="예약번호 · 예약자명 · 연락처"
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-8 py-2 text-sm text-white
                     placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
        />
        {filters.keyword && (
          <button
            onClick={() => onChange({ keyword: undefined })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ping-gray hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
