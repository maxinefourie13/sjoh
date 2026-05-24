# Sjoh Secure Account Handover

This document is a secure handover map for Sjoh accounts and deployment details.

Do not store passwords, OTP backup codes, private keys, service-role keys, PayFast secrets, OpenAI keys, or bank details in this file. Store those in a password manager such as iCloud Keychain, 1Password, Bitwarden, or Apple Passwords, and paste only references here.

## GitHub

- Repo: `https://github.com/maxinefourie13/sjoh`
- Production branch: `main`
- Local repo path: `/Users/maxin/Downloads/sjoh`
- Credential location: macOS Keychain / GitHub account
- Password-manager item name:

## Domain

- Domain: `sjoh.co.za`
- Current DNS provider:
  - Cloudflare
  - Nameservers: `chase.ns.cloudflare.com`, `selah.ns.cloudflare.com`
- Registrar account:
- Password-manager item name:
- Notes:

## Cloudflare

- Cloudflare account email: `sjohforwarding@gmail.com`
- Cloudflare dashboard: `https://dash.cloudflare.com/`
- Pages project name: `sjoh`
- Cloudflare account ID: `7356313895a62a1f442cb17b7e4483bb`
- Default Pages URL: `https://sjoh.pages.dev/`
- Current production preview/deployment: `https://68e30a79.sjoh.pages.dev/`
- Production branch: `main`
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Password-manager item name:
- Notes:

## Cloudflare Pages Environment Variables

Public frontend variables only:

```text
VITE_SUPABASE_PROJECT_ID=omhjcalrfhswjmanriqv
VITE_SUPABASE_URL=https://omhjcalrfhswjmanriqv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<stored in password manager or Supabase API settings>
```

Optional:

```text
VITE_ONESIGNAL_APP_ID=<if push notifications are enabled>
```

Never put backend secrets in Cloudflare Pages frontend env vars.

## Supabase

- Supabase dashboard: `https://supabase.com/dashboard/project/omhjcalrfhswjmanriqv`
- Project ref: `omhjcalrfhswjmanriqv`
- Project URL: `https://omhjcalrfhswjmanriqv.supabase.co`
- Database/auth/storage/functions: active production backend
- Password-manager item name:
- Notes:

## Supabase Secrets

These should be managed in Supabase Edge Function secrets, not in frontend hosting:

```text
OPENAI_API_KEY
PAYFAST_MERCHANT_ID
PAYFAST_MERCHANT_KEY
PAYFAST_PASSPHRASE
PUBLIC_SITE_URL=https://sjoh.co.za
GOOGLE_PLACES_API_KEY
LOVABLE_API_KEY
LOVABLE_SEND_URL
ONESIGNAL_APP_ID
ONESIGNAL_REST_API_KEY
TWILIO_API_KEY
TWILIO_WHATSAPP_FROM
```

Use this local helper to update Supabase secrets:

```bash
cd /Users/maxin/Downloads/sjoh
./scripts/set-supabase-secrets.sh
```

## PayFast

- PayFast dashboard: `https://www.payfast.co.za/`
- Payment provider status: active code path, live account still needs final live verification if not already approved.
- ITN / notify URL:
  `https://omhjcalrfhswjmanriqv.supabase.co/functions/v1/payfast-webhook`
- Password-manager item name:
- Notes:

## Email And Notifications

- Support email:
- Privacy email: `privacy@sjoh.co.za`
- Legal email: `legal@sjoh.co.za`
- General email: `hello@sjoh.co.za`
- Transactional email provider:
- WhatsApp/Twilio account:
- OneSignal account:
- Password-manager item names:

## Launch Checks

Run after any hosting migration or DNS change:

```bash
cd /Users/maxin/Downloads/sjoh
SITE_URL=https://sjoh.co.za npm run check:production
```

Important routes:

- `https://sjoh.co.za/`
- `https://sjoh.co.za/for-businesses`
- `https://sjoh.co.za/for-businesses/trades`
- `https://sjoh.co.za/pricing`
- `https://sjoh.co.za/requests`
- `https://sjoh.co.za/directory`
- `https://sjoh.co.za/sitemap.xml`

## Emergency Rollback

- If Cloudflare hosting fails during launch, use Lovable as the rollback fallback until the Cloudflare issue is fixed.
- Do not roll back the Supabase database unless a database migration is confirmed as the cause.
- Keep a note here of the last known-good production commit:
