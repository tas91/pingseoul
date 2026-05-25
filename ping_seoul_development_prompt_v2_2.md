# 🎯 Ping Seoul (핑 서울) 웹사이트 개발 의뢰서 v2.2

> **본 문서는 개발사 또는 AI 코딩 에이전트에 그대로 전달 가능한 개발 의뢰용 통합 프롬프트입니다.**
> **인프라**: Vercel (Hosting) + Supabase (Backend-as-a-Service)
> **v2.1 업데이트**: 테스트 전략 및 실시간 데모 프리뷰 환경 추가
> **v2.2 업데이트**: 운영시간/예약 타임슬롯/퇴장 시간 인센티브 정책 추가

---

## 0. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | Ping Seoul (핑 서울) |
| **인스타그램** | @ping_seoul |
| **운영사** | (주)핑서울 |
| **개발 범위** | 고객용 예약 웹사이트 + 관리자용 대시보드 (동시 개발) |
| **반응형** | Web (1024px+) / Tablet (768~1023px) / Mobile (~767px) |
| **인프라** | Vercel + Supabase |
| **운영시간** | **00:00(자정) ~ 익일 10:00 (KST)** |
| **예약 가능 시간대** | **00:00 / 02:00 / 04:00 / 06:00** (4개 타임슬롯) |
| **퇴장 시간 인센티브** | 예약 시 퇴장 시간 사전 작성 시 **샴페인 무료 또는 할인 혜택 제공** |
| **결제 처리** | MVP 미포함, 추후 확장 가능하도록 인터페이스 설계만 진행 |
| **운영 환경** | 한국 (Korean Standard Time, 한국어 우선) |
| **작성일** | 2026-05-20 |

---

## 1. 기술 스택 (확정)

### 1-1. 인프라 아키텍처

```
┌────────────────────────────────────────────────────┐
│              Vercel (Hosting & CDN)                 │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  Customer Web    │  │   Admin Web      │        │
│  │  (Next.js 14)    │  │   (Next.js 14)   │        │
│  └────────┬─────────┘  └────────┬─────────┘        │
│           │                      │                  │
│           └──────────┬───────────┘                  │
└──────────────────────┼───────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────┐
│              Supabase (BaaS)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │PostgreSQL│ │   Auth   │ │ Realtime │ │Storage │ │
│  │   (DB)   │ │  (OAuth) │ │(WebSocket)│ │ (이미지)│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────────────────────────────────────────┐  │
│  │       Edge Functions (Deno)                   │  │
│  │   - 카카오 알림톡 발송                          │  │
│  │   - 대기열 처리 로직                            │  │
│  │   - 예약 상태 자동 만료 (Cron)                  │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │     External APIs            │
        │  - Kakao OAuth               │
        │  - Google OAuth              │
        │  - Instagram Basic Display   │
        │  - 카카오 알림톡 (Bizppurio) │
        │  - SendGrid (이메일)         │
        └──────────────────────────────┘
```

### 1-2. 상세 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| **Frontend Framework** | Next.js 14 (App Router) | React Server Components 활용 |
| **언어** | TypeScript 5+ | 타입 안정성 |
| **스타일링** | Tailwind CSS + shadcn/ui | 다크모드 기본 지원 |
| **상태 관리** | Zustand 또는 TanStack Query | 서버 상태는 React Query 권장 |
| **호스팅** | Vercel | 자동 배포, Edge Network, ISR 활용 |
| **데이터베이스** | Supabase (PostgreSQL 15+) | RLS(Row Level Security) 적용 |
| **인증** | Supabase Auth | Google/Kakao/Instagram OAuth 통합 |
| **실시간 통신** | Supabase Realtime (Postgres Changes) | WebSocket 기반 |
| **파일 저장소** | Supabase Storage | 이벤트 포스터, 메뉴 이미지 |
| **서버리스 함수** | Supabase Edge Functions (Deno) + Vercel Functions | 알림 발송, 배치 작업 |
| **알림톡** | 카카오 알림톡 API (Bizppurio 또는 NHN Toast) | Edge Function에서 호출 |
| **이메일** | Resend 또는 SendGrid | Vercel 친화적 |
| **모니터링** | Sentry + Vercel Analytics + Supabase Logs | 통합 모니터링 |
| **CI/CD** | GitHub + Vercel 자동 배포 | PR 단위 Preview Deploy |
| **결제 (Phase 2)** | 토스페이먼츠 또는 아임포트 | 인터페이스만 우선 설계 |

### 1-3. Vercel 배포 구조

**모노레포 (Monorepo) 권장 구조**

```
ping-seoul/
├── apps/
│   ├── customer/          # 고객용 (ping-seoul.com)
│   │   └── next.config.js
│   └── admin/             # 관리자용 (admin.ping-seoul.com)
│       └── next.config.js
├── packages/
│   ├── ui/                # 공통 UI 컴포넌트
│   ├── database/          # Supabase 타입, 쿼리
│   └── utils/             # 공통 유틸 (날짜, 마스킹 등)
├── supabase/
│   ├── migrations/        # DB 마이그레이션 SQL
│   ├── functions/         # Edge Functions
│   └── seed.sql           # 시드 데이터
├── package.json
├── pnpm-workspace.yaml    # pnpm workspace
└── turbo.json             # Turborepo 설정 (선택)
```

**도메인 구성**
- 고객용: `ping-seoul.com` (또는 `www.ping-seoul.com`)
- 관리자용: `admin.ping-seoul.com`
- 각각 Vercel 프로젝트로 분리 배포 (관리자 페이지는 Vercel Password Protection 옵션 활성화)

---

## 2. 고객용 예약 웹사이트 (Customer Web)

### 2-1. 사이트 구조 (Information Architecture)

```
홈 (/)
├── 이벤트 (/events)
│   └── 이벤트 상세 (/events/[id])
├── 할인 (/promotions)
├── 메뉴 (/menu)
├── 예약하기 (/reservation)
│   ├── 로그인 (/reservation/login)
│   ├── 동의 (/reservation/consent)
│   ├── 입력 (/reservation/form)
│   └── 완료 (/reservation/complete)
├── FAQ (/faq)
└── 마이페이지 (/mypage)
    ├── 내 예약 (/mypage/reservations)
    └── P Point (/mypage/points)
```

### 2-2. 페이지별 상세 요구사항

#### 🏠 [홈 / 랜딩페이지] - `/`

- **Hero Section**
  - PING 로고 (오리지널 유지)
  - 클럽 분위기 비주얼 (영상 또는 이미지, Supabase Storage 호스팅)
  - 메인 CTA: `예약하기`
- **3주간 이벤트 카드탭 섹션** ⭐ 핵심
  - 탭 3종: `이번주` / `다음주` / `다다음주`
  - 데이터 소스: `events` 테이블에서 ISR(Incremental Static Regeneration)로 1시간마다 재생성
  - 카드 구성: 이벤트명, 일자(YYYY-MM-DD), DJ/게스트, 라인업 썸네일, 드레스코드, `예약하기` CTA
- **빠른 예약 Floating Button** (모든 페이지 상시 노출)
- **인스타그램 피드 임베드** (@ping_seoul)
- **푸터**: 사업자 정보, 위치 지도, 영업시간, 개인정보처리방침, 문의

#### 📅 [이벤트] - `/events`

- 월간 캘린더 뷰 + 리스트 뷰 토글
- 필터: 장르, DJ, 날짜
- 이벤트 상세 페이지(`/events/[id]`): 라인업, 시간표, 드레스코드, 입장료, 테이블 가격

#### 🎁 [할인] - `/promotions`

(이전 문서와 동일 — P Point, 세트 할인, 상시 혜택, 유의사항)

#### 🍾 [메뉴] - `/menu`

(이전 문서와 동일 — 8개 카테고리, 가격 단위 만원)

#### 📝 [예약하기] - `/reservation` ⭐ 핵심 플로우

