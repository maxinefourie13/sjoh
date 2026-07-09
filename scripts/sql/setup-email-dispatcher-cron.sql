-- Sjoh: (re)install the transactional-email dispatcher cron job.
--
-- Why this file exists: the original email infra migration
-- (20260429203647_email_infra.sql) documents that the pg_cron job and the
-- vault secret it depends on were applied via the Management API, outside
-- version control. If the Supabase project is recreated or that step is
-- skipped, emails enqueue forever and never send. This script makes the
-- setup repeatable from the SQL Editor.
--
-- BEFORE RUNNING: replace REPLACE_WITH_SERVICE_ROLE_KEY below with the
-- project's service_role key (Dashboard > Project Settings > API). Run the
-- whole file once in the SQL Editor. Do not commit the real key anywhere.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1. Upsert the vault secret the cron job reads at runtime.
do $$
declare
  _key text := 'REPLACE_WITH_SERVICE_ROLE_KEY';
  _existing uuid;
begin
  if _key = 'REPLACE_WITH_' || 'SERVICE_ROLE_KEY' then
    raise exception 'Edit this file first: paste the service_role key in place of the placeholder.';
  end if;

  select id into _existing from vault.secrets where name = 'email_queue_service_role_key';
  if _existing is null then
    perform vault.create_secret(_key, 'email_queue_service_role_key');
  else
    perform vault.update_secret(_existing, _key);
  end if;
end $$;

-- 2. (Re)schedule the dispatcher. Runs every 10 seconds, but only calls the
--    edge function when there is work to do and no rate-limit cooldown.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'process-email-queue') then
    perform cron.unschedule('process-email-queue');
  end if;
end $$;

select cron.schedule(
  'process-email-queue',
  '10 seconds',
  $$
  select net.http_post(
    url := 'https://omhjcalrfhswjmanriqv.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'email_queue_service_role_key'
      )
    ),
    body := '{}'::jsonb
  ) as request_id
  where (
      exists (select 1 from pgmq.q_auth_emails limit 1)
      or exists (select 1 from pgmq.q_transactional_emails limit 1)
    )
    and not exists (
      select 1 from public.email_send_state
      where id = 1
        and retry_after_until is not null
        and retry_after_until > now()
    );
  $$
);

-- 3. Confirm
select jobid, jobname, schedule, active from cron.job where jobname = 'process-email-queue';
