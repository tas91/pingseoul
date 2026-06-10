-- ============================================================
-- PING SEOUL STAGING SEED GUIDE
-- ============================================================
-- 관리자 로그인
--   super@pingseoul.com   / Ping1234!  → super_admin
--   manager@pingseoul.com / Ping1234!  → admin
--   staff@pingseoul.com   / Ping1234!  → admin
--
-- 예약·테이블맵 확인
--   /admin/reservations → 14개 예약, 7가지 상태, 4가지 인센티브 확인
--   /admin/table-map    → CURRENT_DATE+2 날짜 선택 후 슬롯 탐색
--     slot_00: 테이블 2(confirmed), 11(pending), 7(in_use)
--     slot_02: 테이블 4(confirmed), 12(pending), 13(in_use)
--     slot_04: 테이블 5(confirmed)
-- 재시드: npm run supabase:seed
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 테이블 배치 (기존)
-- ────────────────────────────────────────────────────────────

insert into public.tables (id, type, position_x, position_y, capacity, min_bottles, display_order) values
  ('1',  'VIP',      460, 240, 6, 2,  1),
  ('2',  'VIP',      460, 165, 6, 2,  2),
  ('3',  'VIP',      390,  90, 6, 2,  3),
  ('4',  'VIP',      315,  90, 8, 2,  4),
  ('5',  'VIP',      240,  90, 8, 3,  5),
  ('6',  'VIP',      165,  90, 6, 2,  6),
  ('7',  'VIP',       90,  90, 6, 2,  7),
  ('8',  'Standard',  90, 190, 4, 1,  8),
  ('9',  'Standard',  90, 260, 4, 1,  9),
  ('10', 'Standard',  90, 340, 4, 1, 10),
  ('11', 'Standard',  90, 410, 5, 1, 11),
  ('12', 'Standard',  90, 480, 4, 1, 12),
  ('13', 'Standard',  90, 550, 4, 1, 13),
  ('14', 'Standard',  90, 620, 4, 1, 14),
  ('15', 'Standard', 165, 620, 4, 1, 15),
  ('S1', 'Standing', 340, 620, 2, 1, 16),
  ('S2', 'Standing', 270, 620, 2, 1, 17)
on conflict (id) do update set
  type         = excluded.type,
  position_x   = excluded.position_x,
  position_y   = excluded.position_y,
  capacity     = excluded.capacity,
  min_bottles  = excluded.min_bottles,
  display_order = excluded.display_order;

-- ────────────────────────────────────────────────────────────
-- 미래 이벤트 3개 (기존)
-- ────────────────────────────────────────────────────────────

insert into public.events (id, name, dj, dress_code, poster_url, event_date, start_time, end_time, entry_fee, description, notify_subscribers)
values
  ('aaa11111-1111-1111-1111-111111111111', 'PING NIGHT VOL.42',  'DJ KAYZER, GOSU',          'Smart Casual',  '/seeds/poster-1.jpg',      current_date + 2,  '22:00', '05:00', 30000, '시드 이벤트 1', false),
  ('aaa22222-2222-2222-2222-222222222222', 'BPM OVERLOAD',        'DJ STARLIGHT',             'All Black',     '/seeds/poster-2.jpg',      current_date + 9,  '22:00', '05:00', 30000, '시드 이벤트 2', false),
  ('aaa33333-3333-3333-3333-333333333333', 'PING ANNIVERSARY',    'DJ KAYZER, GOSU, STARLIGHT','Premium Dress', '/seeds/poster-3.jpg',      current_date + 16, '22:00', '05:00', 50000, '시드 이벤트 3', false)
on conflict (id) do update set
  name               = excluded.name,
  dj                 = excluded.dj,
  dress_code         = excluded.dress_code,
  poster_url         = excluded.poster_url,
  event_date         = excluded.event_date,
  start_time         = excluded.start_time,
  end_time           = excluded.end_time,
  entry_fee          = excluded.entry_fee,
  description        = excluded.description,
  notify_subscribers = excluded.notify_subscribers;

