import Image from 'next/image'
import Link from 'next/link'

const feedImages = [
  { src: '/images/ping_charactor.jpg', alt: '미라클 핑 이벤트', likes: 26 },
  { src: '/images/ping_charactor2.jpg', alt: 'PING NIGHT', likes: 43 },
  { src: '/images/ping_logo.jpg', alt: 'PING SEOUL', likes: 89 },
  { src: '/images/ping_charactor.jpg', alt: '핑 서울 이벤트', likes: 31 },
  { src: '/images/ping_charactor2.jpg', alt: '클럽 핑', likes: 57 },
  { src: '/images/ping_logo.jpg', alt: 'PING 로고', likes: 72 },
]

export default function InstagramFeed() {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-xs text-[#E63027] font-bold tracking-[0.3em] uppercase mb-2">
            ★ INSTAGRAM
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            @ping_seoul
          </h2>
        </div>
        <Link
          href="https://www.instagram.com/ping_seoul"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 border border-white/20 hover:border-[#E63027]/50 text-white text-sm font-semibold rounded-full transition-all duration-200 hover:bg-[#E63027]/5 w-fit"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          팔로우
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
        {feedImages.map((img, idx) => (
          <Link
            key={idx}
            href="https://www.instagram.com/ping_seoul"
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square overflow-hidden rounded-xl group bg-[#1A1A1A]"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{img.likes}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
