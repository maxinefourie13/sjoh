import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { isPlaceholderAvatar } from "@/lib/placeholderAvatar";

const POLISH_DISMISS_KEY = "sjoh_profile_polish_dismissed_at";
const POLISH_REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Two-in-one nudge for the dashboard:
 * 1. HARD warning — profile is hidden from the public directory because the
 *    `businesses_public` view filter excludes records with no photo or a
 *    short/empty bio.
 * 2. SOFT polish nudge — profile is visible but missing nice-to-haves
 *    (logo/cover or gallery photos). Dismissible and re-appears after 7 days.
 */
export const ProfileVisibilityWarning = () => {
  const { user } = useAuth();
  const [hardIssues, setHardIssues] = useState<{ noPhoto: boolean; shortBio: boolean } | null>(null);
  const [showPolish, setShowPolish] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("businesses")
        .select("id, image_url, description")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (cancelled || !data) return;

      // A generated placeholder still satisfies the directory view, so it is a
      // polish nudge (below), never a "you are hidden" alarm.
      const noPhoto = !data.image_url || data.image_url.trim() === "";
      const shortBio = (data.description ?? "").trim().length <= 20;
      if (noPhoto || shortBio) {
        setHardIssues({ noPhoto, shortBio });
        return;
      }
      setHardIssues(null);

      // Profile is visible — check polish-level gaps (gallery count, and
      // whether they're still on the generated initials avatar from signup).
      const { count } = await supabase
        .from("business_images")
        .select("id", { count: "exact", head: true })
        .eq("business_id", data.id);

      const fewGalleryPhotos = (count ?? 0) < 3;
      if (!fewGalleryPhotos && !isPlaceholderAvatar(data.image_url)) return;

      // Respect the user's "remind me later" timer.
      try {
        const dismissedAt = Number(localStorage.getItem(POLISH_DISMISS_KEY) ?? 0);
        if (dismissedAt && Date.now() - dismissedAt < POLISH_REMIND_AFTER_MS) return;
      } catch { /* ignore */ }

      if (!cancelled) setShowPolish(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const dismissPolish = () => {
    try { localStorage.setItem(POLISH_DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setShowPolish(false);
  };

  if (hardIssues) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/5 p-4 md:p-5 flex items-start gap-3">
        <AlertTriangle className="size-5 text-accent shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="flex-1">
          <p className="font-display font-extrabold text-base">
            Your profile is currently hidden from search.
          </p>
          <p className="text-sm text-ink-2 mt-1">
            {hardIssues.noPhoto && hardIssues.shortBio
              ? "Upload a photo and write a bio (more than 20 characters) to go live."
              : hardIssues.noPhoto
                ? "Upload a profile photo to go live in the directory."
                : "Add a bio (more than 20 characters) so customers know who you are."}
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link to="/dashboard?section=profile">Complete your profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (showPolish) {
    return (
      <div className="relative rounded-2xl border border-primary/30 bg-primary-light/40 p-4 md:p-5 flex items-start gap-3">
        <Sparkles className="size-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="flex-1">
          <p className="font-display font-extrabold text-base">
            Want more leads? Polish your profile.
          </p>
          <p className="text-sm text-ink-2 mt-1 leading-relaxed">
            A logo, cover photo, a few gallery shots and your exact service area make people
            way more likely to message you. No designer?{" "}
            <Link to="/directory?category=graphic-design" className="text-primary font-semibold hover:underline">
              Find a designer on Sjoh →
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/dashboard?section=profile">Add now</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={dismissPolish}>
              Remind me later
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissPolish}
          aria-label="Dismiss"
          className="absolute top-2 right-2 p-1 text-ink-2 hover:text-foreground rounded"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return null;
};
