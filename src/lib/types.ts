export type EventStatus = 'available' | 'limited' | 'soldout'

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'in_use'
  | 'completed'
  | 'no_show'

export type TimeSlot = 'slot_00' | 'slot_02' | 'slot_04' | 'slot_06'

export type DepartureIncentive = 'champagne_free' | 'discount_10' | 'discount_5' | 'none'

export interface ReservationListItem {
  id: string
  reservation_number: string
  created_at: string
  business_date: string
  arrival_slot: TimeSlot
  visit_time: string
  people_count: number
  status: ReservationStatus
  request_note: string | null
  admin_memo: string | null
  reject_reason: string | null
  incentive_type: DepartureIncentive
  approved_at: string | null
  checked_in_at: string | null
  checked_out_at: string | null
  expires_at: string | null
  guest_name: string | null
  guest_phone: string | null
  guest_email: string | null
  table: { id: string; type: string } | null
}

export interface ReservationFilters {
  business_date?: string
  status?: ReservationStatus | 'all'
  table_id?: string
  keyword?: string
}

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