```
[Step 1] Supabase Auth 소셜 로그인
   - Google OAuth (Supabase 기본 지원)
   - Kakao OAuth (Supabase Custom OIDC 또는 직접 구현)
   - Instagram Basic Display API (Custom 구현)
   ↓
[Step 2] 개인정보 동의 (필수)
   - consents 테이블에 동의 이력 저장
   ↓
[Step 3] 예약 정보 입력 ⭐ v2.2 업데이트
   - 방문 일자 선택 (YYYY-MM-DD)
   - 입장 시간대 선택 (4개 타임슬롯)
     · 00:00 (자정 오픈)
     · 02:00
     · 04:00
     · 06:00
   - 인원수 (1~30명)
   - 테이블 선택 (실시간 잔여 현황, Supabase Realtime)
   - 퇴장 시간 사전 입력 (선택, 인센티브 안내) ⭐ NEW
     · 미작성 가능 (선택 항목)
     · 작성 시 인센티브 자동 안내 (UI 상 강조)
   - 요청사항 자유 입력 (생일/기념일 등)
   ↓
[Step 4] 예약 신청 → reservations 테이블 INSERT (status: 'pending')
   ↓
[Step 5] Supabase Edge Function 트리거
   - 카카오 알림톡 발송 (Bizppurio API 호출)
   - 관리자 대시보드 실시간 알림 (Realtime broadcast)
```

**퇴장 시간 인센티브 UI 안내 (예시)**

> 💎 **퇴장 시간을 미리 알려주시면 혜택을 드려요!**
>
> - **04:00 이전 퇴장**: 샴페인 1병 무료 제공 (샹동 가든)
> - **06:00 이전 퇴장**: 바틀 10% 할인 적용
> - **08:00 이전 퇴장**: 바틀 5% 할인 적용
>
> *기재한 퇴장 시간 미준수 시 혜택이 회수될 수 있습니다.
> *다른 할인과 중복 적용 불가, 자세한 사항은 직원에게 문의해주세요.

#### ❓ [FAQ] - `/faq`

- 카테고리: 예약 / 취소 / 입장 / 드레스코드 / 결제 / P Point
- 검색 기능 + 아코디언 UI

#### 👤 [마이페이지] - `/mypage`

- 본인 예약 현황 조회 (RLS로 본인 데이터만 접근)
- P Point 잔액 조회
- 회원 탈퇴 기능

---

## 3. 관리자용 웹사이트 (Admin Dashboard)

### 3-1. 사이트 구조

```
관리자 대시보드 (admin.ping-seoul.com)
├── 로그인 (/login) - 이메일/비밀번호 + 2FA
├── 예약 현황 (/reservations)
├── 실시간 테이블 현황 (/table-map) ⭐
├── 이벤트 관리 (/events)
└── 관리자 계정 (/admins) - Super Admin만 접근
```

### 3-2. [예약 현황] - `/reservations`

- **Supabase Realtime 구독**으로 신규 예약 발생 시 즉시 반영
- 예약 리스트 (서버 페이지네이션)
- 컬럼: 예약번호 | 신청일시(YYYY-MM-DD HH:MM) | 방문일 | 예약자명 | 인원 | 테이블 | 상태 | 액션
- 상태 5단계: `대기` / `승인` / `거절` / `취소` / `노쇼`
- 필터: 날짜 범위, 상태, 테이블 종류
- 검색: 예약자명, 연락처(암호화 컬럼 검색), 예약번호
- 액션: ✅ 승인 / ❌ 거절(사유 선택) / 📝 메모

### 3-3. [실시간 Table Map] - `/table-map` ⭐⭐⭐

**Floor Plan 구조 (이미지 기반)**

```
┌─────────────────────────────────┐
│  [7] [6] [5] [4] [3]            │
│                      [2]        │
│  [8]                 [1]        │
│  [9]              ┌────┐        │
│  [10]             │BAR │        │
│  [11]             │    │        │
│  [12]             │    │        │
│  [13]             └────┘        │
│  [14]              LOCKER 3     │
│  [15]                           │
│         (S2)(S1)  🚬 SMOKING    │
│  L1 LOCKER 2 🎫ENTRANCE  🚻 RR  │
│           EXIT →                │
└─────────────────────────────────┘
```

**테이블 구성 (총 17석)**

| 구분 | 테이블 번호 | 수량 | 위치 |
|------|------------|------|------|
| VIP | 1~7 | 7개 | 상단 + 우측 |
| Standard | 8~15 | 8개 | 좌측 라인 |
| Standing | S1, S2 | 2개 | 중앙 하단 |

**테이블 상태 컬러 (5단계)**

| 상태 | 컬러 | DB 값 |
|------|------|-------|
| 🟢 빈 자리 | Green | `available` |
| 🟡 대기 | Amber | `pending` |
| 🔴 확정 | Red | `confirmed` |
| 🟣 사용 중 | Purple | `in_use` |
| ⚫ 사용 불가 | Gray | `blocked` |

**인터랙션**
- 마우스 호버: opacity 0.75
- 싱글 클릭: 상세 패널 노출 (예약자, 연락처, 인원, 시간, 이벤트, 로그인 출처, 메모)
- 관리자 직접 액션: 승인/거절 / 체크인 / 체크아웃 / 정보 수정

**실시간 업데이트**
- Supabase Realtime의 `postgres_changes` 이벤트 구독
- `reservations` 테이블 변경 시 즉시 UI 반영 (별도 폴링 불필요)

**시간/날짜 컨트롤** ⭐ v2.2 업데이트
- 일자 선택 (드롭다운, 기본값: 오늘 또는 영업 중인 영업일)
- **타임슬롯 탭 4종** (운영시간 00:00 ~ 익일 10:00 반영)
  - `00:00` (자정 오픈)
  - `02:00`
  - `04:00`
  - `06:00`
- **전체 보기** 토글 (모든 타임슬롯 통합 표시)
- 각 타임슬롯별 점유율 표시 (예: "00:00 타임 - 12/17 점유")

**영업일 처리 로직**
- **영업일(business_date)** = 오픈 시점(자정) 기준 날짜
- 예: 2026-05-23 23:00 ~ 2026-05-24 10:00 운영 → `business_date = 2026-05-23`
- 새벽 06:00 타임 예약도 `business_date`는 전날(오픈일) 기준
- 일별 정산/리포트도 영업일 기준

---

## 4. Supabase 데이터베이스 스키마 (확정)

### 4-1. 전체 테이블 구조

