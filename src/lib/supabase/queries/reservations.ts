import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReservationListItem, ReservationFilters } from '@/lib/types'

const ADMIN_SELECT = `
  id, reservation_number, created_at, business_date, arrival_slot, visit_time,
  people_count, status, request_note, admin_memo, reject_reason, incentive_type,
  approved_at, checked_in_at, checked_out_at, expires_at,
  guest_name, guest_phone, guest_instagram,
  profiles!reservations_user_id_fkey(name, phone, email),
  tables(id, type)
`

const USER_SELECT = `
  id, reservation_number, created_at, business_date, arrival_slot, visit_time,
  people_count, status, request_note, reject_reason, incentive_type,
  approved_at, checked_in_at, checked_out_at, expires_at,
  tables(id, type)
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdminRow(row: any): ReservationListItem {
  return {
    id: row.id,
    reservation_number: row.reservation_number,
    created_at: row.created_at,
    business_date: row.business_date,
    arrival_slot: row.arrival_slot,
    visit_time: row.visit_time,
    people_count: row.people_count,
    status: row.status,
    request_note: row.request_note ?? null,
    admin_memo: row.admin_memo ?? null,
    reject_reason: row.reject_reason ?? null,
    incentive_type: row.incentive_type,
    approved_at: row.approved_at ?? null,
    checked_in_at: row.checked_in_at ?? null,
    checked_out_at: row.checked_out_at ?? null,
    expires_at: row.expires_at ?? null,
    guest_name: row.profiles?.name ?? row.guest_name ?? null,
    guest_phone: row.profiles?.phone ?? row.guest_phone ?? null,
    guest_email: row.profiles?.email ?? null,
    guest_instagram: row.guest_instagram ?? null,
    table: row.tables ? { id: row.tables.id, type: row.tables.type } : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserRow(row: any): ReservationListItem {
  return {
    id: row.id,
    reservation_number: row.reservation_number,
    created_at: row.created_at,
    business_date: row.business_date,
    arrival_slot: row.arrival_slot,
    visit_time: row.visit_time,
    people_count: row.people_count,
    status: row.status,
    request_note: row.request_note ?? null,
    admin_memo: null,
    reject_reason: row.reject_reason ?? null,
    incentive_type: row.incentive_type,
    approved_at: row.approved_at ?? null,
    checked_in_at: row.checked_in_at ?? null,
    checked_out_at: row.checked_out_at ?? null,
    expires_at: row.expires_at ?? null,
    guest_name: null,
    guest_phone: null,
    guest_email: null,
    guest_instagram: null,
    table: row.tables ? { id: row.tables.id, type: row.tables.type } : null,
  }
}

export async function getAdminReservations(
  supabase: SupabaseClient,
  filters: ReservationFilters = {}
): Promise<ReservationListItem[]> {
  let query = supabase
    .from('reservations')
    .select(ADMIN_SELECT)
    .order('created_at', { ascending: false })

  if (filters.business_date) query = query.eq('business_date', filters.business_date)
  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
  if (filters.table_id) query = query.eq('table_id', filters.table_id)
  if (filters.keyword) query = query.ilike('reservation_number', `%${filters.keyword}%`)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map(mapAdminRow)
}

export async function getUserReservations(
  supabase: SupabaseClient,
  userId: string
): Promise<ReservationListItem[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(USER_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(mapUserRow)
}

export async function getUserReservationById(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<ReservationListItem | null> {
  const { data, error } = await supabase
    .from('reservations')
    .select(USER_SELECT)
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) return null

  return mapUserRow(data)
}
