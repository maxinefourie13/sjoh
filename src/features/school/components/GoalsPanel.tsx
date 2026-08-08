import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { DOMAINS, GOAL_STATUS_LABELS, domainLabel } from "../domains";
import type { Goal, GoalStatus } from "../types";
import { useEnsureIep, useUpdateGoalProgress, useUpsertGoal } from "../api";

const STATUSES: GoalStatus[] = ["not_started", "emerging", "developing", "achieved", "on_hold"];

function GoalRow({ goal, canEdit, childId }: { goal: Goal; canEdit: boolean; childId: string }) {
  const [progress, setProgress] = useState(goal.progress);
  const [status, setStatus] = useState<GoalStatus>(goal.status);
  const save = useUpdateGoalProgress(childId);
  const dirty = progress !== goal.progress || status !== goal.status;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{domainLabel(goal.domain)}</Badge>
              <Badge variant={goal.status === "achieved" ? "default" : "secondary"}>
                {GOAL_STATUS_LABELS[goal.status]}
              </Badge>
            </div>
            <p className="mt-2 font-medium">{goal.title}</p>
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}
            {(goal.baseline || goal.target) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {goal.baseline && <>Baseline: {goal.baseline}. </>}
                {goal.target && <>Target: {goal.target}.</>}
              </p>
            )}
          </div>
          <span className="shrink-0 text-lg font-semibold tabular-nums">{progress}%</span>
        </div>

        <Progress value={progress} />

        {canEdit && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Slider
              className="min-w-[160px] flex-1"
              value={[progress]}
              max={100}
              step={5}
              onValueChange={(v) => setProgress(v[0])}
            />
            <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{GOAL_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!dirty || save.isPending}
              onClick={() =>
                save.mutate(
                  { id: goal.id, progress, status },
                  { onSuccess: () => toast({ title: "Progress saved" }) },
                )
              }
            >
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddGoalDialog({ childId, iepId }: { childId: string; iepId: string | null }) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState(DOMAINS[0].key);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [baseline, setBaseline] = useState("");
  const [target, setTarget] = useState("");
  const ensureIep = useEnsureIep();
  const upsert = useUpsertGoal(childId);
  const saving = ensureIep.isPending || upsert.isPending;

  const submit = async () => {
    if (!title.trim()) return;
    try {
      let id = iepId;
      if (!id) id = (await ensureIep.mutateAsync(childId)).id;
      await upsert.mutateAsync({
        iep_id: id,
        domain,
        title: title.trim(),
        description: description.trim() || undefined,
        baseline: baseline.trim() || undefined,
        target: target.trim() || undefined,
      });
      toast({ title: "Goal added" });
      setTitle(""); setDescription(""); setBaseline(""); setTarget("");
      setOpen(false);
    } catch (e) {
      toast({ title: "Could not add goal", description: String((e as Error).message), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> Add goal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add an IEP goal</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Domain</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOMAINS.map((d) => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Goal</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Uses 2-word phrases to request" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Baseline</Label>
              <Input value={baseline} onChange={(e) => setBaseline(e.target.value)} />
            </div>
            <div>
              <Label>Target</Label>
              <Input value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving || !title.trim()}>Add goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GoalsPanel({
  childId, iepId, goals, canEdit,
}: {
  childId: string;
  iepId: string | null;
  goals: Goal[];
  canEdit: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Target className="h-4 w-4 text-indigo-500" /> IEP goals
        </h2>
        {canEdit && <AddGoalDialog childId={childId} iepId={iepId} />}
      </div>
      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No goals yet.{canEdit ? " Add the first goal to start tracking progress." : ""}
          </CardContent>
        </Card>
      ) : (
        goals.map((g) => <GoalRow key={g.id} goal={g} canEdit={canEdit} childId={childId} />)
      )}
    </div>
  );
}
