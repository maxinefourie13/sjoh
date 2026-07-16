-- LAUNCH: retire pre-launch "workshop" mode.
-- New listings go live immediately; existing workshop listings flip to
-- active and are visible in the public directory.

alter table public.businesses
  alter column listing_status set default 'active';

update public.businesses
   set listing_status = 'active',
       pre_launch = false
 where listing_status = 'workshop';

update public.businesses
   set pre_launch = false
 where pre_launch = true;