```sql
-- =====================================================
-- 1. 사용자 (Supabase Auth users 테이블 확장)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  social_provider VARCHAR(20) NOT NULL,  -- 'google', 'kakao', 'instagram'
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),                      -- 암호화 저장 (pgcrypto)
  email VARCHAR(255),
  birth_date DATE,                        -- 만 19세 이상 확인용
  marketing_consent BOOLEAN DEFAULT false,
  total_visits INT DEFAULT 0,             -- 누적 방문 횟수
  no_show_count INT DEFAULT 0,            -- 노쇼 횟수
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- 2. 동의 이력
-- =====================================================
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  consent_type VARCHAR(50) NOT NULL,      -- 'privacy', 'third_party', 'age_19', 'marketing'
  agreed BOOLEAN NOT NULL,
  agreed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);

-- =====================================================
-- 3. 테이블 마스터
-- =====================================================
CREATE TABLE public.tables (
  id VARCHAR(10) PRIMARY KEY,             -- '1'~'15', 'S1', 'S2'
  type VARCHAR(20) NOT NULL,              -- 'VIP', 'Standard', 'Standing'
  position_x INT NOT NULL,
  position_y INT NOT NULL,
  capacity INT NOT NULL,
  min_bottles INT DEFAULT 1,              -- 최소 보틀 수량
  is_active BOOLEAN DEFAULT true,
  display_order INT
);

-- 시드 데이터 (테이블 17개)
INSERT INTO public.tables (id, type, position_x, position_y, capacity, min_bottles) VALUES
  ('1', 'VIP', 460, 240, 6, 2),
  ('2', 'VIP', 460, 165, 6, 2),
  ('3', 'VIP', 390, 90, 6, 2),
  ('4', 'VIP', 315, 90, 8, 2),
  ('5', 'VIP', 240, 90, 8, 3),
  ('6', 'VIP', 165, 90, 6, 2),
  ('7', 'VIP', 90, 90, 6, 2),
  ('8', 'Standard', 90, 190, 4, 1),
  ('9', 'Standard', 90, 260, 4, 1),
  ('10', 'Standard', 90, 340, 4, 1),
  ('11', 'Standard', 90, 410, 5, 1),
  ('12', 'Standard', 90, 480, 4, 1),
  ('13', 'Standard', 90, 550, 4, 1),
  ('14', 'Standard', 90, 620, 4, 1),
  ('15', 'Standard', 165, 620, 4, 1),
  ('S1', 'Standing', 340, 620, 2, 1),
  ('S2', 'Standing', 270, 620, 2, 1);

-- =====================================================
-- 4. 이벤트
-- =====================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  dj VARCHAR(255) NOT NULL,
  dress_code VARCHAR(100) NOT NULL,
  poster_url VARCHAR(500) NOT NULL,       -- Supabase Storage URL
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  entry_fee INT,
  description TEXT,
  notify_subscribers BOOLEAN DEFAULT false,  -- 알림톡 자동 발송 여부
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON public.events(event_date);

-- =====================================================
-- 5. 예약 (핵심 테이블) - v2.2 업데이트
-- =====================================================
CREATE TYPE reservation_status AS ENUM (
  'pending',      -- 대기 (관리자 승인 전)
  'confirmed',    -- 확정
  'rejected',     -- 거절
  'cancelled',    -- 취소 (고객 취소)
  'in_use',       -- 사용중 (체크인)
  'completed',    -- 완료 (체크아웃)
  'no_show'       -- 노쇼
);

-- 타임슬롯 ENUM (운영시간 00:00 ~ 익일 10:00, 4개 슬롯)
CREATE TYPE time_slot AS ENUM (
  'slot_00',      -- 00:00 (자정 오픈)
  'slot_02',      -- 02:00
  'slot_04',      -- 04:00
  'slot_06'       -- 06:00
);

-- 퇴장 시간 인센티브 ENUM
CREATE TYPE departure_incentive AS ENUM (
  'champagne_free',   -- 샴페인 무료 (04:00 이전 퇴장)
  'discount_10',      -- 바틀 10% 할인 (06:00 이전 퇴장)
  'discount_5',       -- 바틀 5% 할인 (08:00 이전 퇴장)
  'none'              -- 인센티브 없음 (또는 미작성)
);

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number VARCHAR(20) UNIQUE NOT NULL,  -- 'PING-20260520-001' 형식
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  event_id UUID REFERENCES public.events(id),
  table_id VARCHAR(10) REFERENCES public.tables(id),

  -- 영업일 (운영시간이 익일까지 이어지므로 별도 컬럼 필수)
  business_date DATE NOT NULL,            -- 영업일 (오픈 시점 기준, 예: 2026-05-23)

  -- 입장 시간 (타임슬롯)
  visit_date DATE NOT NULL,               -- 실제 입장 일자 (00시 슬롯은 business_date와 동일, 02/04/06시는 익일)
  arrival_slot time_slot NOT NULL,        -- 4개 타임슬롯 중 선택
  visit_time TIME NOT NULL,               -- 실제 입장 시간 (arrival_slot 기반 자동 설정)

  -- 퇴장 시간 (선택 입력, 인센티브 연동) ⭐ v2.2 NEW
  expected_departure_time TIME,           -- 고객이 사전 입력한 예상 퇴장 시간 (NULL 가능)
  expected_departure_date DATE,           -- 퇴장 일자 (보통 익일)
  incentive_type departure_incentive DEFAULT 'none',  -- 자동 부여된 인센티브 유형
  incentive_applied BOOLEAN DEFAULT false, -- 인센티브 실제 적용 여부 (관리자 검증 후)

  people_count INT NOT NULL CHECK (people_count > 0),
  status reservation_status DEFAULT 'pending',
  waitlist_number INT,                    -- 대기 순번 (NULL이면 일반 예약)
  request_note TEXT,                      -- 고객 요청사항
  admin_memo TEXT,                        -- 관리자 메모
  reject_reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ                  -- 자동 만료 시각 (24시간)
);

CREATE INDEX idx_reservations_business_date ON public.reservations(business_date);
CREATE INDEX idx_reservations_business_date_slot ON public.reservations(business_date, arrival_slot);
CREATE INDEX idx_reservations_visit_date ON public.reservations(visit_date);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_user ON public.reservations(user_id);
CREATE INDEX idx_reservations_table ON public.reservations(table_id);

-- =====================================================
-- 6. 대기열 (v2.2 업데이트: 영업일 + 타임슬롯 단위 관리)
-- =====================================================
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id),
  business_date DATE NOT NULL,            -- 영업일 (v2.2 NEW)
  arrival_slot time_slot NOT NULL,        -- 타임슬롯 (v2.2 NEW)
  visit_date DATE NOT NULL,
  queue_number INT NOT NULL,              -- 대기 순번 (영업일+슬롯 단위)
  notified_at TIMESTAMPTZ,                -- 자리 발생 알림 발송 시각
  response_deadline TIMESTAMPTZ,          -- 응답 마감 시각 (30분)
  status VARCHAR(20) DEFAULT 'waiting',   -- 'waiting', 'notified', 'confirmed', 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_waitlist_unique ON public.waitlist(business_date, arrival_slot, queue_number);
CREATE INDEX idx_waitlist_business_date ON public.waitlist(business_date);

-- =====================================================
-- 7. P Point
-- =====================================================
CREATE TABLE public.points (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id),
  balance INT DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount INT NOT NULL,                    -- 양수: 적립, 음수: 사용
  type VARCHAR(20) NOT NULL,              -- 'earn', 'use', 'expire'
  description VARCHAR(255),
  reservation_id UUID REFERENCES public.reservations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. 알림 로그
-- =====================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  channel VARCHAR(20) NOT NULL,           -- 'kakao', 'email', 'push'
  type VARCHAR(50) NOT NULL,              -- 'reservation_received', 'reservation_confirmed' 등
  title VARCHAR(255),
  content TEXT,
  status VARCHAR(20) DEFAULT 'pending',   -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. 관리자 계정
-- =====================================================
CREATE TYPE admin_role AS ENUM ('super_admin', 'manager', 'staff');

CREATE TABLE public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role admin_role DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. FAQ
-- =====================================================
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,          -- 'reservation', 'cancel', 'entry', 'dress_code', 'payment', 'point'
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4-2. Row Level Security (RLS) 정책

```sql
-- profiles 테이블: 본인만 조회/수정 가능
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- reservations 테이블: 본인 예약만 조회 가능
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON public.reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 관리자 정책: admins 테이블의 활성 관리자는 모든 예약 조회/수정 가능
CREATE POLICY "Admins can view all reservations"
  ON public.reservations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- events, tables, faqs: 공개 SELECT 허용
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (true);

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tables"
  ON public.tables FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
```

### 4-3. Supabase Realtime 활성화

```sql
-- 실시간 구독이 필요한 테이블 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waitlist;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
```

### 4-4. PostgreSQL Functions (비즈니스 로직)

```sql
-- 예약번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TRIGGER AS $$
DECLARE
  date_str VARCHAR(8);
  seq_num INT;
BEGIN
  date_str := TO_CHAR(NEW.visit_date, 'YYYYMMDD');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(reservation_number, '-', 3) AS INT)
  ), 0) + 1 INTO seq_num
  FROM public.reservations
  WHERE reservation_number LIKE 'PING-' || date_str || '-%';

  NEW.reservation_number := 'PING-' || date_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_reservation_number
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  WHEN (NEW.reservation_number IS NULL)
  EXECUTE FUNCTION generate_reservation_number();

-- 만석 여부 체크 함수 (v2.2 업데이트: 영업일 + 타임슬롯 기준)
CREATE OR REPLACE FUNCTION is_fully_booked(
  check_business_date DATE,
  check_slot time_slot
)
RETURNS BOOLEAN AS $$
DECLARE
  occupied_count INT;
  total_tables INT;
BEGIN
  -- 동일 영업일 + 동일 타임슬롯의 점유 테이블 수 계산
  SELECT COUNT(*) INTO occupied_count
  FROM public.reservations
  WHERE business_date = check_business_date
    AND arrival_slot = check_slot
    AND status IN ('pending', 'confirmed', 'in_use');

  SELECT COUNT(*) INTO total_tables
  FROM public.tables
  WHERE is_active = true;

  RETURN occupied_count >= total_tables;
END;
$$ LANGUAGE plpgsql;

-- 영업일 자동 계산 함수 (v2.2 NEW)
-- 운영시간: 00:00 ~ 익일 10:00
-- 입력: 입장 일자 + 타임슬롯
-- 출력: 영업일 (오픈 시점 기준 날짜)
CREATE OR REPLACE FUNCTION calculate_business_date(
  arrival_date DATE,
  slot time_slot
)
RETURNS DATE AS $$
BEGIN
  -- 모든 타임슬롯(00, 02, 04, 06)은 동일 영업일에 속함
  -- 00시 슬롯은 그날 자정 오픈이므로 arrival_date == business_date
  -- 02/04/06시 슬롯은 익일 새벽이지만 같은 영업일 내
  -- → arrival_date 기준 그대로 반환
  RETURN arrival_date;
END;
$$ LANGUAGE plpgsql;

