"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  calculateScores,
  getRecommendations,
  getExercises,
  getScoreLabel,
  getScoreColor,
  DEFAULT_ANSWERS,
  type QuestionnaireAnswers,
  type Scores,
} from "@/lib/scoring";
import { saveAssessment } from "@/lib/supabase";

// ─── Circle progress ──────────────────────────────────────────────────────────

function CircleProgress({
  score,
  size = 200,
  strokeWidth = 14,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(displayed);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let current = 0;
      const step = score / 60;
      const interval = setInterval(() => {
        current += step;
        if (current >= score) {
          setDisplayed(score);
          clearInterval(interval);
        } else {
          setDisplayed(Math.round(current));
        }
      }, 16);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(timeout);
  }, [score]);

  const dash = (displayed / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - dash}
        style={{
          filter: `drop-shadow(0 0 10px ${color}88)`,
          transition: "stroke-dashoffset 0.05s linear, stroke 0.3s",
        }}
      />
    </svg>
  );
}

// ─── Sub-score bar ────────────────────────────────────────────────────────────

function SubScoreBar({
  label, emoji, score, interpretation, delay = 0,
}: {
  label: string; emoji: string; score: number; interpretation: string; delay?: number;
}) {
  const color = getScoreColor(score);
  const label2 = getScoreLabel(score);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-2 cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <span>{emoji}</span>
          <span>{label}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color }}>
            {label2}
          </span>
          <span className="text-sm font-bold text-white w-7 text-right">{score}</span>
          <span className="text-slate-600 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-slate-400 leading-relaxed pt-1"
          >
            {interpretation}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreInterpretation(
  key: keyof Scores,
  score: number,
  answers: QuestionnaireAnswers
): string {
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
      return `${answers.q13 >= 8 ? `${answers.q13}h assis/jour dépasse le seuil critique. ` : ""}Tu restes trop longtemps immobile, ce qui compresse les disques et contracte les muscles.`;
    case "sleep_energy":
      if (score >= 70) return "Ta récupération est bonne. Hydratation et sommeil sont au rendez-vous.";
      if (score >= 50) return "Quelques ajustements sur le sommeil ou l'hydratation amélioreraient ton énergie.";
      return `${answers.q18 === "exhausted" ? "Te réveiller épuisé est un signal fort. " : ""}Le manque de récupération amplifie toutes les douleurs et réduit la concentration.`;
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

// ─── Main page ────────────────────────────────────────────────────────────────

const SUB_SCORES: {
  key: keyof Omit<Scores, "global">;
  label: string;
  emoji: string;
  weight: string;
}[] = [
  { key: "setup", label: "Setup & ergonomie", emoji: "💻", weight: "20%" },
  { key: "pain", label: "Douleurs", emoji: "🩺", weight: "30%" },
  { key: "habits", label: "Habitudes de travail", emoji: "⏱️", weight: "20%" },
  { key: "sleep_energy", label: "Sommeil & énergie", emoji: "🌙", weight: "10%" },
  { key: "lifestyle", label: "Mode de vie actif", emoji: "🏃", weight: "10%" },
  { key: "nutrition", label: "Nutrition & énergie", emoji: "🍽️", weight: "10%" },
];

const PRIORITY_CONFIG = {
  urgent: {
    bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)",
    tag: "Urgent", tagColor: "#ef4444",
  },
  important: {
    bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)",
    tag: "Important", tagColor: "#f59e0b",
  },
  good: {
    bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)",
    tag: "Bien joué", tagColor: "#22c55e",
  },
};

