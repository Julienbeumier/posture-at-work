import jsPDF from "jspdf";

export interface PDFSubScore {
  label: string;
  score: number;
  color: string;
}

export interface PDFRec {
  title: string;
  description: string;
  priority: string;
}

export interface PDFExercise {
  name: string;
  duration: string;
  instruction: string;
}

export interface PDFProduct {
  name: string;
  reason: string;
  url: string;
}

export interface PDFData {
  globalScore: number;
  subScores: PDFSubScore[];
  recommendations: PDFRec[];
  exercises: PDFExercise[];
  products?: PDFProduct[];
}

const PAGE_W = 210;
const PAGE_H = 297;
const M = 18;
const CW = PAGE_W - M * 2;

function hex(h: string): [number, number, number] {
  const c = h.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

function badge(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Bon niveau", color: "#2d6a4f" };
  if (score >= 50) return { label: "Zones a ameliorer", color: "#d4622a" };
  return { label: "Action requise", color: "#e24b4a" };
}

function priorityColor(p: string): string {
  if (p === "urgent") return "#e24b4a";
  if (p === "important") return "#d4622a";
  return "#2d6a4f";
}

function priorityLabel(p: string): string {
  if (p === "urgent") return "URGENT";
  if (p === "important") return "IMPORTANT";
  return "BIEN JOUE";
}

function miniHeader(doc: jsPDF, right: string) {
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, PAGE_W, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("PAW.", M, 9.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 200);
  doc.text(right, PAGE_W - M, 9.5, { align: "right" });
}

function ensureSpace(doc: jsPDF, y: number, needed: number, sectionTitle: string): number {
  if (y + needed > PAGE_H - 15) {
    doc.addPage();
    miniHeader(doc, sectionTitle);
    return 22;
  }
  return y;
}

export async function generatePDF(data: PDFData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  // ── PAGE 1 — Score & indicateurs ─────────────────────────────────────────

  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, PAGE_W, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("PAW.", M, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 210);
  doc.text(date, PAGE_W - M, 20, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(100, 120, 200);
  doc.text("PostureAtWork — Bilan sante au travail", M, 27);

  let y = 44;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(26, 26, 46);
  doc.text("Mon bilan sante au travail", PAGE_W / 2, y, { align: "center" });
  y += 12;

  // Score circle
  const cx = PAGE_W / 2;
  const cy = y + 19;

  doc.setFillColor(240, 244, 255);
  doc.circle(cx, cy, 21, "F");
  doc.setDrawColor(...hex("#2b5ce6"));
  doc.setLineWidth(2.5);
  doc.circle(cx, cy, 19, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...hex("#2b5ce6"));
  doc.text(String(data.globalScore), cx, cy + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 130);
  doc.text("/100", cx, cy + 11, { align: "center" });

  y = cy + 22;

  // Badge
  const b = badge(data.globalScore);
  const [br, bg2, bb] = hex(b.color);
  const bW = 52;
  doc.setFillColor(br, bg2, bb);
  doc.roundedRect(cx - bW / 2, y, bW, 8, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(b.label, cx, y + 5.4, { align: "center" });
  y += 14;

  doc.setDrawColor(220, 220, 235);
  doc.setLineWidth(0.3);
  doc.line(M, y, PAGE_W - M, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 46);
  doc.text("Tes 6 indicateurs", M, y);
  y += 8;

  for (const sub of data.subScores) {
    y = ensureSpace(doc, y, 14, "Indicateurs");

    const [sr, sg, sb] = hex(sub.color);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 90);
    doc.text(sub.label, M, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(sr, sg, sb);
    doc.text(`${sub.score}/100`, PAGE_W - M, y, { align: "right" });
    y += 4;

    doc.setFillColor(228, 230, 240);
    doc.roundedRect(M, y, CW, 3, 1.5, 1.5, "F");
    doc.setFillColor(sr, sg, sb);
    doc.roundedRect(M, y, Math.max(3, (sub.score / 100) * CW), 3, 1.5, 1.5, "F");

    y += 10;
  }

  // ── PAGE 2 — Recommandations & exercices ─────────────────────────────────

  doc.addPage();
  miniHeader(doc, "Priorites & recommandations");
  y = 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.text("Priorites & recommandations", M, y);
  y += 9;

  for (const rec of data.recommendations.slice(0, 5)) {
    const pHex = priorityColor(rec.priority);
    const [pr, pg, pb] = hex(pHex);
    const titleLines = doc.splitTextToSize(rec.title.replace(/[^\x00-\x7F]/g, ""), CW - 10);
    const descLines = doc.splitTextToSize(rec.description.replace(/[^\x00-\x7F]/g, ""), CW - 10);
    const cardH = 6 + titleLines.length * 5 + 3 + descLines.length * 4.5 + 6;

    y = ensureSpace(doc, y, cardH + 5, "Recommandations");

    doc.setFillColor(250, 250, 253);
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(0.4);
    doc.roundedRect(M, y, CW, cardH, 3, 3, "FD");
    doc.setFillColor(pr, pg, pb);
    doc.roundedRect(M, y, 2.5, cardH, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(pr, pg, pb);
    doc.text(priorityLabel(rec.priority), M + 5, y + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(26, 26, 46);
    let ty = y + 11;
    doc.text(titleLines, M + 5, ty);
    ty += titleLines.length * 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 100);
    doc.text(descLines, M + 5, ty);

    y += cardH + 5;
  }

  // Exercices
  y = ensureSpace(doc, y, 20, "Exercices");
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.text("Exercices cibles", M, y);
  y += 9;

  for (const ex of data.exercises.slice(0, 3)) {
    const instrLines = doc.splitTextToSize(ex.instruction.replace(/[^\x00-\x7F]/g, ""), CW - 10);
    const cardH = 6 + 5 + instrLines.length * 4.5 + 6;

    y = ensureSpace(doc, y, cardH + 5, "Exercices");

    doc.setFillColor(240, 245, 255);
    doc.setDrawColor(...hex("#2b5ce6"));
    doc.setLineWidth(0.4);
    doc.roundedRect(M, y, CW, cardH, 3, 3, "FD");
    doc.setFillColor(...hex("#2b5ce6"));
    doc.roundedRect(M, y, 2.5, cardH, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(26, 26, 46);
    doc.text(ex.name.replace(/[^\x00-\x7F]/g, ""), M + 5, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(43, 92, 230);
    doc.text(`Duree : ${ex.duration}`, M + 5, y + 11.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 100);
    doc.text(instrLines, M + 5, y + 17);

    y += cardH + 5;
  }

  // ── PAGE 3 — Produits ────────────────────────────────────────────────────

  if (data.products && data.products.length > 0) {
    doc.addPage();
    miniHeader(doc, "Produits recommandes");
    y = 22;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(26, 26, 46);
    doc.text("Produits recommandes", M, y);
    y += 9;

    for (const prod of data.products) {
      const reasonLines = doc.splitTextToSize(prod.reason.replace(/[^\x00-\x7F]/g, ""), CW - 10);
      const cardH = 7 + reasonLines.length * 4.5 + 10;

      y = ensureSpace(doc, y, cardH + 5, "Produits recommandes");

      doc.setFillColor(250, 250, 253);
      doc.setDrawColor(...hex("#2b5ce6"));
      doc.setLineWidth(0.4);
      doc.roundedRect(M, y, CW, cardH, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(26, 26, 46);
      doc.text(prod.name.replace(/[^\x00-\x7F]/g, ""), M + 5, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(70, 70, 100);
      doc.text(reasonLines, M + 5, y + 12);

      const urlY = y + 12 + reasonLines.length * 4.5 + 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(43, 92, 230);
      const shortUrl = prod.url.length > 60 ? prod.url.slice(0, 58) + "..." : prod.url;
      doc.text(shortUrl, M + 5, urlY);

      y += cardH + 5;
    }

    // Footer
    const footerY = Math.max(y + 10, PAGE_H - 18);
    doc.setDrawColor(220, 220, 235);
    doc.setLineWidth(0.3);
    doc.line(M, footerY, PAGE_W - M, footerY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 160);
    doc.text("* Liens partenaires Amazon. Le prix est identique pour vous.", M, footerY + 5);
  }

  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`PostureAtWork-Rapport-${dateStr}.pdf`);
}
