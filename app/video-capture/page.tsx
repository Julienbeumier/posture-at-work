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
  | "step1-preview"
  | "step1"
  | "between"
  | "step2-prep"
  | "step2"
  | "processing"
  | "done";

const STEP1_DURATION = 40;
const STEP2_DURATION = 15;

// Debout step 1 speech
const DEBOUT_STEP1_SPEECH: Array<{ t: number; text: string }> = [
  { t: 0, text: "Place ton téléphone de côté pour qu'on te voie de la tête aux pieds. Prends ta position de travail habituelle." },
  { t: 10, text: "Reste debout dans ta position naturelle. Comme si tu travaillais normalement." },
  { t: 20, text: "Continue à faire semblant de travailler — gestes habituels, position normale." },
  { t: 30, text: "Dernières secondes. Position naturelle, regarde devant toi." },
];

// Bureau phase 1 speech
const BUREAU_STEP1_SPEECH: Array<{ t: number; text: string }> = [
  { t: 0, text: "Assieds-toi dans ta position habituelle de travail." },
  { t: 8, text: "Garde les mains sur le clavier naturellement." },
  { t: 16, text: "Vue de profil — on analyse ta colonne vertébrale." },
  { t: 24, text: "Regarde ton écran normalement." },
  { t: 32, text: "Dernières secondes — position naturelle." },
];

const STEP2_SPEECH: Array<{ t: number; text: string }> = [
  { t: 0, text: "Parfait. Maintenant recule à environ 2 à 3 mètres de ton bureau. Tiens ton téléphone à hauteur des yeux." },
  { t: 5, text: "Lance le balayage. Commence par la gauche, et filme lentement vers la droite pour capturer tout ton setup." },
  { t: 10, text: "Continue doucement... on veut voir ton écran, ta chaise, ton clavier et l'espace autour." },
  { t: 15, text: "Parfait, on a tout ce qu'il faut !" },
];

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
  const voices = window.speechSynthesis.getVoices();
  const french = voices.find(v => v.lang.startsWith("fr") && !v.name.includes("Compact"));
  if (french) utt.voice = french;
  window.speechSynthesis.speak(utt);
}

function captureFrame(videoEl: HTMLVideoElement): string {
  const MAX_W = 800; const MAX_H = 450;
  const w = Math.min(videoEl.videoWidth || MAX_W, MAX_W);
  const h = Math.min(videoEl.videoHeight || MAX_H, MAX_H);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(videoEl, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.8);
}

// ─── Countdown circle ─────────────────────────────────────────────────────────

