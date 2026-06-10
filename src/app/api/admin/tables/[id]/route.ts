import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  if (typeof body.is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active(boolean) 필드가 필요합니다.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('tables')
    .update({ is_active: body.is_active })
    .eq('id', params.id)

  if (error) {
    console.error('[tables PATCH]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
