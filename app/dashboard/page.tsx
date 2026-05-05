"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assessment {
  id: string;
  created_at: string;
  global_score: number;
  scores: {
    setup: number;
    pain: number;
    habits: number;
    sleep_energy: number;
    lifestyle: number;
    global: number;
  };
  answers: Record<string, unknown>;
  video_analysis: Record<string, unknown> | null;
}

interface DailyCheckin {
  id?: string;
  date: string;
  exercises_done: boolean;
  water_goal_met: boolean;
  breaks_taken: number;
  pain_level: number;
}

const SCORE_DIMS: { key: keyof Assessment["scores"]; label: string; emoji: string }[] = [
  { key: "setup", label: "Setup & ergonomie", emoji: "💻" },
  { key: "pain", label: "Douleurs", emoji: "🩺" },
  { key: "habits", label: "Habitudes", emoji: "⏱️" },
  { key: "sleep_energy", label: "Sommeil & énergie", emoji: "🌙" },
  { key: "lifestyle", label: "Mode de vie", emoji: "🏃" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreCircle({ score, size = 120 }: { score: number; size?: number }) {
  const sw = 10;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-extrabold text-2xl">{score}</span>
        <span className="text-slate-500 text-[10px]">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ score, prev }: { score: number; prev?: number }) {
  const color = getScoreColor(score);
  const delta = prev != null ? score - prev : null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-white font-bold text-xs w-7 text-right">{score}</span>
        {delta != null && (
          <span
            className="text-[10px] font-semibold w-8"
            style={{ color: delta >= 0 ? "#22c55e" : "#ef4444" }}
          >
            {delta >= 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
    </div>
  );
}

interface AssessmentModalProps {
  assessment: Assessment;
  onClose: () => void;
}

function AssessmentModal({ assessment, onClose }: AssessmentModalProps) {
  const d = new Date(assessment.created_at);
  const color = getScoreColor(assessment.global_score);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl p-6 w-full max-w-sm space-y-4"
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">
              Bilan du {d.toLocaleDateString("fr-FR")}
            </p>
            <p className="text-slate-500 text-xs">{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
          >
            {assessment.global_score}
          </div>
        </div>
        <div className="space-y-3">
          {SCORE_DIMS.map(({ key, label, emoji }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-base w-6">{emoji}</span>
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <ScoreBar score={assessment.scores[key] ?? 0} />
              </div>
            </div>
          ))}
        </div>
        {assessment.video_analysis && (
          <Link href="/final-report">
            <button
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white"
              style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}
            >
              🎬 Voir le rapport vidéo
            </button>
          </Link>
        )}
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-xs text-slate-500 hover:text-white transition-colors">
          Fermer
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [checkin, setCheckin] = useState<DailyCheckin>({
    date: new Date().toISOString().slice(0, 10),
    exercises_done: false,
    water_goal_met: false,
    breaks_taken: 0,
    pain_level: 0,
  });
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { router.replace("/auth"); return; }
    setUser(u);

    const { data: aData } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (aData) setAssessments(aData);

    // Today's checkin
    const today = new Date().toISOString().slice(0, 10);
    const { data: cData } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", u.id)
      .eq("date", today)
      .maybeSingle();
    if (cData) setCheckin(cData);

    // Streak
    const { data: allCheckins } = await supabase
      .from("daily_checkins")
      .select("date")
      .eq("user_id", u.id)
      .order("date", { ascending: false })
      .limit(30);
    if (allCheckins) {
      let s = 0;
      const now = new Date();
      for (let i = 0; i < allCheckins.length; i++) {
        const expected = new Date(now);
        expected.setDate(now.getDate() - i);
        const expectedStr = expected.toISOString().slice(0, 10);
        if (allCheckins[i].date === expectedStr) s++;
        else break;
      }
      setStreak(s);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveCheckin() {
    if (!user) return;
    setCheckinLoading(true);
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_checkins").upsert({
      user_id: user.id,
      date: today,
      exercises_done: checkin.exercises_done,
      water_goal_met: checkin.water_goal_met,
      breaks_taken: checkin.breaks_taken,
      pain_level: checkin.pain_level,
    }, { onConflict: "user_id,date" });
    setCheckinSaved(true);
    setCheckinLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center pt-14">
        <div className="text-slate-400 text-sm animate-pulse">Chargement…</div>
      </main>
    );
  }

  const latest = assessments[0];
  const previous = assessments[1];
  const chartData = [...assessments].reverse().map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    score: a.global_score,
  }));

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "toi";

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-14 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ── HEADER ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 flex items-center justify-between gap-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-4">
            {latest && <ScoreCircle score={latest.global_score} />}
            <div>
              <p className="text-slate-400 text-sm">Bonjour,</p>
              <h1 className="text-white font-extrabold text-xl capitalize">{firstName} 👋</h1>
              {latest && (
                <p className="text-slate-500 text-xs mt-1">
                  Dernier bilan : {getScoreLabel(latest.global_score)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/questionnaire">
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 16px rgba(34,197,94,0.25)" }}
              >
                + Nouveau bilan
              </button>
            </Link>
          </div>
        </motion.section>

        {/* ── ÉVOLUTION ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl p-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="text-white font-bold text-base mb-4">📈 Évolution de ton score</h2>
          {chartData.length <= 1 ? (
            <div
              className="rounded-2xl px-5 py-6 text-center"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
            >
              <p className="text-slate-300 text-sm leading-relaxed">
                Refais un bilan dans <strong className="text-white">2 semaines</strong> pour voir ton évolution graphiquement 📊
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                  labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                  itemStyle={{ color: "#22c55e", fontSize: 12 }}
                />
                <Line
                  type="monotone" dataKey="score"
                  stroke="#22c55e" strokeWidth={2.5}
                  dot={{ fill: "#22c55e", r: 4 }}
                  activeDot={{ r: 6, fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.section>

        {/* ── SCORES DÉTAILLÉS ── */}
        {latest && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-white font-bold text-base mb-4">🎯 Tes 5 indicateurs</h2>
            <div className="space-y-3">
              {SCORE_DIMS.map(({ key, label, emoji }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-lg w-6 flex-shrink-0">{emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-xs font-medium">{label}</span>
                      <span className="text-xs text-slate-500">{getScoreLabel(latest.scores[key] ?? 0)}</span>
                    </div>
                    <ScoreBar
                      score={latest.scores[key] ?? 0}
                      prev={previous?.scores[key]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── CHECK-IN QUOTIDIEN ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl p-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-base">✅ Check-in du jour</h2>
            {streak > 0 && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}
              >
                🔥 {streak} jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {checkinSaved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-2"
              >
                <div className="text-3xl">🎉</div>
                <p className="text-white font-bold text-sm">Journée validée !</p>
                <p className="text-slate-400 text-xs">Reviens demain pour maintenir ton streak.</p>
                <Link href="/stretching">
                  <button
                    className="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  >
                    🤸 Faire mes étirements →
                  </button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Exercises checkbox */}
                <CheckinRow
                  label="Mes exercices du jour"
                  emoji="🤸"
                  checked={checkin.exercises_done}
                  onToggle={() => setCheckin((c) => ({ ...c, exercises_done: !c.exercises_done }))}
                />
                {/* Water */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💧</span>
                    <span className="text-slate-300 text-sm font-medium">Verres d'eau</span>
                    <span className="ml-auto text-white font-bold text-sm">{checkin.breaks_taken}</span>
                  </div>
                  <input
                    type="range" min={0} max={10} step={1}
                    value={checkin.breaks_taken}
                    onChange={(e) => setCheckin((c) => ({ ...c, breaks_taken: Number(e.target.value) }))}
                    className="w-full"
                    style={{ background: `linear-gradient(to right, #3b82f6 ${checkin.breaks_taken * 10}%, rgba(255,255,255,0.1) ${checkin.breaks_taken * 10}%)` }}
                  />
                </div>
                {/* Breaks counter */}
                <div className="flex items-center gap-3">
                  <span className="text-base">⏱️</span>
                  <span className="text-slate-300 text-sm font-medium flex-1">Pauses actives</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCheckin((c) => ({ ...c, breaks_taken: Math.max(0, c.breaks_taken - 1) }))}
                      className="w-7 h-7 rounded-lg text-white font-bold text-sm hover:bg-white/10 transition-colors"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >−</button>
                    <span className="text-white font-bold w-4 text-center">{checkin.breaks_taken}</span>
                    <button
                      onClick={() => setCheckin((c) => ({ ...c, breaks_taken: c.breaks_taken + 1 }))}
                      className="w-7 h-7 rounded-lg text-white font-bold text-sm hover:bg-white/10 transition-colors"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >+</button>
                  </div>
                </div>
                {/* Pain level */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🩺</span>
                    <span className="text-slate-300 text-sm font-medium">Douleur du jour</span>
                    <span className="ml-auto text-white font-bold text-sm">{checkin.pain_level}/5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCheckin((c) => ({ ...c, pain_level: v }))}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: checkin.pain_level === v ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.04)",
                          border: checkin.pain_level === v ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.07)",
                          color: checkin.pain_level === v ? "#f87171" : "#475569",
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveCheckin}
                  disabled={checkinLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.25)" }}
                >
                  {checkinLoading ? "Sauvegarde…" : "Valider ma journée →"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── HISTORIQUE ── */}
        {assessments.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-white font-bold text-base mb-4">📋 Historique des bilans</h2>
            <div className="space-y-2">
              {assessments.map((a, i) => {
                const color = getScoreColor(a.global_score);
                return (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.04 }}
                    onClick={() => setSelectedAssessment(a)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all hover:bg-white/5"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
                    >
                      {a.global_score}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {getScoreLabel(a.global_score)}
                        {a.video_analysis ? " · Analyse vidéo incluse" : ""}
                      </p>
                    </div>
                    <span className="text-slate-600 text-xs">→</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Empty state */}
        {assessments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl p-8 text-center"
            style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}
          >
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-white font-bold mb-2">Pas encore de bilan</p>
            <p className="text-slate-400 text-sm mb-4">Fais ton premier bilan pour commencer à suivre ton évolution.</p>
            <Link href="/questionnaire">
              <button
                className="px-6 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                Faire mon premier bilan →
              </button>
            </Link>
          </motion.div>
        )}

        {/* Stretching CTA */}
        <Link href="/stretching">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.12))",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <span className="text-3xl">🤸</span>
            <div>
              <p className="text-white font-bold text-sm">Mon programme d'étirements</p>
              <p className="text-slate-400 text-xs mt-0.5">Express 5 min · Standard 10 min · Complet 15 min</p>
            </div>
            <span className="ml-auto text-purple-400 text-sm">→</span>
          </motion.div>
        </Link>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedAssessment && (
          <AssessmentModal
            assessment={selectedAssessment}
            onClose={() => setSelectedAssessment(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function CheckinRow({
  label, emoji, checked, onToggle,
}: {
  label: string; emoji: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
      style={{
        background: checked ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
        border: checked ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-slate-200 text-sm font-medium flex-1 text-left">{label}</span>
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
        style={{
          background: checked ? "#22c55e" : "rgba(255,255,255,0.06)",
          border: checked ? "none" : "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {checked && <span className="text-white text-xs font-bold">✓</span>}
      </div>
    </button>
  );
}
