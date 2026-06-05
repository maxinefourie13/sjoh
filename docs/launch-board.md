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
| `[DONE]` | Supabase secrets | Live PayFast, OpenAI, and Resend email keys are added to Supabase | Maxine + Codex |
| `[DONE]` | Security audit | High-severity npm audit findings are resolved without force-upgrading launch tooling | Codex |
| `[CHECKING]` | PayFast | PayFast live credentials, passphrase, and ITN are configured; recurring billing still needs dashboard/live smoke confirmation | Maxine + Codex |
| `[DONE]` | Trial code | `SORTED30` gives a one-time 30-day Verified Pro trial without a card | Codex |
| `[DONE]` | Production deploy | `sjoh.co.za`, `www.sjoh.co.za`, and `sjoh-git.pages.dev` are served by the Git-connected Cloudflare Pages project from GitHub `main` | Maxine + Codex |
| `[DONE]` | Hosting migration | Frontend hosting is cut over from Lovable to Cloudflare Pages while keeping Supabase Free | Maxine + Codex |
| `[CHECKING]` | Customer journey | Customer can search, post a job, and receive quote/invoice emails through the non-Lovable mail sender | Codex |
| `[CHECKING]` | Business journey | Business can sign up, pay, create profile, verify ID, browse opportunities, quote, and invoice through the non-Lovable mail sender | Codex |
| `[DONE]` | Lovable runtime cleanup | Social login and WhatsApp alerts no longer depend on Lovable runtime connectors for launch | Codex |
| `[DONE]` | Legal/trust copy | Privacy, terms, cancellation, acceptable use, delivery, refund, and ID-check language are present and clear | Codex |
| `[DONE]` | Support channel | `hello@sjoh.co.za` is routed through Cloudflare Email Routing to `sjohforwarding@gmail.com`; inbox receipt is confirmed; Hermes support triage is ready for spam filtering, drafts, and escalation | Maxine + Hermes |

## Current Launch Blockers

1. PayFast security passphrase has now been entered in both PayFast and Supabase. Recurring Billing still needs one dashboard confirmation, then the first live R250 subscription checkout/ITN needs a controlled smoke test.
2. PayFast live account approval still needs to be confirmed before paid business signup can be fully live-tested.
3. The first live R250 subscription checkout/ITN should only be smoke-tested when Maxine is awake and ready to approve a real payment flow.
4. Social login is paused for launch and WhatsApp lead alerts are disabled until they are rebuilt on a non-Lovable provider. Email/password auth, quote/invoice email, and public profile WhatsApp contact remain available.
5. `npm run check:supabase-secrets` confirms Supabase has the PayFast, OpenAI, Google Places, `PUBLIC_SITE_URL`, and required Resend email secrets present.
6. Cloudflare production now serves the Git-connected clean bundle from project `sjoh-git`. `npm run check:production` passes on 5 June 2026 for both `sjoh.co.za` and `www.sjoh.co.za`, and the live JS excludes the old demo markers `Khumalo Electrical Contractors`, `Naledi Properties`, and `Example Business`.

## Latest Overnight Checks

