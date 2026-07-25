-- Standalone quotes & invoices.
--
-- Two changes let a pro create a document without first winning a specific job:
--   1. doc_type distinguishes a QUOTE (estimate) from an INVOICE (tax doc).
--   2. deal_memo_id is already nullable, but make the intent explicit and add a
--      supporting index for the "documents not tied to a deal" dashboard list.
--
-- The existing INSERT policy already only checks pro ownership (not deal_memo),
-- so no policy change is needed for standalone rows.

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS doc_type text NOT NULL DEFAULT 'invoice'
    CHECK (doc_type IN ('invoice', 'quote'));

CREATE INDEX IF NOT EXISTS invoices_doc_type_idx ON public.invoices(doc_type);

-- Fast lookup for a pro's own documents, newest first, in the dashboard.
CREATE INDEX IF NOT EXISTS invoices_pro_created_idx
  ON public.invoices(pro_user_id, created_at DESC);
