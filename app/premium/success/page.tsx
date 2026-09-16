"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

async function recoverAndSavePendingAssessment(
  userId: string,
  supabase: ReturnType<typeof createClient>
) {
  try {
    const pending = localStorage.getItem("paw_pending_assessment");
    const sessionScores = sessionStorage.getItem("postureatwork_scores");
    const sessionAnswers = sessionStorage.getItem("postureatwork_answers");
    const sessionJobType = localStorage.getItem("paw_job_type");

    let scores: Record<string, number> | null = null;
    let answers: Record<string, unknown> | null = null;
    let jobType = "bureau";

    if (pending) {
      const data = JSON.parse(pending);
      const age = Date.now() - new Date(data.savedAt).getTime();
      if (age < 4 * 60 * 60 * 1000) {
        scores = JSON.parse(data.scores);
        answers = data.answers ? JSON.parse(data.answers) : null;
        jobType = data.jobType ?? "bureau";
      }
    } else if (sessionScores) {
      scores = JSON.parse(sessionScores);
      answers = sessionAnswers ? JSON.parse(sessionAnswers) : null;
      jobType = sessionJobType ?? "bureau";
    }

    if (!scores) return;

    const { data: existing } = await supabase
      .from("assessments")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("assessments")
        .update({ global_score: scores.global, scores, answers, job_type: jobType })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("assessments")
        .insert({ user_id: userId, global_score: scores.global, scores, answers, job_type: jobType });
    }

    sessionStorage.setItem("postureatwork_scores", JSON.stringify(scores));
    if (answers) sessionStorage.setItem("postureatwork_answers", JSON.stringify(answers));
    if (jobType) localStorage.setItem("paw_job_type", jobType);
    localStorage.removeItem("paw_pending_assessment");

    console.log("[success] Bilan récupéré et sauvegardé");
  } catch (err) {
    console.error("[success] Erreur récupération bilan:", err);
  }
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "reconnect">("loading");
  const [reconnectLoading, setReconnectLoading] = useState(false);

  async function handleGoogleReconnect() {
    setReconnectLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/results`,
      },
    });
  }

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const sessionScores = sessionStorage.getItem("postureatwork_scores");
        if (sessionScores && !localStorage.getItem("paw_pending_assessment")) {
          localStorage.setItem("paw_pending_assessment", JSON.stringify({
            scores: sessionScores,
            answers: sessionStorage.getItem("postureatwork_answers"),
            jobType: localStorage.getItem("paw_job_type"),
            savedAt: new Date().toISOString(),
          }));
        }
        clearInterval(interval);
        setStatus("reconnect");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.is_premium) {
        localStorage.setItem("paw_premium", "true");
        clearInterval(interval);
        await recoverAndSavePendingAssessment(user.id, supabase);
        setStatus("success");
        setTimeout(() => router.push("/results"), 2500);
        return;
      }

      if (attempts >= 20) {
        clearInterval(interval);
        localStorage.setItem("paw_premium", "true");
        setStatus("success");
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (status === "loading") return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 20px",
          border: "3px solid rgba(43,92,230,0.2)", borderTopColor: "#2b5ce6",
          animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 18,
          color: "var(--text-primary)", marginBottom: 8 }}>
          Activation en cours…
        </p>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)" }}>
          On prépare ton accès complet
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );

  if (status === "reconnect") return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>

        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24,
          color: "var(--text-primary)", marginBottom: 8 }}>
          Paiement réussi !
        </h1>
        <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
          lineHeight: 1.65, marginBottom: 24 }}>
          Ton accès premium est activé. Reconnecte-toi en un clic pour
          accéder à ton analyse complète.
        </p>

        <button onClick={handleGoogleReconnect}
          disabled={reconnectLoading}
          style={{ width: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 10, padding: "14px 0",
            borderRadius: 12, cursor: "pointer", marginBottom: 10,
            background: "var(--bg-card2)", border: "1px solid var(--border2)",
            fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600,
            fontSize: 14, color: "var(--text-primary)" }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          {reconnectLoading ? "Connexion…" : "Continuer avec Google"}
        </button>

        <Link href="/auth?redirect=/results" style={{ textDecoration: "none" }}>
          <div style={{ width: "100%", padding: "13px 0", borderRadius: 12,
            border: "0.5px solid var(--border)", background: "transparent",
            fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600,
            fontSize: 14, color: "var(--t55)", textAlign: "center", cursor: "pointer" }}>
            Connexion par email →
          </div>
        </Link>

        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12,
          color: "var(--t35)", marginTop: 16 }}>
          Ton paiement est confirmé — tu retrouveras ton accès premium
          dès que tu seras connecté.
        </p>
      </motion.div>
    </main>
  );

  if (status === "error") return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 20,
          color: "var(--text-primary)", marginBottom: 8 }}>
          Activation en cours...
        </p>
        <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
          lineHeight: 1.65, marginBottom: 20 }}>
          Ton paiement a bien été reçu. L&apos;activation peut prendre quelques secondes.
          Rafraîchis la page dans 30 secondes ou contacte-nous si le problème persiste à{" "}
          <a href="mailto:hello@postureatwork.com" style={{ color: "#7c9fff" }}>
            hello@postureatwork.com
          </a>
        </p>
        <Link href="/results" style={{ textDecoration: "none" }}>
          <div style={{ padding: "13px 24px", borderRadius: 100, background: "#2b5ce6",
            color: "#fff", fontFamily: T.h, fontWeight: 700, fontSize: 14,
            display: "inline-block" }}>
            Retour aux résultats
          </div>
        </Link>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>

        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
          style={{ fontSize: 72, marginBottom: 20 }}>
          🎉
        </motion.div>

        <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28,
          color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.5px" }}>
          Bienvenue dans PAW Premium !
        </h1>

        <p style={{ fontFamily: T.b, fontSize: 15, color: "var(--t60)",
          lineHeight: 1.7, marginBottom: 28 }}>
          Ton accès complet est activé. Tu as maintenant accès aux 6 dimensions,
          à l&apos;analyse vidéo IA et à ton rapport PDF.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[
            { emoji: "📊", label: "6 dimensions complètes" },
            { emoji: "🎥", label: "Analyse vidéo IA" },
            { emoji: "📄", label: "Rapport PDF" },
            { emoji: "🧘", label: "30 exercices + programmes" },
            { emoji: "📈", label: "Dashboard & historique" },
            { emoji: "♾️", label: "Accès à vie" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "12px", borderRadius: 12,
              background: "rgba(116,198,157,0.08)", border: "0.5px solid rgba(116,198,157,0.2)",
              display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{item.emoji}</span>
              <span style={{ fontFamily: T.b, fontSize: 12, color: "#74c69d",
                fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", marginBottom: 12 }}>
          Redirection vers ton analyse dans quelques secondes…
        </p>

        <Link href="/results" style={{ textDecoration: "none" }}>
          <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", textDecoration: "underline" }}>
            Cliquer ici si la redirection ne fonctionne pas
          </p>
        </Link>
      </motion.div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--main-bg)" }} />}>
      <SuccessContent />
    </Suspense>
  );
}
