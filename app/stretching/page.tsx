"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Exercise {
  id: number;
  name: string;
  target: string;
  emoji: string;
  reps: string;
  holdSec: number; // seconds per rep
  totalSec: number; // computed total
  instruction: string;
  benefit: string;
  frequency: string;
}

const EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Rétraction cervicale",
    target: "Nuque & cervicales",
    emoji: "🦒",
    reps: "3 × 5 sec",
    holdSec: 30,
    totalSec: 30,
    instruction: "Rentrez doucement le menton vers la gorge comme pour faire un double menton. Tenez 5 secondes. Relâchez.",
    benefit: "Réduit la tension sur les 7 vertèbres cervicales",
    frequency: "Toutes les heures",
  },
  {
    id: 2,
    name: "Ouverture pectorale",
    target: "Épaules & pectoraux",
    emoji: "🦅",
    reps: "2 × 45 sec",
    holdSec: 45,
    totalSec: 90,
    instruction: "Entrecroisez les doigts dans le dos, poitrine vers l'avant, épaules vers l'arrière et le bas. Respirez profondément.",
    benefit: "Compense l'enroulement des épaules dû au clavier",
    frequency: "2x par jour",
  },
  {
    id: 3,
    name: "Rotation thoracique",
    target: "Dos & colonne",
    emoji: "🌀",
    reps: "2 × 30 sec par côté",
    holdSec: 60,
    totalSec: 60,
    instruction: "Assis, croisez les bras sur la poitrine. Tournez lentement le buste à droite, puis à gauche. Sans bouger les hanches.",
    benefit: "Libère les blocages thoraciques causés par la position assise prolongée",
    frequency: "3x par jour",
  },
  {
    id: 4,
    name: "Étirement trapèzes",
    target: "Nuque & trapèzes",
    emoji: "🏔️",
    reps: "2 × 30 sec par côté",
    holdSec: 60,
    totalSec: 60,
    instruction: "Inclinez la tête vers l'épaule droite. Posez doucement la main droite sur la tête (sans tirer). Sentez l'étirement à gauche.",
    benefit: "Soulage les trapèzes surchargés par le stress et la mauvaise posture",
    frequency: "Matin et soir",
  },
  {
    id: 5,
    name: "Flexion lombaire",
    target: "Bas du dos",
    emoji: "🌿",
    reps: "2 × 45 sec",
    holdSec: 45,
    totalSec: 90,
    instruction: "Assis au bord de la chaise, penchez-vous lentement vers l'avant, bras entre les jambes vers le sol. Dos arrondi. Respirez.",
    benefit: "Décompresse les disques lombaires après des heures assis",
    frequency: "Toutes les 2h",
  },
];

type Level = "express" | "standard" | "complet";

const LEVEL_CONFIG: Record<Level, { label: string; duration: string; count: number; emoji: string; color: string }> = {
  express: { label: "Express", duration: "5 min", count: 2, emoji: "⚡", color: "#22c55e" },
  standard: { label: "Standard", duration: "10 min", count: 3, emoji: "🎯", color: "#3b82f6" },
  complet: { label: "Complet", duration: "15 min", count: 5, emoji: "🏆", color: "#a78bfa" },
};

// ─── Audio beep ───────────────────────────────────────────────────────────────

function playBeep(freq = 880, dur = 0.15) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch {
    // AudioContext unavailable
  }
}

// ─── Timer circle ─────────────────────────────────────────────────────────────

