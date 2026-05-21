-- Launch promo update: SORTED30 unlocks a one-time 30-day Verified Pro trial.
-- Keep the once-per-user redemption rule; only the code and duration change.

ALTER TABLE public.trial_code_redemptions
  ALTER COLUMN trial_days SET DEFAULT 30;

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
DECLARE
  _user_id uuid := auth.uid();
  _normalized text := upper(regexp_replace(coalesce(_code, ''), '[^A-Za-z0-9]', '', 'g'));
  _trial_ends_at timestamptz := now() + interval '30 days';
  _current public.provider_balances%rowtype;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Sign in required to redeem a trial code' USING ERRCODE = '28000';
  END IF;

  IF _normalized <> 'SORTED30' THEN
    RAISE EXCEPTION 'Invalid trial code' USING ERRCODE = '22023';
  END IF;

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
  VALUES (_user_id, _normalized, 'verified_pro_trial'::public.sjoh_tier, 30, _trial_ends_at);

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
    'verified_pro_trial'::public.sjoh_tier,
    _trial_ends_at,
    'required'::public.verification_status,
    'monthly'::public.billing_cycle,
    NULL,
    NULL,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = 'verified_pro_trial'::public.sjoh_tier,
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
    'verified_pro_trial'::public.sjoh_tier AS tier,
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
  IS 'Redeems the SORTED30 launch code once per authenticated user for a 30-day Verified Pro trial.';

DO $$
DECLARE
  _definition text;
BEGIN
  SELECT pg_get_functiondef('public.submit_proposal(uuid, uuid, text, numeric)'::regprocedure)
    INTO _definition;

  IF _definition IS NOT NULL THEN
    EXECUTE replace(_definition, 'SORTED3', 'SORTED30');
  END IF;
END;
$$;
