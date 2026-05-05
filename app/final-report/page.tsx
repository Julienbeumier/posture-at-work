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
} from "@/lib/analysis-types";
import { saveAssessmentForUser, createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusLevel, { color: string; bg: string; border: string; label: string; icon: string }> = {
  bon: { color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", label: "Bon", icon: "✅" },
  attention: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "Attention", icon: "⚠️" },
  critique: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", label: "Critique", icon: "🔴" },
};

const PRIORITY_COLOR: Record<string, { color: string; label: string }> = {
  haute: { color: "#ef4444", label: "Priorité haute" },
  moyenne: { color: "#f59e0b", label: "Priorité moyenne" },
  optionnel: { color: "#64748b", label: "Optionnel" },
};

// ─── Reusable components ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusLevel }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ExpandableCard({
  title, status, children, delay = 0,
}: {
  title: string; status: StatusLevel; children: React.ReactNode; delay?: number;
}) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <span className="text-white font-semibold text-sm">{title}</span>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <span className="text-slate-500 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: cfg.border }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PostureCard({ label, item, delay = 0 }: { label: string; item: PostureItem; delay?: number }) {
  return (
    <ExpandableCard title={label} status={item.status} delay={delay}>
      <p className="text-slate-300 text-sm mb-2 leading-relaxed">
        <span className="font-medium text-white">Observation : </span>
        {item.observation}
      </p>
      <p className="text-slate-400 text-sm leading-relaxed">
        <span className="font-medium text-slate-300">Impact : </span>
        {item.impact}
      </p>
    </ExpandableCard>
  );
}

function SetupCard({ label, item, delay = 0 }: { label: string; item: SetupItem; delay?: number }) {
  return (
    <ExpandableCard title={label} status={item.status} delay={delay}>
      <p className="text-slate-300 text-sm mb-2 leading-relaxed">
        <span className="font-medium text-white">Observation : </span>
        {item.observation}
      </p>
      <p className="text-slate-400 text-sm leading-relaxed">
        <span className="font-medium text-green-400">→ </span>
        {item.recommendation}
      </p>
    </ExpandableCard>
  );
}

// ─── Score circle (small) ─────────────────────────────────────────────────────

