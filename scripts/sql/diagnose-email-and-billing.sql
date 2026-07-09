-- Sjoh production diagnostics: email pipeline + billing schedulers.
-- Read-only. Paste into the Supabase SQL Editor for project omhjcalrfhswjmanriqv
-- and run as a whole; each section is labelled in the output.

-- 1. Which cron jobs exist? Expect at least:
--    - lifecycle-tick-daily          (from migrations)
--    - process-email-queue           (applied out-of-band; the usual missing piece)
select '1. cron jobs' as section, jobid, jobname, schedule, active
from cron.job
order by jobname;

-- 2. Recent cron run results (errors show up here)
select '2. recent cron runs' as section, j.jobname, d.status, d.return_message, d.start_time
from cron.job_run_details d
join cron.job j on j.jobid = d.jobid
order by d.start_time desc
limit 20;

-- 3. Does the vault secret for the email dispatcher exist? (name only, value stays hidden)
select '3. vault secret' as section, name, created_at
from vault.secrets
where name = 'email_queue_service_role_key';

-- 4. How many emails are sitting unsent in the queues right now?
select '4. queued transactional' as section, count(*) as waiting from pgmq.q_transactional_emails;
select '4. queued auth' as section, count(*) as waiting from pgmq.q_auth_emails;

-- 5. Dead-letter queues (emails that gave up)
select '5. dlq transactional' as section, count(*) as dead from pgmq.q_transactional_emails_dlq;
select '5. dlq auth' as section, count(*) as dead from pgmq.q_auth_emails_dlq;

-- 6. Send log summary for the last 30 days: how many actually went out?
select '6. send log 30d' as section, status, count(*)
from public.email_send_log
where created_at > now() - interval '30 days'
group by status
order by count(*) desc;

-- 7. Last 10 send-log rows with errors, newest first
select '7. recent failures' as section, created_at, template_name, recipient_email, status, error_message
from public.email_send_log
where status in ('failed', 'dlq')
order by created_at desc
limit 10;

-- 8. Rate-limit state (a stuck retry_after_until silently pauses all sending)
select '8. send state' as section, id, retry_after_until, batch_size, send_delay_ms, updated_at
from public.email_send_state;

-- 9. Payment events: has any PayFast ITN ever landed?
select '9. payment events' as section, provider, kind, payfast_payment_status, processed, count(*)
from public.payment_events
group by provider, kind, payfast_payment_status, processed
order by count(*) desc;

-- 10. Most recent payment events with errors
select '10. payment errors' as section, created_at, kind, payfast_payment_status, error_message
from public.payment_events
where error_message is not null
order by created_at desc
limit 10;