-- 타임슬롯 → 실제 시간 변환 함수 (v2.2 NEW)
CREATE OR REPLACE FUNCTION slot_to_time(slot time_slot)
RETURNS TIME AS $$
BEGIN
  RETURN CASE slot
    WHEN 'slot_00' THEN '00:00:00'::TIME
    WHEN 'slot_02' THEN '02:00:00'::TIME
    WHEN 'slot_04' THEN '04:00:00'::TIME
    WHEN 'slot_06' THEN '06:00:00'::TIME
  END;
END;
$$ LANGUAGE plpgsql;

-- 퇴장 시간에 따른 인센티브 자동 부여 함수 (v2.2 NEW)
CREATE OR REPLACE FUNCTION assign_departure_incentive()
RETURNS TRIGGER AS $$
BEGIN
  -- 퇴장 시간 미입력 시 인센티브 없음
  IF NEW.expected_departure_time IS NULL THEN
    NEW.incentive_type := 'none';
    RETURN NEW;
  END IF;

  -- 인센티브 정책 (퇴장 시간 기준)
  -- 04:00 이전 퇴장 → 샴페인 1병 무료 (샹동 가든)
  -- 06:00 이전 퇴장 → 바틀 10% 할인
  -- 08:00 이전 퇴장 → 바틀 5% 할인
  -- 08:00 이후 또는 미작성 → 인센티브 없음
  IF NEW.expected_departure_time < '04:00:00'::TIME THEN
    NEW.incentive_type := 'champagne_free';
  ELSIF NEW.expected_departure_time < '06:00:00'::TIME THEN
    NEW.incentive_type := 'discount_10';
  ELSIF NEW.expected_departure_time < '08:00:00'::TIME THEN
    NEW.incentive_type := 'discount_5';
  ELSE
    NEW.incentive_type := 'none';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_incentive
  BEFORE INSERT OR UPDATE OF expected_departure_time ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION assign_departure_incentive();

-- business_date 자동 설정 트리거 (v2.2 NEW)
CREATE OR REPLACE FUNCTION set_business_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.business_date IS NULL THEN
    NEW.business_date := calculate_business_date(NEW.visit_date, NEW.arrival_slot);
  END IF;

  IF NEW.visit_time IS NULL THEN
    NEW.visit_time := slot_to_time(NEW.arrival_slot);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_business_date
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION set_business_date();
```

### 4-5. Supabase Edge Functions (Deno)

**구현이 필요한 Edge Functions 목록**

| 함수명 | 트리거 | 기능 |
|--------|--------|------|
| `send-kakao-alimtalk` | DB 트리거 (notifications INSERT) | Bizppurio API 호출, 알림톡 발송 |
| `expire-pending-reservations` | Cron (1시간마다) | 24시간 무응답 예약 자동 만료 |
| `process-waitlist` | DB 트리거 (reservation status 변경) | 빈 자리 발생 시 대기열 처리 |
| `send-event-notification` | events INSERT 시 (notify_subscribers=true) | 구독자 대상 일괄 알림 |
| `reminder-notification` | Cron (매일 오전 10시) | 방문 1일 전 리마인더 발송 |

---

## 5. 핵심 비즈니스 로직

### 5-1. 예약 상태 플로우

```
[고객 예약 신청]
       ↓
INSERT INTO reservations (status='pending', expires_at=NOW()+24h)
       ↓
Supabase Realtime broadcast → 관리자 대시보드 실시간 알림
       ↓
[관리자 검토]
   ├─→ UPDATE status='confirmed' → Edge Function: 카카오 알림톡 발송
   ├─→ UPDATE status='rejected' → Edge Function: 거절 알림톡 발송
   └─→ [Cron 24시간 후] UPDATE status='cancelled' → 자동 만료
       ↓ (방문 당일)
[관리자 체크인] UPDATE status='in_use', checked_in_at=NOW()
       ↓ (영업 종료)
[관리자 체크아웃] UPDATE status='completed', checked_out_at=NOW()
   또는 [Cron 새벽 6시] 미체크인 → status='no_show'
```

### 5-2. 만석 & 대기열 로직 (Supabase Function)

```sql
-- 예약 INSERT 시 자동으로 만석 여부 체크 및 대기열 배정 (v2.2 업데이트)
CREATE OR REPLACE FUNCTION handle_reservation_insert()
RETURNS TRIGGER AS $$
DECLARE
  next_queue_num INT;
BEGIN
  -- 영업일 + 타임슬롯 기준으로 만석 체크
  IF is_fully_booked(NEW.business_date, NEW.arrival_slot) THEN
    -- 대기열에 자동 등록 (영업일 + 타임슬롯 단위)
    SELECT COALESCE(MAX(queue_number), 0) + 1 INTO next_queue_num
    FROM public.waitlist
    WHERE business_date = NEW.business_date
      AND arrival_slot = NEW.arrival_slot;

    NEW.waitlist_number := next_queue_num;

    INSERT INTO public.waitlist (
      reservation_id, business_date, arrival_slot, queue_number
    )
    VALUES (NEW.id, NEW.business_date, NEW.arrival_slot, next_queue_num);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_reservation_insert
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION handle_reservation_insert();
```

**※ 참고**: `waitlist` 테이블도 v2.2에서 `business_date`, `arrival_slot` 컬럼 추가 필요 (4-1 스키마 참조 및 마이그레이션 추가)

### 5-3. 운영시간 및 타임슬롯 정책 ⭐ v2.2 NEW

#### 운영시간

| 항목 | 내용 |
|------|------|
| **오픈 시간** | 매일 00:00 (자정) |
| **클로즈 시간** | 익일 10:00 |
| **총 운영시간** | 10시간 |
| **영업일 기준** | 오픈 시점(자정) 날짜 기준 |

#### 타임슬롯 4종

| 슬롯 코드 | 시간 | 설명 |
|----------|------|------|
| `slot_00` | **00:00** | 자정 오픈, 메인 피크 타임 |
| `slot_02` | **02:00** | 새벽 피크 진입 |
| `slot_04` | **04:00** | 새벽 후반부 |
| `slot_06` | **06:00** | 마지막 입장 (10시 종료 전 4시간) |

#### 영업일 처리 예시

```
[예시 1] 2026-05-23 토요일 영업
  ├─ slot_00 (00:00 입장) → visit_date: 2026-05-23, business_date: 2026-05-23
  ├─ slot_02 (02:00 입장) → visit_date: 2026-05-23, business_date: 2026-05-23
  ├─ slot_04 (04:00 입장) → visit_date: 2026-05-23, business_date: 2026-05-23
  └─ slot_06 (06:00 입장) → visit_date: 2026-05-23, business_date: 2026-05-23
  → 모두 동일 영업일(2026-05-23)로 묶임
  → 10:00 클로즈 → 영업 종료
