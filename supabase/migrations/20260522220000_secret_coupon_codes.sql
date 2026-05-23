-- Migration: Create database-backed secret coupon codes table and update redeem_trial_code function.
-- ID: 20260522220000

CREATE TABLE IF NOT EXISTS public.coupon_codes (
  code text PRIMARY KEY,
  tier public.sjoh_tier NOT NULL DEFAULT 'verified_pro_trial'::public.sjoh_tier,
  trial_days integer NOT NULL DEFAULT 30 CHECK (trial_days > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from anon role.
-- Since the RPC is SECURITY DEFINER, it runs as the owner (superuser) and doesn't need public access.
REVOKE ALL ON public.coupon_codes FROM PUBLIC, anon;
GRANT SELECT ON public.coupon_codes TO authenticated;

-- Insert initial codes (SORTED30 for public launch, MAXINEFREE for secret admin bypass)
INSERT INTO public.coupon_codes (code, tier, trial_days, active)
VALUES 
  ('SORTED30', 'verified_pro_trial'::public.sjoh_tier, 30, true),
  ('MAXINEFREE', 'verified_pro_trial'::public.sjoh_tier, 365, true)
ON CONFLICT (code) DO UPDATE SET
  tier = EXCLUDED.tier,
  trial_days = EXCLUDED.trial_days,
  active = EXCLUDED.active;

-- Recreate redeem_trial_code to use coupon_codes lookup
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
  _trial_ends_at timestamptz;
  _current public.provider_balances%rowtype;
  _coupon public.coupon_codes%rowtype;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Sign in required to redeem a trial code' USING ERRCODE = '28000';
  END IF;

  -- Look up coupon code
  SELECT *
    INTO _coupon
    FROM public.coupon_codes
   WHERE coupon_codes.code = _normalized AND coupon_codes.active = true;

  IF _coupon.code IS NULL THEN
    RAISE EXCEPTION 'Invalid trial code' USING ERRCODE = '22023';
  END IF;

  _trial_ends_at := now() + (_coupon.trial_days || ' days')::interval;

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
  VALUES (_user_id, _normalized, _coupon.tier, _coupon.trial_days, _trial_ends_at);

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
    _trial_ends_at,
    'required'::public.verification_status,
    'monthly'::public.billing_cycle,
    NULL,
    NULL,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = _coupon.tier,
    trial_ends_at = _trial_ends_at,
    tier_expires_at = NULL,
    next_renewal_at = NULL,
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
    _trial_ends_at AS trial_ends_at,
    _normalized AS code;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Trial code already redeemed' USING ERRCODE = '23505';
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_trial_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_trial_code(text) TO authenticated;

COMMENT ON FUNCTION public.redeem_trial_code(text)
  IS 'Redeems a database-backed coupon code once per authenticated user.';
