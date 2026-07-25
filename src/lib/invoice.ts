import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type InvoiceLineItem = {
  description: string;
  qty: number;
  unit_price: number;
};

export type DocType = "invoice" | "quote";

export type InvoiceData = {
  invoice_number: string;
  issued_at: Date;
  /** "invoice" (default) prints a TAX INVOICE; "quote" prints a QUOTE / estimate. */
  doc_type?: DocType;
  business: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    logo_data_url?: string | null; // base64 data URL for custom logo
  };
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  line_items: InvoiceLineItem[];
  vat_included: boolean;
  notes?: string | null;
};

export type InvoiceTotals = {
  subtotal: number;
  vat: number;
  total: number;
};

const VAT_RATE = 0.15;

export const computeInvoiceTotals = (
  items: InvoiceLineItem[],
  vat_included: boolean,
): InvoiceTotals => {
  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.qty) || 0) * (Number(i.unit_price) || 0),
    0,
  );
  const vat = vat_included ? subtotal * VAT_RATE : 0;
  return { subtotal, vat, total: subtotal + vat };
};

const fmtZAR = (n: number) =>
  "R " + n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

const COLORS = {
  ink: [15, 17, 23] as const,
  softInk: [58, 61, 74] as const,
  muted: [107, 111, 126] as const,
  paper: [251, 250, 246] as const,
  line: [228, 230, 237] as const,
  gold: [245, 166, 35] as const,
  green: [11, 110, 58] as const,
  red: [220, 40, 40] as const,
  navy: [10, 36, 99] as const,
  peri: [107, 124, 232] as const,
  pink: [232, 62, 140] as const,
  white: [255, 255, 255] as const,
};

const setFill = (doc: jsPDF, color: readonly [number, number, number]) =>
  doc.setFillColor(color[0], color[1], color[2]);

const setText = (doc: jsPDF, color: readonly [number, number, number]) =>
  doc.setTextColor(color[0], color[1], color[2]);

const setDraw = (doc: jsPDF, color: readonly [number, number, number]) =>
  doc.setDrawColor(color[0], color[1], color[2]);

const drawPill = (
  doc: jsPDF,
  label: string,
  x: number,
  y: number,
  width: number,
  color: readonly [number, number, number],
  textColor: readonly [number, number, number] = COLORS.ink,
) => {
  setFill(doc, color);
  doc.roundedRect(x, y, width, 18, 9, 9, "F");
  setText(doc, textColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(label, x + width / 2, y + 12, { align: "center" });
};

/**
 * Converts a file to a base64 data URL string for embedding in PDFs.
 * Call this in the UI before passing logo_data_url to generateInvoicePdf.
 */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read logo file"));
    reader.readAsDataURL(file);
  });

/**
 * Generates a Sjoh-branded PDF invoice.
 * Returns the jsPDF instance so the caller can either save() or get a Blob.
 * If business.logo_data_url is provided, the logo replaces the "Sjoh" wordmark
 * in the header while a small "via Sjoh" credit remains in the footer.
 */
