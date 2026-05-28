'use client'

import { useState } from 'react'
import { useAdminReservations } from '@/hooks/useReservations'
import ReservationFilterBar from '@/components/admin/reservations/ReservationFilterBar'
import ReservationTable from '@/components/admin/reservations/ReservationTable'
import ReservationDetailPanel from '@/components/admin/reservations/ReservationDetailPanel'
import type { ReservationFilters, ReservationListItem } from '@/lib/types'

export default function ReservationsPage() {
  const [filters, setFilters] = useState<ReservationFilters>({})
  const [selected, setSelected] = useState<ReservationListItem | null>(null)
  const { reservations, loading, subscribed, refetch } = useAdminReservations(filters)

  const handleUpdated = () => {
    refetch()
    setSelected(null)
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

      {loading ? (
        <p className="text-ping-gray text-sm">불러오는 중...</p>
      ) : (
        <ReservationTable
          reservations={reservations}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
      )}

      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelected(null)}
          />
          <ReservationDetailPanel
            reservation={selected}
            onClose={() => setSelected(null)}
            onUpdated={handleUpdated}
          />
        </>
      )}
    </div>
  )
}
