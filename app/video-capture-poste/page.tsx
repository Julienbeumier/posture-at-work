"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Phase = "prep" | "requesting" | "denied" | "not-supported" | "preview" | "recording" | "processing" | "done";

const DURATION = 40;

const SPEECH_SCRIPT: Array<{ t: number; text: string }> = [
  { t: 0, text: "Filme tout ton poste de travail de face." },
  { t: 8, text: "Montre bien l'écran — hauteur et distance par rapport à toi." },
  { t: 16, text: "Montre le clavier et la souris." },
  { t: 24, text: "Montre la chaise — hauteur et dossier." },
  { t: 32, text: "Vue d'ensemble finale — on analyse tout." },
];

const FRAME_TIMES = [6, 14, 22, 32];

const CHECKLIST = [
  { icon: "✅", text: "Ton écran entier" },
  { icon: "✅", text: "Ton clavier et souris" },
  { icon: "✅", text: "Ta chaise (dossier visible)" },
  { icon: "✅", text: "Tes pieds si possible" },
];

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "fr-FR";
  utt.rate = 0.88;
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

function CountdownCircle({ elapsed, total }: { elapsed: number; total: number }) {
  const SIZE = 200; const STROKE = 10;
  const r = (SIZE - STROKE) / 2;
  const circ = 2 * Math.PI * r;
  const remaining = Math.max(Math.ceil(total - elapsed), 0);
  return (
    <div className="relative flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke="#22c55e" strokeWidth={STROKE}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(elapsed / total, 1))}
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

export default function VideoCapturePostePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const framesRef = useRef<string[]>([]);

  const [phase, setPhase] = useState<Phase>("prep");
  const [elapsed, setElapsed] = useState(0);
  const [instruction, setInstruction] = useState("");

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

  async function requestCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { setPhase("not-supported"); return; }
    setPhase("requesting");
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setPhase("preview");
    } catch { setPhase("denied"); }
  }

  function startRecording() {
    setPhase("recording");
    setElapsed(0);
    framesRef.current = [];
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startTime) / 1000;
      setElapsed(e);
      if (e >= DURATION && intervalRef.current) clearInterval(intervalRef.current);
    }, 100);

    SPEECH_SCRIPT.forEach(({ t, text }) => {
      addTimer(() => { setInstruction(text); speak(text); }, t * 1000);
    });

    FRAME_TIMES.forEach(t => {
      addTimer(() => {
        if (videoRef.current) {
          const frame = captureFrame(videoRef.current);
          if (frame) framesRef.current.push(frame);
        }
      }, t * 1000);
    });

    addTimer(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
      setInstruction("");
      finishCapture();
    }, DURATION * 1000);
  }

  function finishCapture() {
    setPhase("processing");
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    try {
      sessionStorage.setItem("paw_video_frames_poste", JSON.stringify(framesRef.current));
    } catch {
      sessionStorage.setItem("paw_video_frames_poste", JSON.stringify(framesRef.current.slice(0, 4)));
    }
    setTimeout(() => { setPhase("done"); router.push("/analyzing"); }, 700);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <video
        ref={videoRef} muted playsInline
        style={{
          position: "fixed", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", pointerEvents: "none", zIndex: 0,
          opacity: ["preview", "recording"].includes(phase) ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
      {["preview", "recording"].includes(phase) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.40)", zIndex: 1, pointerEvents: "none" }} />
      )}

      <AnimatePresence mode="wait">

        {/* ── PREP ── */}
        {phase === "prep" && (
          <motion.div key="prep" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-sm w-full space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🖥️</div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <span className="text-xs font-bold" style={{ color: "#22c55e" }}>📹 Phase 2/2 — Ton setup</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Filme ton poste de travail</h1>
              <p className="text-slate-400 text-sm">Place le téléphone face à ton bureau complet</p>
            </div>

            {/* Checklist */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <p className="text-white font-semibold text-sm mb-3">Tout doit être visible :</p>
              {CHECKLIST.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <span className="text-slate-200 text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* Frame guide */}
            <div className="rounded-2xl p-4 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1.5px dashed rgba(34,197,94,0.35)" }}>
              <div className="text-center">
                <div className="relative w-40 h-28 mx-auto mb-2">
                  {/* Corner marks */}
                  {[["top-0 left-0", "border-t-2 border-l-2"], ["top-0 right-0", "border-t-2 border-r-2"], ["bottom-0 left-0", "border-b-2 border-l-2"], ["bottom-0 right-0", "border-b-2 border-r-2"]].map(([pos, borders], i) => (
                    <div key={i} className={`absolute ${pos} w-5 h-5 ${borders}`} style={{ borderColor: "#22c55e" }} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-center" style={{ color: "rgba(34,197,94,0.8)" }}>Cadre tout<br />ton poste ici</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={requestCamera}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 0 30px rgba(34,197,94,0.3)" }}
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
            <p className="text-slate-400 text-sm">Autorise la caméra dans les paramètres et recharge.</p>
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

        {/* ── PREVIEW ── */}
        {phase === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 10, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, background: "rgba(34,197,94,0.20)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.35)" }}>
                📹 Phase 2/2 — Ton setup
              </span>
            </div>

            {/* Frame guide overlay */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 24px" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 340, aspectRatio: "16/10", border: "2px dashed rgba(34,197,94,0.5)", borderRadius: 12 }}>
                {[["0 0 auto auto", "top-0 right-0"], ["0 auto auto 0", "top-0 left-0"], ["auto 0 0 auto", "bottom-0 right-0"], ["auto auto 0 0", "bottom-0 left-0"]].map(([, pos], i) => (
                  <div key={i} className={`absolute ${pos} w-6 h-6`}
                    style={{
                      borderTop: i < 2 ? "3px solid #22c55e" : undefined,
                      borderBottom: i >= 2 ? "3px solid #22c55e" : undefined,
                      borderLeft: i % 2 === 0 ? "3px solid #22c55e" : undefined,
                      borderRight: i % 2 === 1 ? "3px solid #22c55e" : undefined,
                    }} />
                ))}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "rgba(34,197,94,0.85)", fontSize: 13, textAlign: "center", fontWeight: 600 }}>
                    Cadre tout ton poste ici
                  </span>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center", maxWidth: 260 }}>
                Recule jusqu&apos;à voir écran, clavier et chaise
              </p>
            </div>

            <div style={{ padding: "0 20px 40px" }}>
              <button onClick={startRecording}
                style={{ width: "100%", padding: "17px 0", borderRadius: 100, background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 0 30px rgba(34,197,94,0.4)", color: "#fff", fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer" }}>
                C&apos;est bon, je lance →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── RECORDING ── */}
        {phase === "recording" && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 10, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, background: "rgba(34,197,94,0.20)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.35)" }}>
                📹 Phase 2/2 — Ton setup
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f09595", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f09595", display: "inline-block" }} />
                REC
              </span>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CountdownCircle elapsed={elapsed} total={DURATION} />
            </div>
            <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ borderRadius: 16, padding: "14px 18px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", border: "1px solid rgba(34,197,94,0.25)", minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "rgba(220,220,245,0.90)", fontSize: 13, textAlign: "center", fontWeight: 600, lineHeight: 1.5 }}>
                  {instruction || "Filme ton poste de travail complet…"}
                </p>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.10)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#22c55e", width: `${Math.min((elapsed / DURATION) * 100, 100)}%`, transition: "width 0.1s linear", borderRadius: 100 }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROCESSING / DONE ── */}
        {(phase === "processing" || phase === "done") && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
            <div className="text-4xl animate-pulse">⚡</div>
            <p className="text-white font-semibold">Analyse en cours de préparation…</p>
            <p className="text-slate-500 text-sm">Redirection vers l&apos;analyse IA</p>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
