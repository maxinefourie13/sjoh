-- Pause Sjoh: run in the Supabase SQL editor (project omhjcalrfhswjmanriqv).
-- Run each step separately and read the result before moving on.

-- STEP 1 (read only): who is still set up to be charged by PayFast?
-- Anyone listed here needs their subscription cancelled in PayFast
-- (Dashboard > Subscriptions > open the subscription > Cancel).
select u.email,
       pb.tier::text                         as tier,
       pb.billing_cycle::text                as cycle,
       pb.next_renewal_at::date              as next_renewal,
       coalesce(pb.payfast_subscription_token, '') <> '' as has_payfast_subscription
from provider_balances pb
left join auth.users u on u.id = pb.user_id
where coalesce(pb.payfast_subscription_token, '') <> ''
   or coalesce(pb.payfast_token, '') <> ''
   or pb.tier::text not in ('none', 'locked', 'free')
order by pb.next_renewal_at nulls last;

-- STEP 2 (after cancelling in PayFast): lock every paid account so nothing
-- in the app treats them as active, and clear renewal dates.
update provider_balances
set tier = 'locked'::sjoh_tier,
    tier_expires_at = now(),
    next_renewal_at = null,
    updated_at = now()
where tier::text not in ('none', 'locked', 'free');

-- STEP 3: hide every public listing. Data is kept; 'archived' is only
-- reopened by a new successful payment.
update businesses
set listing_status = 'archived', updated_at = now()
where listing_status <> 'archived';

-- STEP 4 (read only): check. Expect zero rows and every listing archived.
select 'accounts still on a paid tier' as check, count(*)::text as result
from provider_balances where tier::text not in ('none', 'locked', 'free')
union all
select 'listings not archived', count(*)::text
from businesses where listing_status <> 'archived';
