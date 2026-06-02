# Sjoh Launch Readiness

This checklist covers the pieces that must be done outside the local app before launch.

## How To Add Secrets

Use the helper script so secrets are hidden while typing and do not end up in shell history:

```bash
cd /Users/maxin/Downloads/sjoh
./scripts/set-supabase-secrets.sh
```

If you need to see what you are typing, run visible-entry mode instead:

```bash
cd /Users/maxin/Downloads/sjoh
SHOW_SECRETS=1 ./scripts/set-supabase-secrets.sh
```

Only use visible-entry mode when no one else can see your screen.

Add these first because they block launch testing:

- `PAYFAST_MERCHANT_ID` from PayFast live mode.
- `PAYFAST_MERCHANT_KEY` from PayFast live mode.
- `PAYFAST_PASSPHRASE` from the PayFast integration settings.
- `OPENAI_API_KEY` for the automated Sjoh ID Check.
- `RESEND_API_KEY` for transactional email delivery.

Optional but useful before a bigger launch:

- `PAYFAST_SANDBOX=1` only while testing in PayFast sandbox.
- `PUBLIC_SITE_URL=https://sjoh.co.za`.
- `GOOGLE_PLACES_API_KEY` for Places imports/linking.
- `EMAIL_FROM` for the sender address, for example `Sjoh <hello@sjoh.co.za>`.
- `EMAIL_SENDER_DOMAIN=sjoh.co.za` for email queue metadata.
- `EMAIL_REPLY_TO=hello@sjoh.co.za`.
- `EMAIL_PREVIEW_API_KEY` for internal email-template preview tooling.
- `EMAIL_SUPPRESSION_WEBHOOK_SECRET` if a provider suppression webhook is connected.
- `ONESIGNAL_APP_ID` and `ONESIGNAL_REST_API_KEY` for push notifications.
- WhatsApp lead alerts are paused for launch, so no Lovable/Twilio WhatsApp connector secrets are required.

## Supabase

- Production project:
  - `omhjcalrfhswjmanriqv`
  - `https://omhjcalrfhswjmanriqv.supabase.co`
- Database migrations have been pushed to the production Supabase project.
- Edge Functions have been deployed, excluding the old third-party ID verification functions.
- PayFast webhook events now write `provider = 'payfast'`, and the production database default has been corrected for new payment events.
- Confirm the app-specific Supabase secrets are present:
  - `OPENAI_API_KEY`
  - `PAYFAST_MERCHANT_ID`
  - `PAYFAST_MERCHANT_KEY`
  - `PAYFAST_PASSPHRASE`
  - `PAYFAST_SANDBOX` only for sandbox testing
  - `GOOGLE_PLACES_API_KEY`
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
  - `EMAIL_SENDER_DOMAIN`
  - `EMAIL_REPLY_TO`
  - `PUBLIC_SITE_URL`
- Required launch secrets were confirmed present on 26 May 2026 with `npm run check:supabase-secrets`.
- `ONESIGNAL_APP_ID` and `ONESIGNAL_REST_API_KEY` are optional and can stay unset until push notifications are enabled.
- Social login is paused for launch to avoid Lovable Cloud Auth. Email/password login remains available.
- WhatsApp lead alerts are paused for launch. Customers can still WhatsApp a business from the public business profile.

## PayFast

- Wait for PayFast account verification if the account is still under review.
- Launch trial mechanic: `SORTED30` unlocks a one-time 30-day Verified Pro trial without a card. New accounts no longer receive an automatic 30-day Basic trial. After the code trial, the business chooses the R250/month subscription to continue.
- Private family/friends comp mechanic: `FRIENDS365` unlocks one year of Verified Pro access through the same code box. It is one redemption per user, does not create a PayFast subscription, and should not be published on the public site.
- Paid checkout should be positioned as a normal R250/month subscription, not as a card-required free trial.
- The current checkout submits signed PayFast fields through a form POST. Keep the GET `redirect_url` only as a fallback for older clients.
- The current webhook verifies PayFast's signature, merchant id, PayFast validation response, duplicate `pf_payment_id`, and expected amount for the selected tier/billing cycle.
- Latest deployed PayFast functions:
  - `payfast-checkout` v6
  - `payfast-webhook` v7
- Confirm live keys are saved as Supabase secrets:
  - `PAYFAST_MERCHANT_ID`
  - `PAYFAST_MERCHANT_KEY`
  - `PAYFAST_PASSPHRASE`
