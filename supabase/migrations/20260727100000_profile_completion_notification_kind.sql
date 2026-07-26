-- Allow the daily lifecycle job to record a profile-completion nudge, so it's
-- sent at most once per pro (UNIQUE (user_id, kind, anchor_date) does the
-- dedupe; anchor_date is the signup date).

ALTER TABLE public.billing_lifecycle_notifications
  DROP CONSTRAINT IF EXISTS billing_lifecycle_notifications_kind_check;

ALTER TABLE public.billing_lifecycle_notifications
  ADD CONSTRAINT billing_lifecycle_notifications_kind_check
  CHECK (kind IN ('renewal_3d', 'lapsed_10d', 'archived_30d', 'profile_incomplete_3d'));
