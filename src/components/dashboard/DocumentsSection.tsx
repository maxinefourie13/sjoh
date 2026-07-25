import { useCallback, useEffect, useState } from "react";
import { FileText, ReceiptText, Plus, Copy, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { StandaloneDocBuilder } from "@/components/dashboard/StandaloneDocBuilder";
import type { DocType } from "@/lib/invoice";

type DocRow = {
  id: string;
  doc_type: DocType;
  invoice_number: string;
  customer_name: string;
  total_zar: number;
  status: string | null;
  created_at: string;
  access_token: string | null;
};

const fmtZAR = (n: number) => "R " + Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2 });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

export const DocumentsSection = () => {
  const { user } = useAuth();
  const { business } = useMyBusiness();
  const [builder, setBuilder] = useState<DocType | null>(null);
  const [rows, setRows] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("invoices")
      .select("id, doc_type, invoice_number, customer_name, total_zar, status, created_at, access_token")
      .eq("pro_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data as DocRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const copyLink = async (token: string | null) => {
    if (!token) { toast({ title: "No shareable link yet", description: "Send it by email to generate a customer link." }); return; }
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/invoice/${token}`);
      toast({ title: "Link copied", description: "Paste it to your customer on WhatsApp or email." });
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Quotes &amp; Invoices</h1>
          <p className="text-sm text-ink-2 mt-1">
            Send a professional quote or invoice to any customer — no job or request needed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBuilder("quote")} disabled={!business}>
            <FileText className="size-4" /> New quote
          </Button>
          <Button onClick={() => setBuilder("invoice")} disabled={!business}>
            <ReceiptText className="size-4" /> New invoice
          </Button>
        </div>
      </header>

      {!business && (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-ink-2">
          Set up your business profile first, then you can send quotes and invoices from here.
        </div>
      )}

      {builder && business && (
        <StandaloneDocBuilder
          businessId={business.id}
          proUserId={user!.id}
          docType={builder}
          onClose={() => setBuilder(null)}
          onSaved={refresh}
        />
      )}

      {/* Explainer — make the capability unmissable */}
      {!builder && (
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => business && setBuilder("quote")}
            className="text-left rounded-2xl border-2 border-border p-5 hover:border-sa-peri hover:bg-sa-peri/5 transition-all disabled:opacity-60"
            disabled={!business}
          >
            <FileText className="size-6 text-sa-peri" />
            <p className="font-display font-extrabold text-base mt-3">Send a quote</p>
            <p className="text-sm text-ink-2 mt-1">Give a customer a polished estimate before the work starts.</p>
          </button>
          <button
            onClick={() => business && setBuilder("invoice")}
            className="text-left rounded-2xl border-2 border-border p-5 hover:border-sa-green hover:bg-sa-green/5 transition-all disabled:opacity-60"
            disabled={!business}
          >
            <ReceiptText className="size-6 text-sa-green" />
            <p className="font-display font-extrabold text-base mt-3">Send an invoice</p>
            <p className="text-sm text-ink-2 mt-1">Bill a customer with VAT, line items, and your logo. 0% commission.</p>
          </button>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-display text-lg font-extrabold mb-3">Recent documents</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-ink-2 py-8 justify-center">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-ink-2">
            Nothing yet. Your sent quotes and invoices will show up here.
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3 flex-wrap">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shrink-0",
                  r.doc_type === "quote" ? "bg-sa-peri/12 text-sa-peri" : "bg-sa-green/12 text-sa-green",
                )}>
                  {r.doc_type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{r.customer_name}</p>
                  <p className="text-xs text-ink-2 truncate">{r.invoice_number} · {fmtDate(r.created_at)}</p>
                </div>
                <span className="font-display font-extrabold tabular-nums">{fmtZAR(r.total_zar)}</span>
                <Button variant="ghost" size="sm" onClick={() => copyLink(r.access_token)} className="shrink-0">
                  <Copy className="size-3.5" /> Link
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
