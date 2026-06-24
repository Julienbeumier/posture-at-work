"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase";

const BUREAU_PHASES = [
  {
    icon: "🧍",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.3)",
    badge: "Phase 1",
    title: "Ta posture",
    steps: [
      "Assieds-toi dans ta position habituelle de travail",
      "Place le téléphone à 1.5m de toi, de côté",
      "On filme ton profil complet pendant 40 secondes",
    ],
    analyses: "Alignement colonne · Position tête · Épaules · Dos · Hanches",
  },
  {
    icon: "🖥️",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.3)",
    badge: "Phase 2",
    title: "Ton setup",
    steps: [
      "Place le téléphone face à ton bureau",
      "Tout le poste doit être visible (écran, clavier, chaise)",
      "On analyse les distances, hauteurs et angles",
    ],
    analyses: "Hauteur écran · Distance clavier · Position chaise · Éclairage · Organisation",
  },
];

const DEBOUT_STEPS = [
  {
    icon: "📱",
    title: "Place ton téléphone à 2-3m de toi, à hauteur de taille",
    desc: "Appuie-le contre un support stable pour cadrer ton corps en entier",
  },
  {
    icon: "🧍",
    title: "Prends ta vraie position de travail debout",
    desc: "Installe-toi comme tu le ferais naturellement devant ton poste",
  },
  {
    icon: "🎥",
    title: "On filme 40 secondes — reste naturel",
    desc: "Tu recevras des instructions vocales en direct, pas besoin de bouger",
  },
];

const DEBOUT_ANALYSES = [
  "Alignement colonne en station debout",
  "Appui symétrique sur les deux jambes",
  "Position épaules et nuque",
  "Posture globale et compensations",
  "Position pieds et hanches",
];

