import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAdminReservations } from '@/lib/supabase/queries/reservations'
import type { ReservationFilters, TimeSlot } from '@/lib/types'

export const dynamic = 'force-dynamic'

const ALLOWED_SLOTS: TimeSlot[] = ['slot_00', 'slot_02', 'slot_04', 'slot_06']

interface PostBody {
  guest_name: string
  guest_phone?: string
  guest_instagram?: string
  visit_date: string
  arrival_slot: string
  people_count: number
  status?: 'pending' | 'confirmed'
  table_id?: string
  admin_memo?: string
}

export async function POST(request: Request) {
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

    let body: PostBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body.guest_name?.trim()) {
      return NextResponse.json({ error: '예약자명을 입력해 주세요.' }, { status: 400 })
    }
    if (!body.visit_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.visit_date) || isNaN(Date.parse(body.visit_date))) {
      return NextResponse.json({ error: '유효한 방문일을 입력해 주세요. (YYYY-MM-DD)' }, { status: 400 })
    }
    if (!body.arrival_slot || !ALLOWED_SLOTS.includes(body.arrival_slot as TimeSlot)) {
      return NextResponse.json({ error: '유효한 타임슬롯을 선택해 주세요.' }, { status: 400 })
    }
    if (!Number.isInteger(body.people_count) || body.people_count < 1 || body.people_count > 20) {
      return NextResponse.json({ error: '인원수는 1~20 사이 정수여야 합니다.' }, { status: 400 })
    }

    const status = body.status === 'pending' ? 'pending' : 'confirmed'
    const insertData: Record<string, unknown> = {
      user_id: null,
      guest_name: body.guest_name.trim(),
      guest_phone: body.guest_phone?.trim() || null,
      guest_instagram: body.guest_instagram?.trim() || null,
      visit_date: body.visit_date,
      arrival_slot: body.arrival_slot,
      people_count: body.people_count,
      status,
      table_id: body.table_id || null,
      admin_memo: body.admin_memo?.trim() || null,
    }

    if (status === 'confirmed') {
      insertData.approved_at = new Date().toISOString()
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('reservations')
      .insert(insertData)
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('[admin/reservations POST]', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const filters: ReservationFilters = {
      business_date: searchParams.get('business_date') ?? undefined,
      status: (searchParams.get('status') as ReservationFilters['status']) ?? undefined,
      table_id: searchParams.get('table_id') ?? undefined,
      keyword: searchParams.get('keyword') ?? undefined,
    }

    const adminClient = createAdminClient()
    const reservations = await getAdminReservations(adminClient, filters)
    return NextResponse.json({ reservations })
  } catch (err) {
    console.error('[admin/reservations GET]', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
