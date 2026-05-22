"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

// ─── Static data for Thomas ───────────────────────────────────────────────────

const SCORES = {
  global: 45,
  setup: 32,
  pain: 48,
  habits: 55,
  sleep_energy: 45,
  lifestyle: 60,
  nutrition: 30,
};

const SUB_SCORES = [
  { key: "setup",        label: "Setup & ergonomie",   emoji: "💻", score: 32, dimensionColor: "#7c9fff", dimensionPath: "/conseils/setup" },
  { key: "pain",         label: "Douleurs",             emoji: "🩺", score: 48, dimensionColor: "#f09595", dimensionPath: "/conseils/douleurs" },
  { key: "habits",       label: "Habitudes de travail", emoji: "⏱️", score: 55, dimensionColor: "#f4a261", dimensionPath: "/conseils/habitudes" },
  { key: "sleep_energy", label: "Sommeil & énergie",    emoji: "🌙", score: 45, dimensionColor: "#74c69d", dimensionPath: "/conseils/sommeil" },
  { key: "lifestyle",    label: "Mode de vie actif",    emoji: "🏃", score: 60, dimensionColor: "#5dcaa5", dimensionPath: "/conseils/lifestyle" },
  { key: "nutrition",    label: "Nutrition & énergie",  emoji: "🍽️", score: 30, dimensionColor: "#a78bfa", dimensionPath: "/conseils/nutrition" },
];

const RECS = [
  {
    priority: "urgent" as const,
    title: "Élève ton écran à hauteur des yeux",
    description: "Avec un laptop seul, ta tête s'incline de 35-45° vers le bas. À cette angle, ta nuque supporte jusqu'à 22 kg au lieu de 5 kg. Un support laptop à 30€ change tout — et un clavier externe est indispensable pour suivre.",
  },
  {
    priority: "urgent" as const,
    title: "Réduire les 9h assis quotidiennes",
    description: "Au-delà de 6h assis, les disques intervertébraux sont comprimés en continu et la circulation ralentit. Programme une alarme toutes les 45 min pour te lever 2-3 minutes. C'est non négociable pour ta santé cardiovasculaire.",
  },
  {
    priority: "important" as const,
    title: "Améliore la qualité de ton sommeil",
    description: "6h de sommeil avec un réveil fatigué indique une qualité de récupération insuffisante. Le corps répare les tensions musculaires la nuit — si la récupération est incomplète, les douleurs s'amplifient. Commence par couper les écrans 1h avant de dormir.",
  },
  {
    priority: "important" as const,
    title: "Revoir tes habitudes alimentaires au bureau",
    description: "Manger devant l'écran + coup de barre systématique = cycle glucides rapides → pic glycémique → crash. Essaie une vraie pause déjeuner de 20 min hors écran avec un repas riche en protéines. L'énergie de l'après-midi sera significativement différente.",
  },
  {
    priority: "good" as const,
    title: "Continue le cardio hebdomadaire",
    description: "Ta séance hebdomadaire est un excellent point de départ. Elle compense en partie la sédentarité du bureau. Pour aller plus loin, ajoute 10 min de marche à l'heure du déjeuner les autres jours.",
  },
];

const EXERCISES = [
  {
    name: "Rétraction cervicale",
    target: "Nuque & muscles cervicaux profonds",
    duration: "10 rép. × 3",
    instruction: "Assis droit, rentre doucement le menton vers la gorge (double menton) sans baisser la tête. Tiens 3 secondes. Renforce les fléchisseurs profonds du cou contre la projection antérieure de la tête.",
    frequency: "Toutes les heures",
    emoji: "🧘",
  },
  {
    name: "Ouverture pectorale au mur",
    target: "Pectoraux & face antérieure des épaules",
    duration: "45 sec × 2",
    instruction: "Debout dans un angle, avant-bras en L contre le mur. Avance le buste jusqu'à sentir l'ouverture dans la poitrine. Contre les épaules enroulées vers l'avant typiques du laptop.",
    frequency: "Matin et soir",
    emoji: "🤸",
  },
  {
    name: "Cat-Cow assis",
    target: "Colonne vertébrale complète",
    duration: "10 cycles",
    instruction: "Sur ta chaise, mains sur les genoux. Expire en arrondissant le dos (chat). Inspire en creusant les lombaires, poitrine vers l'avant (vache). Mouvement lent et respiré.",
    frequency: "2× par jour",
    emoji: "🐱",
  },
];