export default function VideoIntroPage() {
  const router = useRouter();
  const [jobType, setJobType] = useState<string>("bureau");
  const [isDesktop, setIsDesktop] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const lsType = localStorage.getItem("paw_job_type");
    let scoresType: string | null = null;
    try {
      const scores = JSON.parse(sessionStorage.getItem("postureatwork_scores") || "{}");
      if (scores.job_type) scoresType = scores.job_type;
    } catch {}
    console.log("video-intro job_type:", lsType);
    console.log("scores job_type:", scoresType);
    const effective = scoresType ?? lsType ?? "bureau";
    setJobType(effective);
  }, []);

  useEffect(() => {
    // Détecter desktop
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768 && !navigator.maxTouchPoints);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (!qrUrl || !isDesktop) return;

    // Polling toutes les 10 secondes pour détecter si l'analyse est terminée
    const interval = setInterval(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("assessments")
        .select("video_analysis, created_at")
        .eq("user_id", user.id)
        .not("video_analysis", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.video_analysis) {
        setVideoReady(true);
        clearInterval(interval);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [qrUrl, isDesktop]);

  async function generateQRCode() {
    setQrLoading(true);
    const scores = JSON.parse(sessionStorage.getItem("postureatwork_scores") || "{}");
    const answers = JSON.parse(sessionStorage.getItem("postureatwork_answers") || "{}");

    const res = await fetch("/api/video-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores, answers, jobType }),
    });
    const data = await res.json();
    const url = `${window.location.origin}/video-capture?token=${data.token}`;
    setQrToken(data.token);
    setQrUrl(url);
    setQrLoading(false);
  }

  const isBureau = jobType === "bureau";

  function goToCapture() {
    sessionStorage.setItem("paw_video_job_type", jobType);
    router.push("/video-capture");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)" }} />
      </div>

      {/* Nav */}
      <div className="relative z-10 px-6 py-5 max-w-2xl mx-auto w-full flex items-center justify-between">
        <Link href="/results" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ← Mes résultats
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
          {isBureau ? "Analyse complète" : "Analyse IA"}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16 max-w-2xl mx-auto w-full">

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 60px rgba(139,92,246,0.2)" }}>
            🎬
          </div>
          <motion.div
            className="absolute -inset-2 rounded-[28px]"
            style={{ border: "1px solid rgba(139,92,246,0.15)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-10"
        >
          {isBureau ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                Analyse IA complète —{" "}
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Posture & Setup
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto">
                Deux analyses en <strong className="text-white">2 minutes</strong> pour un rapport vraiment complet
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                Analyse posturale IA —{" "}
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Profil debout
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto">
                Notre IA va analyser ta posture en{" "}
                <strong className="text-white">40 secondes</strong> et générer un rapport personnalisé.
              </p>
            </>
          )}
        </motion.div>

        {/* Bureau: two phases */}
        {isBureau ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full space-y-3 mb-10"
          >
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Comment ça marche</p>

            {BUREAU_PHASES.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="rounded-2xl p-5"
                style={{ background: phase.bg, border: `1px solid ${phase.border}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{phase.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${phase.color}20`, color: phase.color, border: `1px solid ${phase.color}40` }}>
                        {phase.badge}
                      </span>
                      <span className="text-white font-bold text-sm">{phase.title}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {phase.steps.map((step, si) => (
                    <div key={si} className="flex items-start gap-2">
                      <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: phase.color }}>{si + 1}.</span>
                      <span className="text-slate-300 text-sm leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: `${phase.color}99` }}>
                  Ce qu&apos;on analyse : {phase.analyses}
                </p>
              </motion.div>
            ))}

            {/* Separator badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-center py-1"
            >
              <span className="text-xs font-bold px-4 py-1.5 rounded-full"
                style={{ background: "rgba(116,198,157,0.15)", border: "1px solid rgba(116,198,157,0.35)", color: "#74c69d" }}>
                ✅ Analyse complète
              </span>
            </motion.div>
          </motion.div>
        ) : (
          /* Debout: steps + analyses */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full space-y-3 mb-10"
          >
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Comment ça marche</p>
            {DEBOUT_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4 rounded-2xl px-5 py-4"
                style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{step.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{step.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="rounded-2xl px-5 py-4"
              style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "rgba(167,139,250,0.8)" }}>Ce qu&apos;on analyse :</p>
              <div className="flex flex-wrap gap-1.5">
                {DEBOUT_ANALYSES.map(a => (
                  <span key={a} className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(167,139,250,0.12)", color: "rgba(220,220,245,0.7)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    {a}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* QR code desktop → mobile */}
        {isDesktop && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              borderRadius: 20, padding: "20px 24px", marginBottom: 16,
              background: "rgba(43,92,230,0.08)", border: "1px solid rgba(43,92,230,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 6 }}>
                  📱 Tu es sur ordinateur ?
                </p>
                <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "rgba(220,220,245,0.6)", lineHeight: 1.65, marginBottom: 14 }}>
                  Pour une analyse posturale précise, filme-toi avec ton téléphone.
                  La caméra mobile donne de meilleurs résultats.
                </p>
                {!qrUrl ? (
                  <button
                    onClick={generateQRCode}
                    disabled={qrLoading}
                    style={{
                      padding: "10px 20px", borderRadius: 100, border: "none",
                      background: "#2b5ce6", color: "#fff",
                      fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, fontSize: 13,
                      cursor: "pointer", opacity: qrLoading ? 0.7 : 1,
                    }}
                  >
                    {qrLoading ? "Génération…" : "📷 Générer le QR code →"}
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ padding: 12, background: "#fff", borderRadius: 12 }}>
                      <QRCodeSVG value={qrUrl} size={120} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "rgba(220,220,245,0.8)", marginBottom: 8, lineHeight: 1.6 }}>
                        1. Scanne avec ton téléphone<br />
                        2. Tes données sont transférées automatiquement<br />
                        3. Filme depuis le mobile
                      </p>
                      <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "rgba(220,220,245,0.35)" }}>
                        ⏱️ Valable 1 heure
                      </p>
                    </div>
                  </div>
                )}

                {qrUrl && isDesktop && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 16, padding: "14px 16px", borderRadius: 12,
                      background: videoReady
                        ? "rgba(29,158,117,0.1)"
                        : "rgba(43,92,230,0.06)",
                      border: `0.5px solid ${videoReady
                        ? "rgba(29,158,117,0.3)"
                        : "rgba(43,92,230,0.2)"}`,
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                    {videoReady ? (
                      <>
                        <span style={{ fontSize: 20 }}>✅</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: 14, color: "#1d9e75", margin: "0 0 4px" }}>
                            Analyse terminée !
                          </p>
                          <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "var(--t55)", margin: 0 }}>
                            Tes résultats vidéo sont prêts.
                          </p>
                        </div>
                        <button
                          onClick={() => window.location.reload()}
                          style={{
                            padding: "8px 16px", borderRadius: 100, border: "none",
                            background: "#1d9e75", color: "#fff",
                            fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, fontSize: 12,
                            cursor: "pointer", flexShrink: 0,
                          }}>
                          Rafraîchir →
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                          border: "2px solid rgba(43,92,230,0.4)",
                          borderTopColor: "#2b5ce6",
                          animation: "spin 1s linear infinite",
                        }} />
                        <div>
                          <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "var(--t65)", margin: "0 0 2px" }}>
                            En attente de l&apos;analyse mobile…
                          </p>
                          <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "var(--t40)", margin: 0 }}>
                            Scanne le QR code avec ton téléphone pour filmer
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={goToCapture}
            className="w-full py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}
          >
            {isDesktop ? "Continuer avec la webcam →" : "Commencer l'analyse →"}
          </motion.button>
          <p className="text-center text-slate-600 text-xs mt-3">
            {isBureau
              ? isDesktop
                ? "Recommandé : utiliser le QR code ci-dessus pour filmer avec votre téléphone"
                : "Phase 1 sur 2 — Analyse posture"
              : isDesktop
                ? "Recommandé : utiliser le QR code ci-dessus pour de meilleurs résultats"
                : "Caméra requise · 40 secondes · Résultats immédiats"
            }
          </p>
        </motion.div>

      </div>
    </main>
  );
}
