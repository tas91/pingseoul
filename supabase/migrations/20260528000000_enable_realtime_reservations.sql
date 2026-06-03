-- reservations 테이블 Supabase Realtime 활성화
-- 이 마이그레이션 실행 후 Supabase 대시보드에서도 확인 가능:
-- Database > Replication > reservations 테이블 토글

-- UPDATE 이벤트에서 변경 전후 데이터를 모두 수신하기 위해 FULL 설정
alter table public.reservations replica identity full;

-- supabase_realtime publication에 reservations 테이블 추가
-- 이미 등록된 경우 오류 없이 진행됨
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reservations'
  ) then
    alter publication supabase_realtime add table public.reservations;
  end if;
end $$;
