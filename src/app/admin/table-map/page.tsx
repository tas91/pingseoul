'use client'

import { useCallback, useEffect, useReducer, useState } from 'react'
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

// 선택 상태를 단일 reducer로 관리 — stale closure 방지
type SelectionState = { selectedTableIds: string[]; activeTableId: string | null }
type SelectionAction = { type: 'toggle'; id: string } | { type: 'clear' }

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  if (action.type === 'clear') return { selectedTableIds: [], activeTableId: null }
  const { id } = action
  if (state.selectedTableIds.includes(id)) {
    const next = state.selectedTableIds.filter(sid => sid !== id)
    return {
      selectedTableIds: next,
      activeTableId: state.activeTableId === id ? (next.at(-1) ?? null) : state.activeTableId,
    }
  }
  return { selectedTableIds: [...state.selectedTableIds, id], activeTableId: id }
}

// Realtime payload에서 business_date 안전 추출
function extractBusinessDate(obj: unknown): string | undefined {
  if (obj && typeof obj === 'object' && 'business_date' in obj) {
    const val = (obj as Record<string, unknown>).business_date
    return typeof val === 'string' ? val : undefined
  }
}

export default function TableMapPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [data, setData] = useState<TableMapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selection, dispatch] = useReducer(selectionReducer, { selectedTableIds: [], activeTableId: null })
  const { selectedTableIds, activeTableId } = selection

  // background=true 이면 전체 로딩 스피너 없이 데이터만 갱신
  const fetchData = useCallback(async (date: string, background = false) => {
    if (background) setRefreshing(true)
    else setLoading(true)
    try {
      const params = new URLSearchParams({ date })
      const res = await fetch(`/api/admin/table-map?${params}`)
      if (res.ok) setData(await res.json())
      else setData(null)
    } finally {
      if (background) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(selectedDate)
  }, [selectedDate, fetchData])

  // 실시간 구독 — 현재 날짜의 변경만 백그라운드 refetch
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`admin-table-map-rt-${selectedDate}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, (payload) => {
        const changedDate = extractBusinessDate(payload.new) ?? extractBusinessDate(payload.old)
        if (changedDate === selectedDate) {
          fetchData(selectedDate, true)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedDate, fetchData])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    dispatch({ type: 'clear' })
  }

  const handleTableClick = (table: TableWithStatus) => dispatch({ type: 'toggle', id: table.id })
  const handlePanelClose = () => dispatch({ type: 'clear' })

  const activeTable = data?.tables.find(t => t.id === activeTableId) ?? null
  const slotCounts = data?.slotCounts

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-semibold text-white mb-6">테이블맵</h1>

      {/* 날짜 + 시간대별 현황 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-ping-red transition-colors"
        />

        {slotCounts && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ping-gray">예약 현황</span>
            {(Object.keys(SLOT_LABEL) as SlotKey[]).map((key) => {
              const count = slotCounts[key] ?? 0
              return (
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
              )
            })}
          </div>
        )}

        {refreshing && <span className="text-xs text-ping-gray animate-pulse">업데이트 중...</span>}

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
            onUpdated={() => fetchData(selectedDate, true)}
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