function ScoreRing({ score, size = 80, color }: { score: number; size?: number; color: string }) {
  const sw = 6;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-extrabold text-base">{score}</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FinalReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [questionnaireScore, setQuestionnaireScore] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedRef = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("postureatwork_report");
    if (raw) setReport(JSON.parse(raw));

    const scoresRaw = sessionStorage.getItem("postureatwork_scores");
    if (scoresRaw) {
      const scores = JSON.parse(scoresRaw);
      setQuestionnaireScore(scores.global ?? null);
    }

    createClient().auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  // Auto-save when logged in and report is ready
  useEffect(() => {
    if (!user || !report || savedRef.current) return;
    savedRef.current = true;
    setSaveStatus("saving");
    const scoresRaw = sessionStorage.getItem("postureatwork_scores");
    const answersRaw = sessionStorage.getItem("postureatwork_answers");
    const scores = scoresRaw ? JSON.parse(scoresRaw) : {};
    const answers = answersRaw ? JSON.parse(answersRaw) : {};
    saveAssessmentForUser(user.id, scores, answers, report as unknown as Record<string, unknown>)
      .then(() => setSaveStatus("saved"))
      .catch(() => setSaveStatus("error"));
  }, [user, report]);

  function handlePrint() {
    window.print();
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center space-y-5 max-w-sm">
          <div className="text-4xl">📋</div>
          <h2 className="text-xl font-bold text-white">Aucun rapport trouvé</h2>
          <p className="text-slate-400 text-sm">
            Tu n'as pas encore effectué l'analyse vidéo.
          </p>
          <Link href="/video-intro">
            <button
              className="w-full py-3 rounded-xl text-sm font-bold text-white mt-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              Faire l'analyse →
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const postureScore = report.posture_analysis.score;
  const combinedScore = questionnaireScore != null
    ? Math.round(questionnaireScore * 0.6 + postureScore * 0.4)
    : postureScore;

  const combinedColor =
    combinedScore >= 70 ? "#22c55e" : combinedScore >= 50 ? "#eab308" : "#ef4444";

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-20 print:bg-white print:text-black">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] opacity-15"
          style={{ background: `radial-gradient(ellipse, ${combinedColor}66 0%, transparent 70%)` }}
        />
      </div>

      {/* Nav */}
      <div className="relative z-10 px-6 py-5 max-w-2xl mx-auto flex items-center justify-between print:hidden">
        <Link href="/results" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ← Résultats
        </Link>
        <button
          onClick={handlePrint}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          🖨️ Imprimer
        </button>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 space-y-6">
        {/* ── HEADER SCORE ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-7 text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}
          >
            Rapport Analyse IA · Bilan complet
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-6">Ton bilan PostureAtWork complet</h1>

          <div className="flex items-center justify-center gap-10 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={combinedScore} size={100} color={combinedColor} />
              <span className="text-slate-400 text-xs">Score global</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={postureScore} size={80} color="#a78bfa" />
              <span className="text-slate-400 text-xs">Posture (IA)</span>
            </div>
            {questionnaireScore != null && (
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={questionnaireScore} size={80} color="#3b82f6" />
                <span className="text-slate-400 text-xs">Questionnaire</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── POSTURE ANALYSIS ── */}
        <section>
          <SectionTitle emoji="🧍" title="Analyse posturale" />
          <div className="space-y-2">
            <PostureCard label="Position de la tête" item={report.posture_analysis.head_position} delay={0.05} />
            <PostureCard label="Position du cou" item={report.posture_analysis.neck_position} delay={0.1} />
            <PostureCard label="Épaules" item={report.posture_analysis.shoulders} delay={0.15} />
            <PostureCard label="Tronc & dos" item={report.posture_analysis.trunk} delay={0.2} />
          </div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-3 rounded-2xl px-5 py-4"
            style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              {report.posture_analysis.overall_observation}
            </p>
          </motion.div>
        </section>

        {/* ── SETUP ANALYSIS ── */}
        <section>
          <SectionTitle emoji="🖥️" title="Analyse de ton setup" />
          <div className="space-y-2">
            <SetupCard label="Hauteur de l'écran" item={report.setup_analysis.screen_height} delay={0.05} />
            <SetupCard label="Distance à l'écran" item={report.setup_analysis.screen_distance} delay={0.1} />
            <SetupCard label="Clavier & souris" item={report.setup_analysis.keyboard_mouse} delay={0.15} />
            <SetupCard label="Configuration du siège" item={report.setup_analysis.chair_setup} delay={0.2} />
          </div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-3 rounded-2xl px-5 py-4"
            style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              {report.setup_analysis.overall_observation}
            </p>
          </motion.div>
        </section>

        {/* ── PRIORITY ACTIONS ── */}
        <section>
          <SectionTitle emoji="🎯" title="Actions prioritaires" />
          <div className="space-y-3">
            {report.priority_actions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.1 }}
                className="rounded-2xl p-5"
                style={{
                  background: i === 0 ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
                  border: i === 0 ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0"
                    style={{
                      background: i === 0 ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
                      color: i === 0 ? "#f87171" : "#64748b",
                    }}
                  >
                    {action.rank}
                  </div>
                  <h3 className="text-white font-bold text-sm">{action.title}</h3>
                </div>
                <p className="text-slate-400 text-xs mb-1.5 leading-relaxed">
                  <span className="text-slate-300 font-medium">Pourquoi : </span>
                  {action.why}
                </p>
                <p className="text-slate-400 text-xs mb-1.5 leading-relaxed">
                  <span className="text-slate-300 font-medium">Comment : </span>
                  {action.how}
                </p>
                <p className="text-green-400 text-xs font-medium">
                  Impact : {action.impact}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── EXERCISES ── */}
        <section>
          <SectionTitle emoji="🤸" title="Exercices ciblés" />
          <div className="space-y-3">
            {report.exercises.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.1 }}
                className="rounded-2xl p-5"
                style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-white font-bold text-sm">{ex.name}</h3>
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}
                  >
                    {ex.target}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-2">{ex.instruction}</p>
                <div className="flex gap-3 text-xs font-medium">
                  <span className="text-blue-400">⏱ {ex.duration}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{ex.frequency}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section>
          <SectionTitle emoji="🛍️" title="Produits recommandés" />
          <div className="space-y-3">
            {report.products.map((product, i) => {
              const pCfg = PRIORITY_COLOR[product.priority] ?? PRIORITY_COLOR.optionnel;
              const amazonUrl = `https://www.amazon.fr/s?k=${encodeURIComponent(product.amazon_search)}`;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.08 }}
                  className="rounded-2xl p-5 flex items-start justify-between gap-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-white font-bold text-sm">{product.name}</h3>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${pCfg.color}22`,
                          color: pCfg.color,
                          border: `1px solid ${pCfg.color}44`,
                        }}
                      >
                        {pCfg.label}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{product.reason}</p>
                  </div>
                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-orange-400 transition-colors hover:text-orange-300"
                    style={{
                      background: "rgba(251,146,60,0.1)",
                      border: "1px solid rgba(251,146,60,0.3)",
                    }}
                  >
                    Amazon →
                  </a>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── FINAL MESSAGE ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-7"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div className="text-2xl mb-3">🩺</div>
          <h3 className="text-white font-bold text-base mb-3">Mot de ton kiné IA</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{report.final_message}</p>
        </motion.section>

        {/* ── SAVE REPORT ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-7"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.07), rgba(59,130,246,0.07))",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <AnimatePresence mode="wait">
            {saveStatus === "saved" ? (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-white font-bold text-lg mb-2">Rapport sauvegardé !</h3>
                <p className="text-slate-400 text-sm">Retrouve-le dans ton dashboard.</p>
                <Link href="/dashboard" className="inline-block mt-4 text-green-400 text-sm font-semibold hover:text-green-300 transition-colors">
                  Voir mon dashboard →
                </Link>
              </motion.div>
            ) : saveStatus === "saving" ? (
              <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                <div className="text-2xl mb-3 animate-pulse">💾</div>
                <p className="text-slate-400 text-sm">Sauvegarde en cours…</p>
              </motion.div>
            ) : user ? (
              <motion.div key="autosave" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-2xl mb-3">💾</div>
                <h3 className="text-white font-bold text-lg mb-1">Sauvegarde ton rapport</h3>
                <p className="text-slate-400 text-sm mb-4">Connecté en tant que <span className="text-white">{user.email}</span>.</p>
                {saveStatus === "error" && (
                  <p className="text-red-400 text-xs mb-3">Erreur lors de la sauvegarde. <button onClick={() => { savedRef.current = false; setSaveStatus("idle"); }} className="underline">Réessayer</button></p>
                )}
              </motion.div>
            ) : (
              <motion.div key="unauthenticated" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-2xl mb-3">💾</div>
                <h3 className="text-white font-bold text-lg mb-1">Sauvegarder mon rapport</h3>
                <p className="text-slate-400 text-sm mb-5">Crée un compte gratuit pour accéder à ton bilan depuis n'importe où.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/auth?redirect=/final-report")}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}
                >
                  Créer mon compte gratuit →
                </motion.button>
                <p className="text-slate-600 text-xs mt-3 text-center">Déjà un compte ? <button onClick={() => router.push("/auth?redirect=/final-report")} className="text-slate-400 hover:text-white transition-colors underline">Se connecter</button></p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── STRETCHING CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Link href="/stretching">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-3xl p-6 cursor-pointer flex items-center justify-between gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              <div>
                <div className="text-2xl mb-1">🤸</div>
                <h3 className="text-white font-bold text-base mb-0.5">Faire mes étirements maintenant</h3>
                <p className="text-slate-400 text-sm">Programme guidé · 5 à 15 min · ciblé sur tes points faibles</p>
              </div>
              <span className="text-blue-400 text-xl flex-shrink-0">→</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* ── ACTIONS ── */}
        <div className="flex gap-3 print:hidden">
          <Link href="/results" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-slate-400 text-sm font-medium hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              ← Résultats
            </motion.button>
          </Link>
          <Link href="/questionnaire" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-slate-400 text-sm font-medium hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              🔄 Refaire
            </motion.button>
          </Link>
        </div>
      </div>
    </main>
  );
}

// ─── Section title helper ─────────────────────────────────────────────────────

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xl">{emoji}</span>
      <h2 className="text-white font-bold text-base">{title}</h2>
    </div>
  );
}
