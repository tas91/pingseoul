export type DisplayStatus = 'available' | 'pending' | 'confirmed' | 'in_use' | 'blocked'

export const STATUS_PRIORITY: Record<string, number> = { in_use: 3, confirmed: 2, pending: 1 }
export const ACTIVE_STATUSES = ['pending', 'confirmed', 'in_use'] as const

export interface TableRow {
  id: string
  is_active: boolean
}

export interface ReservationRow {
  table_id: string | null
  arrival_slot: string
  status: string
  reservation_number: string
  people_count: number
}

export interface AggregatedEntry {
  reservation_number: string
  people_count: number
  status: string
  count: number
}

export function aggregateByTable(
  reservations: ReservationRow[]
): Record<string, AggregatedEntry> {
  const result: Record<string, AggregatedEntry> = {}
  for (const r of reservations) {
    if (!r.table_id) continue
    const entry = result[r.table_id]
    if (entry) {
      entry.count++
      if ((STATUS_PRIORITY[r.status] ?? 0) > (STATUS_PRIORITY[entry.status] ?? 0)) {
        entry.reservation_number = r.reservation_number
        entry.people_count = r.people_count
        entry.status = r.status
      }
    } else {
      result[r.table_id] = {
        reservation_number: r.reservation_number,
        people_count: r.people_count,
        status: r.status,
        count: 1,
      }
    }
  }
  return result
}

export function resolveDisplayStatus(
  table: TableRow,
  resByTable: Record<string, AggregatedEntry>
): DisplayStatus {
  if (!table.is_active) return 'blocked'
  const res = resByTable[table.id]
  if (!res) return 'available'
  if (res.status === 'in_use') return 'in_use'
  if (res.status === 'confirmed') return 'confirmed'
  if (res.status === 'pending') return 'pending'
  return 'available'
}

export interface SlotCountRow {
  arrival_slot: string
}

export type SlotCounts = { slot_00: number; slot_02: number; slot_04: number; slot_06: number }

export function buildSlotCounts(rows: SlotCountRow[]): SlotCounts {
  const counts: SlotCounts = { slot_00: 0, slot_02: 0, slot_04: 0, slot_06: 0 }
  for (const r of rows) {
    const key = r.arrival_slot as keyof SlotCounts
    if (key in counts) counts[key]++
  }
  return counts
}
