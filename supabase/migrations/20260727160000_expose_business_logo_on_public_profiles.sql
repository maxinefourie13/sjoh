-- Keep the wide profile banner (`image_url`) separate from the square business
-- logo (`logo_url`) while exposing both through the sanitised public view.
-- logo_url is appended to preserve the existing view column order.
CREATE OR REPLACE VIEW public.businesses_public
WITH (security_invoker = true) AS
SELECT
  b.id, b.owner_id, b.slug, b.name,
  b.category_slug, b.category_name,
  b.province, b.city, b.address, b.website,
  b.description, b.tags, b.hours, b.image_url,
  b.plan, b.is_verified, b.certified_pro, b.certifications,
  b.rating, b.review_count, b.followers_count, b.response_rate,
  b.pre_launch, b.created_at, b.updated_at,
  b.logo_url
FROM public.businesses b
WHERE b.is_suspended = false
  AND b.image_url IS NOT NULL
  AND b.image_url <> ''
  AND char_length(coalesce(b.description, '')) > 20;

GRANT SELECT ON public.businesses_public TO anon, authenticated;
