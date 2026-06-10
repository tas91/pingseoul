import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserReservations } from '@/lib/supabase/queries/reservations'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const reservations = await getUserReservations(supabase, user.id)
    return NextResponse.json({ reservations })
  } catch (err) {
    console.error('[user/reservations GET]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
