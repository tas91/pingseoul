'use client'

import { useState } from 'react'
import { useAdminReservations } from '@/hooks/useReservations'
import ReservationFilterBar from '@/components/admin/reservations/ReservationFilterBar'
import ReservationTable from '@/components/admin/reservations/ReservationTable'
import type { ReservationFilters } from '@/lib/types'

export default function ReservationsPage() {
  const [filters, setFilters] = useState<ReservationFilters>({ status: 'all' })
  const { reservations, loading, error } = useAdminReservations(filters)

  function handleFilterChange(next: Partial<ReservationFilters>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">예약 현황</h1>
        <span className="text-xs text-ping-gray">
          총 {loading ? '—' : reservations.length}건
        </span>
      </div>

      <ReservationFilterBar filters={filters} onChange={handleFilterChange} />

      {error && (
        <p className="text-sm text-ping-red mb-4">{error}</p>
      )}

      <ReservationTable items={reservations} loading={loading} />
    </div>
  )
}
