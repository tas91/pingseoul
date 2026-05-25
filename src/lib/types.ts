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

export interface FaqItem {
  id: string
  category: string
  question: string
  answer: string
  display_order: number
}
