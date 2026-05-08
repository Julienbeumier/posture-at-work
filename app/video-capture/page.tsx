"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { StoredFrames } from "@/lib/analysis-types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | "idle"
  | "requesting"
  | "denied"
  | "not-supported"
  | "step1"
  | "between"
  | "step2-prep"
  | "step2"
  | "processing"
  | "done";

const STEP1_DURATION = 40;
const STEP2_DURATION = 15;

const STEP1_SPEECH: Array<{ t: number; text: string }> = [
  {
    t: 0,
    text: "Installe ton téléphone sur le côté pour qu'on te voie de profil, de la tête aux genoux. Maintenant reprends ta position de travail habituelle.",
  },
  {
    t: 12,
    text: "Parfait. Continue à travailler normalement, tape quelque chose sur ton clavier.",
  },
  { t: 22, text: "Très bien. Regarde ton téléphone comme tu le fais d'habitude au bureau." },
  { t: 32, text: "Dernière étape. Relâche tout. Position naturelle." },
];

const STEP2_SPEECH: Array<{ t: number; text: string }> = [
  {
    t: 0,
    text: "Parfait. Maintenant recule à environ 2 à 3 mètres de ton bureau. Tiens ton téléphone à hauteur des yeux.",
  },
  {
    t: 5,
    text: "Lance le balayage. Commence par la gauche, et filme lentement vers la droite pour capturer tout ton setup.",
  },
  {
    t: 10,
    text: "Continue doucement... on veut voir ton écran, ta chaise, ton clavier et l'espace autour.",
  },
  {
    t: 15,
    text: "Parfait, on a tout ce qu'il faut !",
  },
];

// Frame capture timestamps (seconds from start)
const STEP1_FRAME_TIMES = [8, 18, 28, 38];
const STEP2_FRAME_TIMES = [4, 9, 14];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "fr-FR";
  utt.rate = 0.88;
  utt.pitch = 1;
  // Try to pick a French voice
  const voices = window.speechSynthesis.getVoices();
  const french = voices.find(
    (v) => v.lang.startsWith("fr") && !v.name.includes("Compact")
  );
  if (french) utt.voice = french;
  window.speechSynthesis.speak(utt);
}

function captureFrame(videoEl: HTMLVideoElement): string {
  const MAX_W = 800;
  const MAX_H = 450;
  const w = Math.min(videoEl.videoWidth || MAX_W, MAX_W);
  const h = Math.min(videoEl.videoHeight || MAX_H, MAX_H);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(videoEl, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.8);
}

// ─── Countdown circle ─────────────────────────────────────────────────────────

