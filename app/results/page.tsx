"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { generatePDF, type PDFData } from "@/lib/generate-pdf";
import {
  calculateScores,
  getRecommendations,
  getExercises,
  DEFAULT_ANSWERS,
  type QuestionnaireAnswers,
  type Scores,
} from "@/lib/scoring";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

// ─── Score color helpers ──────────────────────────────────────────────────────

function scoreBarColor(score: number) {
  if (score >= 70) return "#74c69d";
  if (score >= 50) return "#f4a261";
  return "#f09595";
}

function scoreBadge(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 70) return { label: "Bonne santé", color: "#74c69d", bg: "rgba(116,198,157,0.12)", border: "rgba(116,198,157,0.3)" };
  if (score >= 50) return { label: "À améliorer", color: "#f4a261", bg: "rgba(244,162,97,0.12)", border: "rgba(244,162,97,0.3)" };
  return { label: "Attention requise", color: "#f09595", bg: "rgba(240,149,149,0.12)", border: "rgba(240,149,149,0.3)" };
}

// ─── Animated score circle ────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const step = score / 60;
      const iv = setInterval(() => {
        cur += step;
        if (cur >= score) { setDisplayed(score); clearInterval(iv); }
        else setDisplayed(Math.round(cur));
      }, 16);
      return () => clearInterval(iv);
    }, 300);
    return () => clearTimeout(t);
  }, [score]);

  const size = 140;
  const sw = 6;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (displayed / 100) * circ;
  const color = scoreBarColor(score);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(43,92,230,0.12)"
          stroke="rgba(43,92,230,0.35)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 38, color: "#a8c0ff", lineHeight: 1 }}>
          {displayed}
        </span>
        <span style={{ fontSize: 11, color: "rgba(220,220,245,0.45)", marginTop: 2 }}>/100</span>
      </div>
    </div>
  );
}

// ─── Sub-score bar ────────────────────────────────────────────────────────────

function SubScoreBar({
  label, emoji, score, interpretation, dimensionPath, dimensionColor, delay = 0,
}: {
  label: string; emoji: string; score: number; interpretation: string;
  dimensionPath: string; dimensionColor: string; delay?: number;
}) {
  const color = scoreBarColor(score);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.75)" }}>
            <span>{emoji}</span>
            <span>{label}</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 15, color }}>{score}</span>
            <span style={{ fontSize: 10, color: "rgba(220,220,245,0.3)" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden", marginBottom: 4 }}>
          <motion.div
            style={{ height: "100%", borderRadius: 100, background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: delay + 0.15, ease: "easeOut" }}
          />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.5)", lineHeight: 1.6, paddingTop: 4, paddingBottom: 2 }}
            >
              {interpretation}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Link
        href={dimensionPath}
        style={{ textDecoration: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{
          display: "inline-block", marginTop: 4,
          fontFamily: T.b, fontSize: 11, fontWeight: 600,
          color: dimensionColor, cursor: "pointer",
        }}>
          Voir mon plan détaillé →
        </span>
      </Link>
    </motion.div>
  );
}

// ─── Score interpretation ─────────────────────────────────────────────────────

