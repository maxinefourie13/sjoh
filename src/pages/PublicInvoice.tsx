import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, FileText, Loader2, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/SeoHead";
import { supabase } from "@/integrations/supabase/client";

type InvoiceResponse = {
  invoice: {
    invoice_number: string;
    doc_type?: "invoice" | "quote";
    customer_name: string;
    line_items: Array<{ description: string; qty: number; unit_price: number }>;
    subtotal_zar: number;
    vat_zar: number;
    total_zar: number;
    vat_included: boolean;
    notes: string | null;
    issued_at: string;
    sent_at: string | null;
    business: { name: string; email?: string | null; phone?: string | null; city?: string | null; province?: string | null } | null;
  };
  signedUrl: string;
};

const fmtZar = (n: number) =>
  `R ${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PublicInvoice = () => {
  const { token } = useParams();
  const [data, setData] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("invoice-download", {
        body: { token },
      });
      if (cancelled) return;
      if (error || data?.error) {
        setError(data?.error ?? error?.message ?? "Could not load this invoice.");
        setData(null);
      } else {
        setData(data as InvoiceResponse);
        setError(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <SiteLayout>
      <SeoHead title="Invoice · Sjoh" description="View and download your Sjoh invoice securely." noindex />
      <main className="min-h-[70vh] bg-[#050505] px-4 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-center">
              <Loader2 className="mx-auto size-8 animate-spin text-sa-gold" />
              <p className="mt-4 text-white/70">Loading your invoice…</p>
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-center">
              <FileText className="mx-auto size-9 text-white/40" />
              <h1 className="mt-4 font-display text-3xl font-black">Invoice link unavailable</h1>
              <p className="mx-auto mt-2 max-w-md text-white/60">{error}</p>
              <Button asChild className="mt-6 rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90">
                <Link to="/">Back to Sjoh</Link>
              </Button>
            </div>
          ) : data ? (
            (() => {
            const isQuote = data.invoice.doc_type === "quote";
            const docWord = isQuote ? "quote" : "invoice";
            const totalLabel = isQuote ? "Quoted total" : "Total due";
            return (
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white text-sa-dark shadow-pop">
              <div className="h-2 bg-gradient-to-r from-[#F5A623] via-[#DC2828] via-[#0A2463] via-[#0B6E3A] via-[#6B7CE8] to-[#E83E8C]" />
              <div className="bg-[#101010] p-7 text-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-gold">Secure Sjoh {docWord}</p>
                    <h1 className="mt-2 font-display text-3xl font-black">{data.invoice.invoice_number}</h1>
                    <p className="mt-1 text-white/60">From {data.invoice.business?.name ?? "your Sjoh pro"}</p>
                  </div>
                  <Button asChild className="rounded-full bg-sa-gold font-black text-sa-dark hover:bg-sa-gold/90">
                    <a href={data.signedUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="size-4" /> Download PDF
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-6 p-7">
                <div className="rounded-2xl bg-[#FBFAF6] p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-sa-dark/45">{totalLabel}</p>
                  <p className="mt-2 font-display text-4xl font-black text-sa-green">
                    {fmtZar(data.invoice.total_zar)}
                  </p>
                  <p className="mt-1 text-sm text-sa-dark/55">
                    {isQuote ? "Sent" : "Issued"} {new Date(data.invoice.issued_at).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-xl font-black">{isQuote ? "Quote" : "Invoice"} details</h2>
                  <div className="mt-3 divide-y divide-border rounded-2xl border border-border">
                    {data.invoice.line_items.map((item, idx) => (
                      <div key={`${item.description}-${idx}`} className="flex items-start justify-between gap-4 p-4">
                        <div>
                          <p className="font-bold">{item.description}</p>
                          <p className="text-sm text-sa-dark/55">Qty {item.qty}</p>
                        </div>
                        <p className="font-bold tabular-nums">{fmtZar(item.qty * item.unit_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ml-auto max-w-sm rounded-2xl bg-[#FBFAF6] p-5 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><strong>{fmtZar(data.invoice.subtotal_zar)}</strong></div>
                  <div className="mt-2 flex justify-between"><span>{data.invoice.vat_included ? "VAT (15%)" : "VAT"}</span><strong>{data.invoice.vat_included ? fmtZar(data.invoice.vat_zar) : "Not applicable"}</strong></div>
                  <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-black"><span>{totalLabel}</span><span className="text-sa-green">{fmtZar(data.invoice.total_zar)}</span></div>
                </div>

                {data.invoice.notes && (
                  <div className="rounded-2xl bg-sa-gold/15 p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-sa-dark/45">Notes</p>
                    <p className="mt-2 text-sm text-sa-dark/75">{data.invoice.notes}</p>
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-2xl border border-sa-green/20 bg-sa-green/10 p-5 text-sm text-sa-dark/70">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-sa-green" />
                  <p>
                    Payment is handled directly between you and {data.invoice.business?.name ?? "the business"}.
                    Sjoh does not hold funds, process payment, or take commission from this job.
                  </p>
                </div>
              </div>
            </div>
            );
            })()
          ) : null}
        </div>
      </main>
    </SiteLayout>
  );
};

export default PublicInvoice;
