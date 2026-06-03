-- Update is_admin() to reference admin_profiles instead of the legacy admins table

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid()
    and is_active = true
  );
$$;
