import { useState } from "react";
import { MessageSquarePlus, Megaphone, ClipboardList, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UPDATE_TYPE_LABELS } from "../domains";
import type { ChildUpdate, UpdateType } from "../types";
import { useAddUpdate } from "../api";

const ICONS: Record<UpdateType, typeof Sparkles> = {
  progress: Sparkles,
  therapy_note: ClipboardList,
  announcement: Megaphone,
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

function AddUpdate({ childId }: { childId: string }) {
  const [type, setType] = useState<UpdateType>("progress");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const add = useAddUpdate(childId);

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    add.mutate(
      { type, title: title.trim(), body: body.trim() },
      {
        onSuccess: () => {
          toast({ title: "Update posted", description: "Parents can see this now." });
          setTitle(""); setBody("");
        },
        onError: (e) =>
          toast({ title: "Could not post", description: String((e as Error).message), variant: "destructive" }),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 font-medium">
          <MessageSquarePlus className="h-4 w-4 text-indigo-500" /> Post an update to parents
        </div>
        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as UpdateType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(UPDATE_TYPE_LABELS) as UpdateType[]).map((t) => (
                  <SelectItem key={t} value={t}>{UPDATE_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Great week with scissor skills" />
          </div>
        </div>
        <div>
          <Label>Message</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Share what happened and what parents can do at home." />
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={add.isPending || !title.trim() || !body.trim()}>Post update</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function UpdatesPanel({
  childId, updates, canEdit,
}: {
  childId: string;
  updates: ChildUpdate[];
  canEdit: boolean;
}) {
  return (
    <div className="space-y-3">
      {canEdit && <AddUpdate childId={childId} />}
      {updates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No updates yet.
          </CardContent>
        </Card>
      ) : (
        <ol className="relative space-y-3 border-l pl-5">
          {updates.map((u) => {
            const Icon = ICONS[u.type];
            return (
              <li key={u.id} className="relative">
                <span className="absolute -left-[27px] grid h-5 w-5 place-items-center rounded-full bg-indigo-500 text-white">
                  <Icon className="h-3 w-3" />
                </span>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{u.title}</p>
                      <Badge variant="secondary">{UPDATE_TYPE_LABELS[u.type]}</Badge>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{u.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{fmt(u.created_at)}</p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
