'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const navLinks = [
  { href: '/events', label: '이벤트' },
  { href: '/promotions', label: '할인' },
  { href: '/menu', label: '메뉴' },
  { href: '/faq', label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-full overflow-hidden">
              <Image
                src="/images/ping_logo.jpg"
                alt="PING SEOUL"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl font-black tracking-wider text-white group-hover:text-[#E63027] transition-colors duration-200">
              PING
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/mypage" className="text-sm text-[#A0A0A0] hover:text-white transition-colors">
              마이페이지
            </Link>
            <Link
              href="/reservation"
              className="px-5 py-2 bg-[#E63027] hover:bg-[#B01F19] text-white text-sm font-bold rounded-full transition-all duration-200 box-glow-red-hover tracking-wide"
            >
              예약하기
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="bg-black/95 border-t border-white/10 px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-base font-medium text-[#A0A0A0] hover:text-white py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link href="/mypage" className="text-base text-[#A0A0A0] hover:text-white py-2 transition-colors">
              마이페이지
            </Link>
            <Link
              href="/reservation"
              className="block w-full text-center px-5 py-3 bg-[#E63027] text-white text-base font-bold rounded-full"
              onClick={() => setMenuOpen(false)}
            >
              예약하기
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