```

#### 예약 가능 시간 제한

- **사전 예약 가능 기간**: 최대 3주 (홈 페이지의 3주간 이벤트 카드와 동기화)
- **당일 예약 가능 시간**: 해당 타임슬롯 1시간 전까지
  - 예: `slot_02`는 01:00까지 예약 가능
- **운영 종료 후 예약**: 오전 10시 ~ 23:59 사이에는 다음 영업일 예약만 가능

#### 운영시간 외 시스템 동작

| 시점 | 시스템 동작 |
|------|----------|
| 매일 10:00 (영업 종료 직후) | 미체크인 예약 자동 `no_show` 처리 (Cron) |
| 매일 11:00 | 전일 영업 리포트 자동 생성 |
| 매일 14:00 | 다음 영업일 예약 리마인더 발송 (방문 1일 전) |
| 매일 23:00 | 자정 오픈 1시간 전, 당일 예약자 리마인더 발송 |

### 5-4. 퇴장 시간 인센티브 정책 ⭐ v2.2 NEW

#### 정책 목적
- 테이블 회전율 제고 (이른 퇴장 유도)
- 대기 손님 수용력 확대
- 예측 가능한 운영 계획 수립

#### 인센티브 등급표

| 퇴장 시간 | 인센티브 코드 | 혜택 내용 | 가치 환산 |
|----------|--------------|----------|----------|
| **~04:00 이전** | `champagne_free` | 샹동 가든 1병 무료 제공 | 약 90,000원 |
| **~06:00 이전** | `discount_10` | 바틀 10% 할인 | 주문 금액의 10% |
| **~08:00 이전** | `discount_5` | 바틀 5% 할인 | 주문 금액의 5% |
| **08:00 이후 또는 미작성** | `none` | 인센티브 없음 | - |

#### 정책 운영 규칙

1. **인센티브 자동 부여**: 퇴장 시간 입력 시 시스템이 자동 등급 부여 (DB Trigger)
2. **고객 동의 사항**: 예약 폼에서 인센티브 안내 후 명시적 선택
3. **검증 책임**: 실제 퇴장 시간을 관리자가 확인 (`checked_out_at` 컬럼 활용)
4. **혜택 회수**: 기재한 퇴장 시간 초과 시 인센티브 미적용 (`incentive_applied = false`)
5. **중복 할인 불가**: 다른 할인(P Point, 생일자 등)과 중복 적용 불가
6. **유예 시간**: 기재 시간 ±15분 이내 퇴장은 정상 인정

#### 인센티브 자동 검증 로직 (Cron 또는 체크아웃 시)

```sql
-- 체크아웃 시 인센티브 적용 여부 자동 결정
CREATE OR REPLACE FUNCTION validate_incentive_on_checkout()
RETURNS TRIGGER AS $$
DECLARE
  promised_departure TIMESTAMPTZ;
  actual_departure TIMESTAMPTZ;
  grace_period INTERVAL := '15 minutes';
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_use' AND NEW.expected_departure_time IS NOT NULL THEN
    -- 약속 시간 (예약 다음날의 expected_departure_time)
    promised_departure := (NEW.business_date + INTERVAL '1 day' + NEW.expected_departure_time)::TIMESTAMPTZ;
    actual_departure := NEW.checked_out_at;

    -- 유예 시간(15분) 이내 퇴장 시 혜택 적용
    IF actual_departure <= promised_departure + grace_period THEN
      NEW.incentive_applied := true;
    ELSE
      NEW.incentive_applied := false;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_incentive
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION validate_incentive_on_checkout();
```

#### 관리자 UI에서의 인센티브 표시

- Table Map 클릭 시 상세 정보에 **인센티브 아이콘** 표시
  - 🍾 샴페인 무료
  - 💯 10% 할인
  - 💴 5% 할인
- 예약 현황 리스트에 인센티브 컬럼 추가
- 체크아웃 시 약속 시간 비교 후 적용 여부 자동 안내

#### 고객 UI 안내 문구 (예시)

> 💎 **퇴장 시간을 미리 알려주시면 혜택을 드립니다!**
>
> | 퇴장 시간 | 혜택 |
> |----------|------|
> | 새벽 4시 이전 | 🍾 샴페인 1병 무료 |
> | 새벽 6시 이전 | 💯 바틀 10% 할인 |
> | 새벽 8시 이전 | 💴 바틀 5% 할인 |
>
> ※ 기재 시간 미준수 시 혜택이 회수됩니다 (유예 ±15분)
> ※ 다른 할인과 중복 적용되지 않습니다

---

## 6. 메뉴 데이터 (참고)

(이전 문서와 동일 — Agwa Set, Jose Set, Champagne, Vodka & Liqueur, Whisky, Tequila & Gin)

**메뉴 관리 방식**: 메뉴는 변경 빈도가 낮으므로 **JSON 파일 또는 별도 `menu_items` 테이블**로 관리하되, 우선 MVP에서는 정적 JSON으로 시작 후 Phase 2에서 DB화 검토.

---

## 7. 알림 시스템 (카카오 알림톡)

### 7-1. 알림 템플릿 (사전 등록 필요) - v2.2 업데이트

| 템플릿 코드 | 시점 | 내용 |
|------------|------|------|
| `RSV_RECEIVED` | 예약 신청 직후 | "[핑서울] 예약 신청 접수, 승인 대기 중 (#{영업일} #{타임슬롯})" |
| `RSV_CONFIRMED` | 관리자 승인 | "[핑서울] 예약 확정 안내 (#{영업일} #{타임슬롯}, Table #{번호}, 인센티브: #{혜택})" |
| `RSV_REJECTED` | 관리자 거절 | "[핑서울] 예약 거절 (사유)" |
| `RSV_REMINDER_DAY_BEFORE` | 방문 1일 전 14:00 | "[핑서울] 내일 방문 리마인더 + 드레스코드 + 인센티브 안내" |
| `RSV_REMINDER_TODAY` | 당일 자정 1시간 전 (23:00) | "[핑서울] 오늘 #{타임슬롯} 입장 예약 안내" |
| `WAITLIST_UPDATE` | 대기 순번 변동 | "[핑서울] 대기 순번 변경 안내 (#{영업일} #{타임슬롯} - #{순번}번)" |
| `WAITLIST_AVAILABLE` | 자리 발생 | "[핑서울] 자리 발생! 30분 내 확정 요청 (#{타임슬롯})" |
| `INCENTIVE_REMINDER` ⭐ NEW | 입장 시 (체크인) | "[핑서울] 약속 퇴장 시간(#{시간})에 따라 #{혜택} 적용 예정" |
| `INCENTIVE_APPLIED` ⭐ NEW | 체크아웃 시 (혜택 적용) | "[핑서울] 약속 퇴장 시간 준수, #{혜택} 적용 완료. 감사합니다!" |
| `INCENTIVE_FORFEITED` ⭐ NEW | 체크아웃 시 (혜택 회수) | "[핑서울] 약속 퇴장 시간 초과로 인센티브 미적용 안내" |
| `EVENT_ANNOUNCE` | 이벤트 등록 (옵션) | "[핑서울] 새 이벤트 안내" |

### 7-2. 발송 흐름

```
reservations.status 변경 (DB Trigger)
   ↓
INSERT INTO notifications (status='pending')
   ↓
Supabase Webhook → Edge Function (send-kakao-alimtalk)
   ↓
Bizppurio API 호출
   ↓
UPDATE notifications.status='sent' (성공) 또는 'failed' (실패)
```

---

## 8. 관리자 이벤트 등록 - 필수 입력 항목

| 항목 | 필수 여부 | DB 컬럼 |
|------|----------|---------|
| 이벤트명 | 필수 | `events.name` |
| DJ | 필수 | `events.dj` |
| 드레스코드 | 필수 | `events.dress_code` |
| 라인업 이미지 / 포스터 | 필수 | `events.poster_url` (Supabase Storage 업로드) |
| 알림톡 자동 발송 여부 | 필수 | `events.notify_subscribers` (ON/OFF) |
| 일자 | 필수 | `events.event_date` |
| 시작/종료 시간 | 필수 | `events.start_time`, `end_time` |
| 입장료 | 선택 | `events.entry_fee` |
| 이벤트 상세 설명 | 선택 | `events.description` |

**이미지 업로드 흐름**
1. 관리자가 이미지 선택
2. Supabase Storage `event-posters` 버킷에 업로드
3. 반환된 public URL을 `events.poster_url`에 저장

---

## 9. 보안 및 컴플라이언스 (한국 법규 준수)

### 9-1. 개인정보 수집 항목

| 항목 | 수집 목적 | 보유 기간 | 암호화 |
|------|----------|----------|--------|
| 이름 | 예약자 확인 | 3년 | ❌ |
| 연락처 | 예약 안내·변경 | 3년 | ✅ pgcrypto |
| 이메일 | 예약 확인서 | 3년 | ❌ |
| 소셜 계정 ID | 로그인 식별 | 탈퇴 시까지 | ❌ |
| 생년월일 | 성인인증 | 3년 | ❌ |

### 9-2. Supabase 보안 설정

- **Row Level Security (RLS)**: 모든 테이블 활성화 필수
- **Service Role Key**: 클라이언트에 절대 노출 금지 (서버 환경변수)
- **Anon Key**: 공개 가능하지만 RLS 정책으로 보호
- **HTTPS**: Vercel 기본 제공
- **2FA**: 관리자 계정 필수 (Supabase Auth MFA)
- **개인정보 암호화**: `pgcrypto` 확장 사용 (`pgp_sym_encrypt`)
- **접근 로그**: Supabase Logs 1년 이상 보관

### 9-3. 필수 동의 항목

- ☑ 개인정보 수집·이용 동의 (필수)
- ☑ (주)핑서울 제3자 제공 동의 (필수)
- ☑ 만 19세 이상 확인 (필수)
- ☐ 마케팅 정보 수신 동의 (선택)

---

## 10. 디자인 가이드 (브랜드 이미지 기반)

### 10-1. 컬러 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| Primary BG | `#000000` | 순수 블랙 (메인 배경) |
| Primary Accent | `#E63027` | 핑 시그니처 레드 (CTA, 강조) |
| Secondary Dark | `#1A1A1A` | 카드, 모달 배경 |
| Text Primary | `#FFFFFF` | 메인 텍스트 |
| Text Secondary | `#A0A0A0` | 보조 텍스트 |
| Success | `#22C55E` | 성공, 확정 |
| Warning | `#FACC15` | 경고, 대기 |
| Danger | `#EF4444` | 위험, 거절 |

