"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Scores } from "@/lib/scoring";
import type { PersonneAnalysis, PosteAnalysis, AnalysisReport } from "@/lib/analysis-types";
import {
  getJobContent,
  getScoreInterpretation,
  getDetectedIssues,
  getPriorityTips,
  getImmediateActionsForDimension,
  getProductsForDimension,
  type JobData,
  type PriorityAction as JobPriorityAction,
} from "@/lib/job-content";

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, unknown>;

// ─── Score helpers ────────────────────────────────────────────────────────────

const sc = (s: number) => (s >= 70 ? "#1a7a4a" : s >= 50 ? "#b45309" : "#b91c1c");
const sb = (s: number) => (s >= 70 ? "#dcfce7" : s >= 50 ? "#fef3c7" : "#fee2e2");
const sl = (s: number) => (s >= 70 ? "Bon" : s >= 50 ? "À améliorer" : "Attention");
const bc = (s: number) => (s >= 70 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626");

// ─── Dimension config ─────────────────────────────────────────────────────────

interface DimMeta { key: string; label: string; emoji: string; color: string; bg: string }

const DIMS: DimMeta[] = [
  { key: "setup",        label: "Setup & ergonomie",   emoji: "💻", color: "#2b5ce6", bg: "#eff4ff" },
  { key: "pain",         label: "Douleurs",              emoji: "🩺", color: "#e24b4a", bg: "#fff1f0" },
  { key: "habits",       label: "Habitudes de travail", emoji: "⏱️", color: "#d4622a", bg: "#fff7ed" },
  { key: "sleep_energy", label: "Sommeil & énergie",    emoji: "🌙", color: "#2d6a4f", bg: "#f0fdf4" },
  { key: "nutrition",    label: "Nutrition",              emoji: "🍽️", color: "#7c3aed", bg: "#f5f3ff" },
  { key: "lifestyle",    label: "Mode de vie actif",    emoji: "🏃", color: "#1d9e75", bg: "#f0fdf4" },
];

// ─── Data helpers ─────────────────────────────────────────────────────────────

function buildProfileTags(a: Answers, jobType: string, hoursWeek: number | null): string[] {
  const tags: string[] = [];
  if (jobType === "debout") {
    tags.push("Travail debout");
    const surface = a["q_d1"] as string;
    if (surface === "dur") tags.push("Sol dur");
    else if (surface === "moquette") tags.push("Sol souple");
  } else {
    const equip = a["q1"] as string;
    if (equip === "laptop") tags.push("Laptop seul");
    else if (equip === "laptop_screen") tags.push("Laptop + écran");
    else if (equip === "desktop") tags.push("Desktop");
    const chair = a["q5b"] as string;
    if (chair === "adjustable") tags.push("Chaise réglable");
    else if (chair === "couch") tags.push("Canapé / siège inadapté");
    else if (chair === "fixed") tags.push("Chaise fixe");
    else if (chair === "ball") tags.push("Ballon");
  }
  if (hoursWeek) tags.push(`${hoursWeek}h/semaine`);
  return tags;
}

function getBureauDetectedIssues(dim: string, a: Answers): string[] {
  const g = (k: string) => a[k];
  const n = (k: string) => Number(a[k] ?? 0);
  const issues: string[] = [];
  switch (dim) {
    case "setup":
      if (g("q1") === "laptop") issues.push("Tu travailles sur laptop seul — configuration la plus risquée pour la colonne cervicale.");
      if (g("q3") === "no" || g("q3") === "dunno") issues.push("L'écran n'est pas à hauteur des yeux — tension cervicale permanente toute la journée.");
      if (g("q4") === "close") issues.push("L'écran est trop proche — fatigue visuelle accélérée et contraction permanente.");
      if (g("q5") === "bad") issues.push("Clavier/souris mal positionnés — risque de tendinites des poignets et des coudes.");
      if (g("q5b") === "couch" || g("q5b") === "fixed") issues.push("Chaise inadaptée — pas de maintien lombaire, posture effondrée en fin de journée.");
      break;
    case "pain":
      if (n("q6") >= 3) issues.push(`Douleurs cervicales significatives (${n("q6")}/5) — zone la plus touchée chez les travailleurs de bureau.`);
      if (n("q7") >= 3) issues.push(`Douleurs aux épaules importantes (${n("q7")}/5) — signe d'enroulement postural chronique.`);
      if (n("q8") >= 3) issues.push(`Douleurs lombaires importantes (${n("q8")}/5) — compression discale par position assise prolongée.`);
      if (n("q9") >= 3) issues.push(`Douleurs aux poignets (${n("q9")}/5) — début potentiel de syndrome du canal carpien.`);
      if (n("q10") >= 3) issues.push(`Fatigue visuelle significative (${n("q10")}/5) — distance d'écran et lumière à revoir.`);
      if (g("q11") === "months" || g("q11") === "year") issues.push("Douleurs installées depuis plusieurs mois — une consultation kiné est recommandée.");
      break;
    case "habits":
      if (n("q13") >= 9) issues.push(`Tu travailles ${n("q13")}h/jour — exposition prolongée aux contraintes posturales.`);
      if (g("q14") === "never") issues.push("Aucune pause active — compression discale en continu toute la journée.");
      if (g("q14b") === "none") issues.push("Peu ou pas d'activité physique pour compenser la sédentarité professionnelle.");
      if (g("q15") === "hand") issues.push("Téléphone tenu à la main = nuque inclinée répétitivement de 15-30°.");
      break;
    case "sleep_energy":
      if (n("q17") < 7) issues.push(`Tu dors ${n("q17")}h — en dessous des 7-8h nécessaires à la récupération musculaire.`);
      if (g("q18") === "exhausted") issues.push("Tu te réveilles épuisé — ton sommeil ne remplit pas sa fonction réparatrice.");
      if (g("q18") === "tired") issues.push("Tu te réveilles fatigué — qualité de sommeil insuffisante.");
      if (g("q20") === "always" || g("q20") === "often") issues.push("Fatigue chronique en journée — signe d'une récupération incomplète.");
      break;
    case "nutrition":
      if (g("qn2") === "crash") issues.push("Crash énergétique post-repas — probablement lié à un excès de glucides simples.");
      if (g("qn2") === "unfocused") issues.push("Difficultés de concentration après le repas — alimentation à rééquilibrer.");
      if (g("qn3") === "always") issues.push("Collations régulières — montagnes russes glycémiques toute la journée.");
      if (g("qn4") === "skip") issues.push("Tu sautes des repas — cerveau en manque de glucose dans l'après-midi.");
      if (g("qn1") === "screen") issues.push("Tu manges devant l'écran — aucune vraie pause cognitive.");
      break;
    case "lifestyle":
      if (g("q14b") === "none") issues.push("Aucune activité sportive — muscles stabilisateurs du dos en atrophie progressive.");
      if (g("q22") === "never") issues.push("Pas d'étirements pratiqués — tensions musculaires chroniques non relâchées.");
      if (g("q24") === "bad") issues.push("Conscience posturale faible — tu ne remarques pas quand ta posture dévie.");
      break;
  }
  return issues.length > 0 ? issues : ["Aucun problème majeur détecté dans cette dimension."];
}

const GENERIC_ACTIONS: Record<string, JobPriorityAction[]> = {
  habits: [
    { title: "Alarme toutes les 90 minutes", why: "Au-delà de 50 minutes assis, la compression discale augmente exponentiellement.", how: "À chaque alarme : lève-toi, marche 2-3 minutes dans la pièce.", impact: "Réduit de 40% l'accumulation de tension journalière" },
    { title: "Marche pendant tes appels téléphoniques", why: "Transformer le temps téléphonique en temps de mouvement, sans organisation.", how: "Lève-toi à chaque appel. Sans exception.", impact: "20-30 min de mouvement en plus par jour automatiquement" },
  ],
  sleep_energy: [
    { title: "Déconnecte les écrans à 21h", why: "La lumière bleue décale l'horloge biologique de 2 heures.", how: "Mode nuit sur tous les écrans. Idéalement aucun écran 1h avant le coucher.", impact: "Améliore la qualité du sommeil en 5-7 jours" },
    { title: "Heure de coucher fixe", why: "La régularité du cycle sommeil-réveil est plus importante que la durée seule.", how: "Même heure de coucher week-end et semaine. 21h30-22h recommandé.", impact: "Récupération complète restaurée en 2-3 semaines" },
  ],
  nutrition: [
    { title: "Protéines au déjeuner (25g minimum)", why: "Les protéines stabilisent la glycémie et éliminent le coup de barre de 14h.", how: "Légumineuses, œufs, viande blanche ou poisson. Évite le repas 100% glucides.", impact: "Élimine le crash énergétique de l'après-midi" },
    { title: "2 verres d'eau avant le café", why: "La déshydratation matinale amplifie la fatigue et les tensions musculaires.", how: "Verre d'eau posé à côté du lit. Boire avant de se lever.", impact: "Amélioration énergie et concentration en 3-5 jours" },
  ],
  lifestyle: [
    { title: "20 minutes de marche quotidienne", why: "La marche réduit le risque lombalgique de 30% et régule le cortisol.", how: "Déjeuner, trajets, soirée. Pas besoin d'équipement.", impact: "Amélioration progressive sur 2-3 semaines" },
    { title: "Gainage 3x/semaine — 10 minutes", why: "Les muscles du tronc sont les amortisseurs naturels de la colonne.", how: "Planche, bird-dog, glute bridge. 10 min. YouTube suffit.", impact: "Réduit les douleurs lombaires de 50% en 6 semaines" },
  ],
};

function getPriorityActionsForDim(dim: string, jobData: JobData, scores: Scores): JobPriorityAction[] {
  const score = (scores[dim as keyof Scores] as number) ?? 50;
  const suffix = score < 50 ? "_critical" : "_attention";
  const key = `${dim}${suffix}`;
  if (jobData.priority_actions[key]?.length) return jobData.priority_actions[key].slice(0, 3);
  const plain = jobData.priority_actions[dim];
  if (plain?.length) return plain.slice(0, 3);
  return GENERIC_ACTIONS[dim] ?? [];
}

function getTopPriorityActions(jobType: string, jobData: JobData, scores: Scores, answers: Answers): { action: JobPriorityAction; dim: DimMeta }[] {
  const result: { action: JobPriorityAction; dim: DimMeta }[] = [];
  const sorted = [...DIMS].sort((a, b) => ((scores[a.key as keyof Scores] as number) ?? 50) - ((scores[b.key as keyof Scores] as number) ?? 50));
  for (const dim of sorted) {
    if (result.length >= 5) break;
    let actions: JobPriorityAction[] = [];
    if (jobType === "debout") {
      const tips = getPriorityTips(dim.key, "debout", answers);
      const immediate = getImmediateActionsForDimension(dim.key, "debout", answers);
      actions = [
        ...tips.map(t => ({ title: t.text, why: "", how: "", impact: "" })),
        ...immediate.map(ia => ({ title: ia, why: "", how: "", impact: "" })),
      ].slice(0, 2);
    } else {
      actions = getPriorityActionsForDim(dim.key, jobData, scores).slice(0, 2);
    }
    for (const action of actions) {
      if (result.length >= 5) break;
      result.push({ action, dim });
    }
  }
  return result;
}

interface DeboutProd { name: string; reason: string; url: string; price?: string }

function getRelevantProducts(jobType: string, jobData: JobData, scores: Scores, answers: Answers): Array<{ name: string; reason: string; url: string; price?: string }> {
  if (jobType === "debout") {
    const all = DIMS.flatMap(d => getProductsForDimension(d.key, "debout", answers)) as DeboutProd[];
    const seen = new Set<string>();
    return all.filter(p => { if (seen.has(p.name)) return false; seen.add(p.name); return true; }).slice(0, 3);
  }
  return jobData.products.filter(p => {
    if (p.priority !== "haute") return false;
    const t = p.trigger ?? "";
    if (t.includes("setup_score < 60") && ((scores.setup ?? 100) >= 60)) return false;
    if (t.includes("q1 === laptop") && answers["q1"] !== "laptop") return false;
    return true;
  }).map(p => ({ name: p.name, reason: p.reason, url: p.url })).slice(0, 3);
}

function fmt(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

// ─── SVG Score Circle ─────────────────────────────────────────────────────────

function ScoreCircle({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={7} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={bc(score)} strokeWidth={7}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RapportPDF() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [scores, setScores] = useState<Scores | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [firstname, setFirstname] = useState("Vous");
  const [jobType, setJobType] = useState("bureau");
  const [hoursWeek, setHoursWeek] = useState<number | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [reportDate] = useState(() => fmt(new Date()));
  const [legacyReport, setLegacyReport] = useState<AnalysisReport | null>(null);
  const [personneAnalysis, setPersonneAnalysis] = useState<PersonneAnalysis | null>(null);
  const [posteAnalysis, setPosteAnalysis] = useState<PosteAnalysis | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("postureatwork_scores");
      if (!raw) { router.push("/questionnaire"); return; }
      const s: Scores = JSON.parse(raw);
      setScores(s);
      const jt = s.job_type ?? localStorage.getItem("paw_job_type") ?? "bureau";
      setJobType(jt);
      const rawA = sessionStorage.getItem(jt === "debout" ? "postureatwork_answers_debout" : "postureatwork_answers");
      if (rawA) setAnswers(JSON.parse(rawA));
    } catch { router.push("/questionnaire"); return; }

    setFirstname(localStorage.getItem("paw_firstname") ?? "Vous");
    const ageVal = localStorage.getItem("paw_age");
    if (ageVal) setAge(ageVal);
    const hw = localStorage.getItem("paw_hours_week");
    if (hw) setHoursWeek(Number(hw));

    try { const r = sessionStorage.getItem("postureatwork_report"); if (r) setLegacyReport(JSON.parse(r)); } catch { /**/ }
    try { const r = sessionStorage.getItem("paw_analysis_personne"); if (r) setPersonneAnalysis(JSON.parse(r)); } catch { /**/ }
    try { const r = sessionStorage.getItem("paw_analysis_poste"); if (r) setPosteAnalysis(JSON.parse(r)); } catch { /**/ }

    setReady(true);
  }, [router]);

  if (!ready || !scores) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif", color: "#64748b" }}>
        Chargement du rapport…
      </div>
    );
  }

  const jobData = getJobContent(jobType);
  const hasVideo = !!(legacyReport || (personneAnalysis && posteAnalysis));
  const totalPages = hasVideo ? 4 : 3;

  const sortedByScore = [...DIMS].sort((a, b) => ((scores[a.key as keyof Scores] as number) ?? 50) - ((scores[b.key as keyof Scores] as number) ?? 50));
  const worstDims = sortedByScore.slice(0, 3);
  const bestDims = sortedByScore.slice(-3).reverse();

  const profileTags = buildProfileTags(answers, jobType, hoursWeek);
  const topActions = getTopPriorityActions(jobType, jobData, scores, answers);
  const products = getRelevantProducts(jobType, jobData, scores, answers);

  const introConfig = scores.global < 40
    ? { bg: "#fff1f0", border: "#fca5a5", icon: "⚠️", text: "Ton corps envoie des signaux importants. Plusieurs zones nécessitent une attention immédiate.", color: "#991b1b" }
    : scores.global < 70
    ? { bg: "#fffbeb", border: "#fcd34d", icon: "📊", text: "Plusieurs points méritent ton attention. Des ajustements simples peuvent faire une grande différence.", color: "#92400e" }
    : { bg: "#f0fdf4", border: "#86efac", icon: "✅", text: "Tu es sur la bonne voie ! Quelques optimisations pour aller encore plus loin.", color: "#14532d" };

  const HEADER_STYLE: React.CSSProperties = {
    background: "#2b5ce6",
    margin: "-12mm -14mm 0",
    padding: "10px 14mm",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const PageFooter = ({ n }: { n: number }) => (
    <div style={{ position: "absolute", bottom: "8mm", left: "14mm", right: "14mm", display: "flex", justifyContent: "space-between", fontSize: "8pt", color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: 6 }}>
      <span>PostureAtWork — Rapport confidentiel · {firstname}</span>
      <span>Page {n} / {totalPages}</span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #e2e8f0; font-family: 'Inter', sans-serif; }

        .page {
          width: 210mm;
          min-height: 297mm;
          background: #ffffff;
          margin: 0 auto 12mm;
          padding: 12mm 14mm 22mm;
          position: relative;
          font-family: 'Inter', sans-serif;
          font-size: 10pt;
          color: #1e293b;
        }

        .dim-card {
          border-left: 4px solid;
          padding: 11px 13px;
          margin-bottom: 9px;
          border-radius: 0 8px 8px 0;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .priority-card {
          display: flex;
          gap: 11px;
          align-items: flex-start;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 7px;
          page-break-inside: avoid;
          break-inside: avoid;
          background: #fff;
        }

        .exercise-card {
          padding: 9px 11px;
          background: #f0fdf4;
          border-radius: 7px;
          border: 1px solid #d1fae5;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .product-card {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 9px 11px;
          background: #fffbeb;
          border-radius: 7px;
          border: 1px solid #fde68a;
          margin-bottom: 7px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .bar-bg { height: 7px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 5px 0 2px; }
        .bar-green  { height: 100%; border-radius: 4px; background: #16a34a !important; }
        .bar-orange { height: 100%; border-radius: 4px; background: #d97706 !important; }
        .bar-red    { height: 100%; border-radius: 4px; background: #dc2626 !important; }

        .pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 100px;
          font-weight: 600;
        }

        @media print {
          @page { size: A4; margin: 0; }
          body { background: #fff; margin: 0; padding: 0; }
          .page {
            margin: 0;
            padding: 12mm 14mm 22mm;
            page-break-after: always;
            page-break-inside: avoid;
            box-shadow: none;
            min-height: 297mm;
            width: 210mm;
          }
          .page:last-of-type { page-break-after: avoid; }
          .no-print { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .dim-card, .priority-card, .exercise-card, .product-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ── FLOATING BUTTONS (no-print) ── */}
      <div className="no-print" style={{ position: "fixed", top: 16, left: 16, zIndex: 9999 }}>
        <button
          onClick={() => router.back()}
          style={{ padding: "9px 18px", borderRadius: 100, background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(220,230,255,0.8)", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}
        >
          ← Retour
        </button>
      </div>
      <div className="no-print" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => window.print()}
          style={{ padding: "13px 28px", borderRadius: 100, background: "#2b5ce6", border: "none", color: "#fff", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(43,92,230,0.45)" }}
        >
          📄 Télécharger mon rapport PDF
        </button>
      </div>

      {/* ════════════════════════════════════════════
          PAGE 1 — COVER + SYNTHÈSE
      ════════════════════════════════════════════ */}
      <div className="page">
        {/* Blue header band */}
        <div style={HEADER_STYLE}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "13pt", letterSpacing: "0.01em" }}>
            PAW. <span style={{ fontWeight: 400, opacity: 0.85 }}>PostureAtWork</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "8.5pt" }}>{reportDate}</div>
        </div>

        <div style={{ marginTop: 14, marginBottom: 14 }}>
          <div style={{ fontSize: "8pt", color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
            Rapport Santé au Travail
          </div>
          <div style={{ fontSize: "20pt", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
            Bilan Postural Personnalisé
          </div>
        </div>

        {/* Profile + Score côte à côte */}
        <div style={{ display: "flex", gap: 14, marginBottom: 12, alignItems: "flex-start" }}>
          {/* Profil */}
          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "13px 15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#2b5ce6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "15pt", flexShrink: 0 }}>
                {initials(firstname)}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "16pt", color: "#0f172a", lineHeight: 1.1 }}>{firstname}</div>
                {age && <div style={{ fontSize: "9pt", color: "#64748b", marginTop: 2 }}>{age} ans · {jobData.label}</div>}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {profileTags.map((tag, i) => (
                <span key={i} style={{ padding: "3px 10px", borderRadius: 100, background: "#e2e8f0", fontSize: "8pt", color: "#475569", fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Score global */}
          <div style={{ textAlign: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "13px 20px", flexShrink: 0 }}>
            <div style={{ fontSize: "8pt", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>Score global</div>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <ScoreCircle score={scores.global} size={100} />
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div style={{ fontSize: "22pt", fontWeight: 800, color: bc(scores.global), lineHeight: 1 }}>{scores.global}</div>
                <div style={{ fontSize: "8pt", color: "#94a3b8" }}>/100</div>
              </div>
            </div>
            <div style={{ marginTop: 5 }}>
              <span className="pill" style={{ background: sb(scores.global), color: sc(scores.global), fontSize: "8.5pt" }}>{sl(scores.global)}</span>
            </div>
            <div style={{ fontSize: "8pt", color: "#94a3b8", marginTop: 4 }}>Bilan du {reportDate}</div>
          </div>
        </div>

        {/* Intro banner */}
        <div style={{ background: introConfig.bg, border: `1px solid ${introConfig.border}`, borderRadius: 8, padding: "10px 13px", marginBottom: 13, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: "12pt", flexShrink: 0 }}>{introConfig.icon}</span>
          <div style={{ fontSize: "9.5pt", color: introConfig.color, lineHeight: 1.6 }}>{introConfig.text}</div>
        </div>

        {/* 6 dimensions */}
        <div style={{ fontSize: "8pt", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 7 }}>
          Vos 6 dimensions
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 11px" }}>
          {DIMS.map(d => {
            const val = (scores[d.key as keyof Scores] as number) ?? 0;
            const barCls = val >= 70 ? "bar-green" : val >= 50 ? "bar-orange" : "bar-red";
            return (
              <div key={d.key} style={{ padding: "9px 11px", background: "#f9fafb", borderRadius: 7, border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, fontSize: "9.5pt", color: "#1e293b" }}>{d.emoji} {d.label}</div>
                  <span className="pill" style={{ background: sb(val), color: sc(val), fontSize: "8pt" }}>{val}/100</span>
                </div>
                <div className="bar-bg"><div className={barCls} style={{ width: `${val}%` }} /></div>
              </div>
            );
          })}
        </div>

        {/* Points forts / axes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "8pt", color: "#1a7a4a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>✅ Points forts</div>
            {bestDims.map(d => (
              <div key={d.key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f1f5f9", fontSize: "9pt" }}>
                <span style={{ color: "#374151" }}>{d.emoji} {d.label}</span>
                <span style={{ fontWeight: 700, color: sc((scores[d.key as keyof Scores] as number) ?? 0) }}>{(scores[d.key as keyof Scores] as number) ?? 0}/100</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "8pt", color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>🎯 Axes prioritaires</div>
            {worstDims.map(d => (
              <div key={d.key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f1f5f9", fontSize: "9pt" }}>
                <span style={{ color: "#374151" }}>{d.emoji} {d.label}</span>
                <span style={{ fontWeight: 700, color: sc((scores[d.key as keyof Scores] as number) ?? 0) }}>{(scores[d.key as keyof Scores] as number) ?? 0}/100</span>
              </div>
            ))}
          </div>
        </div>

        <PageFooter n={1} />
      </div>

      {/* ════════════════════════════════════════════
          PAGE 2 — ANALYSE PAR DIMENSION
      ════════════════════════════════════════════ */}
      <div className="page">
        <div style={HEADER_STYLE}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "13pt" }}>PAW. <span style={{ fontWeight: 400, opacity: 0.85 }}>PostureAtWork</span></div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "8.5pt" }}>Analyse détaillée — {firstname}</div>
        </div>

        <div style={{ marginTop: 13, marginBottom: 11 }}>
          <div style={{ fontSize: "8pt", color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Page 2 / {totalPages}</div>
          <div style={{ fontSize: "16pt", fontWeight: 800, color: "#0f172a" }}>Analyse par dimension</div>
        </div>

        {DIMS.map(d => {
          const val = (scores[d.key as keyof Scores] as number) ?? 0;
          const interp = getScoreInterpretation(jobData, d.key, val);
          const detected = jobType === "debout"
            ? getDetectedIssues(d.key, "debout", answers)
            : getBureauDetectedIssues(d.key, answers);
          const barCls = val >= 70 ? "bar-green" : val >= 50 ? "bar-orange" : "bar-red";
          return (
            <div key={d.key} className="dim-card" style={{ borderLeftColor: d.color, background: d.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontWeight: 800, fontSize: "10pt", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {d.emoji} {d.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 65, height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                    <div className={barCls} style={{ width: `${val}%`, height: "100%" }} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "11pt", color: bc(val), minWidth: 42, textAlign: "right" }}>{val}/100</span>
                  <span className="pill" style={{ background: sb(val), color: sc(val), fontSize: "7pt" }}>{sl(val)}</span>
                </div>
              </div>
              {interp && (
                <div style={{ fontSize: "8.5pt", color: "#374151", lineHeight: 1.55, fontStyle: "italic", marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid ${d.color}22` }}>
                  {interp}
                </div>
              )}
              <div style={{ fontSize: "7.5pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Ce qu&apos;on a détecté
              </div>
              {detected.slice(0, 3).map((issue, i) => (
                <div key={i} style={{ display: "flex", gap: 5, fontSize: "8.5pt", color: "#374151", lineHeight: 1.45, marginBottom: 3 }}>
                  <span style={{ color: d.color, fontWeight: 800, flexShrink: 0 }}>›</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          );
        })}

        <PageFooter n={2} />
      </div>

      {/* ════════════════════════════════════════════
          PAGE 3 — PLAN D'ACTION
      ════════════════════════════════════════════ */}
      <div className="page">
        <div style={HEADER_STYLE}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "13pt" }}>PAW. <span style={{ fontWeight: 400, opacity: 0.85 }}>PostureAtWork</span></div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "8.5pt" }}>Plan d&apos;action — {firstname}</div>
        </div>

        <div style={{ marginTop: 13, marginBottom: 11 }}>
          <div style={{ fontSize: "8pt", color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Page 3 / {totalPages}</div>
          <div style={{ fontSize: "16pt", fontWeight: 800, color: "#0f172a" }}>Ton plan d&apos;action</div>
        </div>

        {/* Priorities */}
        <div style={{ fontSize: "8pt", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7 }}>
          🎯 Tes priorités
        </div>
        {topActions.map(({ action, dim }, i) => {
          const rankColor = i === 0 ? "#dc2626" : i <= 2 ? "#d97706" : "#2b5ce6";
          return (
            <div key={i} className="priority-card">
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: rankColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "11pt", flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "9.5pt", color: "#0f172a", marginBottom: 3 }}>{action.title}</div>
                {action.why && (
                  <div style={{ fontSize: "8.5pt", color: "#64748b", marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>Pourquoi : </span>{action.why}
                  </div>
                )}
                {action.how && (
                  <div style={{ fontSize: "8.5pt", color: "#374151" }}>
                    <span style={{ fontWeight: 600 }}>Comment : </span>{action.how}
                  </div>
                )}
              </div>
              {action.impact && (
                <div style={{ fontSize: "7.5pt", color: dim.color, textAlign: "right", maxWidth: 90, lineHeight: 1.35, flexShrink: 0, fontWeight: 600 }}>
                  {action.impact}
                </div>
              )}
            </div>
          );
        })}

        {/* Exercises */}
        <div style={{ fontSize: "8pt", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.12em", margin: "11px 0 7px" }}>
          🧘 Programme d&apos;exercices
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {jobData.exercises.slice(0, 4).map((ex, i) => (
            <div key={i} className="exercise-card">
              <div style={{ fontWeight: 700, fontSize: "9pt", color: "#1a7a4a", marginBottom: 3 }}>🏋️ {ex.name}</div>
              <div style={{ fontSize: "8pt", color: "#374151", marginBottom: 2 }}>{ex.target}</div>
              <div style={{ fontSize: "7.5pt", color: "#64748b", marginBottom: 3 }}>⏱ {ex.duration} · {ex.frequency}</div>
              <div style={{ fontSize: "8pt", color: "#374151", lineHeight: 1.45 }}>{ex.instruction}</div>
            </div>
          ))}
        </div>

        {/* Products */}
        {products.length > 0 && (
          <>
            <div style={{ fontSize: "8pt", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.12em", margin: "11px 0 7px" }}>
              🛒 Équipements recommandés
            </div>
            {products.map((p, i) => (
              <div key={i} className="product-card">
                <span style={{ fontSize: "16pt" }}>📦</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "9pt", color: "#0f172a" }}>
                    {p.name}{"price" in p && p.price ? ` — ${p.price}` : ""}
                  </div>
                  <div style={{ fontSize: "8.5pt", color: "#92400e", marginTop: 2 }}>{p.reason}</div>
                  {p.url && <div style={{ fontSize: "7.5pt", color: "#2b5ce6", marginTop: 3 }}>{p.url}</div>}
                </div>
                <span className="pill" style={{ background: "#fef9c3", color: "#854d0e", fontSize: "7.5pt", flexShrink: 0 }}>Priorité haute</span>
              </div>
            ))}
          </>
        )}

        <PageFooter n={3} />
      </div>

      {/* ════════════════════════════════════════════
          PAGE 4 — ANALYSE VIDÉO IA (si disponible)
      ════════════════════════════════════════════ */}
      {hasVideo && (
        <div className="page">
          <div style={HEADER_STYLE}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "13pt" }}>PAW. <span style={{ fontWeight: 400, opacity: 0.85 }}>PostureAtWork</span></div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "8.5pt" }}>Analyse IA — {firstname}</div>
          </div>

          <div style={{ marginTop: 13, marginBottom: 11 }}>
            <div style={{ fontSize: "8pt", color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Page 4 / 4</div>
            <div style={{ fontSize: "16pt", fontWeight: 800, color: "#0f172a" }}>🎥 Analyse posturale IA</div>
          </div>

          {/* PersonneAnalysis */}
          {personneAnalysis && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: "9pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#374151" }}>Ta posture</div>
                <span className="pill" style={{ background: sb(personneAnalysis.globalPostureScore), color: sc(personneAnalysis.globalPostureScore), fontSize: "8.5pt" }}>
                  {personneAnalysis.globalPostureScore}/100 · {sl(personneAnalysis.globalPostureScore)}
                </span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: 9 }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#374151", width: "22%" }}>Segment</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: "#374151", width: "12%" }}>Score</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#374151" }}>Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.entries(personneAnalysis.segments) as [string, { score: number; issues: string[]; note: string }][]).map(([key, seg]) => {
                    const LABELS: Record<string, string> = { tete_cou: "Tête & cou", epaules_dos_haut: "Épaules / dos", bas_dos_bassin: "Bas du dos", membres_superieurs: "Bras / mains", membres_inferieurs: "Jambes / pieds" };
                    return (
                      <tr key={key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 8px", fontWeight: 600, color: "#1e293b" }}>{LABELS[key] ?? key}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <span className="pill" style={{ background: sb(seg.score), color: sc(seg.score), fontSize: "7.5pt" }}>{seg.score}</span>
                        </td>
                        <td style={{ padding: "6px 8px", color: "#374151", lineHeight: 1.4 }}>{seg.note || seg.issues?.[0] || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {personneAnalysis.overallAssessment && (
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 7, padding: "8px 12px", marginBottom: 11, fontSize: "8.5pt", color: "#0c4a6e", lineHeight: 1.6, fontStyle: "italic" }}>
                  {personneAnalysis.overallAssessment}
                </div>
              )}
            </>
          )}

          {/* PosteAnalysis */}
          {posteAnalysis && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: "9pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#374151" }}>Ton setup</div>
                <span className="pill" style={{ background: sb(posteAnalysis.globalSetupScore), color: sc(posteAnalysis.globalSetupScore), fontSize: "8.5pt" }}>
                  {posteAnalysis.globalSetupScore}/100 · {sl(posteAnalysis.globalSetupScore)}
                </span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: 9 }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#374151", width: "18%" }}>Élément</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: "#374151", width: "12%" }}>Score</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#374151" }}>Problèmes</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#374151", width: "28%" }}>Correction</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    { key: "ecran",         label: "Écran" },
                    { key: "clavier_souris", label: "Clavier/Souris" },
                    { key: "chaise",         label: "Chaise" },
                    { key: "organisation",   label: "Organisation" },
                  ] as { key: keyof typeof posteAnalysis.elements; label: string }[]).map(({ key, label }) => {
                    const el = posteAnalysis.elements[key];
                    const fix = posteAnalysis.mainIssues.find(mi => mi.element.toLowerCase().includes(label.split("/")[0].toLowerCase()))?.fix;
                    return (
                      <tr key={key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 8px", fontWeight: 600, color: "#1e293b" }}>{label}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <span className="pill" style={{ background: sb(el.score), color: sc(el.score), fontSize: "7.5pt" }}>{el.score}</span>
                        </td>
                        <td style={{ padding: "6px 8px", color: "#374151", lineHeight: 1.4 }}>{el.issues?.[0] ?? "—"}</td>
                        <td style={{ padding: "6px 8px", color: "#64748b", fontStyle: "italic", fontSize: "8pt", lineHeight: 1.4 }}>{fix ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {posteAnalysis.overallAssessment && (
                <div style={{ background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: 7, padding: "8px 12px", marginBottom: 11, fontSize: "8.5pt", color: "#14532d", lineHeight: 1.6, fontStyle: "italic" }}>
                  {posteAnalysis.overallAssessment}
                </div>
              )}
            </>
          )}

          {/* Legacy fallback */}
          {legacyReport && !personneAnalysis && (
            <>
              <div style={{ fontWeight: 700, fontSize: "9pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#374151", marginBottom: 7 }}>
                Analyse posturale — Score {legacyReport.posture_analysis.score}/100
              </div>
              <div style={{ fontSize: "9pt", color: "#374151", lineHeight: 1.6, marginBottom: 9, fontStyle: "italic" }}>
                {legacyReport.posture_analysis.overall_observation}
              </div>
              {(["head_position", "neck_position", "shoulders", "trunk"] as const).map(key => {
                const item = legacyReport.posture_analysis[key];
                const statusScore = item.status === "bon" ? 80 : item.status === "attention" ? 55 : 30;
                return (
                  <div key={key} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: "8.5pt" }}>
                    <span style={{ fontWeight: 600, color: "#374151", minWidth: 95 }}>{key.replace(/_/g, " ")}</span>
                    <span className="pill" style={{ background: sb(statusScore), color: sc(statusScore), fontSize: "7.5pt" }}>{item.status}</span>
                    <span style={{ color: "#374151", flex: 1 }}>{item.observation}</span>
                  </div>
                );
              })}
              {legacyReport.final_message && (
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 7, padding: "9px 12px", marginTop: 11, fontSize: "8.5pt", color: "#0c4a6e", lineHeight: 1.6, fontStyle: "italic" }}>
                  💬 {legacyReport.final_message}
                </div>
              )}
            </>
          )}

          {/* Disclaimer */}
          <div style={{ position: "absolute", bottom: "20mm", left: "14mm", right: "14mm", borderTop: "1px solid #e5e7eb", paddingTop: 8 }}>
            <div style={{ fontSize: "7.5pt", color: "#94a3b8", lineHeight: 1.5, textAlign: "center" }}>
              Ce rapport est généré automatiquement à des fins d&apos;information et ne remplace pas un avis médical.
              En cas de douleurs persistantes, consultez un professionnel de santé. © PostureAtWork {new Date().getFullYear()}
            </div>
          </div>

          <PageFooter n={4} />
        </div>
      )}
    </>
  );
}
