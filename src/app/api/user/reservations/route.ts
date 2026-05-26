import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserReservations } from '@/lib/supabase/queries/reservations'
import { NextResponse } from 'next/server'
import type { ReservationFilters } from '@/lib/types'

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const filters: ReservationFilters = {
    status: (searchParams.get('status') ?? undefined) as ReservationFilters['status'],
    keyword: searchParams.get('keyword') ?? undefined,
  }

  const reservations = await getUserReservations(supabase, user.id, filters)

  return NextResponse.json({ reservations })
}
