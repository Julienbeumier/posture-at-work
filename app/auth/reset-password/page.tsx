"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export default function ResetPasswordPage() {
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
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (done) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--main-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>✅</p>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>Mot de passe mis à jour !</p>
        <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t50)" }}>Redirection…</p>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", background: "var(--main-bg)" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", marginBottom: 6 }}>
            PAW<span style={{ color: "#2b5ce6" }}>.</span>
          </p>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "var(--text-primary)", marginBottom: 6 }}>Nouveau mot de passe</h1>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)" }}>Choisis un mot de passe sécurisé</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" placeholder="Nouveau mot de passe (min. 8 car.)" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: "12px 14px", borderRadius: 12, outline: "none",
              background: "var(--bg-card2)", border: "1px solid var(--border2)",
              color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />
          <input type="password" placeholder="Confirmer le mot de passe" value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={{ padding: "12px 14px", borderRadius: 12, outline: "none",
              background: "var(--bg-card2)", border: "1px solid var(--border2)",
              color: "var(--text-primary)", fontFamily: T.b, fontSize: 14 }} />
          {error && <p style={{ fontFamily: T.b, fontSize: 12, color: "#f09595", textAlign: "center" }}>{error}</p>}
          <button onClick={handleReset} disabled={!password || !confirm || loading}
            style={{ padding: "14px 0", borderRadius: 100, border: "none",
              background: password && confirm ? "#2b5ce6" : "var(--bg-card2)",
              color: password && confirm ? "#fff" : "var(--t40)",
              fontFamily: T.h, fontWeight: 800, fontSize: 15, cursor: "pointer",
              boxShadow: password && confirm ? "0 4px 24px rgba(43,92,230,0.35)" : "none",
              opacity: loading ? 0.7 : 1, transition: "all 0.2s" }}>
            {loading ? "Mise à jour…" : "Mettre à jour →"}
          </button>
        </div>
      </div>
    </main>
  );
}
