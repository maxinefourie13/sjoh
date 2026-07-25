import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Download, Mail, Loader2, ImagePlus, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  computeInvoiceTotals,
  generateInvoicePdf,
  fileToDataUrl,
  type DocType,
  type InvoiceLineItem,
} from "@/lib/invoice";

type Props = {
  businessId: string;
  proUserId: string;
  docType: DocType;
  onClose: () => void;
  onSaved?: () => void;
};

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB

const DOC = {
  quote: {
    title: "New quote",
    kicker: "Estimate for a customer",
    numberPrefix: "SJQ",
    sendLabel: "Send quote by email",
    savedVerb: "quote",
    defaultNotes: "This quote is valid for 30 days. Get in touch to go ahead.",
    template: "quote-sent",
  },
  invoice: {
    title: "New invoice",
    kicker: "Bill a customer",
    numberPrefix: "SJ",
    sendLabel: "Send invoice by email",
    savedVerb: "invoice",
    defaultNotes: "Payment via EFT or cash on completion. Thank you.",
    template: "invoice-sent",
  },
} as const;

/**
 * Create and send a quote or an invoice WITHOUT a linked job.
 *
 * This mirrors the deal-linked InvoiceGenerator but the customer is typed in
 * here (no request to pull it from) and deal_memo_id is null. It shares the
 * same invoice engine (lib/invoice) so a standalone doc looks identical to a
 * deal-linked one.
 */
