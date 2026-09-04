"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import type { Company } from "@/lib/supabase";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

type Step = "loading" | "invalid" | "welcome" | "auth" | "joining" | "done" | "confirm_email";

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
    const res = await fetch("/api/entreprise/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId, companyId }),
    });

    if (!res.ok) {
      setError("Erreur lors de la jonction à l'entreprise");
      setStep("welcome");
      return;
    }

    // Activer le premium automatiquement pour les employés B2B
    await supabase.from("profiles").upsert({
      user_id: userId,
      is_premium: true,
      premium_source: "b2b",
      premium_activated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    localStorage.setItem("paw_company_id", companyId);
    localStorage.setItem("paw_is_b2b", "true");
    localStorage.setItem("paw_premium", "true");
    setStep("done");
    setTimeout(() => router.push("/questionnaire"), 2000);
  }, [code, router, supabase]);

  useEffect(() => {
    async function checkCode() {
      const res = await fetch(`/api/entreprise/validate-invite?code=${code}`);
      if (!res.ok) {
        setStep("invalid");
        return;
      }
      const result = await res.json();
      if (!result.company) {
        setStep("invalid");
        return;
      }
      setCompany(result.company);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await joinCompany(user.id, result.company.id);
      } else {
        sessionStorage.setItem("paw_join_code", code);
        router.push(`/auth?redirect=/questionnaire&from_join=true`);
      }
    }
    if (code) checkCode();
  }, [code, joinCompany, supabase.auth]);

  async function handleGoogle() {
    console.log("[Join] handleGoogle clicked, company:", company, "code:", code);
    if (!company) {
      setError("Erreur: company non chargée — recharge la page");
      return;
    }
    setLoading(true);
    setError("");
    // Stocker le code d'invitation pour après le callback OAuth
    sessionStorage.setItem("paw_join_code", code);
    const redirectTo = `${window.location.origin}/join/${code}/callback`;
    console.log("[Join] redirectTo:", redirectTo);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (err) {
      console.error("[Join] OAuth error:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleAuth() {
    if (!email || !password || !company) return;
    setLoading(true);
    setError("");

    if (isNewUser) {
      const { data, error: authError } = await supabase.auth.signUp({ email, password,
        options: { emailRedirectTo: `${window.location.origin}/join/${code}` }
      });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (data.user && data.user.email_confirmed_at) {
        // Déjà confirmé (compte existant)
        await joinCompany(data.user.id, company.id);
      } else if (data.user) {
        // Email de confirmation envoyé — attendre
        setStep("confirm_email");
      }
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

  if (step === "confirm_email") {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: c.textPrimary, marginBottom: 8 }}>
            Confirme ton email
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, lineHeight: 1.65, marginBottom: 16 }}>
            Un email de confirmation a été envoyé à <strong style={{ color: c.textPrimary }}>{email}</strong>.
            Clique sur le lien dans l&apos;email pour rejoindre {company?.name}.
          </p>
          <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted }}>
            Le lien te redirigera automatiquement vers ton bilan.
          </p>
        </motion.div>
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

          <button onClick={handleGoogle} disabled={loading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "13px 0", borderRadius: 12, cursor: "pointer",
              background: c.bgCard2, border: `1px solid ${c.border2}`,
              fontFamily: T.b, fontWeight: 600, fontSize: 14, color: c.textPrimary,
              marginBottom: 4,
            }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continuer avec Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 8px" }}>
            <div style={{ flex: 1, height: 1, background: c.border }} />
            <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted }}>ou</span>
            <div style={{ flex: 1, height: 1, background: c.border }} />
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
