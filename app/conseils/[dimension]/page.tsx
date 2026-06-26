"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { DEFAULT_ANSWERS, type QuestionnaireAnswers, type Scores } from "@/lib/scoring";
import { getDimensionAdvice, isValidDimension, type DimensionAdvice } from "@/lib/dimension-advice";
import { DIMENSION_META, type Product } from "@/lib/tips";
import { EXERCISES, type Exercise } from "@/lib/exercises";
import { createClient } from "@/lib/supabase";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { getJobContent, getScoreInterpretation, getJobDimensionContent, type JobDimensionContent } from "@/lib/job-content";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";

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
    <h2 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: "0 0 12px" }}>
      {children}
    </h2>
  );
}

function ExercisePreview({ ex, color }: { ex: Exercise; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)",
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ex.zoneColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {ex.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "var(--text-primary)", margin: 0 }}>{ex.name}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
          <span style={{ fontFamily: T.b, fontSize: 11, color }}>⏱ {ex.reps}</span>
          <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t30)" }}>·</span>
          <span style={{ padding: "1px 7px", borderRadius: 100, background: `${ex.zoneColor}18`, fontFamily: T.b, fontSize: 10, color: ex.zoneColor }}>{ex.zone}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Immediate actions per dimension ─────────────────────────────────────────

const IMMEDIATE_ACTIONS: Record<string, string[]> = {
  setup: [
    "Surélève ton écran avec des livres ou un support",
    "Recule ton clavier à 5cm du bord du bureau",
    "Redresse ton dos et colle les omoplates — fais-le maintenant",
  ],
  douleurs: [
    "Lève-toi et marche 2 minutes maintenant",
    "Applique de la chaleur sur la zone douloureuse 10 min",
    "Fais la rétraction cervicale — 10 reps, maintenant",
  ],
  habitudes: [
    "Programme une alarme toutes les heures sur ton téléphone",
    "Pose un verre d'eau sur ton bureau maintenant",
    "Lève-toi et fais 10 pas — juste maintenant",
  ],
  sommeil: [
    "Ce soir : téléphone en mode nuit à partir de 21h",
    "Couche-toi 30 min plus tôt ce soir",
    "Éteins tous les écrans 45 min avant de dormir",
  ],
  nutrition: [
    "Prépare un verre d'eau et bois-le maintenant",
    "Demain midi : mange loin de ton écran, juste 20 min",
    "Remplace ton prochain grignotage par des noix ou du fruit",
  ],
  lifestyle: [
    "Prends 5 minutes pour une marche rapide maintenant",
    "Planifie une séance de sport dans ton agenda cette semaine",
    "Debout et étire-toi en lisant la prochaine action",
  ],
};

const DIM_EXERCISE_IDS: Record<string, string[]> = {
  setup:     ["chin_tuck", "scapular_retraction", "lumbar_extension"],
  douleurs:  ["chin_tuck", "lumbar_flexion", "chest_opener"],
  habitudes: ["marching", "chair_squat", "rule_20_20_20"],
  sommeil:   ["body_scan", "coherence_cardiaque", "neck_massage"],
  nutrition: ["coherence_cardiaque", "rule_20_20_20", "body_scan"],
  lifestyle: ["marching", "lateral_flexion", "calf_stretch"],
};

const DIM_PROGRAM: Record<string, string> = {
  setup:     "bureau_pause",
  douleurs:  "cible_cervicales",
  habitudes: "bureau_pause",
  sommeil:   "maison_recup",
  nutrition: "bureau_express",
  lifestyle: "maison_reveil",
};

const PRIORITY_STYLE = {
  haute:   { color: "#f09595", label: "Priorité haute" },
  moyenne: { color: "#f4a261", label: "Priorité moyenne" },
  premium: { color: "#a78bfa", label: "Premium" },
};

