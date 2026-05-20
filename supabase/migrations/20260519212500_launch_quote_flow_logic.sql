-- Launch quote flow fixes.
-- Providers can keep building profiles while Sjoh ID Check is pending, but cannot
-- quote jobs until at least one owned business has passed the check. Accepted
-- marketplace quotes now create a deal memo so invoice/review flows stay linked.

CREATE OR REPLACE FUNCTION public.submit_proposal(
  _opportunity_id uuid,
  _business_id uuid,
  _message text,
  _quote_amount numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _proposal_id uuid;
  _is_owner boolean;
  _is_suspended boolean;
  _opp_status opportunity_status;
  _opp_is_urgent boolean;
  _existing uuid;
  _status text;
  _has_pro boolean;
  _kyc boolean;
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
  _kyc := public.user_has_kyc_business(auth.uid());
  _can_use_free := (NOT _has_pro) AND public.can_use_founding_proposal(auth.uid());

  IF _status = 'locked' THEN
    RAISE EXCEPTION 'Your account is locked. Choose a plan in your dashboard to start applying again.';
  END IF;

  IF NOT _kyc THEN
    RAISE EXCEPTION 'Complete Sjoh ID Check before quoting jobs. You can keep setting up your profile while we verify it.';
  END IF;

  IF _opp_is_urgent AND NOT _has_pro THEN
    RAISE EXCEPTION 'Eish! Urgent jobs are reserved for Verified Pro businesses. Use SORTED3 once, or subscribe for R250/month.';
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
      RAISE EXCEPTION 'Your current listing lets customers find you, but quoting jobs needs Verified Pro. Use SORTED3 once, or subscribe for R250/month.';
    END IF;
    RAISE EXCEPTION 'Only Verified Pro businesses can quote jobs. Use SORTED3 once, or subscribe for R250/month.';
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
$$;

DROP FUNCTION IF EXISTS public.accept_quote(uuid);
CREATE OR REPLACE FUNCTION public.accept_quote(_proposal_id uuid)
RETURNS TABLE(client_phone text, client_email text, contact_preference text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _opp_id uuid;
  _client uuid;
  _pro_id uuid;
  _business_id uuid;
  _existing_status text;
  _quote_amount numeric;
  _message text;
  _deal_memo_id uuid;
  _opp_title text;
  _opp_description text;
  _opp_budget numeric;
  _client_phone text;
  _client_email text;
  _contact_preference text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to accept this quote';
  END IF;

  SELECT
    p.opportunity_id,
    o.client_id,
    p.provider_id,
    p.business_id,
    p.status::text,
    p.quote_amount,
    p.message,
    p.deal_memo_id,
    o.title,
    o.description,
    o.budget,
    o.client_phone,
    o.client_email,
    o.contact_preference
  INTO
    _opp_id,
    _client,
    _pro_id,
    _business_id,
    _existing_status,
    _quote_amount,
    _message,
    _deal_memo_id,
    _opp_title,
    _opp_description,
    _opp_budget,
    _client_phone,
    _client_email,
    _contact_preference
  FROM public.proposals p
  JOIN public.opportunities o ON o.id = p.opportunity_id
  WHERE p.id = _proposal_id;

  IF _opp_id IS NULL THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;
  IF _client <> auth.uid() THEN
    RAISE EXCEPTION 'Only the customer can accept this quote';
  END IF;

  IF _deal_memo_id IS NULL THEN
    INSERT INTO public.deal_memos (
      business_id,
      pro_user_id,
      client_user_id,
      client_email,
      client_phone,
      job_title,
      scope_of_work,
      total_amount_zar,
      status,
      accepted_at
    )
    VALUES (
      _business_id,
      _pro_id,
      auth.uid(),
      coalesce(nullif(_client_email, ''), lower(coalesce((auth.jwt() ->> 'email')::text, 'customer@sjoh.local'))),
      _client_phone,
      coalesce(nullif(_opp_title, ''), 'Sjoh job'),
      coalesce(nullif(_message, ''), nullif(_opp_description, ''), 'Scope to be confirmed between customer and provider.'),
      coalesce(_quote_amount, _opp_budget, 0),
      'accepted',
      now()
    )
    RETURNING id INTO _deal_memo_id;
  END IF;

  UPDATE public.proposals
     SET status = 'accepted'::public.proposal_status,
         deal_memo_id = _deal_memo_id,
         updated_at = now()
   WHERE id = _proposal_id;

  UPDATE public.proposals
     SET status = 'lost'::public.proposal_status,
         updated_at = now()
   WHERE opportunity_id = _opp_id
     AND id <> _proposal_id
     AND status IN ('pending'::public.proposal_status, 'shortlisted'::public.proposal_status);

  UPDATE public.opportunities
     SET status = 'awarded'::public.opportunity_status,
         updated_at = now()
   WHERE id = _opp_id
     AND status = 'open'::public.opportunity_status;

  RETURN QUERY
  SELECT _client_phone, _client_email, coalesce(_contact_preference, 'whatsapp');
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_deal_memo(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _client_email text;
  _client_user_id uuid;
  _status public.deal_memo_status;
  _viewer_email text := lower(coalesce((auth.jwt() ->> 'email')::text, ''));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to accept this quote';
  END IF;

  SELECT lower(client_email), client_user_id, status
    INTO _client_email, _client_user_id, _status
    FROM public.deal_memos
   WHERE id = _id;

  IF _client_email IS NULL THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;
  IF _client_user_id IS NOT NULL
     AND _client_user_id <> auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;
  IF _client_user_id IS NULL
     AND _client_email <> _viewer_email
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;
  IF _status <> 'pending' THEN
    RAISE EXCEPTION 'This quote is no longer pending';
  END IF;

  UPDATE public.deal_memos
     SET status = 'accepted',
         accepted_at = now(),
         client_user_id = auth.uid(),
         updated_at = now()
   WHERE id = _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_revealed_contact(_proposal_id uuid)
RETURNS TABLE(
  client_phone text,
  client_email text,
  contact_preference text,
  revealed boolean,
  reason text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _opp_id uuid;
  _provider uuid;
  _status text;
  _client_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT NULL::text, NULL::text, NULL::text, false, 'unauthenticated'::text;
    RETURN;
  END IF;

  SELECT p.opportunity_id, p.provider_id, p.status::text
    INTO _opp_id, _provider, _status
    FROM public.proposals p
   WHERE p.id = _proposal_id;

  IF _opp_id IS NULL THEN
    RETURN QUERY SELECT NULL::text, NULL::text, NULL::text, false, 'not_found'::text;
    RETURN;
  END IF;

  SELECT o.client_id
    INTO _client_id
    FROM public.opportunities o
   WHERE o.id = _opp_id;

  IF _client_id = auth.uid() THEN
    RETURN QUERY
      SELECT o.client_phone, o.client_email, o.contact_preference, true, 'owner'::text
      FROM public.opportunities o
      WHERE o.id = _opp_id;
    RETURN;
  END IF;

  IF _provider = auth.uid() AND _status = 'accepted' THEN
    RETURN QUERY
      SELECT o.client_phone, o.client_email, o.contact_preference, true, 'accepted'::text
      FROM public.opportunities o
      WHERE o.id = _opp_id;
    RETURN;
  END IF;

  RETURN QUERY SELECT NULL::text, NULL::text, NULL::text, false, 'locked'::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_proposal(uuid, uuid, text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_quote(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_deal_memo(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_revealed_contact(uuid) TO authenticated;
