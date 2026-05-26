import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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
  const [{ data: profiles }, { data: { users } }] = await Promise.all([
    adminClient.from('admin_profiles').select('*').order('created_at'),
    adminClient.auth.admin.listUsers(),
  ])

  const members = (profiles ?? []).map((profile) => ({
    ...profile,
    email: users.find((u) => u.id === profile.id)?.email ?? '',
  }))

  return NextResponse.json({ members })
}
