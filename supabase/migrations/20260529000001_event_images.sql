alter table public.events
  add column if not exists images text[] not null default '{}';
