'use client'

type DisplayStatus = 'available' | 'pending' | 'confirmed' | 'in_use' | 'blocked'

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

interface TableMapProps {
  tables: TableWithStatus[]
  selectedTableIds?: string[]
  activeTableId?: string | null
  onTableClick?: (table: TableWithStatus) => void
}

// 420×720 캔버스 기준 하드코딩 레이아웃 (ping_seat 도면 기반)
const TABLE_LAYOUT: Record<string, { x: number; y: number }> = {
  '6':  { x: 50,  y: 36  },   // 상단 행 좌측 시작
  '7':  { x: 130, y: 36  },   // S2 열(x=130)에 맞춰 배치
  '5':  { x: 200, y: 36  },
  '4':  { x: 268, y: 36  },
  '3':  { x: 378, y: 30  },   // T2 위 우측 열로 이동
  '2':  { x: 378, y: 92  },
  '1':  { x: 378, y: 162 },
  '8':  { x: 52,  y: 110 },
  '9':  { x: 52,  y: 184 },
  '10': { x: 52,  y: 265 },
  '11': { x: 52,  y: 345 },
  '12': { x: 52,  y: 420 },
  '13': { x: 52,  y: 495 },
  '14': { x: 52,  y: 570 },
  '15': { x: 52,  y: 648 },   // T14 아래 행
  'S2': { x: 130, y: 648 },   // T15 와 같은 행
  'S1': { x: 205, y: 648 },   // T15 와 같은 행
}

const TABLE_SIZE: Record<string, { w: number; h: number }> = {
  VIP:      { w: 56, h: 50 },
  Standard: { w: 50, h: 44 },
  Standing: { w: 44, h: 38 },
}

const STATUS_STYLE: Record<DisplayStatus, string> = {
  available: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300',
  pending:   'bg-amber-500/15 border-amber-500/50 text-amber-300',
  confirmed: 'bg-[#E63027]/60 border-[#E63027] text-white',
  in_use:    'bg-violet-600/60 border-violet-400 text-white',
  blocked:   'bg-white/5 border-white/15 text-white/25',
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  available: '예약 가능', pending: '대기중', confirmed: '확정',
  in_use: '이용중', blocked: '사용 불가',
}

// 고정 시설 요소 (BAR, LOCKER 등)
const FIXTURES = [
  { label: 'BAR',       left: 315, top: 243, w: 90, h: 200, style: 'bg-red-950/60 border-red-900/60' },
  { label: 'LOCKER 3',  left: 315, top: 498, w: 90, h: 22,  style: 'bg-zinc-800/80 border-zinc-600/40' },
  { label: 'LOCKER 1',  left:   5, top: 678, w: 26, h: 28,  style: 'bg-zinc-800/80 border-zinc-600/40' },
  { label: 'LOCKER 2',  left: 105, top: 672, w: 75, h: 24,  style: 'bg-zinc-800/80 border-zinc-600/40' },
]

const LABELS = [
  { text: 'SMOKING\nAREA', left: 318, top: 528, size: '8px' },
  { text: 'ENTRANCE →', left: 158, top: 696, size: '9px' },
]

export default function TableMap({ tables, selectedTableIds = [], activeTableId, onTableClick }: TableMapProps) {
  return (
    <div
      className="relative bg-[#0d0d0d] rounded-lg border border-[#C1272D]/30 overflow-hidden"
      style={{ width: 420, height: 720 }}
    >
      {/* 내부 댄스플로어 영역 표시 */}
      <div
        className="absolute bg-white/[0.015] border border-white/5 rounded-sm pointer-events-none"
        style={{ left: 95, top: 65, width: 205, height: 520 }}
      />

      {/* 고정 시설 (BAR, LOCKER 등) */}
      {FIXTURES.map(f => (
        <div
          key={f.label}
          className={`absolute border rounded-sm flex items-center justify-center pointer-events-none ${f.style}`}
          style={{ left: f.left, top: f.top, width: f.w, height: f.h }}
        >
          <span className="text-white/40 font-medium leading-tight text-center"
            style={{ fontSize: '9px', whiteSpace: 'pre-line' }}>
            {f.label}
          </span>
        </div>
      ))}

      {/* 라벨 */}
      {LABELS.map(l => (
        <div
          key={l.text}
          className="absolute text-white/20 pointer-events-none font-medium text-center leading-tight"
          style={{ left: l.left, top: l.top, fontSize: l.size, whiteSpace: 'pre-line' }}
        >
          {l.text}
        </div>
      ))}

      {/* 테이블 */}
      {tables.map((table) => {
        const pos = TABLE_LAYOUT[table.id]
        if (!pos) return null

        const size = TABLE_SIZE[table.type] ?? TABLE_SIZE.Standard
        const left = pos.x - size.w / 2
        const top  = pos.y - size.h / 2
        const styleClass = STATUS_STYLE[table.displayStatus]
        const displayId = table.id.match(/^\d+$/) ? table.id : table.id
        const isSelected = selectedTableIds.includes(table.id)
        const isActive = activeTableId === table.id

        const tooltipParts = [
          `테이블 ${displayId} (${table.type}) · 수용 ${table.capacity}명`,
          `상태: ${STATUS_LABEL[table.displayStatus]}`,
        ]
        if (table.reservation) {
          tooltipParts.push(`예약번호: ${table.reservation.reservation_number}`)
          tooltipParts.push(`인원: ${table.reservation.people_count}명`)
        }

        return (
          <div
            key={table.id}
            title={tooltipParts.join('\n')}
            onClick={() => onTableClick?.(table)}
            className={[
              'absolute flex flex-col items-center justify-center border-2 rounded-lg z-10',
              styleClass,
              onTableClick ? 'cursor-pointer hover:brightness-125' : 'cursor-default',
              isActive
                ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0d0d0d] brightness-125'
                : isSelected
                ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-[#0d0d0d]'
                : '',
              'select-none transition-all duration-150',
            ].join(' ')}
            style={{ left, top, width: size.w, height: size.h }}
          >
            <span className="text-[11px] font-bold leading-none">{displayId}</span>
            {table.reservation && (
              <span className="text-[9px] leading-none mt-0.5 opacity-80">
                {table.reservation.people_count}명
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
