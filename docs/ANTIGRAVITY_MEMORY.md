# Sjoh Antigravity Memory File

Last updated: 2026-05-22

Use this as Antigravity's long-term memory for the Sjoh launch. It is deliberately explicit so agents can continue work without needing the full Codex chat.

## One-Line Product

Sjoh is a South African marketplace where customers find reliable local service pros, and businesses get found, quote professionally, invoice cleanly, and keep 100% of the job value.

## Correct Technical Stack

Sjoh is not Laravel.

- Frontend: Vite + React + TypeScript
- Styling: Tailwind + shadcn/ui patterns
- Backend: Supabase Auth, Postgres, Storage, Edge Functions
- Payments: PayFast
- Hosting migration target: Cloudflare Pages
- Current repo: `https://github.com/maxinefourie13/sjoh`
- Local path used by Codex: `/Users/maxin/Downloads/sjoh`

## Brand And Product Direction

- Brand name: `Sjoh!`
- Visual direction: dark, modern, South African, photo-led, playful but trustworthy.
- Logo direction: white Sjoh wordmark with animated/cycling exclamation accent.
- Palette: red, navy, green, gold, periwinkle, pink, dark charcoal/black.
- Tone: local, practical, confidence-building. Avoid corporate blandness.
- Customer promise: find the right pro fast, compare reviews, get it sorted.
- Business promise: be visible online, look professional, get local opportunities, keep the full quote.

## Current Launch Positioning

- Founding/early-access stage.
- Marketplace may look quiet while pros are being onboarded.
- Businesses get a one-use 30-day Verified Pro trial with code `SORTED30`.
- After trial, Verified Pro is R250/month.
- Founding/business copy should focus on:
  - visibility
  - professional credibility
  - no tech admin
  - direct local opportunities
  - 0% commission as an important bonus, not always the first hook

## Critical Product Decisions Already Made

- Do not use Smile ID anymore.
- Do not use Paystack anymore.
- PayFast is the launch payment provider.
- Supabase remains the backend.
- Cloudflare Pages is the target frontend host.
- Keep Lovable only as a fallback until DNS cutover is verified.
- `SORTED30` is the free-trial code and must remain 30 days, redeemable once per user.
- Businesses should be able to keep setting up their profile while ID verification is pending.
- Verification pending should block applying for jobs where required, not block the entire app.

## Current Infrastructure Details

- Supabase project ID: `omhjcalrfhswjmanriqv`
- Supabase URL: `https://omhjcalrfhswjmanriqv.supabase.co`
- Cloudflare account email: `sjohforwarding@gmail.com`
- Cloudflare account ID: `7356313895a62a1f442cb17b7e4483bb`
- Cloudflare Pages project: `sjoh`
- Cloudflare default domain: `https://sjoh.pages.dev/`
- First Cloudflare preview deployment: `https://103d886f.sjoh.pages.dev/`
- Production domain: `https://sjoh.co.za`
- Current production DNS before cutover:
  - nameservers: `ns15.domaincontrol.com`, `ns16.domaincontrol.com`
  - apex A record observed: `185.158.133.1`
  - likely still pointing at the old Lovable hosting path

## Secret Handling Rules

Never commit or paste:

- Supabase service-role key
- Supabase database password or full connection string with password
- PayFast merchant key/passphrase
- OpenAI key
- email provider keys
- Cloudflare API tokens

Cloudflare Pages should only get public frontend build variables:

```text
VITE_SUPABASE_PROJECT_ID=omhjcalrfhswjmanriqv
VITE_SUPABASE_URL=https://omhjcalrfhswjmanriqv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<from Supabase API settings or local .env>
```

Server secrets belong in Supabase Edge Function secrets.

## What Codex Already Completed

- Prepared Cloudflare Pages migration files:
  - `wrangler.toml`
  - `public/_redirects`
  - `public/_headers`
- Added `npm run deploy:cloudflare`.
- Created the Cloudflare Pages project `sjoh`.
- Deployed a working Cloudflare Pages preview.
- Verified preview routes return `200`:
  - `/`
  - `/for-businesses`
  - `/for-businesses/trades`
  - `/pricing`
  - `/login`
  - `/sitemap.xml`
  - `/acceptable-use`
  - `/shipping`
  - `/returns`
- Added Antigravity handoff kit:
  - `docs/ANTIGRAVITY_HANDOFF.md`
  - `docs/agent-prompt-bank.md`
  - `scripts/setup-antigravity.sh`
  - `antigravity.config.template.json`
  - `.env.antigravity.template`
- Latest pushed agent-handoff commit: `9b33ba6 Add Antigravity handoff kit`

## Current Migration State

The Cloudflare preview works. The production domain is not cut over yet.

