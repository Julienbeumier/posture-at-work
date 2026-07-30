"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  AnalysisReport,
  StatusLevel,
  PostureItem,
  SetupItem,
  PersonneAnalysis,
  PosteAnalysis,
  PersonneSegment,
  DeboutAnalysis,
  DeboutPostureSegment,
} from "@/lib/analysis-types";
import { saveAssessmentForUser, createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusLevel, { color: string; bg: string; border: string; label: string; icon: string }> = {
  bon:      { color: "#74c69d", bg: "rgba(116,198,157,0.08)", border: "rgba(116,198,157,0.25)", label: "Bon",       icon: "✅" },
  attention:{ color: "#f4a261", bg: "rgba(244,162,97,0.08)",  border: "rgba(244,162,97,0.25)",  label: "Attention", icon: "⚠️" },
  critique: { color: "#f09595", bg: "rgba(240,149,149,0.08)", border: "rgba(240,149,149,0.28)", label: "Critique",  icon: "🔴" },
};

const PRIORITY_COLOR: Record<string, { color: string; label: string }> = {
  haute:     { color: "#f09595", label: "Priorité haute" },
  moyenne:   { color: "#f4a261", label: "Priorité moyenne" },
  optionnel: { color: "var(--t35)", label: "Optionnel" },
};

function traduire(key: string): string {
  const map: Record<string, string> = {
    faible: "Faible", modere: "Modéré", eleve: "Élevé",
    bon: "Bon", attention: "Attention", critique: "Critique",
    adapte: "Adapté", trop_bas: "Trop bas", trop_haut: "Trop haut", non_visible: "Non visible",
    head_position: "Position de la tête", neck_position: "Position du cou",
    shoulders: "Épaules", trunk: "Tronc & dos",
  };
  return map[key] ?? key;
}

// ─── Shared components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusLevel }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: 100, background: cfg.bg, border: `0.5px solid ${cfg.border}`, color: cfg.color, fontFamily: T.b, fontWeight: 600, fontSize: 11 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ExpandableCard({ title, status, children, delay = 0 }: { title: string; status: StatusLevel; children: React.ReactNode; delay?: number }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status];
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      onClick={() => setOpen(v => !v)}
      style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", background: cfg.bg, border: `0.5px solid ${cfg.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", gap: 12 }}>
        <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusBadge status={status} />
          <span style={{ fontSize: 10, color: "var(--t30)" }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 18px 16px", borderTop: `0.5px solid ${cfg.border}` }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PostureCard({ label, item, delay = 0 }: { label: string; item: PostureItem; delay?: number }) {
  return (
    <ExpandableCard title={label} status={item.status} delay={delay}>
      <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t70)", lineHeight: 1.65, marginBottom: 8, marginTop: 10 }}>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Observation : </span>{item.observation}
      </p>
      <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.65 }}>
        <span style={{ color: "var(--t75)", fontWeight: 600 }}>Impact : </span>{item.impact}
      </p>
    </ExpandableCard>
  );
}

function SetupCard({ label, item, delay = 0 }: { label: string; item: SetupItem; delay?: number }) {
  return (
    <ExpandableCard title={label} status={item.status} delay={delay}>
      <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t70)", lineHeight: 1.65, marginBottom: 8, marginTop: 10 }}>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Observation : </span>{item.observation}
      </p>
      <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.65 }}>
        <span style={{ color: "#74c69d" }}>→ </span>{item.recommendation}
      </p>
    </ExpandableCard>
  );
}

function ScoreRing({ score, size = 90, color }: { score: number; size?: number; color: string }) {
  const sw = 5; const r = (size - sw) / 2; const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(43,92,230,0.10)" stroke="rgba(43,92,230,0.3)" strokeWidth={sw} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: size === 90 ? 22 : 16, color: "#a8c0ff" }}>{score}</span>
      </div>
    </div>
  );
}

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <h2 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>{title}</h2>
    </div>
  );
}

// ─── Dual-mode components ─────────────────────────────────────────────────────

function scoreColor(s: number) { return s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595"; }

function SegmentBar({ label, seg, delay = 0 }: { label: string; seg: PersonneSegment; delay?: number }) {
  const color = scoreColor(seg.score);
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      onClick={() => setOpen(v => !v)}
      style={{ borderRadius: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color }}>{seg.score}/100</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden", marginBottom: open ? 10 : 0 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${seg.score}%` }} transition={{ duration: 0.8, delay: delay + 0.2 }}
          style={{ height: "100%", background: color, borderRadius: 100 }} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            {seg.issues.length > 0 && (
              <ul style={{ paddingLeft: 14, margin: "6px 0 4px" }}>
                {seg.issues.map((issue, i) => <li key={i} style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.65 }}>{issue}</li>)}
              </ul>
            )}
            {seg.note && <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)", margin: "4px 0 0" }}>{seg.note}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ElementCard({ label, score, issues, delay = 0, extra }: { label: string; score: number; issues: string[]; delay?: number; extra?: string }) {
  const color = scoreColor(score);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ borderRadius: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color }}>{score}/100</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden", marginBottom: 8 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, delay: delay + 0.2 }}
          style={{ height: "100%", background: color, borderRadius: 100 }} />
      </div>
      {extra && <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", marginBottom: 4 }}>{extra}</p>}
      {issues.map((issue, i) => (
        <p key={i} style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.5, margin: "2px 0" }}>• {issue}</p>
      ))}
    </motion.div>
  );
}

