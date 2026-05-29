import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function getActiveAdmin() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()
  return profile ? user : null
}

export async function GET() {
  const user = await getActiveAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: events, error } = await adminClient
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ events })
}

export async function POST(request: Request) {
  const user = await getActiveAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, dj, dress_code, poster_url, event_date, start_time, end_time, entry_fee, description, notify_subscribers, images } = body

  if (!name?.trim()) return NextResponse.json({ error: '이벤트 이름을 입력해주세요.' }, { status: 400 })
  if (!poster_url) return NextResponse.json({ error: '포스터를 업로드해주세요.' }, { status: 400 })
  if (!event_date) return NextResponse.json({ error: '이벤트 날짜를 입력해주세요.' }, { status: 400 })
  if (!start_time) return NextResponse.json({ error: '시작 시간을 입력해주세요.' }, { status: 400 })
  if (!end_time) return NextResponse.json({ error: '종료 시간을 입력해주세요.' }, { status: 400 })
  if (typeof notify_subscribers !== 'boolean') return NextResponse.json({ error: '알림 여부를 선택해주세요.' }, { status: 400 })

  const adminClient = createAdminClient()
  const { data: event, error } = await adminClient
    .from('events')
    .insert({
      name: name.trim(),
      dj: dj?.trim() || '',
      dress_code: dress_code?.trim() || '',
      poster_url,
      event_date,
      start_time,
      end_time,
      entry_fee: entry_fee ?? null,
      description: description?.trim() || null,
      notify_subscribers,
      images: images ?? [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ event }, { status: 201 })
}
