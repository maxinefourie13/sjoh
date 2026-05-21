-- PayFast is the active launch payment provider.
-- Older pre-launch migrations added this column with a Paystack default; keep
-- legacy rows intact, but make new events identify the current provider.
ALTER TABLE public.payment_events
  ALTER COLUMN provider SET DEFAULT 'payfast';

UPDATE public.payment_events
SET provider = 'payfast'
WHERE payfast_pf_payment_id IS NOT NULL
  AND provider = 'paystack';
