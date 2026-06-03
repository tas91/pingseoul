import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_STATUSES = ['confirmed', 'rejected', 'in_use', 'completed', 'pending', 'cancelled', 'no_show'] as const
type AllowedStatus = typeof ALLOWED_STATUSES[number]

interface PatchBody {
  status?: string
  reject_reason?: string
  admin_memo?: string
  table_id?: string
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  if (body.status !== undefined && !ALLOWED_STATUSES.includes(body.status as AllowedStatus)) {
    return NextResponse.json({ error: '유효하지 않은 status입니다.' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) updates.status = body.status
  if (body.reject_reason !== undefined) updates.reject_reason = body.reject_reason
  if (body.admin_memo !== undefined) updates.admin_memo = body.admin_memo
  if (body.table_id !== undefined) updates.table_id = body.table_id

  if (body.status === 'confirmed') updates.approved_at = new Date().toISOString()
  if (body.status === 'in_use') updates.checked_in_at = new Date().toISOString()
  if (body.status === 'completed') updates.checked_out_at = new Date().toISOString()

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '변경할 필드가 없습니다.' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('reservations')
    .update(updates)
    .eq('id', params.id)

  if (error) {
    console.error('[admin/reservations PATCH]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
