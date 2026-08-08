import { ShoppingBag, Sparkles, Check, X, ExternalLink, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { domainLabel } from "../domains";
import { formatRand, suggestPacks } from "../packLogic";
import type { Goal, Pack, PackRecommendation } from "../types";
import { useRecommendPack, useSetRecommendationStatus } from "../api";

function PackHead({ pack }: { pack: Pack }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold">{pack.name}</p>
        {pack.description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{pack.description}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
          {pack.focus_areas.map((f) => (
            <Badge key={f} variant="outline" className="text-xs">{domainLabel(f)}</Badge>
          ))}
        </div>
      </div>
      <span className="shrink-0 font-semibold tabular-nums">{formatRand(pack.price_cents)}</span>
    </div>
  );
}

function RecommendationCard({
  rec, childId, canEdit,
}: {
  rec: PackRecommendation;
  childId: string;
  canEdit: boolean;
}) {
  const setStatus = useSetRecommendationStatus(childId);
  const pack = rec.pack;
  if (!pack) return null;

  return (
    <Card className={rec.status === "dismissed" ? "opacity-60" : undefined}>
      <CardContent className="space-y-3 p-4">
        <PackHead pack={pack} />
        {rec.reason && (
          <p className="rounded-md bg-muted/60 px-3 py-2 text-sm">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-indigo-500" />
            {rec.reason}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {rec.status === "purchased" ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-500"><Check className="mr-1 h-3 w-3" /> Purchased</Badge>
          ) : rec.status === "dismissed" ? (
            <Badge variant="secondary">Dismissed</Badge>
          ) : (
            <>
              {pack.url && (
                <Button asChild size="sm">
                  <a
                    href={pack.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setStatus.mutate({ id: rec.id, status: "purchased" })}
                  >
                    <ShoppingBag className="mr-1 h-4 w-4" /> Buy this pack
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setStatus.mutate(
                    { id: rec.id, status: "purchased" },
                    { onSuccess: () => toast({ title: "Marked as purchased" }) },
                  )
                }
              >
                <Check className="mr-1 h-4 w-4" /> Already have it
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus.mutate({ id: rec.id, status: "dismissed" })}
              >
                <X className="mr-1 h-4 w-4" /> Not now
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestionCard({
  childId, pack, reason,
}: {
  childId: string;
  pack: Pack;
  reason: string;
}) {
  const recommend = useRecommendPack(childId);
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-3 p-4">
        <PackHead pack={pack} />
        <p className="text-sm text-muted-foreground">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-indigo-500" />
          Auto-match: {reason}
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={recommend.isPending}
          onClick={() =>
            recommend.mutate(
              { pack_id: pack.id, reason, source: "auto" },
              { onSuccess: () => toast({ title: "Recommended to parents" }) },
            )
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Recommend to parents
        </Button>
      </CardContent>
    </Card>
  );
}

export function PacksPanel({
  childId, goals, recommendations, packs, canEdit,
}: {
  childId: string;
  goals: Goal[];
  recommendations: PackRecommendation[];
  packs: Pack[];
  canEdit: boolean;
}) {
  const recommendedIds = new Set(recommendations.map((r) => r.pack_id));
  const suggestions = canEdit ? suggestPacks(goals, packs, recommendedIds) : [];
  const active = recommendations.filter((r) => r.status !== "dismissed");
  const dismissed = recommendations.filter((r) => r.status === "dismissed");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="h-4 w-4 text-indigo-500" /> Recommended home-support packs
        </h2>
        {active.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No packs recommended yet.
              {canEdit ? " Suggestions matched to lagging goals appear below." : " The team will suggest packs as goals develop."}
            </CardContent>
          </Card>
        ) : (
          active.map((r) => <RecommendationCard key={r.id} rec={r} childId={childId} canEdit={canEdit} />)
        )}
      </div>

      {canEdit && suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Suggested by progress ({suggestions.length})
          </h3>
          {suggestions.map((s) => (
            <SuggestionCard key={s.pack.id} childId={childId} pack={s.pack} reason={s.reason} />
          ))}
        </div>
      )}

      {dismissed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Dismissed</h3>
          {dismissed.map((r) => (
            <RecommendationCard key={r.id} rec={r} childId={childId} canEdit={canEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