function CountdownCircle({ elapsed, total, color = "#a78bfa" }: { elapsed: number; total: number; color?: string }) {
  const SIZE = 200; const STROKE = 10;
  const r = (SIZE - STROKE) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(elapsed / total, 1);
  const remaining = Math.max(Math.ceil(total - elapsed), 0);
  return (
    <div className="relative flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke={color} strokeWidth={STROKE}
          strokeLinecap="round" strokeDasharray={circ}
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
  const jobTypeRef = useRef("bureau");

  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isBureau, setIsBureau] = useState(false);

  useEffect(() => {
    const jt = sessionStorage.getItem("paw_video_job_type")
      ?? localStorage.getItem("paw_job_type")
      ?? "bureau";
    jobTypeRef.current = jt;
    setIsBureau(jt === "bureau");
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
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

  async function requestCamera(mode?: "environment" | "user") {
    if (!navigator.mediaDevices?.getUserMedia) { setPhase("not-supported"); return; }
    setPhase("requesting");
    const activeMode = mode ?? facingMode;
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: activeMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setPhase("step1-preview");
    } catch { setPhase("denied"); }
  }

  async function switchCamera() {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    await requestCamera(next);
  }

  const startStep1 = useCallback(() => {
    setPhase("step1");
    setElapsed(0);
    framesRef.current.posture = [];
    const startTime = Date.now();
    const isBureauMode = jobTypeRef.current === "bureau";
    const speechScript = isBureauMode ? BUREAU_STEP1_SPEECH : DEBOUT_STEP1_SPEECH;

    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startTime) / 1000;
      setElapsed(e);
      if (e >= STEP1_DURATION && intervalRef.current) clearInterval(intervalRef.current);
    }, 100);

    speechScript.forEach(({ t, text }: { t: number; text: string }) => {
      addTimer(() => { setCurrentInstruction(text); speak(text); }, t * 1000);
    });

    STEP1_FRAME_TIMES.forEach(t => {
      addTimer(() => {
        if (videoRef.current) {
          const frame = captureFrame(videoRef.current);
          if (frame) framesRef.current.posture.push(frame);
        }
      }, t * 1000);
    });

    addTimer(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
      setCurrentInstruction("");
      if (jobTypeRef.current === "bureau") {
        // Bureau mode: save person frames and go to poste capture
        try {
          sessionStorage.setItem("paw_video_frames_person", JSON.stringify(framesRef.current.posture));
        } catch {
          sessionStorage.setItem("paw_video_frames_person", JSON.stringify(framesRef.current.posture.slice(0, 4)));
        }
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setPhase("processing");
        setTimeout(() => router.push("/video-capture-poste"), 800);
      } else {
        // Debout mode: no step 2, save frames and go directly to analyzing
        try {
          sessionStorage.setItem("paw_video_frames_person", JSON.stringify(framesRef.current.posture));
        } catch {
          sessionStorage.setItem("paw_video_frames_person", JSON.stringify(framesRef.current.posture.slice(0, 4)));
        }
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setPhase("processing");
        setTimeout(() => { setPhase("done"); router.push("/analyzing"); }, 600);
      }
    }, STEP1_DURATION * 1000);
  }, [router]);

  function startStep2() {
    setPhase("step2");
    setElapsed(0);
    framesRef.current.bureau = [];
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startTime) / 1000;
      setElapsed(e);
      if (e >= STEP2_DURATION && intervalRef.current) clearInterval(intervalRef.current);
    }, 100);

    STEP2_SPEECH.forEach(({ t, text }) => {
      addTimer(() => { setCurrentInstruction(text); speak(text); }, t * 1000);
    });

    STEP2_FRAME_TIMES.forEach(t => {
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
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    try {
      sessionStorage.setItem("postureatwork_frames", JSON.stringify(framesRef.current));
    } catch {
      const trimmed: StoredFrames = { posture: framesRef.current.posture.slice(0, 4), bureau: framesRef.current.bureau.slice(0, 3) };
      sessionStorage.setItem("postureatwork_frames", JSON.stringify(trimmed));
    }
    setTimeout(() => { setPhase("done"); router.push("/analyzing"); }, 600);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <video
        ref={videoRef} muted playsInline
        style={{
          position: "fixed", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", pointerEvents: "none", zIndex: 0,
          opacity: ["step1-preview", "step1", "step2-prep", "step2"].includes(phase) ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
      {["step1-preview", "step1", "step2-prep", "step2"].includes(phase) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.40)", zIndex: 1, pointerEvents: "none" }} />
      )}

      <AnimatePresence mode="wait">
        {/* ── IDLE ── */}
        {phase === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-sm w-full text-center space-y-6">
            <div className="text-6xl mb-2">📸</div>
            <h1 className="text-2xl font-bold text-white">
              {isBureau ? "Analyse posture — Phase 1/2" : "Analyse posturale IA"}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {isBureau
                ? "40 secondes de profil assis. Place ton téléphone sur le côté avant de commencer."
                : "40 secondes pour analyser ta posture debout. Installe ton téléphone face à toi et mets tes écouteurs."
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => requestCamera()}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}
            >
              Activer la caméra →
            </motion.button>
          </motion.div>
        )}

        {/* ── REQUESTING ── */}
        {phase === "requesting" && (
          <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
            <div className="text-4xl animate-pulse">📷</div>
            <p className="text-slate-300 text-sm">En attente d&apos;autorisation caméra…</p>
          </motion.div>
        )}

        {/* ── DENIED ── */}
        {phase === "denied" && (
          <motion.div key="denied" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full text-center space-y-5">
            <div className="text-5xl">🚫</div>
            <h2 className="text-xl font-bold text-white">Accès caméra refusé</h2>
            <p className="text-slate-400 text-sm">Autorise l&apos;accès à la caméra dans les paramètres de ton navigateur et recharge la page.</p>
            <button onClick={() => window.location.reload()} className="w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Réessayer
            </button>
          </motion.div>
        )}

        {/* ── NOT SUPPORTED ── */}
        {phase === "not-supported" && (
          <motion.div key="not-supported" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm w-full text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-white">Caméra non supportée</h2>
            <p className="text-slate-400 text-sm">Essaie sur Chrome ou Safari mobile.</p>
          </motion.div>
        )}

        {/* ── STEP 1 PREVIEW ── */}
        {phase === "step1-preview" && (
          <motion.div key="step1-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 10, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                background: isBureau ? "rgba(43,92,230,0.20)" : "rgba(167,139,250,0.20)",
                color: isBureau ? "#7c9fff" : "#a78bfa",
                border: `1px solid ${isBureau ? "rgba(43,92,230,0.35)" : "rgba(167,139,250,0.35)"}`,
              }}>
                {isBureau ? "📹 Phase 1/2 — Analyse posture" : "📹 Analyse posture debout"}
              </span>
              <button onClick={switchCamera}
                style={{ width: 42, height: 42, borderRadius: 21, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                🔄
              </button>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 20px" }}>
              {isBureau ? (
                <>
                  <svg width="80" height="140" viewBox="0 0 80 140" opacity={0.35}>
                    <circle cx="40" cy="14" r="12" fill="white" />
                    <rect x="26" y="28" width="28" height="38" rx="8" fill="white" />
                    <rect x="54" y="48" width="22" height="10" rx="5" fill="white" />
                    <rect x="26" y="62" width="28" height="8" rx="4" fill="white" />
                    <rect x="26" y="70" width="10" height="36" rx="5" fill="white" />
                    <rect x="44" y="70" width="10" height="36" rx="5" fill="white" />
                  </svg>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center", maxWidth: 240 }}>
                    Vue de profil — assis dans ta position habituelle
                  </p>
                </>
              ) : (
                <>
                  <svg width="70" height="130" viewBox="0 0 70 130" opacity={0.35}>
                    <circle cx="35" cy="12" r="11" fill="white" />
                    <rect x="24" y="25" width="22" height="38" rx="7" fill="white" />
                    <rect x="6" y="28" width="16" height="8" rx="4" fill="white" />
                    <rect x="48" y="28" width="16" height="8" rx="4" fill="white" />
                    <rect x="24" y="63" width="9" height="46" rx="4" fill="white" />
                    <rect x="37" y="63" width="9" height="46" rx="4" fill="white" />
                  </svg>
                  <div style={{ width: "100%", maxWidth: 300 }}>
                    <p style={{ color: "rgba(255,255,255,0.80)", fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>
                      📍 Prépare-toi
                    </p>
                    {[
                      "Place ton téléphone à 2-3 mètres de toi",
                      "Il doit te voir de la tête aux pieds",
                      "Prends ta position de travail habituelle",
                      "Pas besoin de PC ou de bureau visible",
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
                        <span style={{ color: "#a78bfa", flexShrink: 0 }}>›</span>
                        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{item}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                      {[
                        "Je suis visible de la tête aux pieds",
                        "Je suis dans ma position de travail normale",
                        "Mon téléphone est stable (posé ou appuyé)",
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(116,198,157,0.9)" }}>
                          <span>✅</span><span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: "0 20px 40px" }}>
              <button onClick={startStep1}
                style={{ width: "100%", padding: "17px 0", borderRadius: 100, background: isBureau ? "linear-gradient(135deg, #2563eb, #4f46e5)" : "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: isBureau ? "0 0 30px rgba(43,92,230,0.45)" : "0 0 30px rgba(124,58,237,0.45)", color: "#fff", fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer" }}>
                C&apos;est bon, je lance →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1 ── */}
        {phase === "step1" && (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 10, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                background: isBureau ? "rgba(43,92,230,0.20)" : "rgba(167,139,250,0.20)",
                color: isBureau ? "#7c9fff" : "#a78bfa",
                border: `1px solid ${isBureau ? "rgba(43,92,230,0.35)" : "rgba(167,139,250,0.35)"}`,
              }}>
                {isBureau ? "📹 Phase 1/2 — Analyse posture" : "📹 Analyse posture debout"}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f09595", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f09595", display: "inline-block", animation: "pulse 1s infinite" }} />
                REC
              </span>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CountdownCircle elapsed={elapsed} total={STEP1_DURATION} color={isBureau ? "#3b82f6" : "#a78bfa"} />
            </div>
            <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ borderRadius: 16, padding: "14px 18px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", border: `1px solid ${isBureau ? "rgba(43,92,230,0.25)" : "rgba(167,139,250,0.25)"}`, minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "rgba(220,220,245,0.90)", fontSize: 13, textAlign: "center", fontWeight: 600, lineHeight: 1.5 }}>
                  {currentInstruction || "Prends ta position de travail habituelle…"}
                </p>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.10)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", background: isBureau ? "#3b82f6" : "#a78bfa", width: `${Math.min((elapsed / STEP1_DURATION) * 100, 100)}%`, transition: "width 0.1s linear", borderRadius: 100 }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BETWEEN STEPS (debout/other only) ── */}
        {phase === "between" && (
          <motion.div key="between" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="max-w-sm w-full text-center space-y-6">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6 }} className="text-6xl">✅</motion.div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Étape 1 terminée !</h2>
              <p className="text-slate-400 text-sm">
                {framesRef.current.posture.length} frames capturées.<br />Maintenant filme ton bureau.
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setPhase("step2-prep")}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 0 30px rgba(59,130,246,0.3)" }}>
              Étape 2 : Filmer le bureau →
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 2 PREP ── */}
        {phase === "step2-prep" && (
          <motion.div key="step2-prep" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-sm w-full text-center space-y-5">
            <div className="text-5xl">🖥️</div>
            <h2 className="text-xl font-bold text-white">Avant de filmer ton bureau</h2>
            <div className="rounded-2xl p-5 text-left space-y-3" style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)" }}>
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
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={startStep2}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 0 30px rgba(59,130,246,0.3)" }}>
              C&apos;est bon, je suis prêt →
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 2 ── */}
        {phase === "step2" && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 10, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, background: "rgba(59,130,246,0.20)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.35)" }}>
                Étape 2 / 2 — Vue bureau
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f09595", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f09595", display: "inline-block" }} />
                REC
              </span>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CountdownCircle elapsed={elapsed} total={STEP2_DURATION} color="#3b82f6" />
            </div>
            <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ borderRadius: 16, padding: "14px 18px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", border: "1px solid rgba(59,130,246,0.25)", minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "rgba(220,220,245,0.90)", fontSize: 13, textAlign: "center", fontWeight: 600, lineHeight: 1.5 }}>
                  {currentInstruction || "Filme ton bureau lentement de gauche à droite…"}
                </p>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.10)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#3b82f6", width: `${Math.min((elapsed / STEP2_DURATION) * 100, 100)}%`, transition: "width 0.1s linear", borderRadius: 100 }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROCESSING / DONE ── */}
        {(phase === "processing" || phase === "done") && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
            <div className="text-4xl animate-pulse">⚡</div>
            <p className="text-white font-semibold">
              {isBureau ? "Analyse posture prête — passage au setup…" : "Préparation de l'analyse…"}
            </p>
            <p className="text-slate-500 text-sm">Redirection en cours</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