const PRODUCTS = [
  {
    name: "Rehausseur écran GRIFEMA",
    reason: "Ton écran trop bas force ta tête à s'incliner — ça représente 12kg de charge supplémentaire sur ta nuque. Ce rehausseur règle ça en 2 minutes",
    priority: "haute" as const,
    url: "https://amzn.to/4uGNQ0y",
    price: "~28€",
    badge: "Priorité #1",
  },
  {
    name: "Support laptop ergonomique",
    reason: "Un laptop seul impose une flexion permanente de la nuque — ce support corrige ça immédiatement et libère la place pour un vrai clavier",
    priority: "haute" as const,
    url: "https://amzn.to/3RBejyl",
    price: "~30€",
    badge: "Indispensable",
  },
  {
    name: "Lunettes anti-lumière bleue Horus X",
    reason: "La lumière bleue le soir décale ton horloge biologique de 2h — ces lunettes bloquent ça pour retrouver un sommeil naturel",
    priority: "haute" as const,
    url: "https://amzn.to/4tws0fk",
    price: "~30€",
    badge: "Bestseller",
  },
];

const PRIORITY_STYLE = {
  urgent:    { bg: "rgba(240,149,149,0.08)", border: "rgba(240,149,149,0.25)", tagBg: "rgba(240,149,149,0.15)", tagColor: "#f09595", blob: "rgba(240,149,149,0.12)", label: "Urgent" },
  important: { bg: "rgba(244,162,97,0.08)",  border: "rgba(244,162,97,0.22)",  tagBg: "rgba(244,162,97,0.15)",  tagColor: "#f4a261", blob: "rgba(244,162,97,0.12)", label: "Important" },
  good:      { bg: "rgba(116,198,157,0.07)", border: "rgba(116,198,157,0.2)",  tagBg: "rgba(116,198,157,0.15)", tagColor: "#74c69d", blob: "rgba(116,198,157,0.10)", label: "Bien joué" },
};

const PRIORITY_COLOR: Record<string, { color: string; label: string }> = {
  haute:     { color: "#f09595", label: "Priorité haute" },
  moyenne:   { color: "#f4a261", label: "Priorité moyenne" },
  optionnel: { color: "rgba(220,220,245,0.35)", label: "Optionnel" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreBarColor(score: number) {
  if (score >= 70) return "#74c69d";
  if (score >= 50) return "#f4a261";
  return "#f09595";
}

// ─── Score circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const step = score / 60;
      const iv = setInterval(() => {
        cur += step;
        if (cur >= score) { setDisplayed(score); clearInterval(iv); }
        else setDisplayed(Math.round(cur));
      }, 16);
      return () => clearInterval(iv);
    }, 300);
    return () => clearTimeout(t);
  }, [score]);

  const size = 140;
  const sw = 6;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (displayed / 100) * circ;
  const color = scoreBarColor(score);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(43,92,230,0.12)"
          stroke="rgba(43,92,230,0.35)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 38, color: "#a8c0ff", lineHeight: 1 }}>{displayed}</span>
        <span style={{ fontSize: 11, color: "rgba(220,220,245,0.45)", marginTop: 2 }}>/100</span>
      </div>
    </div>
  );
}

// ─── Sub-score bar ────────────────────────────────────────────────────────────

