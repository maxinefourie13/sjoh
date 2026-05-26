# Sjoh Email Provider Migration

Goal: move transactional email off Lovable while keeping the existing Supabase queue, templates, logging, retries, and unsubscribe flow.

## Current Decision

- Provider target: Resend.
- Queue and templates stay in Supabase.
- `send-transactional-email` renders and enqueues email payloads.
- `process-email-queue` sends queued emails through Resend.
- `handle-email-unsubscribe` remains the unsubscribe endpoint.
- `handle-email-suppression` is now provider-generic and protected by an HMAC signature.

## Required Supabase Secrets

Set these in Supabase Edge Function secrets:

```text
RESEND_API_KEY=<from Resend>
EMAIL_FROM="Sjoh <hello@sjoh.co.za>"
EMAIL_SENDER_DOMAIN=sjoh.co.za
EMAIL_REPLY_TO=hello@sjoh.co.za
EMAIL_PREVIEW_API_KEY=<random long secret, optional>
EMAIL_SUPPRESSION_WEBHOOK_SECRET=<random long secret, optional until webhook is connected>
```

Keep these server-side only. Do not put them in Cloudflare Pages public environment variables.

Check required secret names without printing values:

```bash
npm run check:supabase-secrets
```

The command should pass before the Resend-backed email functions are treated as launch-ready.

## Required DNS

Verify `sjoh.co.za` in Resend and add the DNS records Resend gives you in Cloudflare DNS. Usually this includes SPF, DKIM, and DMARC-related records. Wait for Resend to show the domain as verified before sending production email from `hello@sjoh.co.za`.

## Deployment Steps

1. Configure Resend domain DNS in Cloudflare.
2. Add `RESEND_API_KEY` and email env values to Supabase secrets.
3. Deploy these Supabase functions:
   - `send-transactional-email`
   - `process-email-queue`
   - `preview-transactional-email`
   - `handle-email-suppression`
4. Trigger one quote email and one invoice email on production.
5. Confirm:
   - emails arrive from the Sjoh sender,
   - `email_send_log.status = 'sent'`,
   - invoice download links still work,
   - unsubscribe links do not error.

## Lovable Cancellation Gate

Do not cancel Lovable until:

- Cloudflare production hosting is stable.
- PayFast live checkout and ITN are smoke-tested.
- Resend transactional email is verified on production.
- Social login is paused or moved away from Lovable Cloud Auth.
- WhatsApp lead alerts are paused or moved away from the Lovable/Twilio connector.
