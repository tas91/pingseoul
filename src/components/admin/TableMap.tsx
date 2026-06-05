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
  selectedTableId?: string
  onTableClick?: (table: TableWithStatus) => void
}

const STATUS_STYLE: Record<DisplayStatus, string> = {
  available: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
  pending:   'bg-amber-500/15 border-amber-500/40 text-amber-400',
  confirmed: 'bg-[#E63027]/70 border-[#E63027] text-white',
  in_use:    'bg-violet-600/70 border-violet-500 text-white',
  blocked:   'bg-white/5 border-white/10 text-white/20',
}

const TABLE_SIZE: Record<string, { w: number; h: number }> = {
  VIP:      { w: 64, h: 64 },
  Standard: { w: 52, h: 52 },
  Standing: { w: 44, h: 36 },
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  available: '예약 가능',
  pending:   '대기중',
  confirmed: '확정',
  in_use:    '이용중',
  blocked:   '사용 불가',
}

export default function TableMap({ tables, selectedTableId, onTableClick }: TableMapProps) {
  return (
    <div className="relative w-[560px] h-[720px] bg-white/[0.02] rounded-lg border border-white/5">
      {tables.map((table) => {
        const size = TABLE_SIZE[table.type] ?? TABLE_SIZE.Standard
        const left = table.position_x - size.w / 2
        const top = table.position_y - size.h / 2
        const styleClass = STATUS_STYLE[table.displayStatus]
        const isRound = table.type !== 'Standing'
        const displayId = table.id.match(/^\d+$/) ? `T${table.id}` : table.id
        const isSelected = selectedTableId === table.id

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
            className={`absolute flex flex-col items-center justify-center border-2 ${styleClass} ${
              isRound ? 'rounded-full' : 'rounded-lg'
            } ${onTableClick ? 'cursor-pointer hover:brightness-125' : 'cursor-default'} ${
              isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''
            } select-none transition-all duration-150`}
            style={{ left, top, width: size.w, height: size.h }}
          >
            <span className="text-xs font-bold leading-none">{displayId}</span>
            {table.reservation && (
              <span className="text-[10px] leading-none mt-1 opacity-80">
                {table.reservation.people_count}명
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
