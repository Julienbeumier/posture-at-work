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
    desc: "Chaque collaborateur fait son bilan en 5 minutes. Questionnaire clinique + analyse vidéo IA. Accès premium à vie inclus — chacun garde son bilan même s'il quitte l'entreprise.",
    color: "#2b5ce6",
  },
  {
    icon: "📊",
    title: "Dashboard RH avec actions prioritaires",
    desc: "Scores par dimension, zones à risque, tendances bureau vs terrain. PAW vous dit exactement quoi faire en priorité — pas juste des données brutes.",
    color: "#7c3aed",
  },
  {
    icon: "🌿",
    title: "Rapport ESG Social valorisable",
    desc: "Rapport trimestriel signé par notre kinésithérapeute. Utilisable pour votre CSRD, vos prêts bancaires à impact, votre score EcoVadis ou votre CSSCT.",
    color: "#1d9e75",
  },
  {
    icon: "📞",
    title: "Call de restitution avec le kiné fondateur",
    desc: "1h avec Julien, kinésithérapeute spécialisé TMS. Il analyse vos résultats et vous guide sur les actions prioritaires. Inclus dans tous les plans.",
    color: "#f59e0b",
  },
];

function calculatePrice(employees: number) {
  const n = Math.max(10, employees);
  if (n < 50) {
    return {
      pricePerEmployee: 25,
      totalYear: n * 25,
      totalMonth: Math.round((n * 25) / 12),
      tier: "PME",
      savings: 0,
      bilanValue: Math.round(n * 19.99),
    };
  } else if (n < 150) {
    const total = n * 20;
    return {
      pricePerEmployee: 20,
      totalYear: total,
      totalMonth: Math.round(total / 12),
      tier: "Croissance",
      savings: n * 25 - total,
      bilanValue: Math.round(n * 19.99),
    };
  }
  return {
    pricePerEmployee: 0,
    totalYear: 0,
    totalMonth: 0,
    tier: "Entreprise",
    savings: 0,
    bilanValue: 0,
  };
}

