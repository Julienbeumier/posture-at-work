"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const TEST_SCORES = {
  global: 58, setup: 32, pain: 48,
  habits: 55, sleep_energy: 45,
  nutrition: 30, lifestyle: 60,
};

const BUTTONS = [
  { label: "Envoyer Email J+0 (post-bilan)", step: 0 },
  { label: "Envoyer Email J+3 (tip ergonomique)", step: 2 },
  { label: "Envoyer Email J+7 (témoignage)", step: 3 },
  { label: "Envoyer Email J+14 (rappel bilan)", step: 4 },
  { label: "Envoyer Email J+30 (teaser premium)", step: 5 },
];

export default function AdminEmailsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("julienbeumier@outlook.com");
  const [firstname, setFirstname] = useState("Julien");
  const [results, setResults] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth"); return; }
      setReady(true);
    });
  }, [router]);

  async function send(step: number) {
    setLoading(step);
    setResults(prev => ({ ...prev, [step]: "" }));
    try {
      const url = step === 0 ? "/api/emails/send-bilan" : "/api/emails/send-sequence";
      const body = step === 0
        ? {
            email, firstname, scores: TEST_SCORES,
            recommendations: [
              "Surélève ton écran à hauteur des yeux",
              "Fais des pauses actives toutes les heures",
              "Améliore ton alimentation du midi",
            ],
            topExercise: {
              name: "Rétraction cervicale",
              duration: "10 rép. × 5 sec",
              instruction: "Rentre doucement le menton vers la gorge. Tiens 5 secondes.",
            },
          }
        : { email, firstname, step, scores: TEST_SCORES };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(prev => ({
        ...prev,
        [step]: data.success ? "✅ Envoyé !" : `❌ Erreur : ${data.error ?? "inconnue"}`,
      }));
    } catch (e) {
      setResults(prev => ({ ...prev, [step]: `❌ Erreur : ${String(e)}` }));
    } finally {
      setLoading(null);
    }
  }

  if (!ready) return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: T.b, color: "rgba(220,220,245,0.4)", fontSize: 14 }}>Chargement…</span>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", padding: "80px 24px 60px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", margin: "0 0 4px" }}>
          🧪 Admin — Test emails
        </p>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.40)", margin: "0 0 32px" }}>
          Scores test : global=58, setup=32, pain=48, habits=55, sleep=45, nutrition=30, lifestyle=60
        </p>

        {/* Champs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          <div>
            <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.45)", margin: "0 0 6px" }}>Email destinataire</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)",
                color: "#f0f0fa", fontSize: 14, fontFamily: T.b, outline: "none",
              }}
            />
          </div>
          <div>
            <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.45)", margin: "0 0 6px" }}>Prénom</p>
            <input
              type="text"
              value={firstname}
              onChange={e => setFirstname(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)",
                color: "#f0f0fa", fontSize: 14, fontFamily: T.b, outline: "none",
              }}
            />
          </div>
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {BUTTONS.map(({ label, step }) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => send(step)}
                disabled={loading === step}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 10, cursor: loading === step ? "default" : "pointer",
                  background: loading === step ? "rgba(43,92,230,0.20)" : "rgba(43,92,230,0.15)",
                  border: "0.5px solid rgba(43,92,230,0.35)",
                  fontFamily: T.b, fontWeight: 600, fontSize: 13,
                  color: loading === step ? "rgba(168,192,255,0.5)" : "#7c9fff",
                  textAlign: "left",
                }}
              >
                {loading === step ? "Envoi en cours…" : label}
              </button>
              {results[step] && (
                <span style={{
                  fontFamily: T.b, fontSize: 13, whiteSpace: "nowrap",
                  color: results[step].startsWith("✅") ? "#74c69d" : "#f09595",
                }}>
                  {results[step]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
