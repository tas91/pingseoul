import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveAdmin } from '@/lib/supabase/auth-utils'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getActiveAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, dj, dress_code, poster_url, event_date, start_time, end_time, entry_fee, description, notify_subscribers, images } = body

  if (!name?.trim()) return NextResponse.json({ error: '이벤트 이름을 입력해주세요.' }, { status: 400 })
  if (!poster_url) return NextResponse.json({ error: '포스터를 업로드해주세요.' }, { status: 400 })
  if (!event_date) return NextResponse.json({ error: '이벤트 날짜를 입력해주세요.' }, { status: 400 })
  if (!start_time) return NextResponse.json({ error: '시작 시간을 입력해주세요.' }, { status: 400 })
  if (!end_time) return NextResponse.json({ error: '종료 시간을 입력해주세요.' }, { status: 400 })

  const adminClient = createAdminClient()
  const { data: event, error } = await adminClient
    .from('events')
    .update({
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ event })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getActiveAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('events')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
