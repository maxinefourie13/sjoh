-- Redefine protect_proposal_fields to remove reference to dropped klaps_spent column
CREATE OR REPLACE FUNCTION public.protect_proposal_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _is_provider boolean := (new.provider_id = auth.uid());
BEGIN
  IF _is_provider OR public.has_role(auth.uid(), 'admin') THEN
    RETURN new;
  END IF;
  -- Non-provider (i.e., the opportunity owner) can only change `status`.
  new.opportunity_id := old.opportunity_id;
  new.business_id    := old.business_id;
  new.provider_id    := old.provider_id;
  new.message        := old.message;
  new.quote_amount   := old.quote_amount;
  new.created_at     := old.created_at;
  RETURN new;
END;
$$;
