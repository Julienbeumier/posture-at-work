"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { DEFAULT_ANSWERS, type QuestionnaireAnswers, type Scores } from "@/lib/scoring";
import { getDimensionAdvice, isValidDimension, type DimensionAdvice } from "@/lib/dimension-advice";
import { DIMENSION_META, type Exercise, type Product } from "@/lib/tips";
import { createClient } from "@/lib/supabase";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

function scoreBadge(score: number) {
  if (score >= 70) return { label: "Bonne santé", color: "#74c69d", bg: "rgba(116,198,157,0.12)", border: "rgba(116,198,157,0.3)" };
  if (score >= 50) return { label: "À améliorer", color: "#f4a261", bg: "rgba(244,162,97,0.12)", border: "rgba(244,162,97,0.3)" };
  return { label: "Attention requise", color: "#f09595", bg: "rgba(240,149,149,0.12)", border: "rgba(240,149,149,0.3)" };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#f0f0fa", margin: "0 0 12px" }}>
      {children}
    </h2>
  );
}

function ExerciseCard({ ex, color }: { ex: Exercise; color: string }) {
  return (
    <div style={{
      borderRadius: 18, padding: "18px 20px",
      background: "rgba(45,106,79,0.07)", border: "0.5px solid rgba(45,106,79,0.2)",
    }}>
      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f0f0fa", margin: "0 0 6px" }}>{ex.name}</p>
      <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.6)", lineHeight: 1.65, margin: "0 0 10px" }}>{ex.instruction}</p>
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{ fontFamily: T.b, fontSize: 12, color }}>⏱ {ex.duration}</span>
        <span style={{ color: "rgba(220,220,245,0.2)" }}>·</span>
        <span style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.45)" }}>{ex.frequency}</span>
      </div>
    </div>
  );
}

const PRIORITY_STYLE = {
  haute:   { color: "#f09595", label: "Priorité haute" },
  moyenne: { color: "#f4a261", label: "Priorité moyenne" },
  premium: { color: "#a78bfa", label: "Premium" },
};

function ProductCard({ p }: { p: Product }) {
  const pStyle = PRIORITY_STYLE[p.priority];
  return (
    <div style={{
      borderRadius: 18, padding: "16px 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
      background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.18)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f0f0fa", margin: 0 }}>{p.name}</p>
          <span style={{
            padding: "2px 8px", borderRadius: 100,
            fontFamily: T.b, fontWeight: 600, fontSize: 11,
            color: pStyle.color, background: `${pStyle.color}18`,
          }}>
            {pStyle.label}
          </span>
        </div>
        <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.45)", lineHeight: 1.6, margin: 0 }}>{p.reason}</p>
      </div>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flexShrink: 0, padding: "8px 14px", borderRadius: 100, textDecoration: "none",
          background: "rgba(244,162,97,0.10)", border: "0.5px solid rgba(244,162,97,0.3)",
          fontFamily: T.b, fontWeight: 700, fontSize: 12, color: "#f4a261", cursor: "pointer",
        }}
      >
        Amazon →
      </a>
    </div>
  );
}