function PricingCalculator({
  isMobile, c, T: fonts, fadeUp: fu,
}: {
  isMobile: boolean;
  c: { textPrimary: string; textSecondary: string; textMuted: string; bgCard: string; bgCard2: string; border: string };
  T: { h: string; b: string };
  fadeUp: (delay?: number) => object;
}) {
  const [employees, setEmployees] = useState(20);
  const price = calculatePrice(employees);
  const isDevis = price.tier === "Entreprise";

  return (
    <motion.div {...fu(0.2)} style={{ marginBottom: 72 }}>
      <p style={{ fontFamily: fonts.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Tarifs</p>
      <h2 style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
        Transparent. Sans surprise.
      </h2>
      <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textMuted, marginBottom: 32 }}>
        Accès premium PAW inclus pour chaque employé. Prix dégressif à partir de 50 personnes.
      </p>

      <div style={{ borderRadius: 24, padding: isMobile ? "24px 18px" : "36px 40px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
        {/* Slider */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ fontFamily: fonts.b, fontSize: 13, color: c.textSecondary, fontWeight: 600 }}>Nombre d&apos;employés</span>
            <span style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 28, color: "#2b5ce6" }}>
              {employees}{" "}
              <span style={{ fontSize: 14, fontWeight: 600, color: c.textMuted }}>employés</span>
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={160}
            step={5}
            value={employees}
            onChange={e => setEmployees(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#2b5ce6", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {["10", "25", "50", "75", "100", "150+"].map(label => (
              <span key={label} style={{ fontFamily: fonts.b, fontSize: 11, color: c.textMuted }}>{label}</span>
            ))}
          </div>
        </div>

        {isDevis ? (
          <div style={{ textAlign: "center", padding: "28px 20px" }}>
            <p style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 36, color: c.textPrimary, marginBottom: 8 }}>Sur devis</p>
            <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textMuted, marginBottom: 8, lineHeight: 1.65 }}>
              Pour les organisations de 150+ employés, nous construisons une offre sur mesure :
              multi-sites, intégration SIRH, accompagnement dédié.
            </p>
            <p style={{ fontFamily: fonts.b, fontSize: 13, color: "#7c9fff", marginBottom: 28 }}>
              Tarif négocié · Déploiement accompagné · SLA garanti
            </p>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "14px 32px", borderRadius: 100, border: "none",
                background: "#2b5ce6", color: "#fff",
                fontFamily: fonts.h, fontWeight: 800, fontSize: 15,
                boxShadow: "0 4px 20px rgba(43,92,230,0.35)", cursor: "pointer",
              }}>
                Demander un devis pour {employees} employés →
              </button>
            </a>
          </div>
        ) : (
          <div>
            {/* Prix principal */}
            <div style={{ textAlign: "center", padding: "24px 0 20px", borderBottom: `0.5px solid ${c.border}`, marginBottom: 20 }}>
              <p style={{ fontFamily: fonts.b, fontSize: 12, color: c.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                Votre tarif annuel
              </p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: isMobile ? 48 : 64, color: c.textPrimary, letterSpacing: "-3px", lineHeight: 1 }}>
                  {price.totalYear.toLocaleString("fr-FR")}€
                </span>
                <span style={{ fontFamily: fonts.b, fontSize: 16, color: c.textMuted }}>/an HT</span>
              </div>
              <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textMuted, margin: 0 }}>
                soit <strong style={{ color: c.textPrimary }}>{price.pricePerEmployee}€/employé/an</strong> — {(price.pricePerEmployee / 12).toFixed(2)}€/mois/personne
              </p>
            </div>

            {/* Argument de valeur */}
            <div style={{
              padding: "16px 18px", borderRadius: 14, marginBottom: 16,
              background: price.bilanValue <= price.totalYear ? "rgba(43,92,230,0.06)" : "rgba(116,198,157,0.06)",
              border: `0.5px solid ${price.bilanValue <= price.totalYear ? "rgba(43,92,230,0.2)" : "rgba(116,198,157,0.2)"}`,
            }}>
              {price.bilanValue > price.totalYear ? (
                <p style={{ fontFamily: fonts.b, fontSize: 13, color: c.textSecondary, margin: 0, lineHeight: 1.7 }}>
                  💡 Si chacun de vos <strong style={{ color: c.textPrimary }}>{employees} employés</strong> achetait son bilan individuellement,
                  ça coûterait <strong style={{ color: c.textPrimary }}>{price.bilanValue.toLocaleString("fr-FR")}€</strong>.
                  Avec PAW Entreprise, vous payez <strong style={{ color: "#74c69d" }}>{price.totalYear.toLocaleString("fr-FR")}€</strong> —
                  et vous avez en plus le dashboard RH, l&apos;analyse collective et le rapport trimestriel.
                </p>
              ) : (
                <p style={{ fontFamily: fonts.b, fontSize: 13, color: c.textSecondary, margin: 0, lineHeight: 1.7 }}>
                  💡 Pour <strong style={{ color: c.textPrimary }}>{employees} employés</strong>, PAW Entreprise inclut
                  les <strong style={{ color: c.textPrimary }}>{employees} bilans premium</strong> + le dashboard RH collectif
                  + l&apos;analyse posturale vidéo de toute l&apos;équipe + le rapport trimestriel.
                  Un ergonome facture <strong style={{ color: c.textPrimary }}>~150€/personne</strong> pour bien moins.
                </p>
              )}
            </div>

            {/* Badge économies si dégressif */}
            {price.savings > 0 && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                background: "rgba(116,198,157,0.08)", border: "0.5px solid rgba(116,198,157,0.2)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>🎉</span>
                <span style={{ fontFamily: fonts.b, fontSize: 13, color: "#1d9e75", fontWeight: 600 }}>
                  Tarif dégressif : vous économisez {price.savings.toLocaleString("fr-FR")}€/an vs le tarif PME
                </span>
              </div>
            )}

            {/* Ce qui est inclus */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 6, marginBottom: 20 }}>
              {[
                `${employees} bilans premium PAW`,
                `${employees} analyses vidéo IA`,
                "Dashboard RH anonymisé",
                "Rapport trimestriel PDF",
                "Score ESG/CSRD valorisable",
                "Call de restitution avec le kiné",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#2b5ce6", fontSize: 12, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontFamily: fonts.b, fontSize: 12, color: c.textSecondary, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", padding: "15px 0", borderRadius: 100, border: "none",
                background: "#2b5ce6", color: "#fff",
                fontFamily: fonts.h, fontWeight: 800, fontSize: 15,
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

function ROICalculator({ isMobile, c, T: fonts, fadeUp: fu }: {
  isMobile: boolean;
  c: Record<string, string>;
  T: { h: string; b: string };
  fadeUp: (delay?: number) => object;
}) {
  const [arrets, setArrets] = useState(2);
  const [employees, setEmployees] = useState(30);
  const coutArret = 8000;
  const coutTotal = arrets * coutArret;
  const reductionTMS = Math.round(coutTotal * 0.4);
  const coutPAW = employees < 50 ? employees * 25 : employees * 20;
  const roi = reductionTMS - coutPAW;
  const roiMultiple = Math.round((reductionTMS / Math.max(coutPAW, 1)) * 10) / 10;

  return (
    <motion.div {...fu(0.1)} style={{ marginBottom: 72 }}>
      <p style={{ fontFamily: fonts.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#f4a261", textTransform: "uppercase", marginBottom: 12 }}>
        Calculateur ROI
      </p>
      <h2 style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: isMobile ? 22 : 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
        Combien vous coûte l&apos;inaction ?
      </h2>
      <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65 }}>
        Estimez le coût de vos arrêts TMS et comparez avec le coût de la prévention.
      </p>

      <div style={{ borderRadius: 24, overflow: "hidden", border: `0.5px solid ${c.border}`, background: c.bgCard }}>
        {/* Sliders */}
        <div style={{
          padding: isMobile ? "24px 20px" : "32px 36px",
          borderBottom: `0.5px solid ${c.border}`,
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24,
        }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontFamily: fonts.b, fontSize: 13, color: c.textSecondary, fontWeight: 600 }}>Arrêts TMS par an</span>
              <span style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 24, color: "#f09595" }}>{arrets}</span>
            </div>
            <input type="range" min={1} max={10} step={1} value={arrets}
              onChange={e => setArrets(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#f09595", cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {["1", "3", "5", "7", "10"].map(v => (
                <span key={v} style={{ fontFamily: fonts.b, fontSize: 10, color: c.textMuted }}>{v}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontFamily: fonts.b, fontSize: 13, color: c.textSecondary, fontWeight: 600 }}>Nombre d&apos;employés</span>
              <span style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 24, color: "#2b5ce6" }}>{employees}</span>
            </div>
            <input type="range" min={10} max={150} step={5} value={employees}
              onChange={e => setEmployees(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#2b5ce6", cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {["10", "30", "50", "100", "150"].map(v => (
                <span key={v} style={{ fontFamily: fonts.b, fontSize: 10, color: c.textMuted }}>{v}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div style={{ padding: isMobile ? "24px 20px" : "32px 36px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            <div style={{ padding: "18px", borderRadius: 16, textAlign: "center", background: "rgba(240,149,149,0.06)", border: "0.5px solid rgba(240,149,149,0.2)" }}>
              <p style={{ fontFamily: fonts.b, fontSize: 11, color: "#f09595", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Coût TMS actuel</p>
              <p style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 26, color: "#f09595", margin: "0 0 4px" }}>
                {coutTotal.toLocaleString("fr-FR")}€
              </p>
              <p style={{ fontFamily: fonts.b, fontSize: 11, color: c.textMuted, margin: 0 }}>/an (estimation INRS)</p>
            </div>

            <div style={{ padding: "18px", borderRadius: 16, textAlign: "center", background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
              <p style={{ fontFamily: fonts.b, fontSize: 11, color: "#7c9fff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>PAW coûte</p>
              <p style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 26, color: "#7c9fff", margin: "0 0 4px" }}>
                {coutPAW.toLocaleString("fr-FR")}€
              </p>
              <p style={{ fontFamily: fonts.b, fontSize: 11, color: c.textMuted, margin: 0 }}>
                /an ({employees < 50 ? "25" : "20"}€/employé)
              </p>
            </div>

            <div style={{
              padding: "18px", borderRadius: 16, textAlign: "center",
              background: roi > 0 ? "rgba(116,198,157,0.08)" : "rgba(244,162,97,0.08)",
              border: `0.5px solid ${roi > 0 ? "rgba(116,198,157,0.25)" : "rgba(244,162,97,0.25)"}`,
            }}>
              <p style={{ fontFamily: fonts.b, fontSize: 11, color: roi > 0 ? "#74c69d" : "#f4a261", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>
                Économie potentielle
              </p>
              <p style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 26, color: roi > 0 ? "#74c69d" : "#f4a261", margin: "0 0 4px" }}>
                {reductionTMS.toLocaleString("fr-FR")}€
              </p>
              <p style={{ fontFamily: fonts.b, fontSize: 11, color: c.textMuted, margin: 0 }}>-40% TMS (études INRS)</p>
            </div>
          </div>

          {/* ROI final */}
          <div style={{
            padding: "18px 20px", borderRadius: 16,
            background: roi > 0 ? "rgba(116,198,157,0.06)" : "rgba(244,162,97,0.06)",
            border: `1px solid ${roi > 0 ? "rgba(116,198,157,0.2)" : "rgba(244,162,97,0.2)"}`,
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          }}>
            <div style={{ flex: 1 }}>
              {roi > 0 ? (
                <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textSecondary, margin: 0, lineHeight: 1.65 }}>
                  Pour <strong style={{ color: c.textPrimary }}>{employees} employés</strong> avec{" "}
                  <strong style={{ color: "#f09595" }}>{arrets} arrêts TMS/an</strong>, PAW peut vous faire économiser{" "}
                  <strong style={{ color: "#74c69d" }}>{roi.toLocaleString("fr-FR")}€/an</strong> nets.
                  Soit un retour sur investissement de <strong style={{ color: "#74c69d" }}>x{roiMultiple}</strong>.
                </p>
              ) : (
                <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textSecondary, margin: 0, lineHeight: 1.65 }}>
                  Même avec peu d&apos;arrêts, PAW agit avant que les TMS deviennent des arrêts.
                  La prévention coûte toujours moins cher que le curatif.
                </p>
              )}
            </div>
            <a href="#contact" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ padding: "12px 24px", borderRadius: 100, background: "#2b5ce6", color: "#fff", fontFamily: fonts.h, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                En savoir plus →
              </div>
            </a>
          </div>

          <p style={{ fontFamily: fonts.b, fontSize: 11, color: c.textMuted, textAlign: "center", marginTop: 10 }}>
            Estimation basée sur les données INRS. Coût moyen d&apos;un arrêt TMS : 8 000€ (salaire maintenu + remplacement + perte productivité). Réduction TMS avec prévention active : -40%.
          </p>
        </div>
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

        {/* ── 1. HERO ── */}
        <motion.div {...fadeUp(0)} style={{ padding: isMobile ? "80px 0 48px" : "96px 0 64px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100, marginBottom: 24,
            background: "rgba(226,75,74,0.08)", border: "0.5px solid rgba(226,75,74,0.2)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f09595", flexShrink: 0 }} />
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#f09595" }}>
              Les TMS représentent 87% des maladies professionnelles en France
            </span>
          </div>

          <h1 style={{
            fontFamily: T.h, fontWeight: 900,
            fontSize: isMobile ? "28px" : "46px",
            color: c.textPrimary, margin: "0 0 20px",
            letterSpacing: "-1px", lineHeight: 1.1,
            maxWidth: 760, marginLeft: "auto", marginRight: "auto",
          }}>
            Vos équipes ont mal.<br />
            Vous ne savez pas exactement pourquoi.<br />
            <span style={{ color: "#2b5ce6" }}>PAW vous le dit — en 5 minutes par employé.</span>
          </h1>

          <p style={{ fontFamily: T.b, fontSize: isMobile ? 15 : 17, color: c.textSecondary, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 12px" }}>
            Un bilan santé au travail complet pour chaque collaborateur.
            Un dashboard RH pour piloter. Un plan d&apos;action concret pour réduire
            les arrêts TMS et améliorer votre score ESG Social.
          </p>

          <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: "0 auto 32px" }}>
            Démo sans engagement · Mise en place en 48h · Aucun contrat longue durée
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                padding: "16px 36px", borderRadius: 100, cursor: "pointer",
                background: "#2b5ce6", color: "#fff",
                fontFamily: T.h, fontWeight: 800, fontSize: 16,
                boxShadow: "0 4px 32px rgba(43,92,230,0.4)",
              }}>
                Demander une démo gratuite →
              </motion.div>
            </a>
            <Link href="/auth?redirect=/entreprise/dashboard&from=entreprise" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "16px 28px", borderRadius: 100, cursor: "pointer",
                background: "transparent", border: `1.5px solid ${c.border}`,
                fontFamily: T.b, fontWeight: 600, fontSize: 15, color: c.textSecondary,
              }}>
                Déjà client →
              </div>
            </Link>
          </div>
        </motion.div>

        {/* ── 2. DOULEURS DRH ── */}
        <motion.div {...fadeUp(0.05)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "#f09595", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, textAlign: "center" }}>
            Ça vous parle ?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
            {[
              {
                emoji: "😮‍💨",
                pain: "\"On a encore 2 arrêts TMS ce trimestre\"",
                desc: "Lombalgies, douleurs cervicales, tendinites — les mêmes causes, les mêmes arrêts. Et personne ne sait vraiment pourquoi.",
              },
              {
                emoji: "📋",
                pain: "\"Le CSSCT me demande un plan de prévention\"",
                desc: "Vous avez besoin de données, d'un rapport et d'actions concrètes. Pas d'un ergonome qui passe une journée et repart.",
              },
              {
                emoji: "🤷",
                pain: "\"Je sais pas par où commencer\"",
                desc: "La prévention TMS c'est large. PAW vous dit exactement quels postes sont à risque et quelles actions ont le plus d'impact.",
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)} style={{
                padding: "24px", borderRadius: 18,
                background: "rgba(226,75,74,0.04)", border: "0.5px solid rgba(226,75,74,0.15)",
              }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{item.emoji}</span>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: "0 0 10px", lineHeight: 1.3, fontStyle: "italic" }}>
                  {item.pain}
                </p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── 3. STATS TMS ── */}
        <motion.div {...fadeUp(0.05)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 20 : 26, color: c.textPrimary, textAlign: "center", margin: "0 0 24px", letterSpacing: "-0.5px" }}>
            Les TMS ne sont pas une fatalité.{" "}
            <span style={{ color: "#2b5ce6" }}>Ce sont des signaux qu&apos;on peut capter à temps.</span>
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            borderRadius: 20, overflow: "hidden",
            border: `0.5px solid ${c.border}`, background: c.bgCard,
          }}>
            {[
              { value: "87%", label: "des maladies professionnelles sont des TMS", source: "INRS 2023" },
              { value: "73j", label: "d'arrêt de travail en moyenne par TMS", source: "Assurance Maladie" },
              { value: "~8 000€", label: "coût moyen d'un seul arrêt TMS pour l'entreprise", source: "INRS" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "28px 24px", textAlign: "center",
                borderRight: !isMobile && i < 2 ? `0.5px solid ${c.border}` : "none",
                borderBottom: isMobile && i < 2 ? `0.5px solid ${c.border}` : "none",
              }}>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 36, color: "#2b5ce6", margin: "0 0 8px" }}>{s.value}</p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.55, margin: "0 0 6px" }}>{s.label}</p>
                <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>Source : {s.source}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 4. CALCULATEUR ROI ── */}
        <ROICalculator isMobile={isMobile} c={c as Record<string, string>} T={T} fadeUp={fadeUp} />

        {/* ── 5. COMMENT ÇA MARCHE ── */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>
            Simple à déployer
          </p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 22 : 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Opérationnel en 48h.<br />Résultats en 30 jours.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 32, lineHeight: 1.65, maxWidth: 500 }}>
            Pas d&apos;installation. Pas de formation IT. Pas de contrat longue durée.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
            {[
              {
                step: "01", icon: "⚡", color: "#2b5ce6",
                title: "On crée votre espace",
                desc: "Après votre démo, on configure votre dashboard RH en 48h. Vous recevez un lien d'invitation à partager à vos équipes.",
                detail: "→ Vous ne faites rien techniquement",
              },
              {
                step: "02", icon: "📱", color: "#7c3aed",
                title: "Vos employés font leur bilan",
                desc: "5 à 10 minutes sur mobile ou PC. Questionnaire + analyse vidéo IA posturale. Chaque employé reçoit son propre rapport personnalisé.",
                detail: "→ Taux de participation moyen : 87%",
              },
              {
                step: "03", icon: "📊", color: "#1d9e75",
                title: "Vous pilotez et agissez",
                desc: "Votre dashboard RH se remplit en temps réel. Identifiez les zones à risque, les actions prioritaires, et suivez l'évolution.",
                detail: "→ Premier rapport sous 30 jours",
              },
            ].map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} style={{
                padding: "24px", borderRadius: 20,
                background: c.bgCard, border: `0.5px solid ${c.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ fontFamily: T.h, fontWeight: 900, fontSize: 11, color: step.color, opacity: 0.5, letterSpacing: "0.1em" }}>
                    {step.step}
                  </div>
                  <div style={{ width: 1, height: 12, background: c.border }} />
                  <span style={{ fontSize: 20 }}>{step.icon}</span>
                </div>
                <h3 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: c.textPrimary, margin: "0 0 10px" }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, lineHeight: 1.65, margin: "0 0 12px" }}>
                  {step.desc}
                </p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: step.color, fontWeight: 600, margin: 0 }}>
                  {step.detail}
                </p>
              </motion.div>
            ))}
          </div>

          <div style={{
            marginTop: 16, padding: "16px 20px", borderRadius: 16,
            background: "rgba(43,92,230,0.04)", border: "0.5px solid rgba(43,92,230,0.15)",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤔</span>
            <div>
              <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: "0 0 4px" }}>
                &quot;Est-ce que mes employés vont vraiment le faire ?&quot;
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.65 }}>
                C&apos;est la question qu&apos;on nous pose le plus souvent. La réponse : oui, parce que chaque employé reçoit
                {" "}<strong style={{ color: c.textPrimary }}>son propre bilan personnel</strong> —
                pas un rapport collectif anonyme. Quand les gens savent qu&apos;ils vont avoir des réponses sur{" "}
                <em>leurs</em> douleurs, ils participent. Taux moyen constaté : <strong style={{ color: "#74c69d" }}>87%</strong>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── 6. DASHBOARD MOCKUP ── */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>
            Votre dashboard RH
          </p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 22 : 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Tout ce qu&apos;il faut pour décider.<br />
            <span style={{ color: "#2b5ce6" }}>Rien de superflu.</span>
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65, maxWidth: 520 }}>
            En un coup d&apos;œil : qui est à risque, pourquoi, et quoi faire en priorité.
            Données anonymisées, conformes RGPD.
          </p>

          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(43,92,230,0.3)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
            {/* Browser chrome */}
            <div style={{ background: "#1a1a2e", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((col, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: col }} />
                ))}
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 12px", marginLeft: 8 }}>
                <span style={{ fontFamily: T.b, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  postureatwork.com/entreprise/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard preview */}
            <div style={{ background: "#0f0f1a", padding: isMobile ? "16px" : "20px", maxHeight: 520, overflow: "hidden", position: "relative" }}>
              {/* Mini header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "#fff" }}>Arcadia Distribution</div>
                  <div style={{ fontFamily: T.b, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    Plan Croissance · 47 employés · 41 bilans
                  </div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 100, background: "rgba(212,162,42,0.12)", border: "1px solid rgba(212,162,42,0.3)" }}>
                  <span style={{ fontSize: 14 }}>🥈</span>
                  <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "#d4a22a" }}>Score Social Silver</span>
                </div>
              </div>

              {/* Score + KPIs */}
              <div style={{ borderRadius: 16, padding: "16px", background: "rgba(116,198,157,0.06)", border: "0.5px solid rgba(116,198,157,0.2)", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2.5px solid #74c69d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(116,198,157,0.1)" }}>
                    <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "#74c69d", lineHeight: 1 }}>67</span>
                    <span style={{ fontFamily: T.b, fontSize: 8, color: "rgba(255,255,255,0.3)" }}>/100</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 3 }}>Score santé entreprise</div>
                    <div style={{ fontFamily: T.b, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
                      Des améliorations importantes identifiées — 11 employés en zone critique
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {[
                    { val: "11", label: "Critique", bg: "rgba(240,149,149,0.1)", color: "#f09595" },
                    { val: "19", label: "À améliorer", bg: "rgba(244,162,97,0.1)", color: "#f4a261" },
                    { val: "11", label: "Bon niveau", bg: "rgba(116,198,157,0.1)", color: "#74c69d" },
                    { val: "87%", label: "Participation", bg: "rgba(43,92,230,0.1)", color: "#7c9fff" },
                  ].map((k, i) => (
                    <div key={i} style={{ padding: "8px 6px", borderRadius: 10, background: k.bg, textAlign: "center" }}>
                      <div style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: k.color }}>{k.val}</div>
                      <div style={{ fontFamily: T.b, fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{k.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertes */}
              <div style={{ marginBottom: 12 }}>
                {[
                  { color: "rgba(240,149,149,0.08)", border: "rgba(240,149,149,0.2)", text: "🔴 Douleurs lombaires critiques — 8 employés entrepôt. Formation gestes et postures urgente." },
                  { color: "rgba(244,162,97,0.06)", border: "rgba(244,162,97,0.18)", text: "🟠 11 employés bureau sur laptop sans rehausseur — charge cervicale +12kg permanente." },
                ].map((a, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: a.color, border: `0.5px solid ${a.border}`, marginBottom: 6, fontFamily: T.b, fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                    {a.text}
                  </div>
                ))}
              </div>

              {/* Tabs mini */}
              <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {["📊 Vue d'ensemble", "👥 Équipe", "📈 Évolution", "🏋️ Exercices"].map((tab, i) => (
                  <div key={i} style={{
                    padding: "5px 10px", borderRadius: 7,
                    background: i === 0 ? "#2b5ce6" : "rgba(255,255,255,0.04)",
                    fontFamily: T.b, fontSize: 10, fontWeight: 600,
                    color: i === 0 ? "#fff" : "rgba(255,255,255,0.35)",
                    border: i === 0 ? "none" : "0.5px solid rgba(255,255,255,0.08)",
                  }}>
                    {tab}
                  </div>
                ))}
              </div>

              {/* Scores dimensions */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px" }}>
                <div style={{ fontFamily: T.b, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Scores par dimension
                </div>
                {[
                  { emoji: "💻", name: "Setup", score: 58, color: "#f4a261", w: "58%" },
                  { emoji: "🩺", name: "Douleurs", score: 52, color: "#f09595", w: "52%" },
                  { emoji: "⏱️", name: "Habitudes", score: 61, color: "#f4a261", w: "61%" },
                  { emoji: "🌙", name: "Sommeil", score: 72, color: "#74c69d", w: "72%" },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: 13, width: 18 }}>{d.emoji}</span>
                    <span style={{ fontFamily: T.b, fontSize: 11, color: "rgba(255,255,255,0.6)", flex: 1 }}>{d.name}</span>
                    <div style={{ width: 100, height: 4, borderRadius: 100, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ width: d.w, height: "100%", borderRadius: 100, background: d.color }} />
                    </div>
                    <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 12, color: d.color, width: 24, textAlign: "right" }}>{d.score}</span>
                  </div>
                ))}
              </div>

              {/* Gradient fade */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to bottom, transparent, #0f0f1a)", pointerEvents: "none" }} />
            </div>

            {/* CTA overlay */}
            <div style={{ background: "#0f0f1a", padding: "16px 20px", textAlign: "center", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
              <a href="#contact" style={{ textDecoration: "none" }}>
                <div style={{ display: "inline-block", padding: "11px 24px", borderRadius: 100, background: "#2b5ce6", color: "#fff", fontFamily: T.h, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Voir une démo complète →
                </div>
              </a>
            </div>
          </div>

          {/* Points clés */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
            {[
              { icon: "🎯", text: "Actions prioritaires identifiées automatiquement" },
              { icon: "🔒", text: "Données 100% anonymisées — RGPD garanti" },
              { icon: "📈", text: "Suivi de l'évolution trimestrielle en temps réel" },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", borderRadius: 12, background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
                <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, lineHeight: 1.4 }}>{p.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 7. VS ERGONOME ── */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>PAW vs Ergonome</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Un ergonome passe une journée.<br />
            <span style={{ color: "#2b5ce6" }}>PAW reste toute l&apos;année.</span>
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65 }}>
            L&apos;ergonome vous donne un rapport. PAW donne un outil à chaque employé — et vous donne les données pour agir tout au long de l&apos;année.
          </p>
          {isMobile ? (
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
            <div style={{ borderRadius: 16, overflow: "hidden", border: `0.5px solid ${c.border}` }}>
              {VS_ERGO.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: i < VS_ERGO.length - 1 ? `0.5px solid ${c.border}` : "none" }}>
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

        {/* ── 8. DOUBLE VALEUR ── */}
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
              💡 Pour 30 employés, l&apos;accès individuel seul vaudrait <strong style={{ color: c.textPrimary }}>600€</strong> (19,99€/personne).
              Inclus dans votre abonnement PAW Entreprise.
            </p>
          </div>
        </motion.div>

        {/* ── 9. FEATURES ── */}
        <motion.div {...fadeUp(0.15)} style={{ marginBottom: 72 }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Ce qui est inclus</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Un programme de prévention TMS<br />clé en main.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 32, lineHeight: 1.65 }}>
            Pas juste un logiciel. Un accompagnement complet avec un kinésithérapeute derrière.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 14 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)} style={{ padding: "22px", borderRadius: 16, background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}12`, border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>
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

        {/* ── 10. PRICING ── */}
        <PricingCalculator isMobile={isMobile} c={c} T={T} fadeUp={fadeUp} />

        {/* ── 11. CONTACT / DÉMO ── */}
        <motion.div {...fadeUp(0.25)} id="contact" style={{ borderRadius: 24, padding: "40px 36px", marginBottom: 32, background: c.bgCard, border: `0.5px solid ${c.border}` }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Contact</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: c.textPrimary, marginBottom: 8 }}>
            Parlons de vos équipes.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65 }}>
            Décrivez-nous votre situation — effectif, secteur, problématiques — et on revient vers vous sous 24h pour organiser une démo personnalisée.
          </p>

          {contactSent ? (
            <div style={{ padding: "28px", borderRadius: 16, textAlign: "center", background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.25)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#1d9e75", marginBottom: 6 }}>Message reçu !</p>
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

        {/* ── FOOTER ── */}
        <div style={{ textAlign: "center", paddingBottom: 20, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: isMobile ? 12 : 24 }}>
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
