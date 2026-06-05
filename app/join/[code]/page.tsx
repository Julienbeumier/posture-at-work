"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient, validateInviteCode, useInviteCode } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import type { Company } from "@/lib/supabase";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

type Step = "loading" | "invalid" | "welcome" | "auth" | "joining" | "done";

export default function JoinPage() {
  const { c } = useTheme();
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("loading");
  const [company, setCompany] = useState<Company | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const joinCompany = useCallback(async (userId: string, companyId: string) => {
    setStep("joining");
    const { error: joinError } = await useInviteCode(code, userId, companyId);
    if (joinError) {
      setError("Erreur lors de la jonction à l'entreprise");
      setStep("auth");
      return;
    }
    localStorage.setItem("paw_company_id", companyId);
    localStorage.setItem("paw_is_b2b", "true");
    setStep("done");
    setTimeout(() => router.push("/onboarding"), 2000);
  }, [code, router]);

  useEffect(() => {
    async function checkCode() {
      const result = await validateInviteCode(code);
      if (!result) {
        setStep("invalid");
        return;
      }
      setCompany(result.company);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await joinCompany(user.id, result.company.id);
      } else {
        setStep("welcome");
      }
    }
    if (code) checkCode();
  }, [code, joinCompany, supabase.auth]);

  async function handleAuth() {
    if (!email || !password || !company) return;
    setLoading(true);
    setError("");

    if (isNewUser) {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (data.user) await joinCompany(data.user.id, company.id);
    } else {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (data.user) await joinCompany(data.user.id, company.id);
    }
    setLoading(false);
  }

  if (step === "loading" || step === "joining") {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>
            {step === "joining" ? "Jonction en cours…" : "Vérification du code…"}
          </p>
        </div>
      </main>
    );
  }

  if (step === "invalid") {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>❌</div>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: c.textPrimary, marginBottom: 8 }}>
            Lien invalide ou expiré
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, lineHeight: 1.65 }}>
            Ce lien d&apos;invitation n&apos;est plus valide. Demandez un nouveau lien à votre responsable RH.
          </p>
        </div>
      </main>
    );
  }

  if (step === "done") {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", maxWidth: 400 }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: c.textPrimary, marginBottom: 8 }}>
            Vous avez rejoint {company?.name} !
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>
            Redirection vers votre bilan…
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 28 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100, marginBottom: 16,
            background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.25)",
          }}>
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#7c9fff" }}>
              🏢 {company?.name}
            </span>
          </div>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: c.textPrimary, marginBottom: 10 }}>
            Votre bilan ergonomique offert
          </h1>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, lineHeight: 1.65 }}>
            Votre employeur vous invite à faire votre bilan santé au travail.
            5 minutes, confidentiel, actionnable.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            borderRadius: 14, padding: "14px 18px", marginBottom: 20,
            background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.25)",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 18 }}>🔒</span>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "#1d9e75", margin: 0, lineHeight: 1.6 }}>
            Vos scores remontent de façon <strong>anonymisée</strong> à votre employeur.
            Votre nom n&apos;est jamais visible. Vous restez identifié(e) comme &quot;Employé #X&quot;.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: 20, padding: 28 }}
        >
          <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: c.bgCard2, marginBottom: 20 }}>
            {[{ key: true, label: "Nouveau compte" }, { key: false, label: "J'ai déjà un compte" }].map(opt => (
              <button
                key={String(opt.key)}
                onClick={() => setIsNewUser(opt.key)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
                  background: isNewUser === opt.key ? "#2b5ce6" : "transparent",
                  color: isNewUser === opt.key ? "#fff" : c.textMuted,
                  fontFamily: T.b, fontWeight: 600, fontSize: 13, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }}
            />
            {error && (
              <p style={{ fontFamily: T.b, fontSize: 12, color: "#e24b4a" }}>{error}</p>
            )}
            <button
              onClick={handleAuth}
              disabled={!email || !password || loading}
              style={{
                padding: "14px 0", borderRadius: 100, border: "none",
                background: email && password ? "#2b5ce6" : c.bgCard2,
                color: email && password ? "#fff" : c.textMuted,
                fontFamily: T.h, fontWeight: 800, fontSize: 15,
                cursor: email && password ? "pointer" : "default",
                boxShadow: email && password ? "0 4px 20px rgba(43,92,230,0.35)" : "none",
                opacity: loading ? 0.7 : 1, transition: "all 0.2s",
              }}
            >
              {loading ? "Connexion…" : "Commencer mon bilan →"}
            </button>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
