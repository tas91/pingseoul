import Image from 'next/image'
import Link from 'next/link'

const menuHighlights = [
  { category: 'Agwa Set', items: [{ name: '아그와 1BT', price: '240,000' }, { name: '아그와 2BT', price: '384,000', badge: '20%' }, { name: '아그와 3BT', price: '540,000', badge: '25%' }] },
  { category: 'Jose Set', items: [{ name: '호세 1BT', price: '200,000' }, { name: '호세 2BT', price: '320,000', badge: '20%' }, { name: '호세 3BT', price: '450,000', badge: '25%' }] },
  { category: 'Champagne', items: [{ name: '샹동 가든', price: '90,000' }, { name: '모엣 상동', price: '220,000' }, { name: '비브클리코', price: '240,000' }, { name: '동페리뇽', price: '800,000' }] },
  { category: 'Whisky', items: [{ name: '맥카나', price: '210,000' }, { name: '조니워커 블랙', price: '240,000' }, { name: '조니워커 블루', price: '800,000' }] },
]

export default function MenuSection() {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-xs text-[#E63027] font-bold tracking-[0.3em] uppercase mb-2">★ MENU</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">메뉴 안내</h2>
        </div>
        <Link
          href="/menu"
          className="text-sm text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1 group w-fit"
        >
          전체 메뉴 보기
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Menu image */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <Image
            src="/images/ping_menu.png"
            alt="PING SEOUL 메뉴판"
            width={800}
            height={500}
            className="w-full h-auto object-contain bg-black"
          />
        </div>

        {/* Menu highlights */}
        <div className="space-y-4">
          {menuHighlights.map((group) => (
            <div key={group.category} className="bg-[#1A1A1A] rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-bold text-[#E63027] mb-3 tracking-wider">{group.category}</h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{item.name}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-xs font-black bg-[#E63027] text-white rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-white tabular-nums">{item.price}원</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* P Point notice */}
          <div className="bg-gradient-to-br from-[#E63027]/10 to-[#1A1A1A] rounded-xl p-5 border border-[#E63027]/20">
            <p className="text-sm font-black text-[#E63027] mb-2">★ P Point 안내</p>
            <ul className="space-y-1.5">
              <li className="text-xs text-[#A0A0A0]">· 바틀 결제 시 적립 및 사용 가능</li>
              <li className="text-xs text-[#A0A0A0]">· 금·공휴일 전날 1.5% / 토요일 1% 적립</li>
              <li className="text-xs text-[#A0A0A0]">· 생일자 바틀 10% 할인</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
