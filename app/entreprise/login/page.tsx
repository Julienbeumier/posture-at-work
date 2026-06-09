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
  const [resetSent, setResetSent] = useState(false);

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

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/entreprise/dashboard`,
      },
    });
  }

  async function handleForgotPassword() {
    if (!email) { setError("Entre ton email d'abord"); return; }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/entreprise/reset-password`,
    });
    setResetSent(true);
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
            <button
              onClick={handleGoogleLogin}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12,
                background: c.bgCard2, border: `1px solid ${c.border2}`,
                color: c.textPrimary, fontFamily: T.b, fontWeight: 600, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Continuer avec Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: c.border }} />
              <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted }}>ou</span>
              <div style={{ flex: 1, height: 1, background: c.border }} />
            </div>

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
            <div style={{ textAlign: "right", marginTop: -4 }}>
              <span
                onClick={handleForgotPassword}
                style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff", cursor: "pointer" }}
              >
                Mot de passe oublié ?
              </span>
            </div>
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
            {resetSent && (
              <p style={{ fontFamily: T.b, fontSize: 12, color: "#1d9e75", textAlign: "center" }}>
                ✓ Email de réinitialisation envoyé — vérifie ta boîte mail
              </p>
            )}
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
