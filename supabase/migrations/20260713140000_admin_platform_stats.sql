-- Founder ops dashboard: one admin-only stats function powering the private
-- /admin overview page and the daily digest email.

create or replace function public.admin_platform_stats()
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  _out json;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admins only';
  end if;

  select json_build_object(
    'generated_at', now(),

    'businesses_total',      (select count(*) from public.businesses),
    'businesses_today',      (select count(*) from public.businesses where created_at >= date_trunc('day', now())),
    'businesses_7d',         (select count(*) from public.businesses where created_at >= now() - interval '7 days'),
    'businesses_active',     (select count(*) from public.businesses where listing_status = 'active'),

    'pros_verified',         (select count(*) from public.businesses where kyc_verified = true),

    'subs_paid',             (select count(*) from public.provider_balances where tier in ('basic','verified_pro')),
    'subs_trialing',         (select count(*) from public.provider_balances
                               where tier in ('basic_trial','verified_pro_trial')
                                 and trial_ends_at is not null and trial_ends_at > now()),

    'founding_pros_claimed', (select count(*) from public.early_access_signups
                               where claimed_founding_spot = true and role = 'pro'),

    'job_requests_total',    (select count(*) from public.opportunities),
    'job_requests_today',    (select count(*) from public.opportunities where created_at >= date_trunc('day', now())),
    'job_requests_open',     (select count(*) from public.opportunities where status = 'open'),

    'quotes_total',          (select count(*) from public.proposals),
    'quotes_today',          (select count(*) from public.proposals where created_at >= date_trunc('day', now())),

    'reviews_total',         (select count(*) from public.reviews),
    'reviews_today',         (select count(*) from public.reviews where created_at >= date_trunc('day', now())),

    'recent_businesses', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select name, city, province, category_name, listing_status, created_at
        from public.businesses
        order by created_at desc
        limit 15
      ) t
    ),
    'recent_job_requests', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select title, category_name, city, status, created_at
        from public.opportunities
        order by created_at desc
        limit 15
      ) t
    )
  ) into _out;

  return _out;
end;
$$;

grant execute on function public.admin_platform_stats() to authenticated;

-- Same numbers for the daily digest edge function, callable with the
-- service role (no admin JWT in a cron context).
create or replace function public.admin_platform_stats_service()
returns json
language sql
security definer
set search_path to 'public'
as $$
  select json_build_object(
    'businesses_total',   (select count(*) from public.businesses),
    'businesses_today',   (select count(*) from public.businesses where created_at >= date_trunc('day', now())),
    'job_requests_today', (select count(*) from public.opportunities where created_at >= date_trunc('day', now())),
    'quotes_today',       (select count(*) from public.proposals where created_at >= date_trunc('day', now())),
    'reviews_today',      (select count(*) from public.reviews where created_at >= date_trunc('day', now())),
    'subs_paid',          (select count(*) from public.provider_balances where tier in ('basic','verified_pro')),
    'subs_trialing',      (select count(*) from public.provider_balances
                            where tier in ('basic_trial','verified_pro_trial')
                              and trial_ends_at is not null and trial_ends_at > now())
  );
$$;

revoke execute on function public.admin_platform_stats_service() from public, anon, authenticated;
