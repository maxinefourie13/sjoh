/**
 * Generates a branded initials avatar as an inline SVG data URI.
 *
 * The `businesses_public` view hides any listing whose `image_url` is null or
 * empty, so a pro without a logo used to be invisible in the directory. Rather
 * than block signup on an upload nobody has ready, every listing gets one of
 * these immediately — the profile is live from the first second, and a real
 * logo simply replaces it later.
 */

// Brand palette (see :root in index.css). Deep enough for white text on top.
const PALETTE = [
  { bg: "#0A2463", fg: "#FFFFFF" }, // navy
  { bg: "#0B6E3A", fg: "#FFFFFF" }, // green
  { bg: "#6B7CE8", fg: "#FFFFFF" }, // periwinkle
  { bg: "#E83E8C", fg: "#FFFFFF" }, // pink
  { bg: "#F5A623", fg: "#1A1A1A" }, // gold — dark text for contrast
];

/** Stable string hash so a business always gets the same colour. */
const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/** "Cape Town Plumbing Co" -> "CP"; "Sizwe" -> "SI". */
export const initialsFrom = (name: string): string => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w));
  if (words.length === 0) return "SJ";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Returns an SVG data URI. Kept small (~400 bytes) so it can live directly in
 * the `image_url` column without a storage round-trip.
 */
export const placeholderAvatar = (name: string): string => {
  const initials = initialsFrom(name);
  const { bg, fg } = PALETTE[hash(name || "sjoh") % PALETTE.length];

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">`,
    `<rect width="400" height="400" fill="${bg}"/>`,
    `<circle cx="330" cy="70" r="150" fill="${fg}" opacity="0.06"/>`,
    `<text x="200" y="200" fill="${fg}" font-family="Georgia,'Times New Roman',serif"`,
    ` font-size="170" font-weight="700" text-anchor="middle" dominant-baseline="central">${initials}</text>`,
    `</svg>`,
  ].join("");

  // encodeURIComponent (not btoa) keeps this safe for any non-ASCII business name.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * True when the stored image is one of our generated placeholders — used to
 * keep nudging pros toward a real photo without calling their profile broken.
 */
export const isPlaceholderAvatar = (url: string | null | undefined): boolean =>
  !!url && url.startsWith("data:image/svg+xml");