export const generateInvoicePdf = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // A quote and an invoice share this layout; only the labels differ. A quote
  // is an estimate (no "amount due"), an invoice is a tax document.
  const isQuote = data.doc_type === "quote";
  const L = {
    docTitle: isQuote ? "QUOTE" : "TAX INVOICE",
    numberLabel: isQuote ? "Quote #" : "Invoice #",
    party: isQuote ? "QUOTE FOR" : "BILL TO",
    totalLabel: isQuote ? "QUOTED TOTAL" : "TOTAL DUE",
    footerRight: isQuote
      ? "Estimate only — not a tax invoice."
      : "Payment stays between customer and provider.",
  };

  // Background canvas.
  setFill(doc, COLORS.paper);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ── Header band ───────────────────────────────────────────────────────────
  setFill(doc, COLORS.ink);
  doc.rect(0, 0, pageWidth, 128, "F");

  // Small SA-inspired accent strip, matching the site palette.
  const stripY = 0;
  const stripH = 6;
  const stripW = pageWidth / 6;
  [COLORS.gold, COLORS.red, COLORS.navy, COLORS.green, COLORS.peri, COLORS.pink].forEach((color, idx) => {
    setFill(doc, color);
    doc.rect(idx * stripW, stripY, stripW + 1, stripH, "F");
  });

  if (data.business.logo_data_url) {
    try {
      const mime = data.business.logo_data_url.split(";")[0].split(":")[1] || "image/png";
      const format = mime.includes("jpeg") || mime.includes("jpg") ? "JPEG" : "PNG";
      setFill(doc, COLORS.white);
      doc.roundedRect(margin, 28, 132, 46, 14, 14, "F");
      doc.addImage(data.business.logo_data_url, format, margin + 10, 35, 112, 30);
    } catch {
      setText(doc, COLORS.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(data.business.name, margin, 56);
    }
  } else {
    setText(doc, COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.text("sjoh", margin, 56);
    setText(doc, COLORS.gold);
    doc.text("!", margin + 66, 56);
  }

  setText(doc, COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("GENERATED VIA SJOH", margin, 90);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Find someone who can do it properly. No middleman. No commission.", margin, 106);

  // ── Invoice meta (top right) ──────────────────────────────────────────────
  setText(doc, COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(L.docTitle, pageWidth - margin, 50, { align: "right" });
  drawPill(doc, "0% COMMISSION", pageWidth - margin - 104, 62, 104, COLORS.gold);
  setText(doc, COLORS.white);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${L.numberLabel} ${data.invoice_number}`, pageWidth - margin, 96, { align: "right" });
  doc.text(`Issued ${fmtDate(data.issued_at)}`, pageWidth - margin, 110, { align: "right" });

  // ── Main white sheet ──────────────────────────────────────────────────────
  const sheetX = 28;
  const sheetY = 148;
  const sheetW = pageWidth - 56;
  setFill(doc, COLORS.white);
  doc.roundedRect(sheetX, sheetY, sheetW, pageHeight - 220, 22, 22, "F");

  // ── From / To columns ─────────────────────────────────────────────────────
  let y = 188;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(doc, COLORS.muted);
  doc.text("FROM", margin, y);
  doc.text(L.party, pageWidth / 2, y);

  y += 18;
  setText(doc, COLORS.ink);
  doc.setFontSize(13);
  doc.text(data.business.name, margin, y);
  doc.text(data.customer.name, pageWidth / 2, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(doc, COLORS.softInk);
  y += 16;

  const fromLines = [
    [data.business.address, data.business.city, data.business.province]
      .filter(Boolean)
      .join(", "),
    data.business.phone ?? "",
    data.business.email ?? "",
  ].filter(Boolean);

  const toLines = [data.customer.phone ?? "", data.customer.email ?? ""].filter(Boolean);

  const maxRows = Math.max(fromLines.length, toLines.length);
  for (let i = 0; i < maxRows; i++) {
    if (fromLines[i]) doc.text(fromLines[i], margin, y + i * 13);
    if (toLines[i]) doc.text(toLines[i], pageWidth / 2, y + i * 13);
  }
  y += maxRows * 13 + 22;

  // ── Line items table ──────────────────────────────────────────────────────
  const totals = computeInvoiceTotals(data.line_items, data.vat_included);

  autoTable(doc, {
    startY: y,
    head: [["Description", "Qty", "Unit price", "Amount"]],
    body: data.line_items.map((i) => [
      i.description,
      String(i.qty),
      fmtZAR(Number(i.unit_price)),
      fmtZAR((Number(i.qty) || 0) * (Number(i.unit_price) || 0)),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 10,
      textColor: [...COLORS.ink],
      lineColor: [...COLORS.line],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [...COLORS.ink],
      textColor: [...COLORS.white],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [248, 249, 252] },
    columnStyles: {
      1: { halign: "right", cellWidth: 50 },
      2: { halign: "right", cellWidth: 90 },
      3: { halign: "right", cellWidth: 100 },
    },
    margin: { left: margin, right: margin },
  });

  let afterTableY = (doc as any).lastAutoTable.finalY + 16;

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalsX = pageWidth - margin - 210;
  const valX = pageWidth - margin;

  setFill(doc, COLORS.paper);
  doc.roundedRect(totalsX - 20, afterTableY - 12, 230, data.vat_included ? 96 : 92, 16, 16, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(doc, COLORS.muted);
  doc.text("Subtotal", totalsX, afterTableY);
  setText(doc, COLORS.ink);
  doc.text(fmtZAR(totals.subtotal), valX, afterTableY, { align: "right" });
  afterTableY += 16;

  setText(doc, COLORS.muted);
  doc.text(data.vat_included ? "VAT (15%)" : "VAT", totalsX, afterTableY);
  setText(doc, COLORS.ink);
  doc.text(data.vat_included ? fmtZAR(totals.vat) : "Not applicable", valX, afterTableY, { align: "right" });
  afterTableY += 18;

  setDraw(doc, COLORS.line);
  doc.line(totalsX, afterTableY - 6, valX, afterTableY - 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setText(doc, COLORS.ink);
  doc.text(L.totalLabel, totalsX, afterTableY + 8);
  setText(doc, COLORS.green);
  doc.setFontSize(15);
  doc.text(fmtZAR(totals.total), valX, afterTableY + 8, { align: "right" });
  afterTableY += 32;

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (data.notes) {
    const notesY = Math.max(afterTableY + 8, (doc as any).lastAutoTable.finalY + 132);
    setFill(doc, [255, 248, 235]);
    doc.roundedRect(margin, notesY - 14, pageWidth - margin * 2, 66, 14, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setText(doc, COLORS.ink);
    doc.text("NOTES", margin + 16, notesY);
    doc.setFont("helvetica", "normal");
    setText(doc, COLORS.softInk);
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - margin * 2 - 32);
    doc.text(noteLines, margin + 16, notesY + 16);
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = pageHeight - 48;
  setDraw(doc, COLORS.ink);
  doc.setLineWidth(1.5);
  doc.line(margin, footerY - 16, pageWidth - margin, footerY - 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, COLORS.muted);
  doc.text("Generated via Sjoh — sjoh.co.za", margin, footerY);
  doc.text(L.footerRight, pageWidth - margin, footerY, { align: "right" });

  return doc;
};
