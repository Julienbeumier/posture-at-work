"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const sc = (s: number) => s >= 70 ? "#15803d" : s >= 50 ? "#b45309" : "#b91c1c";
const sb = (s: number) => s >= 70 ? "#dcfce7" : s >= 50 ? "#fef3c7" : "#fee2e2";
const sl = (s: number) => s >= 70 ? "Bon" : s >= 50 ? "À améliorer" : "Critique";

function scoreColor(s: number) {
  return s >= 70 ? "#15803d" : s >= 50 ? "#b45309" : "#b91c1c";
}

const DIM_META: Record<string, { label: string; emoji: string }> = {
  setup:        { label: "Setup & ergonomie",   emoji: "💻" },
  habits:       { label: "Habitudes de travail", emoji: "⏱️" },
  pain:         { label: "Douleurs",             emoji: "🩺" },
  sleep_energy: { label: "Sommeil & énergie",    emoji: "🌙" },
  nutrition:    { label: "Nutrition",            emoji: "🍽️" },
  lifestyle:    { label: "Mode de vie actif",    emoji: "🏃" },
};

interface EmployeeRow {
  anonymous_id: string;
  global_score: number | null;
  scores: Record<string, number> | null;
  job_type: "bureau" | "debout" | null;
  assessed_at: string | null;
}

interface Company {
  name: string;
  plan: string;
  contact_name: string;
}

