-- Admin RLS policies
-- Enables row-level security on all MVP tables and enforces:
--   - Active admins can read/write everything
--   - Regular users can only access their own data
--   - Public read on events, tables, faqs

-- Helper: returns true if the current user is an active admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admins
    where id = auth.uid()
    and is_active = true
  );
$$;

-- ───────────────────────────────────────────────
-- profiles
-- ───────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ───────────────────────────────────────────────
-- admins
-- ───────────────────────────────────────────────
alter table public.admins enable row level security;

create policy "Admins can view admin records"
  on public.admins for select
  using (auth.uid() = id or public.is_admin());

-- ───────────────────────────────────────────────
-- events (extends 0002_rls.sql public SELECT policy)
-- ───────────────────────────────────────────────
create policy "Admins can insert events"
  on public.events for insert
  with check (public.is_admin());

create policy "Admins can update events"
  on public.events for update
  using (public.is_admin());

create policy "Admins can delete events"
  on public.events for delete
  using (public.is_admin());

-- ───────────────────────────────────────────────
-- tables
-- ───────────────────────────────────────────────
alter table public.tables enable row level security;

create policy "Tables are viewable by everyone"
  on public.tables for select
  using (true);

create policy "Admins can insert tables"
  on public.tables for insert
  with check (public.is_admin());

create policy "Admins can update tables"
  on public.tables for update
  using (public.is_admin());

create policy "Admins can delete tables"
  on public.tables for delete
  using (public.is_admin());

-- ───────────────────────────────────────────────
-- reservations
-- ───────────────────────────────────────────────
alter table public.reservations enable row level security;

create policy "Users can view own reservations"
  on public.reservations for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own reservations"
  on public.reservations for insert
  with check (auth.uid() = user_id);

create policy "Admins can update reservations"
  on public.reservations for update
  using (public.is_admin());

create policy "Admins can delete reservations"
  on public.reservations for delete
  using (public.is_admin());

-- ───────────────────────────────────────────────
-- waitlist
-- ───────────────────────────────────────────────
alter table public.waitlist enable row level security;

create policy "Users can view own waitlist entries"
  on public.waitlist for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.reservations r
      where r.id = waitlist.reservation_id
      and r.user_id = auth.uid()
    )
  );

create policy "Users can insert own waitlist entries"
  on public.waitlist for insert
  with check (
    exists (
      select 1 from public.reservations r
      where r.id = reservation_id
      and r.user_id = auth.uid()
    )
  );

create policy "Admins can update waitlist"
  on public.waitlist for update
  using (public.is_admin());

create policy "Admins can delete waitlist"
  on public.waitlist for delete
  using (public.is_admin());

-- ───────────────────────────────────────────────
-- points
-- ───────────────────────────────────────────────
alter table public.points enable row level security;

create policy "Users can view own points"
  on public.points for select
  using (auth.uid() = user_id or public.is_admin());

-- ───────────────────────────────────────────────
-- point_transactions
-- ───────────────────────────────────────────────
alter table public.point_transactions enable row level security;

create policy "Users can view own point transactions"
  on public.point_transactions for select
  using (auth.uid() = user_id or public.is_admin());

-- ───────────────────────────────────────────────
-- notifications
-- ───────────────────────────────────────────────
alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());

-- ───────────────────────────────────────────────
-- faqs (extends 0002_rls.sql public SELECT policy)
-- ───────────────────────────────────────────────
create policy "Admins can insert faqs"
  on public.faqs for insert
  with check (public.is_admin());

create policy "Admins can update faqs"
  on public.faqs for update
  using (public.is_admin());

create policy "Admins can delete faqs"
  on public.faqs for delete
  using (public.is_admin());