### 10-2. 타이포그래피

- **로고**: PING 오리지널 로고체 유지
- **한글**: Pretendard (Variable Font)
- **영문**: Inter 또는 Space Grotesk
- **숫자(가격)**: Tabular Numbers 사용

### 10-3. 디자인 톤

- 다크 모드 기반
- 네온 글로우 호버 이펙트 (Red Accent 활용)
- 별 모티프(★) 활용 (PING 로고 차용)
- 마이크로 애니메이션 (Framer Motion 권장)

---

## 11. 개발 우선순위 (MVP Scope)

### Phase 1 (MVP, 동시 개발) — 약 10~12주

**Week 1-2: 인프라 및 인증 셋업**
- ✅ Vercel 프로젝트 2개 생성 (customer, admin) + Staging 환경 분리
- ✅ Supabase 프로젝트 생성 (Production + Staging 분리) 및 스키마 마이그레이션
- ✅ Supabase Auth 설정 (Google/Kakao/Instagram OAuth)
- ✅ RLS 정책 적용
- ✅ Supabase Storage 버킷 설정 (event-posters, menu-images)
- ✅ **Storybook 초기 셋업 및 별도 배포**
- ✅ **시드 데이터(seed.sql) 자동 주입 스크립트 구축**

**Week 3-4: 고객용 기본 페이지**
- ✅ 홈, 이벤트, 메뉴, FAQ 페이지
- ✅ 3주간 이벤트 카드탭 (ISR)
- ✅ 반응형 디자인 (Mobile/Tablet/Desktop)
- ✅ **Storybook 컴포넌트 등록 (EventCard, MenuItem 등)**

**Week 5-6: 예약 시스템**
- ✅ 소셜 로그인 + 개인정보 동의
- ✅ 예약 신청 → 대기 상태 처리
- ✅ 실시간 잔여 테이블 표시 (Supabase Realtime)
- ✅ 대기열(Waitlist) FIFO 로직
- ✅ **단위 테스트 작성 (대기열 로직, 만석 체크)**

**Week 7-8: 관리자 대시보드**
- ✅ 예약 현황 페이지 (실시간 업데이트)
- ✅ 실시간 Table Map (클릭 인터랙션)
- ✅ 이벤트 관리 페이지
- ✅ **E2E 테스트 시나리오 작성 (Playwright)**

**Week 9: 알림 시스템 & Edge Functions**
- ✅ 카카오 알림톡 연동
- ✅ Edge Function 배포
- ✅ Cron Job 설정
- ✅ **통합 테스트 (예약 → 알림 발송 전 과정)**

**Week 10: 성능 최적화 및 테스트 자동화**
- ✅ Lighthouse 점수 최적화 (목표 90+)
- ✅ 부하 테스트 (k6) 실시
- ✅ 보안 점검 (OWASP ZAP)
- ✅ 시각적 회귀 테스트 (Chromatic) 적용

**Week 11: UAT (User Acceptance Test)**
- ✅ (주)핑서울 운영팀 대상 1주일 UAT
- ✅ 데모 시나리오 A, B, C 시연
- ✅ Critical/High 이슈 수정
- ✅ 클라이언트 사인오프

**Week 12: 런칭 준비**
- ✅ 프로덕션 배포
- ✅ 모니터링 대시보드 구축 (Sentry + Vercel Analytics)
- ✅ 운영 매뉴얼 작성
- ✅ 핸드오버

### Phase 2 (확장, 런칭 후)
- 결제 시스템 연동 (토스페이먼츠/아임포트)
- P Point 자동화
- 멤버십 등급제 (재방문 빈도/매출 기반)
- 노쇼 자동 페널티 시스템 (3회 노쇼 시 예약 차단)
- 게스트리스트(GL) 기능
- 다국어 지원 (영어)
- 입장 시 QR 체크인
- 매출 분석 대시보드

---

## 12. 테스트 및 데모 프리뷰 전략 ⭐

> **핵심 요구사항**: 단순 코드 테스트가 아닌, **실제 웹사이트가 구현된 모습을 시각적으로 확인할 수 있는 데모/프리뷰 환경**을 반드시 제공할 것.
> 클라이언트((주)핑서울)와 기획팀이 개발 진행 상황을 실시간으로 확인하고, 사용자 시나리오를 직접 체험할 수 있어야 함.

### 12-1. 데모/프리뷰 환경 구축 (필수)

#### 🌐 Vercel Preview Deployment (Pull Request 단위)

- 모든 Pull Request마다 **자동으로 미리보기 URL 생성** (예: `ping-seoul-pr-42.vercel.app`)
- 각 PR 코멘트에 자동으로 미리보기 링크 게시
- 기획팀/클라이언트가 머지 전 실제 동작 화면 확인 가능
- 모바일/태블릿/데스크탑에서 동시 검증

**Vercel 설정**
```bash
# vercel.json
{
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": false
  }
}
```

#### 🎨 Storybook (UI 컴포넌트 카탈로그)

- 개별 컴포넌트의 모든 상태(state)를 시각적으로 확인
- 디자이너/기획팀이 컴포넌트 단위로 디자인 검수 가능
- 별도 도메인 배포: `storybook.ping-seoul.com` (또는 Chromatic 활용)

**필수 Storybook 스토리 (컴포넌트별)**
- `EventCard`: 이번주/다음주/다다음주 카드 상태
- `TableCell`: 5단계 상태 (빈자리/대기/확정/사용중/차단)
- `ReservationStatusBadge`: 7가지 예약 상태 배지
- `LoginButton`: Google/Kakao/Instagram 3종
- `ConsentCheckbox`: 필수/선택 동의 항목
- `WaitlistNumberDisplay`: 대기 순번 표시

#### 🧪 Staging 환경 (실제 통합 데모용)

- 별도 Supabase 프로젝트로 **Staging DB 분리** (운영 데이터와 격리)
- 도메인: `staging.ping-seoul.com` / `staging-admin.ping-seoul.com`
- **시드 데이터(Seed Data) 자동 주입** — 실제 동작 시연 가능

### 12-2. 시드 데이터 (Seed Data) — 실제 동작 시연용

> 데모 환경에서는 **실제와 같은 데이터**가 미리 들어있어야 화면이 살아 있음을 보여줄 수 있음.

