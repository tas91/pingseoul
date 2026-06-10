'use client'

import type { ReservationStatus } from '@/lib/types'

const TABS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all',       label: '전체' },
  { value: 'pending',   label: '대기중' },
  { value: 'confirmed', label: '확정' },
  { value: 'in_use',    label: '이용중' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
]

interface Props {
  value: ReservationStatus | 'all'
  onChange: (value: ReservationStatus | 'all') => void
}

export default function ReservationStatusTab({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            value === tab.value
              ? 'bg-ping-red text-white'
              : 'bg-white/5 text-ping-gray hover:text-white border border-white/10'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
