import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerProfile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data: invited, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/admin/set-password`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await adminClient.from('admin_profiles').insert({
    id: invited.user.id,
    role: 'admin',
    is_active: true,
    invited_by: user.id,
  })

  return NextResponse.json({ success: true })
}
