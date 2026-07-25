/**
 * Signup should never stall on a blank textarea.
 *
 * The `businesses_public` view requires a description longer than 20
 * characters, so an empty bio means an invisible listing. Instead of demanding
 * that a pro write copy on the spot, we let them tap a few true statements and
 * compose a sentence from them — and if they skip entirely, we synthesise a
 * plain, accurate line from what they already told us.
 */

/** Tap-to-add traits. Deliberately short, concrete, and true-or-not-true. */
export const BIO_TRAITS: readonly string[] = [
  "Free quotes",
  "Same-day callouts",
  "Available weekends",
  "10+ years experience",
  "Own transport",
  "Fully insured",
  "Emergency work",
  "Guaranteed workmanship",
  "Cash or EFT",
  "References on request",
];

/**
 * Builds a description from the trade, place, and any traits tapped.
 * Always returns well over 20 characters once a category and city are known.
 */
export const composeBio = (opts: {
  categoryName?: string;
  city?: string;
  province?: string;
  traits?: string[];
}): string => {
  const { categoryName, city, province, traits = [] } = opts;

  const trade = (categoryName ?? "Local services").toLowerCase();
  const place = city?.trim() || province?.trim() || "South Africa";

  const opener = `${categoryName ?? "Local services"} in ${place} and the surrounding areas.`;
  const promise = `Reliable ${trade} work, quoted honestly and done properly.`;

  if (traits.length === 0) return `${opener} ${promise}`;

  // "Free quotes, same-day callouts and own transport."
  const lowered = traits.map((t, i) => (i === 0 ? t : t.toLowerCase()));
  const list =
    lowered.length === 1
      ? lowered[0]
      : `${lowered.slice(0, -1).join(", ")} and ${lowered[lowered.length - 1]}`;

  return `${opener} ${list}. ${promise}`;
};