function DeboutSegCard({ label, seg, delay = 0 }: { label: string; seg: DeboutPostureSegment; delay?: number }) {
  const color = scoreColor(seg.score);
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      onClick={() => setOpen(v => !v)}
      style={{ borderRadius: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color }}>{seg.score}/100</span>
          <StatusBadge status={seg.status} />
        </div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden", marginBottom: open ? 10 : 0 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${seg.score}%` }} transition={{ duration: 0.8, delay: delay + 0.2 }}
          style={{ height: "100%", background: color, borderRadius: 100 }} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.65, margin: "6px 0 0" }}>{seg.observation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const SEGMENT_EXERCISE: Record<string, { name: string; instruction: string; link: string }> = {
  tete_cou:           { name: "Rétraction cervicale", instruction: "Rentre le menton sans baisser la tête, 10 rép. × 3s", link: "/mobilite?program=cible_cervicales" },
  epaules_dos_haut:   { name: "Ouverture des épaules", instruction: "Mains jointes dans le dos, poitrine vers l'avant, 30s", link: "/mobilite?program=cible_epaules" },
  bas_dos_bassin:     { name: "Cat-Cow assis", instruction: "Arrondir puis creuser le dos sur ta chaise, 10 cycles", link: "/mobilite?program=cible_lombaires" },
  membres_superieurs: { name: "Étirement poignets", instruction: "Bras tendu, doigts vers le bas, tenir 20s par côté", link: "/mobilite" },
  membres_inferieurs: { name: "Étirement ischio-jambiers", instruction: "Jambe tendue posée, penche-toi vers ton pied, 30s", link: "/mobilite" },
};

// ─── Crossed synthesis (questionnaire + vidéo) ────────────────────────────────

function buildCrossedSynthesis(
  personne: PersonneAnalysis | null,
  poste: PosteAnalysis | null,
  debout: DeboutAnalysis | null,
  scores: Record<string, number> | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  answers: Record<string, unknown> | null
): {
  globalScore: number;
  scoreLabel: string;
  scoreColor: string;
  narrative: string;
  confirmations: Array<{ text: string; type: "confirm" | "new" | "good" }>;
  weekPlan: Array<{ week: string; color: string; actions: string[] }>;
  positivePoints: string[];
  dailyChecklist: string[];
} {
  const videoScore = personne?.globalPostureScore ?? debout?.globalPostureScore ?? null;
  const questionScore = scores?.global ?? null;
  const globalScore = videoScore && questionScore
    ? Math.round((videoScore * 0.4 + questionScore * 0.6))
    : videoScore ?? questionScore ?? 50;

  const scoreLabel = globalScore >= 70 ? "Bon niveau" : globalScore >= 50 ? "À améliorer" : "Attention requise";
  const scoreColor = globalScore >= 70 ? "#74c69d" : globalScore >= 50 ? "#f4a261" : "#f09595";

  // Synthèse narrative croisée
  const painScore = scores?.pain ?? 50;
  const setupScore = scores?.setup ?? 50;
  const hasVideoPosture = !!personne || !!debout;

  let narrative = "";
  if (hasVideoPosture && personne) {
    const headIssue = personne.segments.tete_cou.score < 60;
    const shoulderIssue = personne.segments.epaules_dos_haut.score < 60;
    if (headIssue && painScore < 55) {
      narrative = `L'analyse vidéo confirme ce que tu as déclaré dans le questionnaire : une projection de tête importante génère une charge cervicale excessive. Cette combinaison explique directement tes douleurs de nuque.`;
    } else if (shoulderIssue && painScore < 60) {
      narrative = `Le questionnaire signale des douleurs aux épaules, et l'analyse vidéo en identifie la cause : un enroulement des épaules vers l'avant lié à ta posture de travail.`;
    } else if (setupScore < 55 && poste) {
      narrative = `Ton setup de bureau est la principale source de tes tensions. L'analyse vidéo et le questionnaire convergent : corriger ton poste aura un impact immédiat sur ta posture et tes douleurs.`;
    } else {
      narrative = `Ton bilan croisé montre une posture globalement ${globalScore >= 60 ? "satisfaisante" : "à améliorer"} avec quelques points d'attention spécifiques à corriger.`;
    }
  } else if (debout) {
    narrative = `L'analyse vidéo identifie les contraintes posturales de ton poste debout. Combinées aux informations du questionnaire, elles permettent de cibler précisément les zones à travailler.`;
  } else {
    narrative = `Basé sur tes réponses au questionnaire, voici un plan d'action personnalisé pour améliorer ta santé au travail.`;
  }

  // Confirmations croisées
  const confirmations: Array<{ text: string; type: "confirm" | "new" | "good" }> = [];
  if (personne) {
    if (personne.segments.tete_cou.score < 60 && painScore < 60) {
      confirmations.push({ text: "Douleurs cervicales confirmées par l'analyse vidéo — projection de tête mesurée", type: "confirm" });
    }
    if (personne.segments.epaules_dos_haut.score < 60) {
      confirmations.push({ text: "Enroulement des épaules détecté à la vidéo — non signalé dans le questionnaire", type: "new" });
    }
    if (personne.positivePoints?.length) {
      confirmations.push({ text: personne.positivePoints[0], type: "good" });
    }
  }
  if (poste?.mainIssues?.[0]) {
    confirmations.push({ text: `Setup : ${poste.mainIssues[0].issue} → ${poste.mainIssues[0].fix}`, type: "confirm" });
  }

  // Points positifs
  const positivePoints: string[] = [
    ...(personne?.positivePoints ?? []),
    ...(debout?.positivePoints ?? []),
    ...(poste?.positivePoints ?? []),
  ].slice(0, 3);
  if (positivePoints.length === 0) {
    if (scores?.lifestyle && scores.lifestyle >= 60) positivePoints.push("Bonne activité physique — atout majeur pour ta récupération musculaire");
    if (scores?.sleep_energy && scores.sleep_energy >= 65) positivePoints.push("Sommeil satisfaisant — récupération correcte");
    if (scores?.nutrition && scores.nutrition >= 60) positivePoints.push("Habitudes alimentaires correctes");
  }

  // Plan semaine
  const allRecs = [
    ...(personne?.recommendations ?? []),
    ...(poste?.recommendations ?? []),
    ...(debout?.recommendations ?? []),
  ].sort((a, b) => a.priority - b.priority);

  const weekPlan = [
    {
      week: "Cette semaine",
      color: "#f09595",
      actions: allRecs
        .filter(r => r.priority <= 1 || (r as { immediat?: boolean }).immediat)
        .map(r => r.action)
        .slice(0, 3),
    },
    {
      week: "Dans 2 semaines",
      color: "#f4a261",
      actions: allRecs
        .filter(r => r.priority === 2)
        .map(r => r.action)
        .slice(0, 3),
    },
    {
      week: "Dans le mois",
      color: "#74c69d",
      actions: allRecs
        .filter(r => r.priority >= 3)
        .map(r => r.action)
        .slice(0, 3),
    },
  ].filter(w => w.actions.length > 0);

  // Checklist quotidienne
  const dailyChecklist: string[] = [];
  if ((personne?.segments.tete_cou.score ?? 100) < 65) {
    dailyChecklist.push("Rétraction cervicale — 10 rép. avant de commencer à travailler");
  }
  if (setupScore < 60) dailyChecklist.push("Vérifier la hauteur de l'écran avant de s'asseoir");
  dailyChecklist.push("Pause active toutes les 45 min — se lever 2 minutes");
  if (scores?.nutrition && scores.nutrition < 60) dailyChecklist.push("Déjeuner loin de l'écran — 20 min minimum");
  if (scores?.sleep_energy && scores.sleep_energy < 60) dailyChecklist.push("Écrans off 1h avant de dormir");
  dailyChecklist.push("3 respirations profondes en cas de tension dans la nuque");

  return { globalScore, scoreLabel, scoreColor, narrative, confirmations, weekPlan, positivePoints, dailyChecklist };
}

type CrossedSynthesis = ReturnType<typeof buildCrossedSynthesis>;

function CrossedSynthesisHeader({ synthesis }: { synthesis: CrossedSynthesis }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      style={{ borderRadius: 24, padding: "24px", marginBottom: 16, background: `${synthesis.scoreColor}08`, border: `1px solid ${synthesis.scoreColor}25` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, fontFamily: T.h, fontWeight: 900, color: synthesis.scoreColor, lineHeight: 1 }}>
            {synthesis.globalScore}
          </div>
          <div style={{ fontSize: 11, color: "var(--t40)", fontFamily: T.b }}>Score global</div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: "0 0 8px" }}>
            {synthesis.scoreLabel}
          </p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.7, margin: 0 }}>
            {synthesis.narrative}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ConfirmationsBlock({ confirmations }: { confirmations: CrossedSynthesis["confirmations"] }) {
  if (confirmations.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      style={{ borderRadius: 20, padding: "18px 20px", marginBottom: 16, background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)", marginBottom: 12 }}>
        🔍 Questionnaire + Vidéo — ce qu&apos;on a trouvé
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {confirmations.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>
              {c.type === "confirm" ? "⚠️" : c.type === "new" ? "🔴" : "✅"}
            </span>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t70)", margin: 0, lineHeight: 1.55 }}>{c.text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PositivePointsBlock({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      style={{ borderRadius: 20, padding: "18px 20px", marginBottom: 16, background: "rgba(116,198,157,0.06)", border: "0.5px solid rgba(116,198,157,0.2)" }}>
      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#74c69d", marginBottom: 12 }}>
        ✅ Ce que tu fais bien
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {points.map((point, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "#74c69d", fontSize: 14, flexShrink: 0 }}>→</span>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t70)", margin: 0, lineHeight: 1.55 }}>{point}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function WeekPlanBlock({ weekPlan }: { weekPlan: CrossedSynthesis["weekPlan"] }) {
  if (weekPlan.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      style={{ borderRadius: 20, padding: "18px 20px", marginBottom: 16, background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
        🗓️ Ton plan d&apos;action progressif
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {weekPlan.map((week, i) => (
          <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: `${week.color}08`, border: `0.5px solid ${week.color}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: week.color, flexShrink: 0 }} />
              <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: week.color }}>{week.week}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {week.actions.map((action, j) => (
                <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: week.color, fontSize: 12, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t70)", margin: 0, lineHeight: 1.5 }}>{action}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DailyChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const allDone = items.every((_, i) => checked[i]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      style={{ borderRadius: 20, padding: "18px 20px", marginBottom: 16, background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)", margin: 0 }}>
          ☑️ Ta routine quotidienne
        </p>
        {allDone && (
          <span style={{ fontFamily: T.b, fontSize: 12, color: "#74c69d", fontWeight: 600 }}>
            🎉 Journée parfaite !
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i}
            onClick={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
            style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer",
              padding: "10px 12px", borderRadius: 10,
              background: checked[i] ? "rgba(116,198,157,0.08)" : "var(--bg-card2)",
              border: `0.5px solid ${checked[i] ? "rgba(116,198,157,0.25)" : "var(--border)"}`,
              transition: "all 0.2s",
            }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              background: checked[i] ? "#74c69d" : "transparent",
              border: `1.5px solid ${checked[i] ? "#74c69d" : "var(--border-3)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {checked[i] && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
            </div>
            <p style={{ fontFamily: T.b, fontSize: 13, color: checked[i] ? "var(--t50)" : "var(--t75)", margin: 0, lineHeight: 1.5,
              textDecoration: checked[i] ? "line-through" : "none", transition: "all 0.2s" }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FinalReportPage() {
  const router = useRouter();
  // Single-report mode
  const [report, setReport] = useState<AnalysisReport | null>(null);
  // Dual-report mode
  const [personneAnalysis, setPersonneAnalysis] = useState<PersonneAnalysis | null>(null);
  const [posteAnalysis, setPosteAnalysis] = useState<PosteAnalysis | null>(null);
  // Debout mode
  const [deboutAnalysis, setDeboutAnalysis] = useState<DeboutAnalysis | null>(null);

  const [questionnaireScore, setQuestionnaireScore] = useState<number | null>(null);
  const [synthesis, setSynthesis] = useState<ReturnType<typeof buildCrossedSynthesis> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [firstname, setFirstname] = useState("");
  const savedRef = useRef(false);
  const loadedFromRemoteRef = useRef(false);

  useEffect(() => {
    setFirstname(localStorage.getItem("paw_firstname") ?? "");

    const personneRaw = sessionStorage.getItem("paw_analysis_personne");
    const posteRaw = sessionStorage.getItem("paw_analysis_poste");
    let analysisPersonne: PersonneAnalysis | null = null;
    let analysisPoste: PosteAnalysis | null = null;
    let analysisDebout: DeboutAnalysis | null = null;
    let foundLocal = false;
    if (personneRaw) {
      foundLocal = true;
      const parsed = JSON.parse(personneRaw);
      if (parsed.analysisType === "debout") {
        analysisDebout = parsed;
        setDeboutAnalysis(parsed);
      } else if (posteRaw) {
        analysisPersonne = parsed;
        analysisPoste = JSON.parse(posteRaw);
        setPersonneAnalysis(analysisPersonne);
        setPosteAnalysis(analysisPoste);
      }
    } else {
      const raw = sessionStorage.getItem("postureatwork_report");
      if (raw) { foundLocal = true; setReport(JSON.parse(raw)); }
    }

    const isExample = sessionStorage.getItem("paw_example_mode") === "true";
    const scoresRaw = isExample
      ? sessionStorage.getItem("paw_example_scores")
      : sessionStorage.getItem("postureatwork_scores");
    const answersRaw = isExample
      ? sessionStorage.getItem("paw_example_answers")
      : sessionStorage.getItem("postureatwork_answers");
    const questionScores = scoresRaw ? JSON.parse(scoresRaw) : null;
    const questionAnswers = answersRaw ? JSON.parse(answersRaw) : null;
    if (questionScores) setQuestionnaireScore(questionScores.global ?? null);

    setSynthesis(buildCrossedSynthesis(
      analysisPersonne,
      analysisPoste,
      analysisDebout,
      questionScores,
      questionAnswers,
    ));

    createClient().auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      if (foundLocal || !data.user) return;

      // Rien en sessionStorage (ex: analyse vidéo faite sur un autre appareil via
      // le QR code) → charger la dernière analyse depuis Supabase
      const supabase = createClient();
      const { data: latest } = await supabase
        .from("assessments")
        .select("video_analysis")
        .eq("user_id", data.user.id)
        .not("video_analysis", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const va = latest?.video_analysis as { personne?: PersonneAnalysis | DeboutAnalysis; poste?: PosteAnalysis } | null;
      if (!va?.personne) return;

      // Déjà sauvegardé en base — ne pas redéclencher la sauvegarde auto
      loadedFromRemoteRef.current = true;

      let remotePersonne: PersonneAnalysis | null = null;
      let remotePoste: PosteAnalysis | null = null;
      let remoteDebout: DeboutAnalysis | null = null;

      if ((va.personne as DeboutAnalysis).analysisType === "debout") {
        remoteDebout = va.personne as DeboutAnalysis;
        setDeboutAnalysis(remoteDebout);
      } else if (va.poste) {
        remotePersonne = va.personne as PersonneAnalysis;
        remotePoste = va.poste;
        setPersonneAnalysis(remotePersonne);
        setPosteAnalysis(remotePoste);
      }

      setSynthesis(buildCrossedSynthesis(
        remotePersonne,
        remotePoste,
        remoteDebout,
        questionScores,
        questionAnswers,
      ));
    });
  }, []);

  useEffect(() => {
    if (!user || savedRef.current || loadedFromRemoteRef.current) return;
    const target = report ?? personneAnalysis ?? deboutAnalysis ?? null;
    if (!target) return;
    savedRef.current = true;
    setSaveStatus("saving");
    const isExample = sessionStorage.getItem("paw_example_mode") === "true";
    const scoresRaw = isExample
      ? sessionStorage.getItem("paw_example_scores")
      : sessionStorage.getItem("postureatwork_scores");
    const answersRaw = isExample
      ? sessionStorage.getItem("paw_example_answers")
      : sessionStorage.getItem("postureatwork_answers");
    const scores = scoresRaw ? JSON.parse(scoresRaw) : {};
    const answers = answersRaw ? JSON.parse(answersRaw) : {};

    const saveVideoAnalysis = async () => {
      const analysisPersonne = JSON.parse(sessionStorage.getItem("paw_analysis_personne") || "null");
      const analysisPoste = JSON.parse(sessionStorage.getItem("paw_analysis_poste") || "null");
      if (!analysisPersonne && !analysisPoste) return;
      const supabase = createClient();
      const { data: latest } = await supabase
        .from("assessments").select("id").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(1);
      if (!latest?.length) return;
      await supabase.from("assessments").update({
        video_analysis: {
          personne: analysisPersonne,
          poste: analysisPoste,
          analyzed_at: new Date().toISOString(),
        },
      }).eq("id", latest[0].id);
    };

    (async () => {
      let companyId = localStorage.getItem("paw_company_id");
      if (!companyId) {
        const { data: membership } = await createClient()
          .from("company_memberships")
          .select("company_id")
          .eq("user_id", user.id)
          .eq("role", "employee")
          .maybeSingle();
        if (membership?.company_id) {
          companyId = membership.company_id;
          localStorage.setItem("paw_company_id", membership.company_id);
        }
      }
      try {
        await saveAssessmentForUser(user.id, scores, answers, target as unknown as Record<string, unknown>, companyId ?? null);
        await saveVideoAnalysis();
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    })();
  }, [user, report, personneAnalysis, deboutAnalysis]);

  // Sauvegarde via le token de session QR code — fonctionne même sans session
  // active sur l'appareil mobile (le desktop est connecté, pas forcément le mobile)
  const savedViaTokenRef = useRef(false);
  useEffect(() => {
    if (savedViaTokenRef.current) return;
    const sessionToken = sessionStorage.getItem("paw_video_session_token");
    if (!sessionToken) return;
    const analysisPersonne = JSON.parse(sessionStorage.getItem("paw_analysis_personne") || "null");
    const analysisPoste = JSON.parse(sessionStorage.getItem("paw_analysis_poste") || "null");
    if (!analysisPersonne && !analysisPoste) return;

    savedViaTokenRef.current = true;
    const videoData = {
      personne: analysisPersonne,
      poste: analysisPoste,
      analyzed_at: new Date().toISOString(),
    };
    fetch("/api/video-session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: sessionToken, videoAnalysis: videoData }),
    }).catch(() => {});
  }, [report, personneAnalysis, deboutAnalysis]);

  const isDual = !!(personneAnalysis && posteAnalysis);

  // ── No report ──────────────────────────────────────────────────────────────
  if (!report && !isDual && !deboutAnalysis) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", marginBottom: 10 }}>Aucun rapport trouvé</h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t50)", marginBottom: 24 }}>Tu n&apos;as pas encore effectué l&apos;analyse vidéo.</p>
          <Link href="/video-intro" style={{ textDecoration: "none" }}>
            <div style={{ padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff" }}>
              Faire l&apos;analyse →
            </div>
          </Link>
        </div>
      </main>
    );
  }

  // ── DEBOUT REPORT ─────────────────────────────────────────────────────────
  if (deboutAnalysis) {
    const da = deboutAnalysis;
    const globalColor = scoreColor(da.globalPostureScore);

    const DEBOUT_SEGS: Array<[keyof DeboutAnalysis["posture"], string]> = [
      ["colonne", "Colonne vertébrale"],
      ["epaules", "Épaules & niveau"],
      ["tete_cou", "Tête & cou"],
      ["appui_jambes", "Appui & équilibre jambes"],
      ["membres_superieurs", "Membres supérieurs"],
    ];

    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80, position: "relative" }}>
        <BackgroundBlobs blobs={[
          { top: "-5%", right: "-5%", color: "rgba(167,139,250,0.10)", size: 480 },
          { top: "45%", left: "-8%", color: "rgba(116,198,157,0.09)", size: 380 },
          { bottom: "-10%", right: "15%", color: "rgba(43,92,230,0.07)", size: 400 },
        ]} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>

          {/* Nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 80, paddingBottom: 32 }}>
            <Link href="/results" style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t40)", cursor: "pointer" }}>← Résultats</span>
            </Link>
            <div onClick={() => window.print()} style={{ padding: "6px 14px", borderRadius: 100, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.09)", fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>
              🖨️ Imprimer
            </div>
          </div>

          {/* Global score */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 28, padding: "28px 28px 24px", textAlign: "center", marginBottom: 20, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 14px", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)" }}>
              <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#74c69d" }}>✅ Analyse posturale — Poste debout</span>
            </div>
            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: "var(--text-primary)", marginBottom: da.jobTypeDetected ? 14 : 24 }}>
              {firstname ? `Le bilan debout de ${firstname}` : "Ton bilan PostureAtWork — Debout"}
            </h1>
            {da.jobTypeDetected && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(167,139,250,0.12)", border: "0.5px solid rgba(167,139,250,0.3)", fontFamily: T.b, fontSize: 12, color: "#a78bfa" }}>
                  Poste détecté : {da.jobTypeDetected}
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <ScoreRing score={da.globalPostureScore} size={110} color={globalColor} />
                <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>Score posture</span>
              </div>
              {questionnaireScore != null && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <ScoreRing score={questionnaireScore} size={82} color="#7c9fff" />
                  <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)" }}>Questionnaire</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Synthèse croisée questionnaire + vidéo */}
          {synthesis && (
            <>
              <CrossedSynthesisHeader synthesis={synthesis} />
              <ConfirmationsBlock confirmations={synthesis.confirmations} />
              <PositivePointsBlock points={synthesis.positivePoints} />
            </>
          )}

          {/* Posture section */}
          <section style={{ marginBottom: 20 }}>
            <div style={{ borderRadius: 22, padding: "20px 20px 16px", background: "rgba(167,139,250,0.05)", border: "0.5px solid rgba(167,139,250,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <SectionTitle emoji="🧍" title="Ta posture debout" />
                <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: globalColor }}>{da.globalPostureScore}/100</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DEBOUT_SEGS.map(([key, label], i) => (
                  <DeboutSegCard key={key} label={label} seg={da.posture[key]} delay={i * 0.06} />
                ))}
              </div>
              <div style={{ marginTop: 12, borderRadius: 14, padding: "12px 16px", background: "rgba(167,139,250,0.07)", border: "0.5px solid rgba(167,139,250,0.18)" }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.65, margin: 0 }}>{da.overallAssessment}</p>
              </div>
              {da.mainIssues.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  {da.mainIssues.map((issue, i) => {
                    const sevColor = issue.severity === "eleve" ? "#f09595" : issue.severity === "modere" ? "#f4a261" : "#74c69d";
                    return (
                      <div key={i} style={{ borderRadius: 12, padding: "10px 14px", background: `${sevColor}10`, border: `0.5px solid ${sevColor}35` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 12, color: sevColor }}>{issue.zone}</span>
                          <span style={{ fontFamily: T.b, fontSize: 11, color: `${sevColor}99` }}>· {traduire(issue.severity)}</span>
                        </div>
                        <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t60)", margin: 0 }}>{issue.issue}</p>
                        <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: "3px 0 0" }}>→ {issue.consequence}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              {da.positivePoints.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {da.positivePoints.map((pt, i) => (
                    <span key={i} style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.b, fontSize: 11, color: "#74c69d" }}>
                      ✓ {pt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Environnement section */}
          <section style={{ marginBottom: 20 }}>
            <div style={{ borderRadius: 22, padding: "20px 20px 16px", background: "rgba(59,130,246,0.05)", border: "0.5px solid rgba(59,130,246,0.15)" }}>
              <SectionTitle emoji="🏭" title="Ton environnement de travail" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ borderRadius: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>Plan de travail</span>
                    <StatusBadge status={da.environnement.plan_travail.hauteur === "adapte" ? "bon" : "attention"} />
                  </div>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", margin: 0 }}>
                    Hauteur : {traduire(da.environnement.plan_travail.hauteur)}
                  </p>
                  {da.environnement.plan_travail.observation && (
                    <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", margin: "3px 0 0", lineHeight: 1.5 }}>{da.environnement.plan_travail.observation}</p>
                  )}
                </div>
                <div style={{ borderRadius: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>Tapis anti-fatigue</span>
                    <StatusBadge status={da.environnement.tapis_antifatigue === "oui" ? "bon" : "attention"} />
                  </div>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", margin: 0 }}>
                    {da.environnement.tapis_antifatigue === "oui" ? "Présent — bonne pratique" : da.environnement.tapis_antifatigue === "non" ? "Absent — recommandé pour le confort" : "Non visible sur les images"}
                  </p>
                </div>
                {da.environnement.sol && (
                  <div style={{ borderRadius: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>Sol</span>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", margin: "4px 0 0" }}>{da.environnement.sol}</p>
                  </div>
                )}
                {da.environnement.contraintes_visibles.length > 0 && (
                  <div style={{ borderRadius: 14, padding: "12px 16px", background: "rgba(240,149,149,0.06)", border: "0.5px solid rgba(240,149,149,0.2)" }}>
                    <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "#f09595" }}>Contraintes détectées</span>
                    <ul style={{ paddingLeft: 14, margin: "6px 0 0" }}>
                      {da.environnement.contraintes_visibles.map((c, i) => (
                        <li key={i} style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.6 }}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recommendations */}
          {da.recommendations.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <SectionTitle emoji="⚡" title="Tes priorités" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {da.recommendations.slice(0, 5).map((rec, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.08 }}
                    style={{ borderRadius: 18, padding: "16px 18px", background: i === 0 ? "rgba(240,149,149,0.07)" : "rgba(255,255,255,0.03)", border: `0.5px solid ${i === 0 ? "rgba(240,149,149,0.25)" : "rgba(255,255,255,0.08)"}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "rgba(240,149,149,0.18)" : "rgba(255,255,255,0.06)", fontFamily: T.h, fontWeight: 900, fontSize: 12, color: i === 0 ? "#f09595" : "var(--t35)" }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>{rec.action}</span>
                        <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.65, margin: 0 }}>{rec.why}</p>
                        {rec.applicable_tous_postes && (
                          <span style={{ display: "inline-block", marginTop: 6, padding: "2px 8px", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.b, fontSize: 10, color: "#74c69d" }}>
                            Applicable à tous les postes debout
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Plan progressif + checklist */}
          {synthesis && (
            <>
              <WeekPlanBlock weekPlan={synthesis.weekPlan} />
              {synthesis.dailyChecklist.length > 0 && <DailyChecklist items={synthesis.dailyChecklist} />}
            </>
          )}

          {/* Save */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ borderRadius: 24, padding: "24px 26px", marginBottom: 16, background: "linear-gradient(135deg, rgba(116,198,157,0.07), rgba(43,92,230,0.07))", border: "0.5px solid rgba(116,198,157,0.2)" }}>
            <AnimatePresence mode="wait">
              {saveStatus === "saved" ? (
                <motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                  <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>Rapport sauvegardé !</p>
                  <Link href="/dashboard" style={{ textDecoration: "none" }}>
                    <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 100, background: "rgba(116,198,157,0.15)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "#74c69d", cursor: "pointer" }}>
                      Voir mon dashboard →
                    </div>
                  </Link>
                </motion.div>
              ) : !user ? (
                <motion.div key="unauthenticated" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>💾</div>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>Sauvegarder mon rapport</p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", marginBottom: 20, lineHeight: 1.65 }}>Crée un compte gratuit pour accéder à ton bilan depuis n&apos;importe où.</p>
                  <div onClick={() => router.push("/auth?redirect=/final-report")}
                    style={{ padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: "pointer", background: "#2b5ce6", boxShadow: "0 4px 24px rgba(43,92,230,0.35)", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff" }}>
                    Créer mon compte gratuit →
                  </div>
                </motion.div>
              ) : (
                <motion.div key="autosave" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)" }}>
                    {saveStatus === "saving" ? "Sauvegarde en cours…" : `Connecté — ${user.email}`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/results" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)" }}>
                ← Résultats questionnaire
              </div>
            </Link>
            <Link href="/video-intro" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)" }}>
                🔄 Refaire l&apos;analyse
              </div>
            </Link>
            <Link href="/dashboard" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.3)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "#7c9fff" }}>
                Dashboard →
              </div>
            </Link>
          </div>

        </div>
      </main>
    );
  }

  // ── DUAL REPORT (bureau) ───────────────────────────────────────────────────
  if (isDual && personneAnalysis && posteAnalysis) {
    const pa = personneAnalysis;
    const po = posteAnalysis;
    const globalScore = Math.round(pa.globalPostureScore * 0.5 + po.globalSetupScore * 0.5);
    const globalColor = scoreColor(globalScore);

    // Combined top-5 recommendations
    type CombinedRec = { priority: number; action: string; why: string; source: "posture" | "setup"; immediat?: boolean; cost?: string };
    const combined: CombinedRec[] = [
      ...pa.recommendations.map(r => ({ ...r, source: "posture" as const })),
      ...po.recommendations.map(r => ({ ...r, source: "setup" as const })),
    ].sort((a, b) => a.priority - b.priority).slice(0, 5);

    // Rule-based products
    const products: Array<{ name: string; reason: string; priority: string; amazon_search: string }> = [];
    if (po.elements.ecran.type === "laptop_seul") products.push({ name: "Support laptop réglable", reason: "Élève l'écran à hauteur des yeux — indispensable sans écran externe.", priority: "haute", amazon_search: "support laptop ergonomique réglable aluminium" });
    if (po.elements.ecran.hauteur === "trop_bas") products.push({ name: "Rehausseur d'écran", reason: "Corrige la hauteur de l'écran pour supprimer la flexion cervicale.", priority: "haute", amazon_search: "rehausseur ecran bureau ergonomique réglable" });
    if (po.elements.chaise.type && !po.elements.chaise.type.toLowerCase().includes("ergo")) products.push({ name: "Coussin lombaire", reason: "Maintient la lordose naturelle quand la chaise est basique.", priority: "moyenne", amazon_search: "coussin lombaire chaise bureau ergonomique" });
    if (po.elements.clavier_souris.repose_poignets === false) products.push({ name: "Repose-poignets clavier", reason: "Prévient le syndrome du canal carpien.", priority: "moyenne", amazon_search: "repose poignets clavier bureau ergonomique" });
    if (po.elements.organisation.eclairage === "mauvais") products.push({ name: "Lampe bureau LED", reason: "Réduit la fatigue visuelle — éclairage insuffisant détecté.", priority: "moyenne", amazon_search: "lampe bureau LED réglable lumière naturelle" });

    // Exercises from bad segments
    const badSegments = (Object.entries(pa.segments) as [string, PersonneSegment][])
      .filter(([, seg]) => seg.score < 65).slice(0, 3).map(([key]) => key);

    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80, position: "relative" }}>
        <BackgroundBlobs blobs={[
          { top: "-5%", right: "-5%", color: "rgba(167,139,250,0.10)", size: 480 },
          { top: "45%", left: "-8%", color: "rgba(43,92,230,0.09)", size: 380 },
          { bottom: "-10%", right: "15%", color: "rgba(34,197,94,0.07)", size: 400 },
        ]} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>

          {/* Nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 80, paddingBottom: 32 }}>
            <Link href="/results" style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t40)", cursor: "pointer" }}>← Résultats</span>
            </Link>
            <div style={{ display: "flex", gap: 8 }}>
              <div onClick={() => window.print()} style={{ padding: "6px 14px", borderRadius: 100, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.09)", fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>
                🖨️ Imprimer
              </div>
            </div>
          </div>

          {/* ── GLOBAL SCORE HEADER ── */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 28, padding: "28px 28px 24px", textAlign: "center", marginBottom: 20, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 14px", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)" }}>
              <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#74c69d" }}>✅ Analyse complète — Posture & Setup</span>
            </div>
            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: "var(--text-primary)", marginBottom: 24 }}>
              {firstname ? `Le bilan complet de ${firstname}` : "Ton bilan PostureAtWork complet"}
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <ScoreRing score={globalScore} size={110} color={globalColor} />
                <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>Score global</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <ScoreRing score={pa.globalPostureScore} size={82} color="#a78bfa" />
                <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>Posture</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <ScoreRing score={po.globalSetupScore} size={82} color="#60a5fa" />
                <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>Setup</span>
              </div>
              {questionnaireScore != null && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <ScoreRing score={questionnaireScore} size={68} color="#7c9fff" />
                  <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)" }}>Questionnaire</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Synthèse croisée questionnaire + vidéo */}
          {synthesis && (
            <>
              <CrossedSynthesisHeader synthesis={synthesis} />
              <ConfirmationsBlock confirmations={synthesis.confirmations} />
              <PositivePointsBlock points={synthesis.positivePoints} />
            </>
          )}

          {/* ── SECTION 1 — POSTURE ── */}
          <section style={{ marginBottom: 12 }}>
            <div style={{ borderRadius: 22, padding: "20px 20px 16px", background: "rgba(167,139,250,0.05)", border: "0.5px solid rgba(167,139,250,0.15)", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <SectionTitle emoji="🧍" title="Ta posture" />
                <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: scoreColor(pa.globalPostureScore) }}>{pa.globalPostureScore}/100</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {([
                  ["tete_cou", "Tête & cou"],
                  ["epaules_dos_haut", "Épaules & dos haut"],
                  ["bas_dos_bassin", "Bas du dos & bassin"],
                  ["membres_superieurs", "Membres supérieurs"],
                  ["membres_inferieurs", "Membres inférieurs"],
                ] as [keyof PersonneAnalysis["segments"], string][]).map(([key, label], i) => (
                  <SegmentBar key={key} label={label} seg={pa.segments[key]} delay={i * 0.06} />
                ))}
              </div>

              {/* Synthesis */}
              <div style={{ marginTop: 12, borderRadius: 14, padding: "12px 16px", background: "rgba(167,139,250,0.07)", border: "0.5px solid rgba(167,139,250,0.18)" }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.65, margin: 0 }}>{pa.overallAssessment}</p>
              </div>

              {/* Issues */}
              {pa.mainIssues.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  {pa.mainIssues.map((issue, i) => {
                    const sevColor = issue.severity === "élevé" ? "#f09595" : issue.severity === "modéré" ? "#f4a261" : "#74c69d";
                    return (
                      <div key={i} style={{ borderRadius: 12, padding: "10px 14px", background: `${sevColor}10`, border: `0.5px solid ${sevColor}35` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 12, color: sevColor }}>{issue.zone}</span>
                          <span style={{ fontFamily: T.b, fontSize: 11, color: `${sevColor}99` }}>· {traduire(issue.severity)}</span>
                        </div>
                        <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t60)", margin: 0 }}>{issue.issue}</p>
                        <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: "3px 0 0" }}>→ {issue.consequence}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Positive points */}
              {pa.positivePoints.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {pa.positivePoints.map((pt, i) => (
                    <span key={i} style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.b, fontSize: 11, color: "#74c69d" }}>
                      ✓ {pt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── SEPARATOR ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ padding: "6px 16px", borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--t50)" }}>+</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* ── SECTION 2 — SETUP ── */}
          <section style={{ marginBottom: 20 }}>
            <div style={{ borderRadius: 22, padding: "20px 20px 16px", background: "rgba(59,130,246,0.05)", border: "0.5px solid rgba(59,130,246,0.15)", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <SectionTitle emoji="🖥️" title="Ton setup" />
                <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: scoreColor(po.globalSetupScore) }}>{po.globalSetupScore}/100</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <ElementCard label="Écran" score={po.elements.ecran.score} issues={po.elements.ecran.issues}
                  extra={`Hauteur : ${po.elements.ecran.hauteur.replace("_", " ")} · Distance : ${po.elements.ecran.distance.replace("_", " ")} · ${po.elements.ecran.type.replace(/_/g, " ")}`}
                  delay={0} />
                <ElementCard label="Clavier & souris" score={po.elements.clavier_souris.score} issues={po.elements.clavier_souris.issues}
                  extra={po.elements.clavier_souris.repose_poignets !== null ? `Repose-poignets : ${po.elements.clavier_souris.repose_poignets ? "présent" : "absent"}` : undefined}
                  delay={0.06} />
                <ElementCard label="Chaise" score={po.elements.chaise.score} issues={po.elements.chaise.issues}
                  extra={`Type : ${po.elements.chaise.type}${po.elements.chaise.accoudoirs !== null ? ` · Accoudoirs : ${po.elements.chaise.accoudoirs ? "présents" : "absents"}` : ""}`}
                  delay={0.12} />
                <ElementCard label="Organisation" score={po.elements.organisation.score} issues={po.elements.organisation.issues}
                  extra={`Éclairage : ${po.elements.organisation.eclairage}`}
                  delay={0.18} />
              </div>

              <div style={{ marginTop: 12, borderRadius: 14, padding: "12px 16px", background: "rgba(59,130,246,0.07)", border: "0.5px solid rgba(59,130,246,0.18)" }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.65, margin: 0 }}>{po.overallAssessment}</p>
              </div>

              {po.positivePoints.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {po.positivePoints.map((pt, i) => (
                    <span key={i} style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.b, fontSize: 11, color: "#74c69d" }}>
                      ✓ {pt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── SECTION 3 — COMBINED RECS ── */}
          <section style={{ marginBottom: 20 }}>
            <SectionTitle emoji="⚡" title="Tes 5 priorités" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {combined.map((rec, i) => {
                const isPosture = rec.source === "posture";
                const accentColor = isPosture ? "#a78bfa" : "#60a5fa";
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.08 }}
                    style={{ borderRadius: 18, padding: "16px 18px", background: i === 0 ? "rgba(240,149,149,0.07)" : "rgba(255,255,255,0.03)", border: `0.5px solid ${i === 0 ? "rgba(240,149,149,0.25)" : "rgba(255,255,255,0.08)"}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "rgba(240,149,149,0.18)" : "rgba(255,255,255,0.06)", fontFamily: T.h, fontWeight: 900, fontSize: 12, color: i === 0 ? "#f09595" : "var(--t35)" }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                          <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{rec.action}</span>
                          <span style={{ padding: "2px 8px", borderRadius: 100, fontFamily: T.b, fontWeight: 600, fontSize: 10, background: `${accentColor}18`, color: accentColor }}>
                            {isPosture ? "Posture" : "Setup"}
                          </span>
                          {isPosture
                            ? <span style={{ padding: "2px 8px", borderRadius: 100, fontFamily: T.b, fontWeight: 600, fontSize: 10, background: "rgba(116,198,157,0.12)", color: "#74c69d" }}>Gratuit — correction immédiate</span>
                            : rec.cost && <span style={{ padding: "2px 8px", borderRadius: 100, fontFamily: T.b, fontWeight: 600, fontSize: 10, background: "rgba(244,162,97,0.12)", color: "#f4a261" }}>{rec.cost}</span>
                          }
                        </div>
                        <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.65, margin: 0 }}>{rec.why}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Plan progressif + checklist */}
          {synthesis && (
            <>
              <WeekPlanBlock weekPlan={synthesis.weekPlan} />
              {synthesis.dailyChecklist.length > 0 && <DailyChecklist items={synthesis.dailyChecklist} />}
            </>
          )}

          {/* ── SECTION 4 — PRODUCTS ── */}
          {products.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <SectionTitle emoji="🛍️" title="Produits recommandés" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {products.map((product, i) => {
                  const pCfg = PRIORITY_COLOR[product.priority] ?? PRIORITY_COLOR.optionnel;
                  const amazonUrl = `https://www.amazon.fr/s?k=${encodeURIComponent(product.amazon_search)}&tag=postureatwork-21`;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.07 }}
                      style={{ borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{product.name}</span>
                          <span style={{ padding: "2px 8px", borderRadius: 100, fontFamily: T.b, fontWeight: 600, fontSize: 11, color: pCfg.color, background: `${pCfg.color}18` }}>{pCfg.label}</span>
                        </div>
                        <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", lineHeight: 1.6, margin: 0 }}>{product.reason}</p>
                      </div>
                      <a href={amazonUrl} target="_blank" rel="noopener noreferrer"
                        style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 100, textDecoration: "none", background: "rgba(244,162,97,0.10)", border: "0.5px solid rgba(244,162,97,0.3)", fontFamily: T.b, fontWeight: 700, fontSize: 12, color: "#f4a261", cursor: "pointer" }}>
                        Amazon →
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── SECTION 5 — EXERCISES ── */}
          {badSegments.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <SectionTitle emoji="🤸" title="Exercices ciblés" />
              <div style={{ borderRadius: 22, padding: "16px 18px", background: "rgba(45,106,79,0.08)", border: "0.5px solid rgba(45,106,79,0.20)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {badSegments.map((key, i) => {
                    const ex = SEGMENT_EXERCISE[key];
                    if (!ex) return null;
                    return (
                      <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < badSegments.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}>
                        <span style={{ fontSize: 18, width: 28, textAlign: "center", flexShrink: 0, marginTop: 1 }}>🏋️</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "var(--text-primary)", margin: "0 0 2px" }}>{ex.name}</p>
                          <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t45)", margin: 0 }}>{ex.instruction}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link href="/mobilite" style={{ textDecoration: "none" }}>
                  <div style={{ marginTop: 14, padding: "11px 0", borderRadius: 100, textAlign: "center", background: "#2b5ce6", boxShadow: "0 4px 16px rgba(43,92,230,0.35)", fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "#fff" }}>
                    Accéder à mon programme →
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* ── SAVE ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ borderRadius: 24, padding: "24px 26px", marginBottom: 16, background: "linear-gradient(135deg, rgba(116,198,157,0.07), rgba(43,92,230,0.07))", border: "0.5px solid rgba(116,198,157,0.2)" }}>
            <AnimatePresence mode="wait">
              {saveStatus === "saved" ? (
                <motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                  <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>Rapport sauvegardé !</p>
                  <Link href="/dashboard" style={{ textDecoration: "none" }}>
                    <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 100, background: "rgba(116,198,157,0.15)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "#74c69d", cursor: "pointer" }}>
                      Voir mon dashboard →
                    </div>
                  </Link>
                </motion.div>
              ) : !user ? (
                <motion.div key="unauthenticated" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>💾</div>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>Sauvegarder mon rapport</p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", marginBottom: 20, lineHeight: 1.65 }}>Crée un compte gratuit pour accéder à ton bilan depuis n&apos;importe où.</p>
                  <div onClick={() => router.push("/auth?redirect=/final-report")}
                    style={{ padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: "pointer", background: "#2b5ce6", boxShadow: "0 4px 24px rgba(43,92,230,0.35)", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff" }}>
                    Créer mon compte gratuit →
                  </div>
                </motion.div>
              ) : (
                <motion.div key="autosave" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)" }}>
                    {saveStatus === "saving" ? "Sauvegarde en cours…" : `Connecté — ${user.email}`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── FOOTER ── */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/results" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)" }}>
                ← Résultats questionnaire
              </div>
            </Link>
            <Link href="/video-intro" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)" }}>
                🔄 Refaire l&apos;analyse
              </div>
            </Link>
            <Link href="/dashboard" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.3)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "#7c9fff" }}>
                Dashboard →
              </div>
            </Link>
          </div>

        </div>
      </main>
    );
  }

  // ── SINGLE REPORT (legacy / debout) ──────────────────────────────────────
  const postureScore = report!.posture_analysis.score;
  const combinedScore = questionnaireScore != null
    ? Math.round(questionnaireScore * 0.6 + postureScore * 0.4)
    : postureScore;
  const combinedColor = combinedScore >= 70 ? "#74c69d" : combinedScore >= 50 ? "#f4a261" : "#f09595";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: "rgba(124,58,237,0.12)", size: 480 },
        { top: "40%", left: "-8%", color: "rgba(43,92,230,0.10)", size: 380 },
        { bottom: "-10%", right: "15%", color: "rgba(116,198,157,0.08)", size: 400 },
      ]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 80, paddingBottom: 32 }}>
          <Link href="/results" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t40)", cursor: "pointer" }}>← Résultats</span>
          </Link>
          <div onClick={() => window.print()} style={{ padding: "6px 14px", borderRadius: 100, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.09)", fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>
            🖨️ Imprimer
          </div>
        </div>

        {/* Header score */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ borderRadius: 28, padding: "28px 28px 24px", textAlign: "center", marginBottom: 20, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 14px", borderRadius: 100, background: "rgba(167,139,250,0.12)", border: "0.5px solid rgba(167,139,250,0.3)" }}>
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>Rapport Analyse IA · Bilan complet</span>
          </div>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: "var(--text-primary)", marginBottom: 24 }}>
            {firstname ? `Le bilan complet de ${firstname}` : "Ton bilan PostureAtWork complet"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <ScoreRing score={combinedScore} size={110} color={combinedColor} />
              <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>Score global</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <ScoreRing score={postureScore} size={82} color="#a78bfa" />
              <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>Posture (IA)</span>
            </div>
            {questionnaireScore != null && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <ScoreRing score={questionnaireScore} size={82} color="#7c9fff" />
                <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>Questionnaire</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Posture analysis */}
        <section style={{ marginBottom: 24 }}>
          <SectionTitle emoji="🧍" title="Analyse posturale" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <PostureCard label="Position de la tête" item={report!.posture_analysis.head_position} delay={0.05} />
            <PostureCard label="Position du cou" item={report!.posture_analysis.neck_position} delay={0.1} />
            <PostureCard label="Épaules" item={report!.posture_analysis.shoulders} delay={0.15} />
            <PostureCard label="Tronc & dos" item={report!.posture_analysis.trunk} delay={0.2} />
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ marginTop: 10, borderRadius: 16, padding: "14px 18px", background: "rgba(167,139,250,0.07)", border: "0.5px solid rgba(167,139,250,0.2)" }}>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.65, margin: 0 }}>{report!.posture_analysis.overall_observation}</p>
          </motion.div>
        </section>

        {/* Setup analysis */}
        <section style={{ marginBottom: 24 }}>
          <SectionTitle emoji="🖥️" title="Analyse de ton setup" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SetupCard label="Hauteur de l'écran" item={report!.setup_analysis.screen_height} delay={0.05} />
            <SetupCard label="Distance à l'écran" item={report!.setup_analysis.screen_distance} delay={0.1} />
            <SetupCard label="Clavier & souris" item={report!.setup_analysis.keyboard_mouse} delay={0.15} />
            <SetupCard label="Configuration du siège" item={report!.setup_analysis.chair_setup} delay={0.2} />
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ marginTop: 10, borderRadius: 16, padding: "14px 18px", background: "rgba(43,92,230,0.07)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.65, margin: 0 }}>{report!.setup_analysis.overall_observation}</p>
          </motion.div>
        </section>

        {/* Priority actions */}
        <section style={{ marginBottom: 24 }}>
          <SectionTitle emoji="🎯" title="Actions prioritaires" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {report!.priority_actions.map((action, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.09 }}
                style={{ borderRadius: 20, padding: "18px 20px", position: "relative", overflow: "hidden", background: i === 0 ? "rgba(240,149,149,0.07)" : "rgba(255,255,255,0.03)", border: `0.5px solid ${i === 0 ? "rgba(240,149,149,0.25)" : "rgba(255,255,255,0.08)"}` }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "rgba(240,149,149,0.18)" : "rgba(255,255,255,0.06)", fontFamily: T.h, fontWeight: 900, fontSize: 13, color: i === 0 ? "#f09595" : "var(--t35)" }}>
                      {action.rank}
                    </div>
                    <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{action.title}</span>
                  </div>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.65, marginBottom: 4 }}>
                    <span style={{ color: "var(--t80)", fontWeight: 600 }}>Pourquoi : </span>{action.why}
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.65, marginBottom: 6 }}>
                    <span style={{ color: "var(--t80)", fontWeight: 600 }}>Comment : </span>{action.how}
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "#74c69d", fontWeight: 600 }}>Impact : {action.impact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section style={{ marginBottom: 24 }}>
          <SectionTitle emoji="🤸" title="Exercices ciblés" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {report!.exercises.map((ex, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.09 }}
                style={{ borderRadius: 20, padding: "18px 20px", background: "rgba(43,92,230,0.07)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{ex.name}</span>
                  <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: 100, background: "rgba(43,92,230,0.15)", color: "#7c9fff", fontFamily: T.b, fontWeight: 600, fontSize: 11 }}>{ex.target}</span>
                </div>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.65, marginBottom: 8 }}>{ex.instruction}</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff" }}>⏱ {ex.duration}</span>
                  <span style={{ color: "var(--t20)" }}>·</span>
                  <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t40)" }}>{ex.frequency}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Products */}
        <section style={{ marginBottom: 24 }}>
          <SectionTitle emoji="🛍️" title="Produits recommandés" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {report!.products.map((product, i) => {
              const pCfg = PRIORITY_COLOR[product.priority] ?? PRIORITY_COLOR.optionnel;
              const amazonUrl = `https://www.amazon.fr/s?k=${encodeURIComponent(product.amazon_search)}&tag=postureatwork-21`;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.07 }}
                  style={{ borderRadius: 20, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{product.name}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 100, fontFamily: T.b, fontWeight: 600, fontSize: 11, color: pCfg.color, background: `${pCfg.color}18` }}>{pCfg.label}</span>
                    </div>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", lineHeight: 1.6, margin: 0 }}>{product.reason}</p>
                  </div>
                  <a href={amazonUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 100, textDecoration: "none", background: "rgba(244,162,97,0.10)", border: "0.5px solid rgba(244,162,97,0.3)", fontFamily: T.b, fontWeight: 700, fontSize: 12, color: "#f4a261", cursor: "pointer" }}>
                    Amazon →
                  </a>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Final message */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ borderRadius: 24, padding: "24px 26px", marginBottom: 16, background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(43,92,230,0.08))", border: "0.5px solid rgba(167,139,250,0.2)" }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🩺</div>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 8 }}>Mot de ton kiné IA</p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.7, margin: 0 }}>{report!.final_message}</p>
        </motion.div>

        {/* Programme */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ marginBottom: 16, borderRadius: 22, padding: "20px 22px", background: "rgba(45,106,79,0.08)", border: "0.5px solid rgba(45,106,79,0.20)" }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#74c69d", margin: "0 0 14px" }}>🧘 Programme recommandé pour toi</p>
          {[
            { emoji: "🦆", name: "Rétraction cervicale", reps: "10 rép. × 5 sec", zone: "Nuque" },
            { emoji: "🌿", name: "Flexion lombaire", reps: "45 sec × 2", zone: "Bas du dos" },
            { emoji: "💜", name: "Cohérence cardiaque", reps: "2 minutes", zone: "Stress & mental" },
          ].map((ex, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ fontSize: 18, width: 32, textAlign: "center" }}>{ex.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "var(--text-primary)", margin: 0 }}>{ex.name}</p>
                <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: 0 }}>{ex.reps}</p>
              </div>
              <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(116,198,157,0.12)", fontFamily: T.b, fontSize: 10, color: "#74c69d" }}>{ex.zone}</span>
            </div>
          ))}
          <Link href="/mobilite?program=cible_cervicales" style={{ textDecoration: "none" }}>
            <div style={{ marginTop: 14, padding: "12px 0", borderRadius: 100, textAlign: "center", background: "#2b5ce6", boxShadow: "0 4px 16px rgba(43,92,230,0.35)", fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "#fff" }}>
              Accéder à mon programme complet →
            </div>
          </Link>
        </motion.div>

        {/* Save */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ borderRadius: 24, padding: "24px 26px", marginBottom: 16, background: "linear-gradient(135deg, rgba(116,198,157,0.07), rgba(43,92,230,0.07))", border: "0.5px solid rgba(116,198,157,0.2)" }}>
          <AnimatePresence mode="wait">
            {saveStatus === "saved" ? (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>Rapport sauvegardé !</p>
                <Link href="/dashboard" style={{ textDecoration: "none" }}>
                  <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 100, background: "rgba(116,198,157,0.15)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "#74c69d", cursor: "pointer" }}>
                    Voir mon dashboard →
                  </div>
                </Link>
              </motion.div>
            ) : saveStatus === "saving" ? (
              <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "12px 0" }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)" }}>Sauvegarde en cours…</p>
              </motion.div>
            ) : user ? (
              <motion.div key="autosave" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)" }}>
                  Connecté en tant que <span style={{ color: "var(--text-primary)" }}>{user.email}</span>.
                </p>
              </motion.div>
            ) : (
              <motion.div key="unauthenticated" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>💾</div>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>Sauvegarder mon rapport</p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", marginBottom: 20, lineHeight: 1.65 }}>Crée un compte gratuit pour accéder à ton bilan depuis n&apos;importe où.</p>
                <div onClick={() => router.push("/auth?redirect=/final-report")}
                  style={{ padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: "pointer", background: "#2b5ce6", boxShadow: "0 4px 24px rgba(43,92,230,0.35)", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff" }}>
                  Créer mon compte gratuit →
                </div>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", textAlign: "center", marginTop: 12 }}>
                  Déjà un compte ?{" "}
                  <span onClick={() => router.push("/auth?redirect=/final-report")} style={{ color: "var(--t55)", textDecoration: "underline", cursor: "pointer" }}>Se connecter</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* PDF download */}
        <div
          onClick={() => router.push("/rapport-pdf")}
          style={{
            padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
            background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
            border: "1px solid rgba(99,102,241,0.3)",
            fontFamily: T.b, fontWeight: 700, fontSize: 14, color: "#a5b4fc",
            marginBottom: 10,
          }}
        >
          📄 Télécharger mon rapport PDF
        </div>

        {/* Bottom actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/results" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)" }}>
              ← Résultats
            </div>
          </Link>
          <Link href="/questionnaire" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)" }}>
              🔄 Refaire
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
