"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Turnstile } from "@marsidev/react-turnstile";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

async function redirectAfterAuth(
  router: ReturnType<typeof useRouter>,
  supabase: ReturnType<typeof createClient>,
  redirect: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: adminMembership } = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (adminMembership) {
    router.replace("/entreprise/dashboard");
  } else {
    router.replace(redirect.startsWith("/") ? redirect : "/dashboard");
  }
}

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        await redirectAfterAuth(router, supabase, redirect);
      } else {
        setChecking(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogle() {
    setOauthLoading(true);
    setError("");
    const appUrl = window.location.origin;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (err) { setError(err.message); setOauthLoading(false); }
  }

  async function handleLogin() {
    if (!email || !password) { setError("Email et mot de passe requis"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message === "Invalid login credentials"
        ? "Email ou mot de passe incorrect"
        : err.message);
      setLoading(false);
      return;
    }
    await redirectAfterAuth(router, supabase, redirect);
    setLoading(false);
  }

  async function handleSignup() {
    if (!email || !password || !passwordConfirm) { setError("Tous les champs sont requis"); return; }
    if (password !== passwordConfirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { setError("Mot de passe minimum 8 caractères"); return; }
    if (!consented) { setError("Accepte les conditions pour continuer"); return; }
    if (!turnstileToken) { setError("Validation CAPTCHA requise"); return; }

    const captchaRes = await fetch("/api/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: turnstileToken }),
    });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) { setError("Validation échouée — réessaie"); return; }

    setLoading(true);
    setError("");
    const appUrl = window.location.origin;
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/confirm`,
      },
    });
    if (err) {
      setError(err.message === "User already registered"
        ? "Un compte existe déjà avec cet email — connecte-toi"
        : err.message);
      setLoading(false);
      return;
    }
    setSuccess("Vérifie ta boîte mail pour confirmer ton compte !");
    setLoading(false);
  }

  async function handleReset() {
    if (!email) { setError("Entre ton email d'abord"); return; }
    setLoading(true);
    setError("");
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setSuccess("Email de réinitialisation envoyé — vérifie ta boîte mail");
    setLoading(false);
  }

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isReset = mode === "reset";

  if (checking) return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "var(--t40)" }}>
        Connexion au dashboard…
      </p>
    </main>
  );

  return (
    <main style={{
      minHeight: "100vh", background: "var(--main-bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 24px 40px", position: "relative",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400, opacity: 0.12,
          background: "radial-gradient(ellipse, rgba(43,92,230,0.5) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 400 }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: "var(--text-primary)", margin: "0 0 4px" }}>
            PAW<span style={{ color: "#2b5ce6" }}>.</span>
          </p>
          <p style={{ fontFamily: T.b, fontSize: 9, letterSpacing: "0.18em", color: "var(--t35)", textTransform: "uppercase", margin: "0 0 20px" }}>
            Posture At Work
          </p>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", margin: "0 0 6px" }}>
            {isLogin ? "Bon retour 👋" : isSignup ? "Créer mon compte" : "Mot de passe oublié"}
          </h1>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", margin: 0 }}>
            {isLogin ? "Connecte-toi pour accéder à ton bilan"
            : isSignup ? "Crée ton compte pour sauvegarder ton bilan"
            : "Reçois un lien pour réinitialiser ton mot de passe"}
          </p>
        </motion.div>

        {!isReset && (
          <div style={{
            display: "flex", gap: 4, padding: 4, borderRadius: 14,
            background: "var(--bg-card2)", border: "0.5px solid var(--border)",
            marginBottom: 20,
          }}>
            {(["login", "signup"] as const).map(tab => (
              <button key={tab} onClick={() => { setMode(tab); setError(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
                  background: mode === tab ? "#2b5ce6" : "transparent",
                  color: mode === tab ? "#fff" : "var(--t50)",
                  fontFamily: T.b, fontWeight: 600, fontSize: 13, cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                {tab === "login" ? "Se connecter" : "S'inscrire"}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ borderRadius: 20, padding: "28px", textAlign: "center",
                background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.25)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#1d9e75", marginBottom: 8 }}>
                {isReset ? "Email envoyé !" : "Compte créé !"}
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.6 }}>{success}</p>
              <button onClick={() => { setSuccess(""); setMode("login"); }}
                style={{ marginTop: 16, fontFamily: T.b, fontSize: 12, color: "var(--t40)", background: "none", border: "none", cursor: "pointer" }}>
                ← Retour à la connexion
              </button>
            </motion.div>
          ) : (
            <motion.div key={mode}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {!isReset && (
                <button onClick={handleGoogle} disabled={oauthLoading}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    padding: "13px 0", borderRadius: 12, cursor: "pointer",
                    background: "var(--bg-card2)", border: "1px solid var(--border2)",
                    fontFamily: T.b, fontWeight: 600, fontSize: 14, color: "var(--text-primary)",
                    opacity: oauthLoading ? 0.7 : 1, transition: "all 0.2s",
                  }}>
                  {oauthLoading ? "Redirection…" : <><GoogleIcon /> Continuer avec Google</>}
                </button>
              )}

              {!isReset && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)" }}>ou</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>
              )}

              <input type="email" placeholder="ton@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: "12px 14px", borderRadius: 12, outline: "none",
                  background: "var(--bg-card2)", border: "1px solid var(--border2)",
                  color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />

              {!isReset && (
                <input type="password" placeholder="Mot de passe (min. 8 caractères)" value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ padding: "12px 14px", borderRadius: 12, outline: "none",
                    background: "var(--bg-card2)", border: "1px solid var(--border2)",
                    color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />
              )}

              {isSignup && (
                <input type="password" placeholder="Confirmer le mot de passe" value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  style={{ padding: "12px 14px", borderRadius: 12, outline: "none",
                    background: "var(--bg-card2)", border: "1px solid var(--border2)",
                    color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />
              )}

              {isSignup && (
                <>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={consented} onChange={e => setConsented(e.target.checked)}
                      style={{ marginTop: 2, flexShrink: 0, accentColor: "#2b5ce6" }} />
                    <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", lineHeight: 1.55 }}>
                      J&apos;accepte de recevoir mon rapport et des conseils ergonomiques par email.{" "}
                      <a href="/politique-confidentialite" style={{ color: "var(--t70)", textDecoration: "underline" }}>
                        Politique de confidentialité
                      </a>
                    </span>
                  </label>

                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={setTurnstileToken}
                    onError={() => setTurnstileToken(null)}
                    options={{ theme: "dark", language: "fr" }}
                  />
                </>
              )}

              {isLogin && (
                <div style={{ textAlign: "right", marginTop: -4 }}>
                  <span onClick={() => { setMode("reset"); setError(""); }}
                    style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff", cursor: "pointer" }}>
                    Mot de passe oublié ?
                  </span>
                </div>
              )}

              {error && (
                <p style={{ fontFamily: T.b, fontSize: 12, color: "#f09595", textAlign: "center", margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                onClick={isLogin ? handleLogin : isSignup ? handleSignup : handleReset}
                disabled={loading || (isSignup && !turnstileToken)}
                style={{
                  padding: "14px 0", borderRadius: 100, border: "none",
                  background: loading || (isSignup && !turnstileToken) ? "var(--bg-card2)" : "#2b5ce6",
                  color: loading || (isSignup && !turnstileToken) ? "var(--t40)" : "#fff",
                  fontFamily: T.h, fontWeight: 800, fontSize: 15,
                  cursor: loading ? "default" : "pointer",
                  boxShadow: !loading && !(isSignup && !turnstileToken) ? "0 4px 24px rgba(43,92,230,0.35)" : "none",
                  transition: "all 0.2s", opacity: loading ? 0.7 : 1,
                }}>
                {loading ? "Chargement…"
                  : isLogin ? "Se connecter →"
                  : isSignup ? "Créer mon compte →"
                  : "Envoyer le lien →"}
              </button>

              {isLogin && (
                <div style={{ textAlign: "center" }}>
                  <Link href={redirect.startsWith("/") ? redirect : "/dashboard"}
                    style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", textDecoration: "none" }}>
                    Continuer sans compte →
                  </Link>
                </div>
              )}

              {isReset && (
                <button onClick={() => { setMode("login"); setError(""); }}
                  style={{ fontFamily: T.b, fontSize: 12, color: "var(--t40)", background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
                  ← Retour à la connexion
                </button>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--main-bg)" }} />}>
      <AuthForm />
    </Suspense>
  );
}
