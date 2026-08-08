// Client-side per-child PDF report using the bundled jspdf + autotable.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Child, ChildUpdate, Goal, PackRecommendation } from "./types";
import { domainLabel, GOAL_STATUS_LABELS, UPDATE_TYPE_LABELS } from "./domains";
import { overallProgress, formatRand } from "./packLogic";

interface ReportInput {
  child: Child;
  goals: Goal[];
  updates: ChildUpdate[];
  recommendations: PackRecommendation[];
  periodStart?: Date;
  periodEnd?: Date;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

export function buildReportSummary(input: ReportInput): string {
  const { child, goals } = input;
  const pct = overallProgress(goals);
  const achieved = goals.filter((g) => g.status === "achieved").length;
  return `${child.first_name} is at ${pct}% overall across ${goals.length} goal${
    goals.length === 1 ? "" : "s"
  }, with ${achieved} achieved.`;
}

/** Generates and triggers download of the report PDF. Returns the summary text. */
export function generateChildReportPdf(input: ReportInput): string {
  const { child, goals, updates, recommendations } = input;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  let y = 18;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30);
  doc.text("Piece of Mind — Progress Report", marginX, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(110);
  const name = `${child.first_name} ${child.last_name}`;
  const period =
    input.periodStart && input.periodEnd
      ? `${fmtDate(input.periodStart)} – ${fmtDate(input.periodEnd)}`
      : `As at ${fmtDate(new Date())}`;
  doc.text(`${name}${child.date_of_birth ? `  ·  DOB ${child.date_of_birth}` : ""}`, marginX, y);
  y += 6;
  doc.text(period, marginX, y);
  y += 10;

  // Summary box
  const pct = overallProgress(goals);
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text(`Overall progress: ${pct}%`, marginX, y);
  y += 4;
  doc.setDrawColor(220);
  doc.setFillColor(235, 235, 245);
  doc.rect(marginX, y, pageWidth - marginX * 2, 6, "F");
  doc.setFillColor(99, 102, 241);
  doc.rect(marginX, y, ((pageWidth - marginX * 2) * pct) / 100, 6, "F");
  y += 14;

  // Goals table
  doc.setTextColor(30);
  doc.setFontSize(13);
  doc.text("Individual Education Programme — Goals", marginX, y);
  y += 3;
  autoTable(doc, {
    startY: y + 3,
    head: [["Domain", "Goal", "Status", "Progress"]],
    body: goals.map((g) => [
      domainLabel(g.domain),
      g.title,
      GOAL_STATUS_LABELS[g.status],
      `${g.progress}%`,
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: marginX, right: marginX },
  });
  // @ts-expect-error autotable augments doc at runtime
  y = (doc.lastAutoTable?.finalY ?? y) + 12;

  // Recent updates
  const recentUpdates = updates.slice(0, 5);
  if (recentUpdates.length) {
    doc.setFontSize(13);
    doc.text("Recent updates", marginX, y);
    y += 6;
    doc.setFontSize(9);
    for (const u of recentUpdates) {
      if (y > 265) {
        doc.addPage();
        y = 18;
      }
      doc.setTextColor(30);
      doc.setFont(undefined as unknown as string, "bold");
      doc.text(
        `${fmtDate(new Date(u.created_at))} · ${UPDATE_TYPE_LABELS[u.type]} — ${u.title}`,
        marginX,
        y,
      );
      y += 5;
      doc.setFont(undefined as unknown as string, "normal");
      doc.setTextColor(90);
      const lines = doc.splitTextToSize(u.body, pageWidth - marginX * 2);
      doc.text(lines, marginX, y);
      y += lines.length * 4.5 + 4;
    }
    y += 4;
  }

  // Recommended packs
  const openRecs = recommendations.filter((r) => r.status !== "dismissed");
  if (openRecs.length) {
    if (y > 250) {
      doc.addPage();
      y = 18;
    }
    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text("Recommended home-support packs", marginX, y);
    y += 3;
    autoTable(doc, {
      startY: y + 3,
      head: [["Pack", "Why", "Price", "Status"]],
      body: openRecs.map((r) => [
        r.pack?.name ?? "",
        r.reason ?? "",
        r.pack ? formatRand(r.pack.price_cents) : "",
        r.status,
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: marginX, right: marginX },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated ${fmtDate(new Date())} · Piece of Mind Centre · Confidential`,
      marginX,
      doc.internal.pageSize.getHeight() - 8,
    );
  }

  doc.save(`${child.first_name}-${child.last_name}-progress-report.pdf`.replace(/\s+/g, "-"));
  return buildReportSummary(input);
}
