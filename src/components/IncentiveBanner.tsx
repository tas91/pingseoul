import Link from 'next/link'

const incentives = [
  {
    icon: '🍾',
    time: '새벽 4시 이전',
    benefit: '샴페인 1병 무료',
    detail: '샹동 가든 (약 90,000원 상당)',
    code: 'champagne_free',
    highlight: true,
  },
  {
    icon: '💯',
    time: '새벽 6시 이전',
    benefit: '바틀 10% 할인',
    detail: '주문 금액의 10% 할인 적용',
    code: 'discount_10',
    highlight: false,
  },
  {
    icon: '🎁',
    time: '새벽 8시 이전',
    benefit: '바틀 5% 할인',
    detail: '주문 금액의 5% 할인 적용',
    code: 'discount_5',
    highlight: false,
  },
]

export default function IncentiveBanner() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E63027]/5 via-transparent to-[#E63027]/3" />
      <div className="absolute inset-0 border-t border-b border-[#E63027]/10" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs text-[#E63027] font-bold tracking-[0.3em] uppercase mb-3">
            ★ EARLY DEPARTURE INCENTIVE
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            퇴장 시간 인센티브
          </h2>
          <p className="text-[#A0A0A0] text-base max-w-xl mx-auto leading-relaxed">
            예약 시 퇴장 시간을 미리 알려주시면 특별한 혜택을 드립니다.
            <br />
            <span className="text-[#E63027]">빠른 퇴장일수록 더 큰 혜택!</span>
          </p>
        </div>

        {/* Incentive cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {incentives.map((item) => (
            <div
              key={item.code}
              className={`relative rounded-2xl p-6 border transition-all duration-300 group hover:-translate-y-1 ${
                item.highlight
                  ? 'bg-gradient-to-br from-[#E63027]/15 to-[#1A1A1A] border-[#E63027]/40 box-glow-red'
                  : 'bg-[#1A1A1A] border-white/10 hover:border-[#E63027]/30'
              }`}
            >
              {item.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-[#E63027] text-white text-xs font-black rounded-full tracking-wider">
                    BEST
                  </span>
                </div>
              )}
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="mb-3">
                <span className="text-xs font-mono text-[#A0A0A0] bg-white/5 px-2 py-1 rounded border border-white/10">
                  {item.time} 퇴장
                </span>
              </div>
              <h3 className={`text-xl font-black mb-2 ${item.highlight ? 'text-[#E63027]' : 'text-white'}`}>
                {item.benefit}
              </h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-white/5 max-w-2xl mx-auto">
          <p className="text-xs text-[#A0A0A0] leading-relaxed text-center space-y-1">
            <span className="block">※ 퇴장 시간 입력은 예약 시 선택 사항입니다</span>
            <span className="block">※ 기재한 퇴장 시간 ±15분 이내 퇴장 시 혜택이 적용됩니다</span>
            <span className="block">※ 다른 할인과 중복 적용되지 않습니다</span>
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/reservation"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#E63027] hover:bg-[#B01F19] text-white font-bold rounded-full transition-all duration-200 text-sm tracking-wide"
          >
            <span>지금 예약하고 혜택 받기</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
