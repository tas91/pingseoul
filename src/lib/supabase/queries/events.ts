import type { SupabaseClient } from '@supabase/supabase-js'
import type { Event } from '@/lib/types'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const DEFAULT_POSTER = '/images/ping_charactor.jpg'
const ALL_TIME_SLOTS = ['00:00', '02:00', '04:00', '06:00']

type DbEvent = {
  id: string
  name: string
  dj: string
  dress_code: string
  poster_url: string
  event_date: string
  entry_fee: number | null
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function dbEventToEvent(row: DbEvent): Event {
  const date = new Date(row.event_date + 'T00:00:00')
  return {
    id: row.id,
    name: row.name,
    date: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
    dayOfWeek: DAY_NAMES[date.getDay()],
    dj: row.dj,
    lineup: row.dj.split(',').map((s) => s.trim()).filter(Boolean),
    dressCode: row.dress_code,
    entryFee: row.entry_fee ?? 0,
    poster: row.poster_url || DEFAULT_POSTER,
    status: 'available',
    timeSlots: ALL_TIME_SLOTS,
  }
}

export async function getUpcomingEventsByWeek(supabase: SupabaseClient) {
  const today = new Date()
  const todayStr = toDateStr(today)
  const in21Days = new Date(today.getTime() + 21 * 86400000)
  const in21DaysStr = toDateStr(in21Days)

  const { data, error } = await supabase
    .from('events')
    .select('id, name, dj, dress_code, poster_url, event_date, entry_fee')
    .gte('event_date', todayStr)
    .lte('event_date', in21DaysStr)
    .order('event_date', { ascending: true })

  if (error || !data) {
    return { thisWeek: [], nextWeek: [], weekAfterNext: [] }
  }

  const week1End = new Date(today.getTime() + 7 * 86400000)
  const week2End = new Date(today.getTime() + 14 * 86400000)

  const thisWeek: Event[] = []
  const nextWeek: Event[] = []
  const weekAfterNext: Event[] = []

  for (const row of data as DbEvent[]) {
    const eventDate = new Date(row.event_date + 'T00:00:00')
    const event = dbEventToEvent(row)
    if (eventDate < week1End) {
      thisWeek.push(event)
    } else if (eventDate < week2End) {
      nextWeek.push(event)
    } else {
      weekAfterNext.push(event)
    }
  }

  return { thisWeek, nextWeek, weekAfterNext }
}
