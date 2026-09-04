"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import PricingCalculator from "@/components/PricingCalculator";
import ContactForm from "@/components/ContactForm";

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
    desc: "Chaque collaborateur fait son bilan en 5 minutes. Questionnaire clinique + analyse vidéo IA.",
    color: "#2b5ce6",
  },
  {
    icon: "📊",
    title: "Dashboard RH avec actions prioritaires",
    desc: "Scores par dimension, zones à risque, rapport trimestriel kiné. PAW vous dit exactement quoi faire — pas juste des données brutes.",
    color: "#7c3aed",
  },
];

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

export default function EntrepriseClient() {
  const { c } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

        {/* ── 2. DOULEURS DRH + STATS ── */}
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
                emoji: "⚖️",
                pain: "\"Le CPPT me demande un plan de prévention concret\"",
                desc: "La loi bien-être au travail oblige toute entreprise à documenter sa prévention TMS. PAW vous fournit les données et le rapport — sans effort supplémentaire.",
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

          {/* Stats rapides sous les cards douleurs */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 8, marginTop: 16 }}>
            {[
              { value: "87%", label: "des maladies pro sont des TMS", source: "INRS" },
              { value: "73j", label: "d'arrêt moyen par TMS", source: "Assurance Maladie" },
              { value: "~8 000€", label: "coût moyen d'un arrêt TMS", source: "INRS" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 14,
                background: "rgba(226,75,74,0.04)",
                border: "0.5px solid rgba(226,75,74,0.12)", textAlign: "center" }}>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24,
                  color: "#f09595", margin: "0 0 4px" }}>{s.value}</p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted,
                  margin: "0 0 2px", lineHeight: 1.4 }}>{s.label}</p>
                <p style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted,
                  opacity: 0.5, margin: 0 }}>Source : {s.source}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 3. DASHBOARD MOCKUP ── */}
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

        {/* ── 4. COMMENT ÇA MARCHE ── */}
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

          <div style={{ marginTop: 10, padding: "12px 16px", borderRadius: 12,
            background: "rgba(116,198,157,0.06)", border: "0.5px solid rgba(116,198,157,0.15)",
            display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚖️</span>
            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.65 }}>
              <strong style={{ color: c.textSecondary }}>Obligation légale :</strong>{" "}
              La loi bien-être au travail (Belgique) et le DUER (France) imposent à toute entreprise
              un plan de prévention des risques TMS. PAW documente cette obligation —
              et vous fournit les preuves en cas de contrôle.
            </p>
          </div>

          {/* Ce qui est inclus — 2 features compactes */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 14, marginTop: 24 }}>
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

        {/* ── 5. CALCULATEUR ROI + PRICING ── */}
        <ROICalculator isMobile={isMobile} c={c as Record<string, string>} T={T} fadeUp={fadeUp} />
        <PricingCalculator isMobile={isMobile} c={c} T={T} fadeUp={fadeUp} />


        {/* ESG discret */}
        <motion.div {...fadeUp(0.05)} style={{ marginBottom: 40 }}>
          <div style={{ padding: "18px 22px", borderRadius: 16,
            background: "rgba(116,198,157,0.04)", border: "0.5px solid rgba(116,198,157,0.15)",
            display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🌿</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
                color: c.textPrimary, margin: "0 0 4px" }}>
                Un bonus pour votre reporting social
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted,
                margin: 0, lineHeight: 1.65 }}>
                Le rapport PAW alimente vos indicateurs bien-être pour votre CPPT,
                vos appels d&apos;offres grands comptes et votre score EcoVadis Social —
                sans travail supplémentaire de votre part.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Badges tech — discrets */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          gap: 16, flexWrap: "wrap", marginBottom: 48, opacity: 0.5 }}>
          <span style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted }}>
            Propulsé par
          </span>
          {["✦ Claude AI (Anthropic)", "Stripe", "Supabase EU"].map((b, i) => (
            <span key={i} style={{ fontFamily: T.b, fontSize: 11,
              color: c.textMuted, fontWeight: 600 }}>
              {b}
            </span>
          ))}
          <span style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted }}>·</span>
          <span style={{ fontFamily: T.b, fontSize: 11, color: "#74c69d", fontWeight: 600 }}>
            🔒 RGPD · Données EU
          </span>
        </div>

        {/* ── 6. CONTACT / DÉMO ── */}
        <motion.div {...fadeUp(0.25)} id="contact" style={{ borderRadius: 24, padding: "40px 36px", marginBottom: 32, background: c.bgCard, border: `0.5px solid ${c.border}` }}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Contact</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: c.textPrimary, marginBottom: 8 }}>
            Parlons de vos équipes.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65 }}>
            Décrivez-nous votre situation — effectif, secteur, problématiques — et on revient vers vous sous 24h pour organiser une démo personnalisée.
          </p>

          <ContactForm />
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
