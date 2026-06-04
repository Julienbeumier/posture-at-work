"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

const pillars = [
  {
    icon: "💻",
    title: "Setup & Ergonomie",
    desc: "Écran, clavier, chaise — chaque centimètre compte pour ta colonne.",
    bg: "rgba(43,92,230,0.08)",
    border: "rgba(43,92,230,0.18)",
    titleColor: "#a8c0ff",
    blob: "rgba(43,92,230,0.25)",
    iconBg: "rgba(43,92,230,0.18)",
  },
  {
    icon: "🩺",
    title: "Douleurs & Inconfort",
    desc: "Localise tes zones de tension et comprends leur origine réelle.",
    bg: "rgba(226,75,74,0.07)",
    border: "rgba(226,75,74,0.15)",
    titleColor: "#f09595",
    blob: "rgba(226,75,74,0.3)",
    iconBg: "rgba(226,75,74,0.18)",
  },
  {
    icon: "⏱️",
    title: "Habitudes de travail",
    desc: "Pauses, posture spontanée, téléphone — tes automatismes te trahissent.",
    bg: "rgba(212,98,42,0.07)",
    border: "rgba(212,98,42,0.15)",
    titleColor: "#f4a261",
    blob: "rgba(212,98,42,0.25)",
    iconBg: "rgba(212,98,42,0.18)",
  },
  {
    icon: "🌙",
    title: "Sommeil & Énergie",
    desc: "La fatigue amplifie toutes les douleurs. Hydratation et récupération.",
    bg: "rgba(45,106,79,0.08)",
    border: "rgba(45,106,79,0.18)",
    titleColor: "#74c69d",
    blob: "rgba(45,106,79,0.3)",
    iconBg: "rgba(45,106,79,0.18)",
  },
  {
    icon: "🍽️",
    title: "Nutrition & Vitalité",
    desc: "Ce que tu manges à midi conditionne ton après-midi entier.",
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.15)",
    titleColor: "#a78bfa",
    blob: "rgba(124,58,237,0.25)",
    iconBg: "rgba(124,58,237,0.18)",
  },
  {
    icon: "🤖",
    title: "Analyse IA posturale",
    desc: "Claude Vision analyse ta posture réelle en temps réel via ta caméra.",
    bg: "rgba(29,158,117,0.07)",
    border: "rgba(29,158,117,0.15)",
    titleColor: "#5dcaa5",
    blob: "rgba(29,158,117,0.25)",
    iconBg: "rgba(29,158,117,0.18)",
  },
];

const TESTIMONIALS = [
  {
    initials: "MA",
    color: "#2b5ce6",
    nom: "Marie A.",
    role: "UX Designer · Paris",
    emoji: "💻",
    texte: "En 3 semaines j'ai arrêté d'avoir mal au cou. Juste en suivant les reco PAW — sans rien acheter de plus.",
    score: "38 → 71 pts",
  },
  {
    initials: "SL",
    color: "#d4622a",
    nom: "Sophie L.",
    role: "Caissière · Lyon",
    emoji: "🏪",
    texte: "Je travaille en caisse depuis 8 ans. PAW m'a fait réaliser que mes douleurs aux pieds venaient de mes chaussures. Changement de semelles + tapis = fini les douleurs.",
    score: "29 → 58 pts",
  },
  {
    initials: "RD",
    color: "#2d6a4f",
    nom: "Romain D.",
    role: "Responsable RH · Bordeaux",
    emoji: "🏢",
    texte: "J'ai fait faire le bilan PAW à toute mon équipe. En un mois, les plaintes de dos ont diminué de moitié.",
    score: "Équipe de 12",
  },
];

const stats = [
  { value: "5min", label: "pour ton bilan complet" },
  { value: "360°", label: "analyse corps & environnement" },
];

const scorePreview = [
  { label: "Setup", score: 72, color: "#2b5ce6" },
  { label: "Douleurs", score: 38, color: "#e24b4a" },
  { label: "Habitudes", score: 55, color: "#d4622a" },
  { label: "Sommeil", score: 80, color: "#2d6a4f" },
  { label: "Nutrition", score: 45, color: "#7c3aed" },
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  };
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PostureAtWork",
  url: "https://posture-at-work.vercel.app",
  description: "Bilan ergonomique complet en 5 minutes pour les travailleurs sédentaires et debout.",
  applicationCategory: "HealthApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  inLanguage: "fr",
  author: { "@type": "Organization", name: "PostureAtWork" },
};