- Latest launch-code commit on `main`: `fda8c07` removes remaining demo labels/placeholders from the launch runtime and deletes the unused tracked seed archive from `src`.
- Current clean deploy package: `/Users/maxin/Downloads/sjoh-clean-launch.zip`, SHA-256 `b3362f009f116bb3a9e1e36ed1110f6e37e6d38a5a145b5ccc90d0de626c9438`.
- Local `npm run lint`, `npm test`, and `npm run build` pass on 2026-06-04.
- Local `dist` no longer contains `Khumalo Electrical Contractors`, `Naledi Properties`, `Example Business`, `@lovable.dev/cloud-auth-js`, or `connector-gateway.lovable.dev`.
- Live `npm run check:production` passes on 2026-06-05 after the Cloudflare Pages migration to the Git-connected `sjoh-git` project.
- `https://sjoh.co.za/`, `https://www.sjoh.co.za/`, and `https://ddaee773.sjoh-git.pages.dev/` all serve `/assets/index-nGWI9YeJ.js`; that bundle includes the request checklist contrast fix and excludes `Khumalo Electrical Contractors`, `Naledi Properties`, and `Example Business`.
- Custom domains `sjoh.co.za` and `www.sjoh.co.za` were removed from the old direct-upload `sjoh` Pages project and added to the Git-connected `sjoh-git` project. Both domains are Active with SSL enabled.
- Latest launch-code commit on `main`: `ec55024` clarifies the Resend launch gate and is pushed.
- Local production build, lint, unit tests, route smoke tests, and mobile pricing overflow checks pass.
- `npm audit --audit-level=high` passes. Remaining audit items require force upgrades to dev tooling and are not launch blockers.
- Local build points at production Supabase `omhjcalrfhswjmanriqv`.
- Live `sjoh.co.za` now resolves through Cloudflare nameservers: `chase.ns.cloudflare.com` and `selah.ns.cloudflare.com`.
- `https://sjoh.co.za` and `https://www.sjoh.co.za` return HTTP 200 from Cloudflare.
- Cloudflare Pages now deploys automatically from GitHub `main` on project `sjoh-git`; the old direct-upload `sjoh` Pages project is no longer the production owner for the custom domains.
- `SITE_URL=https://sjoh.co.za npm run check:production` passes on the live site: launch icon, policy sitemap entries, `SORTED30`, pricing copy, and Acceptable Use markers are all present in production.
- The live bundle now includes the email/password-only auth notice and no longer contains the Lovable Cloud Auth package or Lovable/Twilio connector gateway string.
- Production smoke checks now verify the email/password-only auth notice and reject old Lovable auth/connector markers in the live bundle.
- Production smoke checks also pass against the latest Cloudflare preview deployment.
- PayFast checkout/webhook is now the active payment path; the old Paystack path is being removed from launch-critical setup.
- PayFast checkout now submits the signed fields through a form POST, matching the hosted PayFast checkout flow.
- PayFast checkout/webhook functions were redeployed on 26 May 2026 as `payfast-checkout` v6 and `payfast-webhook` v7.
- PayFast ITN validation now preserves PayFast field order for signatures and rejects paid subscription events whose amount does not match the selected tier/billing cycle.
- PayFast security passphrase was re-entered in PayFast and synced to the matching Supabase secret on 27 May 2026. `npm run check:supabase-secrets` confirms the Supabase secret exists. Next: confirm PayFast Recurring Billing no longer shows the missing-passphrase blocker.
- Resend domain verification is complete for `sjoh.co.za`.
- Cloudflare Email Routing is enabled for `hello@sjoh.co.za` -> `sjohforwarding@gmail.com`; old GoDaddy/SecureServer MX/SPF records were removed and public DNS now shows Cloudflare MX/SPF/DKIM.
- A launch test email to `hello@sjoh.co.za` was accepted by the production Supabase transactional email queue on 2026-06-02. Cloudflare also logged an authenticated external test from `maxinefourie13@gmail.com` to `hello@sjoh.co.za` as `Forwarded`; Gmail receipt was confirmed inside `sjohforwarding@gmail.com`. First placement was Spam, so add a Gmail filter for `to:hello@sjoh.co.za` -> never send to Spam.
- Supabase required email secrets are now present: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_SENDER_DOMAIN`, and `EMAIL_REPLY_TO`.
- Supabase transactional email functions were redeployed on 26 May 2026: `send-transactional-email`, `process-email-queue`, `preview-transactional-email`, and `handle-email-suppression`.
- A production email smoke test queued and processed an invoice email through Resend successfully.
- Trial behavior has moved to `SORTED30`: no automatic 30-day Basic trial, one 30-day Verified Pro trial per user, then R250/month to continue.
- Policy pages are now present for PayFast/compliance review: `/acceptable-use`, `/shipping`, and `/returns`.
- `sitemap.xml` includes the policy pages and both business landing aliases (`/for-businesses/creative` and `/for-businesses/creatives`).
- PayFast webhook events now explicitly record `provider = 'payfast'`, and the production database default has been corrected from the old Paystack default.
- Transactional email has been moved off Lovable's email package and onto the Resend-backed Supabase queue processor.
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
- Use `docs/hermes-support.md` for launch support triage, spam filtering, draft replies, and escalation routing.
- Keep Hermes read/research oriented: it returns reviewed rows or handoff JSON, then Codex or Maxine persists approved data.
- Workflow guide: `docs/hermes-agent.md`.
- Hosted worker guide: `docs/hermes-hostinger.md`.
