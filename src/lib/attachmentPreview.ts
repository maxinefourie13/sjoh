import sjohPaintIcon from "@/assets/optimized/sjoh-icon-paint.webp";

type AttachmentPreview = {
  url: string;
  name?: string | null;
};

const LEGACY_SJOH_ICON_PATTERNS = [
  "untitled_project-8",
  "untitled project-8",
  "sjoh-icon",
  "sjoh_icon",
];

export const isLegacySjohIconAttachment = (attachment: AttachmentPreview) => {
  const haystack = `${attachment.name ?? ""} ${attachment.url}`.toLowerCase();
  return LEGACY_SJOH_ICON_PATTERNS.some((pattern) => haystack.includes(pattern));
};

export const getAttachmentPreviewSrc = (attachment: AttachmentPreview) =>
  isLegacySjohIconAttachment(attachment) ? sjohPaintIcon : attachment.url;
