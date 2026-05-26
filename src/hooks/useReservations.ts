'use client'

import { useEffect, useState, useCallback } from 'react'
import type { ReservationFilters, ReservationListItem } from '@/lib/types'

function buildParams(filters: ReservationFilters): string {
  const params = new URLSearchParams()
  if (filters.business_date) params.set('business_date', filters.business_date)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.table_id) params.set('table_id', filters.table_id)
  if (filters.keyword) params.set('keyword', filters.keyword)
  return params.toString()
}

export function useAdminReservations(filters: ReservationFilters) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    const qs = buildParams(filters)
    const res = await fetch(`/api/admin/reservations${qs ? `?${qs}` : ''}`)
    if (!res.ok) {
      setError('예약 목록을 불러오지 못했습니다.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setReservations(data.reservations)
    setLoading(false)
  }, [
    filters.business_date,
    filters.status,
    filters.table_id,
    filters.keyword,
  ])

  useEffect(() => { fetch_() }, [fetch_])

  return { reservations, loading, error, refetch: fetch_ }
}

export function useMyReservations(filters: ReservationFilters) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    const qs = buildParams(filters)
    const res = await fetch(`/api/user/reservations${qs ? `?${qs}` : ''}`)
    if (!res.ok) {
      setError('예약 목록을 불러오지 못했습니다.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setReservations(data.reservations)
    setLoading(false)
  }, [filters.status, filters.keyword])

  useEffect(() => { fetch_() }, [fetch_])

  return { reservations, loading, error, refetch: fetch_ }
}
