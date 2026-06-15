import { describe, it, expect } from 'vitest'
import { validateStatusPatch } from '@/lib/reservation-transitions'

describe('validateStatusPatch', () => {
  it('confirmed 상태: approved_at 포함', () => {
    const result = validateStatusPatch({ status: 'confirmed' })
    expect('updates' in result).toBe(true)
    if ('updates' in result) {
      expect(result.updates.status).toBe('confirmed')
      expect(typeof result.updates.approved_at).toBe('string')
    }
  })

  it('in_use 상태: checked_in_at 포함', () => {
    const result = validateStatusPatch({ status: 'in_use' })
    expect('updates' in result).toBe(true)
    if ('updates' in result) {
      expect(result.updates.checked_in_at).toBeDefined()
    }
  })

  it('completed 상태: checked_out_at 포함', () => {
    const result = validateStatusPatch({ status: 'completed' })
    expect('updates' in result).toBe(true)
    if ('updates' in result) {
      expect(result.updates.checked_out_at).toBeDefined()
    }
  })

  it('rejected + reject_reason 있음: 성공', () => {
    const result = validateStatusPatch({ status: 'rejected', reject_reason: '노쇼 이력' })
    expect('updates' in result).toBe(true)
    if ('updates' in result) {
      expect(result.updates.status).toBe('rejected')
      expect(result.updates.reject_reason).toBe('노쇼 이력')
    }
  })

  it('rejected + reject_reason 없음: 에러 반환', () => {
    const result = validateStatusPatch({ status: 'rejected' })
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toBe('거절 사유를 입력해 주세요.')
    }
  })

  it('rejected + reject_reason 공백: 에러 반환', () => {
    const result = validateStatusPatch({ status: 'rejected', reject_reason: '   ' })
    expect('error' in result).toBe(true)
  })

  it('유효하지 않은 status: 에러 반환', () => {
    const result = validateStatusPatch({ status: 'flying' })
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toBe('유효하지 않은 status입니다.')
    }
  })

  it('빈 body: 에러 반환', () => {
    const result = validateStatusPatch({})
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toBe('변경할 필드가 없습니다.')
    }
  })

  it('admin_memo만 변경: updates에 포함', () => {
    const result = validateStatusPatch({ admin_memo: '메모' })
    expect('updates' in result).toBe(true)
    if ('updates' in result) {
      expect(result.updates.admin_memo).toBe('메모')
    }
  })

  it('table_id null 설정: updates에 포함', () => {
    const result = validateStatusPatch({ table_id: null })
    expect('updates' in result).toBe(true)
    if ('updates' in result) {
      expect(result.updates.table_id).toBeNull()
    }
  })
})