function TimerCircle({ elapsed, total, color }: { elapsed: number; total: number; color: string }) {
  const SIZE = 220;
  const SW = 12;
  const r = (SIZE - SW) / 2;
  const circ = 2 * Math.PI * r;
  const remaining = Math.max(0, Math.ceil(total - elapsed));
  const progress = Math.min(elapsed / total, 1);

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={SW} />
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke={color} strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.1s linear", filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-extrabold text-white tabular-nums">{remaining}</span>
        <span className="text-slate-400 text-sm mt-1">secondes</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = "select" | "ready" | "running" | "pause" | "next" | "done";

export default function StretchingPage() {
  const [level, setLevel] = useState<Level>("standard");
  const [phase, setPhase] = useState<Phase>("select");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const levelCfg = LEVEL_CONFIG[level];
  const exercises = EXERCISES.slice(0, levelCfg.count);
  const exercise = exercises[currentIdx];

  function stopTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const startTimer = useCallback((ex: Exercise) => {
    stopTimer();
    setElapsed(0);
    startTimeRef.current = Date.now();
    setPhase("running");

    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(e);
      if (e >= ex.totalSec) {
        stopTimer();
        playBeep(1047, 0.25);
        setPhase("next");
      }
    }, 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopTimer(), []);

  function beginSession() {
    setCurrentIdx(0);
    setElapsed(0);
    setPhase("ready");
  }

  function startCurrentExercise() {
    startTimer(exercise);
  }

  function goNext() {
    stopTimer();
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((i) => i + 1);
      setElapsed(0);
      setPhase("ready");
    } else {
      setPhase("done");
      markExercisesDone();
    }
  }

  async function markExercisesDone() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_checkins").upsert(
      { user_id: user.id, date: today, exercises_done: true },
      { onConflict: "user_id,date" }
    );
  }

  const color = levelCfg.color;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-16 pb-20">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-15"
          style={{ background: `radial-gradient(ellipse, ${color}66 0%, transparent 70%)` }}
        />
      </div>

      <div className="relative z-10 max-w-sm mx-auto px-4">
        <AnimatePresence mode="wait">

          {/* ── LEVEL SELECTOR ── */}
          {phase === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4"
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-extrabold text-white">Programme d'étirements</h1>
                <p className="text-slate-400 text-sm">
                  Choisis le niveau adapté à ton temps
                </p>
              </div>

              {/* Level cards */}
              <div className="space-y-3">
                {(["express", "standard", "complet"] as Level[]).map((l) => {
                  const cfg = LEVEL_CONFIG[l];
                  const active = level === l;
                  return (
                    <motion.button
                      key={l}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setLevel(l)}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                      style={{
                        background: active ? `${cfg.color}14` : "rgba(255,255,255,0.03)",
                        border: active ? `1px solid ${cfg.color}44` : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <span className="text-2xl">{cfg.emoji}</span>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{cfg.label}</p>
                        <p className="text-slate-500 text-xs">
                          {cfg.duration} · {cfg.count} exercice{cfg.count > 1 ? "s" : ""}
                        </p>
                      </div>
                      {active && <span style={{ color: cfg.color }} className="font-bold text-sm">✓</span>}
                    </motion.button>
                  );
                })}
              </div>

              {/* Exercise preview */}
              <div
                className="rounded-2xl p-4 space-y-2"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-slate-400 text-xs font-medium mb-3">Au programme :</p>
                {exercises.map((ex, i) => (
                  <div key={ex.id} className="flex items-center gap-3">
                    <span className="text-slate-600 text-xs w-4">{i + 1}.</span>
                    <span className="text-base">{ex.emoji}</span>
                    <span className="text-slate-300 text-xs">{ex.name}</span>
                    <span className="ml-auto text-slate-500 text-xs">{ex.reps}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={beginSession}
                className="w-full py-4 rounded-2xl font-bold text-white text-base"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  boxShadow: `0 0 30px ${color}44`,
                }}
              >
                {levelCfg.emoji} Commencer — {levelCfg.duration}
              </motion.button>
            </motion.div>
          )}

          {/* ── READY ── */}
          {phase === "ready" && exercise && (
            <motion.div
              key={`ready-${currentIdx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4 text-center"
            >
              {/* Progress */}
              <ProgressDots total={exercises.length} current={currentIdx} color={color} />

              <div className="text-6xl">{exercise.emoji}</div>
              <div>
                <h2 className="text-xl font-extrabold text-white mb-2 break-words">{exercise.name}</h2>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium inline-block"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}33`, wordBreak: "break-word", whiteSpace: "normal" }}
                >
                  {exercise.target}
                </span>
              </div>

              <div
                className="rounded-2xl px-5 py-4 text-left space-y-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-slate-200 text-sm leading-relaxed break-words">{exercise.instruction}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}33`, whiteSpace: "nowrap" }}
                  >
                    {exercise.reps}
                  </span>
                  <span className="text-slate-600 text-xs">{exercise.frequency}</span>
                </div>
                <p className="text-slate-500 text-xs break-words">✨ {exercise.benefit}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={startCurrentExercise}
                className="w-full py-4 rounded-2xl font-bold text-white text-base"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  boxShadow: `0 0 30px ${color}44`,
                }}
              >
                Démarrer le timer ▶
              </motion.button>
            </motion.div>
          )}

          {/* ── RUNNING ── */}
          {(phase === "running" || phase === "pause") && exercise && (
            <motion.div
              key={`running-${currentIdx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4 flex flex-col items-center"
            >
              <ProgressDots total={exercises.length} current={currentIdx} color={color} />

              <p className="text-slate-400 text-sm font-medium">{exercise.name}</p>

              <TimerCircle elapsed={elapsed} total={exercise.totalSec} color={color} />

              <div
                className="w-full rounded-2xl px-5 py-4 text-center"
                style={{ background: `${color}0d`, border: `1px solid ${color}22` }}
              >
                <p className="text-slate-200 text-sm leading-relaxed">{exercise.instruction}</p>
              </div>

              {/* Pause / resume */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    stopTimer();
                    setPhase("pause");
                  }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  ⏸ Pause
                </button>
                <button
                  onClick={goNext}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Passer →
                </button>
              </div>

              {phase === "pause" && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startTimer(exercise)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                >
                  ▶ Reprendre
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── NEXT ── */}
          {phase === "next" && exercise && (
            <motion.div
              key={`next-${currentIdx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4 text-center"
            >
              <ProgressDots total={exercises.length} current={currentIdx} color={color} completed />

              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                <div className="text-6xl mb-2">✅</div>
              </motion.div>

              <div>
                <h2 className="text-xl font-bold text-white mb-1">{exercise.name}</h2>
                <p className="text-green-400 text-sm font-medium">Exercice terminé !</p>
              </div>

              {currentIdx < exercises.length - 1 ? (
                <>
                  <div
                    className="rounded-2xl px-5 py-4 text-left"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <p className="text-slate-500 text-xs mb-1">Prochain exercice</p>
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                      <span>{exercises[currentIdx + 1].emoji}</span>
                      {exercises[currentIdx + 1].name}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={goNext}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                      boxShadow: `0 0 30px ${color}44`,
                    }}
                  >
                    Exercice suivant →
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goNext}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow: "0 0 30px rgba(34,197,94,0.4)",
                  }}
                >
                  Terminer la session 🎉
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── DONE ── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 pt-8 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-7xl"
              >
                🎉
              </motion.div>

              <div>
                <h2 className="text-2xl font-extrabold text-white mb-2">Bravo !</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Session <strong className="text-white">{levelCfg.label}</strong> complète.
                  {" "}Tes muscles te remercient.
                </p>
              </div>

              <div
                className="rounded-2xl px-5 py-4 text-center"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <p className="text-green-400 text-sm font-medium mb-1">✓ Session enregistrée</p>
                <p className="text-slate-400 text-xs">Ton check-in du jour a été mis à jour.</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setPhase("select");
                    setCurrentIdx(0);
                    setElapsed(0);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    boxShadow: `0 0 20px ${color}44`,
                  }}
                >
                  🔄 Refaire une session
                </button>
                <Link href="/dashboard">
                  <button
                    className="w-full py-3 rounded-xl text-slate-400 text-sm font-medium hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    ← Retour au dashboard
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ProgressDots({
  total, current, color, completed = false,
}: {
  total: number; current: number; color: string; completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 justify-center w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === current && !completed ? 24 : 8,
            height: 8,
            background:
              i < current || (i === current && completed)
                ? color
                : i === current
                ? color
                : "rgba(255,255,255,0.1)",
            opacity: i > current && !completed ? 0.4 : 1,
          }}
        />
      ))}
    </div>
  );
}
