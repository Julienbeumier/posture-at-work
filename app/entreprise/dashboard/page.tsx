"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import type { Company } from "@/lib/supabase";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const DIM_META: Record<string, { label: string; emoji: string; color: string; type: "employeur" | "employe" }> = {
  setup:        { label: "Setup & ergonomie",  emoji: "💻", color: "#7c9fff",  type: "employeur" },
  habits:       { label: "Habitudes de travail", emoji: "⏱️", color: "#f4a261", type: "employeur" },
  pain:         { label: "Douleurs",            emoji: "🩺", color: "#f09595", type: "employeur" },
  sleep_energy: { label: "Sommeil & énergie",   emoji: "🌙", color: "#74c69d", type: "employe" },
  nutrition:    { label: "Nutrition",           emoji: "🍽️", color: "#a78bfa", type: "employe" },
  lifestyle:    { label: "Mode de vie actif",   emoji: "🏃", color: "#5dcaa5", type: "employe" },
};

const ACTIONS_BY_DIM: Record<string, { action: string; impact: string }> = {
  setup: { action: "Auditer les postes de travail — écrans, chaises, claviers", impact: "Impact direct sur 3 dimensions" },
  habits: { action: "Mettre en place des pauses actives toutes les 45 minutes", impact: "Réduction immédiate des TMS chroniques" },
  pain: { action: "Identifier les postes à risque et adapter l'environnement", impact: "Prévention des arrêts de travail" },
  sleep_energy: { action: "Sensibiliser aux bonnes pratiques de récupération", impact: "Amélioration de la productivité globale" },
  nutrition: { action: "Proposer des options santé à la cafétéria ou espace repas", impact: "Réduction de la fatigue post-déjeuner" },
  lifestyle: { action: "Encourager la mobilité douce (vélo, marche à midi)", impact: "Compensation de la sédentarité" },
};

const EXERCISES_BY_PROFILE: Record<string, { name: string; duration: string; desc: string; emoji: string }[]> = {
  bureau: [
    { name: "Rétraction cervicale", duration: "10 rép. × 3", desc: "Contre la projection de la tête vers l'avant — typique du laptop.", emoji: "🧘" },
    { name: "Ouverture pectorale au mur", duration: "45 sec × 2", desc: "Contre les épaules enroulées. Idéal après 2h de bureau.", emoji: "🤸" },
    { name: "Cat-Cow assis", duration: "10 cycles", desc: "Mobilisation complète de la colonne sur la chaise.", emoji: "🐱" },
    { name: "Rotation thoracique", duration: "10 rép. × 2", desc: "Déverrouille le dos moyen bloqué par la position assise.", emoji: "🔄" },
  ],
  debout: [
    { name: "Étirement mollets au mur", duration: "45 sec × 2", desc: "Prévient l'insuffisance veineuse et les crampes nocturnes.", emoji: "🦵" },
    { name: "Flexion lombaire debout", duration: "30 sec × 3", desc: "Soulage le bas du dos après stations debout prolongées.", emoji: "🌿" },
    { name: "Rotation des épaules", duration: "15 rép. × 2", desc: "Libère les tensions des trapèzes — manutention et postures statiques.", emoji: "💪" },
    { name: "Équilibre unipodal", duration: "30 sec × 2", desc: "Renforce les stabilisateurs de cheville et genou.", emoji: "🦅" },
  ],
};

