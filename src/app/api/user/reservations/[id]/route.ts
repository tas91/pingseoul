import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserReservationById } from '@/lib/supabase/queries/reservations'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const reservation = await getUserReservationById(supabase, params.id, user.id)
    if (!reservation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ reservation })
  } catch (err) {
    console.error('[GET /api/user/reservations/[id]]', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
