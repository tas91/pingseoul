'use client'

import { RefreshCw } from 'lucide-react'
import { useMyReservations } from '@/hooks/useReservations'
import ReservationCard from '@/components/mypage/ReservationCard'

export default function MyReservationsPage() {
  const { reservations, loading, subscribed, refetch } = useMyReservations()

  return (
    <div className="min-h-screen bg-[#111] text-white px-4 py-20">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">내 예약</h1>
          {!subscribed && (
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-xs text-ping-gray border border-white/10 rounded-lg px-3 py-2 hover:text-white hover:border-white/30 transition-colors"
            >
              <RefreshCw size={13} />
              새로고침
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-ping-gray text-sm text-center py-10">불러오는 중...</p>
        ) : reservations.length === 0 ? (
          <p className="text-ping-gray text-sm text-center py-10">예약 내역이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reservations.map((r) => (
              <ReservationCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
