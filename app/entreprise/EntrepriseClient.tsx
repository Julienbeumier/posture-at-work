"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const FEATURES = [
  {
    icon: "🎯",
    title: "Bilan individuel pour chaque employé",
    desc: "Chaque collaborateur fait son bilan complet en 5 minutes — questionnaire clinique adapté à son poste, conseils personnalisés, exercices ciblés. Accès premium inclus pour tous.",
    color: "#2b5ce6",
  },
  {
    icon: "🎥",
    title: "Analyse vidéo IA posturale",
    desc: "Claude Vision analyse la posture réelle de chaque employé via caméra. Un ergonome ne peut pas observer 30 personnes simultanément. PAW le fait — pour chacun, en temps réel.",
    color: "#7c3aed",
  },
  {
    icon: "📊",
    title: "Dashboard RH anonymisé",
    desc: "Scores moyens par dimension, répartition bureau vs terrain, évolution trimestrielle. Vos données RH en un coup d'œil — sans jamais exposer les données individuelles.",
    color: "#1d9e75",
  },
  {
    icon: "📄",
    title: "Rapport collectif trimestriel",
    desc: "Un rapport PDF complet signé par notre kinésithérapeute. Présentable en CSSCT, à la direction ou dans votre reporting ESG Social.",
    color: "#d4622a",
  },
  {
    icon: "🏋️",
    title: "Programme d'exercices collectif",
    desc: "Sur la base des résultats agrégés, PAW génère un programme d'exercices adapté aux TMS détectés dans votre équipe. Affichable en salle de pause ou entrepôt.",
    color: "#e24b4a",
  },
  {
    icon: "📞",
    title: "Call de restitution avec le kiné",
    desc: "1h avec Julien Beumier, kinésithérapeute fondateur de PAW. Il analyse vos résultats collectifs et vous guide sur les actions prioritaires à mettre en place.",
    color: "#f59e0b",
  },
  {
    icon: "🌿",
    title: "Angle ESG / CSRD",
    desc: "Documentez vos actions de prévention TMS pour votre score ESG Social. PAW vous donne les données et le rapport pour répondre aux obligations CSRD.",
    color: "#1d9e75",
  },
  {
    icon: "🔒",
    title: "Données anonymisées & RGPD",
    desc: "L'employeur voit uniquement les scores agrégés. Les données individuelles restent privées. Hébergement européen, conformité RGPD garantie.",
    color: "#2b5ce6",
  },
];

function calculatePrice(employees: number) {
  const n = Math.max(10, employees);
  if (n < 50) {
    return { pricePerEmployee: 25, totalYear: n * 25, totalMonth: Math.round((n * 25) / 12), tier: "PME", savings: undefined as number | undefined };
  } else if (n < 150) {
    const total = n * 20;
    return { pricePerEmployee: 20, totalYear: total, totalMonth: Math.round(total / 12), tier: "Croissance", savings: n * 25 - total };
  } else {
    return { pricePerEmployee: 0, totalYear: 0, totalMonth: 0, tier: "Entreprise", savings: undefined as number | undefined };
  }
}

