'use client'

import { useState } from 'react'
import { useAdminReservations } from '@/hooks/useReservations'
import ReservationFilterBar from '@/components/admin/reservations/ReservationFilterBar'
import ReservationTable from '@/components/admin/reservations/ReservationTable'
import ReservationDetailPanel from '@/components/admin/reservations/ReservationDetailPanel'
import type { ReservationFilters } from '@/lib/types'

export default function ReservationsPage() {
  const [filters, setFilters] = useState<ReservationFilters>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { reservations, loading, error, subscribed, refetch } = useAdminReservations(filters)

  const selectedItem = reservations.find((r) => r.id === selectedId) ?? null

  const handleUpdated = () => {
    refetch()
    setSelectedId(null)
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">예약 현황</h1>
        {!subscribed && (
          <span className="text-xs text-amber-400 border border-amber-400/30 rounded-md px-2 py-1">
            실시간 연결 끊김
          </span>
        )}
      </div>

      <ReservationFilterBar
        filters={filters}
        subscribed={subscribed}
        onFilterChange={setFilters}
        onRefresh={refetch}
      />

      {error && (
        <p className="text-sm text-ping-red mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-ping-gray text-sm">불러오는 중...</p>
      ) : (
        <ReservationTable
          reservations={reservations}
          selectedId={selectedId}
          onSelect={(r) => setSelectedId(r.id)}
        />
      )}

      {selectedItem && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedId(null)}
          />
          <ReservationDetailPanel
            reservation={selectedItem}
            onClose={() => setSelectedId(null)}
            onUpdated={handleUpdated}
          />
        </>
      )}
    </div>
  )
}
