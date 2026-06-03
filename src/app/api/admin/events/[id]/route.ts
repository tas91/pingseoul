import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function getAdminUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  return profile ? user : null
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, dj, dress_code, poster_url, event_date, start_time, end_time, entry_fee, description } = body

  if (!name || !dj || !dress_code || !event_date || !start_time || !end_time) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('events')
    .update({
      name,
      dj,
      dress_code,
      poster_url: poster_url || '/images/ping_charactor.jpg',
      event_date,
      start_time,
      end_time,
      entry_fee: entry_fee ?? null,
      description: description ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('events')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
