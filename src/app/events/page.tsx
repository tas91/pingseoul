import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ChevronLeft } from 'lucide-react'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

type DbEvent = {
  id: string
  name: string
  dj: string
  dress_code: string
  poster_url: string
  event_date: string
  start_time: string
  end_time: string
  entry_fee: number | null
}

export default async function EventsPage() {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: events } = await supabase
    .from('events')
    .select('id, name, dj, dress_code, poster_url, event_date, start_time, end_time, entry_fee')
    .gte('event_date', today)
    .order('event_date', { ascending: true })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-[#A0A0A0] hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black">이벤트</h1>
        </div>

        {!events || events.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-4">★</p>
            <p className="text-[#A0A0A0]">예정된 이벤트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(events as DbEvent[]).map((event) => {
              const date = new Date(event.event_date + 'T00:00:00')
              const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
              const dayOfWeek = DAY_NAMES[date.getDay()]

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#E63027]/50 hover:bg-white/5 transition-all"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-none bg-[#1A1A1A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={event.poster_url} alt={event.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{event.name}</p>
                    <p className="text-sm text-[#A0A0A0] mt-0.5">
                      {dateStr} ({dayOfWeek}요일) · {event.start_time.slice(0, 5)}
                    </p>
                    {event.dj && (
                      <p className="text-xs text-[#A0A0A0] mt-0.5 truncate">{event.dj}</p>
                    )}
                  </div>
                  <div className="text-right flex-none">
                    <p className="text-sm font-bold">
                      {event.entry_fee ? `${event.entry_fee.toLocaleString()}원` : '무료'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
