-- Fix: admins could not see the /admin dashboard.
--
-- user_roles carries a RESTRICTIVE policy ("Only admins can write roles")
-- declared FOR ALL, so it gates SELECT as well as writes. The frontend read
-- roles by selecting user_roles directly, which came back empty (and the
-- error was swallowed), so a genuine admin was treated as a normal user and
-- bounced off /admin.
--
-- Read the caller's own roles through a SECURITY DEFINER function instead,
-- which bypasses RLS safely: it only ever returns roles for auth.uid().

create or replace function public.current_user_roles()
returns setof text
language sql
stable
security definer
set search_path to 'public'
as $$
  select role::text
  from public.user_roles
  where user_id = auth.uid();
$$;

revoke execute on function public.current_user_roles() from public, anon;
grant execute on function public.current_user_roles() to authenticated;
