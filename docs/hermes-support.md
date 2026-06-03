# Hermes Support Desk

Hermes can be Sjoh's launch support co-pilot. It filters spam, sorts real customer messages, drafts safe replies, and flags product bugs for Codex. Maxine remains the human approver for money, identity, privacy, safety, and angry-user decisions.

## Launch Setup

- Public support address: `hello@sjoh.co.za`.
- Forwarding destination for launch: `sjohforwarding@gmail.com`.
- Privacy/legal escalations: `privacy@sjoh.co.za` and `legal@sjoh.co.za`.
- Optional WhatsApp support: use one number that Maxine can check manually during launch.
- Hermes support mode: triage and draft only. Do not let Hermes send replies automatically until the first launch week is stable.

## Support Flow

1. New message arrives by email, WhatsApp, site form, or manual paste.
2. Hermes classifies it as spam or a real support item.
3. Hermes assigns a bucket, priority, escalation owner, and draft reply.
4. Maxine approves sensitive replies. Codex fixes product bugs.
5. Log the outcome so repeated confusion can become product improvements.

## Buckets

- `spam`: SEO pitches, backlink requests, crypto/loan/casino offers, growth spam, irrelevant agency pitches, suspicious attachments.
- `payment_billing`: PayFast, checkout, R250 subscriptions, refunds, invoices, duplicate charges.
- `identity_privacy`: ID checks, account deletion, POPIA, personal information, privacy requests.
- `login_account`: login, passwords, email verification, locked accounts.
- `quote_job_flow`: customer requests, quotes, proposals, urgent jobs, lead issues.
- `listing_profile`: business profile, categories, service areas, photos, verification profile copy.
- `email_delivery`: missing receipts, notifications, invoice emails, spam folder reports.
- `abuse_safety`: scams, unsafe businesses, harassment, fake listings, fraud reports.
- `sales_partnership`: partnership, investor, press, sponsorship, ads.
- `general_support`: everything else.

## Priority Rules

- `p0`: possible money loss, privacy/legal complaint, leaked ID docs, fraud, failed live payment, deletion request.
- `p1`: launch-blocking user journey issue, account access failure, quote/invoice/send failure, abuse/safety report.
- `p2`: normal how-to support, profile help, quote/job confusion.
- `p3`: feedback, nice-to-have requests, partnerships, general questions.
- `spam`: quarantine or ignore.

## Escalation Rules

- `maxine_now`: payment, refunds, POPIA/privacy, ID document disputes, abuse/safety, angry customer, legal wording.
- `codex_bugfix`: checkout bug, login bug, quote flow bug, email delivery bug, broken page, unclear UX repeated by users.
- `draft_reply`: normal support where Hermes can draft and Maxine can approve.
- `quarantine`: possible spam that might be a real sales/partnership message.
- `ignore`: obvious spam.

## Never Auto-Send

Hermes must not automatically send:

- refund promises
- payment status claims
- ID verification decisions
- account deletion/privacy confirmations
- legal interpretations
- aggressive or emotional replies
- outreach/marketing to businesses

## Local Triage

Create a JSON file with one message or an array of messages:

```json
[
  {
    "id": "email-001",
    "channel": "email",
    "from": "thandi@example.co.za",
    "subject": "I paid but my business is still locked",
    "body": "PayFast charged me R250 but the dashboard says I need a plan.",
    "received_at": "2026-06-03T08:10:00+02:00",
    "attachments": []
  }
]
```

Run:

```bash
npm run hermes:support-triage -- data/support_messages.example.json
```

Output includes:

- `bucket`
- `priority`
- `spam_score`
- `spam_signals`
- `escalation`
- `summary`
- `suggested_reply`

## Hermes Worker Task

Once inbound messages are fed into Supabase, enqueue:

```sql
insert into public.hermes_campaigns (name, goal, status)
values ('Launch support desk', 'Triage Sjoh launch support messages', 'active');

insert into public.hermes_tasks (campaign_id, task_type, priority, payload)
select id, 'support_message_triage', 50, jsonb_build_object(
  'message', jsonb_build_object(
    'channel', 'email',
    'from', 'customer@example.co.za',
    'subject', 'I paid but my account is still locked',
    'body', 'PayFast charged me R250 but Sjoh still asks me to choose a plan.',
    'received_at', now()
  )
)
from public.hermes_campaigns
where name = 'Launch support desk'
order by created_at desc
limit 1;
```

Hermes writes a `support_triage` finding into `public.hermes_findings`.

## Launch Day Rhythm

- Morning: review `p0` and `p1` first.
- Midday: check spam quarantine for false positives.
- Afternoon: ask Codex to fix repeated `codex_bugfix` issues.
- End of day: summarize top five support themes and update copy/product.

## Recommended First Replies

Payment:

```text
Hi, thanks for flagging this. We are checking the payment record and will come back with the exact status before making any billing changes.
```

Privacy or ID:

```text
Hi, thanks for reaching out. We treat identity and privacy requests carefully, so this has been escalated for manual review before we take action.
```

Normal support:

```text
Hi, thanks for reaching out. We have received this and will come back to you shortly.
```
