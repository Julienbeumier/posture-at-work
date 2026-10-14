"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export default function ResetPasswordPage() {
  const { c } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { setError("Minimum 8 caractères"); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/entreprise/dashboard"), 2000);
  }

  if (done) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>✅</p>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: c.textPrimary, marginBottom: 6 }}>Mot de passe mis à jour !</p>
        <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>Redirection…</p>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: c.textPrimary, marginBottom: 6 }}>
            PAW<span style={{ color: "#2b5ce6" }}>.</span> Entreprise
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>Nouveau mot de passe</p>
        </div>
        <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" placeholder="Nouveau mot de passe (min. 8 caractères)" value={password} onChange={e => setPassword(e.target.value)}
            style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }} />
          <input type="password" placeholder="Confirmer le mot de passe" value={confirm} onChange={e => setConfirm(e.target.value)}
            style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 14, outline: "none" }} />
          {error && <p style={{ fontFamily: T.b, fontSize: 12, color: "#e24b4a" }}>{error}</p>}
          <button onClick={handleReset} disabled={!password || !confirm || loading} style={{
            padding: "14px 0", borderRadius: 100, border: "none",
            background: password && confirm ? "#2b5ce6" : c.bgCard2,
            color: password && confirm ? "#fff" : c.textMuted,
            fontFamily: T.h, fontWeight: 800, fontSize: 15,
            cursor: password && confirm ? "pointer" : "default",
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Mise à jour…" : "Mettre à jour →"}
          </button>
        </div>
      </div>
    </main>
  );
}