function ProductCard({ p }: { p: Product }) {
  const pStyle = PRIORITY_STYLE[p.priority];
  return (
    <div style={{
      borderRadius: 16, padding: "16px 18px", position: "relative", overflow: "hidden",
      background: "var(--bg-card)", border: "0.5px solid var(--border-2)",
    }}>
      {/* Badge produit */}
      {p.badge && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          padding: "2px 9px", borderRadius: 100,
          fontFamily: T.b, fontWeight: 700, fontSize: 10,
          color: "#74c69d", background: "rgba(116,198,157,0.15)", border: "0.5px solid rgba(116,198,157,0.3)",
        }}>
          {p.badge}
        </span>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Icône Amazon */}
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(43,92,230,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          🛒
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)", margin: 0 }}>{p.name}</p>
            <span style={{
              padding: "2px 8px", borderRadius: 100, flexShrink: 0,
              fontFamily: T.b, fontWeight: 600, fontSize: 10,
              color: pStyle.color, background: `${pStyle.color}18`,
            }}>
              {pStyle.label}
            </span>
          </div>
          <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", lineHeight: 1.6, margin: "0 0 12px" }}>{p.reason}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{p.price}</span>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 16px", borderRadius: 100, textDecoration: "none",
                background: "#2b5ce6", boxShadow: "0 2px 12px rgba(43,92,230,0.35)",
                fontFamily: T.b, fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer", flexShrink: 0,
              }}
            >
              Voir sur Amazon →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Données de Thomas utilisées comme fallback depuis /exemple-rapport
const THOMAS_SCORES = {
  global: 45, setup: 32, pain: 48, habits: 55,
  sleep_energy: 45, nutrition: 30, lifestyle: 60,
};
const THOMAS_ANSWERS = {
  // Setup
  q1: "laptop_seul",
  q3: "non_bas",
  q4: "close",
  q5: "trackpad",
  q5b: "fixed",
  q_eclairage: "artificiel",
  q_laptop_hors_bureau: "visio_canape",
  // Douleurs
  q6: 3, q7: 2, q8: 2, q9: 1, q10: 0,
  q11: "months",
  q12: "end",
  q12b: "partial",
  q_irradiation: "non",
  q_maux_tete_nuque: "maux_fin_journee",
  q_douleur_nuit: "non",
  // Habitudes
  q13: 9,
  q14: "never",
  q14b: "cardio",
  q_stress_travail: 3,
  // Sommeil
  q17: 6,
  q18: "tired",
  q19: 1.5,
  q20: "often",
  q_ecrans_soir: "souvent",
  // Nutrition
  qn1: "screen",
  qn2: "crash",
  qn3: "afternoon",
  qn4: "sandwich",
  // Lifestyle
  q21: ["cervical"],
  q21_other: "",
  q24: "bad",
  q25: 2,
};

