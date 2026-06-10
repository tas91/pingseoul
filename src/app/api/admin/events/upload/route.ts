import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF)' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${crypto.randomUUID()}.${ext}`
  const buffer = new Uint8Array(await file.arrayBuffer())

  const adminClient = createAdminClient()
  const { error } = await adminClient.storage
    .from('event-posters')
    .upload(fileName, buffer, { contentType: file.type })

  if (error) return NextResponse.json({ error: '업로드에 실패했습니다.' }, { status: 500 })

  const { data: { publicUrl } } = adminClient.storage
    .from('event-posters')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl })
}