```sql
-- supabase/seed.sql

-- 1. 테이블 마스터 (17개) - 이미 4-1에 정의됨

-- 2. 테스트 사용자 3명
INSERT INTO public.profiles (id, social_provider, name, phone, email, birth_date) VALUES
  ('11111111-1111-1111-1111-111111111111', 'kakao', '김민준', '010-1234-5678', 'test1@example.com', '1995-03-15'),
  ('22222222-2222-2222-2222-222222222222', 'google', '이서연', '010-2345-6789', 'test2@example.com', '1998-07-22'),
  ('33333333-3333-3333-3333-333333333333', 'instagram', '박지호', '010-3456-7890', 'test3@example.com', '1996-11-08');

-- 3. 이번주/다음주/다다음주 이벤트 3개
INSERT INTO public.events (id, name, dj, dress_code, poster_url, event_date, start_time, end_time, entry_fee) VALUES
  ('aaa11111-1111-1111-1111-111111111111', 'PING NIGHT VOL.42', 'DJ KAYZER, GOSU', 'Smart Casual', '/seeds/poster-1.jpg', CURRENT_DATE + 2, '22:00', '05:00', 30000),
  ('aaa22222-2222-2222-2222-222222222222', 'BPM OVERLOAD', 'DJ STARLIGHT', 'All Black', '/seeds/poster-2.jpg', CURRENT_DATE + 9, '22:00', '05:00', 30000),
  ('aaa33333-3333-3333-3333-333333333333', 'PING ANNIVERSARY', 'DJ KAYZER, GOSU, STARLIGHT', 'Premium Dress', '/seeds/poster-3.jpg', CURRENT_DATE + 16, '22:00', '05:00', 50000);

-- 4. 다양한 상태의 예약 데이터 (Table Map 시연용) - v2.2 업데이트
-- 영업일 기준 + 타임슬롯 + 퇴장 시간 인센티브 데모용
INSERT INTO public.reservations (
  user_id, event_id, table_id, business_date, visit_date,
  arrival_slot, people_count, status, request_note,
  expected_departure_time
) VALUES
  -- Table 2: 00시 슬롯 확정, 04시 퇴장 약속 → 샴페인 무료 인센티브
  ('11111111-1111-1111-1111-111111111111', 'aaa11111-1111-1111-1111-111111111111',
   '2', CURRENT_DATE + 2, CURRENT_DATE + 2,
   'slot_00', 6, 'confirmed', '생일 기념',
   '03:30:00'),
  -- Table 3: 02시 슬롯 대기, 퇴장 시간 미작성 → 인센티브 없음
  ('22222222-2222-2222-2222-222222222222', 'aaa11111-1111-1111-1111-111111111111',
   '3', CURRENT_DATE + 2, CURRENT_DATE + 2,
   'slot_02', 4, 'pending', NULL,
   NULL),
  -- Table 5: 00시 슬롯 사용중, 06시 퇴장 약속 → 10% 할인 인센티브
  ('33333333-3333-3333-3333-333333333333', 'aaa11111-1111-1111-1111-111111111111',
   '5', CURRENT_DATE + 2, CURRENT_DATE + 2,
   'slot_00', 5, 'in_use', '체크인 완료',
   '05:30:00');

-- 5. FAQ 시드 데이터 (10개 이상) - v2.2 업데이트
INSERT INTO public.faqs (category, question, answer, display_order) VALUES
  ('reservation', '예약은 언제까지 가능한가요?', '입장 희망 타임슬롯의 1시간 전까지 예약 가능합니다. 만석일 경우 대기 순번 등록도 가능합니다.', 1),
  ('reservation', '예약 가능한 시간대는 어떻게 되나요?', '핑 서울은 00:00 / 02:00 / 04:00 / 06:00 4개 타임슬롯으로 운영됩니다. 영업시간은 자정부터 익일 오전 10시까지입니다.', 2),
  ('reservation', '퇴장 시간을 미리 알려주면 어떤 혜택이 있나요?', '04:00 이전 퇴장 시 샴페인 무료, 06:00 이전 퇴장 시 바틀 10% 할인, 08:00 이전 퇴장 시 5% 할인이 제공됩니다. 단, 약속 시간 ±15분 이내 퇴장 시 혜택이 적용됩니다.', 3),
  ('cancel', '예약 취소는 어떻게 하나요?', '마이페이지 > 내 예약에서 취소 가능합니다.', 4),
  ('entry', '입장 시 신분증이 필요한가요?', '만 19세 이상 확인을 위해 신분증 필수입니다.', 5),
  ('dress_code', '드레스코드는 무엇인가요?', '이벤트별 드레스코드는 이벤트 상세 페이지에서 확인 가능합니다.', 6);
```

**시드 데이터 자동 적용 스크립트**
```bash
# package.json scripts
{
  "seed:dev": "supabase db reset --linked",
  "seed:staging": "psql $STAGING_DB_URL -f supabase/seed.sql"
}
```

### 12-3. 데모 시나리오 (Demo Scenarios)

> 클라이언트가 직접 체험할 수 있는 **사전 정의된 시나리오**.

#### 시나리오 A: 고객 예약 플로우 체험
1. `staging.ping-seoul.com` 접속
2. 홈에서 `이번주` 탭의 'PING NIGHT VOL.42' 카드 클릭
3. 예약하기 버튼 → 카카오 로그인 (테스트 계정 제공)
4. 개인정보 동의 → 예약 정보 입력
5. 테이블 선택 시 **실시간 잔여 현황** 확인 (Table 2, 3, 5는 이미 점유 상태)
6. 예약 완료 → 카카오 알림톡 발송 확인 (실제 발송 또는 Mock)

#### 시나리오 B: 관리자 실시간 예약 처리 체험
1. `staging-admin.ping-seoul.com` 접속 (별도 테스트 계정 제공)
2. 예약 현황 페이지 → 시나리오 A의 신규 예약이 **실시간으로 나타나는 것** 확인
3. Table Map 페이지로 이동
4. 노란색(대기) 테이블 클릭 → 상세 정보 확인 → `승인` 처리
5. 빨간색(확정)으로 색상 변경 확인 (실시간 반영)
6. 고객에게 카카오 알림톡 발송 확인

#### 시나리오 C: 만석 & 대기열 체험
1. 데모 데이터에서 모든 테이블을 미리 점유 상태로 설정 (특정 타임슬롯)
2. 고객이 동일 타임슬롯 예약 시도 → "예약 마감, 대기 순번 등록" 자동 안내
3. 대기 순번 부여 (예: "대기 3번 - 00:00 슬롯")
4. 관리자가 1건 거절 → 대기 순번 1번에게 자동 알림 확인
5. 다른 타임슬롯은 정상 예약 가능함을 확인

#### 시나리오 D: 퇴장 시간 인센티브 체험 ⭐ v2.2 NEW
1. 예약 폼에서 `00:00` 타임슬롯 선택
2. 퇴장 시간 입력 필드에 `03:30` 입력
3. 화면에 자동으로 **"🍾 샴페인 1병 무료"** 인센티브 뱃지 노출
4. 예약 완료 후 알림톡에 인센티브 정보 포함 확인
5. **관리자 대시보드 Table Map**에서 해당 테이블 클릭
   - 인센티브 아이콘(🍾) 표시 확인
   - 약속 퇴장 시간(03:30) 표시 확인
6. 다른 시간으로 변경 시뮬레이션:
   - `05:30` → 💯 10% 할인으로 변경
   - `07:30` → 💴 5% 할인으로 변경
   - `09:00` → 인센티브 없음
7. 체크아웃 시뮬레이션:
   - 약속 시간 ±15분 이내 체크아웃 → 인센티브 적용 확인
   - 약속 시간 초과 → 인센티브 회수 알림 확인

### 12-4. 자동화 테스트 (개발자용)

#### 단위 테스트 (Unit Test)
- **Framework**: Vitest 또는 Jest
- **대상**: 비즈니스 로직 함수 (대기열 순번 계산, 할인율 자동 적용, 만석 체크 등)
- **커버리지 목표**: 핵심 로직 80% 이상

#### 통합 테스트 (Integration Test)
- **Framework**: Vitest + Supabase Test Client
- **대상**:
  - 예약 INSERT → 만석 시 대기열 자동 등록 트리거
  - 예약 상태 변경 → 알림 INSERT 트리거
  - RLS 정책 (본인 데이터만 접근 가능한지)

#### E2E 테스트 (End-to-End Test)
- **Framework**: **Playwright** (권장) 또는 Cypress
- **대상**:
  - 전체 예약 플로우 (로그인 → 동의 → 입력 → 완료)
  - 관리자 승인 → 고객 알림 수신
  - Table Map 클릭 → 상세 모달 노출
  - 반응형 (Mobile/Tablet/Desktop 각각)

```typescript
// e2e/reservation.spec.ts 예시
import { test, expect } from '@playwright/test';

test('고객 예약 플로우 전체', async ({ page }) => {
  await page.goto('https://staging.ping-seoul.com');
  await page.click('text=이번주');
  await page.click('text=PING NIGHT VOL.42');
  await page.click('text=예약하기');

  // 카카오 로그인 (테스트 계정)
  await page.click('text=카카오로 로그인');
  // ... (OAuth 모킹 또는 테스트 계정)

  // 개인정보 동의
  await page.check('input[name="privacy"]');
  await page.check('input[name="thirdParty"]');
  await page.check('input[name="age19"]');
  await page.click('text=다음');

  // 예약 정보 입력
  await page.fill('input[name="peopleCount"]', '4');
  await page.click('text=Table 1');
  await page.click('text=예약 신청');

  // 완료 화면 확인
  await expect(page.locator('text=예약 신청이 접수되었습니다')).toBeVisible();
});
```

#### 시각적 회귀 테스트 (Visual Regression Test)
- **도구**: Chromatic (Storybook 연동) 또는 Percy
- **목적**: UI 변경 시 의도하지 않은 디자인 깨짐 자동 감지

### 12-5. 반응형 디자인 검증 체크리스트

각 페이지마다 **3가지 뷰포트**에서 확인:

| 디바이스 | 뷰포트 | 검증 항목 |
|---------|--------|----------|
| Mobile | 375 x 667 (iPhone SE) | 햄버거 메뉴, 카드 스택 레이아웃, 터치 인터랙션 |
| Tablet | 768 x 1024 (iPad) | 2단 레이아웃, Table Map 적정 크기 |
| Desktop | 1440 x 900 | 3단 그리드, 풀스크린 히어로 |

