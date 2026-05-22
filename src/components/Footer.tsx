import Image from 'next/image'
import Link from 'next/link'

const navColumns = [
  {
    title: '서비스',
    links: [
      { href: '/events', label: '이벤트' },
      { href: '/promotions', label: '할인/혜택' },
      { href: '/menu', label: '메뉴' },
      { href: '/reservation', label: '예약하기' },
    ],
  },
  {
    title: '고객지원',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/mypage', label: '마이페이지' },
      { href: '/mypage/reservations', label: '내 예약' },
      { href: '/mypage/points', label: 'P Point' },
    ],
  },
  {
    title: '법적고지',
    links: [
      { href: '/privacy', label: '개인정보처리방침' },
      { href: '/terms', label: '이용약관' },
    ],
  },
]

const timeSlots = [
  { time: '00:00', label: '자정 오픈' },
  { time: '02:00', label: '2시' },
  { time: '04:00', label: '4시' },
  { time: '06:00', label: '6시 (마지막 입장)' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top: Brand + Nav */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#E63027]/30">
                <Image src="/images/ping_logo.jpg" alt="PING" fill className="object-cover" />
              </div>
              <span className="text-2xl font-black tracking-widest text-white">PING SEOUL</span>
            </div>
            <p className="text-sm text-[#A0A0A0] leading-relaxed mb-6">
              서울의 밤을 핑으로.<br />
              매일 자정 오픈, 익일 오전 10시 마감.
            </p>

            {/* Operating hours */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5 mb-6">
              <p className="text-xs font-bold text-[#E63027] mb-3 tracking-wider">영업 타임슬롯</p>
              <div className="space-y-1.5">
                {timeSlots.map((slot) => (
                  <div key={slot.time} className="flex items-center gap-3">
                    <span className="font-mono text-sm text-[#E63027] font-bold w-12">{slot.time}</span>
                    <span className="text-xs text-[#A0A0A0]">{slot.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
                  <span className="font-mono text-sm text-[#A0A0A0] font-bold w-12">10:00</span>
                  <span className="text-xs text-[#A0A0A0]">영업 종료 (익일)</span>
                </div>
              </div>
            </div>

            {/* SNS */}
            <div className="flex items-center gap-3">
              <Link
                href="https://www.instagram.com/ping_seoul"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-white/10 hover:border-[#E63027]/50 flex items-center justify-center transition-colors duration-200 group"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#E63027] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold text-[#E63027] tracking-widest uppercase mb-4">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#A0A0A0] hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-white/5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-[#E63027] tracking-wider mb-2">위치</p>
              <p className="text-sm text-white font-semibold">서울특별시 마포구 — PING SEOUL</p>
              <p className="text-xs text-[#A0A0A0] mt-1">지하철 접근 가능 · 주차 불가</p>
            </div>
            <Link
              href="https://map.naver.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#A0A0A0] hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-lg px-3 py-2 w-fit"
            >
              지도 보기 →
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#A0A0A0]/60">
            © 2026 (주)핑서울. All rights reserved.
          </p>
          <p className="text-xs text-[#A0A0A0]/40">
            사업자등록번호 000-00-00000 · 대표 홍길동 · 통신판매업신고 제2026-서울마포-0000호
          </p>
        </div>
      </div>
    </footer>
  )
}
