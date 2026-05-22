# Sjoh Antigravity Handoff

This file is the main project briefing for Antigravity agents. Read it together with `AGENTS.md`, `docs/launch-board.md`, `docs/launch-readiness.md`, and `docs/cloudflare-migration.md` before making changes.

## Project Reality Check

Sjoh is not a Laravel app. It is a Vite + React + TypeScript app with Supabase for auth, database, storage, and Edge Functions. The public frontend is being moved from Lovable hosting to Cloudflare Pages.

## Product Summary

Sjoh is a South African marketplace for local service providers. Customers can search for vetted pros, post jobs, compare quotes, view reviews, and receive invoices. Businesses can sign up, create a verified profile, browse opportunities, send quotes, generate invoices, collect reviews, and keep 100% of their job value. Launch positioning focuses on early access, local visibility, trust, and the `SORTED30` 30-day Verified Pro trial.

## Current Infrastructure

- GitHub repo: `https://github.com/maxinefourie13/sjoh`
- Local repo path used by Codex: `/Users/maxin/Downloads/sjoh`
- Frontend stack: Vite, React, TypeScript, Tailwind, shadcn/ui
- Backend: Supabase project `omhjcalrfhswjmanriqv`
- Supabase URL: `https://omhjcalrfhswjmanriqv.supabase.co`
- Payments: PayFast Edge Functions, replacing Paystack
- Hosting migration target: Cloudflare Pages
- Cloudflare account: `sjohforwarding@gmail.com`
- Cloudflare account ID: `7356313895a62a1f442cb17b7e4483bb`
- Cloudflare Pages project: `sjoh`
- Cloudflare default domain: `https://sjoh.pages.dev/`
- First Cloudflare deployment preview: `https://103d886f.sjoh.pages.dev/`
- Production domain: `https://sjoh.co.za`

## Where Codex Left Off

Codex prepared and deployed the app to Cloudflare Pages:

- Added Cloudflare SPA support via `public/_redirects`.
- Added conservative browser headers via `public/_headers`.
- Added `wrangler.toml`.
- Added `npm run deploy:cloudflare`.
- Confirmed `npm run lint`, `npm test`, and `npm run build` pass.
- Created the Cloudflare Pages project `sjoh`.
- Deployed the first production preview to `https://103d886f.sjoh.pages.dev/`.
- Verified preview routes return `200` for:
  - `/`
  - `/for-businesses`
  - `/for-businesses/trades`
  - `/pricing`
  - `/login`
  - `/sitemap.xml`
  - `/acceptable-use`
  - `/shipping`
  - `/returns`
- Pushed deployment documentation to GitHub in commit `7fd752b`.

Pending migration step: add/connect the custom domain `sjoh.co.za` to Cloudflare Pages and perform DNS cutover after Maxine confirms the live DNS change.

## Launch-Critical Rules

- Do not reintroduce Smile ID. Sjoh now uses the internal `verify-sa-id` flow with secure document storage and review/status logic.
- Do not switch back to Paystack. PayFast is the launch payment provider.
- Do not change live DNS, payment live mode, or production secrets without Maxine explicitly confirming.
- Do not commit real secrets, database passwords, service-role keys, PayFast keys, or OpenAI keys.
- Keep `SORTED30` as the memorable one-use 30-day Verified Pro trial code.
- Keep Cloudflare Pages public env limited to `VITE_*` variables. Supabase service-role and PayFast secrets live in Supabase Edge Function secrets.
- Treat `backups/` as local/untracked unless Maxine asks to preserve it.

## First Antigravity Goal

Paste this into Antigravity:

```text
/goal Read AGENTS.md and docs/ANTIGRAVITY_HANDOFF.md, then summarize launch blockers before making changes.
```

## Suggested Async Agent Workstreams

Use separate agents for independent checks. Agents should work on branches or return findings before changing shared files.

1. Cloudflare cutover agent:
   - Verify Cloudflare Pages project settings.
   - Confirm required env vars are present.
   - Prepare DNS/custom-domain steps for `sjoh.co.za`.
   - Do not change DNS unless Maxine explicitly confirms.

2. PayFast readiness agent:
   - Audit `supabase/functions/payfast-checkout` and `supabase/functions/payfast-webhook`.
   - Confirm webhook/ITN URL in docs.
   - Confirm all PayFast callbacks and subscription metadata are correct.
   - Return any missing live-mode checks.

3. Customer journey QA agent:
   - Test routes from homepage to search, directory, job posting, quote view, invoice view, login/signup, and policy pages.
   - Focus on mobile first.
   - Report broken links, copy mismatches, and console/runtime errors.

4. Business journey QA agent:
   - Test business landing pages, signup, profile creation, verification status, opportunities, quoting, invoice generation, trial redemption, and subscription gating.
   - Confirm users can continue setting up a profile while verification is pending.

5. Design polish agent:
   - Do only targeted, mobile-first polish from Maxine's design notes.
   - Keep the Sjoh brand: dark interface, white logo, cycling accent exclamation mark, South African photo-led style, balanced red/navy/green/gold/periwinkle/pink palette.

6. Security and privacy agent:
   - Review Supabase RLS-sensitive areas, document upload paths, invoice download links, public routes, and Edge Function authorization.
   - Report risks before patching broad auth behavior.

## Verification Commands

Run the smallest relevant command first, then broaden:

```bash
npm run lint
npm test
npm run build
SITE_URL=https://sjoh.co.za npm run check:production
```

For Cloudflare preview checks before domain cutover:

```bash
SITE_URL=https://103d886f.sjoh.pages.dev npm run check:production
```

Note: sitemap entries intentionally point to `https://sjoh.co.za`, so sitemap host checks can fail against the temporary Pages preview. Route `200` checks on the preview are still useful.

## Key Files And Folders

- `src/pages/Index.tsx`: homepage
- `src/pages/BusinessLanding.tsx`: main business landing page
- `src/pages/AvatarLanding.tsx`: avatar-specific landing pages
- `src/pages/Pricing.tsx`: pricing page
- `src/pages/Dashboard.tsx`: business dashboard
- `src/components/SiteHeader.tsx`: nav/header
- `src/components/SjohWordmark.tsx`: logo rendering
- `src/components/TrialCodeRedeemer.tsx`: `SORTED30`
- `src/lib/payments.ts`: payment helpers
- `supabase/functions/payfast-checkout`: PayFast checkout
- `supabase/functions/payfast-webhook`: PayFast ITN/webhook
- `supabase/functions/verify-sa-id`: ID verification
- `docs/launch-board.md`: current blocker tracker
- `docs/cloudflare-migration.md`: hosting migration guide
- `docs/secure-account-handover.md`: secure account handover template

## Collaboration Contract

Antigravity can work fast, but Codex remains the final integrator. Prefer small branches, clear diffs, source-backed findings, and verification output. If an agent changes code, it must list changed files and commands run.