export default function EntrepriseRapportPDF() {
  const router = useRouter();
  const supabase = createClient();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entreprise/login"); return; }

      const res = await fetch("/api/entreprise/dashboard-data");
      if (!res.ok) { router.push("/entreprise/login"); return; }

      const data = await res.json();
      setCompany(data.company);
      setEmployees(data.employees ?? []);
      setLoading(false);

      setTimeout(() => window.print(), 800);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", color: "#6b7280" }}>
        Génération du rapport…
      </div>
    );
  }

  const assessed = employees.filter(e => e.global_score !== null);
  const bureauGroup = assessed.filter(e => e.job_type === "bureau");
  const deboutGroup = assessed.filter(e => e.job_type === "debout");
  const participation = employees.length > 0 ? Math.round((assessed.length / employees.length) * 100) : 0;

  function avgDim(group: EmployeeRow[], key: string) {
    const vals = group.map(e => e.scores?.[key]).filter((v): v is number => v !== null && v !== undefined);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }

  function avgGlobal(group: EmployeeRow[]) {
    const vals = group.map(e => e.global_score).filter((v): v is number => v !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }

  const globalAvg = avgGlobal(assessed);
  const bureauAvg = avgGlobal(bureauGroup);
  const deboutAvg = avgGlobal(deboutGroup);
  const criticalCount = assessed.filter(e => (e.global_score ?? 0) < 50).length;
  const criticalPct = assessed.length ? Math.round((criticalCount / assessed.length) * 100) : 0;
  const hasGroups = bureauGroup.length > 0 && deboutGroup.length > 0;

  const dimAvgs = Object.entries(DIM_META).map(([key, meta]) => ({
    key, meta,
    global: avgDim(assessed, key),
    bureau: avgDim(bureauGroup, key),
    debout: avgDim(deboutGroup, key),
  }));

  const shs = !globalAvg || participation < 50 ? "—"
    : globalAvg >= 70 && participation >= 80 ? "Gold 🥇"
    : globalAvg >= 55 && participation >= 60 ? "Silver 🥈"
    : "Bronze 🥉";

  const shsColor = shs.includes("Gold") ? "#b45309" : shs.includes("Silver") ? "#64748b" : shs.includes("Bronze") ? "#b45309" : "#6b7280";

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { width: 210mm; min-height: 297mm; padding: 14mm 16mm; margin: 0 auto; background: #fff; position: relative; }
        .page + .page { page-break-before: always; }
        h1 { font-size: 20pt; font-weight: 800; color: #111827; }
        h2 { font-size: 12pt; font-weight: 700; color: #111827; margin-bottom: 10px; }
        h3 { font-size: 10pt; font-weight: 700; color: #374151; margin-bottom: 6px; }
        p { font-size: 9pt; line-height: 1.6; color: #374151; }
        .pill { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 8pt; font-weight: 700; }
        .tag { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 7.5pt; background: #f1f5f9; color: #64748b; margin: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        th { padding: 6px 8px; text-align: left; font-weight: 700; background: #f8fafc; color: #374151; border-bottom: 1.5px solid #e2e8f0; }
        td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #374151; vertical-align: top; }
        .section { margin-bottom: 18px; }
        .bar-track { height: 7px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
        .divider { border: none; border-top: 1px solid #e5e7eb; margin: 14px 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
          .page { margin: 0; padding: 12mm 14mm; }
        }
      `}</style>

      {/* Bouton impression — masqué à l'impression */}
      <div className="no-print" style={{ position: "fixed", top: 16, right: 16, zIndex: 100, display: "flex", gap: 8 }}>
        <button onClick={() => window.print()} style={{ padding: "10px 20px", borderRadius: 8, background: "#2b5ce6", color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          🖨️ Imprimer / Télécharger PDF
        </button>
        <button onClick={() => router.back()} style={{ padding: "10px 20px", borderRadius: 8, background: "#f1f5f9", color: "#374151", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          ← Retour
        </button>
      </div>

      {/* ── PAGE 1 — SYNTHÈSE GÉNÉRALE ── */}
      <div className="page">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 14, borderBottom: "2px solid #2b5ce6" }}>
          <div>
            <div style={{ fontSize: "8pt", fontWeight: 700, letterSpacing: "0.12em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 4 }}>
              PostureAtWork · Rapport de synthèse ergonomique
            </div>
            <h1>{company?.name}</h1>
            <p style={{ marginTop: 4, color: "#64748b" }}>
              {company?.contact_name} · Plan {company?.plan} · Généré le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 900, fontSize: "28pt", color: globalAvg ? scoreColor(globalAvg) : "#94a3b8" }}>
              {globalAvg ?? "—"}
            </div>
            <div style={{ fontSize: "8pt", color: "#64748b" }}>Score santé /100</div>
            <div style={{ marginTop: 6, fontSize: "9pt", fontWeight: 700, color: shsColor }}>
              {shs} Score Santé Sociale
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="section">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Employés inscrits", value: employees.length },
              { label: "Bilans complétés", value: assessed.length },
              { label: "Participation", value: `${participation}%` },
              { label: "En zone critique", value: criticalCount },
            ].map((k, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ fontSize: "18pt", fontWeight: 800, color: "#111827" }}>{k.value}</div>
                <div style={{ fontSize: "7.5pt", color: "#64748b", marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Synthèse narrative */}
        <div className="section">
          <h2>Synthèse générale</h2>
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 10 }}>
            <p>
              {criticalPct > 40
                ? `⚠️ Situation préoccupante — ${criticalPct}% de vos employés (${criticalCount} personnes) sont en zone critique (score inférieur à 50/100). Une intervention rapide est recommandée.`
                : criticalPct > 20
                ? `🟠 Situation à surveiller — ${criticalPct}% de vos employés nécessitent une attention particulière dans les prochaines semaines.`
                : `✅ Situation globalement satisfaisante — seulement ${criticalPct}% d'employés en zone critique.`
              }
              {hasGroups && ` L'analyse révèle des profils de risque distincts entre l'équipe bureau (${bureauGroup.length} personnes, score moyen ${bureauAvg}/100) et l'équipe debout/entrepôt (${deboutGroup.length} personnes, score moyen ${deboutAvg}/100).`}
            </p>
          </div>
        </div>

        {/* Scores par dimension */}
        <div className="section">
          <h2>Scores moyens par dimension</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: "28%" }}>Dimension</th>
                <th style={{ width: "14%", textAlign: "center" }}>Global</th>
                {hasGroups && <th style={{ width: "14%", textAlign: "center" }}>Bureau</th>}
                {hasGroups && <th style={{ width: "14%", textAlign: "center" }}>Debout</th>}
                <th>Barre</th>
                <th style={{ width: "14%", textAlign: "center" }}>Niveau</th>
              </tr>
            </thead>
            <tbody>
              {dimAvgs.map(({ key, meta, global, bureau, debout }) => (
                <tr key={key}>
                  <td style={{ fontWeight: 600 }}>{meta.emoji} {meta.label}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className="pill" style={{ background: global ? sb(global) : "#f1f5f9", color: global ? sc(global) : "#94a3b8" }}>
                      {global ?? "—"}
                    </span>
                  </td>
                  {hasGroups && <td style={{ textAlign: "center", color: "#64748b", fontSize: "8.5pt" }}>{bureau ?? "—"}</td>}
                  {hasGroups && <td style={{ textAlign: "center", color: "#64748b", fontSize: "8.5pt" }}>{debout ?? "—"}</td>}
                  <td style={{ paddingTop: 10 }}>
                    <div className="bar-track">
                      <div style={{ width: `${global ?? 0}%`, height: "100%", background: global ? scoreColor(global) : "#e2e8f0", borderRadius: 100 }} />
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="pill" style={{ background: global ? sb(global) : "#f1f5f9", color: global ? sc(global) : "#94a3b8", fontSize: "7.5pt" }}>
                      {global ? sl(global) : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="divider" />

        {/* Troubles identifiés */}
        <div className="section">
          <h2>Troubles identifiés par zone anatomique</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Zone</th>
                <th style={{ width: "14%" }}>Niveau de risque</th>
                <th>Analyse</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  zone: "Nuque & cervicales",
                  score: avgDim(assessed, "pain") ?? 0,
                  detail: hasGroups
                    ? `Bureau : douleurs cervicales liées aux écrans trop bas (setup ${bureauAvg}/100). Debout : tensions par port de charges en hauteur.`
                    : `Douleurs cervicales liées à la posture de travail. Score douleurs : ${avgDim(assessed, "pain")}/100`,
                },
                {
                  zone: "Bas du dos & lombaires",
                  score: avgDim(assessed, "habits") ?? 0,
                  detail: hasGroups
                    ? `Bureau : compression discale par position assise prolongée (habitudes ${avgDim(bureauGroup, "habits")}/100). Debout : lombalgies par manutention sans formation.`
                    : `Lombalgies liées aux habitudes de travail. Score habitudes : ${avgDim(assessed, "habits")}/100`,
                },
                {
                  zone: "Épaules & membres supérieurs",
                  score: avgDim(assessed, "setup") ?? 0,
                  detail: `Positionnement clavier/souris inadapté et gestes répétitifs. Score setup : ${avgDim(assessed, "setup")}/100`,
                },
                {
                  zone: "Jambes & pieds",
                  score: deboutGroup.length > 0 ? (avgDim(deboutGroup, "pain") ?? 0) : 70,
                  detail: deboutGroup.length > 0
                    ? `Spécifique équipe debout — jambes lourdes, fatigue plantaire. Score douleurs debout : ${avgDim(deboutGroup, "pain")}/100`
                    : "Zone peu concernée pour les postes bureau.",
                },
              ].map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{t.zone}</td>
                  <td>
                    <span className="pill" style={{ background: sb(t.score), color: sc(t.score), fontSize: "7.5pt" }}>
                      {sl(t.score)}
                    </span>
                  </td>
                  <td style={{ fontSize: "8.5pt", lineHeight: 1.5 }}>{t.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer page 1 */}
        <div style={{ position: "absolute", bottom: "12mm", left: "16mm", right: "16mm", borderTop: "1px solid #e5e7eb", paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "7.5pt", color: "#94a3b8" }}>PostureAtWork · Rapport confidentiel · {company?.name}</span>
          <span style={{ fontSize: "7.5pt", color: "#94a3b8" }}>Page 1 / 2</span>
        </div>
      </div>

      {/* ── PAGE 2 — PLAN D'ACTION & ÉQUIPE ── */}
      <div className="page">

        {/* Header page 2 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "8pt", fontWeight: 700, color: "#2b5ce6", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            PostureAtWork · {company?.name} · Plan d&apos;action & Équipe
          </div>
          <div style={{ fontSize: "8pt", color: "#94a3b8" }}>{new Date().toLocaleDateString("fr-FR")}</div>
        </div>

        {/* Plan d'action */}
        <div className="section">
          <h2>Plan d&apos;action recommandé</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: "18%" }}>Horizon</th>
                <th>Actions recommandées</th>
                <th style={{ width: "20%" }}>Impact attendu</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  horizon: "Cette semaine",
                  color: "#dc2626",
                  actions: [
                    avgDim(assessed, "setup") !== null && (avgDim(assessed, "setup") ?? 100) < 60
                      ? "Inventaire des postes sans rehausseur d'écran et sans clavier externe"
                      : null,
                    "Envoi du programme d'exercices collectif à toutes les équipes",
                    `Identifier les ${criticalCount} employés en zone critique et les rencontrer`,
                  ].filter(Boolean) as string[],
                  impact: "Réduction immédiate des facteurs de risque les plus simples",
                },
                {
                  horizon: "Dans le mois",
                  color: "#d97706",
                  actions: [
                    avgDim(assessed, "setup") !== null && (avgDim(assessed, "setup") ?? 100) < 60
                      ? "Équiper les postes bureau critiques : rehausseur + clavier externe (~60€/poste)"
                      : null,
                    deboutGroup.length > 0 ? "Installer des tapis anti-fatigue aux postes debout fixes (~45€/poste)" : null,
                    "Mettre en place des pauses actives toutes les 45 minutes",
                    "Organiser une session formation gestes et postures",
                  ].filter(Boolean) as string[],
                  impact: "Amélioration des scores setup et habitudes sur 4-6 semaines",
                },
                {
                  horizon: "Dans les 3 mois",
                  color: "#15803d",
                  actions: [
                    "Refaire passer les bilans PAW pour mesurer l'évolution",
                    "Intégrer les résultats dans votre reporting ESG Social (pilier S)",
                    "Planifier le call de restitution trimestriel avec le kinésithérapeute PAW",
                  ],
                  impact: "Suivi de l'évolution et valorisation ESG",
                },
              ].map((phase, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ fontWeight: 700, color: phase.color, fontSize: "8.5pt" }}>{phase.horizon}</span>
                  </td>
                  <td>
                    {phase.actions.map((a, j) => (
                      <div key={j} style={{ display: "flex", gap: 6, marginBottom: 3, fontSize: "8.5pt" }}>
                        <span style={{ color: phase.color, flexShrink: 0 }}>→</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </td>
                  <td style={{ fontSize: "8pt", color: "#64748b", fontStyle: "italic" }}>{phase.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="divider" />

        {/* Liste employés */}
        <div className="section">
          <h2>Détail par employé (anonymisé)</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: "18%" }}>Employé</th>
                <th style={{ width: "12%", textAlign: "center" }}>Profil</th>
                <th style={{ width: "12%", textAlign: "center" }}>Score global</th>
                <th style={{ width: "12%", textAlign: "center" }}>Niveau</th>
                {Object.entries(DIM_META).slice(0, 4).map(([key, meta]) => (
                  <th key={key} style={{ textAlign: "center", fontSize: "7.5pt" }}>{meta.emoji}</th>
                ))}
                <th style={{ width: "14%" }}>Date bilan</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, fontSize: "8.5pt" }}>{emp.anonymous_id}</td>
                  <td style={{ textAlign: "center", fontSize: "8pt" }}>
                    {emp.job_type === "bureau" ? "💻" : emp.job_type === "debout" ? "🏭" : "—"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {emp.global_score ? (
                      <span className="pill" style={{ background: sb(emp.global_score), color: sc(emp.global_score), fontSize: "7.5pt" }}>
                        {emp.global_score}
                      </span>
                    ) : <span style={{ color: "#94a3b8", fontSize: "8pt" }}>—</span>}
                  </td>
                  <td style={{ textAlign: "center", fontSize: "7.5pt", color: emp.global_score ? sc(emp.global_score) : "#94a3b8" }}>
                    {emp.global_score ? sl(emp.global_score) : "Pas de bilan"}
                  </td>
                  {Object.entries(DIM_META).slice(0, 4).map(([key]) => (
                    <td key={key} style={{ textAlign: "center", fontSize: "8pt" }}>
                      {emp.scores?.[key] ? (
                        <span style={{ color: sc(emp.scores[key]) }}>{emp.scores[key]}</span>
                      ) : "—"}
                    </td>
                  ))}
                  <td style={{ fontSize: "8pt", color: "#64748b" }}>
                    {emp.assessed_at ? new Date(emp.assessed_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div style={{ position: "absolute", bottom: "12mm", left: "16mm", right: "16mm" }}>
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "7pt", color: "#94a3b8", lineHeight: 1.5 }}>
              Ce rapport est généré par PostureAtWork sur la base des bilans complétés par vos employés.<br />
              Il ne remplace pas un avis médical. Conçu par Julien Beumier, kinésithérapeute. © PostureAtWork {new Date().getFullYear()}
            </span>
            <span style={{ fontSize: "7.5pt", color: "#94a3b8" }}>Page 2 / 2</span>
          </div>
        </div>
      </div>
    </>
  );
}
