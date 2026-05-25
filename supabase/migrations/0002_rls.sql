-- RLS policies for public read access on events and faqs

alter table public.events enable row level security;
create policy "Public events are viewable by everyone"
  on public.events for select using (true);

alter table public.faqs enable row level security;
create policy "Public faqs are viewable by everyone"
  on public.faqs for select using (true);