Remaining hosting task:

1. Add `sjoh.co.za` as a custom domain to the Cloudflare Pages project `sjoh`.
2. Follow Cloudflare's DNS instructions.
3. Because `sjoh.co.za` is on GoDaddy/domaincontrol nameservers, the likely clean path is either:
   - move DNS/nameservers to Cloudflare, then let Cloudflare manage the apex domain; or
   - use the DNS records Cloudflare Pages gives for the custom domain if GoDaddy supports the required record shape.
4. Keep Lovable live until `https://sjoh.co.za` works on Cloudflare.
5. After cutover, run:

```bash
SITE_URL=https://sjoh.co.za npm run check:production
```

## Known Cloudflare Issue

Wrangler deploy succeeded earlier, but a later redeploy attempt hit a Cloudflare API error after upload:

```text
A request to the Cloudflare API ... /pages/projects/sjoh/deployments failed.
unknown error / 503 / code 8000000
```

This looked like a Cloudflare API/transient account-side issue, not an app build problem. Existing preview routes still responded with `200`.

## Current Launch Blockers

1. Custom domain/DNS cutover from old hosting to Cloudflare Pages.
2. PayFast live account approval and live ITN/dashboard verification.
3. Full live smoke test after DNS cutover:
   - customer search/post-job flow
   - business signup/profile/verification/trial/payment flow
   - quote/invoice email/download flow
4. Support channel confirmation.

## Important Files

- `AGENTS.md`: repo-level agent instructions.
- `docs/launch-board.md`: launch status board.
- `docs/launch-readiness.md`: readiness checklist.
- `docs/cloudflare-migration.md`: Cloudflare migration guide.
- `docs/secure-account-handover.md`: account handover template.
- `docs/ANTIGRAVITY_HANDOFF.md`: Antigravity instructions.
- `docs/agent-prompt-bank.md`: reusable prompts.
- `scripts/setup-antigravity.sh`: local Antigravity setup helper.
- `scripts/check-production-launch.ts`: production smoke test.
- `src/pages/Index.tsx`: homepage.
- `src/pages/BusinessLanding.tsx`: business landing page.
- `src/pages/AvatarLanding.tsx`: segmented landing pages.
- `src/pages/Pricing.tsx`: pricing.
- `src/pages/Dashboard.tsx`: business dashboard.
- `src/components/SiteHeader.tsx`: global header.
- `src/components/SjohWordmark.tsx`: logo.
- `src/components/TrialCodeRedeemer.tsx`: trial code redemption.
- `src/lib/payments.ts`: payment helpers.
- `supabase/functions/payfast-checkout`: PayFast checkout.
- `supabase/functions/payfast-webhook`: PayFast webhook/ITN.
- `supabase/functions/verify-sa-id`: ID verification.

## Verification Commands

Use these from the repo root:

```bash
npm run lint
npm test
npm run build
SITE_URL=https://sjoh.co.za npm run check:production
```

Cloudflare preview route sanity check:

```bash
node - <<'NODE'
const base = 'https://103d886f.sjoh.pages.dev';
for (const path of ['/', '/for-businesses', '/for-businesses/trades', '/pricing', '/login', '/sitemap.xml', '/acceptable-use', '/shipping', '/returns']) {
  const res = await fetch(base + path);
  console.log(`${res.status} ${path} ${res.headers.get('content-type')}`);
}
NODE
```

## How Antigravity Should Work

Preferred first prompt:

```text
/goal Read AGENTS.md, docs/ANTIGRAVITY_MEMORY.md, docs/ANTIGRAVITY_HANDOFF.md, docs/launch-board.md, docs/launch-readiness.md, and docs/cloudflare-migration.md. Do not make code changes yet. Summarize the exact remaining launch blockers and propose the smallest safe next action.
```

Antigravity agents should:

- work in small scoped changes
- list changed files
- run verification commands
- avoid broad rewrites
- not touch live DNS/payment/secrets without Maxine
- not commit secrets

## How Hermes Should Work

Hermes is not for app code or Cloudflare migration. Use Hermes only for:

- South African lead sourcing
- public-source prospect research
- POPIA-aware outreach hygiene
- customer/business prospect list drafts

Hermes must preserve source URLs, checked dates, and uncertainty notes. Public contact details are evidence, not consent.

## If Codex Needs To Resume

Start with:

```bash
cd /Users/maxin/Downloads/sjoh
git status --short
git log --oneline -8
npm run build
```

Then check:

```bash
npx wrangler pages project list
npx wrangler pages deployment list --project-name sjoh
nslookup -type=NS sjoh.co.za
nslookup sjoh.co.za
```

Do not assume Cloudflare has the custom domain until the dashboard or DNS confirms it.
