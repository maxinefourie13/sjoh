# Piece of Mind — Care & Progress Portal

**PRD + MVP specification**

Owner: Maxine Fourie · Status: MVP build · Last updated: 8 Aug 2026

---

## 1. Background

[Piece of Mind Centre](https://www.pieceofmindcentre.com/) supports neurodiverse
children through therapy and remedial education (occupational therapy, speech &
language, and school-readiness / remedial programmes). Each child works to an
**Individual Education Programme (IEP)** — a set of goals across developmental
domains that the team works on and reviews over time.

Today, progress and communication happen through ad‑hoc channels (WhatsApp,
email, paper feedback books, verbal handovers at pickup). This is time‑consuming
for staff and leaves parents anxious about whether progress is actually
happening — and it gives no natural, trusted moment to recommend the take‑home
resource packs that reinforce therapy at home.

## 2. Problem statement

- **Staff spend too long** repeating the same progress updates to parents across
  fragmented channels.
- **Parents feel uncertain.** Without a single, living view of their child's
  goals and progress, they don't feel the reassurance that the centre is
  delivering value.
- **Home reinforcement is under‑sold.** The centre's supplementary packs (the
  materials that extend therapy into the home) are recommended informally and
  inconsistently, so uptake is low even when a pack clearly fits a child's goals.

## 3. Goals & success metrics

| Goal | Metric | MVP target |
| --- | --- | --- |
| Save staff communication time | Avg. minutes/week per child spent on parent updates | ↓ 50% |
| Reassure parents progress is happening | % of active parents who open the portal weekly | ≥ 60% |
| Prompt purchases of supplementary packs | % of pack recommendations converted to "purchased" | ≥ 25% |
| Single source of truth per child | % of children with an active IEP + ≥1 update/fortnight | ≥ 90% |

## 4. Users & roles

| Role | Who | What they do |
| --- | --- | --- |
| **School admin** | Centre owner / coordinator | Enrols children, links parents & therapists, manages the pack catalogue, oversees everything. |
| **Therapist** | OT / speech / remedial staff | Maintains a child's IEP & goals, logs progress, posts updates to parents, recommends packs, generates reports. |
| **Parent / guardian** | Family | Views their child's IEP, progress and updates; sees & acts on recommended packs; downloads reports. Read‑only on clinical data. |

Roles are additive and independent of the marketplace's `app_role`; the module
uses its own `school_role` enum so it can be enabled per‑user without touching
existing marketplace permissions.

## 5. Scope

### 5.1 In scope (MVP)

1. **Role‑aware portal** at `/school` — one entry point that renders the right
   experience for parent, therapist, or admin.
2. **Child records & enrolment** — admin creates a child and links a parent and a
   therapist. Access to a child is controlled by explicit links (RLS‑enforced).
3. **IEP with goals** — each child has an IEP; each IEP has goals tagged by
   developmental **domain** (communication, fine motor, social‑emotional, …),
   each with a baseline, target, status, and a 0–100% progress value.
4. **Progress tracking** — overall child progress is derived from goal progress;
   goal progress is updated by therapists over time and shown with progress bars
   and a trend.
5. **Updates / therapy notes** — therapists post dated updates (progress note,
   therapy note, or announcement) that appear on the parent's timeline. This is
   the primary "inform the parents" surface.
6. **Supplementary pack recommendations** — the system **auto‑suggests** packs
   whose focus areas match the child's lagging goal domains; therapists/admins
   can also recommend a pack manually with a reason. Parents see recommendations
   with a clear reason and a **Buy** call‑to‑action, and can mark a pack
   *purchased* or *dismissed*.
7. **Per‑child report** — a one‑click PDF (generated client‑side) summarising the
   child's goals, progress, recent updates, and recommended packs over a period,
   suitable for sharing or filing. Report generation is logged.

### 5.2 Out of scope (post‑MVP)

- Payments / checkout for packs (MVP links out to the centre's store and tracks
  intent; it does not process payment).
- Scheduling, attendance, billing/invoicing for therapy sessions.
- In‑app messaging / chat (updates are one‑way in MVP).
- Multi‑centre / franchise tenancy.
- Mobile apps (the portal is responsive web).
- Automated email/push notifications (surfaced in the app only for MVP).

## 6. Key user journeys

**Parent** logs in → lands on `/school` → sees their child's card with an overall
progress ring → opens the child → reads the latest update from the therapist,
scans goals and progress bars, and sees "Recommended for <child>" packs each with
a reason ("Fine‑motor goals are still emerging") and a Buy button → downloads the
latest report to keep.

**Therapist** logs in → sees the caseload of children linked to them → opens a
child → edits goal progress, adds a progress note that parents will see,
recommends a pack, and generates the fortnightly report.

**Admin** logs in → sees all children → enrols a new child, links the parent and
therapist, and curates the pack catalogue.

## 7. Data model (Supabase / Postgres)

All tables are prefixed `school_` and protected by row‑level security. Access to a
child's clinical data is gated by a security‑definer helper `can_access_child()`
(any linked user or admin) and edits by `can_edit_child()` (admin or a linked
therapist).

- `school_user_roles(user_id, role)` — `school_role` ∈ {school_admin, therapist, parent}
- `school_children` — demographic + enrolment record
- `school_child_access(child_id, user_id, relationship)` — links parents/therapists to a child
- `school_ieps(child_id, title, summary, start_date, review_date, status)`
- `school_iep_goals(iep_id, domain, title, description, baseline, target, status, progress)`
- `school_updates(child_id, author_id, type, title, body)` — progress notes / therapy notes / announcements
- `school_packs(name, description, price_cents, focus_areas[], url, image_url, active)` — supplementary pack catalogue
- `school_pack_recommendations(child_id, pack_id, reason, source, status)` — status ∈ {suggested, purchased, dismissed}, source ∈ {auto, manual}
- `school_reports(child_id, period_start, period_end, generated_by, summary)` — report generation log

## 8. Pack‑recommendation logic (MVP)

1. Compute the child's **lagging domains**: domains that have at least one goal
   with progress below a threshold (default 60%) or status `emerging`.
2. Suggest active packs whose `focus_areas` overlap a lagging domain and that are
   not already recommended for the child.
3. Rank by number of overlapping lagging domains, then by lowest related progress.
4. Therapists/admins can also add a manual recommendation with a free‑text reason.
5. Parents act on each recommendation (**Buy** → external store, then mark
   *purchased*; or *dismiss*). Conversion is measurable from status.

## 9. Non‑functional requirements

- **Privacy:** children's data is sensitive. RLS denies by default; a user only
  ever sees children they're explicitly linked to (or all, if admin). No public
  read.
- **Reuses existing stack:** Supabase auth, shadcn/ui, TanStack Query, and the
  bundled `jspdf` for reports — no new infrastructure.
- **Responsive** and accessible (progress bars carry text equivalents).

## 10. MVP acceptance checklist

- [ ] A parent sees only their own child and cannot edit clinical data.
- [ ] A therapist sees their caseload, can edit goals/updates, and generate a report.
- [ ] An admin can enrol a child and link a parent + therapist.
- [ ] Overall progress is derived from goal progress and shown per child.
- [ ] At least one relevant pack is auto‑suggested when a domain is lagging.
- [ ] A parent can mark a recommendation purchased/dismissed.
- [ ] A per‑child PDF report downloads and the generation is logged.
- [ ] All `school_*` tables enforce RLS; `lint`, `build`, and `test` pass.