-- ────────────────────────────────────────────────────────────
-- 섹션 1: 관리자 계정 (auth.users + admin_profiles)
-- ────────────────────────────────────────────────────────────

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  ('bbb11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'super@pingseoul.com',
   crypt('Ping1234!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('bbb22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'manager@pingseoul.com',
   crypt('Ping1234!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('bbb33333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'staff@pingseoul.com',
   crypt('Ping1234!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

insert into public.admin_profiles (id, name, role, is_active) values
  ('bbb11111-1111-1111-1111-111111111111', '슈퍼어드민', 'super_admin', true),
  ('bbb22222-2222-2222-2222-222222222222', '매니저',     'admin',       true),
  ('bbb33333-3333-3333-3333-333333333333', '스태프',     'admin',       true)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- 섹션 2: 고객 프로필 (auth.users + profiles)
-- ────────────────────────────────────────────────────────────

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  ('ccc11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'kim.minjun@example.com',
   crypt('Ping1234!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('ccc22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'lee.seoyeon@example.com',
   crypt('Ping1234!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('ccc33333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'park.jiwoo@example.com',
   crypt('Ping1234!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('ccc44444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'choi.sua@example.com',
   crypt('Ping1234!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('ccc55555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'jung.dohyun@example.com',
   crypt('Ping1234!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

insert into public.profiles (id, social_provider, name, phone, email, instagram_id, total_visits, no_show_count) values
  ('ccc11111-1111-1111-1111-111111111111', 'email', '김민준', '010-1234-5678', 'kim.minjun@example.com',  'minjun_kim',       1, 0),
  ('ccc22222-2222-2222-2222-222222222222', 'email', '이서연', '010-2345-6789', 'lee.seoyeon@example.com', 'seoyeon_official', 1, 0),
  ('ccc33333-3333-3333-3333-333333333333', 'email', '박지우', '010-3456-7890', 'park.jiwoo@example.com',  'jiwoo.park',       0, 1),
  ('ccc44444-4444-4444-4444-444444444444', 'email', '최수아', '010-4567-8901', 'choi.sua@example.com',    'sua_choi',         1, 0),
  ('ccc55555-5555-5555-5555-555555555555', 'email', '정도현', '010-5678-9012', 'jung.dohyun@example.com', 'dohyun_j',         0, 0)
on conflict (id) do update set
  name          = excluded.name,
  phone         = excluded.phone,
  instagram_id  = excluded.instagram_id,
  total_visits  = excluded.total_visits,
  no_show_count = excluded.no_show_count;

-- ────────────────────────────────────────────────────────────
-- 섹션 3: 과거 이벤트 2개 (completed · no_show 예약 연결용)
-- ────────────────────────────────────────────────────────────

insert into public.events (id, name, dj, dress_code, poster_url, event_date, start_time, end_time, entry_fee, description, notify_subscribers)
values
  ('ddd11111-1111-1111-1111-111111111111', 'PING NIGHT VOL.40', 'DJ KAYZER',   'Smart Casual', '/seeds/poster-past-1.jpg', current_date - 14, '22:00', '05:00', 30000, '지난 이벤트 1', false),
  ('ddd22222-2222-2222-2222-222222222222', 'NEON RAVE',         'DJ BASSLINE', 'All Black',    '/seeds/poster-past-2.jpg', current_date - 7,  '22:00', '05:00', 30000, '지난 이벤트 2', false)
on conflict (id) do update set
  name               = excluded.name,
  dj                 = excluded.dj,
  dress_code         = excluded.dress_code,
  poster_url         = excluded.poster_url,
  event_date         = excluded.event_date,
  start_time         = excluded.start_time,
  end_time           = excluded.end_time,
  entry_fee          = excluded.entry_fee,
  description        = excluded.description,
  notify_subscribers = excluded.notify_subscribers;

-- ────────────────────────────────────────────────────────────
-- 섹션 4: 예약 14개 (전 상태 × 전 인센티브 커버)
--
-- 참고: trg_assign_incentive 가 expected_departure_time 으로
--       incentive_type 을 자동 산정하므로 별도 지정 불필요
--   expected_departure_time < 04:00 → champagne_free
--   04:00 ≤ expected_departure_time < 06:00 → discount_10
--   06:00 ≤ expected_departure_time < 08:00 → discount_5
--   null 또는 08:00 이상 → none
--
-- 참고: trg_set_reservation_number 는 reservation_number 가
--       null 일 때만 동작하므로 명시값은 그대로 유지됨
--
-- 참고: approved_by 는 profiles(id) 참조이므로 null 처리
-- ────────────────────────────────────────────────────────────

insert into public.reservations (
  id, reservation_number,
  user_id, event_id, table_id,
  business_date, visit_date, arrival_slot, visit_time,
  expected_departure_time, expected_departure_date,
  incentive_applied, people_count, status,
  request_note, admin_memo, reject_reason,
  guest_name, guest_phone, guest_instagram,
  approved_at, checked_in_at, checked_out_at
) values

  -- ── 과거 이벤트 ddd11111 (CURRENT_DATE-14) ─────────────────
  -- #01  completed · champagne_free  (03:30 이전 퇴장)
  ('ee000001-0000-0000-0000-ee0000000001', 'PING-2606-001',
   'ccc11111-1111-1111-1111-111111111111', 'ddd11111-1111-1111-1111-111111111111', '3',
   current_date - 14, current_date - 13, 'slot_00', '00:30',
   '03:30', current_date - 13,
   true, 4, 'completed',
   '생일 파티로 방문합니다. 케이크 반입 가능한지 문의드려요.', 'VIP 응대 완료, 샴페인 인센티브 적용', null,
   '김민준', '010-1234-5678', 'minjun_kim',
   now() - interval '14 days 20 hours',
   now() - interval '13 days 23 hours 30 minutes', now() - interval '13 days 20 hours'),

  -- #02  completed · discount_10  (05:00 이전 퇴장)
  ('ee000002-0000-0000-0000-ee0000000002', 'PING-2606-002',
   'ccc22222-2222-2222-2222-222222222222', 'ddd11111-1111-1111-1111-111111111111', '8',
   current_date - 14, current_date - 13, 'slot_02', '02:15',
   '05:00', current_date - 13,
   true, 2, 'completed',
   '2인 방문입니다.', '단골 고객, 10% 할인 적용', null,
   '이서연', '010-2345-6789', 'seoyeon_official',
   now() - interval '14 days 19 hours',
   now() - interval '13 days 21 hours 45 minutes', now() - interval '13 days 19 hours'),

  -- #03  no_show
  ('ee000003-0000-0000-0000-ee0000000003', 'PING-2606-003',
   'ccc33333-3333-3333-3333-333333333333', 'ddd11111-1111-1111-1111-111111111111', '9',
   current_date - 14, current_date - 13, 'slot_00', '00:00',
   null, null,
   false, 3, 'no_show',
   null, '연락 불가, 노쇼 처리', null,
   '박지우', '010-3456-7890', 'jiwoo.park',
   now() - interval '14 days 18 hours',
   null, null),

  -- ── 과거 이벤트 ddd22222 (CURRENT_DATE-7) ──────────────────
  -- #04  completed · discount_5  (07:00 이전 퇴장)
  ('ee000004-0000-0000-0000-ee0000000004', 'PING-2606-004',
   'ccc44444-4444-4444-4444-444444444444', 'ddd22222-2222-2222-2222-222222222222', '1',
   current_date - 7, current_date - 6, 'slot_04', '04:15',
   '07:00', current_date - 6,
   true, 5, 'completed',
   'VIP 테이블 요청드립니다.', '프리미엄 고객, 5% 할인 적용', null,
   '최수아', '010-4567-8901', 'sua_choi',
   now() - interval '7 days 20 hours',
   now() - interval '6 days 19 hours 45 minutes', now() - interval '6 days 17 hours'),

  -- #05  cancelled
  ('ee000005-0000-0000-0000-ee0000000005', 'PING-2606-005',
   'ccc55555-5555-5555-5555-555555555555', 'ddd22222-2222-2222-2222-222222222222', '10',
   current_date - 7, current_date - 6, 'slot_02', '02:00',
   null, null,
   false, 2, 'cancelled',
   null, null, null,
   '정도현', '010-5678-9012', 'dohyun_j',
   null, null, null),

  -- ── 미래 이벤트 aaa11111 (CURRENT_DATE+2) ──────────────────
  -- #06  confirmed · champagne_free  (03:30 이전 퇴장)
  ('ee000006-0000-0000-0000-ee0000000006', 'PING-2606-006',
   'ccc11111-1111-1111-1111-111111111111', 'aaa11111-1111-1111-1111-111111111111', '2',
   current_date + 2, current_date + 3, 'slot_00', '00:30',
   '03:30', current_date + 3,
   false, 4, 'confirmed',
   '03:30 전 퇴장 예정입니다. 샴페인 인센티브 기대해요!', '인센티브 안내 완료', null,
   '김민준', '010-1234-5678', 'minjun_kim',
   now() - interval '1 hour',
   null, null),

  -- #07  confirmed · discount_10  (05:00 이전 퇴장)
  ('ee000007-0000-0000-0000-ee0000000007', 'PING-2606-007',
   'ccc22222-2222-2222-2222-222222222222', 'aaa11111-1111-1111-1111-111111111111', '4',
   current_date + 2, current_date + 3, 'slot_02', '02:00',
   '05:00', current_date + 3,
   false, 3, 'confirmed',
   '05:00 이전 퇴장 가능합니다.', null, null,
   '이서연', '010-2345-6789', 'seoyeon_official',
   now() - interval '30 minutes',
   null, null),

  -- #08  confirmed · none  (퇴장 시간 미지정, 6인 그룹)
  ('ee000008-0000-0000-0000-ee0000000008', 'PING-2606-008',
   'ccc33333-3333-3333-3333-333333333333', 'aaa11111-1111-1111-1111-111111111111', '5',
   current_date + 2, current_date + 3, 'slot_04', '04:00',
   null, null,
   false, 6, 'confirmed',
   '6명 방문 예정입니다.', '대형 그룹, 좌석 배치 확인 완료', null,
   '박지우', '010-3456-7890', 'jiwoo.park',
   now() - interval '2 hours',
   null, null),

  -- #09  pending · discount_5  (07:00 이전 퇴장)
  ('ee000009-0000-0000-0000-ee0000000009', 'PING-2606-009',
   'ccc44444-4444-4444-4444-444444444444', 'aaa11111-1111-1111-1111-111111111111', '11',
   current_date + 2, current_date + 3, 'slot_00', '00:00',
   '07:00', current_date + 3,
   false, 2, 'pending',
   '07:00 이전 퇴장 가능합니다. 첫 방문입니다.', null, null,
   '최수아', '010-4567-8901', 'sua_choi',
   null, null, null),

  -- #10  pending · none
  ('ee00000a-0000-0000-0000-ee000000000a', 'PING-2606-010',
   'ccc55555-5555-5555-5555-555555555555', 'aaa11111-1111-1111-1111-111111111111', '12',
   current_date + 2, current_date + 3, 'slot_02', '02:30',
   null, null,
   false, 4, 'pending',
   null, null, null,
   '정도현', '010-5678-9012', 'dohyun_j',
   null, null, null),

  -- #11  rejected  (정원 초과)
  ('ee00000b-0000-0000-0000-ee000000000b', 'PING-2606-011',
   'ccc11111-1111-1111-1111-111111111111', 'aaa11111-1111-1111-1111-111111111111', '6',
   current_date + 2, current_date + 3, 'slot_00', '00:00',
   null, null,
   false, 8, 'rejected',
   '8명 방문 예정입니다.', null, '해당 테이블 정원 초과로 예약이 불가합니다. (최대 6인)',
   '김민준', '010-1234-5678', 'minjun_kim',
   now() - interval '3 hours',
   null, null),

  -- #12  in_use · champagne_free  (03:30 이전 퇴장, 체크인 완료)
  ('ee00000c-0000-0000-0000-ee000000000c', 'PING-2606-012',
   'ccc22222-2222-2222-2222-222222222222', 'aaa11111-1111-1111-1111-111111111111', '7',
   current_date + 2, current_date + 3, 'slot_00', '00:30',
   '03:30', current_date + 3,
   false, 5, 'in_use',
   '샴페인 인센티브 희망합니다.', '체크인 완료, 03:30 퇴장 예정', null,
   '이서연', '010-2345-6789', 'seoyeon_official',
   now() - interval '4 hours',
   now() - interval '3 hours 30 minutes', null),

  -- #13  in_use · discount_10  (05:00 이전 퇴장, 체크인 완료)
  ('ee00000d-0000-0000-0000-ee000000000d', 'PING-2606-013',
   'ccc33333-3333-3333-3333-333333333333', 'aaa11111-1111-1111-1111-111111111111', '13',
   current_date + 2, current_date + 3, 'slot_02', '02:00',
   '05:00', current_date + 3,
   false, 3, 'in_use',
   null, '체크인 완료', null,
   '박지우', '010-3456-7890', 'jiwoo.park',
   now() - interval '3 hours',
   now() - interval '2 hours 30 minutes', null),

  -- ── 미래 이벤트 aaa33333 (CURRENT_DATE+16) ─────────────────
  -- #14  confirmed · discount_5  (07:00 이전 퇴장, 기념일)
  ('ee00000e-0000-0000-0000-ee000000000e', 'PING-2606-014',
   'ccc44444-4444-4444-4444-444444444444', 'aaa33333-3333-3333-3333-333333333333', '14',
   current_date + 16, current_date + 17, 'slot_04', '04:00',
   '07:00', current_date + 17,
   false, 2, 'confirmed',
   '기념일 방문입니다.', '특별 이벤트 손님', null,
   '최수아', '010-4567-8901', 'sua_choi',
   now() - interval '6 hours',
   null, null)

on conflict (id) do nothing;