function SubScoreBar({ label, emoji, score, dimensionColor, dimensionPath, delay = 0 }: {
  label: string; emoji: string; score: number; dimensionColor: string; dimensionPath: string; delay?: number;
}) {
  const color = scoreBarColor(score);
  const [expanded, setExpanded] = useState(false);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const inc = score / 40;
      const iv = setInterval(() => {
        cur += inc;
        if (cur >= score) { setDisplayed(score); clearInterval(iv); }
        else setDisplayed(Math.round(cur));
      }, 20);
      return () => clearInterval(iv);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [score, delay]);

  const interpretations: Record<string, string> = {
    setup: "Laptop seul + écran trop bas = la combinaison la plus risquée pour les cervicales. Thomas génère 22 kg de tension sur la nuque en permanence.",
    pain: "Douleurs cervicales significatives (3/5) + lombalgie légère. À ce niveau, agir dans les 2 semaines évite la chronicisation.",
    habits: "9h assis/jour avec peu de pauses. La sédentarité prolongée comprime les disques et ralentit la circulation en continu.",
    sleep_energy: "6h de sommeil + réveil fatigué. La récupération incomplète amplifie la perception des douleurs et réduit la concentration.",
    lifestyle: "1 séance cardio/semaine est un bon point de départ mais insuffisant pour contrebalancer 45h de bureau sédentaire.",
    nutrition: "Déjeuner devant l'écran + coup de barre systématique = cycle glycémique qui épuise l'énergie cognitive l'après-midi.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div onClick={() => setExpanded((v) => !v)} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.75)" }}>
            <span>{emoji}</span><span>{label}</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 15, color }}>{displayed}</span>
            <span style={{ fontSize: 10, color: "rgba(220,220,245,0.3)" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden", marginBottom: 4 }}>
          <motion.div
            style={{ height: "100%", borderRadius: 100, background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: delay + 0.15, ease: "easeOut" }}
          />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.5)", lineHeight: 1.6, paddingTop: 4, paddingBottom: 2 }}
            >
              {interpretations[label === "Setup & ergonomie" ? "setup" :
                label === "Douleurs" ? "pain" :
                label === "Habitudes de travail" ? "habits" :
                label === "Sommeil & énergie" ? "sleep_energy" :
                label === "Mode de vie actif" ? "lifestyle" : "nutrition"]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Link href={dimensionPath} style={{ textDecoration: "none" }}>
        <span style={{ fontFamily: T.b, fontSize: 11, fontWeight: 600, color: dimensionColor, cursor: "pointer" }}>
          Voir mon plan détaillé →
        </span>
      </Link>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const THOMAS_SCORES = {
  global: 45, setup: 32, pain: 48, habits: 55,
  sleep_energy: 45, nutrition: 30, lifestyle: 60,
};

const THOMAS_ANSWERS = {
  q1: "laptop_seul", q2: "teletravail", q3: "non_trop_bas",
  q4: "moins_50cm", q5: "trackpad", q5b: "chaise_fixe", q5c: "pas_besoin",
  q6: 3, q7: 2, q8: 2, q9: 1, q10: 2,
  q11: "plusieurs_mois", q12: "fin_journee", q12b: "partiellement",
  q13: 9, q14: "jamais", q14b: "cardio", q15: "tete_baissee",
  q16: "parfois", q17: 6, q18: "fatigue", q19: 1.5, q20: "souvent",
  q21: ["rien"], q22: "1x_semaine", q23: "jamais",
  q24: "affaissement", q25: 2,
  qn1: "devant_ecran", qn2: "coup_de_barre", qn3: "apres_midi", qn4: "sandwich",
};

function clearExampleMode() {
  sessionStorage.removeItem("paw_example_mode");
  localStorage.removeItem("paw_example_mode");
  // Ne pas toucher à paw_job_type — l'utilisateur le choisira dans l'onboarding
}

export default function ExempleRapportPage() {
  const [activeTab, setActiveTab] = useState<"recs" | "exercises">("recs");

  useEffect(() => {
    // Forcer TOUTES les données Thomas — ne jamais lire le sessionStorage existant
    localStorage.setItem("paw_job_type", "bureau");
    localStorage.setItem("paw_example_mode", "true");   // persistance inter-tab
    localStorage.setItem("paw_firstname", "Thomas");
    localStorage.setItem("paw_age", "26-35");
    localStorage.setItem("paw_hours_week", "35-40h");

    sessionStorage.setItem("paw_example_mode", "true"); // garde pour la session
    sessionStorage.setItem("postureatwork_scores", JSON.stringify(THOMAS_SCORES));
    sessionStorage.setItem("postureatwork_answers", JSON.stringify(THOMAS_ANSWERS));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", paddingBottom: 80, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: "rgba(43,92,230,0.14)", size: 500 },
        { top: "35%", left: "-8%", color: "rgba(240,149,149,0.07)", size: 380 },
        { bottom: "-10%", right: "10%", color: "rgba(244,162,97,0.07)", size: 420 },
      ]} />

      {/* ── BANDEAU EXEMPLE ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "10px 24px",
        background: "rgba(43,92,230,0.15)",
        borderBottom: "0.5px solid rgba(43,92,230,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        flexWrap: "wrap",
      }}>
        <span style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.75)" }}>
          📋 Ceci est un exemple de rapport
        </span>
        <span style={{ color: "rgba(220,220,245,0.3)", fontSize: 13 }}>—</span>
        <Link href="/questionnaire" onClick={clearExampleMode} style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: T.b, fontWeight: 700, fontSize: 13, color: "#7c9fff", cursor: "pointer",
          }}>
            Commencer mon bilan →
          </span>
        </Link>
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ paddingTop: 48, paddingBottom: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}
        >
          {/* Chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 100,
            background: "rgba(240,149,149,0.12)", border: "0.5px solid rgba(240,149,149,0.3)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f09595" }} />
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#f09595" }}>Rapport complet — Thomas, Dev web 32 ans</span>
          </div>

          <ScoreCircle score={SCORES.global} />

          <div style={{
            padding: "6px 16px", borderRadius: 100,
            background: "rgba(240,149,149,0.12)", border: "0.5px solid rgba(240,149,149,0.3)",
          }}>
            <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "#f09595" }}>Attention requise</span>
          </div>

          <div>
            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#f0f0fa", margin: 0, marginBottom: 8, lineHeight: 1.2 }}>
              Bilan PostureAtWork — Thomas
            </h1>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.55)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
              Ton corps envoie des signaux importants. Agis sur les priorités urgentes dès maintenant — la plupart se corrigent en moins de 2 semaines.
            </p>
          </div>
        </motion.div>

        {/* ── PROFIL ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            borderRadius: 20, padding: "18px 22px", marginBottom: 20,
            background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)",
            display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 32 }}>👨‍💻</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#f0f0fa", margin: "0 0 6px" }}>Thomas, 32 ans — Développeur web</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Laptop seul", "9h/jour assis", "Nuque 3/5", "Dort 6h", "1× cardio/sem."].map((tag) => (
                <span key={tag} style={{
                  padding: "3px 10px", borderRadius: 100,
                  background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)",
                  fontFamily: T.b, fontSize: 11, color: "rgba(220,220,245,0.55)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 6 SOUS-SCORES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            borderRadius: 24, padding: "24px 28px",
            background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#f0f0fa" }}>Ses 6 indicateurs</span>
            <span style={{ fontFamily: T.b, fontSize: 11, color: "rgba(220,220,245,0.3)" }}>Clique pour détails</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {SUB_SCORES.map(({ key, label, emoji, score, dimensionColor, dimensionPath }, i) => (
              <SubScoreBar
                key={key}
                label={label}
                emoji={emoji}
                score={score}
                dimensionColor={dimensionColor}
                dimensionPath={dimensionPath}
                delay={i * 0.15}
              />
            ))}
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "flex", gap: 4, padding: 4, borderRadius: 16,
            background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
            marginBottom: 16,
          }}
        >
          {(["recs", "exercises"] as const).map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, cursor: "pointer",
                background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent",
                color: activeTab === tab ? "#f0f0fa" : "rgba(220,220,245,0.35)",
                fontFamily: T.b, fontWeight: 600, fontSize: 13,
                transition: "all 0.2s ease",
              }}
            >
              {tab === "recs" ? "📋 Recommandations" : "🤸 Exercices"}
            </div>
          ))}
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          {activeTab === "recs" && (
            <motion.div
              key="recs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}
            >
              {RECS.map((rec, i) => {
                const cfg = PRIORITY_STYLE[rec.priority];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      borderRadius: 20, padding: "20px 22px", position: "relative", overflow: "hidden",
                      background: cfg.bg, border: `0.5px solid ${cfg.border}`,
                    }}
                  >
                    <div style={{
                      position: "absolute", top: -30, right: -30, width: 120, height: 120,
                      borderRadius: "50%", background: cfg.blob, filter: "blur(30px)", pointerEvents: "none",
                    }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f0f0fa", lineHeight: 1.3 }}>{rec.title}</span>
                        <span style={{
                          flexShrink: 0, padding: "3px 10px", borderRadius: 100,
                          background: cfg.tagBg, color: cfg.tagColor,
                          fontFamily: T.b, fontWeight: 600, fontSize: 11,
                        }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.6)", lineHeight: 1.65, margin: 0 }}>
                        {rec.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "exercises" && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}
            >
              {/* Actions immédiates Thomas */}
              <div style={{ borderRadius: 18, padding: "18px 20px", background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.18)" }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#7c9fff", margin: "0 0 12px" }}>⚡ Actions immédiates</p>
                {[
                  "Surélève ton écran avec des livres — maintenant",
                  "Fais la rétraction cervicale : 10 reps, maintenant",
                ].map((action, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)", marginBottom: i === 0 ? 8 : 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                    <p style={{ fontFamily: T.b, fontSize: 13, color: "#f0f0fa", margin: 0 }}>{action}</p>
                  </div>
                ))}
              </div>
              {/* Programme exercices */}
              <div style={{ borderRadius: 18, padding: "18px 20px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f0f0fa", margin: "0 0 12px" }}>🧘 Programme nuque & dos</p>
                {[
                  { emoji: "🦆", name: "Rétraction cervicale", reps: "10 rép. × 5 sec", zone: "Nuque" },
                  { emoji: "↔️", name: "Inclinaison latérale nuque", reps: "30 sec par côté", zone: "Cervicales" },
                  { emoji: "🌿", name: "Flexion lombaire", reps: "45 sec × 2", zone: "Bas du dos" },
                ].map((ex, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{ex.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "#f0f0fa", margin: 0 }}>{ex.name}</p>
                      <p style={{ fontFamily: T.b, fontSize: 11, color: "rgba(220,220,245,0.40)", margin: 0 }}>{ex.reps}</p>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(226,75,74,0.12)", fontFamily: T.b, fontSize: 10, color: "#f09595" }}>{ex.zone}</span>
                  </div>
                ))}
                <Link href="/mobilite?program=nuque" style={{ textDecoration: "none" }}>
                  <div style={{ marginTop: 14, padding: "12px 0", borderRadius: 100, textAlign: "center", background: "#2b5ce6", boxShadow: "0 4px 16px rgba(43,92,230,0.35)", fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "#fff" }}>
                    Lancer le programme complet →
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PRODUITS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginBottom: 20 }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#f0f0fa", marginBottom: 12 }}>🛍️ Produits recommandés</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PRODUCTS.map((p, i) => {
              const pCfg = PRIORITY_COLOR[p.priority] ?? PRIORITY_COLOR.optionnel;
              return (
                <div key={i} style={{ borderRadius: 16, padding: "16px 18px", position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                  {p.badge && (
                    <span style={{ position: "absolute", top: 12, right: 12, padding: "2px 9px", borderRadius: 100, fontFamily: T.b, fontWeight: 700, fontSize: 10, color: "#74c69d", background: "rgba(116,198,157,0.15)", border: "0.5px solid rgba(116,198,157,0.3)" }}>
                      {p.badge}
                    </span>
                  )}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(43,92,230,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🛒</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f0f0fa" }}>{p.name}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 100, fontFamily: T.b, fontWeight: 600, fontSize: 10, color: pCfg.color, background: `${pCfg.color}18` }}>{pCfg.label}</span>
                      </div>
                      <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.50)", lineHeight: 1.6, margin: "0 0 12px" }}>{p.reason}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f0f0fa" }}>{p.price}</span>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", borderRadius: 100, textDecoration: "none", background: "#2b5ce6", boxShadow: "0 2px 12px rgba(43,92,230,0.35)", fontFamily: T.b, fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0 }}>
                          Voir sur Amazon →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── MOT FINAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            borderRadius: 24, padding: "24px 26px", marginBottom: 16,
            background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(43,92,230,0.08))",
            border: "0.5px solid rgba(167,139,250,0.2)",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 10 }}>🩺</div>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#f0f0fa", marginBottom: 8 }}>Mot du kiné IA</p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.65)", lineHeight: 1.7, margin: 0 }}>
            Thomas, ton profil est très représentatif des développeurs qui travaillent sur laptop depuis chez eux. Les 2 premières actions — support laptop et élimination du déjeuner-écran — auront un impact immédiat sur ta nuque et ton énergie de l'après-midi. Commence par là cette semaine. Le reste suivra naturellement.
          </p>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            borderRadius: 24, padding: "24px 26px", marginBottom: 16, textAlign: "center",
            background: "linear-gradient(135deg, rgba(43,92,230,0.12), rgba(43,92,230,0.07))",
            border: "0.5px solid rgba(43,92,230,0.28)",
          }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "#f0f0fa", marginBottom: 8 }}>
            Prêt à obtenir ton vrai bilan ?
          </p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.55)", lineHeight: 1.65, marginBottom: 20 }}>
            5 minutes. Gratuit. Personnalisé selon tes vraies réponses.
          </p>
          <Link href="/questionnaire" onClick={clearExampleMode} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "14px 0", borderRadius: 100, cursor: "pointer",
              background: "#2b5ce6", boxShadow: "0 4px 24px rgba(43,92,230,0.4)",
              fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff",
            }}>
              Commencer mon bilan gratuit →
            </div>
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
