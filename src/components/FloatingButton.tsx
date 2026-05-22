'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function FloatingButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Link
        href="/reservation"
        className="flex items-center gap-2 px-5 py-3.5 bg-[#E63027] text-white font-bold text-sm rounded-full shadow-2xl animate-glow-pulse hover:bg-[#B01F19] transition-colors duration-200"
      >
        <span className="text-base">★</span>
        <span>예약하기</span>
      </Link>
    </div>
  )
}
