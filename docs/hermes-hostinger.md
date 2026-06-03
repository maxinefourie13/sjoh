# Hermes On Hostinger

Hermes v1 is a cheap always-on worker. It does not use Kimi or any paid AI model by default.

## What Runs Where

- Codex: plans campaigns, reviews findings, and decides what gets imported.
- Supabase: stores campaigns, queued tasks, findings, and review status.
- Hostinger VPS: runs the `workers/hermes` Node worker 24/7.

## What Hermes v1 Can Do

- Check whether a source URL is still reachable.
- Scan a seed/source page for possible emails, phone numbers, page title, and useful links.
- Validate lead rows before import.
- Classify launch support messages into spam, support buckets, priority, and escalation owner.
- Write findings back to Supabase for human review.

Hermes v1 does not automatically send outreach, send support replies, approve a lead for marketing, promise refunds, change billing, approve ID checks, or handle legal/privacy requests. Public contact info is not consent.

## Setup Steps

1. Apply the Supabase migration:

```bash
supabase db push
```

2. On Hostinger, use a VPS that can run Docker. Hostinger's Docker VPS template is the simplest path.

3. Copy the repo to the VPS and create the worker env file:

```bash
cd /path/to/sjoh/workers/hermes
cp .env.example .env
```

4. Fill in `.env`:

```text
SUPABASE_URL=https://omhjcalrfhswjmanriqv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
HERMES_WORKER_ID=hostinger-hermes-1
HERMES_POLL_INTERVAL_MS=15000
HERMES_FETCH_TIMEOUT_MS=15000
```

Keep the service role key private. Do not put it in frontend env vars or commit it.

5. Start Hermes:

```bash
docker compose up -d --build
```

6. Watch logs:

```bash
docker compose logs -f hermes-worker
```

## Adding A Test Task

Insert a task in Supabase SQL editor:

```sql
insert into public.hermes_campaigns (name, goal, status)
values ('Hermes smoke test', 'Check that the Hostinger worker can process tasks', 'active');

insert into public.hermes_tasks (campaign_id, task_type, payload)
select id, 'source_url_check', jsonb_build_object(
  'source_url', 'https://sjoh.co.za',
  'source_name', 'Sjoh website'
)
from public.hermes_campaigns
where name = 'Hermes smoke test'
order by created_at desc
limit 1;
```

The worker should claim the task, mark it completed, and create a `source_check` finding.

## Task Types

`source_url_check`

```json
{
  "source_url": "https://example.com",
  "source_name": "Example source"
}
```

`seed_page_scan`

```json
{
  "source_url": "https://example.com/directory-page",
  "source_name": "Example directory"
}
```

`lead_row_validate`

```json
{
  "row": {
    "lead_id": "MEY-001-example",
    "business_name": "Example Business",
    "category": "Plumbing",
    "location_fit": "Meyerton based",
    "city_area": "Meyerton",
    "province": "Gauteng",
    "country": "South Africa",
    "source_name": "Example website",
    "source_url": "https://example.com",
    "source_checked_date": "2026-05-19",
    "contact_type": "no_email_found",
    "popia_consent_status": "not_contacted_consent_required",
    "email_marketing_allowed_now": "No",
    "allowed_next_step": "Verify details before outreach."
  }
}
```

`support_message_triage`

```json
{
  "message": {
    "channel": "email",
    "from": "customer@example.co.za",
    "subject": "I paid but my account is still locked",
    "body": "PayFast charged me R250 but Sjoh still asks me to choose a plan.",
    "received_at": "2026-06-03T08:10:00+02:00",
    "attachments": []
  }
}
```

For the support operating rules, see `docs/hermes-support.md`.

## Cheap Operating Rule

Start with seed URLs and QA tasks. Add paid discovery sources only after the process proves useful.
