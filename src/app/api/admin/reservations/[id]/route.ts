import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const body: PatchBody = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) updates.status = body.status
  if (body.reject_reason !== undefined) updates.reject_reason = body.reject_reason
  if (body.admin_memo !== undefined) updates.admin_memo = body.admin_memo
  if (body.table_id !== undefined) updates.table_id = body.table_id

  if (body.status === 'confirmed') updates.approved_at = new Date().toISOString()
  if (body.status === 'in_use') updates.checked_in_at = new Date().toISOString()
  if (body.status === 'completed') updates.checked_out_at = new Date().toISOString()

  const { error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', params.id)

  if (error) {
    console.error('[admin/reservations PATCH]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
