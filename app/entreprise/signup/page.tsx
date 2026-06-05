"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const PLANS = [
  { key: "starter", label: "Starter", price: "490€/an", employees: "Jusqu'à 25 employés", color: "#2b5ce6" },
  { key: "pme", label: "PME", price: "1 490€/an", employees: "Jusqu'à 100 employés", color: "#7c3aed" },
  { key: "enterprise", label: "Enterprise", price: "Sur devis", employees: "100+ employés", color: "#1d9e75" },
] as const;

type Step = "account" | "company" | "done";

export default function EntrepriseSignupPage() {
  const { c } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [plan, setPlan] = useState<"starter" | "pme" | "enterprise">("starter");

  async function handleCreateAccount() {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/entreprise/dashboard` },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setStep("company");
    setLoading(false);
  }

  async function handleCreateCompany() {
    if (!companyName || !contactName) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/entreprise/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: companyName, contactName, contactEmail: email, plan }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erreur lors de la création");
      setLoading(false);
      return;
    }

    setStep("done");
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: c.textPrimary, marginBottom: 6 }}>
            PAW<span style={{ color: "#2b5ce6" }}>.</span> Entreprise
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>
            Créez votre espace RH en 2 minutes
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {(["account", "company", "done"] as Step[]).map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: (["account", "company", "done"] as Step[]).indexOf(step) >= i
                ? "#2b5ce6" : c.bgCard2,
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {step === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: 20, padding: 28 }}
            >
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 17, color: c.textPrimary, marginBottom: 6 }}>
                Créez votre compte
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 24 }}>
                Cet email sera l&apos;identifiant administrateur de votre espace.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="email"
                  placeholder="Email professionnel *"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }}
                />
                <input
                  type="password"
                  placeholder="Mot de passe *"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }}
                />
                {error && (
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "#e24b4a" }}>{error}</p>
                )}
                <button
                  onClick={handleCreateAccount}
                  disabled={!email || !password || loading}
                  style={{
                    padding: "14px 0", borderRadius: 100, border: "none",
                    background: email && password ? "#2b5ce6" : c.bgCard2,
                    color: email && password ? "#fff" : c.textMuted,
                    fontFamily: T.h, fontWeight: 800, fontSize: 15,
                    cursor: email && password ? "pointer" : "default",
                    opacity: loading ? 0.7 : 1, transition: "all 0.2s",
                  }}
                >
                  {loading ? "Création…" : "Continuer →"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "company" && (
            <motion.div
              key="company"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: 20, padding: 28 }}
            >
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 17, color: c.textPrimary, marginBottom: 6 }}>
                Votre entreprise
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 24 }}>
                Ces informations apparaîtront sur votre dashboard RH.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  placeholder="Nom de l'entreprise *"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }}
                />
                <input
                  placeholder="Votre nom *"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }}
                />

                <div>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 8 }}>Plan choisi</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {PLANS.map(p => (
                      <div
                        key={p.key}
                        onClick={() => setPlan(p.key)}
                        style={{
                          padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                          background: plan === p.key ? `${p.color}12` : c.bgCard2,
                          border: `1.5px solid ${plan === p.key ? p.color + "50" : c.border2}`,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          transition: "all 0.15s",
                        }}
                      >
                        <div>
                          <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: plan === p.key ? p.color : c.textPrimary }}>{p.label}</span>
                          <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginLeft: 8 }}>{p.employees}</span>
                        </div>
                        <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: plan === p.key ? p.color : c.textMuted }}>{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "#e24b4a" }}>{error}</p>
                )}
                <button
                  onClick={handleCreateCompany}
                  disabled={!companyName || !contactName || loading}
                  style={{
                    padding: "14px 0", borderRadius: 100, border: "none",
                    background: companyName && contactName ? "#2b5ce6" : c.bgCard2,
                    color: companyName && contactName ? "#fff" : c.textMuted,
                    fontFamily: T.h, fontWeight: 800, fontSize: 15,
                    cursor: companyName && contactName ? "pointer" : "default",
                    opacity: loading ? 0.7 : 1, transition: "all 0.2s",
                  }}
                >
                  {loading ? "Création…" : "Créer mon espace →"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: 20, padding: 32, textAlign: "center" }}
            >
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: c.textPrimary, marginBottom: 8 }}>
                Votre espace est créé !
              </p>
              <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, lineHeight: 1.65, marginBottom: 28 }}>
                Vérifiez votre email pour confirmer votre compte, puis accédez à votre dashboard RH pour inviter vos employés.
              </p>
              <button
                onClick={() => router.push("/entreprise/dashboard")}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 100, border: "none",
                  background: "#2b5ce6", color: "#fff",
                  fontFamily: T.h, fontWeight: 800, fontSize: 15,
                  cursor: "pointer", boxShadow: "0 4px 24px rgba(43,92,230,0.35)",
                }}
              >
                Accéder au dashboard →
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        <p style={{ textAlign: "center", fontFamily: T.b, fontSize: 12, color: c.textMuted, marginTop: 16 }}>
          Déjà un compte ? <a href="/auth" style={{ color: "#2b5ce6", textDecoration: "none" }}>Se connecter</a>
        </p>
      </div>
    </main>
  );
}
