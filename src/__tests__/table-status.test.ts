import { describe, it, expect } from 'vitest'
import { aggregateByTable, resolveDisplayStatus, buildSlotCounts } from '@/lib/table-map-utils'

const makeTable = (id: string, is_active = true) => ({ id, is_active })

const makeRes = (table_id: string, status: string, overrides = {}) => ({
  table_id,
  arrival_slot: 'slot_00',
  status,
  reservation_number: `RES-${table_id}`,
  people_count: 2,
  ...overrides,
})

describe('resolveDisplayStatus', () => {
  it('is_active=false 테이블: blocked', () => {
    expect(resolveDisplayStatus(makeTable('1', false), {})).toBe('blocked')
  })

  it('예약 없는 활성 테이블: available', () => {
    expect(resolveDisplayStatus(makeTable('1'), {})).toBe('available')
  })

  it('pending 예약: pending', () => {
    const resByTable = aggregateByTable([makeRes('1', 'pending')])
    expect(resolveDisplayStatus(makeTable('1'), resByTable)).toBe('pending')
  })

  it('confirmed 예약: confirmed', () => {
    const resByTable = aggregateByTable([makeRes('1', 'confirmed')])
    expect(resolveDisplayStatus(makeTable('1'), resByTable)).toBe('confirmed')
  })

  it('in_use 예약: in_use', () => {
    const resByTable = aggregateByTable([makeRes('1', 'in_use')])
    expect(resolveDisplayStatus(makeTable('1'), resByTable)).toBe('in_use')
  })

  it('in_use + confirmed 동시: in_use 우선', () => {
    const resByTable = aggregateByTable([
      makeRes('1', 'confirmed'),
      makeRes('1', 'in_use'),
    ])
    expect(resolveDisplayStatus(makeTable('1'), resByTable)).toBe('in_use')
  })

  it('pending + confirmed 동시: confirmed 우선', () => {
    const resByTable = aggregateByTable([
      makeRes('1', 'pending'),
      makeRes('1', 'confirmed'),
    ])
    expect(resolveDisplayStatus(makeTable('1'), resByTable)).toBe('confirmed')
  })
})

describe('aggregateByTable', () => {
  it('table_id null인 예약 무시', () => {
    const result = aggregateByTable([{ ...makeRes('1', 'pending'), table_id: null }])
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('동일 테이블 예약 2개: count=2', () => {
    const result = aggregateByTable([makeRes('1', 'pending'), makeRes('1', 'confirmed')])
    expect(result['1'].count).toBe(2)
  })

  it('다른 테이블: 각각 독립 집계', () => {
    const result = aggregateByTable([makeRes('1', 'pending'), makeRes('2', 'confirmed')])
    expect(result['1'].status).toBe('pending')
    expect(result['2'].status).toBe('confirmed')
  })
})

describe('buildSlotCounts', () => {
  it('빈 배열: 모두 0', () => {
    expect(buildSlotCounts([])).toEqual({ slot_00: 0, slot_02: 0, slot_04: 0, slot_06: 0 })
  })

  it('각 슬롯별 카운트', () => {
    const rows = [
      { arrival_slot: 'slot_00' },
      { arrival_slot: 'slot_00' },
      { arrival_slot: 'slot_02' },
      { arrival_slot: 'slot_06' },
    ]
    expect(buildSlotCounts(rows)).toEqual({ slot_00: 2, slot_02: 1, slot_04: 0, slot_06: 1 })
  })

  it('알 수 없는 슬롯 무시', () => {
    const rows = [{ arrival_slot: 'slot_99' }]
    expect(buildSlotCounts(rows)).toEqual({ slot_00: 0, slot_02: 0, slot_04: 0, slot_06: 0 })
  })
})
