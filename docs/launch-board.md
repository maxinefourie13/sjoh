# Sjoh End-Of-Week Launch Board

Target launch window: Friday, 22 May 2026

Status key:
- `[DONE]` Ready enough for launch
- `[CHECKING]` Codex is verifying or fixing this
- `[YOU]` Needs Maxine or an external account
- `[BLOCKED]` Cannot launch this part until the blocker clears
- `[LATER]` Valuable, but not needed for first launch

## Launch Must-Haves

| Status | Area | What Good Looks Like | Owner |
| --- | --- | --- | --- |
| `[DONE]` | GitHub repo | Repo renamed to `sjoh`, latest code pushed to `main` | Codex |
| `[DONE]` | Local app health | Lint, build, and unit tests pass | Codex |
| `[DONE]` | Supabase project | New project is linked, migrations are applied, functions are deployed | Codex |
| `[CHECKING]` | Supabase secrets | Live PayFast, OpenAI, email/notification keys are added to Supabase | Maxine + Codex |
| `[DONE]` | Security audit | High-severity npm audit findings are resolved without force-upgrading launch tooling | Codex |
| `[CHECKING]` | PayFast | PayFast live account is verified and live merchant credentials/ITN are configured | Maxine + Codex |
| `[DONE]` | Trial code | `SORTED30` gives a one-time 30-day Verified Pro trial without a card | Codex |
| `[DONE]` | Production deploy | `sjoh.co.za` is live from the latest GitHub `main` Cloudflare Pages build | Codex |
| `[DONE]` | Hosting migration | Frontend hosting is cut over from Lovable to Cloudflare Pages while keeping Supabase Free | Maxine + Codex |
| `[CHECKING]` | Customer journey | Customer can search, post a job, and receive quote/invoice emails through the non-Lovable mail sender | Codex |
| `[CHECKING]` | Business journey | Business can sign up, pay, create profile, verify ID, browse opportunities, quote, and invoice through the non-Lovable mail sender | Codex |
| `[DONE]` | Lovable runtime cleanup | Social login and WhatsApp alerts no longer depend on Lovable runtime connectors for launch | Codex |
| `[DONE]` | Legal/trust copy | Privacy, terms, cancellation, acceptable use, delivery, refund, and ID-check language are present and clear | Codex |
| `[YOU]` | Support channel | Launch users can reach a real support email or WhatsApp when stuck | Maxine |

## Current Launch Blockers

