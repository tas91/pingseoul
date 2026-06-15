import { describe, it, expect } from 'vitest'
import { validateSlot } from '@/lib/reservation-transitions'
import { buildQuery } from '@/hooks/useReservations'

describe('validateSlot', () => {
  it.each(['slot_00', 'slot_02', 'slot_04', 'slot_06'])('%s는 유효한 슬롯', (slot) => {
    expect(validateSlot(slot)).toBe(true)
  })

  it.each(['slot_01', 'slot_03', 'slot_05', '', 'SLOT_00', 'slot00'])('%s는 유효하지 않은 슬롯', (slot) => {
    expect(validateSlot(slot)).toBe(false)
  })
})

describe('buildQuery', () => {
  it('빈 필터: 빈 문자열 반환', () => {
    expect(buildQuery({})).toBe('')
  })

  it('business_date 필터: query string 포함', () => {
    const qs = buildQuery({ business_date: '2025-01-01' })
    expect(qs).toContain('business_date=2025-01-01')
  })

  it('status 필터: query string 포함', () => {
    const qs = buildQuery({ status: 'pending' })
    expect(qs).toContain('status=pending')
  })

  it('status=all: query string에서 제외', () => {
    const qs = buildQuery({ status: 'all' })
    expect(qs).not.toContain('status')
  })

  it('keyword 필터: query string 포함', () => {
    const qs = buildQuery({ keyword: 'PG-001' })
    expect(qs).toContain('keyword=PG-001')
  })

  it('여러 필터 조합: 모두 포함', () => {
    const qs = buildQuery({ business_date: '2025-01-01', status: 'confirmed', keyword: 'A' })
    expect(qs).toContain('business_date=2025-01-01')
    expect(qs).toContain('status=confirmed')
    expect(qs).toContain('keyword=A')
  })

  it('결과는 ? 로 시작', () => {
    const qs = buildQuery({ status: 'pending' })
    expect(qs.startsWith('?')).toBe(true)
  })
})