function CountdownCircle({
  elapsed,
  total,
  color = "#a78bfa",
}: {
  elapsed: number;
  total: number;
  color?: string;
}) {
  const SIZE = 200;
  const STROKE = 10;
  const r = (SIZE - STROKE) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(elapsed / total, 1);
  const remaining = Math.max(Math.ceil(total - elapsed), 0);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={r}
          fill="none" stroke={color} strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold text-white">{remaining}</span>
        <span className="text-slate-400 text-xs mt-1">secondes</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VideoCapturePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const framesRef = useRef<StoredFrames>({ posture: [], bureau: [] });

  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      timersRef.current.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  function addTimer(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }

  async function requestCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase("not-supported");
      return;
    }
    setPhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      startStep1();
    } catch {
      setPhase("denied");
    }
  }

  const startStep1 = useCallback(() => {
    setPhase("step1");
    setElapsed(0);
    framesRef.current.posture = [];
    const startTime = Date.now();

    // Countdown
    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startTime) / 1000;
      setElapsed(e);
      if (e >= STEP1_DURATION) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);

    // Speech instructions
    STEP1_SPEECH.forEach(({ t, text }) => {
      addTimer(() => {
        setCurrentInstruction(text);
        speak(text);
      }, t * 1000);
    });

    // Frame captures
    STEP1_FRAME_TIMES.forEach((t) => {
      addTimer(() => {
        if (videoRef.current) {
          const frame = captureFrame(videoRef.current);
          if (frame) framesRef.current.posture.push(frame);
        }
      }, t * 1000);
    });

    // End of step 1
    addTimer(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
      setPhase("between");
      setCurrentInstruction("");
    }, STEP1_DURATION * 1000);
  }, []);

  function startStep2() {
    setPhase("step2");
    setElapsed(0);
    framesRef.current.bureau = [];
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startTime) / 1000;
      setElapsed(e);
      if (e >= STEP2_DURATION) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);

    STEP2_SPEECH.forEach(({ t, text }) => {
      addTimer(() => {
        setCurrentInstruction(text);
        speak(text);
      }, t * 1000);
    });

    STEP2_FRAME_TIMES.forEach((t) => {
      addTimer(() => {
        if (videoRef.current) {
          const frame = captureFrame(videoRef.current);
          if (frame) framesRef.current.bureau.push(frame);
        }
      }, t * 1000);
    });

    addTimer(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
      finishCapture();
    }, STEP2_DURATION * 1000);
  }

  function finishCapture() {
    setPhase("processing");
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    // Save frames to sessionStorage
    try {
      sessionStorage.setItem(
        "postureatwork_frames",
        JSON.stringify(framesRef.current)
      );
    } catch {
      // sessionStorage might be full — trim quality and retry
      const trimmed: StoredFrames = {
        posture: framesRef.current.posture.slice(0, 4),
        bureau: framesRef.current.bureau.slice(0, 3),
      };
      sessionStorage.setItem("postureatwork_frames", JSON.stringify(trimmed));
    }
    setTimeout(() => {
      setPhase("done");
      router.push("/analyzing");
    }, 600);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      {/* Hidden video element for camera stream */}
      <video
        ref={videoRef}
        className="fixed pointer-events-none"
        style={{ width: 1, height: 1, opacity: 0, top: -9999 }}
        muted
        playsInline
      />

      <AnimatePresence mode="wait">
        {/* ── IDLE ── */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-sm w-full text-center space-y-6"
          >
            <div className="text-6xl mb-2">📸</div>
            <h1 className="text-2xl font-bold text-white">
              Analyse posturale IA
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              2 étapes courtes : <strong className="text-white">40s de profil</strong> puis{" "}
              <strong className="text-white">15s de bureau</strong>. Installe ton téléphone et mets tes écouteurs avant de commencer.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={requestCamera}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 0 40px rgba(124,58,237,0.4)",
              }}
            >
              Activer la caméra →
            </motion.button>
          </motion.div>
        )}

        {/* ── REQUESTING ── */}
        {phase === "requesting" && (
          <motion.div
            key="requesting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <div className="text-4xl animate-pulse">📷</div>
            <p className="text-slate-300 text-sm">
              En attente d'autorisation caméra…
            </p>
          </motion.div>
        )}

        {/* ── DENIED ── */}
        {phase === "denied" && (
          <motion.div
            key="denied"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm w-full text-center space-y-5"
          >
            <div className="text-5xl">🚫</div>
            <h2 className="text-xl font-bold text-white">Accès caméra refusé</h2>
            <p className="text-slate-400 text-sm">
              Autorise l'accès à la caméra dans les paramètres de ton navigateur et recharge la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Réessayer
            </button>
          </motion.div>
        )}

        {/* ── NOT SUPPORTED ── */}
        {phase === "not-supported" && (
          <motion.div
            key="not-supported"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-sm w-full text-center space-y-4"
          >
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-white">Caméra non supportée</h2>
            <p className="text-slate-400 text-sm">
              Ton navigateur ne supporte pas l'accès caméra. Essaie sur Chrome ou Safari mobile.
            </p>
          </motion.div>
        )}

        {/* ── STEP 1 ── */}
        {phase === "step1" && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-sm w-full flex flex-col items-center gap-6"
          >
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}
              >
                Étape 1 / 2 — Profil assis
              </span>
            </div>

            {/* Countdown */}
            <CountdownCircle elapsed={elapsed} total={STEP1_DURATION} color="#a78bfa" />

            {/* Current instruction */}
            <div
              className="w-full rounded-2xl px-5 py-4 text-center min-h-[72px] flex items-center justify-center"
              style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}
            >
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                {currentInstruction || "Prends ta position de travail habituelle…"}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#a78bfa", width: `${Math.min((elapsed / STEP1_DURATION) * 100, 100)}%`, transition: "width 0.1s linear" }}
              />
            </div>

            <p className="text-slate-600 text-xs text-center">
              Reste immobile dans ta position naturelle
            </p>
          </motion.div>
        )}

        {/* ── BETWEEN STEPS ── */}
        {phase === "between" && (
          <motion.div
            key="between"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-sm w-full text-center space-y-6"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
              className="text-6xl"
            >
              ✅
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Étape 1 terminée !</h2>
              <p className="text-slate-400 text-sm">
                {framesRef.current.posture.length} frames capturées.
                <br />
                Maintenant filme ton bureau.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPhase("step2-prep")}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                boxShadow: "0 0 30px rgba(59,130,246,0.3)",
              }}
            >
              Étape 2 : Filmer le bureau →
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 2 PREP ── */}
        {phase === "step2-prep" && (
          <motion.div
            key="step2-prep"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-sm w-full text-center space-y-5"
          >
            <div className="text-5xl">🖥️</div>
            <h2 className="text-xl font-bold text-white">Avant de filmer ton bureau</h2>

            <div
              className="rounded-2xl p-5 text-left space-y-3"
              style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              {[
                { icon: "📍", text: "Recule à 2–3 mètres de ton bureau" },
                { icon: "⬆️", text: "Tiens ton téléphone à hauteur des yeux" },
                { icon: "💡", text: "Assure-toi que la pièce est bien éclairée" },
                { icon: "🔄", text: "Tu vas balayer de gauche à droite lentement" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <span className="text-slate-200 text-sm">{text}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={startStep2}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                boxShadow: "0 0 30px rgba(59,130,246,0.3)",
              }}
            >
              C&apos;est bon, je suis prêt →
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 2 ── */}
        {phase === "step2" && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-sm w-full flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}
              >
                Étape 2 / 2 — Vue bureau
              </span>
            </div>

            <CountdownCircle elapsed={elapsed} total={STEP2_DURATION} color="#3b82f6" />

            <div
              className="w-full rounded-2xl px-5 py-4 text-center min-h-[72px] flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                {currentInstruction || "Filme ton bureau lentement de gauche à droite…"}
              </p>
            </div>

            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ background: "#3b82f6", width: `${Math.min((elapsed / STEP2_DURATION) * 100, 100)}%`, transition: "width 0.1s linear" }}
              />
            </div>

            <p className="text-slate-600 text-xs text-center">
              Pan lent de gauche à droite
            </p>
          </motion.div>
        )}

        {/* ── PROCESSING / DONE ── */}
        {(phase === "processing" || phase === "done") && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="text-4xl animate-pulse">⚡</div>
            <p className="text-white font-semibold">Préparation de l'analyse…</p>
            <p className="text-slate-500 text-sm">Redirection en cours</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