const RESOURCES = [
  {
    category: "Ergonomie bureau",
    color: "#2b5ce6",
    items: [
      {
        title: "Travail sur écran : les bonnes pratiques",
        source: "INRS",
        type: "video" as const,
        url: "https://www.youtube.com/watch?v=QMnl4tSGBiA",
        desc: "Guide officiel INRS — réglages du poste, posture, organisation du travail.",
      },
      {
        title: "Ergonomie et télétravail — prévenir les risques",
        source: "ANACT",
        type: "video" as const,
        url: "https://www.youtube.com/watch?v=7h9f3H_JNWQ",
        desc: "Adapter son poste à domicile pour éviter les TMS.",
      },
    ],
  },
  {
    category: "Manutention & postures debout",
    color: "#d4622a",
    items: [
      {
        title: "Manutentions manuelles et TMS en milieu industriel",
        source: "INRS",
        type: "video" as const,
        url: "https://www.youtube.com/watch?v=fr_H09bOTio",
        desc: "Principes de base pour protéger son dos lors des manutentions.",
      },
      {
        title: "5 principes de manutention manuelle",
        source: "IRSST",
        type: "video" as const,
        url: "https://www.youtube.com/watch?v=VRfM5Sjtw6A",
        desc: "Méthode complète en 5 étapes basée sur la recherche scientifique.",
      },
    ],
  },
  {
    category: "Guides pratiques",
    color: "#1d9e75",
    items: [
      {
        title: "Guide ergonomie du poste de travail",
        source: "INRS",
        type: "guide" as const,
        url: "https://www.inrs.fr/risques/travail-ecran/publications-outils-liens.html",
        desc: "Publication officielle ED 924 — checklist complète pour l'employeur.",
      },
      {
        title: "Prévention des TMS — dossier complet",
        source: "INRS",
        type: "guide" as const,
        url: "https://www.inrs.fr/risques/tms-troubles-musculosquelettiques/ce-qu-il-faut-retenir.html",
        desc: "Tout ce qu'un employeur doit savoir sur la prévention TMS.",
      },
    ],
  },
];

function scoreColor(s: number) {
  return s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595";
}

function scoreZone(s: number) {
  return s >= 70 ? "Bon" : s >= 50 ? "À améliorer" : "Critique";
}

interface EmployeeRow {
  anonymous_id: string;
  joined_at: string;
  global_score: number | null;
  scores: Record<string, number> | null;
  assessed_at: string | null;
}

