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

const SLOTS: { key: SlotKey; label: string }[] = [
  { key: 'slot_00', label: '00' },
  { key: 'slot_02', label: '02' },
  { key: 'slot_04', label: '04' },
  { key: 'slot_06', label: '06' },
]

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
  const [selectedSlot, setSelectedSlot] = useState<SlotKey>('slot_00')
  const [data, setData] = useState<TableMapResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // 다중 선택: 클릭 누적 (중복 클릭 허용)
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([])
  // 패널에 표시 중인 테이블 (가장 최근 클릭)
  const [activeTableId, setActiveTableId] = useState<string | null>(null)

  const fetchData = useCallback(async (date: string, slot: SlotKey) => {
    setLoading(true)
    const params = new URLSearchParams({ date, slot })
    const res = await fetch(`/api/admin/table-map?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData(selectedDate, selectedSlot)
  }, [selectedDate, selectedSlot, fetchData])

  // 실시간 구독
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-table-map-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchData(selectedDate, selectedSlot)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedDate, selectedSlot, fetchData])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedTableIds([])
    setActiveTableId(null)
  }

  const handleSlotChange = (slot: SlotKey) => {
    setSelectedSlot(slot)
    setSelectedTableIds([])
    setActiveTableId(null)
  }

  // 테이블 클릭: 이미 선택된 테이블 재클릭 시 선택 해제 (토글)
  const handleTableClick = (table: TableWithStatus) => {
    setSelectedTableIds(prev => {
      if (prev.includes(table.id)) {
        const next = prev.filter(id => id !== table.id)
        // 현재 활성 패널이 이 테이블이면 남은 것 중 마지막으로 이동
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

      {/* Date + Slot controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-ping-red transition-colors"
        />

        <div className="flex gap-2">
          {SLOTS.map(({ key, label }) => {
            const count = slotCounts?.[key] ?? 0
            const isActive = selectedSlot === key
            return (
              <button
                key={key}
                onClick={() => handleSlotChange(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ping-red text-white'
                    : 'border border-white/10 text-ping-gray hover:text-white hover:border-white/30'
                }`}
              >
                {label}시
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* 선택 해제 버튼 */}
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
        {/* Map container */}
        <div className="bg-black/20 border border-white/10 rounded-xl p-3 shrink-0">
          {loading ? (
            <div className="flex items-center justify-center w-[380px] h-[520px]">
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
            <div className="flex items-center justify-center w-[380px] h-[520px]">
              <p className="text-ping-gray text-sm">데이터를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>

        {/* Table detail panel */}
        {activeTable && (
          <TableDetailPanel
            table={activeTable}
            selectedTableIds={selectedTableIds}
            date={selectedDate}
            slot={selectedSlot}
            onClose={handlePanelClose}
            onUpdated={() => fetchData(selectedDate, selectedSlot)}
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