export default function DimensionPage() {
  const params = useParams();
  const { premium } = usePremium();
  const { c } = useTheme();
  const dimensionParam = typeof params.dimension === "string" ? params.dimension : "";

  const [advice, setAdvice] = useState<DimensionAdvice | null>(null);
  const [jobDimContent, setJobDimContent] = useState<JobDimensionContent | null>(null);
  const [score, setScore] = useState<number>(0);
  const [ready, setReady] = useState(false);
  const [hasBilan, setHasBilan] = useState(true);
  const [isExampleMode, setIsExampleMode] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(new Array(10).fill(false));
  const [jobType, setJobType] = useState<string>("bureau");

  useEffect(() => {
    async function load() {
      if (!isValidDimension(dimensionParam)) { setReady(true); return; }

      // ── 1. Example mode ──────────────────────────────────────────────────
      let isExample = sessionStorage.getItem("paw_example_mode") === "true"
                   || localStorage.getItem("paw_example_mode") === "true";

      // ── 1b. Si mode exemple mais scores absents (cleanup exemple-rapport a tourné en premier),
      //        repopuler les données de Thomas dans leurs clés dédiées ──────
      if (isExample && !sessionStorage.getItem("paw_example_scores")) {
        sessionStorage.setItem("paw_example_scores", JSON.stringify(THOMAS_SCORES));
        sessionStorage.setItem("paw_example_answers", JSON.stringify(THOMAS_ANSWERS));
      }

      // ── 2. Source of truth: scores from sessionStorage (set by questionnaire submit) ──
      const scoresRaw = isExample
        ? sessionStorage.getItem("paw_example_scores")
        : sessionStorage.getItem("postureatwork_scores");
      const parsedScores: Scores | null = scoresRaw ? JSON.parse(scoresRaw) : null;

      // If real scores exist and clearly don't belong to the example user → clear example mode
      if (isExample && parsedScores && parsedScores.global !== 45) {
        sessionStorage.removeItem("paw_example_mode");
        localStorage.removeItem("paw_example_mode");
        isExample = false;
        setIsExampleMode(false);
      } else if (isExample) {
        setIsExampleMode(true);
      }

      // ── 3. Effective job type — scores.job_type is most reliable ─────────
      const effectiveJobType = isExample
        ? "bureau"
        : (parsedScores?.job_type || localStorage.getItem("paw_job_type") || "bureau");
      setJobType(effectiveJobType);

      // ── 4. Read answers from the correct key ─────────────────────────────
      const answersKey = (effectiveJobType === "debout" && !isExample)
        ? "postureatwork_answers_debout"
        : "postureatwork_answers";
      const answersRaw = isExample
        ? sessionStorage.getItem("paw_example_answers")
        : sessionStorage.getItem(answersKey)
          || (effectiveJobType !== "debout" ? localStorage.getItem("paw_answers") : null);


      // ── 5. No session data at all → Supabase or no-bilan ─────────────────
      if (!scoresRaw && !answersRaw) {
        if (isExample) { setHasBilan(true); setReady(true); return; }
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) { setHasBilan(false); setReady(true); return; }
          const { data } = await supabase
            .from("assessments").select("scores, answers")
            .eq("user_id", user.id).order("created_at", { ascending: false })
            .limit(1).maybeSingle();
          if (!data?.scores) { setHasBilan(false); setReady(true); return; }
          const sa = { ...DEFAULT_ANSWERS, ...(data.answers ?? {}) } as QuestionnaireAnswers;
          const ss = data.scores as Scores;
          setScore((ss[DIMENSION_META[dimensionParam].scoreKey as keyof Scores] as number) ?? 0);
          setAdvice(getDimensionAdvice(dimensionParam, sa, ss));
          setReady(true);
          return;
        } catch {
          setHasBilan(false); setReady(true); return;
        }
      }

      // ── 6. Use session scores ─────────────────────────────────────────────
      const scores: Scores = parsedScores ?? {
        global: 0, setup: 0, pain: 0, habits: 0, sleep_energy: 0, lifestyle: 0, nutrition: 0,
      };
      const meta = DIMENSION_META[dimensionParam];
      setScore((scores[meta.scoreKey as keyof Scores] as number) ?? 0);

      // ── 7. Debout profile: always try job-specific content ────────────────
      //    answersRaw may be empty for fresh cross-session navigation;
      //    getDeboutDimensionContent handles {} gracefully (shows default messages).
      if (effectiveJobType !== "bureau") {
        const genericAnswers: Record<string, unknown> = answersRaw ? JSON.parse(answersRaw) : {};
        const jdc = getJobDimensionContent(dimensionParam, effectiveJobType, genericAnswers);
        if (jdc) {
          setJobDimContent(jdc);
          setReady(true);
          return;
        }
      }

      // ── 8. Bureau fallback ────────────────────────────────────────────────
      const bureauAnswers: QuestionnaireAnswers = answersRaw
        ? { ...DEFAULT_ANSWERS, ...JSON.parse(answersRaw) }
        : DEFAULT_ANSWERS;
      setAdvice(getDimensionAdvice(dimensionParam, bureauAnswers, scores));
      setReady(true);
    }
    load();
  }, [dimensionParam]);

  if (!ready) {
    return (
      <main style={{ minHeight: "100vh", background: c.mainBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.b, fontSize: 14, color: "var(--t40)" }}>Chargement…</span>
      </main>
    );
  }

  if (!isValidDimension(dimensionParam) || (!advice && !jobDimContent)) {
    return (
      <main style={{ minHeight: "100vh", background: c.mainBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", marginBottom: 12 }}>Dimension inconnue</p>
          <Link href="/results" style={{ textDecoration: "none", color: "#7c9fff", fontFamily: T.b, fontSize: 14 }}>← Retour aux résultats</Link>
        </div>
      </main>
    );
  }

  // Resolved display data — job-specific overrides bureau defaults
  const displayDetected   = jobDimContent?.detected        ?? advice?.detected        ?? [];
  const displayConsequences = jobDimContent?.consequences  ?? advice?.consequences    ?? "";
  const displayTips       = jobDimContent?.tips            ?? advice?.tips            ?? [];
  const displayImmediate  = jobDimContent?.immediateActions ?? IMMEDIATE_ACTIONS[dimensionParam] ?? [];
  const displayExerciseIds = jobDimContent?.exerciseIds    ?? DIM_EXERCISE_IDS[dimensionParam]   ?? [];
  const displayProgramId  = jobDimContent?.programId       ?? DIM_PROGRAM[dimensionParam]        ?? "bureau_pause";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayProducts   = (jobDimContent?.products as any[]) ?? advice?.products   ?? [];

  if (!hasBilan) {
    const m = DIMENSION_META[dimensionParam] ?? DIMENSION_META["setup"];
    return (
      <main style={{ minHeight: "100vh", background: c.mainBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", position: "relative" }}>
        <BackgroundBlobs blobs={[{ top: "-5%", right: "-5%", color: m.colorBg, size: 400 }]} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: m.colorBg, border: `0.5px solid ${m.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>
            🔍
          </div>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.3 }}>
            Ton analyse {m.label.toLowerCase()} n&apos;est pas encore disponible
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t50)", lineHeight: 1.65, margin: "0 0 28px" }}>
            Fais ton bilan en 5 minutes pour découvrir ton score {m.label.toLowerCase()} et recevoir des conseils vraiment personnalisés.
          </p>
          <Link href="/onboarding" style={{ textDecoration: "none" }}>
            <div style={{ padding: "14px 0", borderRadius: 100, background: "#2b5ce6", boxShadow: "0 4px 24px rgba(43,92,230,0.4)", fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 14 }}>
              Faire mon bilan maintenant →
            </div>
          </Link>
          <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t30)", margin: 0 }}>
            Gratuit · Sans inscription · 5 minutes
          </p>
        </div>
      </main>
    );
  }

  const meta = DIMENSION_META[dimensionParam];
  const badge = scoreBadge(score);

  return (
    <main style={{ minHeight: "100vh", background: c.mainBg, paddingBottom: 80, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: `${meta.colorBg}`, size: 500 },
        { bottom: "-10%", left: "-5%", color: "rgba(43,92,230,0.08)", size: 400 },
      ]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>

        {/* Nav */}
        <div style={{ paddingTop: 80, paddingBottom: isExampleMode ? 16 : 32 }}>
          <Link href={isExampleMode ? "/exemple-rapport" : "/results"} style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t40)", cursor: "pointer" }}>
              {isExampleMode ? "← Exemple de rapport" : "← Mes résultats"}
            </span>
          </Link>
        </div>

        {/* Premium bandeau */}
        <div style={{ marginBottom: 20, padding: "10px 16px", borderRadius: 12, background: premium ? "rgba(245,158,11,0.08)" : "rgba(43,92,230,0.08)", border: `0.5px solid ${premium ? "rgba(245,158,11,0.25)" : "rgba(43,92,230,0.20)"}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontFamily: T.b, fontSize: 12, color: premium ? "rgba(245,158,11,0.85)" : "var(--t55)", margin: 0, lineHeight: 1.5 }}>
            {premium ? "👑 Offert en beta — tous les conseils détaillés sont débloqués" : "💎 Conseils détaillés disponibles avec le premium — offert en beta"}
          </p>
          {!premium && (
            <Link href="/premium" style={{ textDecoration: "none", flexShrink: 0 }}>
              <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 12, color: "#7c9fff" }}>Activer →</span>
            </Link>
          )}
        </div>

        {/* Bandeau exemple */}
        {isExampleMode && (
          <div style={{
            marginBottom: 20, padding: "10px 16px", borderRadius: 12,
            background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.20)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontFamily: T.b, fontSize: 12, color: "rgba(168,192,255,0.75)" }}>
              Ceci est un exemple basé sur le profil de Thomas
            </span>
          </div>
        )}

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

          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "var(--text-primary)", margin: "0 0 14px", lineHeight: 1.2 }}>
            Ton plan {meta.label.toLowerCase()}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{
              padding: "4px 14px", borderRadius: 100,
              background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)",
            }}>
              <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: meta.color }}>{score}</span>
              <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t40)", marginLeft: 4 }}>/100</span>
            </div>
            <div style={{
              padding: "5px 14px", borderRadius: 100,
              background: badge.bg, border: `0.5px solid ${badge.border}`,
            }}>
              <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 12, color: badge.color }}>{badge.label}</span>
            </div>
          </div>

          {/* Job-specific score interpretation */}
          {(() => {
            const jc = getJobContent(jobType);
            const dimKey = meta.scoreKey;
            const interp = getScoreInterpretation(jc, dimKey, score);
            if (!interp) return null;
            return (
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t60)", lineHeight: 1.65, margin: "14px 0 0", borderTop: "0.5px solid var(--border)", paddingTop: 14 }}>
                {jc.emoji} {interp}
              </p>
            );
          })()}
        </motion.div>

        {/* Job intro card (non-bureau profiles) */}
        {jobType !== "bureau" && (() => {
          const jc = getJobContent(jobType);
          return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              style={{ borderRadius: 16, padding: "14px 18px", marginBottom: 16, background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.18)", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{jc.emoji}</span>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t70)", lineHeight: 1.65, margin: 0 }}>{jc.intro}</p>
            </motion.div>
          );
        })()}

        {/* ── CE QU'ON A DÉTECTÉ ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            borderRadius: 20, padding: "20px 22px", marginBottom: 16,
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
          }}
        >
          <SectionTitle>🔍 Ce qu'on a détecté</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayDetected.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  flexShrink: 0, width: 6, height: 6, borderRadius: "50%",
                  background: meta.color, marginTop: 7,
                }} />
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t75)", lineHeight: 1.65, margin: 0 }}>
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
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
          }}
        >
          <SectionTitle>⚡ Ce que ça provoque</SectionTitle>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.75, margin: 0 }}>
            {displayConsequences}
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
            {displayTips.map((tip, i) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                style={{
                  borderRadius: 16, padding: "14px 18px",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  background: "var(--bg-card)", border: "0.5px solid var(--border)",
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
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.65, margin: 0 }}>
                  {tip.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── BLOC A : ACTIONS IMMÉDIATES ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          style={{
            borderRadius: 20, padding: "20px 22px", marginBottom: 16,
            background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.18)",
          }}
        >
          <SectionTitle>⚡ Actions immédiates</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayImmediate.map((action, i) => {
              const isChecked = checked[i];
              return (
                <div
                  key={i}
                  onClick={() => setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                    borderRadius: 12, cursor: "pointer",
                    background: isChecked ? "rgba(116,198,157,0.10)" : "rgba(255,255,255,0.04)",
                    border: isChecked ? "0.5px solid rgba(116,198,157,0.30)" : "0.5px solid var(--border)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: isChecked ? "#74c69d" : "rgba(255,255,255,0.06)",
                    border: isChecked ? "none" : "0.5px solid rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isChecked && <span style={{ fontSize: 11, color: "var(--bg-primary)", fontWeight: 900 }}>✓</span>}
                  </div>
                  <p style={{
                    fontFamily: T.b, fontSize: 13, margin: 0,
                    color: isChecked ? "var(--t45)" : "var(--text-primary)",
                    textDecoration: isChecked ? "line-through" : "none",
                  }}>{action}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── BLOC B : PROGRAMME D'EXERCICES ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          style={{
            borderRadius: 20, padding: "20px 22px", marginBottom: 16,
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
          }}
        >
          <SectionTitle>🧘 Ton programme d'exercices</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {displayExerciseIds.map(id => {
              const ex = EXERCISES[id];
              if (!ex) return null;
              return <ExercisePreview key={id} ex={ex} color={meta.color} />;
            })}
          </div>
          <Link href={`/mobilite?program=${displayProgramId}`} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "13px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "#2b5ce6", boxShadow: "0 4px 20px rgba(43,92,230,0.35)",
              fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff",
            }}>
              Lancer le programme complet →
            </div>
          </Link>
        </motion.div>

        {/* ── BLOC C : PRODUITS ── */}
        {displayProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            style={{ marginBottom: 20 }}
          >
            <SectionTitle>🛒 Produits qui aident</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayProducts.map((p, i: number) => (
                <ProductCard key={i} p={p} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── LE SAVIEZ-VOUS ── */}
        {(() => {
          const jc = getJobContent(jobType);
          const facts = jc.risk_profile.did_you_know;
          if (!facts.length) return null;
          return (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
              style={{ borderRadius: 20, padding: "20px 22px", marginBottom: 16, background: "rgba(167,139,250,0.06)", border: "0.5px solid rgba(167,139,250,0.18)" }}>
              <SectionTitle>💡 Le saviez-vous ?</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {facts.map((fact, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "#a78bfa", fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                    <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.6, margin: 0 }}>{fact}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* ── BOTTOM ACTIONS ── */}
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/results" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "var(--bg-card-2)", border: "0.5px solid var(--border-2)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)",
            }}>
              ← Mes résultats
            </div>
          </Link>
          <Link href="/mobilite" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: meta.colorBg, border: `0.5px solid ${meta.colorBorder}`,
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: meta.color,
            }}>
              🧘 Mes exercices
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
