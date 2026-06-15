import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateStatusPatch, type PatchBody } from '@/lib/reservation-transitions'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    let body: PatchBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const result = validateStatusPatch(body)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    const { updates } = result

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('reservations')
      .update(updates)
      .eq('id', params.id)
      .select('id')

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/reservations PATCH]', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
