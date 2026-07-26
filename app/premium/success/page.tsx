"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { clearInterval(interval); setStatus("error"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.is_premium) {
        localStorage.setItem("paw_premium", "true");
        clearInterval(interval);
        setStatus("success");
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

        <Link href="/results" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: "16px 0", borderRadius: 100, textAlign: "center",
              background: "linear-gradient(135deg, #2b5ce6, #7c3aed)",
              boxShadow: "0 4px 24px rgba(43,92,230,0.4)",
              fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#fff",
              cursor: "pointer", marginBottom: 12 }}>
            🔓 Voir mon analyse complète →
          </motion.div>
        </Link>

        <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)" }}>
          Un email de confirmation a été envoyé à ton adresse
        </p>
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