function scoreInterpretation(key: keyof Scores, score: number, answers: QuestionnaireAnswers): string {
  switch (key) {
    case "setup":
      if (score >= 70) return "Ton poste de travail est bien configuré. Maintiens ces bonnes habitudes.";
      if (score >= 50) return "Ton setup a quelques failles. Un réglage d'écran ou de distance peut faire une grande différence.";
      return `${answers.q1 === "laptop" ? "Le laptop seul est ergonomiquement le pire setup possible. " : ""}Ton écran mal placé génère une tension cervicale permanente.`;
    case "pain":
      if (score >= 70) return "Peu ou pas de douleurs signalées — ton corps s'en sort bien pour l'instant.";
      if (score >= 50) return "Des douleurs modérées sont présentes. Agir maintenant évite la chronicisation.";
      return "Tes douleurs sont significatives et/ou installées depuis longtemps. Une consultation est recommandée.";
    case "habits":
      if (score >= 70) return "Tes habitudes de travail sont saines. Tu bouges suffisamment dans ta journée.";
      if (score >= 50) return "Tu pourrais améliorer tes pauses et ton rapport au téléphone.";
      return `${answers.q13 >= 8 ? `${answers.q13}h assis/jour dépasse le seuil critique. ` : ""}Tu restes trop longtemps immobile.`;
    case "sleep_energy":
      if (score >= 70) return "Ta récupération est bonne. Hydratation et sommeil sont au rendez-vous.";
      if (score >= 50) return "Quelques ajustements sur le sommeil ou l'hydratation amélioreraient ton énergie.";
      return `${answers.q18 === "exhausted" ? "Te réveiller épuisé est un signal fort. " : ""}Le manque de récupération amplifie toutes les douleurs.`;
    case "lifestyle":
      if (score >= 70) return "Ton mode de vie actif compense bien la sédentarité du travail.";
      if (score >= 50) return "Un peu plus de sport ou d'étirements ferait une nette différence.";
      return "Ton corps manque de mouvement pour contrebalancer la sédentarité. C'est réversible avec peu d'efforts.";
    case "nutrition":
      if (score >= 70) return "Ton alimentation soutient bien ton énergie et ta concentration tout au long de la journée.";
      if (score >= 50) return "Quelques ajustements dans tes habitudes alimentaires amélioreraient ton énergie au bureau.";
      return `${answers.qn1 === "screen" ? "Manger devant l'écran empêche la vraie récupération. " : ""}Ton alimentation crée des pics glycémiques qui épuisent ta concentration.`;
    default:
      return "";
  }
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUB_SCORES: { key: keyof Omit<Scores, "global">; label: string; emoji: string; dimensionPath: string; dimensionColor: string }[] = [
  { key: "setup",       label: "Setup & ergonomie",    emoji: "💻", dimensionPath: "/conseils/setup",     dimensionColor: "#7c9fff" },
  { key: "pain",        label: "Douleurs",              emoji: "🩺", dimensionPath: "/conseils/douleurs",  dimensionColor: "#f09595" },
  { key: "habits",      label: "Habitudes de travail",  emoji: "⏱️", dimensionPath: "/conseils/habitudes", dimensionColor: "#f4a261" },
  { key: "sleep_energy",label: "Sommeil & énergie",     emoji: "🌙", dimensionPath: "/conseils/sommeil",   dimensionColor: "#74c69d" },
  { key: "lifestyle",   label: "Mode de vie actif",     emoji: "🏃", dimensionPath: "/conseils/lifestyle", dimensionColor: "#5dcaa5" },
  { key: "nutrition",   label: "Nutrition & énergie",   emoji: "🍽️", dimensionPath: "/conseils/nutrition", dimensionColor: "#a78bfa" },
];

const PRIORITY_STYLE = {
  urgent: { bg: "rgba(240,149,149,0.08)", border: "rgba(240,149,149,0.25)", tagBg: "rgba(240,149,149,0.15)", tagColor: "#f09595", blob: "rgba(240,149,149,0.12)", label: "Urgent" },
  important: { bg: "rgba(244,162,97,0.08)", border: "rgba(244,162,97,0.22)", tagBg: "rgba(244,162,97,0.15)", tagColor: "#f4a261", blob: "rgba(244,162,97,0.12)", label: "Important" },
  good: { bg: "rgba(116,198,157,0.07)", border: "rgba(116,198,157,0.2)", tagBg: "rgba(116,198,157,0.15)", tagColor: "#74c69d", blob: "rgba(116,198,157,0.10)", label: "Bien joué" },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [activeTab, setActiveTab] = useState<"recs" | "exercises">("recs");
  const [pdfLoading, setPdfLoading] = useState(false);

  async function handlePDF() {
    if (!scores || !answers) return;
    setPdfLoading(true);
    const recs2 = getRecommendations(scores, answers);
    const exs = getExercises(scores, answers);
    const pdfData: PDFData = {
      globalScore: scores.global,
      subScores: SUB_SCORES.map((s) => ({
        label: s.label,
        score: scores[s.key],
        color: s.dimensionColor,
      })),
      recommendations: recs2.slice(0, 5).map((r) => ({
        title: r.title,
        description: r.description,
        priority: r.priority,
      })),
      exercises: exs.slice(0, 3).map((e) => ({
        name: e.name,
        duration: e.duration,
        instruction: e.description,
      })),
    };
    await generatePDF(pdfData);
    setPdfLoading(false);
  }

  useEffect(() => {
    const stored = localStorage.getItem("paw_answers");
    const parsed: QuestionnaireAnswers = stored
      ? { ...DEFAULT_ANSWERS, ...JSON.parse(stored) }
      : DEFAULT_ANSWERS;
    setAnswers(parsed);
    const s = calculateScores(parsed);
    setScores(s);
    sessionStorage.setItem("postureatwork_scores", JSON.stringify(s));
    sessionStorage.setItem("postureatwork_answers", JSON.stringify(parsed));
  }, []);

  if (!scores || !answers) {
    return (
      <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.4)" }}>Calcul en cours…</span>
      </main>
    );
  }

  const recs = getRecommendations(scores, answers);
  const exercises = getExercises(scores, answers);
  const badge = scoreBadge(scores.global);

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", paddingBottom: 80, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: "rgba(43,92,230,0.14)", size: 500 },
        { top: "35%", left: "-8%", color: "rgba(116,198,157,0.08)", size: 380 },
        { bottom: "-10%", right: "10%", color: "rgba(244,162,97,0.07)", size: 420 },
      ]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ paddingTop: 80, paddingBottom: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}
        >
          {/* Chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 100,
            background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#74c69d" }} />
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#74c69d" }}>Rapport complet</span>
          </div>

          {/* Circle */}
          <ScoreCircle score={scores.global} />

          {/* Badge */}
          <div style={{
            padding: "6px 16px", borderRadius: 100,
            background: badge.bg, border: `0.5px solid ${badge.border}`,
          }}>
            <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: badge.color }}>{badge.label}</span>
          </div>

          <div>
            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "#f0f0fa", margin: 0, marginBottom: 8, lineHeight: 1.2 }}>
              Ton bilan PostureAtWork
            </h1>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.55)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
              {scores.global >= 70
                ? "Tu as de bonnes bases. Affine les détails pour atteindre un confort optimal."
                : scores.global >= 50
                ? "Plusieurs zones méritent ton attention. Suis les recommandations ci-dessous."
                : "Ton corps envoie des signaux importants. Agis sur les priorités urgentes dès maintenant."}
            </p>
          </div>
        </motion.div>

        {/* ── 6 SOUS-SCORES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            borderRadius: 24, padding: "24px 28px",
            background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#f0f0fa" }}>Tes 6 indicateurs</span>
            <span style={{ fontFamily: T.b, fontSize: 11, color: "rgba(220,220,245,0.3)" }}>Clique pour détails</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {SUB_SCORES.map(({ key, label, emoji, dimensionPath, dimensionColor }, i) => (
              <SubScoreBar
                key={key}
                label={label}
                emoji={emoji}
                score={scores[key]}
                interpretation={scoreInterpretation(key, scores[key], answers)}
                dimensionPath={dimensionPath}
                dimensionColor={dimensionColor}
                delay={0.1 + i * 0.07}
              />
            ))}
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{
            display: "flex", gap: 4, padding: 4, borderRadius: 16,
            background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
            marginBottom: 16,
          }}
        >
          {(["recs", "exercises"] as const).map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, cursor: "pointer",
                background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent",
                color: activeTab === tab ? "#f0f0fa" : "rgba(220,220,245,0.35)",
                fontFamily: T.b, fontWeight: 600, fontSize: 13,
                transition: "all 0.2s ease",
              }}
            >
              {tab === "recs" ? "📋 Recommandations" : "🤸 Exercices"}
            </div>
          ))}
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          {activeTab === "recs" && (
            <motion.div
              key="recs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}
            >
              {recs.slice(0, 5).map((rec, i) => {
                const cfg = PRIORITY_STYLE[rec.priority];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      borderRadius: 20, padding: "20px 22px", position: "relative", overflow: "hidden",
                      background: cfg.bg, border: `0.5px solid ${cfg.border}`,
                    }}
                  >
                    {/* blob top-right */}
                    <div style={{
                      position: "absolute", top: -30, right: -30, width: 120, height: 120,
                      borderRadius: "50%", background: cfg.blob, filter: "blur(30px)", pointerEvents: "none",
                    }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f0f0fa", lineHeight: 1.3 }}>{rec.title}</span>
                        <span style={{
                          flexShrink: 0, padding: "3px 10px", borderRadius: 100,
                          background: cfg.tagBg, color: cfg.tagColor,
                          fontFamily: T.b, fontWeight: 600, fontSize: 11,
                        }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.6)", lineHeight: 1.65, margin: 0 }}>
                        {rec.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "exercises" && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}
            >
              {exercises.map((ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    borderRadius: 20, padding: "20px 22px",
                    background: "rgba(43,92,230,0.07)", border: "0.5px solid rgba(43,92,230,0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{ex.emoji}</span>
                    <div>
                      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f0f0fa", margin: 0 }}>{ex.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff" }}>⏱ {ex.duration}</span>
                        <span style={{ color: "rgba(220,220,245,0.2)", fontSize: 10 }}>·</span>
                        <span style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.4)" }}>{ex.targets}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.55)", lineHeight: 1.65, margin: 0 }}>
                    {ex.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── VIDEO IA CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            borderRadius: 24, padding: "24px 26px", position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, rgba(124,58,237,0.10), rgba(79,70,229,0.10))",
            border: "0.5px solid rgba(124,58,237,0.25)",
            marginBottom: 16,
          }}
        >
          <div style={{
            position: "absolute", top: -40, right: -40, width: 150, height: 150,
            borderRadius: "50%", background: "rgba(124,58,237,0.15)", filter: "blur(40px)", pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>🎬</span>
              <div>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#f0f0fa", margin: 0 }}>Analyse vidéo IA — niveau kiné</p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.45)", margin: 0 }}>60 secondes · Rapport visuel complet</p>
              </div>
            </div>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.55)", lineHeight: 1.65, marginBottom: 16 }}>
              Ton score questionnaire donne une vision partielle. L&apos;IA analyse ta <strong style={{ color: "#f0f0fa", fontWeight: 600 }}>posture réelle en vidéo</strong> pour détecter ce que les mots ne disent pas.
            </p>
            <Link href="/video-intro" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "13px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 0 28px rgba(124,58,237,0.3)",
                fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff",
              }}>
                Affiner mon analyse →
              </div>
            </Link>
          </div>
        </motion.div>

        {/* ── SAVE CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            borderRadius: 24, padding: "24px 26px",
            background: "linear-gradient(135deg, rgba(43,92,230,0.10), rgba(43,92,230,0.06))",
            border: "0.5px solid rgba(43,92,230,0.25)",
            marginBottom: 16,
          }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#f0f0fa", margin: 0, marginBottom: 6 }}>
            Sauvegarde ton rapport
          </p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.55)", lineHeight: 1.65, marginBottom: 18 }}>
            Crée un compte gratuit pour conserver tes résultats, suivre ta progression et accéder au rapport IA complet.
          </p>
          <Link href="/final-report" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "13px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "#2b5ce6",
              boxShadow: "0 4px 24px rgba(43,92,230,0.35)",
              fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff",
            }}>
              Sauvegarder mon rapport →
            </div>
          </Link>
        </motion.div>

        {/* ── PDF ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          style={{ marginBottom: 16 }}
        >
          <div
            onClick={handlePDF}
            style={{
              padding: "13px 0", borderRadius: 100, textAlign: "center", cursor: pdfLoading ? "default" : "pointer",
              background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.12)",
              fontFamily: T.h, fontWeight: 700, fontSize: 14, color: pdfLoading ? "rgba(220,220,245,0.35)" : "#f0f0fa",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {pdfLoading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>⏳</span>
                Génération en cours…
              </>
            ) : (
              "📄 Télécharger mon rapport PDF"
            )}
          </div>
        </motion.div>

        {/* ── BOTTOM ACTIONS ── */}
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/questionnaire" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "rgba(220,220,245,0.45)",
            }}>
              🔄 Refaire le bilan
            </div>
          </Link>
          <Link href="/" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "rgba(220,220,245,0.45)",
            }}>
              🏠 Accueil
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