**검증 도구**: Chrome DevTools Device Toolbar + Responsively App + 실기기 테스트(최소 1대)

### 12-6. 성능 테스트 (Lighthouse)

**목표 점수 (Customer Web 기준)**

| 항목 | 목표 |
|------|------|
| Performance | 90+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 95+ |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.5s |

- Vercel Analytics로 실사용자 성능 모니터링 (Real User Monitoring)
- 매주 Lighthouse 자동 리포트 발송 (GitHub Actions)

### 12-7. 부하 테스트 (Load Test) — 대형 이벤트 대비

- **도구**: k6 또는 Artillery
- **시나리오**: 인기 DJ 공연 발표 직후 동시 예약 신청 폭주 상황
- **목표**: 동시 접속 500명, 초당 예약 신청 50건 처리 가능

```javascript
// k6 부하 테스트 예시
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // 점진적 증가
    { duration: '5m', target: 500 }, // 피크 트래픽
    { duration: '2m', target: 0 },   // 종료
  ],
};

export default function () {
  const res = http.get('https://staging.ping-seoul.com/events');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

### 12-8. 보안 테스트

| 영역 | 도구/방법 |
|------|----------|
| SQL Injection | Supabase RLS + Prepared Statement (자동 방어) |
| XSS | Next.js 기본 이스케이프 + CSP 헤더 |
| CSRF | Supabase Auth JWT |
| 권한 우회 | RLS 정책 단위 테스트 |
| 개인정보 노출 | OWASP ZAP 자동 스캔 |
| HTTPS | Vercel 자동 (Let's Encrypt) |

### 12-9. UAT (User Acceptance Test) - 클라이언트 인수 테스트

**런칭 전 (주)핑서울 운영팀 대상 1주일 UAT 실시**

| Day | 활동 |
|-----|------|
| Day 1 | 데모 환경 오리엔테이션 (시나리오 A, B, C 시연) |
| Day 2-4 | 운영팀 자유 테스트 (실제 영업 상황 시뮬레이션) |
| Day 5 | 이슈 정리 및 Critical/High 우선순위 수정 |
| Day 6 | 최종 점검 및 사인오프 |

**UAT 체크리스트 (요약)**
- ☐ 3주간 이벤트 카드 정상 노출
- ☐ 소셜 로그인 3종 모두 정상 동작
- ☐ 예약 신청 → 관리자 알림 → 승인 → 고객 알림 전 과정 정상
- ☐ Table Map 클릭 시 실시간 정보 정확
- ☐ 대기열 FIFO 로직 정상
- ☐ 카카오 알림톡 7종 템플릿 정상 발송
- ☐ 모바일/태블릿/데스크탑 모두 정상 렌더링
- ☐ 개인정보처리방침/이용약관 페이지 노출

### 12-10. 테스트 환경 접근 정보 (문서화 필수)

개발사는 클라이언트에 다음 정보를 **개발 시작 후 2주 이내** 전달:

```markdown
## 테스트 환경 접근 정보

### URL
- 고객용 Staging: https://staging.ping-seoul.com
- 관리자용 Staging: https://staging-admin.ping-seoul.com
- Storybook: https://storybook.ping-seoul.com

### 테스트 계정
- 일반 사용자: test1@example.com / [발급된 비밀번호]
- 관리자 (Super Admin): admin@ping-seoul.com / [발급된 비밀번호]
- 관리자 (Manager): manager@ping-seoul.com / [발급된 비밀번호]

### 카카오 알림톡 (테스트 모드)
- 발송 로그: Supabase Dashboard > Logs
- 실제 발송 대신 콘솔 로그 출력 모드 활성화 가능

### 데이터 초기화
- 매일 새벽 4시 자동 시드 데이터 재주입
- 수동 초기화 필요 시 개발사에 요청
```

---

## 13. 환경변수 (Environment Variables)

### 13-1. Vercel (각 프로젝트별)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # 서버에서만 사용

# OAuth (Supabase에서도 설정 필요)
NEXT_PUBLIC_KAKAO_CLIENT_ID=xxx
KAKAO_CLIENT_SECRET=xxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=xxx
INSTAGRAM_CLIENT_SECRET=xxx

# 알림톡
BIZPPURIO_API_KEY=xxx
BIZPPURIO_USER_ID=xxx
BIZPPURIO_SENDER_KEY=xxx

# 이메일
RESEND_API_KEY=xxx

# 모니터링
NEXT_PUBLIC_SENTRY_DSN=xxx

# 기타
NEXT_PUBLIC_SITE_URL=https://ping-seoul.com
NEXT_PUBLIC_ADMIN_URL=https://admin.ping-seoul.com
```

### 13-2. Supabase Edge Functions

```bash
BIZPPURIO_API_KEY=xxx
BIZPPURIO_USER_ID=xxx
BIZPPURIO_SENDER_KEY=xxx
RESEND_API_KEY=xxx
```

---

## 14. 비용 예상 (월간, 참고용)

| 항목 | 플랜 | 예상 비용 (USD) |
|------|------|----------------|
| Vercel | Pro Plan (팀 협업, Preview Deploy 무제한) | $20 ~ $40 |
| Supabase Production | Pro Plan (8GB DB, 100GB 대역폭) | $25 |
| Supabase Staging | Free Plan (테스트용) | $0 |
| Resend (이메일) | 무료 (3,000건/월) ~ Pro | $0 ~ $20 |
| 카카오 알림톡 (Bizppurio) | 건당 약 9~13원 | 사용량 기반 |
| Sentry | Developer | $26 |
| **Chromatic (Visual Test)** | Free Plan (5,000 snapshots/월) | $0 |
| **합계 (예상)** | | **약 $70 ~ $120 (월)** |

※ 트래픽 및 사용량에 따라 변동, 초기 MVP는 대부분 무료 플랜으로 시작 가능
※ 테스트 환경 비용은 운영 환경의 약 20~30% 추가 발생 (Staging 분리 운영 시)

---

## 15. 향후 확장 고려사항 (Phase 2+)

- 멤버십 등급제 (재방문 빈도/매출 기반 자동 산정)
- 노쇼 방지 정책 (페널티 시스템: 3회 노쇼 시 예약 차단)
- 게스트리스트(GL) 기능 (DJ/프로모터별 무료입장 명단)
- 다국어 지원 (영어 — 외국인 관광객 대응)
- 입장 시 QR 체크인 기능
- 결제 시스템 도입 (예약금/잔금 분할 결제)
- P Point 자동 적립/사용 시스템 자동화
- 매출 분석 대시보드 (Supabase + Metabase/Looker Studio)
- 마케팅 자동화 (생일자, 휴면 고객 대상 메시지)
- 인스타그램 자동 포스팅 (이벤트 등록 시)

---

## 16. 참고 자료 및 문서

- **Next.js 14 App Router**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **Bizppurio (카카오 알림톡)**: https://www.bizppurio.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **테스트 관련**
  - Playwright (E2E): https://playwright.dev/
  - Vitest (Unit/Integration): https://vitest.dev/
  - Storybook (UI 카탈로그): https://storybook.js.org/
  - Chromatic (Visual Regression): https://www.chromatic.com/
  - k6 (Load Test): https://k6.io/

---

## ✅ 본 개발 의뢰서 작성 정보

| 항목 | 내용 |
|------|------|
| **작성일** | 2026-05-20 |
| **버전** | v2.2 (Vercel + Supabase + 테스트 전략 + 운영시간/타임슬롯/인센티브) |
| **작성자** | 핑 서울 기획팀 |
| **문의** | @ping_seoul |
| **개발 시작 예정** | 협의 |
| **개발 기간** | 약 10~12주 (UAT 포함) |

### 📝 버전 이력

| 버전 | 일자 | 주요 변경 사항 |
|------|------|---------------|
| v1.0 | 2026-05-20 | 초기 기획서 |
| v2.0 | 2026-05-20 | Vercel + Supabase 인프라 확정 |
| v2.1 | 2026-05-20 | 테스트 전략 및 데모 프리뷰 환경 추가 |
| **v2.2** | **2026-05-20** | **운영시간(00~10시), 타임슬롯(00/02/04/06시), 퇴장 시간 인센티브 정책 추가** |

---

## 📌 첨부 자료 (별도 송부)

1. 메뉴판 이미지 (PING 로고, 가격표)
2. Table Map 도면 (17석 + 부대시설)
3. 브랜드 가이드 (로고, 컬러)
4. 카카오 알림톡 템플릿 신청서 (Bizppurio)
