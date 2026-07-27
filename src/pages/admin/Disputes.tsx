import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldAlert, Search, Ban, Loader2, Plus, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SeoHead } from "@/components/SeoHead";

type DisputeStatus = "open" | "investigating" | "pro_suspended" | "data_provided" | "resolved" | "rejected";
type DisputeSeverity = "low" | "medium" | "high" | "critical";
type DisputeCategory = "fraud" | "no_show" | "poor_workmanship" | "safety" | "harassment" | "payment" | "identity" | "other";

interface Dispute {
  id: string;
  reference: string;
  reporter_email: string | null;
  reporter_name: string | null;
  business_id: string | null;
  pro_user_id: string | null;
  category: DisputeCategory;
  severity: DisputeSeverity;
  status: DisputeStatus;
  summary: string;
  details: string | null;
  pro_suspended_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

interface DisputeAction {
  id: string;
  action: string;
  notes: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

const STATUS_META: Record<DisputeStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  investigating: { label: "Investigating", className: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  pro_suspended: { label: "Pro Suspended", className: "bg-orange-500/15 text-orange-700 border-orange-500/30" },
  data_provided: { label: "Information Provided", className: "bg-purple-500/15 text-purple-700 border-purple-500/30" },
  resolved: { label: "Resolved", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  rejected: { label: "Rejected", className: "bg-muted text-muted-foreground border-border" },
};

const SEVERITY_META: Record<DisputeSeverity, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/15 text-amber-700",
  high: "bg-orange-500/15 text-orange-700",
  critical: "bg-destructive/15 text-destructive",
};

const CATEGORY_LABELS: Record<DisputeCategory, string> = {
  fraud: "Fraud",
  no_show: "No-show",
  poor_workmanship: "Poor workmanship",
  safety: "Safety",
  harassment: "Harassment",
  payment: "Payment",
  identity: "Identity",
  other: "Other",
};

const Disputes = () => {
  const { loading: rolesLoading, isAdmin } = useUserRoles();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [selected, setSelected] = useState<Dispute | null>(null);
  const [actions, setActions] = useState<DisputeAction[]>([]);
  const [actionsLoading, setActionsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load disputes", description: error.message, variant: "destructive" });
    } else {
      setDisputes((data || []) as Dispute[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  const loadActions = async (disputeId: string) => {
    setActionsLoading(true);
    const { data, error } = await (supabase as any)
      .from("dispute_actions")
      .select("*")
      .eq("dispute_id", disputeId)
      .order("created_at", { ascending: true });
    if (!error) setActions((data || []) as DisputeAction[]);
    setActionsLoading(false);
  };

  const openDetail = (d: Dispute) => {
    setSelected(d);
    loadActions(d.id);
  };

  const handleSuspend = async (d: Dispute) => {
    if (!confirm(`Suspend the pro linked to ${d.reference}? This hides them from the directory immediately.`)) return;
    setBusyId(d.id);
    const { error } = await (supabase as any).rpc("suspend_pro_from_dispute", {
      _dispute_id: d.id,
      _reason: "Suspended via Dispute Log",
    });
    setBusyId(null);
    if (error) {
      toast({ title: "Couldn't suspend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pro suspended", description: `${d.reference} marked as Pro Suspended.` });
      refresh();
      if (selected?.id === d.id) loadActions(d.id);
    }
  };

  const handleStatusChange = async (d: Dispute, status: DisputeStatus) => {
    setBusyId(d.id);
    const patch: Record<string, unknown> = { status };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    const { error } = await (supabase as any).from("disputes").update(patch).eq("id", d.id);
    if (!error) {
      await (supabase as any).from("dispute_actions").insert({
        dispute_id: d.id,
        actor_id: (await supabase.auth.getUser()).data.user?.id,
        action: `status_changed_to_${status}`,
        notes: `Status set to ${STATUS_META[status].label}`,
      });
    }
    setBusyId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      refresh();
      if (selected?.id === d.id) loadActions(d.id);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return disputes.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!q) return true;
      return [d.reference, d.summary, d.reporter_email, d.reporter_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [disputes, search, statusFilter]);

  const stats = useMemo(() => {
    const open = disputes.filter((d) => ["open", "investigating"].includes(d.status)).length;
    const suspended = disputes.filter((d) => d.status === "pro_suspended").length;
    return { total: disputes.length, open, suspended };
  }, [disputes]);

  if (rolesLoading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </SiteLayout>
    );
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <SiteLayout>
      <SeoHead title="Dispute Log | Sjoh Admin" description="Compliance-grade dispute log for Sjoh admins." noindex />
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Compliance</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight">Dispute Log</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Every complaint and every action is recorded for review. Suspend quickly and document the outcome.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Log a Dispute
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Open / Investigating" value={stats.open} tone="amber" />
          <StatCard label="Pros Suspended" value={stats.suspended} tone="orange" />
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference, email, summary…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DisputeStatus | "all")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No disputes match. {disputes.length === 0 ? "Quiet day at compliance." : ""}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Reporter</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Filed</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => openDetail(d)}>
                      <td className="px-4 py-3 font-mono text-xs">{d.reference}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{d.reporter_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{d.reporter_email || "—"}</div>
                      </td>
                      <td className="px-4 py-3">{CATEGORY_LABELS[d.category]}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", SEVERITY_META[d.severity])}>
                          {d.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("font-medium", STATUS_META[d.status].className)}>
                          {STATUS_META[d.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(d.created_at).toLocaleDateString("en-ZA")}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {!d.pro_suspended_at && d.business_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-orange-700 hover:text-orange-800 hover:bg-orange-500/10"
                              disabled={busyId === d.id}
                              onClick={() => handleSuspend(d)}
                              title="Suspend pro"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-mono text-lg">{selected.reference}</DialogTitle>
                  <Badge variant="outline" className={cn("font-medium", STATUS_META[selected.status].className)}>
                    {STATUS_META[selected.status].label}
                  </Badge>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", SEVERITY_META[selected.severity])}>
                    {selected.severity}
                  </span>
                </div>
                <DialogDescription>{CATEGORY_LABELS[selected.category]} · filed {new Date(selected.created_at).toLocaleString("en-ZA")}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Field label="Summary" value={selected.summary} />
                {selected.details && <Field label="Details" value={selected.details} />}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Reporter" value={`${selected.reporter_name || "—"}\n${selected.reporter_email || "—"}`} />
                  <Field
                    label="Compliance timeline"
                    value={[
                      `Filed: ${new Date(selected.created_at).toLocaleString("en-ZA")}`,
                      selected.pro_suspended_at && `Pro suspended: ${new Date(selected.pro_suspended_at).toLocaleString("en-ZA")}`,
                    ].filter(Boolean).join("\n")}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                  <Select
                    value={selected.status}
                    onValueChange={(v) => handleStatusChange(selected, v as DisputeStatus)}
                  >
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selected.pro_suspended_at && selected.business_id && (
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => handleSuspend(selected)}>
                      <Ban className="h-4 w-4" /> Suspend pro
                    </Button>
                  )}
                  {selected.business_id && (
                    <Button size="sm" variant="ghost" asChild className="gap-2">
                      <a href={`/business/${selected.business_id}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" /> Pro
                      </a>
                    </Button>
                  )}
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Audit trail</h4>
                  {actionsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  ) : actions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No actions logged yet.</div>
                  ) : (
                    <ol className="space-y-2 border-l-2 border-border pl-4">
                      {actions.map((a) => (
                        <li key={a.id} className="text-sm">
                          <div className="font-mono text-xs text-muted-foreground">
                            {new Date(a.created_at).toLocaleString("en-ZA")}
                          </div>
                          <div className="font-medium">{a.action.replace(/_/g, " ")}</div>
                          {a.notes && <div className="text-muted-foreground">{a.notes}</div>}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreateDisputeDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={refresh} />
    </SiteLayout>
  );
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone?: "amber" | "orange" | "purple" }) => {
  const toneClass =
    tone === "amber" ? "text-amber-700" :
    tone === "orange" ? "text-orange-700" :
    tone === "purple" ? "text-purple-700" : "text-foreground";
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-2xl font-extrabold mt-1", toneClass)}>{value}</div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
    <div className="text-sm whitespace-pre-wrap">{value}</div>
  </div>
);

const CreateDisputeDialog = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) => {
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [category, setCategory] = useState<DisputeCategory>("other");
  const [severity, setSeverity] = useState<DisputeSeverity>("medium");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSummary(""); setDetails(""); setReporterEmail(""); setReporterName("");
    setBusinessId(""); setCategory("other"); setSeverity("medium");
  };

  const submit = async () => {
    if (!summary.trim()) {
      toast({ title: "Summary required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;
    let proUserId: string | null = null;
    if (businessId) {
      const { data: biz } = await (supabase as any).from("businesses").select("owner_id").eq("id", businessId).maybeSingle();
      proUserId = biz?.owner_id || null;
    }
    const { error } = await (supabase as any).from("disputes").insert({
      reporter_id: user?.id,
      reporter_email: reporterEmail || null,
      reporter_name: reporterName || null,
      business_id: businessId || null,
      pro_user_id: proUserId,
      category,
      severity,
      summary,
      details: details || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't log dispute", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dispute logged", description: "Compliance trail started." });
      reset();
      onOpenChange(false);
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Log a Dispute</DialogTitle>
          <DialogDescription>Record a complaint received via email, phone, social, or in-app.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Reporter name</label>
              <Input value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Reporter email</label>
              <Input type="email" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Business ID (optional)</label>
            <Input value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="UUID of the pro's business" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as DisputeCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Severity</label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as DisputeSeverity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Summary *</label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One-line description" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Details</label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Log dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Disputes;
