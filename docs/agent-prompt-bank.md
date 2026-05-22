# Sjoh Agent Prompt Bank

Use these prompts when Maxine wants Antigravity, Codex, Gemini, or Hermes to work in parallel. Do not paste private keys or passwords into any prompt.

## Antigravity Master Launch Prompt

```text
You are working on Sjoh, a Vite + React + TypeScript + Supabase marketplace for South African service providers. It is not Laravel.

Read AGENTS.md, docs/ANTIGRAVITY_HANDOFF.md, docs/launch-board.md, docs/launch-readiness.md, and docs/cloudflare-migration.md first. Do not make assumptions from older chat context unless the repo confirms it.

Goal: get Sjoh ready to launch by finishing the Cloudflare Pages migration, PayFast readiness checks, customer journey QA, business journey QA, and mobile polish.

Rules:
- Do not reintroduce Smile ID.
- Do not switch back to Paystack.
- Keep PayFast as the launch payment provider.
- Keep SORTED30 as the one-use 30-day Verified Pro trial code.
- Do not commit secrets.
- Do not change live DNS, payment live mode, or production secrets without Maxine confirming.
- Keep edits small, repo-native, and verified.

First, map the codebase and return a launch plan grouped by: DNS/hosting, payment, Supabase, customer UX, business UX, mobile/design, legal/compliance, and analytics/SEO. Then execute only the safest next task.
```

## Antigravity Cloudflare Cutover Agent

```text
/goal Cloudflare cutover check for Sjoh. Read docs/cloudflare-migration.md, wrangler.toml, public/_redirects, public/_headers, package.json, and docs/launch-board.md. Verify the Cloudflare Pages setup for project sjoh and preview https://103d886f.sjoh.pages.dev. Confirm required public env vars, route handling, cache/security headers, and the exact DNS/custom-domain steps needed for sjoh.co.za. Do not change DNS. Return a checklist Maxine can approve before cutover.
```

## Antigravity PayFast Agent

```text
/goal PayFast launch readiness audit for Sjoh. Read supabase/functions/payfast-checkout, supabase/functions/payfast-webhook, src/lib/payments.ts, docs/launch-readiness.md, and docs/launch-board.md. Confirm checkout creation, ITN validation, passphrase handling, sandbox/live behavior, subscription metadata, failure paths, and post-payment profile access. Do not expose secrets. Return exact missing PayFast dashboard settings and code issues, if any.
```

## Antigravity Customer Journey QA Agent

```text
/goal Mobile-first customer journey QA for Sjoh. Test the homepage, search, directory, category pages, post-a-job flow, auth, quote view, invoice view, and policy pages. Prioritize 390px and 430px mobile widths. Report broken links, unreadable text, layout overflow, console errors, and confusing copy. Patch only small obvious UI bugs, then run npm run lint and npm run build.
```

## Antigravity Business Journey QA Agent

```text
/goal Mobile-first business journey QA for Sjoh. Test /for-businesses, avatar landing pages, pricing, signup/login, profile creation, verification pending state, opportunities, quote creation, invoice creation, SORTED30 redemption, and subscription gating. Confirm a business can set up their profile while verification is pending but cannot apply for jobs until allowed. Report blockers and patch small safe bugs only.
```

## Antigravity Design Polish Agent

```text
/goal Targeted design polish for Sjoh. Keep the current dark, photo-led South African visual language. Keep the new white Sjoh logo and cycling exclamation accent. Balance the SA palette across red, navy, green, gold, periwinkle, and pink. Focus on mobile polish, landing page clarity, pricing page conversion, and visual consistency between homepage, directory, requests, pricing, login, and business dashboards. Do not redesign entire flows without approval.
```

## Antigravity Security Agent

```text
/goal Launch security pass for Sjoh. Review Supabase RLS-sensitive flows, Edge Function auth, document upload/storage access, invoice secure download links, public profile data exposure, PayFast webhook validation, and admin routes. Do not run destructive commands. Produce findings ordered by severity with file references and exact recommended fixes. Patch only high-confidence critical bugs.
```

## Hermes Lead Sourcing Prompt

Hermes is for operations research and lead sourcing, not app code.

```text
Use the Hermes workflow in docs/hermes-agent.md. Research South African service providers for Sjoh launch outreach. Focus on source-backed prospects in [CITY/SUBURB] for [CATEGORY]. Return rows with business name, category, suburb, public source URL, public contact evidence, checked date, confidence notes, and POPIA-aware outreach caution. Do not treat public contact details as marketing consent. Do not edit app code.
```

## Codex Integration Review Prompt

```text
Review all changes made by Antigravity/Hermes agents since the last pushed commit. Start with git status, git log --oneline -10, and git diff. Prioritize launch blockers, regressions, security issues, broken flows, and missing tests. Run the smallest relevant checks, then integrate only safe changes. Summarize what changed, what passed, and what still needs Maxine.
```
