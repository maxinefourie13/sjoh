-- Piece of Mind — Care & Progress Portal (school management MVP)
-- Self-contained module: its own role enum + tables, all RLS-protected.
-- Access to a child's clinical data is gated by security-definer helpers so
-- RLS policies stay simple and non-recursive.

-- ---------------------------------------------------------------------------
-- 1) Roles
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'school_role') then
    create type public.school_role as enum ('school_admin', 'therapist', 'parent');
  end if;
end$$;

create table if not exists public.school_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.school_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.school_user_roles enable row level security;

create or replace function public.has_school_role(_user_id uuid, _role public.school_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.school_user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ---------------------------------------------------------------------------
-- 2) Children + access links
-- ---------------------------------------------------------------------------
create table if not exists public.school_children (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  avatar_url text,
  diagnosis text,          -- e.g. "ASD, sensory processing"
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.school_children enable row level security;

-- relationship: who a user is to a child. Drives all access.
create table if not exists public.school_child_access (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.school_children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null check (relationship in ('parent', 'therapist')),
  created_at timestamptz not null default now(),
  unique (child_id, user_id, relationship)
);
alter table public.school_child_access enable row level security;
create index if not exists school_child_access_user_idx on public.school_child_access(user_id);
create index if not exists school_child_access_child_idx on public.school_child_access(child_id);

-- Any linked user (parent or therapist) or an admin may VIEW a child's data.
create or replace function public.can_access_child(_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_school_role(auth.uid(), 'school_admin')
    or exists (
      select 1 from public.school_child_access
      where child_id = _child_id and user_id = auth.uid()
    )
$$;

-- Admins and linked therapists may EDIT a child's clinical data.
create or replace function public.can_edit_child(_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_school_role(auth.uid(), 'school_admin')
    or exists (
      select 1 from public.school_child_access
      where child_id = _child_id
        and user_id = auth.uid()
        and relationship = 'therapist'
    )
$$;

-- ---------------------------------------------------------------------------
-- 3) IEP + goals
-- ---------------------------------------------------------------------------
create table if not exists public.school_ieps (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.school_children(id) on delete cascade,
  title text not null default 'Individual Education Programme',
  summary text,
  start_date date not null default current_date,
  review_date date,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.school_ieps enable row level security;
create index if not exists school_ieps_child_idx on public.school_ieps(child_id);

create table if not exists public.school_iep_goals (
  id uuid primary key default gen_random_uuid(),
  iep_id uuid not null references public.school_ieps(id) on delete cascade,
  child_id uuid not null references public.school_children(id) on delete cascade,
  domain text not null,   -- communication | fine_motor | gross_motor | social_emotional | cognitive | self_care | sensory | literacy | numeracy | behaviour
  title text not null,
  description text,
  baseline text,
  target text,
  status text not null default 'emerging' check (status in ('not_started', 'emerging', 'developing', 'achieved', 'on_hold')),
  progress integer not null default 0 check (progress between 0 and 100),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.school_iep_goals enable row level security;
create index if not exists school_iep_goals_child_idx on public.school_iep_goals(child_id);
create index if not exists school_iep_goals_iep_idx on public.school_iep_goals(iep_id);

-- ---------------------------------------------------------------------------
-- 4) Updates / therapy notes (the "inform the parents" surface)
-- ---------------------------------------------------------------------------
create table if not exists public.school_updates (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.school_children(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  type text not null default 'progress' check (type in ('progress', 'therapy_note', 'announcement')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.school_updates enable row level security;
create index if not exists school_updates_child_idx on public.school_updates(child_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 5) Supplementary packs + recommendations
-- ---------------------------------------------------------------------------
create table if not exists public.school_packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents integer not null default 0,   -- ZAR cents
  currency text not null default 'ZAR',
  focus_areas text[] not null default '{}',  -- domains this pack supports
  age_min integer,
  age_max integer,
  url text,             -- external store link
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.school_packs enable row level security;

create table if not exists public.school_pack_recommendations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.school_children(id) on delete cascade,
  pack_id uuid not null references public.school_packs(id) on delete cascade,
  reason text,
  source text not null default 'manual' check (source in ('auto', 'manual')),
  status text not null default 'suggested' check (status in ('suggested', 'purchased', 'dismissed')),
  recommended_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, pack_id)
);
alter table public.school_pack_recommendations enable row level security;
create index if not exists school_pack_recs_child_idx on public.school_pack_recommendations(child_id);

-- ---------------------------------------------------------------------------
-- 6) Report generation log
-- ---------------------------------------------------------------------------
create table if not exists public.school_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.school_children(id) on delete cascade,
  period_start date,
  period_end date,
  summary text,
  generated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.school_reports enable row level security;
create index if not exists school_reports_child_idx on public.school_reports(child_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 7) updated_at triggers
-- ---------------------------------------------------------------------------
create trigger school_children_set_updated_at
  before update on public.school_children
  for each row execute function public.handle_updated_at();
create trigger school_ieps_set_updated_at
  before update on public.school_ieps
  for each row execute function public.handle_updated_at();
create trigger school_iep_goals_set_updated_at
  before update on public.school_iep_goals
  for each row execute function public.handle_updated_at();
create trigger school_packs_set_updated_at
  before update on public.school_packs
  for each row execute function public.handle_updated_at();
create trigger school_pack_recs_set_updated_at
  before update on public.school_pack_recommendations
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 8) RLS policies
-- ---------------------------------------------------------------------------

-- school_user_roles: a user sees their own roles; admins manage all.
create policy "school_roles self read" on public.school_user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "school_roles admin read" on public.school_user_roles
  for select to authenticated using (public.has_school_role(auth.uid(), 'school_admin'));
create policy "school_roles admin manage" on public.school_user_roles
  for all to authenticated
  using (public.has_school_role(auth.uid(), 'school_admin'))
  with check (public.has_school_role(auth.uid(), 'school_admin'));

-- school_children
create policy "children readable by linked users" on public.school_children
  for select to authenticated using (public.can_access_child(id));
create policy "children admin insert" on public.school_children
  for insert to authenticated with check (public.has_school_role(auth.uid(), 'school_admin'));
create policy "children editable by team" on public.school_children
  for update to authenticated using (public.can_edit_child(id)) with check (public.can_edit_child(id));
create policy "children admin delete" on public.school_children
  for delete to authenticated using (public.has_school_role(auth.uid(), 'school_admin'));

-- school_child_access: linked users can see who else is linked; admins manage.
create policy "access rows readable by linked users" on public.school_child_access
  for select to authenticated using (public.can_access_child(child_id));
create policy "access rows admin manage" on public.school_child_access
  for all to authenticated
  using (public.has_school_role(auth.uid(), 'school_admin'))
  with check (public.has_school_role(auth.uid(), 'school_admin'));

-- school_ieps
create policy "ieps readable by linked users" on public.school_ieps
  for select to authenticated using (public.can_access_child(child_id));
create policy "ieps editable by team" on public.school_ieps
  for all to authenticated using (public.can_edit_child(child_id)) with check (public.can_edit_child(child_id));

-- school_iep_goals
create policy "goals readable by linked users" on public.school_iep_goals
  for select to authenticated using (public.can_access_child(child_id));
create policy "goals editable by team" on public.school_iep_goals
  for all to authenticated using (public.can_edit_child(child_id)) with check (public.can_edit_child(child_id));

-- school_updates
create policy "updates readable by linked users" on public.school_updates
  for select to authenticated using (public.can_access_child(child_id));
create policy "updates writable by team" on public.school_updates
  for all to authenticated using (public.can_edit_child(child_id)) with check (public.can_edit_child(child_id));

-- school_packs: catalogue is readable by any authenticated user; admins manage.
create policy "packs readable" on public.school_packs
  for select to authenticated using (true);
create policy "packs admin manage" on public.school_packs
  for all to authenticated
  using (public.has_school_role(auth.uid(), 'school_admin'))
  with check (public.has_school_role(auth.uid(), 'school_admin'));

-- school_pack_recommendations: linked users read; team creates/edits;
-- parents may update status (purchased/dismissed) on their child's recs.
create policy "recs readable by linked users" on public.school_pack_recommendations
  for select to authenticated using (public.can_access_child(child_id));
create policy "recs team manage" on public.school_pack_recommendations
  for all to authenticated using (public.can_edit_child(child_id)) with check (public.can_edit_child(child_id));
create policy "recs parent update status" on public.school_pack_recommendations
  for update to authenticated using (public.can_access_child(child_id)) with check (public.can_access_child(child_id));

-- school_reports
create policy "reports readable by linked users" on public.school_reports
  for select to authenticated using (public.can_access_child(child_id));
create policy "reports writable by team" on public.school_reports
  for all to authenticated using (public.can_edit_child(child_id)) with check (public.can_edit_child(child_id));

-- ---------------------------------------------------------------------------
-- 8b) Admin helper: link a parent/therapist to a child by email.
-- Finds the auth user, grants the matching school role, and creates the access
-- link — all in one call. Admin-only; runs as definer to read auth.users.
-- ---------------------------------------------------------------------------
create or replace function public.school_link_guardian(
  _child_id uuid,
  _email text,
  _relationship text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid;
begin
  if not public.has_school_role(auth.uid(), 'school_admin') then
    raise exception 'Only a school admin can link people to a child';
  end if;
  if _relationship not in ('parent', 'therapist') then
    raise exception 'relationship must be parent or therapist';
  end if;

  select id into _uid from auth.users where lower(email) = lower(_email) limit 1;
  if _uid is null then
    raise exception 'No account found for %. Ask them to register first.', _email;
  end if;

  insert into public.school_user_roles (user_id, role)
  values (_uid, _relationship::public.school_role)
  on conflict (user_id, role) do nothing;

  insert into public.school_child_access (child_id, user_id, relationship)
  values (_child_id, _uid, _relationship)
  on conflict (child_id, user_id, relationship) do nothing;

  return _uid;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9) Seed: starter supplementary-pack catalogue (idempotent by name)
-- ---------------------------------------------------------------------------
insert into public.school_packs (name, description, price_cents, focus_areas, age_min, age_max, url)
select v.name, v.description, v.price_cents, v.focus_areas, v.age_min, v.age_max, v.url
from (values
  ('Fine Motor Fun Pack',
   'Threading, tongs, playdough mats and pencil-control worksheets to build hand strength and pre-writing skills at home.',
   34900, array['fine_motor','self_care'], 3, 8, 'https://www.pieceofmindcentre.com/shop'),
  ('Chatterbox Language Kit',
   'Picture cards, first-words games and conversation prompts to expand expressive and receptive language.',
   39900, array['communication','literacy'], 2, 7, 'https://www.pieceofmindcentre.com/shop'),
  ('Big Body Movement Pack',
   'Balance, coordination and core-strength activity cards for gross-motor development.',
   29900, array['gross_motor'], 3, 9, 'https://www.pieceofmindcentre.com/shop'),
  ('Calm & Connected Sensory Box',
   'Sensory tools and a regulation routine to help with self-regulation and sensory needs.',
   44900, array['sensory','social_emotional'], 2, 10, 'https://www.pieceofmindcentre.com/shop'),
  ('Feelings & Friends Pack',
   'Emotion cards, social stories and turn-taking games to build social-emotional skills.',
   32900, array['social_emotional','behaviour'], 4, 10, 'https://www.pieceofmindcentre.com/shop'),
  ('School-Ready Numeracy Pack',
   'Counting, sorting and early-maths activities to build number sense.',
   31900, array['numeracy','cognitive'], 4, 8, 'https://www.pieceofmindcentre.com/shop'),
  ('Ready-to-Read Literacy Pack',
   'Phonics, letter formation and shared-reading prompts for emergent literacy.',
   35900, array['literacy','communication'], 4, 9, 'https://www.pieceofmindcentre.com/shop'),
  ('Daily Living Skills Pack',
   'Visual schedules and step-by-step routines for dressing, toileting and self-care independence.',
   27900, array['self_care','cognitive'], 3, 10, 'https://www.pieceofmindcentre.com/shop')
) as v(name, description, price_cents, focus_areas, age_min, age_max, url)
where not exists (select 1 from public.school_packs p where p.name = v.name);