export default function LandingClient() {
  return (
    <main style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <BackgroundBlobs />

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 760,
          margin: "0 auto",
          padding: "140px 24px 80px",
          textAlign: "center",
        }}
      >
        <motion.div {...fadeUp(0)} style={{ marginBottom: 28 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 18px",
              borderRadius: 100,
              background: "rgba(43,92,230,0.15)",
              color: "#a8c0ff",
              fontSize: 12,
              fontFamily: T.h,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              border: "1px solid rgba(43,92,230,0.25)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#74c69d",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            Bilan santé gratuit · Résultats immédiats
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          style={{
            fontFamily: T.h,
            fontWeight: 900,
            fontSize: "clamp(32px, 5vw, 54px)",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
            color: "var(--text-primary)",
            marginBottom: 20,
          }}
        >
          8h assis par jour.
          <br />
          Ton corps mérite{" "}
          <span style={{ color: "#7c9fff" }}>mieux.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          style={{
            fontFamily: T.b,
            fontSize: 17,
            lineHeight: 1.7,
            color: "var(--t65)",
            maxWidth: 520,
            margin: "0 auto 36px",
          }}
        >
          En 5 minutes, obtiens un screening complet de ta santé au travail —
          posture, douleurs, énergie, nutrition — et des conseils actionnables
          adaptés à ta situation réelle.
        </motion.p>

        <motion.div
          {...fadeUp(0.3)}
          style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
        >
          <Link href="/onboarding" style={{ textDecoration: "none", width: "100%", maxWidth: 380 }}>
            <div
              style={{
                display: "block",
                width: "100%",
                padding: "18px 24px",
                borderRadius: 100,
                background: "#2b5ce6",
                color: "#ffffff",
                fontFamily: T.h,
                fontWeight: 800,
                fontSize: 16,
                textAlign: "center",
                cursor: "pointer",
                boxShadow: "0 0 40px rgba(43,92,230,0.4)",
              }}
            >
              Commencer mon bilan gratuit →
            </div>
          </Link>
          <Link href="/exemple-rapport" style={{ textDecoration: "none", width: "100%", maxWidth: 380 }}>
            <div
              style={{
                display: "block",
                width: "100%",
                padding: "16px 24px",
                borderRadius: 100,
                background: "transparent",
                color: "rgba(255,255,255,0.85)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                fontFamily: T.h,
                fontWeight: 700,
                fontSize: 15,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              Voir un exemple de rapport
            </div>
          </Link>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ display: "flex", gap: 10 }}>
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "28px 20px",
                borderRadius: 18,
                background: "var(--bg-card-2)",
                border: "0.5px solid var(--border)",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: T.h, fontWeight: 900, fontSize: 36, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.5px" }}>
                {s.value}
              </div>
              <div style={{ color: "var(--t40)", fontSize: 13, fontFamily: T.b }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── PILLARS ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 12 }}>
            6 dimensions analysées
          </h2>
          <p style={{ color: "var(--t65)", fontFamily: T.b, fontSize: 15 }}>
            Une vue complète de ta santé au travail — pas juste la posture.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.07)}
              style={{ padding: "24px", borderRadius: 20, background: p.bg, border: `0.5px solid ${p.border}`, position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: p.blob, filter: "blur(30px)", opacity: 0.6 }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: p.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14, position: "relative" }}>
                {p.icon}
              </div>
              <h3 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: p.titleColor, marginBottom: 8, position: "relative" }}>
                {p.title}
              </h3>
              <p style={{ color: "var(--t55)", fontSize: 13, lineHeight: 1.6, fontFamily: T.b, position: "relative" }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SCORE PREVIEW ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ padding: "36px 32px", borderRadius: 22, background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.18)" }}>
          <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--t40)", marginBottom: 20 }}>
            Exemple de rapport
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(43,92,230,0.12)", border: "3px solid rgba(43,92,230,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "#a8c0ff" }}>58</span>
            </div>
            <div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 4 }}>Score global</p>
              <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(212,98,42,0.15)", color: "#f4a261", border: "1px solid rgba(212,98,42,0.3)", fontSize: 12, fontFamily: T.h, fontWeight: 700 }}>
                Zones à améliorer
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {scorePreview.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 72, color: "var(--t55)", fontSize: 12, fontFamily: T.b, flexShrink: 0 }}>{s.label}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 100, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ width: `${s.score}%`, height: "100%", borderRadius: 100, background: s.score >= 70 ? "#2b5ce6" : s.score >= 50 ? "#d4622a" : "#e24b4a" }} />
                </div>
                <span style={{ width: 30, textAlign: "right", fontFamily: T.h, fontWeight: 700, fontSize: 12, color: s.score >= 70 ? "#a8c0ff" : s.score >= 50 ? "#f4a261" : "#f09595" }}>{s.score}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 10 }}>
            Ils ont changé leurs habitudes
          </h2>
          <p style={{ color: "var(--t50)", fontFamily: T.b, fontSize: 14 }}>Des résultats concrets, en quelques semaines.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} style={{ padding: "24px", borderRadius: 18, background: "var(--bg-card)", border: "0.5px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 48, color: t.color, lineHeight: 1, opacity: 0.7, display: "block", marginBottom: 4 }}>&ldquo;</span>
                <p style={{ fontFamily: T.b, fontSize: 14, lineHeight: 1.7, color: "var(--t82)", fontStyle: "italic" }}>{t.texte}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `${t.color}22`, border: `1.5px solid ${t.color}55`, display: "flex", alignItems: "center", justifyContent: "center", color: t.color, fontFamily: T.h, fontWeight: 800, fontSize: 12 }}>
                  {t.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "var(--text-primary)", fontFamily: T.h, fontWeight: 700, fontSize: 13 }}>{t.nom} <span style={{ fontSize: 14 }}>{t.emoji}</span></p>
                  <p style={{ color: "var(--t38)", fontFamily: T.b, fontSize: 11 }}>{t.role}</p>
                </div>
              </div>
              <div>
                <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, background: `${t.color}18`, border: `1px solid ${t.color}35`, color: t.color, fontFamily: T.h, fontWeight: 700, fontSize: 11 }}>
                  Score : {t.score}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ padding: "48px 36px", borderRadius: 22, background: "#2b5ce6", textAlign: "center" }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "#fff", letterSpacing: "-0.5px", marginBottom: 12 }}>
            Prêt à prendre soin de toi ?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontFamily: T.b, fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            En 5 minutes, tu sauras exactement où tu en es et quoi faire.
          </p>
          <Link href="/questionnaire" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-block", padding: "16px 36px", borderRadius: 100, background: "#ffffff", color: "#2b5ce6", fontFamily: T.h, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Commencer mon bilan gratuit →
            </div>
          </Link>
        </motion.div>
      </section>

      <footer style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px 40px", color: "var(--t25)", fontFamily: T.b, fontSize: 13 }}>
        PostureAtWork — Screening santé pour les travailleurs sédentaires
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </main>
  );
}
