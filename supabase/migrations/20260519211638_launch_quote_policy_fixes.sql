-- Launch quote flow primitives.
-- `accepted` is used by the app when a customer accepts a provider quote.
ALTER TYPE public.proposal_status ADD VALUE IF NOT EXISTS 'accepted';

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS deal_memo_id uuid REFERENCES public.deal_memos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_proposals_deal_memo
  ON public.proposals(deal_memo_id)
  WHERE deal_memo_id IS NOT NULL;
