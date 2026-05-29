'use client'

import { useState, useRef } from 'react'

interface Props {
  images: string[]
}

export function EventImageCarousel({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const index = Math.round(
      scrollRef.current.scrollLeft / scrollRef.current.offsetWidth
    )
    setActiveIndex(index)
  }

  if (images.length === 0) return null

  return (
    <div className="relative bg-black w-full">
      {/* 캐러셀 - 인스타그램 4:5 비율 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' } as React.CSSProperties}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="flex-none w-full snap-center"
          >
            {/* 4:5 비율 컨테이너 (인스타그램 표준 세로 포스터) */}
            <div className="relative w-full bg-[#0D0D0D]" style={{ aspectRatio: '4/5' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`이벤트 이미지 ${i + 1}`}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 멀티 이미지일 때 인디케이터 */}
      {images.length > 1 && (
        <>
          {/* 점 인디케이터 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* 카운터 */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white tabular-nums">
            {activeIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}
