export type EventStatus = 'available' | 'limited' | 'soldout'

export interface Event {
  id: string
  name: string
  date: string
  dayOfWeek: string
  dj: string
  lineup: string[]
  dressCode: string
  entryFee: number
  poster: string
  status: EventStatus
  timeSlots: string[]
}

const today = new Date()
const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}
const formatDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
const dayNames = ['일', '월', '화', '수', '목', '금', '토']

export const thisWeekEvents: Event[] = [
  {
    id: 'tw-1',
    name: 'PING NIGHT VOL.42',
    date: formatDate(addDays(today, 2)),
    dayOfWeek: dayNames[addDays(today, 2).getDay()],
    dj: 'DJ KAYZER',
    lineup: ['DJ KAYZER', 'GOSU'],
    dressCode: 'Smart Casual',
    entryFee: 30000,
    poster: '/images/ping_charactor.jpg',
    status: 'available',
    timeSlots: ['00:00', '02:00', '04:00'],
  },
  {
    id: 'tw-2',
    name: 'MIRACLE PING',
    date: formatDate(addDays(today, 4)),
    dayOfWeek: dayNames[addDays(today, 4).getDay()],
    dj: 'DJ STARLIGHT',
    lineup: ['DJ STARLIGHT', 'NOVA'],
    dressCode: 'All Black',
    entryFee: 35000,
    poster: '/images/ping_charactor2.jpg',
    status: 'limited',
    timeSlots: ['00:00', '02:00'],
  },
]

export const nextWeekEvents: Event[] = [
  {
    id: 'nw-1',
    name: 'BPM OVERLOAD',
    date: formatDate(addDays(today, 9)),
    dayOfWeek: dayNames[addDays(today, 9).getDay()],
    dj: 'DJ STARLIGHT',
    lineup: ['DJ STARLIGHT'],
    dressCode: 'All Black',
    entryFee: 30000,
    poster: '/images/ping_charactor.jpg',
    status: 'available',
    timeSlots: ['00:00', '02:00', '04:00', '06:00'],
  },
  {
    id: 'nw-2',
    name: 'PING FRIDAY',
    date: formatDate(addDays(today, 11)),
    dayOfWeek: dayNames[addDays(today, 11).getDay()],
    dj: 'DJ KAYZER',
    lineup: ['DJ KAYZER', 'GOSU', 'LUNAR'],
    dressCode: 'Smart Casual',
    entryFee: 25000,
    poster: '/images/ping_charactor2.jpg',
    status: 'available',
    timeSlots: ['00:00', '02:00', '04:00'],
  },
]

export const weekAfterNextEvents: Event[] = [
  {
    id: 'wan-1',
    name: 'PING ANNIVERSARY',
    date: formatDate(addDays(today, 16)),
    dayOfWeek: dayNames[addDays(today, 16).getDay()],
    dj: 'DJ KAYZER, GOSU, STARLIGHT',
    lineup: ['DJ KAYZER', 'GOSU', 'STARLIGHT'],
    dressCode: 'Premium Dress',
    entryFee: 50000,
    poster: '/images/ping_charactor.jpg',
    status: 'limited',
    timeSlots: ['00:00', '02:00', '04:00'],
  },
]

export const faqItems = [
  {
    category: 'reservation',
    question: '예약은 언제까지 가능한가요?',
    answer: '입장 희망 타임슬롯의 1시간 전까지 예약 가능합니다. 만석일 경우 대기 순번 등록도 가능합니다.',
  },
  {
    category: 'reservation',
    question: '예약 가능한 시간대는 어떻게 되나요?',
    answer: '핑 서울은 00:00 / 02:00 / 04:00 / 06:00 4개 타임슬롯으로 운영됩니다. 영업시간은 자정부터 익일 오전 10시까지입니다.',
  },
  {
    category: 'incentive',
    question: '퇴장 시간을 미리 알려주면 어떤 혜택이 있나요?',
    answer: '04:00 이전 퇴장 시 샴페인 무료, 06:00 이전 퇴장 시 바틀 10% 할인, 08:00 이전 퇴장 시 5% 할인이 제공됩니다.',
  },
  {
    category: 'cancel',
    question: '예약 취소는 어떻게 하나요?',
    answer: '마이페이지 > 내 예약에서 취소 가능합니다. 방문일 당일 취소는 불가합니다.',
  },
  {
    category: 'entry',
    question: '입장 시 신분증이 필요한가요?',
    answer: '만 19세 이상 확인을 위해 신분증 필수입니다. 신분증 미지참 시 입장이 제한될 수 있습니다.',
  },
  {
    category: 'dress_code',
    question: '드레스코드는 무엇인가요?',
    answer: '이벤트별 드레스코드는 이벤트 상세 페이지에서 확인 가능합니다. 드레스코드 미준수 시 입장이 거절될 수 있습니다.',
  },
]
