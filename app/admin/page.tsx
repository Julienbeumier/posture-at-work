"use client";
import { useState } from "react";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "paw-admin-2026";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    plan: "pme",
    maxEmployees: 25,
    inviteCode: "",
    agreedPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; inviteCode?: string; companyId?: string } | null>(null);

  if (!authenticated) return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 320, width: "100%" }}>
        <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "var(--text-primary)", textAlign: "center", marginBottom: 20 }}>
          PAW<span style={{ color: "#2b5ce6" }}>.</span> Admin
        </p>
        <input type="password" placeholder="Mot de passe admin" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && setAuthenticated(password === ADMIN_PASSWORD)}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, outline: "none", marginBottom: 10, boxSizing: "border-box",
            background: "var(--bg-card2)", border: "1px solid var(--border2)", color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />
        <button onClick={() => setAuthenticated(password === ADMIN_PASSWORD)}
          style={{ width: "100%", padding: "13px 0", borderRadius: 100, border: "none", background: "#2b5ce6", color: "#fff",
            fontFamily: T.h, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Accéder →
        </button>
      </div>
    </main>
  );

  async function handleCreate() {
    if (!form.companyName || !form.contactEmail) return;
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/admin/create-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
          PAW<span style={{ color: "#2b5ce6" }}>.</span> Admin
        </p>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", marginBottom: 28 }}>
          Créer une nouvelle company B2B
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "companyName", label: "Nom de l'entreprise", placeholder: "Acme Corp" },
            { key: "contactName", label: "Nom du contact RH", placeholder: "Marie Martin" },
            { key: "contactEmail", label: "Email du contact RH", placeholder: "marie@acme.com" },
            { key: "inviteCode", label: "Code d'invitation (optionnel)", placeholder: "ACME2026 — généré auto si vide" },
            { key: "agreedPrice", label: "Prix annuel facturé (€)", placeholder: "ex: 750 pour 30 employés × 25€" },
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "var(--t55)", marginBottom: 4 }}>Plan</p>
              <select value={form.plan} onChange={e => setForm(prev => ({ ...prev, plan: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, outline: "none", boxSizing: "border-box",
                  background: "var(--bg-card2)", border: "1px solid var(--border2)", color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }}>
                <option value="pme">PME — 25€/employé/an (10-49)</option>
                <option value="croissance">Croissance — 20€/employé/an (50-149)</option>
                <option value="entreprise">Entreprise — Sur devis (150+)</option>
              </select>
            </div>
            <div>
              <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "var(--t55)", marginBottom: 4 }}>Max employés</p>
              <input type="number" value={form.maxEmployees}
                onChange={e => setForm(prev => ({ ...prev, maxEmployees: Number(e.target.value) }))}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, outline: "none", boxSizing: "border-box",
                  background: "var(--bg-card2)", border: "1px solid var(--border2)", color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />
            </div>
          </div>
        </div>

        <button onClick={handleCreate} disabled={loading || !form.companyName || !form.contactEmail}
          style={{ width: "100%", marginTop: 20, padding: "15px 0", borderRadius: 100, border: "none",
            background: form.companyName && form.contactEmail ? "#2b5ce6" : "var(--bg-card2)",
            color: form.companyName && form.contactEmail ? "#fff" : "var(--t40)",
            fontFamily: T.h, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Création en cours…" : "Créer la company →"}
        </button>

        {result && (
          <div style={{ marginTop: 16, padding: "16px 18px", borderRadius: 14,
            background: result.success ? "rgba(116,198,157,0.08)" : "rgba(226,75,74,0.08)",
            border: `0.5px solid ${result.success ? "rgba(116,198,157,0.25)" : "rgba(226,75,74,0.25)"}` }}>
            <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
              color: result.success ? "#74c69d" : "#f09595", margin: "0 0 8px" }}>
              {result.success ? "✅ Company créée !" : "❌ Erreur"}
            </p>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", margin: 0, lineHeight: 1.6 }}>
              {result.message}
            </p>
            {result.success && result.inviteCode && (
              <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(43,92,230,0.08)" }}>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", margin: "0 0 4px" }}>Lien d&apos;invitation employés :</p>
                <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#7c9fff", margin: 0 }}>
                  postureatwork.com/join/{result.inviteCode}
                </p>
                <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: "4px 0 0" }}>
                  L&apos;email de bienvenue a été envoyé à {form.contactEmail}
                </p>
              </div>
            )}
            {result.success && (
              <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", marginTop: 6 }}>
                Prix indicatif : {form.maxEmployees < 50
                  ? `${form.maxEmployees} × 25€ = ${form.maxEmployees * 25}€/an`
                  : `${form.maxEmployees} × 20€ = ${form.maxEmployees * 20}€/an`}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
