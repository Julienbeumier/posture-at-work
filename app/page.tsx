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
  },
  {
    icon: "🩺",
    title: "Douleurs & Inconfort",
    desc: "Localise tes zones de tension et comprends leur origine réelle.",
    bg: "rgba(226,75,74,0.07)",
    border: "rgba(226,75,74,0.15)",
    titleColor: "#f09595",
    blob: "rgba(226,75,74,0.3)",
  },
  {
    icon: "⏱️",
    title: "Habitudes de travail",
    desc: "Pauses, posture spontanée, téléphone — tes automatismes te trahissent.",
    bg: "rgba(212,98,42,0.07)",
    border: "rgba(212,98,42,0.15)",
    titleColor: "#f4a261",
    blob: "rgba(212,98,42,0.25)",
  },
  {
    icon: "🌙",
    title: "Sommeil & Énergie",
    desc: "La fatigue amplifie toutes les douleurs. Hydratation et récupération.",
    bg: "rgba(45,106,79,0.08)",
    border: "rgba(45,106,79,0.18)",
    titleColor: "#74c69d",
    blob: "rgba(45,106,79,0.3)",
  },
  {
    icon: "🍽️",
    title: "Nutrition & Vitalité",
    desc: "Ce que tu manges à midi conditionne ton après-midi entier.",
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.15)",
    titleColor: "#a78bfa",
    blob: "rgba(124,58,237,0.25)",
  },
  {
    icon: "🤖",
    title: "Analyse IA posturale",
    desc: "Claude Vision analyse ta posture réelle en temps réel via ta caméra.",
    bg: "rgba(29,158,117,0.07)",
    border: "rgba(29,158,117,0.15)",
    titleColor: "#5dcaa5",
    blob: "rgba(29,158,117,0.25)",
  },
];

