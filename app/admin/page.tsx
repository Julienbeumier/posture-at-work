"use client";
import { PLANS } from "@/lib/plans";
import { useState } from "react";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    plan: "pme",
    maxEmployees: 50,
    inviteCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string; inviteCode?: string; companyId?: string } | null>(null);

  async function login() {
    setAuthError("");
    try {
      const res = await fetch("/api/admin/create-company", { headers: { "x-admin-secret": password } });
      if (res.ok) setAuthenticated(true);
      else setAuthError(res.status === 429 ? "Trop de tentatives, réessayez plus tard." : "Accès refusé.");
    } catch {
      setAuthError("Erreur réseau.");
    }
  }

  if (!authenticated) return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 320, width: "100%" }}>
        <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "var(--text-primary)", textAlign: "center", marginBottom: 20 }}>
          PAW<span style={{ color: "#2b5ce6" }}>.</span> Admin
        </p>
        <input type="password" placeholder="Mot de passe admin" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, outline: "none", marginBottom: 10, boxSizing: "border-box",
            background: "var(--bg-card2)", border: "1px solid var(--border2)", color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />
        <button onClick={login}
          style={{ width: "100%", padding: "13px 0", borderRadius: 100, border: "none", background: "#2b5ce6", color: "#fff",
            fontFamily: T.h, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Accéder →
        </button>
        {authError && <p style={{ fontFamily: T.b, fontSize: 12, color: "#ff7b7b", textAlign: "center", marginTop: 10 }}>{authError}</p>}
      </div>
    </main>
  );

  async function handleCreate() {
    if (!form.companyName || !form.contactEmail) return;
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/admin/create-company", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": password },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)", padding: "80px 24px 40px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: "var(--text-primary)", marginBottom: 6 }}>
          PAW<span style={{ color: "#2b5ce6" }}>.</span> Administration
        </p>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", marginBottom: 28 }}>
          Créer une nouvelle entreprise B2B
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "companyName", label: "Nom de l'entreprise", placeholder: "Acme Corp" },
            { key: "contactName", label: "Nom du contact RH", placeholder: "Marie Martin" },
            { key: "contactEmail", label: "Email du contact RH", placeholder: "marie@acme.com" },
            { key: "inviteCode", label: "Code d'invitation (optionnel)", placeholder: "ACME2026 — généré auto si vide" },
          ].map(field => (
            <div key={field.key}>
              <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "var(--t55)", marginBottom: 4 }}>{field.label}</p>
              <input type="text" placeholder={field.placeholder}
                value={form[field.key as keyof typeof form] as string}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, outline: "none", boxSizing: "border-box",
                  background: "var(--bg-card2)", border: "1px solid var(--border2)", color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />
            </div>
          ))}

          <div>
            <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "var(--t55)", marginBottom: 8 }}>
              Diagnostic PAW — forfait (paiement unique)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 10 }}>
              {PLANS.map(pl => {
                const active = form.plan === pl.key;
                return (
                  <button key={pl.key} type="button" onClick={() => setForm(prev => ({ ...prev, plan: pl.key, maxEmployees: pl.maxEmployees ?? Math.max(prev.maxEmployees, 101) }))}
                    style={{ textAlign: "left", padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                      background: active ? "rgba(43,92,230,0.18)" : "var(--bg-card2)",
                      border: active ? "1.5px solid #6f9bff" : "1px solid var(--border2)" }}>
                    <span style={{ display: "block", fontFamily: T.h, fontWeight: 800, fontSize: 13, color: active ? "#6f9bff" : "var(--text-primary)" }}>{pl.name}</span>
                    <span style={{ display: "block", fontFamily: T.b, fontSize: 11, color: "var(--t55)" }}>
                      {pl.maxEmployees ? `≤ ${pl.maxEmployees} employés` : "> 100 employés"} · {pl.price !== null ? `${pl.price} €` : "sur devis"}
                    </span>
                  </button>
                );
              })}
            </div>
            {form.plan === "entreprise" && (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)" }}>Employés max :</span>
                <input type="number" min={101} max={2000} value={form.maxEmployees}
                  onChange={e => setForm(prev => ({ ...prev, maxEmployees: Math.max(101, Number(e.target.value)) }))}
                  style={{ width: 90, padding: "8px 10px", borderRadius: 8, outline: "none",
                    background: "var(--bg-card2)", border: "1px solid var(--border2)",
                    color: "var(--text-primary)", fontFamily: T.b, fontSize: 15, fontWeight: 700, textAlign: "center" }} />
              </div>
            )}
          </div>
        </div>

        <button onClick={handleCreate} disabled={loading || !form.companyName || !form.contactEmail}
          style={{ width: "100%", marginTop: 20, padding: "15px 0", borderRadius: 100, border: "none",
            background: form.companyName && form.contactEmail ? "#2b5ce6" : "var(--bg-card2)",
            color: form.companyName && form.contactEmail ? "#fff" : "var(--t40)",
            fontFamily: T.h, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Création en cours…" : "Créer l'entreprise →"}
        </button>

        {result && (
          <div style={{ marginTop: 16, padding: "16px 18px", borderRadius: 14,
            background: result.success ? "rgba(63,224,160,0.08)" : "rgba(226,75,74,0.08)",
            border: `0.5px solid ${result.success ? "rgba(63,224,160,0.25)" : "rgba(226,75,74,0.25)"}` }}>
            <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
              color: result.success ? "#3fe0a0" : "#ff7b7b", margin: "0 0 8px" }}>
              {result.success ? "✅ Entreprise créée !" : "❌ Erreur"}
            </p>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", margin: 0, lineHeight: 1.6 }}>
              {result.message}
            </p>
            {result.success && result.inviteCode && (
              <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(43,92,230,0.08)" }}>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", margin: "0 0 4px" }}>Lien d&apos;invitation employés :</p>
                <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#6f9bff", margin: 0 }}>
                  postureatwork.com/join/{result.inviteCode}
                </p>
                <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: "4px 0 0" }}>
                  L&apos;email de bienvenue a été envoyé à {form.contactEmail}
                </p>
              </div>
            )}
            {result.success && (
              <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", marginTop: 6 }}>
                Forfait {PLANS.find(pl => pl.key === form.plan)?.name} : {PLANS.find(pl => pl.key === form.plan)?.price !== null ? `${PLANS.find(pl => pl.key === form.plan)?.price} € (paiement unique)` : "sur devis"} · {form.maxEmployees} employés max
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
