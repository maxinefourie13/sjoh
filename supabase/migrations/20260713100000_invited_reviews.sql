-- Founding-member review link.
-- Founding members (the first 500 pros) get a shareable public link so
-- friends/family/past clients can leave a review without a Sjoh account.
-- These are clearly NOT verified-hire reviews (is_verified_hire = false,
-- source = 'invited') so profiles stay honest.

-- 1. Distinguish where a review came from.
alter table public.reviews
  add column if not exists source text not null default 'standard';
-- 'standard'      = legacy / other
-- 'verified_hire' = from a completed job (is_verified_hire = true)
-- 'invited'       = founding-member review link

create index if not exists idx_reviews_source_business
  on public.reviews(business_id, source);

-- 2. Public status check for the review page (name + whether the link is live).
--    SECURITY DEFINER so anon can read founding status without exposing owner_id.
create or replace function public.review_link_status(_business_slug text)
returns table(business_name text, active boolean)
language sql
security definer
set search_path to 'public'
as $$
  select b.name,
         public.is_founding_member(b.owner_id)
  from public.businesses b
  where b.slug = _business_slug;
$$;

grant execute on function public.review_link_status(text) to anon, authenticated;

-- 3. Public submission. SECURITY DEFINER so logged-out friends can post,
--    but only for founding-member businesses, with input + rate guards.
create or replace function public.submit_invited_review(
  _business_slug text,
  _rating integer,
  _body text,
  _reviewer_name text,
  _reviewer_company text default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  _business_id uuid;
  _owner_id uuid;
  _recent_count int;
  _review_id uuid;
begin
  if _rating < 1 or _rating > 5 then raise exception 'Rating must be between 1 and 5'; end if;
  if _reviewer_name is null or length(trim(_reviewer_name)) < 2 then
    raise exception 'Please add your name';
  end if;
  if _body is null or length(trim(_body)) < 10 then
    raise exception 'Tell us a bit more — at least 10 characters';
  end if;
  if length(_body) > 2000 then raise exception 'That review is too long'; end if;

  select id, owner_id into _business_id, _owner_id
  from public.businesses where slug = _business_slug;
  if _business_id is null then raise exception 'Business not found'; end if;

  -- Founding-member perk only. Past the 500 cap, non-founding owners have no
  -- founding spot, so this rejects automatically — the link stops working.
  if not public.is_founding_member(_owner_id) then
    raise exception 'This review link is not active';
  end if;

  -- Light abuse guard: cap invited reviews per business per rolling 24h.
  select count(*) into _recent_count
  from public.reviews
  where business_id = _business_id
    and source = 'invited'
    and created_at > now() - interval '24 hours';
  if _recent_count >= 25 then
    raise exception 'Too many reviews for this business today. Please try again tomorrow.';
  end if;

  insert into public.reviews (
    business_id, reviewer_id, reviewer_name, reviewer_company,
    rating, body, deal_memo_id, is_verified_hire, is_verified_transaction, source
  ) values (
    _business_id, null, trim(_reviewer_name),
    nullif(trim(coalesce(_reviewer_company, '')), ''),
    _rating, trim(_body), null, false, false, 'invited'
  ) returning id into _review_id;

  return _review_id;
end;
$$;

grant execute on function public.submit_invited_review(text, integer, text, text, text) to anon, authenticated;