export default function EntrepriseDashboard() {
  const { c } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "exercises" | "resources">("overview");
  const [activeProfile, setActiveProfile] = useState<"bureau" | "debout">("bureau");
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entreprise/login"); return; }

      const res = await fetch("/api/entreprise/dashboard-data");
      if (!res.ok) { router.push("/entreprise/login"); return; }

      const data = await res.json();
      setCompany(data.company);
      setEmployees(data.employees ?? []);

      if (data.inviteCode) {
        setInviteCode(data.inviteCode);
        setInviteUrl(`https://postureatwork.com/join/${data.inviteCode}`);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function generateNewCode() {
    if (!company) return;
    setGeneratingCode(true);
    const res = await fetch("/api/entreprise/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: company.id }),
    });
    const data = await res.json();
    setInviteCode(data.code);
    setInviteUrl(data.inviteUrl);
    setGeneratingCode(false);
  }

  function copyInviteUrl() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const assessed = employees.filter(e => e.global_score !== null);
  const participation = employees.length > 0 ? Math.round((assessed.length / employees.length) * 100) : 0;
  const avgGlobal = assessed.length
    ? Math.round(assessed.reduce((sum, e) => sum + (e.global_score ?? 0), 0) / assessed.length)
    : null;

  const zoneCounts = {
    critique: assessed.filter(e => (e.global_score ?? 0) < 50).length,
    ameliorer: assessed.filter(e => (e.global_score ?? 0) >= 50 && (e.global_score ?? 0) < 70).length,
    bon: assessed.filter(e => (e.global_score ?? 0) >= 70).length,
  };

  const dimAvgs = Object.entries(DIM_META).map(([key, meta]) => {
    const vals = assessed.map(e => e.scores?.[key]).filter((v): v is number => v !== undefined && v !== null);
    return {
      key,
      meta,
      avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null,
    };
  });

  const employerDims = dimAvgs.filter(d => d.meta.type === "employeur");
  const employeeDims = dimAvgs.filter(d => d.meta.type === "employe");

  // Top 3 actions prioritaires — dimensions les plus basses côté employeur
  const priorityActions = [...employerDims]
    .filter(d => d.avg !== null)
    .sort((a, b) => (a.avg ?? 100) - (b.avg ?? 100))
    .slice(0, 3);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>Chargement du dashboard…</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontFamily: T.b, fontSize: 11, color: "#7c9fff", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                🏢 Dashboard RH
              </p>
              <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: c.textPrimary, margin: "0 0 4px" }}>
                {company?.name}
              </h1>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0 }}>
                Plan {company?.plan} · {employees.length} employé{employees.length > 1 ? "s" : ""} inscrit{employees.length > 1 ? "s" : ""} · {assessed.length} bilan{assessed.length > 1 ? "s" : ""} complété{assessed.length > 1 ? "s" : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {inviteUrl && (
                <button onClick={copyInviteUrl} style={{
                  padding: "9px 16px", borderRadius: 100, border: "none",
                  background: copied ? "#1d9e75" : "rgba(43,92,230,0.15)",
                  color: copied ? "#fff" : "#7c9fff",
                  fontFamily: T.b, fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>
                  {copied ? "✓ Lien copié !" : "🔗 Inviter des employés"}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── SCORE SANTÉ ENTREPRISE ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{
            borderRadius: 20, padding: "28px", marginBottom: 20,
            background: avgGlobal ? `${scoreColor(avgGlobal)}08` : c.bgCard,
            border: `0.5px solid ${avgGlobal ? scoreColor(avgGlobal) + "30" : c.border}`,
            display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 24, alignItems: "center",
          }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: avgGlobal ? `${scoreColor(avgGlobal)}15` : c.bgCard2,
              border: `3px solid ${avgGlobal ? scoreColor(avgGlobal) : c.border}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: avgGlobal ? scoreColor(avgGlobal) : c.textMuted, lineHeight: 1 }}>
                {avgGlobal ?? "—"}
              </span>
              <span style={{ fontFamily: T.b, fontSize: 9, color: c.textMuted }}>/ 100</span>
            </div>
            <p style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted, margin: "6px 0 0", textAlign: "center" }}>Score santé</p>
          </div>

          <div>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: c.textPrimary, margin: "0 0 4px" }}>
              Score santé entreprise
            </p>
            <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>
              {avgGlobal
                ? avgGlobal >= 70 ? "Vos équipes sont en bonne santé ergonomique. Continuez le suivi."
                : avgGlobal >= 50 ? "Des améliorations sont possibles. Consultez les actions prioritaires ci-dessous."
                : "Attention — plusieurs dimensions nécessitent une action rapide."
                : "Aucun bilan complété pour l'instant."}
            </p>
          </div>

          {[
            { label: "Zone critique", value: zoneCounts.critique, color: "#f09595", bg: "rgba(240,149,149,0.10)" },
            { label: "À améliorer", value: zoneCounts.ameliorer, color: "#f4a261", bg: "rgba(244,162,97,0.10)" },
            { label: "Bon niveau", value: zoneCounts.bon, color: "#74c69d", bg: "rgba(116,198,157,0.10)" },
          ].map((z, i) => (
            <div key={i} style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: z.bg }}>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: z.color, margin: "0 0 4px" }}>{z.value}</p>
              <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>{z.label}</p>
            </div>
          ))}

          <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: c.bgCard2 }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: "#2b5ce6", margin: "0 0 4px" }}>{participation}%</p>
            <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>Participation</p>
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{
            display: "flex", gap: 4, padding: 4, borderRadius: 14,
            background: c.bgCard2, border: `0.5px solid ${c.border}`,
            marginBottom: 20,
          }}>
          {([
            { key: "overview", label: "📊 Vue d'ensemble" },
            { key: "employees", label: "👥 Équipe" },
            { key: "exercises", label: "🏋️ Exercices" },
            { key: "resources", label: "📚 Ressources" },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
              background: activeTab === tab.key ? "#2b5ce6" : "transparent",
              color: activeTab === tab.key ? "#fff" : c.textMuted,
              fontFamily: T.b, fontWeight: 600, fontSize: 13,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── TAB OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

              {/* Actions prioritaires */}
              {priorityActions.length > 0 && (
                <div style={{ borderRadius: 20, padding: "24px", background: "rgba(226,75,74,0.05)", border: "0.5px solid rgba(226,75,74,0.2)", marginBottom: 16 }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 4 }}>
                    🎯 Actions prioritaires pour votre équipe
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 18 }}>
                    Basées sur les scores les plus bas de vos employés — sur les dimensions que vous pouvez directement améliorer.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {priorityActions.map(({ key, meta, avg }, i) => (
                      <div key={key} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                        borderRadius: 12, background: c.bgCard, border: `0.5px solid ${c.border}`,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: `${scoreColor(avg ?? 0)}15`, border: `1.5px solid ${scoreColor(avg ?? 0)}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: T.h, fontWeight: 900, fontSize: 12, color: scoreColor(avg ?? 0),
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: "0 0 2px" }}>
                            {ACTIONS_BY_DIM[key].action}
                          </p>
                          <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>
                            {meta.emoji} {meta.label} · Score moyen : <span style={{ color: scoreColor(avg ?? 0), fontWeight: 600 }}>{avg}/100</span> · {ACTIONS_BY_DIM[key].impact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Split employeur / employé */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                {/* Côté employeur */}
                <div style={{ borderRadius: 20, padding: "22px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>
                    🏢 Dimensions employeur
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 16 }}>
                    Vous pouvez agir directement sur ces scores.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {employerDims.map(({ key, meta, avg }) => (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary }}>{meta.emoji} {meta.label}</span>
                          <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: avg ? scoreColor(avg) : c.textMuted }}>{avg ?? "—"}</span>
                        </div>
                        <div style={{ height: 6, background: c.bgCard2, borderRadius: 100, overflow: "hidden" }}>
                          <motion.div
                            style={{ height: "100%", borderRadius: 100, background: avg ? scoreColor(avg) : c.border }}
                            initial={{ width: 0 }}
                            animate={{ width: avg ? `${avg}%` : "0%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Côté employé */}
                <div style={{ borderRadius: 20, padding: "22px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>
                    👤 Dimensions personnelles
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 16 }}>
                    PAW guide chaque employé individuellement sur ces points.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {employeeDims.map(({ key, meta, avg }) => (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary }}>{meta.emoji} {meta.label}</span>
                          <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: avg ? scoreColor(avg) : c.textMuted }}>{avg ?? "—"}</span>
                        </div>
                        <div style={{ height: 6, background: c.bgCard2, borderRadius: 100, overflow: "hidden" }}>
                          <motion.div
                            style={{ height: "100%", borderRadius: 100, background: avg ? scoreColor(avg) : c.border }}
                            initial={{ width: 0 }}
                            animate={{ width: avg ? `${avg}%` : "0%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "0.5px solid rgba(124,58,237,0.15)" }}>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: "#a78bfa", margin: 0, lineHeight: 1.55 }}>
                      💡 Ces dimensions sont personnelles — PAW accompagne chaque employé avec des conseils adaptés et des exercices ciblés dans son espace individuel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Invitation */}
              <div style={{ borderRadius: 20, padding: "22px 24px", background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.18)" }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>
                  🔗 Lien d&apos;invitation
                </p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 14 }}>
                  {employees.length - assessed.length > 0
                    ? `${employees.length - assessed.length} employé${employees.length - assessed.length > 1 ? "s n'ont" : " n'a"} pas encore complété son bilan.`
                    : "Partagez ce lien pour inviter de nouveaux employés."}
                </p>
                {inviteUrl ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, padding: "11px 14px", borderRadius: 12, background: c.bgCard, border: `1px solid ${c.border2}`, fontFamily: T.b, fontSize: 13, color: c.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inviteUrl}
                    </div>
                    <button onClick={copyInviteUrl} style={{ padding: "11px 18px", borderRadius: 12, border: "none", background: copied ? "#1d9e75" : "#2b5ce6", color: "#fff", fontFamily: T.h, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                      {copied ? "✓ Copié !" : "Copier"}
                    </button>
                  </div>
                ) : (
                  <button onClick={generateNewCode} disabled={generatingCode} style={{ padding: "12px 24px", borderRadius: 100, border: "none", background: "#2b5ce6", color: "#fff", fontFamily: T.h, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: generatingCode ? 0.7 : 1 }}>
                    {generatingCode ? "Génération…" : "Générer un lien d'invitation"}
                  </button>
                )}
                {inviteCode && (
                  <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, marginTop: 8 }}>
                    Code : <strong>{inviteCode}</strong> · Valable 30 jours ·{" "}
                    <span onClick={generateNewCode} style={{ color: "#7c9fff", cursor: "pointer", textDecoration: "underline" }}>Générer un nouveau code</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TAB ÉQUIPE ── */}
          {activeTab === "employees" && (
            <motion.div key="employees" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ borderRadius: 20, padding: "22px 24px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: 0 }}>
                    Employés ({employees.length})
                  </p>
                  <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted }}>
                    {assessed.length}/{employees.length} bilans complétés
                  </span>
                </div>
                {employees.length === 0 ? (
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, textAlign: "center", padding: "20px 0" }}>
                    Aucun employé inscrit. Partagez le lien d&apos;invitation depuis l&apos;onglet Vue d&apos;ensemble.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {employees.map((emp, i) => (
                      <div key={i}>
                        <div
                          onClick={() => setExpandedEmployee(expandedEmployee === emp.anonymous_id ? null : emp.anonymous_id)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 16px", borderRadius: 12,
                            background: c.bgCard2, border: `0.5px solid ${c.border}`,
                            cursor: emp.scores ? "pointer" : "default", gap: 10,
                          }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                              background: emp.global_score ? `${scoreColor(emp.global_score)}15` : c.bgCard,
                              border: `0.5px solid ${emp.global_score ? scoreColor(emp.global_score) + "35" : c.border}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontFamily: T.h, fontWeight: 900, fontSize: 13,
                              color: emp.global_score ? scoreColor(emp.global_score) : c.textMuted,
                            }}>
                              {emp.global_score ?? "—"}
                            </div>
                            <div>
                              <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: c.textPrimary, margin: 0 }}>{emp.anonymous_id}</p>
                              <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>
                                {emp.assessed_at ? `Bilan le ${new Date(emp.assessed_at).toLocaleDateString("fr-FR")}` : "Pas encore de bilan"}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {emp.global_score && (
                              <span style={{ padding: "3px 10px", borderRadius: 100, background: `${scoreColor(emp.global_score)}15`, border: `0.5px solid ${scoreColor(emp.global_score)}35`, fontFamily: T.b, fontSize: 11, color: scoreColor(emp.global_score) }}>
                                {scoreZone(emp.global_score)}
                              </span>
                            )}
                            {emp.scores && (
                              <span style={{ fontSize: 12, color: c.textMuted }}>{expandedEmployee === emp.anonymous_id ? "▲" : "▼"}</span>
                            )}
                          </div>
                        </div>
                        <AnimatePresence>
                          {expandedEmployee === emp.anonymous_id && emp.scores && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              style={{ padding: "16px", background: c.bgCard, borderRadius: "0 0 12px 12px", border: `0.5px solid ${c.border}`, borderTop: "none" }}
                            >
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                                {Object.entries(DIM_META).map(([key, meta]) => {
                                  const score = emp.scores?.[key];
                                  return (
                                    <div key={key} style={{ textAlign: "center" }}>
                                      <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: "0 0 3px" }}>{meta.emoji} {meta.label}</p>
                                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 16, color: score ? scoreColor(score) : c.textMuted, margin: 0 }}>{score ?? "—"}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TAB EXERCICES ── */}
          {activeTab === "exercises" && (
            <motion.div key="exercises" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
                {(["bureau", "debout"] as const).map(p => (
                  <button key={p} onClick={() => setActiveProfile(p)} style={{
                    padding: "9px 20px", borderRadius: 100,
                    background: activeProfile === p ? "#2b5ce6" : c.bgCard2,
                    color: activeProfile === p ? "#fff" : c.textMuted,
                    fontFamily: T.b, fontWeight: 600, fontSize: 13, cursor: "pointer",
                    border: `0.5px solid ${activeProfile === p ? "#2b5ce6" : c.border}`,
                  }}>
                    {p === "bureau" ? "💻 Postes bureau" : "🏭 Postes debout"}
                  </button>
                ))}
              </div>

              <div style={{ borderRadius: 20, padding: "24px", background: c.bgCard, border: `0.5px solid ${c.border}`, marginBottom: 16 }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 4 }}>
                  Programme collectif — {activeProfile === "bureau" ? "Postes bureau & télétravail" : "Postes debout & manutention"}
                </p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 20 }}>
                  Routine de 10-15 minutes, idéale en début de journée ou après déjeuner. Peut être animée par un référent interne.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {EXERCISES_BY_PROFILE[activeProfile].map((ex, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "16px", borderRadius: 14, background: c.bgCard2, border: `0.5px solid ${c.border}` }}>
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{ex.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: 0 }}>{ex.name}</p>
                          <span style={{ padding: "2px 10px", borderRadius: 100, background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.2)", fontFamily: T.b, fontSize: 11, color: "#7c9fff", flexShrink: 0, marginLeft: 8 }}>{ex.duration}</span>
                        </div>
                        <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.55 }}>{ex.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderRadius: 16, padding: "18px 20px", background: "rgba(29,158,117,0.06)", border: "0.5px solid rgba(29,158,117,0.2)" }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "#5dcaa5", margin: 0, lineHeight: 1.6 }}>
                  💡 <strong>Conseil d&apos;implémentation :</strong> Affichez ce programme en salle de pause ou envoyez-le par email à vos équipes. Une routine de 10 min, 3x/semaine, réduit significativement les TMS chroniques sur 3 mois.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── TAB RESSOURCES ── */}
          {activeTab === "resources" && (
            <motion.div key="resources" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {RESOURCES.map((cat, ci) => (
                  <div key={ci}>
                    <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: cat.color, textTransform: "uppercase", marginBottom: 12 }}>
                      {cat.category}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                      {cat.items.map((item, ii) => (
                        <a key={ii} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                          <div style={{
                            padding: "18px 20px", borderRadius: 16,
                            background: c.bgCard, border: `0.5px solid ${c.border}`,
                            cursor: "pointer", transition: "border-color 0.15s",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 16 }}>{item.type === "video" ? "▶️" : "📄"}</span>
                              <span style={{ padding: "2px 8px", borderRadius: 100, background: `${cat.color}15`, fontFamily: T.b, fontSize: 10, fontWeight: 700, color: cat.color }}>
                                {item.source}
                              </span>
                              <span style={{ padding: "2px 8px", borderRadius: 100, background: c.bgCard2, fontFamily: T.b, fontSize: 10, color: c.textMuted }}>
                                {item.type === "video" ? "Vidéo" : "Guide PDF"}
                              </span>
                            </div>
                            <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: "0 0 6px", lineHeight: 1.3 }}>{item.title}</p>
                            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ borderRadius: 16, padding: "20px", background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.18)", textAlign: "center" }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 6 }}>
                    📞 Besoin d&apos;aller plus loin ?
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
                    Votre call de restitution avec Julien Beumier, kinésithérapeute fondateur de PAW, est inclus dans votre plan. Une heure pour analyser vos résultats collectifs et définir les actions prioritaires.
                  </p>
                  <a href="mailto:hello@postureatwork.com?subject=Demande de call de restitution" style={{ textDecoration: "none" }}>
                    <button style={{ padding: "12px 24px", borderRadius: 100, border: "none", background: "#2b5ce6", color: "#fff", fontFamily: T.h, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      Planifier mon call kiné →
                    </button>
                  </a>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
