import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAdminReservations } from '@/lib/supabase/queries/reservations'
import { NextResponse } from 'next/server'
import type { ReservationFilters } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const filters: ReservationFilters = {
      business_date: searchParams.get('business_date') ?? undefined,
      status: (searchParams.get('status') ?? undefined) as ReservationFilters['status'],
      table_id: searchParams.get('table_id') ?? undefined,
      keyword: searchParams.get('keyword') ?? undefined,
    }

    const adminClient = createAdminClient()
    const reservations = await getAdminReservations(adminClient, filters)

    return NextResponse.json({ reservations })
  } catch (err) {
    console.error('[/api/admin/reservations]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
