-- Billing lifecycle hardening:
-- - cancellation/payment lock hides public profiles immediately
-- - restored payment reactivates the profile when it is not in pre-launch workshop mode
-- - daily sweep archives lapsed profiles after 30 days
-- - notification table dedupes renewal/lapse/archive emails

CREATE TABLE IF NOT EXISTS public.billing_lifecycle_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('renewal_3d', 'lapsed_10d', 'archived_30d')),
  anchor_date date NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, kind, anchor_date)
);

CREATE INDEX IF NOT EXISTS idx_billing_lifecycle_notifications_user_kind
  ON public.billing_lifecycle_notifications (user_id, kind, anchor_date DESC);

ALTER TABLE public.billing_lifecycle_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage billing lifecycle notifications"
    ON public.billing_lifecycle_notifications
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.apply_subscription_payment(
  _user_id uuid,
  _tier public.sjoh_tier,
  _payfast_token text,
  _payfast_subscription_token text,
  _next_renewal timestamptz,
  _billing_cycle public.billing_cycle DEFAULT 'monthly'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.provider_balances (
    user_id,
    tier,
    payfast_token,
    payfast_subscription_token,
    tier_expires_at,
    billing_cycle,
    next_renewal_at,
    verification_status
  )
  VALUES (
    _user_id,
    _tier,
    NULLIF(_payfast_token, ''),
    NULLIF(_payfast_subscription_token, ''),
    _next_renewal,
    _billing_cycle,
    _next_renewal,
    CASE
      WHEN _tier = 'verified_pro' THEN 'required'::verification_status
      ELSE 'not_required'::verification_status
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = excluded.tier,
    payfast_token = COALESCE(excluded.payfast_token, public.provider_balances.payfast_token),
    payfast_subscription_token = COALESCE(excluded.payfast_subscription_token, public.provider_balances.payfast_subscription_token),
    tier_expires_at = excluded.tier_expires_at,
    billing_cycle = excluded.billing_cycle,
    next_renewal_at = excluded.next_renewal_at,
    verification_status = CASE
      WHEN public.provider_balances.is_id_verified
        AND (
          public.provider_balances.verification_expires_at IS NULL
          OR public.provider_balances.verification_expires_at > now()
        )
      THEN public.provider_balances.verification_status
      WHEN _tier = 'verified_pro' THEN 'required'::verification_status
      ELSE 'not_required'::verification_status
    END,
    updated_at = now();

  UPDATE public.businesses
  SET listing_status = CASE
        WHEN pre_launch THEN 'workshop'
        ELSE 'active'
      END,
      updated_at = now(),
      last_active_at = now()
  WHERE owner_id = _user_id
    AND listing_status IN ('workshop', 'dormant', 'archived');
END;
$$;

CREATE OR REPLACE FUNCTION public.lapse_subscription(_subscription_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _affected_user_ids uuid[];
BEGIN
  WITH updated AS (
    UPDATE public.provider_balances
    SET
      tier = 'locked'::sjoh_tier,
      tier_expires_at = now(),
      next_renewal_at = NULL,
      updated_at = now()
    WHERE payfast_subscription_token = _subscription_token
       OR payfast_token = _subscription_token
    RETURNING user_id
  )
  SELECT COALESCE(array_agg(user_id), ARRAY[]::uuid[])
    INTO _affected_user_ids
    FROM updated;

  UPDATE public.businesses
  SET listing_status = 'workshop',
      updated_at = now()
  WHERE owner_id = ANY(COALESCE(_affected_user_ids, ARRAY[]::uuid[]))
    AND listing_status IN ('active', 'dormant', 'archived');
END;
$$;

CREATE OR REPLACE FUNCTION public.run_lifecycle_sweep()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _trial_hidden int := 0;
  _lapsed_hidden int := 0;
  _lapsed_archived int := 0;
  _activity_result record;
BEGIN
  -- Trial expired with no paid subscription: hide from public search.
  WITH hidden AS (
    UPDATE public.businesses b
    SET listing_status = 'workshop', updated_at = now()
    FROM public.provider_balances pb
    WHERE b.owner_id = pb.user_id
      AND b.listing_status IN ('active', 'dormant')
      AND pb.tier IN ('basic_trial'::sjoh_tier, 'verified_pro_trial'::sjoh_tier)
      AND pb.trial_ends_at IS NOT NULL
      AND pb.trial_ends_at < now()
    RETURNING 1
  )
  SELECT count(*) INTO _trial_hidden FROM hidden;

  -- Cancelled, locked, or expired paid access: hide immediately but keep editable data.
  WITH hidden AS (
    UPDATE public.businesses b
    SET listing_status = 'workshop', updated_at = now()
    FROM public.provider_balances pb
    WHERE b.owner_id = pb.user_id
      AND b.listing_status IN ('active', 'dormant')
      AND (
        pb.tier = 'locked'::sjoh_tier
        OR (
          pb.tier IN ('basic'::sjoh_tier, 'verified_pro'::sjoh_tier)
          AND pb.tier_expires_at IS NOT NULL
          AND pb.tier_expires_at < now()
        )
      )
    RETURNING 1
  )
  SELECT count(*) INTO _lapsed_hidden FROM hidden;

  -- After 30 days hidden for lapsed access, mark as archived. Still recoverable.
  WITH archived AS (
    UPDATE public.businesses b
    SET listing_status = 'archived', updated_at = now()
    FROM public.provider_balances pb
    WHERE b.owner_id = pb.user_id
      AND b.listing_status = 'workshop'
      AND (
        (
          pb.tier = 'locked'::sjoh_tier
          AND pb.tier_expires_at IS NOT NULL
          AND pb.tier_expires_at < now() - interval '30 days'
        )
        OR (
          pb.tier IN ('basic'::sjoh_tier, 'verified_pro'::sjoh_tier)
          AND pb.tier_expires_at IS NOT NULL
          AND pb.tier_expires_at < now() - interval '30 days'
        )
        OR (
          pb.tier IN ('basic_trial'::sjoh_tier, 'verified_pro_trial'::sjoh_tier)
          AND pb.trial_ends_at IS NOT NULL
          AND pb.trial_ends_at < now() - interval '30 days'
        )
      )
    RETURNING 1
  )
  SELECT count(*) INTO _lapsed_archived FROM archived;

  SELECT * INTO _activity_result FROM public.transition_listing_states();

  RETURN jsonb_build_object(
    'trial_hidden', _trial_hidden,
    'lapsed_hidden', _lapsed_hidden,
    'lapsed_archived', _lapsed_archived,
    'inactive_to_dormant', _activity_result.to_dormant,
    'inactive_to_archived', _activity_result.to_archived,
    'ran_at', now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_subscription_payment(uuid, public.sjoh_tier, text, text, timestamptz, public.billing_cycle) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lapse_subscription(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.run_lifecycle_sweep() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_subscription_payment(uuid, public.sjoh_tier, text, text, timestamptz, public.billing_cycle) TO service_role;
GRANT EXECUTE ON FUNCTION public.lapse_subscription(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.run_lifecycle_sweep() TO service_role;
