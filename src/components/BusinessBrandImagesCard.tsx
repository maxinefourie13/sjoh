import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { compressIfImage } from "@/lib/compressImage";
import { cn } from "@/lib/utils";

type BrandImageKind = "logo" | "cover";

export interface BusinessBrandImages {
  logoUrl: string | null;
  coverUrl: string | null;
}

interface BusinessBrandImagesCardProps extends BusinessBrandImages {
  businessId?: string;
  variant?: "dashboard" | "onboarding";
  onChange?: (images: BusinessBrandImages) => void;
  onRequireAuth?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function BusinessBrandImagesCard({
  businessId,
  logoUrl,
  coverUrl,
  variant = "dashboard",
  onChange,
  onRequireAuth,
}: BusinessBrandImagesCardProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<BusinessBrandImages>({ logoUrl, coverUrl });
  const [uploading, setUploading] = useState<BrandImageKind | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages({ logoUrl, coverUrl });
  }, [logoUrl, coverUrl]);

  const chooseImage = (kind: BrandImageKind) => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    (kind === "logo" ? logoInputRef : coverInputRef).current?.click();
  };

  const uploadImage = async (kind: BrandImageKind, rawFile?: File) => {
    if (!rawFile || !user) return;
    if (!rawFile.type.startsWith("image/")) {
      toast({ title: "Please choose an image", description: "JPG, PNG or WebP works best.", variant: "destructive" });
      return;
    }

    setUploading(kind);
    try {
      const file = await compressIfImage(rawFile);
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("That image is still over 10MB after compression.");
      }

      // Stable paths let a pro replace either image without leaving old files
      // behind. The cache-busting query ensures the replacement appears now.
      const storagePath = `${user.id}/${kind}`;
      const { error: uploadError } = await supabase.storage
        .from("business-images")
        .upload(storagePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from("business-images").getPublicUrl(storagePath).data.publicUrl;
      const versionedUrl = `${publicUrl}?v=${Date.now()}`;
      const nextImages = {
        ...images,
        [kind === "logo" ? "logoUrl" : "coverUrl"]: versionedUrl,
      };

      if (businessId) {
        const updatePayload = kind === "logo"
          ? { logo_url: versionedUrl }
          : { image_url: versionedUrl };
        const { error: updateError } = await supabase
          .from("businesses")
          .update(updatePayload)
          .eq("id", businessId);
        if (updateError) throw updateError;
      }

      setImages(nextImages);
      onChange?.(nextImages);
      toast({
        title: kind === "logo" ? "Logo updated" : "Banner updated",
        description: businessId ? "The new image is live on your profile." : "We saved it for your new profile.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({ title: "Image didn't upload", description: message, variant: "destructive" });
    } finally {
      setUploading(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const content = (
    <>
      {variant === "dashboard" && (
        <div className="mb-5">
          <h2 className="font-display text-xl font-black tracking-tight">Logo & banner</h2>
          <p className="mt-1 text-sm text-ink-2">
            Use your real business logo and a wide photo that shows your work, team or shop.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[0.8fr_1.4fr]">
        <ImageUploadPanel
          kind="logo"
          title="Business logo"
          description="Square works best. Keep the mark clear and easy to recognise."
          imageUrl={images.logoUrl}
          uploading={uploading === "logo"}
          onChoose={() => chooseImage("logo")}
        />
        <ImageUploadPanel
          kind="cover"
          title="Profile banner"
          description="Choose a wide image of your work, premises or team."
          imageUrl={images.coverUrl}
          uploading={uploading === "cover"}
          onChoose={() => chooseImage("cover")}
        />
      </div>

      <input
        ref={logoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(event) => void uploadImage("logo", event.target.files?.[0])}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(event) => void uploadImage("cover", event.target.files?.[0])}
      />
    </>
  );

  if (variant === "onboarding") return <div>{content}</div>;

  return <div className="rounded-xl border border-border bg-card p-6">{content}</div>;
}

function ImageUploadPanel({
  kind,
  title,
  description,
  imageUrl,
  uploading,
  onChoose,
}: {
  kind: BrandImageKind;
  title: string;
  description: string;
  imageUrl: string | null;
  uploading: boolean;
  onChoose: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <button
        type="button"
        onClick={onChoose}
        disabled={uploading}
        aria-label={`${imageUrl ? "Replace" : "Upload"} ${title.toLowerCase()}`}
        className={cn(
          "group relative flex w-full items-center justify-center overflow-hidden border-b border-border bg-secondary/45 transition-colors hover:bg-secondary/70 disabled:cursor-wait",
          kind === "logo" ? "aspect-square max-h-64" : "aspect-[16/9]",
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} preview`}
            className={cn("size-full", kind === "logo" ? "object-contain p-5" : "object-cover")}
          />
        ) : (
          <div className="px-6 text-center text-muted-foreground">
            <ImagePlus className="mx-auto size-8" />
            <p className="mt-2 text-sm font-bold text-foreground">Add {kind === "logo" ? "your logo" : "a banner"}</p>
          </div>
        )}
        {uploading && (
          <span className="absolute inset-0 grid place-items-center bg-background/80">
            <Loader2 className="size-6 animate-spin text-primary" />
          </span>
        )}
      </button>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black">{title}</p>
          <span className={cn("inline-flex items-center gap-1 text-xs font-bold", imageUrl ? "text-sa-green" : "text-amber-700")}>
            {imageUrl ? <><Check className="size-3.5" strokeWidth={3} /> Added</> : "Still needed"}
          </span>
        </div>
        <p className="mt-1 min-h-8 text-xs leading-relaxed text-ink-2">{description}</p>
        <Button type="button" variant="outline" size="sm" className="mt-3 rounded-full" onClick={onChoose} disabled={uploading}>
          <Upload className="size-3.5" />
          {imageUrl ? "Replace" : "Upload"}
        </Button>
      </div>
    </div>
  );
}
