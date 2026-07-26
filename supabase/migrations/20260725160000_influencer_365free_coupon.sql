-- Influencer / partner code: one year of Verified Pro free.
--
-- 365FREE behaves exactly like FRIENDS365 — the table-driven redeem_trial_code
-- function grants verified_pro for 365 days from the moment it's redeemed
-- (the partner's start date), then it expires. Once per user, same as every
-- other coupon. No function change needed; this just adds the row.

INSERT INTO public.coupon_codes (code, tier, trial_days, active)
VALUES ('365FREE', 'verified_pro'::public.sjoh_tier, 365, true)
ON CONFLICT (code) DO UPDATE SET
  tier = EXCLUDED.tier,
  trial_days = EXCLUDED.trial_days,
  active = EXCLUDED.active;
