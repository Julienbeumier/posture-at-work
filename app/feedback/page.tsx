"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const FEATURES = [
  { key: "score_questionnaire",  label: "Le questionnaire",        desc: "Clarté et pertinence des questions" },
  { key: "score_recommandations", label: "Les recommandations",    desc: "Utilité des conseils personnalisés" },
  { key: "score_video",          label: "L'analyse vidéo IA",      desc: "Qualité et précision de l'analyse posturale" },
  { key: "score_exercices",      label: "Les exercices",           desc: "Pertinence du programme et guide vocal" },
] as const;

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            fontSize: 28, cursor: "pointer",
            opacity: star <= (hover || value) ? 1 : 0.25,
            transition: "opacity 0.15s",
            filter: star <= (hover || value) ? "none" : "grayscale(1)",
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { c } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [nps, setNps] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const allRequired = nps !== null;

  async function handleSubmit() {
    if (!allRequired) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("feedback").insert({
      user_id: user?.id ?? null,
      email: user?.email ?? null,
      nps,
      score_questionnaire: scores.score_questionnaire ?? null,
      score_recommandations: scores.score_recommandations ?? null,
      score_video: scores.score_video ?? null,
      score_exercices: scores.score_exercices ?? null,
      commentaire: commentaire.trim() || null,
    });

    if (!error) {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: c.mainBg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", maxWidth: 400 }}
        >
          <div style={{ fontSize: 64, marginBottom: 20 }}>🙏</div>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: c.textPrimary, marginBottom: 12 }}>
            Merci pour ton retour !
          </h1>
          <p style={{ fontFamily: T.b, fontSize: 15, color: c.textSecondary, lineHeight: 1.65 }}>
            Ton feedback va directement améliorer PAW. Retour au dashboard dans un instant…
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: c.mainBg, paddingBottom: 80 }}>
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 24px 0" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 36 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100, marginBottom: 16,
            background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.25)",
          }}>
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#7c9fff" }}>
              ✨ Accès premium offert en bêta
            </span>
          </div>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: c.textPrimary, marginBottom: 10, lineHeight: 1.2 }}>
            2 minutes pour améliorer PAW
          </h1>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textSecondary, lineHeight: 1.65 }}>
            Ton avis nous aide à construire le meilleur outil de santé au travail.
            <br />Toutes les questions notées sont optionnelles sauf la première.
          </p>
        </motion.div>

        {/* NPS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ borderRadius: 20, padding: "24px", background: c.bgCard, border: `0.5px solid ${c.border}`, marginBottom: 16 }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 6 }}>
            Tu recommanderais PAW à un collègue ? *
          </p>
          <p style={{ fontFamily: T.b, fontSize: 12, color: c.textSecondary, marginBottom: 16 }}>
            0 = pas du tout · 10 = absolument
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button
                key={n}
                onClick={() => setNps(n)}
                style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: nps === n ? "#2b5ce6" : c.bgCard2,
                  border: `1.5px solid ${nps === n ? "#2b5ce6" : c.border2}`,
                  color: nps === n ? "#fff" : c.textSecondary,
                  fontFamily: T.h, fontWeight: 700, fontSize: 14,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Feature ratings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ borderRadius: 20, padding: "24px", background: c.bgCard, border: `0.5px solid ${c.border}`, marginBottom: 16 }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 20 }}>
            Note les features que tu as testées
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {FEATURES.map((f) => (
              <div key={f.key}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: 0 }}>{f.label}</p>
                    <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>{f.desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StarRating
                      value={scores[f.key] ?? 0}
                      onChange={(v) => setScores(prev => ({ ...prev, [f.key]: v }))}
                    />
                    {!scores[f.key] && (
                      <span style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted }}>Pas testé</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Champ libre */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ borderRadius: 20, padding: "24px", background: c.bgCard, border: `0.5px solid ${c.border}`, marginBottom: 24 }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 6 }}>
            Qu&apos;est-ce qui t&apos;a manqué ? (optionnel)
          </p>
          <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 12 }}>
            Une feature, un bug, une idée — tout est utile.
          </p>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ex: J'aurais aimé pouvoir exporter mon rapport en PDF directement depuis le dashboard…"
            rows={4}
            style={{
              width: "100%", borderRadius: 12, padding: "12px 14px",
              background: c.bgCard2, border: `1px solid ${c.border2}`,
              color: c.textPrimary, fontFamily: T.b, fontSize: 13,
              lineHeight: 1.6, resize: "vertical", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </motion.div>

        {/* Submit */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={handleSubmit}
          disabled={!allRequired || loading}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 100,
            background: allRequired ? "#2b5ce6" : "rgba(43,92,230,0.12)",
            border: "none", cursor: allRequired ? "pointer" : "default",
            color: allRequired ? "#fff" : c.textMuted,
            fontFamily: T.h, fontWeight: 800, fontSize: 16,
            boxShadow: allRequired ? "0 4px 24px rgba(43,92,230,0.35)" : "none",
            transition: "all 0.2s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Envoi…" : "Envoyer mon feedback →"}
        </motion.button>

        <p style={{ textAlign: "center", fontFamily: T.b, fontSize: 11, color: c.textMuted, marginTop: 12 }}>
          * Seule la note de recommandation est obligatoire
        </p>

      </div>
    </main>
  );
}
