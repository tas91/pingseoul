import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PING SEOUL | 핑 서울',
  description: '서울의 밤을 핑으로. 자정부터 오전 10시까지, 4개 타임슬롯으로 운영되는 프리미엄 클럽 핑 서울.',
  keywords: ['핑서울', 'ping seoul', '클럽', '예약', '나이트클럽', '서울'],
  openGraph: {
    title: 'PING SEOUL | 핑 서울',
    description: '서울의 밤을 핑으로.',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-white font-pretendard antialiased">
        {children}
      </body>
    </html>
  )
}
