'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReservationListItem, ReservationFilters } from '@/lib/types'

export function buildQuery(filters: ReservationFilters): string {
  const params = new URLSearchParams()
  if (filters.business_date) params.set('business_date', filters.business_date)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.table_id) params.set('table_id', filters.table_id)
  if (filters.keyword) params.set('keyword', filters.keyword)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function useAdminReservations(filters: ReservationFilters = {}) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscribed, setSubscribed] = useState(false)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const refetch = useCallback(async () => {
    const qs = buildQuery(filtersRef.current)
    const res = await fetch(`/api/admin/reservations${qs}`)
    if (res.ok) {
      const data = await res.json()
      setReservations(data.reservations)
      setError(null)
    } else {
      setError('예약 목록을 불러오지 못했습니다.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setLoading(true)
    refetch()
  }, [
    filters.business_date,
    filters.status,
    filters.table_id,
    filters.keyword,
    refetch,
  ])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-reservations-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => { refetch() }
      )
      .subscribe((status) => {
        setSubscribed(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [refetch])

  return { reservations, loading, error, subscribed, refetch }
}

export function useMyReservations() {
  const [reservations, setReservations] = useState<ReservationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)

  const refetch = useCallback(async () => {
    const res = await fetch('/api/user/reservations')
    if (res.ok) {
      const data = await res.json()
      setReservations(data.reservations)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('my-reservations-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => { refetch() }
      )
      .subscribe((status) => {
        setSubscribed(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [refetch])

  return { reservations, loading, subscribed, refetch }
}