function PricingCalculator({
  isMobile, c, T, fadeUp,
}: {
  isMobile: boolean;
  c: { textPrimary: string; textSecondary: string; textMuted: string; bgCard: string; bgCard2: string; border: string };
  T: { h: string; b: string };
  fadeUp: (delay?: number) => object;
}) {
  const [employees, setEmployees] = useState(20);
  const price = calculatePrice(employees);
  const isDevis = price.tier === "Entreprise";

  const included = [
    `Accès premium PAW pour les ${employees} employés`,
    "Analyse vidéo IA posturale incluse",
    "Dashboard RH anonymisé",
    "Rapport collectif trimestriel PDF",
    "Programme d'exercices collectif",
    "Call de restitution 1h avec le kiné",
    "Support email prioritaire",
  ];

  return (
    <motion.div {...fadeUp(0.2)} style={{ marginBottom: 72 }}>
      <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Tarifs</p>
      <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
        Transparent. Sans surprise.
      </h2>
      <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 32 }}>
        Accès premium PAW inclus pour chaque employé. Prix dégressif à partir de 50 personnes.
      </p>

      <div style={{ borderRadius: 24, padding: isMobile ? "24px 18px" : "36px 40px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
        {/* Slider */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, fontWeight: 600 }}>Nombre d&apos;employés</span>
            <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "#2b5ce6" }}>
              {employees}{" "}
              <span style={{ fontSize: 14, fontWeight: 600, color: c.textMuted }}>employés</span>
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={employees}
            onChange={e => setEmployees(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#2b5ce6", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {["10", "50", "150+", "200"].map(label => (
              <span key={label} style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted }}>{label}</span>
            ))}
          </div>
        </div>

        {isDevis ? (
          <div style={{ textAlign: "center", padding: "28px 20px" }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 36, color: c.textPrimary, marginBottom: 8 }}>Sur devis</p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 8, lineHeight: 1.65 }}>
              Pour les organisations de 150+ employés, nous construisons une offre sur mesure :
              multi-sites, intégration SIRH, accompagnement dédié.
            </p>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "#7c9fff", marginBottom: 28 }}>
              Tarif négocié · Déploiement accompagné · SLA garanti
            </p>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "14px 32px", borderRadius: 100, border: "none",
                background: "#2b5ce6", color: "#fff",
                fontFamily: T.h, fontWeight: 800, fontSize: 15,
                boxShadow: "0 4px 20px rgba(43,92,230,0.35)", cursor: "pointer",
              }}>
                Demander un devis pour {employees} employés →
              </button>
            </a>
          </div>
        ) : (
          <div>
            {/* Prix */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              <div style={{ padding: "20px", borderRadius: 16, textAlign: "center", background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Annuel</p>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 30, color: c.textPrimary, margin: "0 0 4px" }}>
                  {price.totalYear.toLocaleString("fr-FR")}€
                </p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>HT / an</p>
              </div>
              <div style={{ padding: "20px", borderRadius: 16, textAlign: "center", background: c.bgCard2, border: `0.5px solid ${c.border}` }}>
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Mensuel</p>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 30, color: c.textPrimary, margin: "0 0 4px" }}>
                  {price.totalMonth.toLocaleString("fr-FR")}€
                </p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>HT / mois</p>
              </div>
              <div style={{ padding: "20px", borderRadius: 16, textAlign: "center", background: c.bgCard2, border: `0.5px solid ${c.border}` }}>
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Par employé</p>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 30, color: c.textPrimary, margin: "0 0 4px" }}>
                  {price.pricePerEmployee}€
                </p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>HT / an / personne</p>
              </div>
            </div>

            {/* Badge économies */}
            {price.savings && price.savings > 0 && (
              <div style={{
                padding: "12px 16px", borderRadius: 12, marginBottom: 20,
                background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.25)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <span style={{ fontFamily: T.b, fontSize: 13, color: "#1d9e75", fontWeight: 600 }}>
                  Économie de {price.savings.toLocaleString("fr-FR")}€/an grâce au tarif dégressif (20€ vs 25€/employé)
                </span>
              </div>
            )}

            {/* Inclus */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {included.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#2b5ce6", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Argument de valeur */}
            <div style={{ padding: "14px 16px", borderRadius: 12, marginBottom: 24, background: c.bgCard2, border: `0.5px solid ${c.border}` }}>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.65 }}>
                💡 L&apos;accès premium individuel coûte <strong style={{ color: c.textPrimary }}>19,99€/personne</strong> — pour {employees} employés, ça ferait{" "}
                <strong style={{ color: c.textPrimary }}>{(employees * 20).toLocaleString("fr-FR")}€</strong>. Avec PAW Entreprise :{" "}
                <strong style={{ color: "#2b5ce6" }}>{price.totalYear.toLocaleString("fr-FR")}€</strong> — tout inclus.
              </p>
            </div>

            {/* CTA */}
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", padding: "15px 0", borderRadius: 100, border: "none",
                background: "#2b5ce6", color: "#fff",
                fontFamily: T.h, fontWeight: 800, fontSize: 15,
                boxShadow: "0 4px 24px rgba(43,92,230,0.35)", cursor: "pointer",
              }}>
                Demander une démo pour {employees} employés →
              </button>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const VS_ERGO = [
  { critere: "Coût", ergo: "1 000€+ / jour de prestation", paw: "À partir de 990€ / an" },
  { critere: "Couverture", ergo: "5 à 10 personnes max par jour", paw: "Tous vos employés simultanément" },
  { critere: "Analyse posturale", ergo: "Observation ponctuelle", paw: "Vidéo IA pour chaque employé" },
  { critere: "Suivi dans le temps", ergo: "Rapport unique, pas de suivi", paw: "Suivi trimestriel continu" },
  { critere: "Outil pour l'employé", ergo: "Aucun", paw: "Accès premium PAW complet" },
  { critere: "Données RH", ergo: "Rapport Word statique", paw: "Dashboard live + export CSV" },
];

