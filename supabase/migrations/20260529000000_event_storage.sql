-- Create event-posters storage bucket
insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do nothing;

-- Public read
create policy "Public read for event posters"
  on storage.objects for select
  using (bucket_id = 'event-posters');

-- Admin write
create policy "Admins can upload event posters"
  on storage.objects for insert
  with check (
    bucket_id = 'event-posters' and
    exists (
      select 1 from public.admin_profiles
      where id = auth.uid() and is_active = true
    )
  );

create policy "Admins can update event posters"
  on storage.objects for update
  using (
    bucket_id = 'event-posters' and
    exists (
      select 1 from public.admin_profiles
      where id = auth.uid() and is_active = true
    )
  );

create policy "Admins can delete event posters"
  on storage.objects for delete
  using (
    bucket_id = 'event-posters' and
    exists (
      select 1 from public.admin_profiles
      where id = auth.uid() and is_active = true
    )
  );
