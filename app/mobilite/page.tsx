"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXERCISES, PROGRAMS, TARGETED_PROGRAMS, WEEKLY_CHALLENGES, type Exercise, type Program } from "@/lib/exercises";
import { getVoiceGuide } from "@/lib/voice";
import { createClient } from "@/lib/supabase";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { usePremium } from "@/hooks/usePremium";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

type Tab = "bureau" | "maison" | "deplacement" | "pour_moi";
type Phase = "select" | "running" | "done";

const END_MESSAGES = ["Bien joué ! 💪", "Parfait !", "Continue comme ça !", "Excellent travail !", "Tu assures 🔥"];

function playBeep(freq = 880, dur = 0.1) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
  } catch { /* ignore */ }
}

function getWeekNumber() {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ─── Timer Circle ─────────────────────────────────────────────────────────────

function TimerCircle({ elapsed, total, color }: { elapsed: number; total: number; color: string }) {
  const SIZE = 180; const SW = 10;
  const r = (SIZE - SW) / 2;
  const circ = 2 * Math.PI * r;
  const remaining = Math.max(Math.ceil(total - elapsed), 0);
  const progress = Math.min(elapsed / total, 1);
  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke={color} strokeWidth={SW}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.1s linear", filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 44, color: "var(--text-primary)", lineHeight: 1 }}>{remaining}</span>
        <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", marginTop: 2 }}>secondes</span>
      </div>
    </div>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard({ ex, index, onStart, isDiscreetMode }: {
  ex: Exercise; index: number; onStart: () => void; isDiscreetMode: boolean;
}) {
  if (isDiscreetMode && !ex.discreet) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ borderRadius: 18, padding: "18px 20px", background: "var(--bg-card)", border: "0.5px solid var(--border)", marginBottom: 10 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${ex.zoneColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          {ex.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: 0 }}>{ex.name}</p>
          {ex.subtitle && <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: 0 }}>{ex.subtitle}</p>}
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            <span style={{ padding: "2px 8px", borderRadius: 100, background: `${ex.zoneColor}18`, border: `0.5px solid ${ex.zoneColor}40`, fontFamily: T.b, fontWeight: 600, fontSize: 10, color: ex.zoneColor }}>
              {ex.zone}
            </span>
            {ex.discreet && (
              <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.b, fontWeight: 600, fontSize: 10, color: "#74c69d" }}>
                🤫 Discret
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: ex.zoneColor, margin: 0 }}>{ex.duration}s</p>
          <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t35)", margin: 0 }}>{ex.reps}</p>
        </div>
      </div>
      <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.6, marginBottom: 12 }}>{ex.instruction}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(116,198,157,0.10)", border: "0.5px solid rgba(116,198,157,0.25)", fontFamily: T.b, fontSize: 10, color: "#74c69d" }}>
          ✨ {ex.benefit}
        </span>
        <button onClick={onStart} style={{
          padding: "9px 18px", borderRadius: 100, background: ex.zoneColor, border: "none",
          fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer", flexShrink: 0,
          boxShadow: `0 2px 12px ${ex.zoneColor}50`,
        }}>
          Commencer
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MobilitePage() {
  const router = useRouter();
  const { premium } = usePremium();
  const [tab, setTab] = useState<Tab>("bureau");
  const [activeProgram, setActiveProgram] = useState<Program>(PROGRAMS[0]);
  const [phase, setPhase] = useState<Phase>("select");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [discreetMode, setDiscreetMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [endMessage] = useState(() => END_MESSAGES[Math.floor(Math.random() * END_MESSAGES.length)]);
  const [streak, setStreak] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [notifBanner, setNotifBanner] = useState(false);
  const [personalProgram, setPersonalProgram] = useState<Program | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const voiceCleanupRef = useRef<(() => void) | null>(null);

  // ── Load profile & compute personalized program ───────────────────────────

  useEffect(() => {
    // Speech support detection
    setIsSpeechSupported("speechSynthesis" in window);

    // Load voice preference
    const savedVoice = localStorage.getItem("paw_voice_enabled");
    if (savedVoice === "true") {
      setVoiceEnabled(true);
      getVoiceGuide()?.setEnabled(true);
    }

    // Deep linking via ?program= param
    const paramMap: Record<string, { id: string; tab: Tab }> = {
      setup:            { id: "bureau_pause",      tab: "bureau" },
      douleurs:         { id: "cible_cervicales",  tab: "pour_moi" },
      habitudes:        { id: "bureau_pause",      tab: "bureau" },
      sommeil:          { id: "maison_recup",      tab: "maison" },
      nutrition:        { id: "bureau_express",    tab: "bureau" },
      lifestyle:        { id: "maison_reveil",     tab: "maison" },
      nuque:            { id: "cible_cervicales",  tab: "pour_moi" },
      dos:              { id: "cible_lombaires",   tab: "pour_moi" },
      epaules:          { id: "cible_epaules",     tab: "pour_moi" },
      cible_cervicales: { id: "cible_cervicales",  tab: "pour_moi" },
      cible_lombaires:  { id: "cible_lombaires",   tab: "pour_moi" },
      cible_epaules:    { id: "cible_epaules",     tab: "pour_moi" },
      bureau_express:   { id: "bureau_express",    tab: "bureau" },
      bureau_pause:     { id: "bureau_pause",      tab: "bureau" },
      maison_reveil:    { id: "maison_reveil",     tab: "maison" },
      maison_recup:     { id: "maison_recup",      tab: "maison" },
    };
    // Debout profile: add debout programs to paramMap
    paramMap["debout_pause"]    = { id: "debout_pause",    tab: "bureau" };
    paramMap["debout_recovery"] = { id: "debout_recovery", tab: "maison" };

    const qParam = new URLSearchParams(window.location.search).get("program");
    if (qParam && paramMap[qParam]) {
      const { id, tab: newTab } = paramMap[qParam];
      const found = [...PROGRAMS, ...TARGETED_PROGRAMS].find(p => p.id === id);
      if (found) { setActiveProgram(found); setTab(newTab); }
    } else {
      // Default program based on job type
      const storedJobType = localStorage.getItem("paw_job_type") ?? "bureau";
      if (storedJobType === "debout") {
        const deboutDefault = PROGRAMS.find(p => p.id === "debout_recovery");
        if (deboutDefault) { setActiveProgram(deboutDefault); setTab("maison"); }
      }
    }

    // Streak from Supabase
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: checkins } = await createClient()
        .from("daily_checkins").select("date").eq("user_id", data.user.id)
        .order("date", { ascending: false }).limit(14);
      if (checkins) {
        let s = 0;
        const now = new Date();
        for (let i = 0; i < checkins.length; i++) {
          const exp = new Date(now);
          exp.setDate(now.getDate() - i);
          if (checkins[i].date === exp.toISOString().slice(0, 10)) s++;
          else break;
        }
        setStreak(s);
      }
    });

    // Personalized program
    const answersRaw = sessionStorage.getItem("postureatwork_answers") || localStorage.getItem("paw_answers");
    if (answersRaw) {
      const a = JSON.parse(answersRaw);
      let prog = TARGETED_PROGRAMS[4]; // default: general
      if ((a.q6 ?? 0) >= 2) prog = TARGETED_PROGRAMS[0]; // cervicales
      else if ((a.q8 ?? 0) >= 2) prog = TARGETED_PROGRAMS[1]; // lombaires
      else if ((a.q7 ?? 0) >= 2 || (a.q9 ?? 0) >= 2) prog = TARGETED_PROGRAMS[2]; // epaules
      else if (a.q18 === "exhausted") prog = TARGETED_PROGRAMS[3]; // sommeil
      setPersonalProgram(prog);
    } else {
      setPersonalProgram(TARGETED_PROGRAMS[4]);
    }

    // Notification banner
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      setNotifBanner(true);
    }
  }, []);

  // ── Programs for current tab ──────────────────────────────────────────────

  const tabPrograms = tab === "pour_moi"
    ? (personalProgram ? [personalProgram, ...TARGETED_PROGRAMS.filter(p => p.id !== personalProgram.id)] : TARGETED_PROGRAMS)
    : PROGRAMS.filter(p => p.tab === tab);

  useEffect(() => {
    const first = tabPrograms[0];
    if (first) setActiveProgram(first);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const currentExercises = activeProgram.exerciseIds
    .map(id => EXERCISES[id])
    .filter(Boolean)
    .filter(ex => !discreetMode || ex.discreet);

  // ── Timer logic ───────────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    voiceCleanupRef.current?.();
    voiceCleanupRef.current = null;
    setIsSpeaking(false);
  }, []);

  const startTimer = useCallback((duration: number, onDone: () => void) => {
    stopTimer();
    setElapsed(0);
    startTimeRef.current = Date.now();
    playBeep(660, 0.15);
    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(e);
      const speaking = "speechSynthesis" in window && speechSynthesis.speaking;
      setIsSpeaking(prev => prev === speaking ? prev : speaking);
      if (e >= duration) {
        stopTimer();
        playBeep(880, 0.1);
        setTimeout(() => playBeep(880, 0.1), 150);
        onDone();
      }
    }, 100);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  function toggleVoice() {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    localStorage.setItem("paw_voice_enabled", String(newState));
    const guide = getVoiceGuide();
    guide?.setEnabled(newState);
    if (newState) {
      guide?.speak("Guide vocal activé. Je t'accompagne pendant tes exercices !");
    }
  }

  function startExercise(idx: number) {
    voiceCleanupRef.current?.();
    voiceCleanupRef.current = null;
    setCurrentIdx(idx);
    setPhase("running");
    const ex = currentExercises[idx];
    if (!ex) return;

    const guide = getVoiceGuide();
    if (guide?.isEnabled()) {
      guide.announceExercise(ex);
      const announcementDelay = setTimeout(() => {
        const cleanup = guide.countdown(Math.max(5, ex.duration - 3));
        voiceCleanupRef.current = cleanup ?? null;
      }, 3000);
      voiceCleanupRef.current = () => clearTimeout(announcementDelay);
    }

    startTimer(ex.duration, () => {
      voiceCleanupRef.current?.();
      voiceCleanupRef.current = null;
      setCompletedIds(prev => [...prev, ex.id]);
      if (guide?.isEnabled()) {
        guide.encourageEnd(idx, currentExercises.length);
        const restDelay = setTimeout(() => {
          guide.announceRest(5);
          setTimeout(() => goNext(idx), 7000);
        }, 2000);
        voiceCleanupRef.current = () => clearTimeout(restDelay);
      } else {
        setTimeout(() => goNext(idx), 3000);
      }
    });
  }

  function goNext(idx: number) {
    stopTimer();
    if (idx + 1 < currentExercises.length) {
      startExercise(idx + 1);
    } else {
      setPhase("done");
    }
  }

  function startSession() {
    setCompletedIds([]);
    const guide = getVoiceGuide();
    if (guide?.isEnabled()) {
      guide.announceSessionStart(activeProgram.label, currentExercises.length);
      setTimeout(() => startExercise(0), 3000);
    } else {
      startExercise(0);
    }
  }

  async function saveSession() {
    const { data } = await createClient().auth.getUser();
    if (!data.user) { router.push("/auth"); return; }
    const totalDuration = currentExercises.reduce((s, e) => s + e.duration, 0);
    await createClient().from("exercise_sessions").insert({
      user_id: data.user.id,
      program_id: activeProgram.id,
      exercises_completed: completedIds,
      duration_seconds: totalDuration,
    });
    await createClient().from("daily_checkins").upsert({
      user_id: data.user.id,
      date: new Date().toISOString().slice(0, 10),
      exercises_done: true,
    }, { onConflict: "user_id,date" });
    setSessionSaved(true);
  }

  async function requestNotifications() {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("PAW — Rappels activés 💪", { body: "On te rappellera de faire tes exercices !" });
    }
    setNotifBanner(false);
  }

  const weekChallenge = WEEKLY_CHALLENGES[(getWeekNumber() - 1) % WEEKLY_CHALLENGES.length];
  const currentEx = phase === "running" ? currentExercises[currentIdx] : null;
  const sessionDuration = currentExercises.reduce((s, e) => s + e.duration, 0);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 100, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: "rgba(43,92,230,0.12)", size: 500 },
        { top: "50%", left: "-8%", color: "rgba(45,106,79,0.08)", size: 380 },
      ]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <div style={{ paddingTop: 80, paddingBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.5px" }}>
                Exercices & Mobilité
              </h1>
              {streak > 0 && (
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t45)", margin: "4px 0 0" }}>
                  🔥 {streak} jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""}
                </p>
              )}
            </div>
            {/* Toggles */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {isSpeechSupported && (
                <button
                  onClick={toggleVoice}
                  style={{
                    padding: "8px 14px", borderRadius: 100, cursor: "pointer",
                    background: voiceEnabled ? "rgba(43,92,230,0.20)" : "rgba(255,255,255,0.06)",
                    fontFamily: T.b, fontWeight: 700, fontSize: 12,
                    color: voiceEnabled ? "#7c9fff" : "var(--t50)",
                    border: voiceEnabled ? "0.5px solid rgba(43,92,230,0.4)" : "0.5px solid var(--border-3)",
                  }}
                >
                  {voiceEnabled ? "🔊 Guide vocal ON" : "🔇 Guide vocal"}
                </button>
              )}
              <button
                onClick={() => setDiscreetMode(v => !v)}
                style={{
                  padding: "8px 14px", borderRadius: 100, cursor: "pointer",
                  background: discreetMode ? "rgba(116,198,157,0.20)" : "rgba(255,255,255,0.06)",
                  fontFamily: T.b, fontWeight: 700, fontSize: 12,
                  color: discreetMode ? "#74c69d" : "var(--t50)",
                  border: discreetMode ? "0.5px solid rgba(116,198,157,0.4)" : "0.5px solid var(--border-3)",
                }}
              >
                🤫 {discreetMode ? "Mode discret ON" : "Mode discret"}
              </button>
            </div>
          </div>
          {discreetMode && (
            <div style={{ marginTop: 10, padding: "8px 14px", borderRadius: 10, background: "rgba(116,198,157,0.10)", border: "0.5px solid rgba(116,198,157,0.25)" }}>
              <p style={{ fontFamily: T.b, fontSize: 12, color: "#74c69d", margin: 0 }}>✓ Invisible pour les collègues — seuls les exercices discrets s'affichent</p>
            </div>
          )}
        </div>

        {/* Beta banner */}
        <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 12, background: "rgba(245,158,11,0.08)", border: "0.5px solid rgba(245,158,11,0.20)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.30)", fontFamily: T.b, fontWeight: 700, fontSize: 10, color: "#f59e0b" }}>
            {premium ? "👑 Premium" : "🎁 Gratuit"}
          </span>
          <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(245,158,11,0.75)", margin: 0 }}>
            {premium ? "Tous les exercices sont débloqués" : "Tous les exercices sont offerts · Normalement premium"}
          </p>
        </div>

        {/* Notification banner */}
        <AnimatePresence>
          {notifBanner && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 16, background: "rgba(167,139,250,0.10)", border: "0.5px solid rgba(167,139,250,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t75)", margin: 0 }}>
                💪 Activer les rappels d'exercices ?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={requestNotifications} style={{ padding: "7px 14px", borderRadius: 100, background: "#a78bfa", border: "none", fontFamily: T.b, fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}>
                  Oui, me rappeler
                </button>
                <button onClick={() => setNotifBanner(false)} style={{ padding: "7px 12px", borderRadius: 100, background: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", fontFamily: T.b, fontSize: 12, color: "var(--t40)", cursor: "pointer" }}>
                  Plus tard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
          {(["bureau", "maison", "deplacement", "pour_moi"] as Tab[]).map(t => {
            const labels = { bureau: "📍 Au bureau", maison: "🏠 À la maison", deplacement: "🚗 En déplacement", pour_moi: "🎯 Pour moi" };
            const sel = tab === t;
            return (
              <button key={t} onClick={() => { setTab(t); setPhase("select"); }}
                style={{
                  padding: "8px 16px", borderRadius: 100, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  background: sel ? "rgba(43,92,230,0.20)" : "rgba(255,255,255,0.05)",
                  border: sel ? "0.5px solid rgba(43,92,230,0.45)" : "0.5px solid var(--border-2)",
                  fontFamily: T.h, fontWeight: 700, fontSize: 12,
                  color: sel ? "#7c9fff" : "var(--t45)",
                }}
              >{labels[t]}</button>
            );
          })}
        </div>

        {/* Sub-programs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
          {tabPrograms.map(prog => {
            const sel = activeProgram.id === prog.id;
            return (
              <button key={prog.id} onClick={() => { setActiveProgram(prog); setPhase("select"); }}
                style={{
                  padding: "10px 16px", borderRadius: 14, cursor: "pointer", flexShrink: 0, textAlign: "left",
                  background: sel ? "rgba(43,92,230,0.15)" : "rgba(255,255,255,0.03)",
                  border: sel ? "0.5px solid rgba(43,92,230,0.40)" : "0.5px solid var(--border)",
                }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: sel ? "#7c9fff" : "var(--text-primary)", margin: 0 }}>
                  {prog.icon} {prog.label}
                </p>
                <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t35)", margin: "2px 0 0" }}>{prog.duration}</p>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── SELECT ── */}
          {phase === "select" && (
            <motion.div key="select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              {/* Program overview */}
              <div style={{ borderRadius: 20, padding: "18px 20px", background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.20)", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>{activeProgram.icon} {activeProgram.label}</p>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", margin: "2px 0 0" }}>{activeProgram.description}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: "#7c9fff", margin: 0 }}>{activeProgram.duration}</p>
                    <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t35)", margin: 0 }}>{currentExercises.length} exercices</p>
                  </div>
                </div>
                <button onClick={startSession} style={{
                  width: "100%", padding: "14px 0", borderRadius: 100, border: "none", cursor: "pointer",
                  background: "#2b5ce6", boxShadow: "0 4px 20px rgba(43,92,230,0.4)",
                  fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff",
                }}>
                  Démarrer la session →
                </button>
              </div>

              {/* Exercise list */}
              {currentExercises.map((ex, i) => (
                <ExerciseCard key={ex.id} ex={ex} index={i} isDiscreetMode={false}
                  onStart={() => startExercise(i)}
                />
              ))}

              {/* Weekly challenge */}
              <div style={{ borderRadius: 20, padding: "18px 20px", marginTop: 8, background: "rgba(167,139,250,0.08)", border: "0.5px solid rgba(167,139,250,0.20)" }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#a78bfa", margin: "0 0 6px" }}>🏆 Challenge de la semaine</p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t70)", lineHeight: 1.6, margin: "0 0 10px" }}>{weekChallenge.label}</p>
                <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)", margin: 0 }}>
                  Badge à débloquer : {weekChallenge.badge}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── RUNNING ── */}
          {phase === "running" && currentEx && (
            <motion.div key={`running-${currentIdx}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

              {/* Progress bar */}
              <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 13, color: "var(--t55)", whiteSpace: "nowrap" }}>
                  Exercice {currentIdx + 1}/{currentExercises.length}
                </span>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: currentEx.zoneColor, borderRadius: 100, width: `${((currentIdx + 1) / currentExercises.length) * 100}%`, transition: "width 0.3s ease" }} />
                </div>
                <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "var(--t35)", whiteSpace: "nowrap" }}>
                  ~{Math.ceil((sessionDuration - currentExercises.slice(0, currentIdx).reduce((s, e) => s + e.duration, 0)) / 60)}min
                </span>
              </div>

              {/* Exercise info */}
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: `${currentEx.zoneColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 12px" }}>
                  {currentEx.emoji}
                </div>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "var(--text-primary)", margin: "0 0 4px" }}>{currentEx.name}</p>
                <span style={{ padding: "3px 12px", borderRadius: 100, background: `${currentEx.zoneColor}18`, fontFamily: T.b, fontWeight: 600, fontSize: 11, color: currentEx.zoneColor }}>
                  {currentEx.zone}
                </span>
              </div>

              {/* Timer */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <TimerCircle elapsed={elapsed} total={currentEx.duration} color={currentEx.zoneColor} />
                {voiceEnabled && isSpeaking && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    style={{ fontSize: 18, color: "#7c9fff" }}
                  >
                    🔊
                  </motion.div>
                )}
              </div>

              {/* Instructions */}
              <div style={{ width: "100%", padding: "16px 18px", borderRadius: 16, background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t75)", lineHeight: 1.65, margin: 0 }}>{currentEx.instruction}</p>
              </div>

              {/* Reps badge */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ padding: "5px 14px", borderRadius: 100, background: `${currentEx.zoneColor}15`, border: `0.5px solid ${currentEx.zoneColor}40`, fontFamily: T.b, fontWeight: 600, fontSize: 12, color: currentEx.zoneColor }}>
                  {currentEx.reps}
                </span>
                <span style={{ padding: "5px 14px", borderRadius: 100, background: "var(--bg-card-2)", border: "0.5px solid var(--border-2)", fontFamily: T.b, fontSize: 12, color: "var(--t40)" }}>
                  {currentEx.frequency}
                </span>
              </div>

              {/* Controls */}
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <button onClick={() => { stopTimer(); setPhase("select"); setCompletedIds([]); }}
                  style={{ flex: 1, padding: "12px 0", borderRadius: 100, background: "var(--bg-card-2)", border: "0.5px solid var(--border-3)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)", cursor: "pointer" }}>
                  Terminer
                </button>
                <button onClick={() => goNext(currentIdx)}
                  style={{ flex: 2, padding: "12px 0", borderRadius: 100, background: currentEx.zoneColor, border: "none", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff", cursor: "pointer", boxShadow: `0 2px 16px ${currentEx.zoneColor}50` }}>
                  Suivant → {currentIdx + 1 < currentExercises.length ? `(${currentIdx + 2}/${currentExercises.length})` : "Terminer"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── DONE ── */}
          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center", paddingTop: 20 }}>
              <motion.div animate={{ rotate: [0, 10, -10, 8, 0] }} transition={{ duration: 0.6 }} style={{ fontSize: 64, marginBottom: 16 }}>
                🎉
              </motion.div>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "var(--text-primary)", margin: "0 0 8px" }}>Session terminée !</p>
              <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 18, color: "#74c69d", margin: "0 0 24px" }}>{endMessage}</p>

              <div style={{ borderRadius: 20, padding: "20px 24px", background: "rgba(45,106,79,0.10)", border: "0.5px solid rgba(45,106,79,0.25)", marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: "#74c69d", margin: 0 }}>{completedIds.length}</p>
                    <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: "2px 0 0" }}>exercices complétés</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: "#74c69d", margin: 0 }}>
                      {Math.round(completedIds.reduce((s, id) => s + (EXERCISES[id]?.duration ?? 0), 0) / 60)}min
                    </p>
                    <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: "2px 0 0" }}>durée totale</p>
                  </div>
                </div>
              </div>

              {!sessionSaved ? (
                <button onClick={saveSession} style={{
                  width: "100%", padding: "15px 0", borderRadius: 100, border: "none", cursor: "pointer", marginBottom: 10,
                  background: "#2b5ce6", boxShadow: "0 4px 20px rgba(43,92,230,0.4)",
                  fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff",
                }}>
                  Valider dans mon dashboard →
                </button>
              ) : (
                <div style={{ width: "100%", padding: "15px 0", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#74c69d", textAlign: "center", marginBottom: 10 }}>
                  ✓ Enregistré dans ton dashboard
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setPhase("select"); setCompletedIds([]); }}
                  style={{ flex: 1, padding: "12px 0", borderRadius: 100, background: "var(--bg-card-2)", border: "0.5px solid var(--border-3)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t50)", cursor: "pointer" }}>
                  🔄 Refaire
                </button>
                <Link href="/dashboard" style={{ flex: 1, textDecoration: "none" }}>
                  <div style={{ padding: "12px 0", borderRadius: 100, background: "var(--bg-card-2)", border: "0.5px solid var(--border-3)", fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t50)", textAlign: "center" }}>
                    Dashboard
                  </div>
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
