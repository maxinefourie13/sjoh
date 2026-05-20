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
| `[DONE]` | Trial code | `SORTED3` gives a one-time 3-day Verified Pro trial without a card | Codex |
| `[DONE]` | Production deploy | `sjoh.co.za` is redeployed with the new Supabase env vars | Maxine + Codex/Lovable |
| `[CHECKING]` | Customer journey | Customer can search, post a job, and receive quote/invoice emails | Codex |
| `[CHECKING]` | Business journey | Business can sign up, pay, create profile, verify ID, browse opportunities, quote, and invoice | Codex |
| `[CHECKING]` | Legal/trust copy | Privacy, terms, cancellation, ID-check language are present and clear | Codex |
| `[YOU]` | Support channel | Launch users can reach a real support email or WhatsApp when stuck | Maxine |

## Current Launch Blockers

1. PayFast live account approval still needs to be confirmed before paid business signup can be fully live-tested.
2. The PayFast ITN URL should be checked in the PayFast dashboard: `https://omhjcalrfhswjmanriqv.supabase.co/functions/v1/payfast-webhook`.
3. No additional code blockers are known right now; keep testing the live customer and business journeys on production.

## Latest Overnight Checks

- Latest GitHub commit on `main`: launch hygiene and mobile pricing fixes are pushed.
- Local production build, lint, unit tests, route smoke tests, and mobile pricing overflow checks pass.
- `npm audit --audit-level=high` passes. Remaining audit items require force upgrades to dev tooling and are not launch blockers.
- Local build points at production Supabase `omhjcalrfhswjmanriqv`.
- Live `sjoh.co.za` now points at production Supabase `omhjcalrfhswjmanriqv`, includes `SORTED3`, and uses `payfast-checkout`.
- PayFast checkout/webhook is now the active payment path; the old Paystack path is being removed from launch-critical setup.
- Trial behavior has moved to `SORTED3`: no automatic 30-day Basic trial, one 3-day Verified Pro trial per user, then R250/month to continue.

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
