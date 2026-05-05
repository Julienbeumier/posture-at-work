"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { StoredFrames, AnalysisReport } from "@/lib/analysis-types";
import type { Scores } from "@/lib/scoring";

const MESSAGES = [
  "Analyse de ta posture cervicale…",
  "Détection de la position de ta tête…",
  "Évaluation de ton setup bureau…",
  "Génération de tes recommandations personnalisées…",
  "Finalisation de ton rapport…",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const called = useRef(false);

  useEffect(() => {
    // Cycle through messages every 3 seconds
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis() {
    try {
      // Read frames from sessionStorage
      const framesRaw = sessionStorage.getItem("postureatwork_frames");
      if (!framesRaw) throw new Error("Aucune frame trouvée. Refais la capture vidéo.");

      const frames: StoredFrames = JSON.parse(framesRaw);
      if (!frames.posture?.length || !frames.bureau?.length) {
        throw new Error("Frames incomplètes. Refais la capture vidéo.");
      }

      // Read questionnaire scores + answers
      const scoresRaw = sessionStorage.getItem("postureatwork_scores");
      const answersRaw = sessionStorage.getItem("postureatwork_answers");

      const questionnaire_scores: Scores | null = scoresRaw
        ? JSON.parse(scoresRaw)
        : null;
      const questionnaire_answers = answersRaw ? JSON.parse(answersRaw) : {};

      // Call the API
      const res = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames_posture: frames.posture,
          frames_bureau: frames.bureau,
          questionnaire_scores,
          questionnaire_answers,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur API (${res.status})`);
      }

      const report: AnalysisReport = await res.json();

      // Store report
      sessionStorage.setItem("postureatwork_report", JSON.stringify(report));

      // Redirect
      router.push("/final-report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="text-4xl">❌</div>
          <h2 className="text-xl font-bold text-white">Analyse échouée</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/video-capture")}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Refaire la capture
            </button>
            <button
              onClick={() => {
                setError(null);
                called.current = false;
                runAnalysis();
              }}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full text-center">
        {/* Pulsing rings */}
        <div className="relative flex items-center justify-center w-40 h-40">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: 64 + i * 36,
                height: 64 + i * 36,
                borderColor: `rgba(139,92,246,${0.3 - i * 0.08})`,
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.3, 0.6] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}
          {/* Center brain */}
          <div
            className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(79,70,229,0.3))",
              border: "1px solid rgba(139,92,246,0.5)",
              boxShadow: "0 0 30px rgba(139,92,246,0.3)",
            }}
          >
            🧠
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Analyse en cours</h1>
          <p className="text-slate-500 text-xs">Claude Vision analyse tes images…</p>
        </div>

        {/* Rotating message */}
        <div
          className="w-full rounded-2xl px-5 py-4 min-h-[56px] flex items-center justify-center"
          style={{
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-slate-200 text-sm font-medium"
            >
              {MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-500"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <p className="text-slate-600 text-xs">
          Cela peut prendre 15–30 secondes
        </p>
      </div>
    </main>
  );
}
