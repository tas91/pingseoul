'use client'

import { useCallback, useEffect, useState } from 'react'
import TableMap from '@/components/admin/TableMap'
import TableDetailPanel from '@/components/admin/TableDetailPanel'
import { createClient } from '@/lib/supabase/client'

type DisplayStatus = 'available' | 'pending' | 'confirmed' | 'in_use' | 'blocked'
type SlotKey = 'slot_00' | 'slot_02' | 'slot_04' | 'slot_06'

interface TableWithStatus {
  id: string
  type: 'VIP' | 'Standard' | 'Standing'
  position_x: number
  position_y: number
  capacity: number
  is_active: boolean
  displayStatus: DisplayStatus
  reservation?: {
    reservation_number: string
    people_count: number
    status: string
    count: number
  }
}

interface TableMapResponse {
  tables: TableWithStatus[]
  slotCounts: Record<SlotKey, number>
}

const SLOT_LABEL: Record<SlotKey, string> = {
  slot_00: '00시', slot_02: '02시', slot_04: '04시', slot_06: '06시',
}

const LEGEND = [
  { label: '예약 가능', color: 'bg-emerald-400' },
  { label: '대기중',    color: 'bg-amber-400' },
  { label: '확정',      color: 'bg-[#E63027]' },
  { label: '이용중',    color: 'bg-violet-500' },
  { label: '사용 불가', color: 'bg-white/20' },
]

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function TableMapPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [data, setData] = useState<TableMapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([])
  const [activeTableId, setActiveTableId] = useState<string | null>(null)

  // 슬롯 무관 — 날짜 기준 전체 조회
  const fetchData = useCallback(async (date: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin/table-map?date=${date}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData(selectedDate)
  }, [selectedDate, fetchData])

  // 실시간 구독
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-table-map-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchData(selectedDate)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedDate, fetchData])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedTableIds([])
    setActiveTableId(null)
  }

  // 동일 테이블 재클릭 시 선택 해제 (토글)
  const handleTableClick = (table: TableWithStatus) => {
    setSelectedTableIds(prev => {
      if (prev.includes(table.id)) {
        const next = prev.filter(id => id !== table.id)
        if (activeTableId === table.id) {
          setActiveTableId(next[next.length - 1] ?? null)
        }
        return next
      }
      return [...prev, table.id]
    })
    if (!selectedTableIds.includes(table.id)) {
      setActiveTableId(table.id)
    }
  }

  const handlePanelClose = () => {
    setSelectedTableIds([])
    setActiveTableId(null)
  }

  const activeTable = data?.tables.find(t => t.id === activeTableId) ?? null
  const slotCounts = data?.slotCounts

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-semibold text-white mb-6">테이블맵</h1>

      {/* 날짜 + 시간대별 현황 (정보 표시용, 필터 아님) */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-ping-red transition-colors"
        />

        {/* 시간대별 예약 수 — 읽기 전용 현황 */}
        {slotCounts && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ping-gray">예약 현황</span>
            {(Object.entries(slotCounts) as [SlotKey, number][]).map(([key, count]) => (
              <span
                key={key}
                className={`text-xs px-2.5 py-1 rounded-lg border ${
                  count > 0
                    ? 'border-ping-red/40 text-white bg-ping-red/10'
                    : 'border-white/10 text-white/30'
                }`}
              >
                {SLOT_LABEL[key]}
                {count > 0 && <span className="ml-1.5 font-semibold">{count}</span>}
              </span>
            ))}
          </div>
        )}

        {/* 선택 해제 */}
        {selectedTableIds.length > 0 && (
          <button
            onClick={handlePanelClose}
            className="text-xs text-ping-gray hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 rounded-lg transition-colors"
          >
            선택 해제 ({selectedTableIds.length})
          </button>
        )}
      </div>

      {/* Map + Panel */}
      <div className="flex gap-4 items-start">
        <div className="bg-black/20 border border-white/10 rounded-xl p-3 shrink-0">
          {loading ? (
            <div className="flex items-center justify-center w-[420px] h-[720px]">
              <p className="text-ping-gray text-sm">불러오는 중...</p>
            </div>
          ) : data ? (
            <TableMap
              tables={data.tables}
              selectedTableIds={selectedTableIds}
              activeTableId={activeTableId}
              onTableClick={handleTableClick}
            />
          ) : (
            <div className="flex items-center justify-center w-[420px] h-[720px]">
              <p className="text-ping-gray text-sm">데이터를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>

        {activeTable && (
          <TableDetailPanel
            table={activeTable}
            selectedTableIds={selectedTableIds}
            date={selectedDate}
            onClose={handlePanelClose}
            onUpdated={() => fetchData(selectedDate)}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        {LEGEND.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-ping-gray">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