const FACTS = [
  { value: "88%", label: "des maladies professionnelles sont des TMS", source: "Ameli, 2024" },
  { value: "73 jours", label: "d'arrêt de travail en moyenne par cas de TMS", source: "StopTMS, 2025" },
  { value: "12 780€", label: "coût moyen d'un canal carpien pour l'entreprise", source: "CPAM" },
];

export default function EntrepriseClient() {
  const { c } = useTheme();
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", societe: "", effectif: "", message: "" });
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  async function handleContact() {
    if (!form.nom || !form.email || !form.societe) return;
    setContactLoading(true);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: `${form.nom} (${form.societe} · ${form.effectif})`,
        email: form.email,
        message: form.message || "Demande de démo B2B",
      }),
    });
    setContactSent(true);
    setContactLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px", overflowX: "hidden" }}>

        {/* ── HERO ── */}
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", padding: isMobile ? "100px 0 40px" : "72px 0 56px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100, marginBottom: 20,
            background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.25)",
          }}>
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#7c9fff" }}>
              🏢 PAW Entreprise · Prévention TMS
            </span>
          </div>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: "clamp(28px, 4vw, 40px)", color: c.textPrimary, lineHeight: 1.15, marginBottom: 16 }}>
            Vos équipes travaillent dur.<br />
            <span style={{ color: "#2b5ce6" }}>Leurs douleurs s&apos;accumulent en silence.</span>
          </h1>
          <p style={{ fontFamily: T.b, fontSize: 16, color: c.textSecondary, lineHeight: 1.75, maxWidth: 620, margin: "0 auto 16px" }}>
            Un ergonome coûte 1 000€ la journée — et ne peut questionner en profondeur que 5 à 10 personnes. PAW analyse l&apos;ensemble de vos équipes avec un questionnaire clinique et une analyse vidéo IA posturale, pour moins cher, en continu.
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, lineHeight: 1.65, maxWidth: 560, margin: "0 auto 36px" }}>
            Dashboard RH anonymisé · Rapport kiné trimestriel · Accès premium pour chaque employé · Angle CSRD/ESG
          </p>
          <a href="#contact" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "15px 32px", borderRadius: 100, border: "none",
              background: "#2b5ce6", color: "#fff",
              fontFamily: T.h, fontWeight: 800, fontSize: 15,
              boxShadow: "0 4px 24px rgba(43,92,230,0.35)", cursor: "pointer",
            }}>
              Demander une démo →
            </button>
          </a>
        </motion.div>

        {/* ── FACTS ── */}
        <motion.div {...fadeUp(0.05)} style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          borderRadius: 20, overflow: "hidden",
          border: `0.5px solid ${c.border}`,
          background: c.bgCard,
          marginBottom: 72,
        }}>
          {FACTS.map((f, i) => (
            <div key={i} style={{
              padding: "28px 20px", textAlign: "center",
              borderRight: !isMobile && i < 2 ? `0.5px solid ${c.border}` : "none",
            }}>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "#2b5ce6", margin: "0 0 6px" }}>{f.value}</p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.5, margin: "0 0 4px" }}>{f.label}</p>
              <p style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted, margin: 0 }}>Source : {f.source}</p>
            </div>
          ))}
        </motion.div>

        {/* ── DOUBLE VALEUR : ENTREPRISE + EMPLOYÉ ── */}
        <motion.div {...fadeUp(0.08)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>
            Une double valeur, un seul abonnement
          </p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Un ergonome vous laisse un rapport.<br />PAW laisse un outil à chacun.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65, maxWidth: 640 }}>
            Avec un ergonome classique, les recommandations remontent uniquement vers vous.
            Avec PAW, chaque collaborateur reçoit en plus son propre bilan de santé au travail —
            et les clés pour améliorer sa situation au quotidien.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {/* Côté entreprise */}
            <div style={{ padding: "24px", borderRadius: 20, background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>🏢</span>
                <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#7c9fff" }}>Pour vous, employeur</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Dashboard RH anonymisé avec tendances collectives",
                  "Rapport de synthèse ergonomique trimestriel",
                  "Plan d'action priorisé par impact",
                  "Score Santé Sociale valorisable en ESG",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#7c9fff", fontSize: 13, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Côté employé */}
            <div style={{ padding: "24px", borderRadius: 20, background: "rgba(29,158,117,0.06)", border: "0.5px solid rgba(29,158,117,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>🙋</span>
                <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#1d9e75" }}>Pour chacun de vos employés</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Bilan personnel complet (6 dimensions analysées)",
                  "Analyse vidéo IA de sa propre posture",
                  "Conseils et exercices 100% personnalisés",
                  "Un outil de santé qui lui appartient — même s'il change d'entreprise",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#1d9e75", fontSize: 13, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 14, background: c.bgCard, border: `0.5px solid ${c.border}`, textAlign: "center" }}>
            <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.6 }}>
              💡 Pour 30 employés, l&apos;accès individuel seul vaudrait <strong style={{ color: c.textPrimary }}>450€</strong> (15€/personne).
              Inclus dans votre abonnement PAW Entreprise.
            </p>
          </div>
        </motion.div>

        {/* ── VS ERGONOME ── */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>PAW vs Ergonome</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Moins cher. Plus complet.<br />Disponible toute l&apos;année.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65 }}>
            L&apos;ergonome reste indispensable pour des cas complexes. PAW le complète — ou le précède — en couvrant l&apos;ensemble de vos équipes en continu.
          </p>
          {isMobile ? (
            // Version mobile — cards empilées
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {VS_ERGO.map((row, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: `0.5px solid ${c.border}` }}>
                  <div style={{ padding: "8px 12px", background: c.bgCard2 }}>
                    <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: c.textSecondary }}>{row.critere}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{ padding: "10px 12px", borderRight: `0.5px solid ${c.border}` }}>
                      <p style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted, margin: "0 0 3px" }}>Ergonome</p>
                      <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.4 }}>{row.ergo}</p>
                    </div>
                    <div style={{ padding: "10px 12px", background: "rgba(43,92,230,0.04)" }}>
                      <p style={{ fontFamily: T.b, fontSize: 10, color: "#7c9fff", margin: "0 0 3px" }}>PAW</p>
                      <p style={{ fontFamily: T.b, fontSize: 12, color: "#2b5ce6", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>✓ {row.paw}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Version desktop — tableau existant
            <div style={{ borderRadius: 16, overflow: "hidden", border: `0.5px solid ${c.border}` }}>
              {VS_ERGO.map((row, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  borderBottom: i < VS_ERGO.length - 1 ? `0.5px solid ${c.border}` : "none",
                }}>
                  <div style={{ padding: "14px 18px", background: c.bgCard2, borderRight: `0.5px solid ${c.border}` }}>
                    <span style={{ fontFamily: T.b, fontSize: 13, fontWeight: 600, color: c.textSecondary }}>{row.critere}</span>
                  </div>
                  <div style={{ padding: "14px 18px", borderRight: `0.5px solid ${c.border}` }}>
                    <span style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>{row.ergo}</span>
                  </div>
                  <div style={{ padding: "14px 18px", background: "rgba(43,92,230,0.04)" }}>
                    <span style={{ fontFamily: T.b, fontSize: 13, color: "#2b5ce6", fontWeight: 600 }}>✓ {row.paw}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── FEATURES ── */}
        <motion.div {...fadeUp(0.15)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Ce qui est inclus</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Un programme de prévention TMS<br />clé en main.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 32, lineHeight: 1.65 }}>
            Pas juste un logiciel. Un accompagnement complet avec un kinésithérapeute derrière.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)} style={{
                padding: "22px", borderRadius: 16,
                background: c.bgCard, border: `0.5px solid ${c.border}`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${f.color}12`, border: `1px solid ${f.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 14,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── PRICING ── */}
        <PricingCalculator isMobile={isMobile} c={c} T={T} fadeUp={fadeUp} />

        {/* ── CONTACT / DÉMO ── */}
        <motion.div {...fadeUp(0.25)} id="contact" style={{
          borderRadius: 24, padding: "40px 36px", marginBottom: 32,
          background: c.bgCard, border: `0.5px solid ${c.border}`,
        }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Contact</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: c.textPrimary, marginBottom: 8 }}>
            Parlons de vos équipes.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65 }}>
            Décrivez-nous votre situation — effectif, secteur, problématiques — et on revient vers vous sous 24h pour organiser une démo personnalisée.
          </p>

          {contactSent ? (
            <div style={{
              padding: "28px", borderRadius: 16, textAlign: "center",
              background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.25)",
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#1d9e75", marginBottom: 6 }}>
                Message reçu !
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>
                On revient vers vous sous 24h pour organiser votre démo.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                <input placeholder="Votre nom *" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none" }} />
                <input placeholder="Email professionnel *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                <input placeholder="Société *" value={form.societe} onChange={e => setForm(f => ({ ...f, societe: e.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none" }} />
                <select value={form.effectif} onChange={e => setForm(f => ({ ...f, effectif: e.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: form.effectif ? c.textPrimary : c.textMuted, fontFamily: T.b, fontSize: 13, outline: "none" }}>
                  <option value="">Effectif</option>
                  <option value="1-25">1 - 25 employés</option>
                  <option value="26-50">26 - 50 employés</option>
                  <option value="51-100">51 - 100 employés</option>
                  <option value="100+">100+ employés</option>
                </select>
              </div>
              <select value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: form.message ? c.textPrimary : c.textMuted, fontFamily: T.b, fontSize: 13, outline: "none" }}>
                <option value="">Votre secteur d&apos;activité</option>
                <option value="Bureau / services">Bureau / services</option>
                <option value="Logistique / entrepôt">Logistique / entrepôt</option>
                <option value="Agroalimentaire">Agroalimentaire</option>
                <option value="Commerce / retail">Commerce / retail</option>
                <option value="Santé / soins">Santé / soins</option>
                <option value="BTP / industrie">BTP / industrie</option>
                <option value="Autre">Autre</option>
              </select>
              <textarea placeholder="Décrivez votre situation (optionnel) — effectif, problématiques actuelles, contexte..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none", resize: "vertical" }} />
              <button
                onClick={handleContact}
                disabled={!form.nom || !form.email || !form.societe || contactLoading}
                style={{
                  padding: "15px 0", borderRadius: 100, border: "none",
                  background: form.nom && form.email && form.societe ? "#2b5ce6" : c.bgCard2,
                  color: form.nom && form.email && form.societe ? "#fff" : c.textMuted,
                  fontFamily: T.h, fontWeight: 800, fontSize: 15,
                  cursor: form.nom && form.email && form.societe ? "pointer" : "default",
                  boxShadow: form.nom && form.email && form.societe ? "0 4px 24px rgba(43,92,230,0.35)" : "none",
                  transition: "all 0.2s", opacity: contactLoading ? 0.7 : 1,
                }}
              >
                {contactLoading ? "Envoi…" : "Demander ma démo →"}
              </button>
            </div>
          )}
        </motion.div>

        {/* ── FOOTER LINK ── */}
        <div style={{ textAlign: "center", paddingBottom: 20, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "center", justifyContent: "center", flexWrap: "wrap", gap: isMobile ? 12 : 24 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>← Retour à PostureAtWork</span>
          </Link>
          <Link href="/entreprise/dashboard" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: "#7c9fff" }}>Déjà client ? Accéder au dashboard →</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
