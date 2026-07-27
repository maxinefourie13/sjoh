-- Remove ID verification entirely.
--
-- The only remaining hard gate on ID verification was in submit_proposal
-- ("Complete Sjoh ID Check before quoting jobs"). This redefines the function
-- identically EXCEPT that gate is gone, so pros can quote without an ID check.
-- The Verified Pro plan gates (subscription required to quote) are unchanged.

CREATE OR REPLACE FUNCTION public.submit_proposal(_opportunity_id uuid, _business_id uuid, _message text, _quote_amount numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _proposal_id uuid;
  _is_owner boolean;
  _is_suspended boolean;
  _opp_status opportunity_status;
  _opp_is_urgent boolean;
  _existing uuid;
  _status text;
  _has_pro boolean;
  _can_use_free boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to submit a proposal';
  END IF;

  PERFORM public.check_rate_limit('send_quote', 10, 3600);

  IF _message IS NULL OR length(trim(_message)) < 20 THEN
    RAISE EXCEPTION 'Your pitch needs at least 20 characters';
  END IF;

  SELECT (owner_id = auth.uid()), is_suspended
  INTO _is_owner, _is_suspended
  FROM public.businesses
  WHERE id = _business_id;

  IF NOT coalesce(_is_owner, false) THEN
    RAISE EXCEPTION 'You do not own this business';
  END IF;
  IF _is_suspended THEN
    RAISE EXCEPTION 'This business is suspended';
  END IF;

  SELECT status, is_urgent
  INTO _opp_status, _opp_is_urgent
  FROM public.opportunities
  WHERE id = _opportunity_id;

  IF _opp_status IS NULL THEN
    RAISE EXCEPTION 'Opportunity not found';
  END IF;
  IF _opp_status <> 'open' THEN
    RAISE EXCEPTION 'This job is no longer open';
  END IF;

  _status := public.provider_status(auth.uid());
  _has_pro := public.has_verified_pro_access(auth.uid());
  _can_use_free := (NOT _has_pro) AND public.can_use_founding_proposal(auth.uid());

  IF _status = 'locked' THEN
    RAISE EXCEPTION 'Your account is locked. Choose a plan in your dashboard to start applying again.';
  END IF;

  -- (ID Check gate removed — no longer required to quote.)

  IF _opp_is_urgent AND NOT _has_pro THEN
    RAISE EXCEPTION 'Eish! Urgent jobs are reserved for Verified Pro businesses. Use SORTED30 once, or subscribe for R250/month.';
  END IF;

  IF _has_pro THEN
    NULL;
  ELSIF _can_use_free THEN
    NULL;
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.provider_balances
      WHERE user_id = auth.uid()
        AND tier IN ('basic'::sjoh_tier, 'basic_trial'::sjoh_tier)
    ) THEN
      RAISE EXCEPTION 'Your current listing lets customers find you, but quoting jobs needs Verified Pro. Use SORTED30 once, or subscribe for R250/month.';
    END IF;
    RAISE EXCEPTION 'Only Verified Pro businesses can quote jobs. Use SORTED30 once, or subscribe for R250/month.';
  END IF;

  SELECT id INTO _existing
  FROM public.proposals
  WHERE opportunity_id = _opportunity_id
    AND business_id = _business_id;

  IF _existing IS NOT NULL THEN
    RAISE EXCEPTION 'You have already submitted a proposal for this job';
  END IF;

  INSERT INTO public.proposals (opportunity_id, business_id, provider_id, message, quote_amount)
  VALUES (_opportunity_id, _business_id, auth.uid(), trim(_message), _quote_amount)
  RETURNING id INTO _proposal_id;

  IF _can_use_free THEN
    INSERT INTO public.provider_balances (user_id, founding_proposals_used_this_month, founding_proposals_period_start)
    VALUES (auth.uid(), 1, date_trunc('month', now()))
    ON CONFLICT (user_id) DO UPDATE SET
      founding_proposals_used_this_month = CASE
        WHEN public.provider_balances.founding_proposals_period_start < date_trunc('month', now()) THEN 1
        ELSE public.provider_balances.founding_proposals_used_this_month + 1
      END,
      founding_proposals_period_start = date_trunc('month', now()),
      updated_at = now();
  END IF;

  UPDATE public.opportunities
  SET applicants_count = applicants_count + 1,
      updated_at = now()
  WHERE id = _opportunity_id;

  RETURN _proposal_id;
END;
$function$;
