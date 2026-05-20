-- Hermes lead research worker schema.
-- Codex remains the orchestrator; hosted Hermes workers process bounded tasks
-- and write source-backed findings for human review.

CREATE TABLE IF NOT EXISTS public.hermes_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hermes_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.hermes_campaigns(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL
    CHECK (task_type IN ('source_url_check', 'seed_page_scan', 'lead_row_validate', 'heartbeat')),
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  priority INT NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  error_message TEXT,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hermes_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.hermes_campaigns(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.hermes_tasks(id) ON DELETE SET NULL,
  finding_type TEXT NOT NULL
    CHECK (finding_type IN ('prospect', 'source_check', 'seed_scan', 'validation_report', 'note')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'needs_review', 'approved', 'rejected', 'imported')),
  business_name TEXT,
  category TEXT,
  city_area TEXT,
  province TEXT,
  country TEXT NOT NULL DEFAULT 'South Africa',
  source_name TEXT,
  source_url TEXT,
  source_checked_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contact_type TEXT
    CHECK (
      contact_type IS NULL OR contact_type IN (
        'no_email_found',
        'generic_business_email',
        'named_or_role_business_email',
        'consumer_or_named_email'
      )
    ),
  popia_consent_status TEXT NOT NULL DEFAULT 'not_contacted_consent_required',
  email_marketing_allowed_now TEXT NOT NULL DEFAULT 'No'
    CHECK (email_marketing_allowed_now IN ('Yes', 'No')),
  allowed_next_step TEXT,
  confidence_score NUMERIC(3,2)
    CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hermes_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hermes_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hermes_findings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS hermes_campaigns_set_updated_at ON public.hermes_campaigns;
CREATE TRIGGER hermes_campaigns_set_updated_at
  BEFORE UPDATE ON public.hermes_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS hermes_tasks_set_updated_at ON public.hermes_tasks;
CREATE TRIGGER hermes_tasks_set_updated_at
  BEFORE UPDATE ON public.hermes_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS hermes_findings_set_updated_at ON public.hermes_findings;
CREATE TRIGGER hermes_findings_set_updated_at
  BEFORE UPDATE ON public.hermes_findings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_hermes_campaigns_status
  ON public.hermes_campaigns(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hermes_tasks_claim
  ON public.hermes_tasks(status, next_run_at, priority DESC, created_at)
  WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_hermes_tasks_campaign
  ON public.hermes_tasks(campaign_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hermes_findings_review
  ON public.hermes_findings(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hermes_findings_source_url
  ON public.hermes_findings(source_url);

DO $$ BEGIN
  CREATE POLICY "Service role can manage Hermes campaigns"
    ON public.hermes_campaigns FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage Hermes campaigns"
    ON public.hermes_campaigns FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage Hermes tasks"
    ON public.hermes_tasks FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage Hermes tasks"
    ON public.hermes_tasks FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage Hermes findings"
    ON public.hermes_findings FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage Hermes findings"
    ON public.hermes_findings FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.claim_hermes_task(_worker_id TEXT)
RETURNS public.hermes_tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _task public.hermes_tasks%ROWTYPE;
BEGIN
  UPDATE public.hermes_tasks
  SET
    status = 'running',
    locked_by = _worker_id,
    locked_at = now(),
    attempts = attempts + 1,
    error_message = NULL,
    updated_at = now()
  WHERE id = (
    SELECT id
    FROM public.hermes_tasks
    WHERE status = 'queued'
      AND next_run_at <= now()
    ORDER BY priority DESC, created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING * INTO _task;

  RETURN _task;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_hermes_task(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_hermes_task(TEXT) TO service_role;
