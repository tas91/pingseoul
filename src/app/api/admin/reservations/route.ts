import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAdminReservations } from '@/lib/supabase/queries/reservations'
import type { ReservationFilters } from '@/lib/types'

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()

  if (!adminProfile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const filters: ReservationFilters = {
    business_date: searchParams.get('business_date') ?? undefined,
    status: (searchParams.get('status') as ReservationFilters['status']) ?? undefined,
    table_id: searchParams.get('table_id') ?? undefined,
    keyword: searchParams.get('keyword') ?? undefined,
  }

  try {
    const reservations = await getAdminReservations(supabase, filters)
    return NextResponse.json({ reservations })
  } catch (err) {
    console.error('[admin/reservations GET]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
