import type { SupabaseClient } from '@supabase/supabase-js'
import type { FaqItem } from '@/lib/types'

export async function getFaqs(supabase: SupabaseClient): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('id, category, question, answer, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error || !data) return []
  return data as FaqItem[]
}
