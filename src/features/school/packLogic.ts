// Pure logic for auto-suggesting supplementary packs from a child's goals.
// Kept side-effect free so it can be unit tested.
import type { Goal, Pack } from "./types";
import { LAGGING_THRESHOLD, domainLabel } from "./domains";

/** Domains where the child has at least one goal still below target. */
export function laggingDomains(goals: Goal[]): string[] {
  const lagging = new Set<string>();
  for (const g of goals) {
    if (g.status === "achieved") continue;
    if (g.progress < LAGGING_THRESHOLD || g.status === "emerging" || g.status === "not_started") {
      lagging.add(g.domain);
    }
  }
  return [...lagging];
}

export interface PackSuggestion {
  pack: Pack;
  matchedDomains: string[];
  reason: string;
}

/**
 * Suggest active packs whose focus areas overlap the child's lagging domains,
 * excluding packs already recommended. Ranked by number of matched domains.
 */
export function suggestPacks(
  goals: Goal[],
  packs: Pack[],
  alreadyRecommendedPackIds: Set<string>,
): PackSuggestion[] {
  const lagging = new Set(laggingDomains(goals));
  if (lagging.size === 0) return [];

  const suggestions: PackSuggestion[] = [];
  for (const pack of packs) {
    if (!pack.active) continue;
    if (alreadyRecommendedPackIds.has(pack.id)) continue;
    const matched = pack.focus_areas.filter((d) => lagging.has(d));
    if (matched.length === 0) continue;
    suggestions.push({
      pack,
      matchedDomains: matched,
      reason: reasonFor(matched),
    });
  }

  return suggestions.sort((a, b) => b.matchedDomains.length - a.matchedDomains.length);
}

export function reasonFor(matchedDomains: string[]): string {
  const labels = matchedDomains.map(domainLabel);
  const list =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
  return `Supports ${list} goals that are still developing.`;
}

/** Overall progress = mean of goal progress (0 when no goals). */
export function overallProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const sum = goals.reduce((acc, g) => acc + g.progress, 0);
  return Math.round(sum / goals.length);
}

export function formatRand(cents: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
