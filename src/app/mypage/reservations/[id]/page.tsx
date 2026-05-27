'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReservationListItem } from '@/lib/types'
import ReservationStatusBadge from '@/components/admin/reservations/ReservationStatusBadge'

const SLOT_LABEL: Record<string, string> = {
  slot_00: '00:00 입장',
  slot_02: '02:00 입장',
  slot_04: '04:00 입장',
  slot_06: '06:00 입장',
}

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [item, setItem] = useState<ReservationListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/user/reservations/${id}`)
        if (res.status === 404) {
          setError('예약을 찾을 수 없습니다.')
          return
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? '오류가 발생했습니다.')
          return
        }
        const data = await res.json()
        setItem(data.reservation)
      } catch {
        setError('네트워크 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-ping-gray text-sm">불러오는 중...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-ping-red text-sm">{error ?? '예약을 찾을 수 없습니다.'}</p>
        <Link
          href="/mypage/reservations"
          className="text-xs text-ping-gray hover:text-white transition-colors"
        >
          ← 예약 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-ping-gray hover:text-white transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-white">예약 상세</h1>
      </div>

      <div className="flex flex-col gap-5">
        {/* 상태 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <span className="text-xs font-mono text-ping-gray">{item.reservation_number}</span>
          <ReservationStatusBadge status={item.status} />
        </div>

        {/* 거절 사유 강조 */}
        {item.status === 'rejected' && item.reject_reason && (
          <div className="bg-ping-red/10 border border-ping-red/30 rounded-xl p-4">
            <p className="text-xs text-ping-red/70 mb-1">거절 사유</p>
            <p className="text-sm text-ping-red font-medium">{item.reject_reason}</p>
          </div>
        )}

        {/* 예약 정보 */}
        <section>
          <h2 className="text-xs text-ping-gray uppercase tracking-wide mb-3">예약 정보</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2.5">
            <Row
              label="신청일시"
              value={new Date(item.created_at).toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit',
              })}
            />
            <Row label="방문일" value={item.business_date} />
            <Row label="타임슬롯" value={SLOT_LABEL[item.arrival_slot] ?? item.arrival_slot} />
            <Row label="인원" value={`${item.people_count}명`} />
            <Row
              label="테이블"
              value={item.table ? `${item.table.type} (${item.table.id})` : '미배정'}
            />
          </div>
        </section>

        {/* 예약자 정보 */}
        <section>
          <h2 className="text-xs text-ping-gray uppercase tracking-wide mb-3">예약자 정보</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2.5">
            <Row label="예약자명" value={item.guest_name ?? '—'} />
            <Row label="연락처" value={item.guest_phone ?? '—'} />
            <Row label="인스타그램" value={item.guest_instagram ?? '—'} />
            {item.request_note && (
              <Row label="기타사항" value={item.request_note} />
            )}
          </div>
        </section>
      </div>

      {/* 목록으로 */}
      <div className="mt-6 text-center">
        <Link
          href="/mypage/reservations"
          className="text-xs text-ping-gray hover:text-white transition-colors"
        >
          ← 예약 목록으로
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-ping-gray shrink-0">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  )
}
