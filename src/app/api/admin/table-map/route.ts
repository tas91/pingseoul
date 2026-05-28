import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type DisplayStatus = 'available' | 'pending' | 'confirmed' | 'in_use' | 'blocked'

const STATUS_PRIORITY: Record<string, number> = { in_use: 3, confirmed: 2, pending: 1 }
const ACTIVE_STATUSES = ['pending', 'confirmed', 'in_use']

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const slot = searchParams.get('slot')
  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 })

  const admin = createAdminClient()

  // Parallel fetch: tables + reservations for this date + slot counts (confirmed/in_use)
  const mainResQuery = admin
    .from('reservations')
    .select('table_id, arrival_slot, status, reservation_number, people_count')
    .eq('business_date', date)
    .in('status', ACTIVE_STATUSES)

  const [tablesResult, reservationsResult, slotCountsResult] = await Promise.all([
    admin.from('tables').select('id, type, position_x, position_y, capacity, is_active, display_order').order('display_order'),
    slot ? mainResQuery.eq('arrival_slot', slot) : mainResQuery,
    admin.from('reservations').select('arrival_slot').eq('business_date', date).in('status', ['confirmed', 'in_use']),
  ])

  const tables = tablesResult.data ?? []
  const reservations = reservationsResult.data ?? []
  const slotCountRows = slotCountsResult.data ?? []

  // Aggregate reservations by table_id (highest-priority status wins, count all)
  const resByTable: Record<string, { reservation_number: string; people_count: number; status: string; count: number }> = {}
  for (const r of reservations) {
    if (!r.table_id) continue
    const entry = resByTable[r.table_id]
    if (entry) {
      entry.count++
      if ((STATUS_PRIORITY[r.status] ?? 0) > (STATUS_PRIORITY[entry.status] ?? 0)) {
        entry.reservation_number = r.reservation_number
        entry.people_count = r.people_count
        entry.status = r.status
      }
    } else {
      resByTable[r.table_id] = {
        reservation_number: r.reservation_number,
        people_count: r.people_count,
        status: r.status,
        count: 1,
      }
    }
  }

  // Slot counts (confirmed + in_use per slot)
  const slotCounts = { slot_00: 0, slot_02: 0, slot_04: 0, slot_06: 0 }
  for (const r of slotCountRows) {
    const key = r.arrival_slot as keyof typeof slotCounts
    if (key in slotCounts) slotCounts[key]++
  }

  // Build final table list with displayStatus
  const result = tables.map((table) => {
    if (!table.is_active) {
      return { ...table, displayStatus: 'blocked' as DisplayStatus }
    }
    const res = resByTable[table.id]
    if (!res) {
      return { ...table, displayStatus: 'available' as DisplayStatus }
    }
    const displayStatus = (res.status === 'in_use' ? 'in_use'
      : res.status === 'confirmed' ? 'confirmed'
      : res.status === 'pending' ? 'pending'
      : 'available') as DisplayStatus
    return { ...table, displayStatus, reservation: res }
  })

  return NextResponse.json({ tables: result, slotCounts })
}
