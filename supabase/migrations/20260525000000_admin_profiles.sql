-- admin_profiles 테이블 생성
create table public.admin_profiles (
  id         uuid references auth.users on delete cascade primary key,
  name       text,
  role       text not null default 'admin' check (role in ('super_admin', 'admin')),
  is_active  boolean not null default true,
  invited_by uuid references auth.users,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table public.admin_profiles enable row level security;

-- 본인 프로필 읽기 (미들웨어 및 사이드바 역할 확인에 사용)
create policy "Users can read own profile"
  on public.admin_profiles for select
  using (auth.uid() = id);

-- ────────────────────────────────────────────────────────
-- 최초 슈퍼어드민 계정 설정 방법:
--
-- 1. Supabase Dashboard > Authentication > Users 에서
--    슈퍼어드민 이메일로 사용자를 생성합니다.
--
-- 2. 아래 SQL을 실행합니다 (user_id를 실제 UUID로 교체):
--
--    insert into public.admin_profiles (id, name, role, is_active)
--    values ('여기에-슈퍼어드민-UUID', '관리자 이름', 'super_admin', true);
--
-- 3. Supabase Dashboard > Authentication > URL Configuration 에서
--    Redirect URLs에 다음을 추가합니다:
--    http://localhost:3000/auth/confirm
-- ────────────────────────────────────────────────────────
