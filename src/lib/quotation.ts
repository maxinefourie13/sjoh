// Lightweight HTML→print quotation generator. No backend needed.
// Opens a print-styled window the user can save as PDF.
import { formatRand } from "./mockData";

export interface QuotationInput {
  jobId: string;
  jobTitle: string;
  clientName?: string;
  price: number;
  priceType: "fixed" | "from" | "quote";
  scope: string;
  timeline: string;
  validityDays: number;
  contactPref: string;
  loomUrl?: string;
  notes?: string;
  providerBusinessId: string;
  providerBusiness?: {
    name: string;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  } | null;
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const buildQuotationHtml = (input: QuotationInput): string => {
  const biz = input.providerBusiness;
  const ref = `SJOH-${Date.now().toString(36).toUpperCase()}`;
  const today = new Date().toLocaleDateString("en-ZA", {
    year: "numeric", month: "long", day: "numeric",
  });
  const validUntil = new Date(Date.now() + input.validityDays * 86400_000)
    .toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

  const priceLabel =
    input.priceType === "fixed"
      ? formatRand(input.price)
      : input.priceType === "from"
      ? `From ${formatRand(input.price)}`
      : "Quote on inspection";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>Quotation ${ref} — ${escape(biz?.name ?? "Sjoh Provider")}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;margin:0;padding:48px;max-width:800px;margin:0 auto;line-height:1.5}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f172a;padding-bottom:24px;margin-bottom:32px}
  .brand{font-weight:800;font-size:28px;letter-spacing:-.02em}
  .brand small{display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.15em;margin-top:4px}
  .ref{text-align:right;font-size:13px;color:#64748b}
  .ref strong{display:block;font-size:18px;color:#0f172a;font-weight:700;margin-bottom:4px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
  .label{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px}
  .block p{margin:2px 0;font-size:14px}
  h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin:32px 0 12px}
  .scope{background:#f8fafc;border-left:4px solid #002395;padding:16px 20px;border-radius:4px;font-size:14px;white-space:pre-wrap}
  .price-row{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;background:#0f172a;color:#fff;border-radius:8px;margin-top:8px}
  .price-row .num{font-size:32px;font-weight:700;letter-spacing:-.02em}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;font-size:13px}
  .meta div{padding:12px 16px;background:#f8fafc;border-radius:6px}
  .footer{margin-top:48px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center}
  .footer strong{color:#0f172a}
  .badge{display:inline-block;background:#002395;color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.1em;margin-left:8px;vertical-align:middle}
  @media print{body{padding:24px}.no-print{display:none}}
  .print-btn{position:fixed;top:16px;right:16px;background:#0f172a;color:#fff;border:0;padding:10px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px}
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>

<div class="top">
  <div class="brand">${escape(biz?.name ?? "Sjoh Provider")}<small>Quotation</small></div>
  <div class="ref"><strong>${ref}</strong>Issued: ${today}<br/>Valid until: ${validUntil}</div>
</div>

<div class="grid">
  <div class="block">
    <div class="label">From</div>
    <p><strong>${escape(biz?.name ?? "")}</strong></p>
    ${biz?.address ? `<p>${escape(biz.address)}</p>` : ""}
    <p>${escape([biz?.city, biz?.province].filter(Boolean).join(", "))}</p>
    ${biz?.phone ? `<p>${escape(biz.phone)}</p>` : ""}
    ${biz?.email ? `<p>${escape(biz.email)}</p>` : ""}
    ${biz?.website ? `<p>${escape(biz.website)}</p>` : ""}
  </div>
  <div class="block">
    <div class="label">For</div>
    <p><strong>${escape(input.clientName || "Client (via Sjoh)")}</strong></p>
    <p>Job ref: ${escape(input.jobId)}</p>
    <p style="margin-top:8px"><em>${escape(input.jobTitle)}</em></p>
  </div>
</div>

<h2>Scope of work</h2>
<div class="scope">${escape(input.scope)}</div>

<h2>Pricing</h2>
<div class="price-row">
  <div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;opacity:.7">Total</div>
    <div style="font-size:13px;opacity:.85;margin-top:2px">${
      input.priceType === "fixed" ? "Fixed price (incl. VAT where applicable)" :
      input.priceType === "from" ? "Starting price — final on site assessment" :
      "On-site assessment required"
    }</div>
  </div>
  <div class="num">${priceLabel}</div>
</div>

<div class="meta">
  <div><strong>Timeline:</strong> ${escape(input.timeline)}</div>
  <div><strong>Contact:</strong> ${escape(input.contactPref)}</div>
  ${input.loomUrl ? `<div style="grid-column:1/-1"><strong>Walkthrough video:</strong> ${escape(input.loomUrl)}</div>` : ""}
</div>

${input.notes ? `<h2>Notes</h2><div class="scope" style="border-left-color:#0f172a">${escape(input.notes)}</div>` : ""}

<div class="footer">
  Issued via <strong>Sjoh.</strong><span class="badge">No Tjops</span><br/>
  Sjoh is a lead-generation platform. Payment is between client and provider — no commission, no escrow.
</div>

<script>setTimeout(()=>window.print(),400)</script>
</body></html>`;
};

export const downloadQuotation = (input: QuotationInput) => {
  const html = buildQuotationHtml(input);
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
};