const stats = [
  { value: "5min", label: "pour ton bilan complet" },
  { value: "360°", label: "analyse corps & environnement" },
  { value: "6", label: "dimensions analysées" },
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

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", overflowX: "hidden" }}>
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
        {/* Chip */}
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

        {/* H1 */}
        <motion.h1
          {...fadeUp(0.1)}
          style={{
            fontFamily: T.h,
            fontWeight: 900,
            fontSize: "clamp(32px, 5vw, 54px)",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
            color: "#f0f0fa",
            marginBottom: 20,
          }}
        >
          8h assis par jour.
          <br />
          Ton corps mérite{" "}
          <span style={{ color: "#7c9fff" }}>mieux.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.2)}
          style={{
            fontFamily: T.b,
            fontSize: 17,
            lineHeight: 1.7,
            color: "rgba(220,220,245,0.65)",
            maxWidth: 520,
            margin: "0 auto 36px",
          }}
        >
          En 5 minutes, obtiens un screening complet de ta santé au travail —
          posture, douleurs, énergie, nutrition — et des conseils actionnables
          adaptés à ta situation réelle.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.3)}
          style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
        >
          <Link href="/questionnaire" style={{ textDecoration: "none", width: "100%", maxWidth: 380 }}>
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
                padding: "15px 24px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(255,255,255,0.22)",
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
        <motion.div
          {...fadeUp(0)}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className={i === 2 ? "hidden md:block" : ""}
              style={{
                padding: "28px 20px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: T.h,
                  fontWeight: 900,
                  fontSize: 36,
                  color: "#f0f0fa",
                  marginBottom: 6,
                  letterSpacing: "-0.5px",
                }}
              >
                {s.value}
              </div>
              <div style={{ color: "rgba(220,220,245,0.40)", fontSize: 13, fontFamily: T.b }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── PILLARS ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: T.h,
              fontWeight: 900,
              fontSize: 32,
              color: "#f0f0fa",
              letterSpacing: "-0.5px",
              marginBottom: 12,
            }}
          >
            6 dimensions analysées
          </h2>
          <p style={{ color: "rgba(220,220,245,0.65)", fontFamily: T.b, fontSize: 15 }}>
            Une vue complète de ta santé au travail — pas juste la posture.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.07)}
              style={{
                padding: "24px",
                borderRadius: 20,
                background: p.bg,
                border: `0.5px solid ${p.border}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Blob */}
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: p.blob,
                  filter: "blur(30px)",
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 14,
                  position: "relative",
                }}
              >
                {p.icon}
              </div>
              <h3
                style={{
                  fontFamily: T.h,
                  fontWeight: 800,
                  fontSize: 16,
                  color: p.titleColor,
                  marginBottom: 8,
                  position: "relative",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  color: "rgba(220,220,245,0.55)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  fontFamily: T.b,
                  position: "relative",
                }}
              >
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SCORE PREVIEW ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div
          {...fadeUp(0)}
          style={{
            padding: "36px 32px",
            borderRadius: 22,
            background: "rgba(43,92,230,0.08)",
            border: "0.5px solid rgba(43,92,230,0.18)",
          }}
        >
          <p
            style={{
              fontFamily: T.h,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(220,220,245,0.40)",
              marginBottom: 20,
            }}
          >
            Exemple de rapport
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(43,92,230,0.12)",
                border: "3px solid rgba(43,92,230,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: T.h,
                  fontWeight: 900,
                  fontSize: 20,
                  color: "#a8c0ff",
                }}
              >
                58
              </span>
            </div>
            <div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: "#f0f0fa", marginBottom: 4 }}>
                Score global
              </p>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: "rgba(212,98,42,0.15)",
                  color: "#f4a261",
                  border: "1px solid rgba(212,98,42,0.3)",
                  fontSize: 12,
                  fontFamily: T.h,
                  fontWeight: 700,
                }}
              >
                Zones à améliorer
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {scorePreview.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 72,
                    color: "rgba(220,220,245,0.55)",
                    fontSize: 12,
                    fontFamily: T.b,
                    flexShrink: 0,
                  }}
                >
                  {s.label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 100,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${s.score}%`,
                      height: "100%",
                      borderRadius: 100,
                      background: s.score >= 70 ? "#2b5ce6" : s.score >= 50 ? "#d4622a" : "#e24b4a",
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 30,
                    textAlign: "right",
                    fontFamily: T.h,
                    fontWeight: 700,
                    fontSize: 12,
                    color: s.score >= 70 ? "#a8c0ff" : s.score >= 50 ? "#f4a261" : "#f09595",
                  }}
                >
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div
          {...fadeUp(0)}
          style={{
            padding: "36px 32px",
            borderRadius: 22,
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 40,
              color: "#2b5ce6",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            "
          </div>
          <p
            style={{
              fontFamily: T.b,
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(220,220,245,0.88)",
              marginBottom: 20,
              fontStyle: "italic",
            }}
          >
            En 5 minutes j'ai compris pourquoi j'avais mal au dos depuis 6 mois.
            Mon écran était trop bas et je travaillais depuis mon canapé le soir.
            Deux ajustements simples, la douleur a disparu en 2 semaines.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2b5ce6, #7c9fff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: T.h,
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              MA
            </div>
            <div>
              <p style={{ color: "#f0f0fa", fontFamily: T.h, fontWeight: 700, fontSize: 14 }}>
                Marie A.
              </p>
              <p style={{ color: "rgba(220,220,245,0.40)", fontFamily: T.b, fontSize: 12 }}>
                UX Designer · Paris
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div
          {...fadeUp(0)}
          style={{
            padding: "48px 36px",
            borderRadius: 22,
            background: "#2b5ce6",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: T.h,
              fontWeight: 900,
              fontSize: 28,
              color: "#fff",
              letterSpacing: "-0.5px",
              marginBottom: 12,
            }}
          >
            Prêt à prendre soin de toi ?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontFamily: T.b,
              fontSize: 15,
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            En 5 minutes, tu sauras exactement où tu en es et quoi faire.
          </p>
          <Link href="/questionnaire" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "inline-block",
                padding: "16px 36px",
                borderRadius: 100,
                background: "#ffffff",
                color: "#2b5ce6",
                fontFamily: T.h,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Commencer mon bilan gratuit →
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 24px 40px",
          color: "rgba(220,220,245,0.25)",
          fontFamily: T.b,
          fontSize: 13,
        }}
      >
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