1. PayFast live account approval still needs to be confirmed before paid business signup can be fully live-tested.
2. The PayFast ITN URL should be checked in the PayFast dashboard: `https://omhjcalrfhswjmanriqv.supabase.co/functions/v1/payfast-webhook`.
3. Transactional email is being moved off Lovable to Resend. Before Lovable can be cancelled, Resend must be configured, the updated Supabase email functions must be deployed, and quote/invoice emails must be smoke-tested on production.
4. Social login is paused for launch and WhatsApp lead alerts are disabled until they are rebuilt on a non-Lovable provider. Email/password auth, quote/invoice email, and public profile WhatsApp contact remain available.
5. `npm run check:supabase-secrets` confirms Supabase has the PayFast, OpenAI, Google Places, and `PUBLIC_SITE_URL` secret names present. Required Resend secrets still missing: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_SENDER_DOMAIN`, and `EMAIL_REPLY_TO`.
6. Supabase email functions are intentionally not redeployed to the Resend code yet. Deploy them only after the required Resend secrets pass, then smoke-test quote and invoice email delivery.

## Latest Overnight Checks

- Latest launch-code commit on `main`: `ec55024` clarifies the Resend launch gate and is pushed.
- Local production build, lint, unit tests, route smoke tests, and mobile pricing overflow checks pass.
- `npm audit --audit-level=high` passes. Remaining audit items require force upgrades to dev tooling and are not launch blockers.
- Local build points at production Supabase `omhjcalrfhswjmanriqv`.
- Live `sjoh.co.za` now resolves through Cloudflare nameservers: `chase.ns.cloudflare.com` and `selah.ns.cloudflare.com`.
- `https://sjoh.co.za` and `https://www.sjoh.co.za` return HTTP 200 from Cloudflare.
- Cloudflare Pages was redeployed from the latest local build at `https://86e16cf1.sjoh.pages.dev`.
- `SITE_URL=https://sjoh.co.za npm run check:production` passes on the live site: launch icon, policy sitemap entries, `SORTED30`, pricing copy, and Acceptable Use markers are all present in production.
- The live bundle now includes the email/password-only auth notice and no longer contains the Lovable Cloud Auth package or Lovable/Twilio connector gateway string.
- Production smoke checks now verify the email/password-only auth notice and reject old Lovable auth/connector markers in the live bundle.
- Production smoke checks also pass against the latest Cloudflare preview deployment.
- PayFast checkout/webhook is now the active payment path; the old Paystack path is being removed from launch-critical setup.
- PayFast checkout now submits the signed fields through a form POST, matching the hosted PayFast checkout flow.
- PayFast checkout/webhook functions were redeployed on 26 May 2026 as `payfast-checkout` v6 and `payfast-webhook` v7.
- PayFast ITN validation now preserves PayFast field order for signatures and rejects paid subscription events whose amount does not match the selected tier/billing cycle.
- Trial behavior has moved to `SORTED30`: no automatic 30-day Basic trial, one 30-day Verified Pro trial per user, then R250/month to continue.
- Policy pages are now present for PayFast/compliance review: `/acceptable-use`, `/shipping`, and `/returns`.
- `sitemap.xml` includes the policy pages and both business landing aliases (`/for-businesses/creative` and `/for-businesses/creatives`).
- PayFast webhook events now explicitly record `provider = 'payfast'`, and the production database default has been corrected from the old Paystack default.
- Transactional email code has been refactored locally away from Lovable's email package and toward a Resend-backed queue processor. This is not launch-verified until Resend DNS/secrets are in place and the Supabase functions are deployed/tested.
- Supabase function list shows the transactional email functions are still on their pre-Resend deployed versions, so Lovable must stay available until the Resend deployment and email smoke tests are complete.
- Social login has been paused for launch to remove Lovable Cloud Auth from the critical path. Users sign in with email/password.
- WhatsApp lead alerts are paused for launch. The edge function returns a safe disabled response, and customers can still WhatsApp a business from the public profile.
- Email migration guide: `docs/email-provider-migration.md`.
- Added `npm run check:supabase-secrets` so launch-critical Supabase secret names can be checked without printing secret values.

## Launch Nice-To-Haves

| Status | Area | Decision |
| --- | --- | --- |
| `[LATER]` | Extra payment providers | Consider PayShap/Payflex/PayPal only after PayFast conversion data shows a real need |
| `[LATER]` | Full Supabase hardening pass | Do after first launch unless an advisor warning is critical |
| `[LATER]` | Remotion homepage video | Keep out of launch-critical path until the content is final |
| `[LATER]` | Extra landing page variants | Use the current business pages first, then iterate from ad data |

## Step-By-Step Launch Flow

1. Verify the app is technically healthy locally.
2. Confirm Supabase is pointing at the real production project.
3. Confirm every required secret/env var exists in the right place.
4. Confirm PayFast live mode can create subscriptions and receive ITNs.
5. Redeploy `sjoh.co.za`.
6. Smoke-test the customer journey on production.
7. Smoke-test the business journey on production.
8. Fix only launch-blocking issues.
9. Start inviting the first businesses.

## Hermes Lead Workflow

- Use the Hermes workflow for lead sourcing, source checking, POPIA-aware contact triage, and concierge lead drafts.
- Keep Hermes read/research oriented: it returns reviewed rows or handoff JSON, then Codex or Maxine persists approved data.
- Workflow guide: `docs/hermes-agent.md`.
- Hosted worker guide: `docs/hermes-hostinger.md`.