export default function ResultsPage() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [activeTab, setActiveTab] = useState<"recs" | "exercises">("recs");

  useEffect(() => {
    const stored = localStorage.getItem("paw_answers");
    const parsed: QuestionnaireAnswers = stored
      ? { ...DEFAULT_ANSWERS, ...JSON.parse(stored) }
      : DEFAULT_ANSWERS;
    setAnswers(parsed);
    const calculatedScores = calculateScores(parsed);
    setScores(calculatedScores);
    // Store for video analysis flow
    sessionStorage.setItem("postureatwork_scores", JSON.stringify(calculatedScores));
    sessionStorage.setItem("postureatwork_answers", JSON.stringify(parsed));
  }, []);

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !scores || !answers) return;
    setEmailLoading(true);
    setEmailError("");
    try {
      const { error } = await saveAssessment(
        email, scores, answers as unknown as Record<string, unknown>
      );
      if (error) throw error;
      setEmailSubmitted(true);
    } catch {
      setEmailError("Erreur lors de l'envoi. Réessaie plus tard.");
    } finally {
      setEmailLoading(false);
    }
  }

  if (!scores || !answers) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-sm">Calcul en cours…</div>
      </main>
    );
  }

  const recs = getRecommendations(scores, answers);
  const exercises = getExercises(scores, answers);
  const globalColor = getScoreColor(scores.global);
  const globalLabel = getScoreLabel(scores.global);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-20"
          style={{ background: `radial-gradient(ellipse, ${globalColor}55 0%, transparent 70%)` }}
        />
      </div>

      {/* Nav */}
      <div className="relative z-10 px-6 py-5 max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
          ← PostureAtWork
        </Link>
        <Link href="/questionnaire" className="text-slate-500 hover:text-slate-300 transition-colors text-xs">
          Refaire le bilan
        </Link>
      </div>

      {/* ── SCORE GLOBAL ── */}
      <section className="relative z-10 px-6 pb-10 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative mb-6">
            <CircleProgress score={scores.global} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-white">{scores.global}</span>
              <span className="text-slate-400 text-xs mt-1">/ 100</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-3"
              style={{ background: `${globalColor}22`, border: `1px solid ${globalColor}55`, color: globalColor }}
            >
              {globalLabel}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Ton bilan PostureAtWork
            </h1>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              {scores.global >= 70
                ? "Tu as de bonnes bases. Affine les détails pour atteindre un confort optimal."
                : scores.global >= 50
                ? "Plusieurs zones méritent ton attention. Suis les recommandations ci-dessous."
                : "Ton corps envoie des signaux importants. Agis sur les priorités urgentes dès maintenant."}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 5 SOUS-SCORES ── */}
      <section className="relative z-10 px-6 pb-8 max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white font-bold text-base">Tes 5 indicateurs</h2>
            <span className="text-slate-600 text-xs">Clique pour détails</span>
          </div>
          {SUB_SCORES.map(({ key, label, emoji }, i) => (
            <SubScoreBar
              key={key}
              label={label}
              emoji={emoji}
              score={scores[key]}
              interpretation={scoreInterpretation(key, scores[key], answers)}
              delay={0.1 + i * 0.08}
            />
          ))}
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="relative z-10 px-6 max-w-2xl mx-auto mb-5">
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {(["recs", "exercises"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent",
                color: activeTab === tab ? "#fff" : "#64748b",
              }}
            >
              {tab === "recs" ? "📋 Recommandations" : "🤸 Exercices"}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="relative z-10 px-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "recs" && (
            <motion.div
              key="recs"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {recs.map((rec, i) => {
                const cfg = PRIORITY_CONFIG[rec.priority];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl p-5"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-white font-bold text-sm leading-snug">{rec.title}</h3>
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${cfg.tagColor}22`,
                          color: cfg.tagColor,
                          border: `1px solid ${cfg.tagColor}44`,
                        }}
                      >
                        {cfg.tag}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{rec.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "exercises" && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {exercises.map((ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{ex.emoji}</span>
                    <div>
                      <h3 className="text-white font-bold text-sm">{ex.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-blue-400 text-xs font-medium">⏱ {ex.duration}</span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-slate-500 text-xs">{ex.targets}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{ex.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── VIDEO ANALYSIS CTA ── */}
      <section className="relative z-10 px-6 pt-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-3xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.12))",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h3 className="text-white font-bold text-sm">Analyse vidéo IA — niveau kiné</h3>
              <p className="text-slate-400 text-xs mt-0.5">60 secondes · Rapport visuel complet</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            Ton score questionnaire donne une vision partielle. L'IA analyse ta <strong className="text-white">posture réelle en vidéo</strong> pour détecter ce que les mots ne disent pas.
          </p>
          <Link href="/video-intro">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 0 30px rgba(124,58,237,0.35)",
              }}
            >
              Affiner mon analyse →
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── EMAIL CAPTURE ── */}
      <section className="relative z-10 px-6 pt-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl p-7"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.07), rgba(59,130,246,0.07))",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <AnimatePresence mode="wait">
            {!emailSubmitted ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-2xl mb-3">📬</div>
                <h3 className="text-white font-bold text-lg mb-1">Reçois ton rapport complet</h3>
                <p className="text-slate-400 text-sm mb-5">
                  Synthèse de tes résultats + plan d&apos;action personnalisé envoyés dans ta boîte.
                </p>
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com" required
                    className="flex-1 px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-slate-500"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    type="submit" disabled={emailLoading}
                    className="px-6 py-3 rounded-xl font-bold text-white text-sm flex-shrink-0 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}
                  >
                    {emailLoading ? "Envoi…" : "Recevoir →"}
                  </motion.button>
                </form>
                {emailError && <p className="text-red-400 text-xs mt-2">{emailError}</p>}
                <p className="text-slate-600 text-xs mt-3">Pas de spam. Désabonnement en 1 clic.</p>
              </motion.div>
            ) : (
              <motion.div
                key="success" initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }} className="text-center py-4"
              >
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-white font-bold text-lg mb-2">C&apos;est envoyé !</h3>
                <p className="text-slate-400 text-sm">Vérifie ta boîte email dans quelques minutes.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── TEASER VIDÉO ── */}
      <section className="relative z-10 px-6 pt-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Blur overlay */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{ backdropFilter: "blur(2px)", background: "rgba(10,10,10,0.4)" }}
          />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎬</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}
                >
                  Bientôt
                </span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">
                Analyse posturale complète
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Vidéo guidée avec analyse en temps réel de ta posture par IA. Bientôt disponible.
              </p>
            </div>
            <button
              disabled
              className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs opacity-40 cursor-not-allowed"
              style={{ background: "rgba(139,92,246,0.3)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}
            >
              Débloquer →
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── ACTIONS ── */}
      <section className="relative z-10 px-6 pt-5 max-w-2xl mx-auto">
        <div className="flex gap-3">
          <Link href="/questionnaire" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-slate-400 text-sm font-medium hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              🔄 Refaire le bilan
            </motion.button>
          </Link>
          <Link href="/" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-slate-400 text-sm font-medium hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              🏠 Accueil
            </motion.button>
          </Link>
        </div>
      </section>
    </main>
  );
}
