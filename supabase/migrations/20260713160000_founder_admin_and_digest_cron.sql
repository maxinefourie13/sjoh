-- Founder admin auto-grant + daily digest cron.
-- Applied directly to production on launch day; captured here so the repo
-- matches the live database.

-- 1. Auto-grant the 'admin' role to the founder account by email — now and
--    on any future signup with that address.
create or replace function public.grant_founder_admin()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if lower(new.email) = 'maxinefourie13@gmail.com'
     and not exists (select 1 from public.user_roles where user_id = new.id and role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_grant_founder_admin on auth.users;
create trigger trg_grant_founder_admin
  after insert on auth.users
  for each row execute function public.grant_founder_admin();

insert into public.user_roles (user_id, role)
select u.id, 'admin' from auth.users u
where lower(u.email) = 'maxinefourie13@gmail.com'
  and not exists (select 1 from public.user_roles r where r.user_id = u.id and r.role = 'admin');

-- 2. Daily founder digest email at 18:00 UTC (20:00 SAST). Calls the
--    founder-daily-digest edge function using the vault-stored service key.
do $$ begin
  if exists (select 1 from cron.job where jobname = 'founder-daily-digest') then
    perform cron.unschedule('founder-daily-digest');
  end if;
end $$;

select cron.schedule(
  'founder-daily-digest',
  '0 18 * * *',
  $job$
  select net.http_post(
    url := 'https://omhjcalrfhswjmanriqv.supabase.co/functions/v1/founder-daily-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'email_queue_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $job$
);
