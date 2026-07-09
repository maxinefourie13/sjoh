# Sjoh handoff — 9 July 2026

Context for Codex picking this up. Everything below was diagnosed and fixed by Claude in a live session against production (Supabase project `omhjcalrfhswjmanriqv`, repo `maxinefourie13/sjoh`, hosted on Cloudflare Pages). Local repo: `/Users/maxin/Downloads/Designs/Sjoh/Website/sjoh`.

## What was broken

1. **PayFast payments always failed.** `payfast-webhook` computed the ITN signature after filtering out empty-valued fields, but PayFast signs over every field it posts — including empty ones — in received order. Every real payment notification was rejected as a signature mismatch, so no subscription ever activated even when the customer's card was charged successfully.
2. **Transactional emails silently stopped sending.** The `process-email-queue` pg_cron job and its Vault secret (`email_queue_service_role_key`) were originally set up out-of-band via the Supabase Management API, not in version-controlled SQL. That setup was lost (likely during a project recreation), so emails enqueued successfully but the dispatcher never ran — nothing ever actually sent.
3. **Signup confirmation emails still on Supabase's default mailer**, not Resend — separate from the queue above (this is an Auth-level setting, not a code path). Still unresolved, see below.
4. **Email templates used a text wordmark instead of the real logo.**
5. **No visible way to cancel a subscription** (was a `mailto:` link) and the dashboard claimed a plan was active immediately after PayFast redirect, before the ITN had actually landed — so it often showed "no active plan" right after a successful payment.
6. Unrelated: `OPENAI_API_KEY`, `OPENAI_VISION_MODEL`, and `GOOGLE_PLACES_API_KEY` Supabase secrets all share the same value (a bulk-paste mistake from May) — ID verification and Google reviews import are broken until these are re-entered correctly.

## What was fixed and deployed (already live)

- `supabase/functions/payfast-webhook/index.ts` — signature verification now includes empty fields. Committed (`d8be03f`) and deployed directly via the Supabase dashboard code editor (bypassing local CLI, which isn't installed on this machine). **Confirmed working**: after deploy, PayFast's automatic ITN retry landed and the test account's real payment processed — `provider_balances.tier` flipped to `verified_pro`.
- `supabase/functions/payfast-cancel/index.ts` — new function, calls PayFast's subscription cancel API using the stored `payfast_subscription_token`. Deployed live.
- `src/lib/payments.ts` — added `payments.cancelSubscription()`.
- `src/pages/Dashboard.tsx` — Billing section now has a real Cancel Plan button (confirm step, calls the new function). The post-`?paid=1` redirect flow now polls `provider_balances` for up to 2 minutes instead of immediately claiming success, then does a full reload into a genuine "Sharp! Plan active." state.
- Email dispatcher cron reinstalled directly in the production database (10-second interval, reads `email_queue_service_role_key` from Vault). Repair/diagnostic SQL committed at `scripts/sql/diagnose-email-and-billing.sql` and `scripts/sql/setup-email-dispatcher-cron.sql` — **note**: these files still contain the literal placeholder text for the vault secret; the actual secret was set directly in the SQL editor, not via the committed script. If this project's Supabase instance is ever recreated again, re-run the diagnostic script first, then use the setup script as a template (paste the real `service_role` key from Settings → API keys → legacy keys).
- `supabase/functions/_shared/transactional-email-templates/brand.tsx` — new shared `<BrandHeader>` component using `public/email/sjoh-logo.png` (stable, unhashed path, so it survives frontend rebuilds). All 10 email templates updated to use it instead of a text wordmark. Deployed live via dashboard (both the `send-transactional-email` function's shared files and the templates themselves).

All of the above is pushed to `origin/main` (commits `4aed042`, `35e558c`, `d8be03f`, `d6a56e9`) and Cloudflare Pages has auto-deployed the frontend changes. Edge functions were deployed via the Supabase dashboard's code editor directly (paste + Deploy), not via `supabase functions deploy` — there's no Supabase CLI installed locally, so future edge function changes will need either the CLI installed or the same dashboard-paste approach.

## What still needs doing

1. **Enable custom SMTP for Auth emails.** Go to Auth → Emails → SMTP Settings in the Supabase dashboard. Turn on custom SMTP with: host `smtp.resend.com`, port `465`, username `resend`, password = the `RESEND_API_KEY` value, sender `hello@sjoh.co.za`. Without this, signup confirmation/password-reset emails are still capped by Supabase's own low-volume default mailer.
2. **Fix the duplicated secrets.** `OPENAI_API_KEY`, `OPENAI_VISION_MODEL`, and `GOOGLE_PLACES_API_KEY` in Edge Function Secrets currently all hash to the same value (visible from the SHA256 digest column in the dashboard) — someone pasted one value into all three fields in a bulk-secrets update in May. Re-enter each with its correct real value. Also safe to delete the two `LOVABLE_*` secrets (`LOVABLE_API_KEY`, `LOVABLE_SEND_URL`) — dead since the email migration off Lovable.
3. **Delete the test account** `maxinefourie13+sjohtest1@gmail.com` from Auth → Users once done testing (it currently holds a live `verified_pro` trial from this session's PayFast test).
4. **Clean up stray uncommitted files** sitting in the working tree: `netlify.toml` and `sjoh0da.assets/` (untracked, dated 24 June, from an earlier session — likely a Netlify migration experiment that never shipped). Decide whether to keep or delete; currently harmless but confusing.
5. **Consider installing the Supabase CLI locally** (`npm install -g supabase` or via the docs) so future edge function deploys can go through `supabase functions deploy <name>` and `supabase db push` instead of manual dashboard pastes — the dashboard approach worked but is error-prone for larger changes.
6. Nothing else launch-blocking is known at this time — the core "payments don't work, emails don't send" complaint that started this session is resolved and verified live.

## Useful references while working on this

- Production Supabase dashboard: `https://supabase.com/dashboard/project/omhjcalrfhswjmanriqv` (login via GitHub, account `maxinefourie13`)
- Live site: `https://sjoh.co.za`
- `docs/launch-readiness.md` and `docs/launch-board.md` — older launch checklists, still broadly accurate for infra/secrets inventory
- `scripts/sql/diagnose-email-and-billing.sql` — read-only diagnostic query covering cron jobs, queue depth, DLQ, payment events; safe to re-run any time something payment/email-related looks off
