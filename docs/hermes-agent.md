# Hermes Agent Workflow

Hermes is Sjoh's Codex-facing research and operations workflow for lead sourcing, outreach hygiene, concierge handoff, and launch support triage. Codex remains the main system: it deploys Hermes agents for bounded missions, consolidates their findings, validates the data, and decides what should be persisted or fixed.

Use Hermes when the task is about finding or qualifying service providers, turning outside job posts into concierge leads, checking source evidence, preparing outreach-safe batches, or filtering support inbox noise. Keep normal Codex work for code changes, migrations, UI fixes, deploy checks, and tests.

## How To Invoke

In Codex, natural language usually works because `AGENTS.md` points back to this workflow:

```text
Use Hermes to find 20 high-confidence electricians in Midvaal and return rows matching data/meyerton_service_providers.csv.
```

If the local Codex skill is installed, you can also invoke it explicitly:

```text
Use $hermes to qualify these source links for Sjoh and return concierge lead drafts.
```

## Operating Loop

1. Give Hermes a target: category, area, source list, or lead type.
2. Hermes returns source-backed rows or concierge lead drafts, not app code edits.
3. Review the consent/contact status before using any contact details.
4. Persist approved prospect rows in `data/*.csv`, or manually post approved customer job leads through `/admin/concierge`.
5. Use the normal launch checks from `docs/launch-board.md` when code changes are involved.

## Deploying Hermes Agents

Codex should deploy Hermes agents in small, bounded batches. Each agent gets one clear lane and returns only reviewed findings.

Good lanes:

- `Area x category`: "Find plumbers in Meyerton and Midvaal."
- `Source QA`: "Verify these 25 existing rows still have live source URLs."
- `Concierge sourcing`: "Turn public customer job posts into `/admin/concierge` drafts."
- `Gap fill`: "Find phone-only businesses where email is missing, but do not guess email addresses."
- `Dedupe pass`: "Compare new rows against `data/*.csv` and flag likely duplicates."
- `Support triage`: "Classify launch support messages, filter spam, draft safe replies, and escalate payment/privacy/account issues."

Avoid vague lanes like "find leads in South Africa." Split broad missions by province, city, category, or source type.

Codex consolidation step:

1. Combine Hermes outputs.
2. Remove duplicates by business name, phone, email, website, and source URL.
3. Run `npm run validate:leads -- <csv-file>` for CSV batches. In Codex app shells where `npm` is not on PATH, use `./node_modules/.bin/tsx scripts/validate-hermes-leads.ts <csv-file>`.
4. Summarize what is usable now, what needs manual review, and what must not be contacted yet.

For the always-on hosted worker, see `docs/hermes-hostinger.md`.

## Review Rules

- Public contact data is not opt-in consent.
- Personal-looking emails need extra care and explicit opt-in before promotional outreach.
- Support triage is draft-only. Hermes must not promise refunds, change billing, approve ID checks, delete data, or send legal/privacy replies.
- Every row needs a source name, source URL, checked date, and uncertainty notes.
- Fewer high-confidence leads are better than a large noisy batch.
- Do not carry sensitive personal information into Sjoh unless it is necessary and appropriate for the workflow.

## Output Shapes

Prospect rows should match `data/meyerton_service_providers.csv`:

```text
lead_id,business_name,category,service_keywords,location_fit,address,city_area,province,country,phone,email,website,source_name,source_url,source_checked_date,contact_type,popia_consent_status,email_marketing_allowed_now,allowed_next_step,notes
```

Concierge lead drafts should match the `/admin/concierge` form:

```json
{
  "title": "",
  "description": "",
  "category_slug": "",
  "category_name": "",
  "province": "",
  "city": "",
  "budget": 0,
  "external_contact_url": "",
  "why_it_is_real": "",
  "risk_notes": ""
}
```

Support triage output should match the launch support playbook in `docs/hermes-support.md`:

```json
{
  "bucket": "payment_billing",
  "priority": "p0",
  "spam_score": 0,
  "spam_signals": [],
  "escalation": "maxine_now",
  "summary": "",
  "suggested_reply": ""
}
```

## Agent Brief Template

```text
Hermes mission:
- Target:
- Area:
- Category/categories:
- Source preference:
- Output format: CSV rows | concierge JSON drafts | QA report
- Quantity target:
- Exclusions:
- Date to use for source_checked_date:

Rules:
- Use source-backed public information only.
- Do not guess missing contact details.
- Treat public contact details as not opted in.
- Return source URLs and uncertainty notes.
```
