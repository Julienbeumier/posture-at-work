"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Scores } from "@/lib/scoring";
import type { AnalysisReport, PersonneAnalysis, PosteAnalysis } from "@/lib/analysis-types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 70) return "#2d9e6b";
  if (s >= 50) return "#d97706";
  return "#dc2626";
}

function scoreLabel(s: number) {
  if (s >= 70) return "Bon";
  if (s >= 50) return "À améliorer";
  return "Attention";
}

function scoreBg(s: number) {
  if (s >= 70) return "#dcfce7";
  if (s >= 50) return "#fef3c7";
  return "#fee2e2";
}

function fmt(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const DIM_META = [
  { key: "setup",        label: "Setup & ergonomie",     emoji: "💻", color: "#3b82f6" },
  { key: "pain",         label: "Douleurs",               emoji: "🩺", color: "#ef4444" },
  { key: "habits",       label: "Habitudes de travail",   emoji: "⏱️", color: "#f59e0b" },
  { key: "sleep_energy", label: "Sommeil & énergie",      emoji: "🌙", color: "#10b981" },
  { key: "nutrition",    label: "Nutrition",               emoji: "🍽️", color: "#8b5cf6" },
  { key: "lifestyle",    label: "Mode de vie actif",      emoji: "🏃", color: "#06b6d4" },
] as const;

const DIM_TIPS: Record<string, string[]> = {
  setup: [
    "Placez l'écran à une longueur de bras (~60 cm) et en face de vous.",
    "Le haut de l'écran doit être au niveau des yeux ou légèrement en dessous.",
    "Coudes à 90°, clavier et souris alignés, poignets neutres.",
    "Chaise réglée pour que les pieds soient à plat et cuisses parallèles au sol.",
    "Évitez le laptop seul sur une longue durée — ajoutez un écran externe.",
  ],
  pain: [
    "Une douleur qui dure plus de 3 semaines mérite une consultation.",
    "Intégrez 5 min d'étirements cervicaux toutes les 2 heures.",
    "La chaleur (bouillotte) soulage les contractures musculaires.",
    "Renforcement du gainage profond pour réduire les douleurs lombaires.",
    "Un mal de dos récurrent peut être lié à une mauvaise position assise.",
  ],
  habits: [
    "Faites une pause de 5 min toutes les 90 minutes — debout ou marche.",
    "Utilisez la règle 20-20-20 : toutes les 20 min, regardez à 6 m pendant 20 s.",
    "Téléphonez en marchant plutôt qu'assis.",
    "Variez les positions : assis, debout, marche sont complémentaires.",
    "Désactivez les notifications pendant les blocs de travail intensifs.",
  ],
  sleep_energy: [
    "7 à 8 heures de sommeil régulier est la base de la récupération musculaire.",
    "Évitez les écrans 1h avant de dormir pour préserver la mélatonine.",
    "Une sieste de 20 min améliore l'énergie l'après-midi.",
    "Hydratez-vous dès le réveil : 2 verres d'eau avant le café.",
    "Le magnésium bisglycinate améliore la qualité du sommeil.",
  ],
  nutrition: [
    "Un déjeuner riche en protéines limite le coup de barre de 14h.",
    "Évitez les glucides rapides au déjeuner : ils amplifient la fatigue post-repas.",
    "Collation idéale : poignée de noix + fruit frais vers 16h.",
    "Buvez 1,5 L à 2 L d'eau par jour — la déshydratation amplifie les tensions.",
    "Caféine avant 14h pour ne pas perturber le sommeil.",
  ],
  lifestyle: [
    "30 min de marche quotidienne réduit le risque lombalgique de 30 %.",
    "Le renforcement musculaire 2×/semaine protège les articulations.",
    "Le yoga et le Pilates améliorent la conscience posturale.",
    "Les étirements le matin préparent le corps pour la journée.",
    "L'activité physique régulière améliore la qualité du sommeil.",
  ],
};

function getJobLabel(jt: string) {
  if (jt === "debout") return "Travail debout / mobilité";
  return "Travail de bureau (sédentaire)";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RapportPDF() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [scores, setScores] = useState<Scores | null>(null);
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
      const rawScores = sessionStorage.getItem("postureatwork_scores");
      if (!rawScores) { router.push("/questionnaire"); return; }
      const s: Scores = JSON.parse(rawScores);
      setScores(s);
      const jt = s.job_type ?? localStorage.getItem("paw_job_type") ?? "bureau";
      setJobType(jt);
    } catch { router.push("/questionnaire"); return; }

    const fn = localStorage.getItem("paw_firstname");
    if (fn) setFirstname(fn);
    const ageVal = localStorage.getItem("paw_age");
    if (ageVal) setAge(ageVal);
    const hw = localStorage.getItem("paw_hours_week");
    if (hw) setHoursWeek(Number(hw));

    try {
      const rp = sessionStorage.getItem("postureatwork_report");
      if (rp) setLegacyReport(JSON.parse(rp));
    } catch { /* ignore */ }

    try {
      const pa = sessionStorage.getItem("paw_analysis_personne");
      if (pa) setPersonneAnalysis(JSON.parse(pa));
    } catch { /* ignore */ }

    try {
      const po = sessionStorage.getItem("paw_analysis_poste");
      if (po) setPosteAnalysis(JSON.parse(po));
    } catch { /* ignore */ }

    setReady(true);
  }, [router]);

  if (!ready || !scores) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fff", color: "#333", fontFamily: "Georgia, serif", fontSize: 18 }}>
        Chargement du rapport…
      </div>
    );
  }

  const hasVideoAnalysis = !!(legacyReport || (personneAnalysis && posteAnalysis));
  const worstDims = [...DIM_META].sort((a, b) => (scores[b.key as keyof Scores] as number) - (scores[a.key as keyof Scores] as number)).reverse().slice(0, 3);
  const bestDims  = [...DIM_META].sort((a, b) => (scores[b.key as keyof Scores] as number) - (scores[a.key as keyof Scores] as number)).slice(0, 3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #f1f5f9; }

        .page {
          width: 210mm;
          min-height: 297mm;
          background: #fff;
          margin: 0 auto 12mm;
          padding: 18mm 16mm;
          font-family: 'Inter', sans-serif;
          font-size: 10pt;
          color: #1e293b;
          position: relative;
        }

        .page-footer {
          position: absolute;
          bottom: 10mm;
          left: 16mm;
          right: 16mm;
          display: flex;
          justify-content: space-between;
          font-size: 8pt;
          color: #94a3b8;
          border-top: 0.5px solid #e2e8f0;
          padding-top: 3mm;
        }

        h1 { font-family: 'Playfair Display', Georgia, serif; }

        .score-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 10px;
          border-radius: 100px;
          font-size: 9pt;
          font-weight: 600;
        }

        .dim-bar-bg {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        .dim-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        .section-title {
          font-size: 11pt;
          font-weight: 700;
          color: #0f172a;
          border-bottom: 1.5px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 10px;
        }

        .tip-item {
          display: flex;
          gap: 6px;
          align-items: flex-start;
          padding: 5px 0;
          border-bottom: 0.5px solid #f1f5f9;
          font-size: 9.5pt;
          line-height: 1.45;
        }

        .action-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(15,23,42,0.97);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 14px 20px;
          display: flex;
          gap: 10px;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .btn-back {
          padding: 10px 22px;
          border-radius: 100px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(220,230,255,0.7);
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-print {
          padding: 10px 28px;
          border-radius: 100px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
        }

        @media print {
          @page { size: A4; margin: 0; }
          body { background: #fff; }
          .action-bar { display: none !important; }
          .page {
            margin: 0;
            page-break-after: always;
            page-break-inside: avoid;
            box-shadow: none;
          }
          .page:last-child { page-break-after: auto; }
        }
      `}</style>

      {/* ── ACTION BAR (no-print) ── */}
      <div className="action-bar">
        <button className="btn-back" onClick={() => router.back()}>← Retour</button>
        <button className="btn-print" onClick={() => window.print()}>
          📄 Télécharger mon rapport PDF
        </button>
      </div>

      {/* ════════════════════════════════════════
          PAGE 1 — SYNTHÈSE
      ════════════════════════════════════════ */}
      <div className="page">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 14, borderBottom: "2px solid #0f172a" }}>
          <div>
            <div style={{ fontSize: "9pt", color: "#64748b", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              Rapport Bilan Postural
            </div>
            <h1 style={{ fontSize: "22pt", color: "#0f172a", lineHeight: 1.1 }}>
              PostureAtWork
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "9pt", color: "#64748b" }}>{reportDate}</div>
            <div style={{ fontSize: "9pt", color: "#64748b", marginTop: 2 }}>{getJobLabel(jobType)}</div>
          </div>
        </div>

        {/* Profile banner */}
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0" }}>
          <div>
            <div style={{ fontSize: "13pt", fontWeight: 700, color: "#0f172a" }}>Rapport de {firstname}</div>
            {age && <div style={{ fontSize: "9pt", color: "#64748b", marginTop: 2 }}>{age} ans{hoursWeek ? ` · ${hoursWeek}h/semaine` : ""}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "9pt", color: "#64748b", marginBottom: 4 }}>Score global</div>
            <div style={{ fontSize: "26pt", fontWeight: 700, color: scoreColor(scores.global), lineHeight: 1 }}>
              {scores.global}<span style={{ fontSize: "11pt", marginLeft: 2 }}>/100</span>
            </div>
            <span className="score-pill" style={{ background: scoreBg(scores.global), color: scoreColor(scores.global), marginTop: 4 }}>
              {scoreLabel(scores.global)}
            </span>
          </div>
        </div>

        {/* Score overview intro */}
        <div style={{ marginBottom: 16, fontSize: "9.5pt", color: "#475569", lineHeight: 1.6 }}>
          Ce rapport analyse votre posture et votre bien-être au travail à travers 6 dimensions clés.
          Il est généré automatiquement à partir de vos réponses au questionnaire PostureAtWork.
        </div>

        {/* 6 dimensions grid */}
        <div className="section-title">Vos 6 dimensions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 20 }}>
          {DIM_META.map(d => {
            const val = scores[d.key as keyof Scores] as number;
            return (
              <div key={d.key} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: "9.5pt", fontWeight: 600, color: "#334155" }}>
                    {d.emoji} {d.label}
                  </div>
                  <span className="score-pill" style={{ background: scoreBg(val), color: scoreColor(val), fontSize: "8pt" }}>
                    {val}/100
                  </span>
                </div>
                <div className="dim-bar-bg">
                  <div className="dim-bar-fill" style={{ width: `${val}%`, background: d.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Points forts & axes d'amélioration */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <div className="section-title" style={{ color: "#2d9e6b", borderColor: "#d1fae5" }}>Points forts ✅</div>
            {bestDims.map(d => (
              <div key={d.key} style={{ fontSize: "9pt", color: "#374151", padding: "4px 0", borderBottom: "0.5px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                <span>{d.emoji} {d.label}</span>
                <span style={{ fontWeight: 600, color: scoreColor(scores[d.key as keyof Scores] as number) }}>
                  {scores[d.key as keyof Scores]}/100
                </span>
              </div>
            ))}
          </div>
          <div>
            <div className="section-title" style={{ color: "#dc2626", borderColor: "#fee2e2" }}>Axes prioritaires 🎯</div>
            {worstDims.map(d => (
              <div key={d.key} style={{ fontSize: "9pt", color: "#374151", padding: "4px 0", borderBottom: "0.5px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                <span>{d.emoji} {d.label}</span>
                <span style={{ fontWeight: 600, color: scoreColor(scores[d.key as keyof Scores] as number) }}>
                  {scores[d.key as keyof Scores]}/100
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="page-footer">
          <span>PostureAtWork — Rapport confidentiel</span>
          <span>Page 1 / {hasVideoAnalysis ? 4 : 3}</span>
        </div>
      </div>

      {/* ════════════════════════════════════════
          PAGE 2 — ANALYSE PAR DIMENSION
      ════════════════════════════════════════ */}
      <div className="page">
        <div style={{ marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #0f172a", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: "14pt", fontWeight: 700, color: "#0f172a" }}>Analyse par dimension</div>
          <div style={{ fontSize: "9pt", color: "#64748b" }}>{firstname} — {reportDate}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DIM_META.map(d => {
            const val = scores[d.key as keyof Scores] as number;
            const tips = DIM_TIPS[d.key] ?? [];
            return (
              <div key={d.key} style={{ border: `1px solid`, borderColor: val >= 70 ? "#d1fae5" : val >= 50 ? "#fef3c7" : "#fee2e2", borderRadius: 8, overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "8px 12px", background: val >= 70 ? "#f0fdf4" : val >= 50 ? "#fffbeb" : "#fff1f2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "10pt", color: "#0f172a" }}>
                    {d.emoji} {d.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 80, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${val}%`, height: "100%", background: d.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "10pt", color: scoreColor(val), minWidth: 38, textAlign: "right" }}>{val}/100</span>
                    <span className="score-pill" style={{ background: scoreBg(val), color: scoreColor(val), fontSize: "7.5pt" }}>
                      {scoreLabel(val)}
                    </span>
                  </div>
                </div>
                {/* Tips */}
                <div style={{ padding: "6px 12px 8px" }}>
                  {tips.slice(0, val >= 70 ? 2 : 3).map((tip, i) => (
                    <div key={i} className="tip-item">
                      <span style={{ color: d.color, flexShrink: 0 }}>›</span>
                      <span style={{ color: "#374151" }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="page-footer">
          <span>PostureAtWork — Rapport confidentiel</span>
          <span>Page 2 / {hasVideoAnalysis ? 4 : 3}</span>
        </div>
      </div>

      {/* ════════════════════════════════════════
          PAGE 3 — PLAN D'ACTION
      ════════════════════════════════════════ */}
      <div className="page">
        <div style={{ marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #0f172a", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: "14pt", fontWeight: 700, color: "#0f172a" }}>Votre plan d&apos;action</div>
          <div style={{ fontSize: "9pt", color: "#64748b" }}>{firstname} — {reportDate}</div>
        </div>

        {/* Priority actions from AI or derived */}
        <div className="section-title">Actions prioritaires</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {(legacyReport?.priority_actions ?? personneAnalysis?.recommendations?.slice(0, 3).map((r, i) => ({
            rank: i + 1,
            title: r.action,
            why: r.why,
            how: r.immediat ? "À faire immédiatement" : "À mettre en place cette semaine",
            impact: r.immediat ? "Impact immédiat" : "Impact à moyen terme",
          })) ?? worstDims.map((d, i) => ({
            rank: i + 1,
            title: `Améliorer : ${d.label}`,
            why: `Score actuel : ${scores[d.key as keyof Scores]}/100`,
            how: DIM_TIPS[d.key]?.[0] ?? "",
            impact: "Amélioration progressive",
          }))).slice(0, 4).map((action) => (
            <div key={action.rank} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 7, border: "1px solid #e2e8f0" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: action.rank === 1 ? "#ef4444" : action.rank === 2 ? "#f59e0b" : "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9pt", fontWeight: 700, flexShrink: 0 }}>
                {action.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "9.5pt", color: "#0f172a", marginBottom: 2 }}>{action.title}</div>
                {action.why && <div style={{ fontSize: "8.5pt", color: "#64748b", marginBottom: 2 }}><strong>Pourquoi :</strong> {action.why}</div>}
                {action.how && <div style={{ fontSize: "8.5pt", color: "#374151" }}><strong>Comment :</strong> {action.how}</div>}
              </div>
              <div style={{ flexShrink: 0, fontSize: "8pt", color: "#64748b", textAlign: "right", maxWidth: 80 }}>{action.impact}</div>
            </div>
          ))}
        </div>

        {/* Exercises */}
        {(legacyReport?.exercises ?? []).length > 0 && (
          <>
            <div className="section-title">Exercices recommandés</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
              {legacyReport!.exercises.slice(0, 4).map((ex, i) => (
                <div key={i} style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #d1fae5" }}>
                  <div style={{ fontWeight: 700, fontSize: "9pt", color: "#0f172a", marginBottom: 2 }}>🏋️ {ex.name}</div>
                  <div style={{ fontSize: "8.5pt", color: "#374151", marginBottom: 1 }}>{ex.target}</div>
                  <div style={{ fontSize: "8pt", color: "#64748b" }}>{ex.duration} · {ex.frequency}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Exercises from PersonneAnalysis recommendations */}
        {!legacyReport && worstDims.length > 0 && (
          <>
            <div className="section-title">Exercices recommandés</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
              {[
                { name: "Rotations cervicales", target: "Cou & nuque", duration: "2 min", frequency: "3x/jour" },
                { name: "Rétraction du menton", target: "Cervicales", duration: "1 min", frequency: "Toutes les 2h" },
                { name: "Étirement trapèzes", target: "Épaules & dos", duration: "2 min", frequency: "2x/jour" },
                { name: "Gainage abdominal", target: "Lombaires", duration: "3 × 30 s", frequency: "3x/semaine" },
              ].map((ex, i) => (
                <div key={i} style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #d1fae5" }}>
                  <div style={{ fontWeight: 700, fontSize: "9pt", color: "#0f172a", marginBottom: 2 }}>🏋️ {ex.name}</div>
                  <div style={{ fontSize: "8.5pt", color: "#374151", marginBottom: 1 }}>{ex.target}</div>
                  <div style={{ fontSize: "8pt", color: "#64748b" }}>{ex.duration} · {ex.frequency}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Products */}
        {(legacyReport?.products ?? []).filter(p => p.priority === "haute").slice(0, 3).length > 0 && (
          <>
            <div className="section-title">Équipements prioritaires</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {legacyReport!.products.filter(p => p.priority === "haute").slice(0, 3).map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "6px 10px", background: "#fffbeb", borderRadius: 6, border: "1px solid #fef3c7", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "10pt" }}>📦</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "9pt", color: "#0f172a" }}>{p.name}</div>
                    <div style={{ fontSize: "8.5pt", color: "#64748b" }}>{p.reason}</div>
                  </div>
                  <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: "7.5pt", padding: "2px 7px", borderRadius: 100, background: "#fef9c3", color: "#854d0e", fontWeight: 600 }}>Prioritaire</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Final message */}
        {legacyReport?.final_message && (
          <div style={{ background: "#f0f9ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bae6fd", fontSize: "9pt", color: "#0c4a6e", lineHeight: 1.6, fontStyle: "italic" }}>
            💬 {legacyReport.final_message}
          </div>
        )}

        <div className="page-footer">
          <span>PostureAtWork — Rapport confidentiel</span>
          <span>Page 3 / {hasVideoAnalysis ? 4 : 3}</span>
        </div>
      </div>

      {/* ════════════════════════════════════════
          PAGE 4 — ANALYSE VIDÉO AI (optional)
      ════════════════════════════════════════ */}
      {hasVideoAnalysis && (
        <div className="page">
          <div style={{ marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #0f172a", display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "14pt", fontWeight: 700, color: "#0f172a" }}>Analyse vidéo IA</div>
            <div style={{ fontSize: "9pt", color: "#64748b" }}>{firstname} — {reportDate}</div>
          </div>

          {/* Dual analysis mode */}
          {personneAnalysis && (
            <>
              <div className="section-title">Posture corporelle — Score {personneAnalysis.globalPostureScore}/100</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 12 }}>
                {Object.entries(personneAnalysis.segments).map(([key, seg]) => {
                  const labels: Record<string, string> = { tete_cou: "Tête/Cou", epaules_dos_haut: "Épaules", bas_dos_bassin: "Bas dos", membres_superieurs: "Bras", membres_inferieurs: "Jambes" };
                  return (
                    <div key={key} style={{ textAlign: "center", padding: "8px 4px", background: scoreBg(seg.score), borderRadius: 6, border: `1px solid ${seg.score >= 70 ? "#d1fae5" : seg.score >= 50 ? "#fef3c7" : "#fee2e2"}` }}>
                      <div style={{ fontSize: "12pt", fontWeight: 700, color: scoreColor(seg.score) }}>{seg.score}</div>
                      <div style={{ fontSize: "7.5pt", color: "#374151", marginTop: 2 }}>{labels[key] ?? key}</div>
                    </div>
                  );
                })}
              </div>

              {personneAnalysis.mainIssues.slice(0, 3).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: "9pt", color: "#374151", marginBottom: 5 }}>Problèmes identifiés :</div>
                  {personneAnalysis.mainIssues.slice(0, 3).map((issue, i) => (
                    <div key={i} style={{ padding: "5px 0", borderBottom: "0.5px solid #f1f5f9", display: "flex", gap: 6, fontSize: "8.5pt" }}>
                      <span style={{ color: issue.severity === "élevé" ? "#dc2626" : issue.severity === "modéré" ? "#d97706" : "#2d9e6b", fontWeight: 600, flexShrink: 0 }}>{issue.zone}</span>
                      <span style={{ color: "#374151" }}>{issue.issue}</span>
                    </div>
                  ))}
                </div>
              )}

              {personneAnalysis.overallAssessment && (
                <div style={{ background: "#f0f9ff", borderRadius: 6, padding: "8px 12px", border: "1px solid #bae6fd", fontSize: "8.5pt", color: "#0c4a6e", lineHeight: 1.55, marginBottom: 16 }}>
                  {personneAnalysis.overallAssessment}
                </div>
              )}
            </>
          )}

          {posteAnalysis && (
            <>
              <div className="section-title">Poste de travail — Score {posteAnalysis.globalSetupScore}/100</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
                {[
                  { key: "ecran",        label: "Écran" },
                  { key: "clavier_souris", label: "Clavier/Souris" },
                  { key: "chaise",       label: "Chaise" },
                  { key: "organisation", label: "Organisation" },
                ].map(({ key, label }) => {
                  const el = posteAnalysis.elements[key as keyof typeof posteAnalysis.elements];
                  return (
                    <div key={key} style={{ textAlign: "center", padding: "8px 4px", background: scoreBg(el.score), borderRadius: 6, border: `1px solid ${el.score >= 70 ? "#d1fae5" : el.score >= 50 ? "#fef3c7" : "#fee2e2"}` }}>
                      <div style={{ fontSize: "12pt", fontWeight: 700, color: scoreColor(el.score) }}>{el.score}</div>
                      <div style={{ fontSize: "7.5pt", color: "#374151", marginTop: 2 }}>{label}</div>
                    </div>
                  );
                })}
              </div>

              {posteAnalysis.mainIssues.slice(0, 3).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: "9pt", color: "#374151", marginBottom: 5 }}>Corrections recommandées :</div>
                  {posteAnalysis.mainIssues.slice(0, 3).map((issue, i) => (
                    <div key={i} style={{ padding: "5px 0", borderBottom: "0.5px solid #f1f5f9", display: "flex", gap: 6, fontSize: "8.5pt" }}>
                      <span style={{ color: issue.severity === "élevé" ? "#dc2626" : issue.severity === "modéré" ? "#d97706" : "#2d9e6b", fontWeight: 600, flexShrink: 0, minWidth: 70 }}>{issue.element}</span>
                      <span style={{ color: "#374151", flex: 1 }}>{issue.issue}</span>
                      {issue.fix && <span style={{ color: "#64748b", fontStyle: "italic" }}>{issue.fix}</span>}
                    </div>
                  ))}
                </div>
              )}

              {posteAnalysis.overallAssessment && (
                <div style={{ background: "#f0fdf4", borderRadius: 6, padding: "8px 12px", border: "1px solid #d1fae5", fontSize: "8.5pt", color: "#14532d", lineHeight: 1.55, marginBottom: 12 }}>
                  {posteAnalysis.overallAssessment}
                </div>
              )}
            </>
          )}

          {/* Legacy analysis mode */}
          {legacyReport && !personneAnalysis && (
            <>
              <div className="section-title">Analyse posturale — Score {legacyReport.posture_analysis.score}/100</div>
              <div style={{ marginBottom: 12, fontSize: "9pt", color: "#374151", lineHeight: 1.6 }}>
                {legacyReport.posture_analysis.overall_observation}
              </div>
              {[
                { key: "head_position",  label: "Position tête" },
                { key: "neck_position",  label: "Nuque" },
                { key: "shoulders",      label: "Épaules" },
                { key: "trunk",          label: "Tronc" },
              ].map(({ key, label }) => {
                const item = legacyReport.posture_analysis[key as "head_position" | "neck_position" | "shoulders" | "trunk"];
                return (
                  <div key={key} style={{ padding: "5px 0", borderBottom: "0.5px solid #f1f5f9", display: "flex", gap: 8, alignItems: "flex-start", fontSize: "8.5pt" }}>
                    <span style={{ minWidth: 80, fontWeight: 600, color: "#374151" }}>{label}</span>
                    <span style={{ color: item.status === "bon" ? "#2d9e6b" : item.status === "attention" ? "#d97706" : "#dc2626", fontWeight: 600, minWidth: 60 }}>{item.status}</span>
                    <span style={{ color: "#374151", flex: 1 }}>{item.observation}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "7.5pt", color: "#94a3b8", lineHeight: 1.5, textAlign: "center" }}>
              Ce rapport est généré automatiquement par PostureAtWork à des fins d&apos;information.
              Il ne remplace pas un avis médical. En cas de douleurs persistantes, consultez un professionnel de santé.
              © PostureAtWork {new Date().getFullYear()} — postureatwork.com
            </div>
          </div>

          <div className="page-footer">
            <span>PostureAtWork — Rapport confidentiel</span>
            <span>Page 4 / 4</span>
          </div>
        </div>
      )}

      {/* Disclaimer on last page (no video) */}
      {!hasVideoAnalysis && (
        <div style={{ width: "210mm", margin: "0 auto", padding: "8mm 16mm", textAlign: "center" }}>
          <div style={{ fontSize: "7.5pt", color: "#94a3b8", lineHeight: 1.5 }}>
            Ce rapport est généré automatiquement par PostureAtWork à des fins d&apos;information.
            Il ne remplace pas un avis médical. En cas de douleurs persistantes, consultez un professionnel de santé.
            © PostureAtWork {new Date().getFullYear()} — postureatwork.com
          </div>
        </div>
      )}
    </>
  );
}
