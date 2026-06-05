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
  const [selectedTable, setSelectedTable] = useState<TableWithStatus | null>(null)

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

  // 실시간 구독: 예약 변경 시 테이블맵 자동 갱신
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

  // 날짜/슬롯 변경 시 패널 닫기
  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedTable(null)
  }
  const handleSlotChange = (slot: SlotKey) => {
    setSelectedSlot(slot)
    setSelectedTable(null)
  }

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
      </div>

      {/* Map + Panel */}
      <div className="flex gap-4 items-start">
        {/* Map container */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-x-auto shrink-0">
          {loading ? (
            <div className="flex items-center justify-center w-[560px] h-[720px]">
              <p className="text-ping-gray text-sm">불러오는 중...</p>
            </div>
          ) : data ? (
            <TableMap
              tables={data.tables}
              selectedTableId={selectedTable?.id}
              onTableClick={setSelectedTable}
            />
          ) : (
            <div className="flex items-center justify-center w-[560px] h-[720px]">
              <p className="text-ping-gray text-sm">데이터를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>

        {/* Table detail panel */}
        {selectedTable && (
          <TableDetailPanel
            table={selectedTable}
            date={selectedDate}
            slot={selectedSlot}
            onClose={() => setSelectedTable(null)}
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
