import { createServerSupabaseClient } from './server'

export async function getActiveAdmin() {
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
