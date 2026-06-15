import type { ReservationStatus, TimeSlot } from '@/lib/types'

export const ALLOWED_STATUSES: ReservationStatus[] = [
  'pending', 'confirmed', 'rejected', 'cancelled', 'in_use', 'completed', 'no_show',
]

export const ALLOWED_SLOTS: TimeSlot[] = ['slot_00', 'slot_02', 'slot_04', 'slot_06']

export interface PatchBody {
  status?: string
  reject_reason?: string
  admin_memo?: string
  table_id?: string | null
}

type PatchResult =
  | { error: string }
  | { updates: Record<string, unknown> }

export function validateStatusPatch(body: PatchBody): PatchResult {
  if (body.status !== undefined && !ALLOWED_STATUSES.includes(body.status as ReservationStatus)) {
    return { error: '유효하지 않은 status입니다.' }
  }

  if (body.status === 'rejected' && !body.reject_reason?.trim()) {
    return { error: '거절 사유를 입력해 주세요.' }
  }

  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) updates.status = body.status
  if (body.reject_reason !== undefined) updates.reject_reason = body.reject_reason.trim()
  if (body.admin_memo !== undefined) updates.admin_memo = body.admin_memo
  if (body.table_id !== undefined) updates.table_id = body.table_id

  if (body.status === 'confirmed') updates.approved_at = new Date().toISOString()
  if (body.status === 'in_use') updates.checked_in_at = new Date().toISOString()
  if (body.status === 'completed') updates.checked_out_at = new Date().toISOString()

  if (Object.keys(updates).length === 0) {
    return { error: '변경할 필드가 없습니다.' }
  }

  return { updates }
}

export function validateSlot(slot: string): slot is TimeSlot {
  return ALLOWED_SLOTS.includes(slot as TimeSlot)
}
