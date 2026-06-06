"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export default function EntrepriseLoginPage() {
  const { c } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    router.push("/entreprise/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 28 }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: c.textPrimary, marginBottom: 6 }}>
            PAW<span style={{ color: "#2b5ce6" }}>.</span> Entreprise
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>
            Accédez à votre espace RH
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: c.bgCard, border: `0.5px solid ${c.border}`,
            borderRadius: 20, padding: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              placeholder="Email professionnel"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }}
            />
            {error && (
              <p style={{ fontFamily: T.b, fontSize: 12, color: "#e24b4a" }}>{error}</p>
            )}
            <button
              onClick={handleLogin}
              disabled={!email || !password || loading}
              style={{
                padding: "14px 0", borderRadius: 100, border: "none",
                background: email && password ? "#2b5ce6" : c.bgCard2,
                color: email && password ? "#fff" : c.textMuted,
                fontFamily: T.h, fontWeight: 800, fontSize: 15,
                cursor: email && password ? "pointer" : "default",
                boxShadow: email && password ? "0 4px 24px rgba(43,92,230,0.35)" : "none",
                opacity: loading ? 0.7 : 1, transition: "all 0.2s",
              }}
            >
              {loading ? "Connexion…" : "Se connecter →"}
            </button>
          </div>
        </motion.div>

        <div style={{ textAlign: "center", marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/entreprise/signup" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: "#7c9fff" }}>
              Pas encore de compte ? Créer un espace entreprise
            </span>
          </Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted }}>
              ← Retour à PostureAtWork
            </span>
          </Link>
        </div>

      </div>
    </main>
  );
}
