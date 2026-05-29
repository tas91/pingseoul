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
  images: string[]
  status: EventStatus
  timeSlots: string[]
}

export interface AdminEvent {
  id: string
  name: string
  dj: string
  dress_code: string
  poster_url: string
  event_date: string
  start_time: string
  end_time: string
  entry_fee: number | null
  description: string | null
  notify_subscribers: boolean
  images: string[]
  created_at: string
}

export interface FaqItem {
  id: string
  category: string
  question: string
  answer: string
  display_order: number
}
