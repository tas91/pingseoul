'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const timeSlots = ['00:00', '02:00', '04:00', '06:00']

const stars = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 16 + 8,
  top: Math.random() * 90,
  left: Math.random() * 90,
  duration: Math.random() * 4 + 4,
  delay: Math.random() * 3,
  opacity: Math.random() * 0.5 + 0.2,
}))

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background: poster image blurred */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/ping_charactor.jpg"
          alt="PING Seoul background"
          fill
          className="object-cover opacity-20 blur-sm scale-105"
          priority
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        {/* Red radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-[#E63027]/10 via-transparent to-transparent" style={{ backgroundPosition: '50% 40%', backgroundSize: '80% 60%' }} />
      </div>

      {/* Floating star particles */}
      {mounted && stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-[#E63027] star-particle pointer-events-none select-none z-10"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            fontSize: `${star.size}px`,
            opacity: star.opacity,
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          } as React.CSSProperties}
        >
          ★
        </div>
      ))}

      {/* Scanline */}
      <div className="absolute inset-0 z-10 scanline pointer-events-none" />

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mx-auto border-2 border-[#E63027]/60 shadow-[0_0_40px_rgba(230,48,39,0.5)] animate-glow-pulse">
            <Image
              src="/images/ping_logo.jpg"
              alt="PING Logo"
              width={128}
              height={128}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-[0.15em] text-white text-glow-red mb-2">
          PING
        </h1>
        <p className="text-lg md:text-xl text-[#E63027] font-semibold tracking-[0.3em] uppercase mb-2">
          SEOUL
        </p>

        {/* Tagline */}
        <p className="text-base md:text-lg text-[#A0A0A0] font-medium mt-4 mb-8 tracking-wide">
          서울의 밤을 핑으로
        </p>

        {/* Time slots badges */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-10">
          <span className="text-xs text-[#A0A0A0] mr-1">입장 타임</span>
          {timeSlots.map((slot) => (
            <span
              key={slot}
              className="px-3 py-1 text-xs font-mono font-bold border border-[#E63027]/40 text-[#E63027] rounded-full bg-[#E63027]/5 tracking-widest"
            >
              {slot}
            </span>
          ))}
          <span className="text-xs text-[#A0A0A0] ml-1">~ 10:00</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/reservation"
            className="px-10 py-4 bg-[#E63027] hover:bg-[#B01F19] text-white font-black text-base rounded-full transition-all duration-300 box-glow-red hover:box-glow-red-hover tracking-widest shadow-lg"
          >
            ★ 예약하기
          </Link>
          <Link
            href="/events"
            className="px-8 py-4 border border-white/30 hover:border-white/60 text-white font-semibold text-base rounded-full transition-all duration-300 hover:bg-white/5 tracking-wide"
          >
            이벤트 보기
          </Link>
        </div>

        {/* Operating hours */}
        <p className="mt-8 text-xs text-[#A0A0A0]/70 tracking-wider">
          매일 자정 오픈 · 익일 오전 10시 마감
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-[#A0A0A0]/60 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-[#A0A0A0]/40 to-transparent" />
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  )
}
