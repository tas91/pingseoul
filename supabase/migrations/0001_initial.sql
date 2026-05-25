-- Supabase schema MVP initial migration
-- Scope: core tables, enums, indexes, and lightweight business helpers.

create extension if not exists pgcrypto;

do $$
begin
  create type public.admin_role as enum ('super_admin', 'manager', 'staff');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.reservation_status as enum (
    'pending',
    'confirmed',
    'rejected',
    'cancelled',
    'in_use',
    'completed',
    'no_show'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.time_slot as enum ('slot_00', 'slot_02', 'slot_04', 'slot_06');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.departure_incentive as enum (
    'champagne_free',
    'discount_10',
    'discount_5',
    'none'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  social_provider varchar(20) not null,
  name varchar(100) not null,
  phone varchar(20),
  email varchar(255),
  birth_date date,
  marketing_consent boolean not null default false,
  total_visits int not null default 0,
  no_show_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  name varchar(100) not null,
  email varchar(255) not null unique,
  role public.admin_role not null default 'staff',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tables (
  id varchar(10) primary key,
  type varchar(20) not null,
  position_x int not null,
  position_y int not null,
  capacity int not null,
  min_bottles int not null default 1,
  is_active boolean not null default true,
  display_order int
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  dj varchar(255) not null,
  dress_code varchar(100) not null,
  poster_url varchar(500) not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  entry_fee int,
  description text,
  notify_subscribers boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_number varchar(20) unique not null,
  user_id uuid not null references public.profiles (id),
  event_id uuid references public.events (id),
  table_id varchar(10) references public.tables (id),
  business_date date not null,
  visit_date date not null,
  arrival_slot public.time_slot not null,
  visit_time time not null,
  expected_departure_time time,
  expected_departure_date date,
  incentive_type public.departure_incentive not null default 'none',
  incentive_applied boolean not null default false,
  people_count int not null check (people_count > 0),
  status public.reservation_status not null default 'pending',
  waitlist_number int,
  request_note text,
  admin_memo text,
  reject_reason varchar(255),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles (id),
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  expires_at timestamptz
);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id),
  business_date date not null,
  arrival_slot public.time_slot not null,
  visit_date date not null,
  queue_number int not null,
  notified_at timestamptz,
  response_deadline timestamptz,
  status varchar(20) not null default 'waiting',
  created_at timestamptz not null default now()
);

create table if not exists public.points (
  user_id uuid primary key references public.profiles (id),
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  amount int not null,
  type varchar(20) not null,
  description varchar(255),
  reservation_id uuid references public.reservations (id),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  channel varchar(20) not null,
  type varchar(50) not null,
  title varchar(255),
  content text,
  status varchar(20) not null default 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category varchar(50) not null,
  question varchar(500) not null,
  answer text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_event_date on public.events (event_date);
create index if not exists idx_reservations_business_date on public.reservations (business_date);
create index if not exists idx_reservations_business_date_slot on public.reservations (business_date, arrival_slot);
create index if not exists idx_reservations_visit_date on public.reservations (visit_date);
create index if not exists idx_reservations_status on public.reservations (status);
create index if not exists idx_reservations_user on public.reservations (user_id);
create index if not exists idx_reservations_table on public.reservations (table_id);
create unique index if not exists idx_waitlist_unique on public.waitlist (business_date, arrival_slot, queue_number);
create index if not exists idx_waitlist_business_date on public.waitlist (business_date);
create index if not exists idx_faqs_category on public.faqs (category);
create index if not exists idx_admins_role on public.admins (role);

create or replace function public.generate_reservation_number()
returns trigger
language plpgsql
as $$
declare
  date_str varchar(8);
  seq_num int;
begin
  date_str := to_char(new.visit_date, 'YYYYMMDD');
  select coalesce(max(cast(split_part(reservation_number, '-', 3) as int)), 0) + 1
    into seq_num
    from public.reservations
   where reservation_number like 'PING-' || date_str || '-%';

  new.reservation_number := 'PING-' || date_str || '-' || lpad(seq_num::text, 3, '0');
  return new;
end;
$$;

create or replace function public.calculate_business_date(arrival_date date, slot public.time_slot)
returns date
language plpgsql
as $$
begin
  return arrival_date;
end;
$$;

create or replace function public.slot_to_time(slot public.time_slot)
returns time
language plpgsql
as $$
begin
  return case slot
    when 'slot_00' then '00:00:00'::time
    when 'slot_02' then '02:00:00'::time
    when 'slot_04' then '04:00:00'::time
    when 'slot_06' then '06:00:00'::time
  end;
end;
$$;

create or replace function public.assign_departure_incentive()
returns trigger
language plpgsql
as $$
begin
  if new.expected_departure_time is null then
    new.incentive_type := 'none';
    return new;
  end if;

  if new.expected_departure_time < '04:00:00'::time then
    new.incentive_type := 'champagne_free';
  elsif new.expected_departure_time < '06:00:00'::time then
    new.incentive_type := 'discount_10';
  elsif new.expected_departure_time < '08:00:00'::time then
    new.incentive_type := 'discount_5';
  else
    new.incentive_type := 'none';
  end if;

  return new;
end;
$$;

create or replace function public.set_business_date()
returns trigger
language plpgsql
as $$
begin
  if new.business_date is null then
    new.business_date := public.calculate_business_date(new.visit_date, new.arrival_slot);
  end if;

  if new.visit_time is null then
    new.visit_time := public.slot_to_time(new.arrival_slot);
  end if;

  return new;
end;
$$;

create trigger trg_set_reservation_number
before insert on public.reservations
for each row
when (new.reservation_number is null)
execute function public.generate_reservation_number();

create trigger trg_assign_incentive
before insert or update of expected_departure_time on public.reservations
for each row
execute function public.assign_departure_incentive();

create trigger trg_set_business_date
before insert on public.reservations
for each row
execute function public.set_business_date();
