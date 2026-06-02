-- Private family/friends code: one year of Verified Pro without payment.
-- Uses the existing coupon redemption flow, but paid-style access expires after 365 days.

INSERT INTO public.coupon_codes (code, tier, trial_days, active)
VALUES
  ('FRIENDS365', 'verified_pro'::public.sjoh_tier, 365, true),
  ('MAXINEFREE', 'verified_pro'::public.sjoh_tier, 365, true)
ON CONFLICT (code) DO UPDATE SET
  tier = EXCLUDED.tier,
  trial_days = EXCLUDED.trial_days,
  active = EXCLUDED.active;

CREATE OR REPLACE FUNCTION public.redeem_trial_code(_code text)
RETURNS TABLE (
  tier public.sjoh_tier,
  trial_ends_at timestamptz,
  code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
#variable_conflict use_column
DECLARE
  _user_id uuid := auth.uid();
  _normalized text := upper(regexp_replace(coalesce(_code, ''), '[^A-Za-z0-9]', '', 'g'));
  _access_ends_at timestamptz;
  _current public.provider_balances%rowtype;
  _coupon public.coupon_codes%rowtype;
  _is_paid_coupon boolean;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Sign in required to redeem a trial code' USING ERRCODE = '28000';
  END IF;

  SELECT *
    INTO _coupon
    FROM public.coupon_codes
   WHERE coupon_codes.code = _normalized AND coupon_codes.active = true;

  IF _coupon.code IS NULL THEN
    RAISE EXCEPTION 'Invalid trial code' USING ERRCODE = '22023';
  END IF;

  _access_ends_at := now() + (_coupon.trial_days || ' days')::interval;
  _is_paid_coupon := _coupon.tier IN ('basic'::public.sjoh_tier, 'verified_pro'::public.sjoh_tier);

  SELECT *
    INTO _current
    FROM public.provider_balances
   WHERE user_id = _user_id
   FOR UPDATE;

  IF EXISTS (
    SELECT 1
      FROM public.trial_code_redemptions
     WHERE user_id = _user_id
  ) THEN
    RAISE EXCEPTION 'Trial code already redeemed' USING ERRCODE = '23505';
  END IF;

  IF _current.user_id IS NOT NULL
     AND _current.tier IN ('basic'::public.sjoh_tier, 'verified_pro'::public.sjoh_tier)
     AND (_current.tier_expires_at IS NULL OR _current.tier_expires_at > now()) THEN
    RAISE EXCEPTION 'You already have an active paid plan' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.trial_code_redemptions (user_id, code, tier, trial_days, trial_ends_at)
  VALUES (_user_id, _normalized, _coupon.tier, _coupon.trial_days, _access_ends_at);

  INSERT INTO public.provider_balances (
    user_id,
    tier,
    trial_ends_at,
    verification_status,
    billing_cycle,
    tier_expires_at,
    next_renewal_at,
    updated_at
  )
  VALUES (
    _user_id,
    _coupon.tier,
    CASE WHEN _is_paid_coupon THEN NULL ELSE _access_ends_at END,
    'required'::public.verification_status,
    CASE WHEN _is_paid_coupon THEN 'annual'::public.billing_cycle ELSE 'monthly'::public.billing_cycle END,
    CASE WHEN _is_paid_coupon THEN _access_ends_at ELSE NULL END,
    CASE WHEN _is_paid_coupon THEN _access_ends_at ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = _coupon.tier,
    trial_ends_at = CASE WHEN _is_paid_coupon THEN NULL ELSE _access_ends_at END,
    tier_expires_at = CASE WHEN _is_paid_coupon THEN _access_ends_at ELSE NULL END,
    next_renewal_at = CASE WHEN _is_paid_coupon THEN _access_ends_at ELSE NULL END,
    billing_cycle = CASE WHEN _is_paid_coupon THEN 'annual'::public.billing_cycle ELSE 'monthly'::public.billing_cycle END,
    verification_status = CASE
      WHEN public.provider_balances.is_id_verified
        AND (
          public.provider_balances.verification_expires_at IS NULL
          OR public.provider_balances.verification_expires_at > now()
        )
      THEN public.provider_balances.verification_status
      ELSE 'required'::public.verification_status
    END,
    updated_at = now();

  RETURN QUERY SELECT
    _coupon.tier AS tier,
    _access_ends_at AS trial_ends_at,
    _normalized AS code;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Trial code already redeemed' USING ERRCODE = '23505';
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_trial_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_trial_code(text) TO authenticated;

COMMENT ON FUNCTION public.redeem_trial_code(text)
  IS 'Redeems a database-backed coupon code once per authenticated user. SORTED30 grants a trial; FRIENDS365 grants one year of Verified Pro.';
