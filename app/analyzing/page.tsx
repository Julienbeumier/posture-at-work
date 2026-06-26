"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { StoredFrames, AnalysisReport } from "@/lib/analysis-types";
import type { Scores } from "@/lib/scoring";

const SINGLE_MESSAGES = [
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
  // Dual-mode states
  const [isDual, setIsDual] = useState(false);
  const [personneDone, setPersonneDone] = useState(false);
  const [posteDone, setPosteDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const called = useRef(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setMsgIndex(i => (i + 1) % SINGLE_MESSAGES.length), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
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
      const framesPersonneRaw = sessionStorage.getItem("paw_video_frames_person");
      const framesPosteRaw = sessionStorage.getItem("paw_video_frames_poste");

      const scoresRaw = sessionStorage.getItem("postureatwork_scores");
      const answersRaw = sessionStorage.getItem("postureatwork_answers");
      const questionnaire_scores: Scores | null = scoresRaw ? JSON.parse(scoresRaw) : null;
      const questionnaire_answers = answersRaw ? JSON.parse(answersRaw) : {};

      const jobType = (questionnaire_scores as (Record<string, unknown> | null))?.job_type as string
        ?? sessionStorage.getItem("paw_video_job_type")
        ?? localStorage.getItem("paw_job_type")
        ?? "bureau";

      // ── Debout analysis mode ─────────────────────────────────────────────
      if (framesPersonneRaw && !framesPosteRaw && jobType === "debout") {
        const framesPersonne: string[] = JSON.parse(framesPersonneRaw);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 55000);
        let res: Response;
        try {
          res = await fetch("/api/analyze-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              frames: framesPersonne,
              analysisType: "debout",
              job_type: "debout",
              questionnaire_scores,
              questionnaire_answers,
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
        const data = await res.json();
        sessionStorage.setItem("paw_analysis_personne", JSON.stringify(data));
        setTimeout(() => router.push("/final-report"), 1200);
        return;
      }

      // ── Dual analysis mode (bureau) ─────────────────────────────────────
      if (framesPersonneRaw && framesPosteRaw) {
        setIsDual(true);
        const framesPersonne: string[] = JSON.parse(framesPersonneRaw);
        const framesPoste: string[] = JSON.parse(framesPosteRaw);

        await Promise.all([
          (async () => {
            const c1 = new AbortController();
            const t1 = setTimeout(() => c1.abort(), 55000);
            try {
              const r = await fetch("/api/analyze-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frames: framesPersonne, analysisType: "personne", questionnaire_scores, questionnaire_answers }),
                signal: c1.signal,
              });
              const data = await r.json();
              sessionStorage.setItem("paw_analysis_personne", JSON.stringify(data));
              setPersonneDone(true);
            } finally {
              clearTimeout(t1);
            }
          })(),

          (async () => {
            const c2 = new AbortController();
            const t2 = setTimeout(() => c2.abort(), 55000);
            try {
              const r = await fetch("/api/analyze-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frames: framesPoste, analysisType: "poste", questionnaire_scores, questionnaire_answers }),
                signal: c2.signal,
              });
              const data = await r.json();
              sessionStorage.setItem("paw_analysis_poste", JSON.stringify(data));
              setPosteDone(true);
            } finally {
              clearTimeout(t2);
            }
          })(),
        ]);

        setGenerating(true);
        setTimeout(() => router.push("/final-report"), 1200);
        return;
      }

      // ── Single analysis mode (debout / legacy) ───────────────────────────
      const framesRaw = sessionStorage.getItem("postureatwork_frames");
      if (!framesRaw) throw new Error("Aucune frame trouvée. Refais la capture vidéo.");

      const frames: StoredFrames = JSON.parse(framesRaw);
      if (!frames.posture?.length || !frames.bureau?.length) {
        throw new Error("Frames incomplètes. Refais la capture vidéo.");
      }

      const c3 = new AbortController();
      const t3 = setTimeout(() => c3.abort(), 55000);
      let res: Response;
      try {
        res = await fetch("/api/analyze-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frames_posture: frames.posture,
            frames_bureau: frames.bureau,
            questionnaire_scores,
            questionnaire_answers,
          }),
          signal: c3.signal,
        });
      } finally {
        clearTimeout(t3);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur API (${res.status})`);
      }

      const report: AnalysisReport = await res.json();
      sessionStorage.setItem("postureatwork_report", JSON.stringify(report));
      router.push("/final-report");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue.";
      const isAbort = msg.includes("abort") || msg.includes("AbortError") || (err instanceof Error && err.name === "AbortError");
      setError(isAbort
        ? "L'analyse a pris trop de temps. Vérifie ta connexion et réessaie."
        : msg
      );
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
            <button onClick={() => router.push("/video-capture")}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Refaire la capture
            </button>
            <button onClick={() => {
              called.current = false;
              setError(null);
              setTimeout(() => runAnalysis(), 100);
            }}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              Réessayer
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full text-center">
        {/* Pulsing rings */}
        <div className="relative flex items-center justify-center w-40 h-40">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="absolute rounded-full border"
              style={{ width: 64 + i * 36, height: 64 + i * 36, borderColor: `rgba(139,92,246,${0.3 - i * 0.08})` }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            />
          ))}
          <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(79,70,229,0.3))", border: "1px solid rgba(139,92,246,0.5)", boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}>
            🧠
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Analyse en cours</h1>
          <p className="text-slate-500 text-xs">Claude Vision analyse tes images…</p>
        </div>

        {/* Dual mode: two progress rows */}
        {isDual ? (
          <div className="w-full space-y-3">
            <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: personneDone ? "rgba(116,198,157,0.10)" : "rgba(167,139,250,0.08)", border: `1px solid ${personneDone ? "rgba(116,198,157,0.3)" : "rgba(167,139,250,0.2)"}` }}>
              <span className="text-xl flex-shrink-0">{personneDone ? "✅" : "🧍"}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold" style={{ color: personneDone ? "#74c69d" : "rgba(220,220,245,0.85)" }}>
                  {personneDone ? "Posture analysée" : "Analyse posture…"}
                </p>
              </div>
              {!personneDone && (
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: posteDone ? "rgba(116,198,157,0.10)" : "rgba(59,130,246,0.08)", border: `1px solid ${posteDone ? "rgba(116,198,157,0.3)" : "rgba(59,130,246,0.2)"}` }}>
              <span className="text-xl flex-shrink-0">{posteDone ? "✅" : "🖥️"}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold" style={{ color: posteDone ? "#74c69d" : "rgba(220,220,245,0.85)" }}>
                  {posteDone ? "Setup analysé" : "Analyse setup…"}
                </p>
              </div>
              {!posteDone && (
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {generating && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-5 py-4 text-center"
                style={{ background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.25)" }}>
                <p className="text-sm font-semibold text-white">✨ Génération du rapport complet…</p>
              </motion.div>
            )}
          </div>
        ) : (
          /* Single mode: rotating message */
          <div className="w-full rounded-2xl px-5 py-4 min-h-[56px] flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <AnimatePresence mode="wait">
              <motion.p key={msgIndex}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-slate-200 text-sm font-medium">
                {SINGLE_MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        {elapsedSeconds > 15 && (
          <p style={{ color: "rgba(148,163,184,0.5)", fontSize: 11, textAlign: "center" }}>
            {elapsedSeconds > 40
              ? "Presque terminé…"
              : "L'analyse IA prend 20-40 secondes…"}
          </p>
        )}

        {/* Dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            />
          ))}
        </div>

        <p className="text-slate-600 text-xs">
          {isDual ? "Double analyse en parallèle — 20–40 secondes" : "Cela peut prendre 15–30 secondes"}
        </p>
      </div>
    </main>
  );
}
