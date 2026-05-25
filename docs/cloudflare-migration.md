# Sjoh Cloudflare Pages Migration

Goal: move the public Sjoh frontend off Lovable hosting while keeping the existing production Supabase backend.

## Target Setup

- Frontend host: Cloudflare Pages
- Production domain: `sjoh.co.za`
- Cloudflare account: `sjohforwarding@gmail.com`
- Cloudflare account ID: `7356313895a62a1f442cb17b7e4483bb`
- Pages project: `sjoh`
- Pages default domain: `https://sjoh.pages.dev/`
- First deployment preview: `https://103d886f.sjoh.pages.dev/`
- Backend/auth/storage/functions: Supabase project `omhjcalrfhswjmanriqv`
- Build command: `npm ci && npm run build`
- Build output directory: `dist`
- Node version: use Cloudflare default unless build fails; then set Node 20.

## Required Cloudflare Pages Environment Variables

Add these in Cloudflare Pages project settings before the production deploy:

```text
VITE_SUPABASE_PROJECT_ID=omhjcalrfhswjmanriqv
VITE_SUPABASE_URL=https://omhjcalrfhswjmanriqv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<copy from local .env or Supabase API settings>
```

Optional:

```text
VITE_ONESIGNAL_APP_ID=<only if push notifications are enabled for launch>
```

Do not add Supabase service-role keys, PayFast secrets, OpenAI keys, or other server secrets to Cloudflare Pages. Those stay in Supabase Edge Function secrets.

## Cloudflare Pages Settings

Recommended settings:

- Project name: `sjoh`
- Production branch: `main`
- Framework preset: Vite
- Build command: `npm ci && npm run build`
- Output directory: `dist`

CLI deploy after `wrangler login`:

```bash
npm run deploy:cloudflare
```

This repo includes:

- `public/_redirects` so direct visits to React routes like `/for-businesses/trades` load correctly.
- `public/_headers` with conservative browser security and cache headers.
- `wrangler.toml` so the same output directory is known to the Cloudflare CLI.

## DNS Cutover

Completed after the successful Cloudflare preview deploy:

1. Added `sjoh.co.za` to Cloudflare.
2. Switched nameservers from GoDaddy/domaincontrol to Cloudflare.
3. Confirmed `https://sjoh.co.za` and `https://www.sjoh.co.za` return HTTP 200.
4. Ran:

```bash
SITE_URL=https://sjoh.co.za npm run check:production
```

5. Smoke-test:
   - `/`
   - `/for-businesses`
   - `/for-businesses/trades`
   - `/pricing`
   - `/requests`
   - `/directory`
   - `/sitemap.xml`

Status: Cloudflare Pages is now serving the production domain. Keep Lovable available as a rollback fallback until the Cloudflare deploy has been stable for 24-48 hours, payment smoke tests are complete, and Resend transactional email is verified in production.

Current Lovable dependencies to clear before cancellation:

- Transactional email was moved locally to a Resend-backed Supabase queue processor, but still needs Resend DNS/secrets, function deploy, and production quote/invoice email smoke tests.
- Social login is paused for launch. Email/password auth remains live, removing Lovable Cloud Auth from the launch-critical path.
- WhatsApp lead alerts are paused for launch. The public business profile can still expose a customer-facing WhatsApp contact link.

## Rollback Plan

If the Cloudflare deploy has a launch-blocking issue, point DNS back to the Lovable records and keep debugging Cloudflare on its preview URL. The app backend remains Supabase, so the rollback is a DNS/hosting rollback rather than a database rollback.

## After Cutover

- Update `docs/launch-readiness.md` and `docs/launch-board.md`.
- Run a full customer journey smoke test.
- Run a full business signup, trial, billing, ID check, quote, and invoice smoke test.
- Confirm PayFast ITN still points to Supabase:
  `https://omhjcalrfhswjmanriqv.supabase.co/functions/v1/payfast-webhook`
