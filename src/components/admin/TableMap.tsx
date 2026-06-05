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

// ping_seat.png 기반 좌표 계산 상수
// 이미지 원본: ~390×820px / 표시: 380px 너비로 스케일
const SCALE = 380 / 390          // ≈ 0.974
const BG_CROP_Y = 127            // 로고 영역 크롭 (px, 스케일 적용 후)

// 이미지 내 테이블 영역 경계 (원본 px 추정)
const IMG_FP_X_MIN = 68          // 이미지 내 테이블 좌측 끝
const IMG_FP_X_MAX = 315         // 이미지 내 테이블 우측 끝
const IMG_FP_Y_MIN = 154         // 이미지 내 테이블 상단
const IMG_FP_Y_MAX = 610         // 이미지 내 테이블 하단

// DB 좌표 범위
const DB_X_MIN = 90, DB_X_MAX = 460
const DB_Y_MIN = 90, DB_Y_MAX = 620

function toScreen(dbX: number, dbY: number) {
  const sx = (IMG_FP_X_MIN + (dbX - DB_X_MIN) / (DB_X_MAX - DB_X_MIN) * (IMG_FP_X_MAX - IMG_FP_X_MIN)) * SCALE
  const sy = (IMG_FP_Y_MIN + (dbY - DB_Y_MIN) / (DB_Y_MAX - DB_Y_MIN) * (IMG_FP_Y_MAX - IMG_FP_Y_MIN)) * SCALE - BG_CROP_Y
  return { x: sx, y: sy }
}

const TABLE_SIZE: Record<string, { w: number; h: number }> = {
  VIP:      { w: 44, h: 44 },
  Standard: { w: 36, h: 36 },
  Standing: { w: 32, h: 24 },
}

const STATUS_STYLE: Record<DisplayStatus, string> = {
  available: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300',
  pending:   'bg-amber-500/20 border-amber-500/60 text-amber-300',
  confirmed: 'bg-[#E63027]/70 border-[#E63027] text-white',
  in_use:    'bg-violet-600/70 border-violet-400 text-white',
  blocked:   'bg-black/40 border-white/10 text-white/20',
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  available: '예약 가능',
  pending:   '대기중',
  confirmed: '확정',
  in_use:    '이용중',
  blocked:   '사용 불가',
}

export default function TableMap({ tables, selectedTableIds = [], activeTableId, onTableClick }: TableMapProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        width: 380,
        height: 520,
        backgroundImage: "url('/images/ping_seat.png')",
        backgroundSize: '380px auto',
        backgroundPosition: `0px -${BG_CROP_Y}px`,
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 반투명 오버레이 (이미지 위 가독성 향상) */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {tables.map((table) => {
        const size = TABLE_SIZE[table.type] ?? TABLE_SIZE.Standard
        const { x, y } = toScreen(table.position_x, table.position_y)
        const left = x - size.w / 2
        const top  = y - size.h / 2

        const styleClass = STATUS_STYLE[table.displayStatus]
        const isRound = table.type !== 'Standing'
        const displayId = table.id.match(/^\d+$/) ? `${table.id}` : table.id
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
              'absolute flex flex-col items-center justify-center border-2 z-10',
              styleClass,
              isRound ? 'rounded-full' : 'rounded-md',
              onTableClick ? 'cursor-pointer hover:brightness-125' : 'cursor-default',
              isActive
                ? 'ring-2 ring-white ring-offset-1 ring-offset-black/80 scale-110'
                : isSelected
                ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-black/80'
                : '',
              'select-none transition-all duration-150',
            ].join(' ')}
            style={{ left, top, width: size.w, height: size.h }}
          >
            <span className="text-[11px] font-bold leading-none">{displayId}</span>
            {table.reservation && (
              <span className="text-[9px] leading-none mt-0.5 opacity-90">
                {table.reservation.people_count}명
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