- PayFast security passphrase was re-entered in the PayFast dashboard and synced to Supabase on 27 May 2026. `npm run check:supabase-secrets` confirms the Supabase secret exists. Next confirmation: reopen PayFast Recurring Billing and confirm the missing-passphrase blocker is gone.
- Configure the PayFast ITN / notify URL as:
  - `https://omhjcalrfhswjmanriqv.supabase.co/functions/v1/payfast-webhook`
- After the next PayFast dashboard check, confirm Recurring Billing no longer shows the missing-passphrase blocker.
- Test the `SORTED30` trial redemption, first R250 subscription charge, duplicate ITN handling, cancellation, and webhook state update.
- Confirm PayFast sends a recurring token/subscription id to the webhook; Sjoh stores it for cancellation and failed-payment matching.
- Confirm `payment_events.provider` is `payfast` after the first live ITN.

## Sjoh ID Check

- Run the latest Supabase migration:
  - `supabase/migrations/20260516110940_replace_smile_with_sjoh_id_check.sql`
- Deploy the updated edge function:
  - `supabase functions deploy verify-sa-id`
- Add Supabase edge function secrets:
  - `OPENAI_API_KEY`
  - Optional: `OPENAI_VISION_MODEL`
- Do not deploy the old third-party ID verification functions.
- Test the flow:
  - Create/list a business.
  - Open `/dashboard?section=verification`.
  - Upload a clear ID image.
  - Confirm the status moves from pending/processing to verified or failed.
  - Confirm verified businesses can apply for jobs and unverified businesses cannot.

## Production Deploy

- Push the latest code to GitHub.
- Current hosting: frontend is on Cloudflare Pages while Supabase remains the backend.
- Cloudflare Pages project has been created:
  - Account: `sjohforwarding@gmail.com`
  - Project: `sjoh`
  - Default domain: `https://sjoh.pages.dev/`
- Current production preview/deployment: `https://86e16cf1.sjoh.pages.dev/`
- Cloudflare Pages settings:
  - Project name: `sjoh`
  - Production branch: `main`
  - Build command: `npm ci && npm run build`
  - Output directory: `dist`
- Set the production frontend env vars in the deploy host:
  - `VITE_SUPABASE_PROJECT_ID=omhjcalrfhswjmanriqv`
  - `VITE_SUPABASE_URL=https://omhjcalrfhswjmanriqv.supabase.co`
  - `VITE_SUPABASE_PUBLISHABLE_KEY=<the publishable key from the local .env>`
  - Optional: `VITE_ONESIGNAL_APP_ID=<your OneSignal app id>`
- The latest GitHub `main` build has been deployed to `sjoh.co.za` through Cloudflare Pages.
- `sjoh.co.za` nameservers are now:
  - `chase.ns.cloudflare.com`
  - `selah.ns.cloudflare.com`
- Keep Lovable available as a rollback fallback until the Cloudflare deploy has been stable for at least 24-48 hours and PayFast live checkout/ITN has been smoke-tested.
- Transactional emails have been verified through Resend: the `sjoh.co.za` Resend domain is verified, required email secrets are set in Supabase, email functions are deployed, and a production invoice email smoke test queued and processed successfully.
- Cloudflare migration guide: `docs/cloudflare-migration.md`.
- Email migration guide: `docs/email-provider-migration.md`.
- Verify the live deploy picked up the latest bundle whenever a new launch change is pushed:
  ```bash
  npm run check:production
  ```
- Confirm:
  - `https://sjoh.co.za/`
  - `https://sjoh.co.za/for-businesses`
  - `https://sjoh.co.za/for-businesses/trades`
  - `https://sjoh.co.za/pricing`
  - `https://sjoh.co.za/requests`
  - `https://sjoh.co.za/directory`
  - `https://sjoh.co.za/sitemap.xml`

## QA Journeys

- Customer journey:
  - Browse/search directory.
  - Post a job.
  - Receive a quote.
  - Accept a quote.
  - Receive quote/invoice emails.
- Business journey:
  - Visit ad landing page.
  - Create account.
  - Choose plan.
  - List business.
  - Add profile details, portfolio photos, service areas, and categories.
  - Complete Sjoh ID Check.
  - Browse opportunities.
  - Send quote.
  - Generate/send invoice.

## Legal And Trust

- Privacy policy must continue to mention uploaded ID documents and document processing.
- Terms should make clear that Sjoh ID Check is a platform trust check, not a government-certified identity verification.
- ID documents must stay in the private `id-verification-documents` bucket.
- Policy pages are live:
  - `/acceptable-use`
  - `/shipping`
  - `/returns`
- Footer legal links should expose Terms, Privacy, Acceptable Use, Service Delivery, and Refunds & Cancellations.
