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
    initials: "MV",
    color: "#7c3aed",
    nom: "Marc V.",
    role: "Technicien de surface · Bruxelles",
    emoji: "🧹",
    texte: "Je pensais que mes douleurs aux épaules c'était normal après 10 ans de boulot. PAW m'a montré que c'était surtout ma façon de pousser le chariot et mon manque de pauses. J'ai changé 2-3 trucs et ça va déjà mieux.",
    score: "38 → 64 pts",
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
          <Link href="/questionnaire" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "14px 28px", borderRadius: 100, background: "#2b5ce6",
              color: "#fff", fontFamily: T.h, fontWeight: 800, fontSize: 15, cursor: "pointer",
              boxShadow: "0 4px 24px rgba(43,92,230,0.35)",
            }}>
              Faire mon bilan →
            </div>
          </Link>
          <Link href="/exemple-rapport" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "14px 24px", borderRadius: 100,
              background: "transparent", border: "0.5px solid var(--border-3)",
              color: "var(--text-primary)", fontFamily: T.b, fontSize: 14, cursor: "pointer",
            }}>
              Voir un exemple de rapport
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

      {/* ── KINÉ SECTION ── */}
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
          display: "flex", gap: 24, alignItems: "flex-start",
          padding: 28, borderRadius: 16,
          background: "var(--bg-card)", border: "0.5px solid var(--border)",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
            background: "rgba(43,92,230,0.15)", border: "1.5px solid rgba(43,92,230,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "#7c9fff",
          }}>JB</div>
          <div>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "var(--text-primary)", margin: "0 0 4px" }}>Julien Beumier</p>
            <p style={{ fontSize: 12, color: "#2b5ce6", fontWeight: 600, fontFamily: T.b, margin: "0 0 10px" }}>Kinésithérapeute · Fondateur de PostureAtWork</p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.65, margin: 0 }}>
              &quot;Chaque semaine en cabinet, je vois les mêmes TMS revenir. Dos, nuque, poignets. Des douleurs qui s&apos;installent sur des mois avant que les gens consultent — et qui auraient pu être évitées.&quot;
            </p>
          </div>
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
            { step: "01", icon: "📋", title: "Tu réponds au questionnaire", desc: "32 questions sur ton setup, tes douleurs, ton sommeil et tes habitudes. Adapté selon ton métier — bureau ou debout.", color: "#2b5ce6" },
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

      {/* ── TESTIMONIALS ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 14 }}>Ils l&apos;ont testé</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 10 }}>
            Ce que ça change, concrètement.
          </h2>
          <p style={{ color: "var(--t50)", fontFamily: T.b, fontSize: 14 }}>Des résultats concrets, en quelques semaines.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
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
              <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, background: `${t.color}18`, border: `1px solid ${t.color}35`, color: t.color, fontFamily: T.h, fontWeight: 700, fontSize: 11 }}>
                Score : {t.score}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto 32px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{ padding: isMobile ? "36px 20px" : "56px 40px", borderRadius: 22, background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.2)", textAlign: "center" }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 12 }}>
            5 minutes. Un rapport.<br />Des actions concrètes sur ce qui te fait vraiment mal.
          </h2>
          <p style={{ color: "var(--t50)", fontFamily: T.b, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Ton corps t&apos;envoie des signaux depuis un moment.<br />Il est temps de les écouter.
          </p>
          <Link href="/questionnaire" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-block", padding: "15px 32px", borderRadius: 100, background: "#2b5ce6", color: "#fff", fontFamily: T.h, fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 24px rgba(43,92,230,0.35)" }}>
              Faire mon bilan →
            </div>
          </Link>
        </motion.div>
      </section>

      {/* ── VISION HOLISTIQUE ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto 60px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0)} style={{
          borderRadius: 20, padding: isMobile ? "20px 16px" : "40px",
          background: "var(--bg-card)", border: "0.5px solid var(--border)",
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 40,
        }}>
          <div>
            <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#e24b4a", textTransform: "uppercase", marginBottom: 12 }}>Avant</p>
            <h3 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.3 }}>
              L&apos;ergonomie mécanique
            </h3>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.75, margin: "0 0 16px" }}>
              Un ergonome venait en entreprise, adaptait le poste de travail, formait à la manutention. Hauteur d&apos;écran, position du clavier, technique de levage.
            </p>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t40)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
              Utile. Mais insuffisant.
            </p>
          </div>
          <div>
            <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Maintenant</p>
            <h3 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.3 }}>
              La vision biopsychosociale
            </h3>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.75, margin: "0 0 16px" }}>
              La recherche l&apos;a prouvé : les TMS viennent aussi du stress chronique, du manque de sommeil, de la nutrition et de l&apos;environnement de travail. Le stress chronique maintient ton système nerveux en alerte permanente. Résultat : tes muscles restent contractés des heures, même au repos. Ton dos et ta nuque en paient le prix — indépendamment de ton setup.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["🧠 Psychosocial", "😴 Sommeil", "🥗 Nutrition", "🌡️ Environnement", "💪 Mode de vie"].map((tag) => (
                <span key={tag} style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.2)", fontFamily: T.b, fontSize: 12, color: "#7c9fff" }}>{tag}</span>
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
              Dashboard RH anonymisé · Rapport collectif · Suivi trimestriel · Angle CSRD/ESG
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
              { label: "Exemple de rapport", href: "/exemple-rapport" },
              { label: "Questionnaire", href: "/questionnaire" },
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
