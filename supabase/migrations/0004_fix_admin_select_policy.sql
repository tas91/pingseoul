-- Restrict admins table SELECT to own record only
drop policy if exists "Admins can view admin records" on public.admins;

create policy "Admins can view own record"
  on public.admins for select
  using (auth.uid() = id);
