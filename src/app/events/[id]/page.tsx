import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getEventById } from '@/lib/supabase/queries/events'
import { EventImageCarousel } from '@/components/EventImageCarousel'
import { ChevronLeft } from 'lucide-react'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const event = await getEventById(supabase, params.id)

  if (!event) notFound()

  const allImages = [event.poster_url, ...(event.images ?? [])].filter(Boolean)

  const date = new Date(event.event_date + 'T00:00:00')
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  const dayOfWeek = DAY_NAMES[date.getDay()]

  const lineup = event.dj
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back button */}
      <div className="fixed top-0 left-0 z-20 p-4">
        <Link
          href="/"
          className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full pl-2 pr-3 py-1.5 text-sm text-white border border-white/10"
        >
          <ChevronLeft size={16} />
          뒤로
        </Link>
      </div>

      {/* Image carousel */}
      <EventImageCarousel images={allImages} />

      {/* Event info */}
      <div className="px-5 py-6 space-y-5 max-w-lg mx-auto">
        {/* Title + date */}
        <div>
          <h1 className="text-2xl font-black tracking-wide">{event.name}</h1>
          <p className="text-[#A0A0A0] mt-1 text-sm">
            {dateStr} ({dayOfWeek}요일) &middot; {event.start_time.slice(0, 5)} ~ {event.end_time.slice(0, 5)}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 border-t border-white/10 pt-5">
          {lineup.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A0A0A0]">DJ</span>
              <span className="font-medium">{lineup.join(' · ')}</span>
            </div>
          )}
          {event.dress_code && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A0A0A0]">드레스코드</span>
              <span className="font-medium">{event.dress_code}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[#A0A0A0]">입장료</span>
            <span className="font-medium">
              {event.entry_fee ? `${event.entry_fee.toLocaleString()}원` : '무료'}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="border-t border-white/10 pt-5">
            <p className="text-sm text-[#A0A0A0] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2 pb-10">
          <Link
            href={`/reservation?event=${event.id}`}
            className="block w-full py-4 bg-[#E63027] hover:bg-[#B01F19] text-white text-center font-bold rounded-xl transition-colors"
          >
            예약하기
          </Link>
        </div>
      </div>
    </div>
  )
}
