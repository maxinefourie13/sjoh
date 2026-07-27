-- Finish removing the retired ID-verification feature.
--
-- This intentionally deletes historic ID-check submissions and the associated
-- private storage bucket. Verified Pro remains a subscription tier; it is not
-- an identity-verification claim.

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
    next_renewal_at
  )
  VALUES (
    _user_id,
    _tier,
    NULLIF(_payfast_token, ''),
    NULLIF(_payfast_subscription_token, ''),
    _next_renewal,
    _billing_cycle,
    _next_renewal
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = excluded.tier,
    payfast_token = COALESCE(excluded.payfast_token, public.provider_balances.payfast_token),
    payfast_subscription_token = COALESCE(excluded.payfast_subscription_token, public.provider_balances.payfast_subscription_token),
    tier_expires_at = excluded.tier_expires_at,
    billing_cycle = excluded.billing_cycle,
    next_renewal_at = excluded.next_renewal_at,
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

REVOKE EXECUTE ON FUNCTION public.apply_subscription_payment(
  uuid, public.sjoh_tier, text, text, timestamptz, public.billing_cycle
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_subscription_payment(
  uuid, public.sjoh_tier, text, text, timestamptz, public.billing_cycle
) TO service_role;

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
    billing_cycle,
    tier_expires_at,
    next_renewal_at,
    updated_at
  )
  VALUES (
    _user_id,
    _coupon.tier,
    CASE WHEN _is_paid_coupon THEN NULL ELSE _access_ends_at END,
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

CREATE OR REPLACE FUNCTION public.admin_platform_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _out json;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admins only';
  END IF;

  SELECT json_build_object(
    'generated_at', now(),
    'businesses_total',      (SELECT count(*) FROM public.businesses),
    'businesses_today',      (SELECT count(*) FROM public.businesses WHERE created_at >= date_trunc('day', now())),
    'businesses_7d',         (SELECT count(*) FROM public.businesses WHERE created_at >= now() - interval '7 days'),
    'businesses_active',     (SELECT count(*) FROM public.businesses WHERE listing_status = 'active'),
    'subs_paid',             (SELECT count(*) FROM public.provider_balances WHERE tier IN ('basic','verified_pro')),
    'subs_trialing',         (SELECT count(*) FROM public.provider_balances
                               WHERE tier IN ('basic_trial','verified_pro_trial')
                                 AND trial_ends_at IS NOT NULL AND trial_ends_at > now()),
    'founding_pros_claimed', (SELECT count(*) FROM public.early_access_signups
                               WHERE claimed_founding_spot = true AND role = 'pro'),
    'job_requests_total',    (SELECT count(*) FROM public.opportunities),
    'job_requests_today',    (SELECT count(*) FROM public.opportunities WHERE created_at >= date_trunc('day', now())),
    'job_requests_open',     (SELECT count(*) FROM public.opportunities WHERE status = 'open'),
    'quotes_total',          (SELECT count(*) FROM public.proposals),
    'quotes_today',          (SELECT count(*) FROM public.proposals WHERE created_at >= date_trunc('day', now())),
    'reviews_total',         (SELECT count(*) FROM public.reviews),
    'reviews_today',         (SELECT count(*) FROM public.reviews WHERE created_at >= date_trunc('day', now())),
    'recent_businesses', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT name, city, province, category_name, listing_status, created_at
        FROM public.businesses
        ORDER BY created_at DESC
        LIMIT 15
      ) t
    ),
    'recent_job_requests', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT title, category_name, city, status, created_at
        FROM public.opportunities
        ORDER BY created_at DESC
        LIMIT 15
      ) t
    )
  ) INTO _out;

  RETURN _out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_platform_stats() TO authenticated;

DROP VIEW IF EXISTS public.business_verified_status;

DROP FUNCTION IF EXISTS public.apply_verification_result(uuid, text, boolean);
DROP FUNCTION IF EXISTS public.mark_verification_pending(text);
DROP FUNCTION IF EXISTS public.expire_stale_verifications();
DROP FUNCTION IF EXISTS public.user_has_kyc_business(uuid);
DROP FUNCTION IF EXISTS public.get_dispute_kyc_package(uuid);
DROP FUNCTION IF EXISTS public.mark_dispute_kyc_provided(uuid, text, text);

DROP POLICY IF EXISTS "Owners can upload their ID check documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners can read their ID check documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners can replace their ID check documents" ON storage.objects;

-- The files and bucket are removed through the Storage API before this
-- migration. Direct writes to the storage schema are intentionally avoided.

DROP TABLE IF EXISTS public.id_verification_submissions;
DROP FUNCTION IF EXISTS public.set_id_verification_submission_updated_at();

ALTER TABLE public.disputes
  DROP COLUMN IF EXISTS kyc_data_provided_at,
  DROP COLUMN IF EXISTS kyc_provided_to;

ALTER TABLE public.businesses
  DROP COLUMN IF EXISTS kyc_verified,
  DROP COLUMN IF EXISTS kyc_reference,
  DROP COLUMN IF EXISTS kyc_verified_at;

ALTER TABLE public.provider_balances
  DROP COLUMN IF EXISTS is_id_verified,
  DROP COLUMN IF EXISTS verification_status,
  DROP COLUMN IF EXISTS verification_expires_at;

DROP TYPE IF EXISTS public.id_check_status;
DROP TYPE IF EXISTS public.verification_status;
