import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReservationFilters, ReservationListItem } from '@/lib/types'

const RESERVATION_SELECT = `
  id,
  reservation_number,
  created_at,
  business_date,
  arrival_slot,
  visit_time,
  people_count,
  status,
  guest_name,
  guest_phone,
  guest_instagram,
  request_note,
  incentive_type,
  table:tables(id, type)
`

// Supabase FK join returns single object but TS infers array — normalise here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalise(rows: any[]): ReservationListItem[] {
  return rows.map((r) => ({
    ...r,
    table: Array.isArray(r.table) ? (r.table[0] ?? null) : r.table,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: ReservationFilters): any {
  if (filters.business_date) {
    query = query.eq('business_date', filters.business_date)
  }
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters.table_id) {
    query = query.eq('table_id', filters.table_id)
  }
  return query
}

export async function getAdminReservations(
  supabase: SupabaseClient,
  filters: ReservationFilters = {},
): Promise<ReservationListItem[]> {
  let query = supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .order('created_at', { ascending: false })

  query = applyFilters(query, filters)

  if (filters.keyword) {
    const kw = `%${filters.keyword}%`
    query = query.or(
      `reservation_number.ilike.${kw},guest_name.ilike.${kw},guest_phone.ilike.${kw}`,
    )
  }

  const { data, error } = await query
  if (error) throw error
  return normalise(data ?? [])
}

export async function getUserReservations(
  supabase: SupabaseClient,
  userId: string,
  filters: ReservationFilters = {},
): Promise<ReservationListItem[]> {
  let query = supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  query = applyFilters(query, filters)

  if (filters.keyword) {
    query = query.ilike('reservation_number', `%${filters.keyword}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return normalise(data ?? [])
}
