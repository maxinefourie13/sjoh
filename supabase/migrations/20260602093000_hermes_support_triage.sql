-- Extend Hermes from lead QA into support triage.
-- Hermes still only classifies and drafts; it does not send replies or change accounts.

ALTER TABLE public.hermes_tasks
  DROP CONSTRAINT IF EXISTS hermes_tasks_task_type_check;

ALTER TABLE public.hermes_tasks
  ADD CONSTRAINT hermes_tasks_task_type_check
  CHECK (
    task_type IN (
      'source_url_check',
      'seed_page_scan',
      'lead_row_validate',
      'support_message_triage',
      'heartbeat'
    )
  );

ALTER TABLE public.hermes_findings
  DROP CONSTRAINT IF EXISTS hermes_findings_finding_type_check;

ALTER TABLE public.hermes_findings
  ADD CONSTRAINT hermes_findings_finding_type_check
  CHECK (
    finding_type IN (
      'prospect',
      'source_check',
      'seed_scan',
      'validation_report',
      'support_triage',
      'note'
    )
  );

CREATE INDEX IF NOT EXISTS idx_hermes_findings_support_triage
  ON public.hermes_findings(created_at DESC)
  WHERE finding_type = 'support_triage';