export const StandaloneDocBuilder = ({ businessId, proUserId, docType, onClose, onSaved }: Props) => {
  const cfg = DOC[docType];

  const [items, setItems] = useState<InvoiceLineItem[]>([
    { description: "", qty: 1, unit_price: 0 },
  ]);
  const [vatIncluded, setVatIncluded] = useState(false);
  const [notes, setNotes] = useState<string>(cfg.defaultNotes);
  const [business, setBusiness] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  // Customer is entered by the pro (no job to source it from).
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");

  const [savedNumber, setSavedNumber] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("businesses")
        .select("name, email, phone, address, city, province, logo_url")
        .eq("id", businessId)
        .maybeSingle();
      if (data) {
        setBusiness(data);
        if (data.logo_url) {
          try {
            const res = await fetch(data.logo_url);
            const blob = await res.blob();
            const file = new File([blob], "logo", { type: blob.type });
            setLogoDataUrl(await fileToDataUrl(file));
            setLogoPreview(data.logo_url);
          } catch { /* non-critical */ }
        }
      }
    })();
  }, [businessId]);

  const totals = useMemo(() => computeInvoiceTotals(items, vatIncluded), [items, vatIncluded]);
  const customer = { name: custName.trim(), email: custEmail.trim() || null, phone: custPhone.trim() || null };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      toast({ title: "Logo too large", description: "Max 2 MB.", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Not an image", description: "Please upload a PNG or JPEG.", variant: "destructive" });
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoDataUrl(dataUrl);
      setLogoPreview(dataUrl);
    } catch {
      toast({ title: "Couldn't read logo", variant: "destructive" });
    }
    e.target.value = "";
  };

  const updateItem = (idx: number, patch: Partial<InvoiceLineItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, { description: "", qty: 1, unit_price: 0 }]);
  const removeItem = (idx: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const makeAccessToken = () => {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  };

  const buildAndSave = async (): Promise<{ id: string | null; number: string; pdfBlob: Blob } | null> => {
    if (!business) { toast({ title: "Loading your business details…", variant: "destructive" }); return null; }
    if (!customer.name) { toast({ title: "Add the customer's name", variant: "destructive" }); return null; }
    if (items.some((i) => !i.description.trim())) { toast({ title: "Each line needs a description", variant: "destructive" }); return null; }
    if (totals.total <= 0) { toast({ title: "Total must be greater than R0", variant: "destructive" }); return null; }

    setBusy(true);
    const now = new Date();
    const ymd = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const number = savedNumber ?? `${cfg.numberPrefix}-${ymd}-${suffix}`;
    let id = savedId;

    if (!savedNumber) {
      // Cast: doc_type isn't in the generated types until they're regenerated
      // after the migration. The column exists in the DB.
      const { data, error } = await (supabase as any).from("invoices").insert({
        invoice_number: number,
        pro_user_id: proUserId,
        business_id: businessId,
        deal_memo_id: null,
        doc_type: docType,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        line_items: items,
        subtotal_zar: totals.subtotal,
        vat_zar: totals.vat,
        total_zar: totals.total,
        vat_included: vatIncluded,
        notes,
      }).select("id").single();
      if (error) {
        setBusy(false);
        toast({ title: `Couldn't save ${cfg.savedVerb}`, description: error.message, variant: "destructive" });
        return null;
      }
      id = data?.id ?? null;
      setSavedNumber(number);
      setSavedId(id);
    }

    const doc = generateInvoicePdf({
      invoice_number: number,
      issued_at: now,
      doc_type: docType,
      business: {
        name: business.name, email: business.email, phone: business.phone,
        address: business.address, city: business.city, province: business.province,
        logo_data_url: logoDataUrl,
      },
      customer,
      line_items: items,
      vat_included: vatIncluded,
      notes,
    });

    setBusy(false);
    return { id, number, pdfBlob: doc.output("blob") };
  };

  const uploadPdf = async (id: string, number: string, pdfBlob: Blob) => {
    const token = makeAccessToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString();
    const pdfPath = `${proUserId}/${id}/${number}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("invoice-pdfs")
      .upload(pdfPath, pdfBlob, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      toast({ title: "Couldn't upload PDF", description: uploadError.message, variant: "destructive" });
      return null;
    }
    const { error: updateError } = await (supabase as any).from("invoices").update({
      pdf_path: pdfPath, access_token: token, access_token_expires_at: expires, email_error: null,
    }).eq("id", id);
    if (updateError) {
      toast({ title: "Couldn't secure link", description: updateError.message, variant: "destructive" });
      return null;
    }
    return { token, url: `${window.location.origin}/invoice/${token}` };
  };

  const handleDownload = async () => {
    const result = await buildAndSave();
    if (!result) return;
    const url = URL.createObjectURL(result.pdfBlob);
    const a = document.createElement("a");
    a.href = url; a.download = `${result.number}.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: `${cfg.savedVerb === "quote" ? "Quote" : "Invoice"} downloaded`, description: "Saved a copy to your Sjoh records." });
    onSaved?.();
  };

  const handleEmail = async () => {
    const result = await buildAndSave();
    if (!result) return;
    if (!customer.email) {
      toast({ title: "No customer email", description: "Add an email above, or download a copy instead.", variant: "destructive" });
      return;
    }
    if (!result.id) { toast({ title: "Not ready", description: "Try again in a moment.", variant: "destructive" }); return; }

    setBusy(true);
    const secure = await uploadPdf(result.id, result.number, result.pdfBlob);
    if (!secure) { setBusy(false); return; }

    const { data, error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: cfg.template,
        recipientEmail: customer.email,
        idempotencyKey: `${docType}:${result.id}:sent`,
        templateData: {
          docType,
          invoiceNumber: result.number,
          businessName: business?.name ?? "Your Sjoh pro",
          customerName: customer.name,
          issuedAt: new Date().toISOString(),
          lineItems: items,
          subtotal: totals.subtotal,
          vat: totals.vat,
          total: totals.total,
          vatIncluded,
          notes,
          invoiceUrl: secure.url,
        },
      },
    });

    if (error || data?.success === false) {
      await (supabase as any).from("invoices").update({
        status: "failed", email_error: error?.message ?? data?.reason ?? "Email could not be queued",
      }).eq("id", result.id);
      setBusy(false);
      toast({ title: `Couldn't send ${cfg.savedVerb}`, description: error?.message ?? "Saved, but the email didn't send. Try again or download a copy.", variant: "destructive" });
      return;
    }

    await (supabase as any).from("invoices").update({
      status: "sent", sent_at: new Date().toISOString(), email_error: null,
    }).eq("id", result.id);
    setBusy(false);
    toast({ title: `${cfg.savedVerb === "quote" ? "Quote" : "Invoice"} sent`, description: `Sjoh emailed ${result.number} to ${customer.email}.` });
    onSaved?.();
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#101010] p-6 text-white shadow-pop space-y-6">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#F5A623] via-[#DC2828] via-[#0A2463] via-[#0B6E3A] via-[#6B7CE8] to-[#E83E8C]" />
      <div className="absolute -right-20 -top-20 size-56 rounded-full bg-[#F5A623]/15 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="size-11 rounded-2xl bg-[#F5A623] flex items-center justify-center text-[#101010] shadow-[6px_6px_0_rgba(255,255,255,0.16)]">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#F5A623]">{cfg.kicker}</p>
            <h3 className="font-display font-black text-2xl leading-tight mt-1">{cfg.title}</h3>
            <p className="text-sm text-white/65 mt-2">No job needed — send it to any customer.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-black">{docType === "quote" ? "Quoted total" : "Total due"}</div>
          <div className="font-display text-2xl font-black text-[#F5A623]">
            R {totals.total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Customer (editable — this is the standalone difference) */}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-4 space-y-3">
        <Label className="text-xs uppercase tracking-wider text-white/50">
          {docType === "quote" ? "Quote for" : "Bill to"}
        </Label>
        <Input
          className="bg-white text-[#101010] border-white/20"
          placeholder="Customer name *"
          value={custName}
          onChange={(e) => setCustName(e.target.value)}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            type="email"
            className="bg-white text-[#101010] border-white/20"
            placeholder="Customer email (to send by email)"
            value={custEmail}
            onChange={(e) => setCustEmail(e.target.value)}
          />
          <Input
            type="tel"
            className="bg-white text-[#101010] border-white/20"
            placeholder="Customer phone (optional)"
            value={custPhone}
            onChange={(e) => setCustPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Logo */}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <Label className="text-xs uppercase tracking-wider text-white/50">Your logo (optional)</Label>
        {logoPreview ? (
          <div className="flex items-center gap-3 mt-3">
            <div className="h-14 w-32 rounded-xl border border-white/15 bg-white flex items-center justify-center overflow-hidden p-1">
              <img src={logoPreview} alt="Your logo" className="max-h-full max-w-full object-contain" />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => { setLogoDataUrl(null); setLogoPreview(null); }} className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/5">
              <X className="size-3.5" /> Remove
            </Button>
          </div>
        ) : (
          <button type="button" onClick={() => logoInputRef.current?.click()} className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-full border border-dashed border-white/20 hover:border-[#F5A623] hover:bg-[#F5A623]/10 transition-colors text-sm text-white/70 hover:text-[#F5A623]">
            <ImagePlus className="size-4" /> Upload your logo
          </button>
        )}
        <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
      </div>

      {/* VAT */}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-4 flex items-center justify-between gap-3">
        <Label htmlFor="std-vat" className="text-sm">Add VAT (15%)</Label>
        <Switch id="std-vat" checked={vatIncluded} onCheckedChange={setVatIncluded} />
      </div>

      {/* Line items */}
      <div className="relative space-y-3">
        <Label className="text-xs uppercase tracking-wider text-white/50">Line items</Label>
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-start">
            <Input className="col-span-6 bg-white text-[#101010] border-white/20" placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, { description: e.target.value })} />
            <Input className="col-span-2 bg-white text-[#101010] border-white/20" type="number" min={1} placeholder="Qty" value={item.qty} onChange={(e) => updateItem(idx, { qty: Number(e.target.value) || 0 })} />
            <Input className="col-span-3 bg-white text-[#101010] border-white/20" type="number" min={0} step="0.01" placeholder="Unit price (R)" value={item.unit_price} onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) || 0 })} />
            <Button type="button" variant="ghost" size="icon" className="col-span-1 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => removeItem(idx)} disabled={items.length === 1} aria-label="Remove line">
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10">
          <Plus className="size-4" /> Add line
        </Button>
      </div>

      {/* Notes */}
      <div className="relative">
        <Label htmlFor="std-notes" className="text-xs uppercase tracking-wider text-white/50">Notes (optional)</Label>
        <Textarea id="std-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 bg-white text-[#101010] border-white/20" />
      </div>

      {/* Totals */}
      <div className="relative rounded-2xl bg-white text-[#101010] border border-white/15 p-4 text-sm space-y-1">
        <div className="flex justify-between"><span className="text-[#3a3d4a]">Subtotal</span><span>R {totals.subtotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between"><span className="text-[#3a3d4a]">{vatIncluded ? "VAT (15%)" : "VAT"}</span><span>{vatIncluded ? `R ${totals.vat.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "Not applicable"}</span></div>
        <div className="flex justify-between font-black text-base pt-2 border-t border-border mt-2"><span>{docType === "quote" ? "Quoted total" : "Total due"}</span><span className="text-[#0B6E3A]">R {totals.total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span></div>
      </div>

      <div className="relative flex flex-wrap gap-2">
        <Button onClick={handleEmail} disabled={busy} className="flex-1 min-w-[160px] rounded-full bg-[#F5A623] text-[#101010] hover:bg-[#ffbd3b] font-black">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} {cfg.sendLabel}
        </Button>
        <Button onClick={handleDownload} disabled={busy} variant="secondary" className="flex-1 min-w-[160px] rounded-full bg-white/10 hover:bg-white/15 text-white font-black border border-white/15">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download copy
        </Button>
        <Button variant="ghost" onClick={onClose} className="text-white/70 hover:bg-white/10 hover:text-white">Close</Button>
      </div>

      <p className="relative text-xs text-white/50">
        {docType === "quote"
          ? "This is an estimate, not a tax invoice. Sjoh doesn't handle payment — the customer pays you directly."
          : "The invoice is saved to your Sjoh records. Sjoh does not handle the payment — the customer pays you directly."}
      </p>
    </div>
  );
};
