'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { thisWeekEvents, nextWeekEvents, weekAfterNextEvents, type Event } from '@/lib/mockData'

const tabs = [
  { id: 'this', label: '이번주', events: thisWeekEvents },
  { id: 'next', label: '다음주', events: nextWeekEvents },
  { id: 'after', label: '다다음주', events: weekAfterNextEvents },
]

const statusConfig = {
  available: { label: '예약 가능', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  limited: { label: '마감 임박', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  soldout: { label: '예약 마감', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

function EventCard({ event }: { event: Event }) {
  const status = statusConfig[event.status]

  return (
    <div className="glass-card rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1">
      {/* Poster */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#1A1A1A]">
        <Image
          src={event.poster}
          alt={event.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
          <p className="text-xs text-[#A0A0A0]">{event.date}</p>
          <p className="text-sm font-bold text-white">{event.dayOfWeek}요일</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-black text-white tracking-wide group-hover:text-[#E63027] transition-colors duration-200">
            {event.name}
          </h3>
          <p className="text-sm text-[#A0A0A0] mt-0.5">
            {event.lineup.join(' · ')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#E63027]">★</span>
            <span className="text-xs text-[#A0A0A0]">드레스코드</span>
            <span className="text-xs font-semibold text-white">{event.dressCode}</span>
          </div>
        </div>

        {/* Time slots */}
        <div className="flex flex-wrap gap-1.5">
          {event.timeSlots.map((slot) => (
            <span
              key={slot}
              className="px-2 py-0.5 text-xs font-mono border border-[#E63027]/30 text-[#E63027]/80 rounded bg-[#E63027]/5"
            >
              {slot}
            </span>
          ))}
        </div>

        {/* Entry fee + CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs text-[#A0A0A0]">입장료</span>
            <p className="text-base font-black text-white tabular-nums">
              {event.entryFee.toLocaleString()}원
            </p>
          </div>
          {event.status !== 'soldout' ? (
            <Link
              href={`/reservation?event=${event.id}`}
              className="px-4 py-2 bg-[#E63027] hover:bg-[#B01F19] text-white text-sm font-bold rounded-full transition-all duration-200"
            >
              예약하기
            </Link>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-white/10 text-[#A0A0A0] text-sm font-bold rounded-full cursor-not-allowed"
            >
              마감됨
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EventTabs() {
  const [activeTab, setActiveTab] = useState('this')
  const currentEvents = tabs.find((t) => t.id === activeTab)?.events ?? []

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-xs text-[#E63027] font-bold tracking-[0.3em] uppercase mb-2">
            ★ UPCOMING EVENTS
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            다가오는 이벤트
          </h2>
        </div>
        <Link
          href="/events"
          className="text-sm text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1 group"
        >
          전체 보기
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/10 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold tracking-wide transition-all duration-200 relative ${
              activeTab === tab.id
                ? 'text-white tab-active'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            {tab.label}
            {tab.events.length > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-[#E63027] text-white'
                    : 'bg-white/10 text-[#A0A0A0]'
                }`}
              >
                {tab.events.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Event cards */}
      {currentEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-4xl mb-4">★</p>
          <p className="text-[#A0A0A0]">등록된 이벤트가 없습니다.</p>
        </div>
      )}
    </section>
  )
}
