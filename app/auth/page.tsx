"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(redirect);
    });
  }, [redirect, router]);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (err) {
      setError(err.message);
    } else {
      setMagicSent(true);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setOauthLoading(true);
    setError("");
    const supabase = createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (err) {
      setError(err.message);
      setOauthLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 pt-16 pb-16">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-15"
          style={{ background: "radial-gradient(ellipse, rgba(34,197,94,0.4) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            Sauvegarde ton bilan
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Crée un compte gratuit pour suivre ton évolution dans le temps
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {magicSent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-8 text-center"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-white font-bold text-lg mb-2">Vérifie ta boîte mail !</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Un lien de connexion a été envoyé à <strong className="text-white">{email}</strong>. Clique dessus pour accéder à ton compte.
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
              >
                Renvoyer un lien
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Google OAuth */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogle}
                disabled={oauthLoading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-60 transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {oauthLoading ? (
                  <span className="animate-pulse">Redirection…</span>
                ) : (
                  <>
                    <GoogleIcon />
                    Continuer avec Google
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-slate-600 text-xs">ou</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {/* Magic link */}
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none placeholder-slate-500 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow: "0 0 24px rgba(34,197,94,0.3)",
                  }}
                >
                  {loading ? "Envoi…" : "Recevoir un lien magique →"}
                </motion.button>
              </form>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-xs text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Skip */}
              <div className="text-center pt-2">
                <Link
                  href={redirect.startsWith("/") ? redirect : "/dashboard"}
                  className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
                >
                  Continuer sans compte →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

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

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <AuthForm />
    </Suspense>
  );
}
