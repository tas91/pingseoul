import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getReservationById } from '@/lib/supabase/queries/reservations'
import { NextResponse } from 'next/server'
import type { ReservationAction } from '@/lib/types'

async function getAdminProfile(userId: string) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('admin_profiles')
    .select('role, is_active')
    .eq('id', userId)
    .single()
  return data
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getAdminProfile(user.id)
    if (!profile?.is_active) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const adminClient = createAdminClient()
    const reservation = await getReservationById(adminClient, params.id)
    if (!reservation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ reservation })
  } catch (err) {
    console.error('[GET /api/admin/reservations/[id]]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getAdminProfile(user.id)
    if (!profile?.is_active) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body: ReservationAction = await request.json()

    // 업데이트 페이로드 결정
    let updatePayload: Record<string, unknown>
    if (body.action === 'approve') {
      updatePayload = {
        status: 'confirmed',
        approved_at: new Date().toISOString(),
      }
    } else if (body.action === 'reject') {
      if (!body.reject_reason?.trim()) {
        return NextResponse.json({ error: '거절 사유를 입력해 주세요.' }, { status: 400 })
      }
      updatePayload = {
        status: 'rejected',
        reject_reason: body.reject_reason.trim(),
      }
    } else if (body.action === 'memo') {
      updatePayload = { admin_memo: body.admin_memo }
    } else {
      return NextResponse.json({ error: '잘못된 action입니다.' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('reservations')
      .update(updatePayload)
      .eq('id', params.id)
      .select(`
        id, reservation_number, created_at, business_date, arrival_slot,
        visit_time, people_count, status, guest_name, guest_phone,
        guest_instagram, request_note, admin_memo, reject_reason,
        approved_at, incentive_type, table:tables(id, type)
      `)
      .single()

    if (error) throw error

    // table 배열 정규화
    const reservation = {
      ...data,
      table: Array.isArray(data.table) ? (data.table[0] ?? null) : data.table,
    }

    return NextResponse.json({ reservation })
  } catch (err) {
    console.error('[PATCH /api/admin/reservations/[id]]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
