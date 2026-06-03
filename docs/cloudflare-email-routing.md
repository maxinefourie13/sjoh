# Cloudflare Email Routing

Launch target: forward `hello@sjoh.co.za` to `sjohforwarding@gmail.com`.

## Current Status

- Cloudflare Email Routing is enabled for `sjoh.co.za`.
- Route: `hello@sjoh.co.za` -> `sjohforwarding@gmail.com`.
- Destination address `sjohforwarding@gmail.com` is verified in Cloudflare.
- Old GoDaddy/SecureServer MX records were removed.
- Public DNS now resolves Cloudflare Email Routing records:
  - MX: `route1.mx.cloudflare.net`, `route2.mx.cloudflare.net`, `route3.mx.cloudflare.net`
  - SPF: `v=spf1 include:_spf.mx.cloudflare.net ~all`
  - DKIM selector: `cf2024-1._domainkey.sjoh.co.za`
- A launch test email was queued through the production Supabase transactional email function on 2026-06-02.
- Cloudflare Activity Log shows an authenticated external test from `maxinefourie13@gmail.com` to `hello@sjoh.co.za` as `Forwarded` on 2026-06-02.
- Gmail receipt was confirmed in `sjohforwarding@gmail.com` on 2026-06-02. The first test landed in Spam, then was recovered by searching `in:anywhere hello@sjoh.co.za newer_than:1d`.

## Setup Steps Completed

1. Opened Cloudflare Dashboard.
2. Selected the `sjoh.co.za` zone.
3. Went to Email > Email Routing.
4. Enabled Email Routing.
5. Added destination address: `sjohforwarding@gmail.com`.
6. Confirmed the destination is verified.
7. Added custom address:
   - Address: `hello@sjoh.co.za`
   - Destination: `sjohforwarding@gmail.com`
8. Let Cloudflare apply its required MX records.
9. Removed conflicting GoDaddy/SecureServer MX and SPF records:
   - `smtp.secureserver.net`
   - `mailstore1.secureserver.net`
   - `v=spf1 include:secureserver.net -all`
10. Sent a production queued test email to `hello@sjoh.co.za`.

## Gmail Launch Hygiene

- Add a Gmail filter in `sjohforwarding@gmail.com` for:
  - `to:hello@sjoh.co.za`
- Filter actions:
  - Never send it to Spam.
  - Apply label `Sjoh Support`.
  - Mark as important if desired.
- If a message seems missing, search Gmail with:
  - `to:hello@sjoh.co.za newer_than:1d`
  - `from:maxinefourie13@gmail.com newer_than:1d`
  - `"Sjoh" newer_than:1d`
  - `in:anywhere hello@sjoh.co.za`
- If Cloudflare shows `Forwarded` but Gmail does not show the message, check Spam/Trash and confirm Safari is logged into `sjohforwarding@gmail.com`.

## Optional Launch Aliases

If you want one inbox for everything during launch, add these aliases to the same destination:

- `support@sjoh.co.za` -> `sjohforwarding@gmail.com`
- `privacy@sjoh.co.za` -> `sjohforwarding@gmail.com`
- `legal@sjoh.co.za` -> `sjohforwarding@gmail.com`

Do not enable a catch-all unless spam is under control. A catch-all is convenient, but it attracts junk fast.

## Verify From Terminal

```bash
dig +short MX sjoh.co.za
dig +short TXT sjoh.co.za
```

Expected outcome after setup:

- MX records no longer point to `secureserver.net`.
- Cloudflare Email Routing shows `hello@sjoh.co.za` as active.
- A test email to `hello@sjoh.co.za` lands in `sjohforwarding@gmail.com`.

## Sending As hello@sjoh.co.za

Cloudflare Email Routing only receives and forwards email. Sending from Gmail as `hello@sjoh.co.za` is a separate setup:

1. In Gmail, open Settings > Accounts and Import.
2. Add `hello@sjoh.co.za` under "Send mail as".
3. Use the SMTP provider for the mailbox if available, or keep outgoing launch replies from `sjohforwarding@gmail.com` with a clear Sjoh signature until proper SMTP is configured.

Transactional product email remains handled by Resend/Supabase and is separate from support inbox forwarding.
