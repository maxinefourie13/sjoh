-- =========================================================
-- Switch subscription billing from Paystack to PayFast
-- =========================================================
-- The app is pre-launch, so the payment columns are renamed in place.
-- The guards below make this safe to run if Lovable/Codex has already
-- applied part of the migration in a preview database.
-- =========================================================

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'provider_balances' and column_name = 'paystack_customer_code'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'provider_balances' and column_name = 'payfast_token'
  ) then
    alter table public.provider_balances rename column paystack_customer_code to payfast_token;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'provider_balances' and column_name = 'paystack_subscription_code'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'provider_balances' and column_name = 'payfast_subscription_token'
  ) then
    alter table public.provider_balances rename column paystack_subscription_code to payfast_subscription_token;
  end if;
end $$;

drop index if exists provider_balances_paystack_customer_idx;
drop index if exists provider_balances_paystack_sub_idx;
create index if not exists provider_balances_payfast_token_idx
  on public.provider_balances(payfast_token);
create index if not exists provider_balances_payfast_sub_token_idx
  on public.provider_balances(payfast_subscription_token);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payment_events' and column_name = 'paystack_reference'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payment_events' and column_name = 'payfast_pf_payment_id'
  ) then
    alter table public.payment_events rename column paystack_reference to payfast_pf_payment_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payment_events' and column_name = 'paystack_event'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payment_events' and column_name = 'payfast_payment_status'
  ) then
    alter table public.payment_events rename column paystack_event to payfast_payment_status;
  end if;
end $$;

alter table public.payment_events
  drop constraint if exists payment_events_paystack_reference_key;
alter table public.payment_events
  drop constraint if exists payment_events_pf_payment_id_unique;
alter table public.payment_events
  add constraint payment_events_pf_payment_id_unique unique (payfast_pf_payment_id);

do $$
begin
  if to_regclass('public.klap_topups') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'klap_topups' and column_name = 'paystack_reference'
    ) and not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'klap_topups' and column_name = 'payfast_pf_payment_id'
    ) then
      alter table public.klap_topups rename column paystack_reference to payfast_pf_payment_id;
    end if;

    alter table public.klap_topups drop constraint if exists klap_topups_paystack_reference_key;
    alter table public.klap_topups drop constraint if exists klap_topups_pf_payment_id_unique;
    alter table public.klap_topups add constraint klap_topups_pf_payment_id_unique unique (payfast_pf_payment_id);
  end if;

  if to_regclass('public.urgent_fees') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'urgent_fees' and column_name = 'paystack_reference'
    ) and not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'urgent_fees' and column_name = 'payfast_pf_payment_id'
    ) then
      alter table public.urgent_fees rename column paystack_reference to payfast_pf_payment_id;
    end if;

    alter table public.urgent_fees drop constraint if exists urgent_fees_paystack_reference_key;
    alter table public.urgent_fees drop constraint if exists urgent_fees_pf_payment_id_unique;
    alter table public.urgent_fees add constraint urgent_fees_pf_payment_id_unique unique (payfast_pf_payment_id);
  end if;
end $$;

alter table public.provider_balances
  add column if not exists billing_cycle public.billing_cycle not null default 'monthly',
  add column if not exists next_renewal_at timestamptz;

alter type public.payment_event_kind
  add value if not exists 'subscription_cancelled';

drop function if exists public.apply_subscription_payment(uuid, public.sjoh_tier, text, text, timestamptz, public.billing_cycle);
drop function if exists public.lapse_subscription(text);

create or replace function public.apply_subscription_payment(
  _user_id uuid,
  _tier public.sjoh_tier,
  _payfast_token text,
  _payfast_subscription_token text,
  _next_renewal timestamptz,
  _billing_cycle public.billing_cycle default 'monthly'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _tier not in ('basic'::sjoh_tier, 'verified_pro'::sjoh_tier) then
    raise exception 'Invalid paid tier %', _tier;
  end if;

  insert into public.provider_balances (
    user_id,
    tier,
    payfast_token,
    payfast_subscription_token,
    tier_expires_at,
    billing_cycle,
    next_renewal_at,
    verification_status
  )
  values (
    _user_id,
    _tier,
    nullif(_payfast_token, ''),
    nullif(_payfast_subscription_token, ''),
    _next_renewal,
    _billing_cycle,
    _next_renewal,
    case when _tier = 'verified_pro' then 'required'::verification_status
         else 'not_required'::verification_status end
  )
  on conflict (user_id) do update set
    tier = excluded.tier,
    payfast_token = coalesce(excluded.payfast_token, public.provider_balances.payfast_token),
    payfast_subscription_token = coalesce(excluded.payfast_subscription_token, public.provider_balances.payfast_subscription_token),
    tier_expires_at = excluded.tier_expires_at,
    billing_cycle = excluded.billing_cycle,
    next_renewal_at = excluded.next_renewal_at,
    verification_status = case
      when public.provider_balances.is_id_verified
        and (public.provider_balances.verification_expires_at is null
             or public.provider_balances.verification_expires_at > now())
      then public.provider_balances.verification_status
      when _tier = 'verified_pro' then 'required'::verification_status
      else 'not_required'::verification_status
    end,
    updated_at = now();
end;
$$;

create or replace function public.lapse_subscription(_subscription_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.provider_balances set
    tier = 'locked'::sjoh_tier,
    tier_expires_at = now(),
    next_renewal_at = null,
    updated_at = now()
  where payfast_subscription_token = _subscription_token
     or payfast_token = _subscription_token;
end;
$$;

revoke execute on function public.apply_subscription_payment(uuid, public.sjoh_tier, text, text, timestamptz, public.billing_cycle) from public, anon, authenticated;
revoke execute on function public.lapse_subscription(text) from public, anon, authenticated;
