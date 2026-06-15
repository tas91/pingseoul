import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { aggregateByTable, resolveDisplayStatus, buildSlotCounts, ACTIVE_STATUSES, type DisplayStatus } from '@/lib/table-map-utils'

export const dynamic = 'force-dynamic'

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

  const resByTable = aggregateByTable(reservations)
  const slotCounts = buildSlotCounts(slotCountRows)

  // Build final table list with displayStatus (display_order null인 테스트 테이블 제외)
  const result = tables.filter(t => t.display_order !== null).map((table) => {
    const displayStatus: DisplayStatus = resolveDisplayStatus(table, resByTable)
    const res = resByTable[table.id]
    return res ? { ...table, displayStatus, reservation: res } : { ...table, displayStatus }
  })

  return NextResponse.json({ tables: result, slotCounts })
}
