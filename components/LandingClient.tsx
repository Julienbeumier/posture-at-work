"use client";

import { useState, useEffect } from "react";
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
    icon: "🏃",
    title: "Lifestyle & Bien-être",
    desc: "Activité physique, stress chronique, cortisol — le mode de vie amplifie ou atténue toutes les douleurs musculaires.",
    bg: "rgba(29,158,117,0.07)",
    border: "rgba(29,158,117,0.15)",
    titleColor: "#1d9e75",
    blob: "rgba(29,158,117,0.25)",
    iconBg: "rgba(29,158,117,0.18)",
  },
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
  url: "https://postureatwork.com",
  description: "Bilan ergonomique complet en 5 minutes pour les travailleurs sédentaires et debout.",
  applicationCategory: "HealthApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  inLanguage: "fr",
  author: { "@type": "Organization", name: "PostureAtWork" },
};

function FAQ({ isMobile }: { isMobile: boolean }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    {
      q: "C'est quoi exactement l'analyse vidéo IA ?",
      a: "Tu te filmes pendant 40 secondes avec ton téléphone. Notre IA analyse ta posture réelle — projection de tête, épaules enroulées, position lombaire — et croise ces données avec tes réponses. Résultat : un diagnostic postural précis, comme si un kiné t'observait travailler."
    },
    {
      q: "Mes données de santé sont-elles confidentielles ?",
      a: "Oui. Tes données sont chiffrées, hébergées en Europe et ne sont jamais vendues. Tu peux supprimer ton compte et toutes tes données à tout moment depuis ton dashboard. PAW est conforme RGPD."
    },
    {
      q: "C'est gratuit ?",
      a: "Le questionnaire complet (30 questions) et tes 3 premiers scores sont gratuits. Pour débloquer les 6 dimensions complètes, l'analyse vidéo IA, les conseils détaillés, les exercices et le rapport PDF, c'est 19,99€ en accès à vie — moins cher qu'une séance kiné."
    },
    {
      q: "Ça fonctionne aussi si je travaille debout ?",
      a: "Oui — PAW est conçu pour les deux profils. Profil Bureau pour les sédentaires, Profil Debout pour les métiers actifs (caissiers, soignants, magasiniers, serveurs...). Questions, conseils et exercices sont complètement différents selon ton poste."
    },
    {
      q: "Est-ce que PAW remplace un médecin ou un kinésithérapeute ?",
      a: "Non. PAW est un outil de prévention — pas un diagnostic médical. Si tu as des douleurs importantes, des fourmillements ou des douleurs nocturnes, consulte un professionnel de santé. PAW t'aide à identifier les causes probables et à agir avant que ça empire."
    },
  ];

  return (
    <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
      <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>
          Questions fréquentes
        </p>
        <h2 style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900, fontSize: isMobile ? 24 : 30, color: "var(--text-primary)", marginBottom: 0, letterSpacing: "-0.5px" }}>
          Tout ce que tu veux savoir
        </h2>
      </motion.div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {faqs.map((faq, i) => (
          <motion.div key={i} {...fadeUp(i * 0.05)} style={{
            borderRadius: 16, overflow: "hidden",
            border: `0.5px solid ${openFaq === i ? "rgba(43,92,230,0.3)" : "var(--border)"}`,
            background: openFaq === i ? "rgba(43,92,230,0.04)" : "var(--bg-card)",
            transition: "background 0.2s, border 0.2s",
          }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: "100%", padding: "18px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: isMobile ? 14 : 15, color: "var(--text-primary)", lineHeight: 1.4 }}>
                {faq.q}
              </span>
              <span style={{
                fontSize: 20, color: "#2b5ce6", flexShrink: 0, lineHeight: 1,
                transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.2s", display: "inline-block",
              }}>+</span>
            </button>
            {openFaq === i && (
              <div style={{ padding: "0 20px 18px" }}>
                <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "var(--t60)", lineHeight: 1.75, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function LandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <main style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <BackgroundBlobs />

      {/* ── HERO ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: isMobile ? "100px 16px 60px" : "140px 24px 80px", textAlign: "center" }}>
        <motion.div {...fadeUp(0)} style={{ marginBottom: 28 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 18px", borderRadius: 100,
            background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.3)",
            color: "#7c9fff", fontSize: 12, fontFamily: T.h, fontWeight: 700, letterSpacing: "0.04em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2b5ce6", display: "inline-block" }} />
            Bilan clinique. Résultats immédiats.
          </span>
        </motion.div>

        <motion.h1 {...fadeUp(0.05)} style={{
          fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? "28px" : "clamp(36px, 5vw, 52px)",
          lineHeight: 1.1, color: "var(--text-primary)", margin: "0 0 20px", letterSpacing: "-1px",
        }}>
          Nuque, dos, épaules.<br />
          <span style={{ color: "#2b5ce6" }}>Ton corps te donne des signaux.</span><br />
          Posture At Work t&apos;aide à les comprendre.
        </motion.h1>

        <motion.p {...fadeUp(0.1)} style={{
          fontSize: 16, color: "var(--t60)", lineHeight: 1.75,
          maxWidth: 520, margin: "0 auto 36px", fontFamily: T.b,
        }}>
          8h au bureau ou 8h debout — peu importe ton poste. C&apos;est là que tout commence : les tensions, les douleurs, la fatigue chronique. PAW analyse ton environnement de travail et te dit exactement ce qui ne va pas.
        </motion.p>

        <motion.div {...fadeUp(0.15)} style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/onboarding" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "14px 28px", borderRadius: 100, background: "#2b5ce6",
              color: "#fff", fontFamily: T.h, fontWeight: 800, fontSize: 15, cursor: "pointer",
              boxShadow: "0 4px 24px rgba(43,92,230,0.35)",
            }}>
              Faire mon bilan →
            </div>
          </Link>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          borderRadius: 20,
          overflow: isMobile ? "visible" : "hidden",
          border: "0.5px solid var(--border)",
          background: "var(--bg-card)",
          marginBottom: isMobile ? 48 : 80,
          gap: isMobile ? 1 : 0,
        }}>
          {[
            { value: "88%", label: "des maladies professionnelles sont des TMS", source: "Ameli, 2024" },
            { value: "5min", label: "pour un bilan complet de ta santé au travail", source: null },
            { value: "360°", label: "posture, douleurs, sommeil, nutrition, habitudes", source: null },
          ].map((s, i) => (
            <div key={i} style={{
              padding: isMobile ? "20px 16px" : "32px 24px",
              textAlign: "center",
              borderRight: !isMobile && i < 2 ? "0.5px solid var(--border)" : "none",
              borderBottom: isMobile && i < 2 ? "0.5px solid var(--border)" : "none",
              minWidth: 0,
              wordBreak: "break-word" as const,
            }}>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 28 : 34, color: "#2b5ce6", margin: "0 0 6px" }}>{s.value}</p>
              <p style={{ fontFamily: T.b, fontSize: isMobile ? 12 : 13, color: "var(--t45)", lineHeight: 1.5, margin: 0 }}>{s.label}</p>
              {s.source && <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t30)", margin: "4px 0 0" }}>Source : {s.source}</p>}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 14 }}>Simple & rapide</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 10 }}>
            Comment ça marche ?
          </h2>
          <p style={{ color: "var(--t50)", fontFamily: T.b, fontSize: 14 }}>Simple, rapide, actionnable.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { step: "01", icon: "📋", title: "Tu réponds au questionnaire", desc: "30 questions sur ton setup, tes douleurs, ton sommeil et tes habitudes. Adapté selon ton métier — bureau ou debout.", color: "#2b5ce6" },
            { step: "02", icon: "🔬", title: "PAW analyse ta situation", desc: "Un score sur 100 par dimension, des flags cliniques détectés, et une analyse IA de ta posture via ta caméra.", color: "#7c3aed" },
            { step: "03", icon: "✅", title: "Tu reçois ton plan d'action", desc: "Des recommandations concrètes classées par priorité, des exercices ciblés et des produits adaptés à ton profil.", color: "#1d9e75" },
          ].map((item, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} style={{ padding: "28px 24px", borderRadius: 20, background: "var(--bg-card)", border: "0.5px solid var(--border)", position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: `${item.color}18`, border: `1px solid ${item.color}35`, fontFamily: T.h, fontWeight: 900, fontSize: 13, color: item.color, marginBottom: 16 }}>
                {item.step}
              </div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.65 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION VIDÉO IA ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 80 }}
        >
          <div style={{
            borderRadius: 28, overflow: "hidden",
            border: "1px solid rgba(124,58,237,0.3)",
            background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(43,92,230,0.06) 100%)",
          }}>
            {/* Header */}
            <div style={{ padding: isMobile ? "28px 24px 20px" : "40px 48px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  padding: "6px 14px", borderRadius: 100,
                  background: "rgba(124,58,237,0.15)", border: "0.5px solid rgba(124,58,237,0.3)",
                }}>
                  <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "#c4b5fd", letterSpacing: "0.06em" }}>
                    🎥 EXCLUSIF — ANALYSE IA POSTURALE
                  </span>
                </div>
              </div>

              <h2 style={{
                fontFamily: T.h, fontWeight: 900,
                fontSize: isMobile ? "26px" : "36px",
                color: "var(--text-primary)", margin: "0 0 16px",
                letterSpacing: "-0.5px", lineHeight: 1.2,
              }}>
                Un ergonome ne peut pas<br />
                filmer 30 personnes en même temps.<br />
                <span style={{ color: "#a78bfa" }}>PAW le fait.</span>
              </h2>

              <p style={{
                fontFamily: T.b, fontSize: isMobile ? 14 : 16,
                color: "var(--t60)", lineHeight: 1.7,
                maxWidth: 560, margin: "0 0 28px",
              }}>
                En 40 secondes, notre IA analyse ta posture réelle via ta caméra.
                Projection de tête, épaules enroulées, position lombaire —
                ce que le questionnaire seul ne peut pas voir.
              </p>

              {/* Features grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: 12, marginBottom: 28,
              }}>
                {[
                  { emoji: "🧠", title: "Claude Vision IA", desc: "Analyse posturale par intelligence artificielle" },
                  { emoji: "⚡", title: "40 secondes", desc: "Résultats immédiats, rapport complet" },
                  { emoji: "📱", title: "Sur ton téléphone", desc: "QR code depuis le PC, caméra mobile pour filmer" },
                ].map((f, i) => (
                  <div key={i} style={{
                    padding: "16px", borderRadius: 16,
                    background: "rgba(124,58,237,0.06)",
                    border: "0.5px solid rgba(124,58,237,0.2)",
                  }}>
                    <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>{f.emoji}</span>
                    <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#c4b5fd", margin: "0 0 4px" }}>
                      {f.title}
                    </p>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", margin: 0, lineHeight: 1.5 }}>
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ce que l'IA détecte */}
              <div style={{
                padding: "16px 20px", borderRadius: 16,
                background: "rgba(0,0,0,0.2)", border: "0.5px solid rgba(124,58,237,0.15)",
                marginBottom: 28,
              }}>
                <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "var(--t40)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Ce que l&apos;IA analyse concrètement
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[
                    "Projection de tête",
                    "Enroulement des épaules",
                    "Cyphose dorsale",
                    "Position lombaire",
                    "Hauteur écran",
                    "Setup bureau",
                    "Distance écran",
                    "Position clavier/souris",
                  ].map((item, i) => (
                    <span key={i} style={{
                      padding: "4px 12px", borderRadius: 100,
                      background: "rgba(124,58,237,0.1)", border: "0.5px solid rgba(124,58,237,0.2)",
                      fontFamily: T.b, fontSize: 12, color: "#c4b5fd",
                    }}>
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <Link href="/onboarding" style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "14px 28px", borderRadius: 100,
                    background: "linear-gradient(135deg, #7c3aed, #2b5ce6)",
                    boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
                    fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff",
                    cursor: "pointer",
                  }}>
                    🎥 Analyser ma posture →
                  </div>
                </Link>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", margin: 0 }}>
                  3 scores gratuits · Analyse complète à 19,99€ · Résultats immédiats
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── PILLARS ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 14 }}>6 dimensions analysées</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 12 }}>
            Une vue complète.<br />Pas juste la posture.
          </h2>
          <p style={{ color: "var(--t65)", fontFamily: T.b, fontSize: 15 }}>
            Parce que les douleurs au travail ont rarement une seule cause.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {pillars.map((p, i) => (
            <motion.div key={i} {...fadeUp(i * 0.07)} style={{ padding: "24px", borderRadius: 20, background: p.bg, border: `0.5px solid ${p.border}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: p.blob, filter: "blur(30px)", opacity: 0.6 }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: p.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14, position: "relative" }}>
                {p.icon}
              </div>
              <h3 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: p.titleColor, marginBottom: 8, position: "relative" }}>{p.title}</h3>
              <p style={{ color: "var(--t55)", fontSize: 13, lineHeight: 1.6, fontFamily: T.b, position: "relative" }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── KINÉ SECTION (anonymisée) ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 14 }}>Créé par un praticien</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32, color: "var(--text-primary)", margin: "0 0 14px", letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            L&apos;IA analyse.<br />Le kiné a défini les règles.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 15, color: "var(--t55)", lineHeight: 1.75, maxWidth: 540, margin: 0 }}>
            Derrière Posture At Work, un kinésithérapeute qui voit ces douleurs en cabinet chaque semaine. Chaque question, chaque seuil d&apos;alerte, chaque recommandation a été pensé à partir de cas réels — pas dans un bureau tech.
          </p>
        </motion.div>
        <motion.div {...fadeUp(0.1)} style={{
          display: "flex", gap: 20, alignItems: "flex-start",
          padding: 28, borderRadius: 16,
          background: "var(--bg-card)", border: "0.5px solid var(--border)",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
            background: "rgba(43,92,230,0.12)", border: "1.5px solid rgba(43,92,230,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>🩺</div>
          <div>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Fondateur kinésithérapeute
            </p>
            <p style={{ fontFamily: T.b, fontSize: 12, color: "#2b5ce6", fontWeight: 600, margin: "0 0 10px" }}>
              Spécialisé TMS · Troubles musculosquelettiques du travail
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.65, margin: 0 }}>
              &quot;Chaque semaine en cabinet, je vois les mêmes TMS revenir — dos, nuque, poignets.
              Des douleurs qui s&apos;installent sur des mois avant que les gens consultent,
              et qui auraient pu être évitées. PAW, c&apos;est la prévention que je ne pouvais pas
              donner à tous mes patients faute de temps.&quot;
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {["Validé cliniquement", "Modèle biopsychosocial", "Données RGPD"].map((badge, i) => (
                <span key={i} style={{
                  padding: "4px 12px", borderRadius: 100,
                  background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.2)",
                  fontFamily: T.b, fontSize: 11, color: "#7c9fff", fontWeight: 600,
                }}>✓ {badge}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── B2B SECTION ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ borderRadius: 20, overflow: "hidden", border: "0.5px solid rgba(124,58,237,0.25)" }}>
          {/* Top */}
          <div style={{ padding: isMobile ? "24px 20px" : "40px 40px 32px", background: "rgba(124,58,237,0.07)", borderBottom: "0.5px solid rgba(124,58,237,0.15)" }}>
            <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#a78bfa", textTransform: "uppercase", marginBottom: 12 }}>PostureAtWork Entreprise</p>
            <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.15 }}>
              Vos équipes travaillent dur.<br />Leurs douleurs s&apos;accumulent en silence.
            </h2>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.75, margin: 0, maxWidth: 600 }}>
              Les TMS sont la première cause de maladie professionnelle. Ils désorganisent les équipes, augmentent l&apos;absentéisme et pèsent sur votre score ESG Social. PAW Entreprise vous donne une vue claire sur la santé ergonomique de vos collaborateurs — avant que ça coûte cher.
            </p>
          </div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", borderBottom: "0.5px solid rgba(124,58,237,0.15)" }}>
            {[
              { value: "88%", label: "des maladies professionnelles reconnues sont des TMS", source: "Ameli, 2024" },
              { value: "73 jours", label: "d'arrêt de travail en moyenne par cas de TMS", source: "StopTMS, 2025" },
              { value: "10,4M", label: "de journées de travail perdues chaque année en France", source: "Assurance Maladie, 2024" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "28px 24px",
                borderRight: isMobile ? "none" : (i < 2 ? "0.5px solid rgba(124,58,237,0.15)" : "none"),
                borderBottom: isMobile && i < 2 ? "0.5px solid rgba(124,58,237,0.15)" : "none",
              }}>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#a78bfa", margin: "0 0 6px" }}>{s.value}</p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t45)", lineHeight: 1.5, margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t30)", margin: 0 }}>Source : {s.source}</p>
              </div>
            ))}
          </div>
          {/* Bottom CTA */}
          <div style={{ padding: isMobile ? "20px 16px" : "24px 40px", background: "rgba(124,58,237,0.04)", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t45)", margin: 0, lineHeight: 1.6 }}>
              Dashboard RH anonymisé · Rapport collectif · Suivi trimestriel · Reporting social
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link href="/entreprise" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "13px 22px", borderRadius: 100, background: "transparent", border: "1.5px solid rgba(124,58,237,0.5)", color: "#a78bfa", fontFamily: T.h, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    Découvrir PAW Entreprise →
                  </div>
                </Link>
                <Link href="/entreprise#contact" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "13px 22px", borderRadius: 100, background: "#7c3aed", color: "#fff", fontFamily: T.h, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    Demander un devis →
                  </div>
                </Link>
              </div>
              <Link href="/entreprise/login" style={{ textDecoration: "none" }}>
                <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t45)" }}>
                  Déjà client ?{" "}
                  <span style={{ color: "#a78bfa", fontWeight: 600 }}>Accéder au dashboard entreprise →</span>
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <FAQ isMobile={isMobile} />

      {/* ── CTA FINAL ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", padding: isMobile ? "48px 24px" : "64px 48px", borderRadius: 28, background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 26 : 36, color: "var(--text-primary)", marginBottom: 16, letterSpacing: "-0.5px" }}>
            Ton bilan prend 5 minutes.<br />
            <span style={{ color: "#2b5ce6" }}>Les résultats durent.</span>
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.65, marginBottom: 28, maxWidth: 440, margin: "0 auto 28px" }}>
            Comprends enfin pourquoi tu as mal — et ce que tu peux faire aujourd&apos;hui.
          </p>
          <Link href="/onboarding" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-block", padding: "16px 36px", borderRadius: 100,
              background: "#2b5ce6", color: "#fff",
              fontFamily: T.h, fontWeight: 800, fontSize: 16, cursor: "pointer",
              boxShadow: "0 4px 32px rgba(43,92,230,0.4)",
            }}>
              Commencer mon bilan →
            </div>
          </Link>
          <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", marginTop: 12 }}>
            3 scores gratuits · Analyse complète 19,99€ · Sans engagement
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: "40px 24px", borderTop: "0.5px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>
              PAW<span style={{ color: "#2b5ce6" }}>.</span>
            </p>
            <p style={{ fontFamily: T.b, fontSize: 9, letterSpacing: "0.18em", color: "var(--t35)", textTransform: "uppercase", margin: 0 }}>
              Posture At Work
            </p>
          </div>
          <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", textAlign: "center", maxWidth: 400 }}>
            Bilan ergonomique pour les travailleurs sédentaires et debout.
            <br />Prévention TMS · Santé au travail · Analyse posturale IA
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "Mon bilan", href: "/onboarding" },
              { label: "Exercices", href: "/mobilite" },
              { label: "Entreprise", href: "/entreprise" },
              { label: "À propos & Contact", href: "/about" },
            ].map((l) => (
              <Link key={l.label} href={l.href} style={{ textDecoration: "none" }}>
                <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t40)" }}>{l.label}</span>
              </Link>
            ))}
          </div>
          <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t25)" }}>
            © {new Date().getFullYear()} PostureAtWork · Tous droits réservés
          </p>
        </div>
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