export default function DimensionPage() {
  const params = useParams();
  const dimensionParam = typeof params.dimension === "string" ? params.dimension : "";

  const [advice, setAdvice] = useState<DimensionAdvice | null>(null);
  const [score, setScore] = useState<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isValidDimension(dimensionParam)) { setReady(true); return; }

      const answersRaw = sessionStorage.getItem("postureatwork_answers") || localStorage.getItem("paw_answers");
      const scoresRaw = sessionStorage.getItem("postureatwork_scores");

      const answers: QuestionnaireAnswers = answersRaw
        ? { ...DEFAULT_ANSWERS, ...JSON.parse(answersRaw) }
        : DEFAULT_ANSWERS;

      let scores: Scores;

      if (scoresRaw) {
        scores = JSON.parse(scoresRaw);
      } else {
        // Fallback: fetch latest assessment from Supabase
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from("assessments")
              .select("scores")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            scores = data?.scores ?? { global: 0, setup: 0, pain: 0, habits: 0, sleep_energy: 0, lifestyle: 0, nutrition: 0 };
          } else {
            scores = { global: 0, setup: 0, pain: 0, habits: 0, sleep_energy: 0, lifestyle: 0, nutrition: 0 };
          }
        } catch {
          scores = { global: 0, setup: 0, pain: 0, habits: 0, sleep_energy: 0, lifestyle: 0, nutrition: 0 };
        }
      }

      const meta = DIMENSION_META[dimensionParam];
      const dimensionScore = (scores[meta.scoreKey as keyof Scores] as number) ?? 0;
      setScore(dimensionScore);
      setAdvice(getDimensionAdvice(dimensionParam, answers, scores));
      setReady(true);
    }
    load();
  }, [dimensionParam]);

  if (!ready) {
    return (
      <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.4)" }}>Chargement…</span>
      </main>
    );
  }

  if (!isValidDimension(dimensionParam) || !advice) {
    return (
      <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", marginBottom: 12 }}>Dimension inconnue</p>
          <Link href="/results" style={{ textDecoration: "none", color: "#7c9fff", fontFamily: T.b, fontSize: 14 }}>← Retour aux résultats</Link>
        </div>
      </main>
    );
  }

  const meta = DIMENSION_META[dimensionParam];
  const badge = scoreBadge(score);

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", paddingBottom: 80, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: `${meta.colorBg}`, size: 500 },
        { bottom: "-10%", left: "-5%", color: "rgba(43,92,230,0.08)", size: 400 },
      ]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>

        {/* Nav */}
        <div style={{ paddingTop: 80, paddingBottom: 32 }}>
          <Link href="/results" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.4)", cursor: "pointer" }}>← Mes résultats</span>
          </Link>
        </div>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 28, padding: "28px 28px 24px",
            background: meta.colorBg, border: `0.5px solid ${meta.colorBorder}`,
            marginBottom: 20,
          }}
        >
          {/* Chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16,
            padding: "5px 12px", borderRadius: 100,
            background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)",
          }}>
            <span style={{ fontSize: 14 }}>{meta.emoji}</span>
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: meta.color }}>{meta.label}</span>
          </div>

          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#f0f0fa", margin: "0 0 14px", lineHeight: 1.2 }}>
            Ton plan {meta.label.toLowerCase()}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{
              padding: "4px 14px", borderRadius: 100,
              background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)",
            }}>
              <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: meta.color }}>{score}</span>
              <span style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.4)", marginLeft: 4 }}>/100</span>
            </div>
            <div style={{
              padding: "5px 14px", borderRadius: 100,
              background: badge.bg, border: `0.5px solid ${badge.border}`,
            }}>
              <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 12, color: badge.color }}>{badge.label}</span>
            </div>
          </div>
        </motion.div>

        {/* ── CE QU'ON A DÉTECTÉ ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            borderRadius: 20, padding: "20px 22px", marginBottom: 16,
            background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)",
          }}
        >
          <SectionTitle>🔍 Ce qu'on a détecté</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {advice.detected.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  flexShrink: 0, width: 6, height: 6, borderRadius: "50%",
                  background: meta.color, marginTop: 7,
                }} />
                <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.75)", lineHeight: 1.65, margin: 0 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CE QUE ÇA PROVOQUE ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            borderRadius: 20, padding: "20px 22px", marginBottom: 16,
            background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)",
          }}
        >
          <SectionTitle>⚡ Ce que ça provoque</SectionTitle>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.65)", lineHeight: 1.75, margin: 0 }}>
            {advice.consequences}
          </p>
        </motion.div>

        {/* ── TES ACTIONS PRIORITAIRES ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 16 }}
        >
          <SectionTitle>✅ Tes actions prioritaires</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {advice.tips.map((tip, i) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                style={{
                  borderRadius: 16, padding: "14px 18px",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)",
                }}
              >
                <div style={{
                  flexShrink: 0, width: 36, height: 36, borderRadius: 12,
                  background: meta.colorBg, border: `0.5px solid ${meta.colorBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {tip.icon}
                </div>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "#e0e0f0", lineHeight: 1.65, margin: 0 }}>
                  {tip.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── EXERCICES ── */}
        {advice.exercises.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 16 }}
          >
            <SectionTitle>🤸 Tes exercices ciblés</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {advice.exercises.map((ex, i) => (
                <ExerciseCard key={i} ex={ex} color={meta.color} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PRODUITS ── */}
        {advice.products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{ marginBottom: 20 }}
          >
            <SectionTitle>🛍️ Produits recommandés</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {advice.products.map((p, i) => (
                <ProductCard key={i} p={p} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── BOTTOM ACTIONS ── */}
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/results" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "rgba(220,220,245,0.45)",
            }}>
              ← Mes résultats
            </div>
          </Link>
          <Link href="/stretching" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: meta.colorBg, border: `0.5px solid ${meta.colorBorder}`,
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: meta.color,
            }}>
              🤸 Mes étirements
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
