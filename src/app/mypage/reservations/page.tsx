'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useMyReservations } from '@/hooks/useReservations'
import ReservationStatusTab from '@/components/mypage/ReservationStatusTab'
import ReservationCard from '@/components/mypage/ReservationCard'
import type { ReservationFilters, ReservationStatus } from '@/lib/types'

export default function MyReservationsPage() {
  const [filters, setFilters] = useState<ReservationFilters>({ status: 'all' })
  const { reservations, loading, error } = useMyReservations(filters)

  function handleStatusChange(status: ReservationStatus | 'all') {
    setFilters((prev) => ({ ...prev, status }))
  }

  function handleKeyword(keyword: string) {
    setFilters((prev) => ({ ...prev, keyword: keyword || undefined }))
  }

  return (
    <div className="min-h-screen bg-[#111] text-white px-4 py-20">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-8">예약 내역</h1>

        {/* 예약번호 검색 */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ping-gray pointer-events-none" />
          <input
            type="text"
            value={filters.keyword ?? ''}
            onChange={(e) => handleKeyword(e.target.value)}
            placeholder="예약번호로 검색"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-8 py-2.5 text-sm text-white
                       placeholder:text-white/30 focus:outline-none focus:border-ping-red transition-colors"
          />
          {filters.keyword && (
            <button
              onClick={() => handleKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ping-gray hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 상태 탭 */}
        <ReservationStatusTab
          value={filters.status ?? 'all'}
          onChange={handleStatusChange}
        />

        {/* 목록 */}
        {error && (
          <p className="text-sm text-ping-red text-center py-8">{error}</p>
        )}

        {loading ? (
          <p className="text-ping-gray text-sm text-center py-12">불러오는 중...</p>
        ) : reservations.length === 0 ? (
          <p className="text-ping-gray text-sm text-center py-12">예약 내역이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reservations.map((item) => (
              <ReservationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
