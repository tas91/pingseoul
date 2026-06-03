-- event-posters storage bucket (public read, admin write via service role)
insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do nothing;
