import Link from 'next/link'

const slots = [
  { time: '00:00', label: '자정 오픈', tag: 'PEAK', desc: '메인 피크 타임, 가장 인기 있는 슬롯' },
  { time: '02:00', label: '새벽 2시', tag: '', desc: '피크 진입, 활기찬 분위기 시작' },
  { time: '04:00', label: '새벽 4시', tag: '', desc: '새벽 후반부, 진한 클럽 감성' },
  { time: '06:00', label: '새벽 6시', tag: 'LAST', desc: '마지막 입장, 오전 10시 마감까지' },
]

export default function OperatingHoursSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Text */}
          <div className="flex-1">
            <p className="text-xs text-[#E63027] font-bold tracking-[0.3em] uppercase mb-3">
              ★ OPERATION HOURS
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              운영 시간 안내
            </h2>
            <p className="text-[#A0A0A0] text-base leading-relaxed mb-8">
              핑 서울은 매일 자정부터 익일 오전 10시까지 운영합니다.
              4개의 타임슬롯 중 원하는 입장 시간을 선택하세요.
            </p>

            {/* Big hours display */}
            <div className="flex items-center gap-4 mb-8">
              <div className="text-center">
                <p className="text-5xl font-black font-mono text-white tabular-nums">00:00</p>
                <p className="text-xs text-[#A0A0A0] mt-1 tracking-widest">OPEN</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-[#E63027]/40 to-transparent mx-2" />
              <span className="text-[#E63027] text-2xl font-black">→</span>
              <div className="flex-1 h-px bg-gradient-to-l from-[#E63027]/40 to-transparent mx-2" />
              <div className="text-center">
                <p className="text-5xl font-black font-mono text-white tabular-nums">10:00</p>
                <p className="text-xs text-[#A0A0A0] mt-1 tracking-widest">CLOSE (익일)</p>
              </div>
            </div>

            <Link
              href="/reservation"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E63027] hover:bg-[#B01F19] text-white font-bold rounded-full transition-all duration-200 text-sm"
            >
              타임슬롯 예약하기 →
            </Link>
          </div>

          {/* Right: Slots */}
          <div className="flex-1 w-full max-w-sm">
            <div className="space-y-3">
              {slots.map((slot, idx) => (
                <div
                  key={slot.time}
                  className="flex items-center gap-4 bg-[#1A1A1A] rounded-xl p-4 border border-white/5 hover:border-[#E63027]/30 transition-all duration-200 group"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#E63027]/10 border border-[#E63027]/20 group-hover:bg-[#E63027]/15 transition-colors flex-shrink-0">
                    <span className="font-mono text-lg font-black text-[#E63027]">{slot.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white">{slot.label}</span>
                      {slot.tag && (
                        <span className="px-1.5 py-0.5 text-xs font-black bg-[#E63027] text-white rounded">
                          {slot.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A0A0A0] truncate">{slot.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
