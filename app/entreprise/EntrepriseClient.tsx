"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { ParcoursStep } from "@/components/dashboard/ParcoursStep";
import { PLANS, breakEvenDays, COUT_JOUR_ABSENCE_DIRECT, COUT_JOUR_ABSENCE_COMPLET, SECUREX_URL, type PlanKey } from "@/lib/plans";

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
    desc: "Chaque collaborateur fait son bilan en 5 minutes. Questionnaire clinique + analyse vidéo IA. Accès premium à vie inclus.",
    color: "#2b5ce6",
  },
  {
    icon: "📊",
    title: "Dashboard RH avec actions prioritaires",
    desc: "Scores par dimension, zones à risque, rapport trimestriel kiné. PAW vous dit exactement quoi faire — pas juste des données brutes.",
    color: "#7c3aed",
  },
];

const OUTCOMES = [
  {
    icon: "🔎", color: "#6f9bff", title: "Voir",
    text: "Où sont les risques dans vos équipes, sans jamais exposer un salarié.",
    items: ["Bilan + analyse vidéo IA de chaque employé", "Dashboard RH 100 % anonymisé"],
  },
  {
    icon: "🧭", color: "#3fe0a0", title: "Agir",
    text: "Un parcours d'amélioration pour savoir quoi faire, dans quel ordre.",
    items: ["Parcours en 5 étapes + plan d'action suivi", "Call de restitution avec le kiné"],
  },
  {
    icon: "📈", color: "#ffa347", title: "Prouver",
    text: "Des résultats que vous pouvez montrer à votre direction et à vos équipes.",
    items: ["Rapport PDF pour votre direction", "Rapport bien-être valorisable"],
  },
];

function PlanSelector({
  isMobile, c, T: fonts, fadeUp: fu,
}: {
  isMobile: boolean;
  c: { textPrimary: string; textSecondary: string; textMuted: string; bgCard: string; bgCard2: string; border: string; borderStrong: string; cardGrad: string; bgPrimary: string };
  T: { h: string; b: string };
  fadeUp: (delay?: number) => object;
}) {
  const [selected, setSelected] = useState<PlanKey>("pme");
  const plan = PLANS.find(p => p.key === selected) ?? PLANS[1];
  const days = breakEvenDays(plan);
  const daysCeil = days === null ? 0 : Math.ceil(days);
  const employeesPerDay = days !== null && plan.maxEmployees ? Math.round(plan.maxEmployees / days) : 0;

  return (
    <motion.div {...fu(0.1)} style={{ marginBottom: 72 }}>
      <p style={{ fontFamily: fonts.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>
        Tarifs
      </p>
      <h2 style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: isMobile ? 22 : 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
        Le Diagnostic PAW : un forfait clair, en paiement unique.
      </h2>
      <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.65, maxWidth: 580 }}>
        Choisissez la taille de votre entreprise. Pas d&apos;abonnement : un diagnostic complet de vos équipes, et le premium PAW à vie pour chaque employé.
      </p>

      <div style={{ borderRadius: 28, overflow: "hidden", border: `1px solid ${c.borderStrong}`, background: c.cardGrad, padding: isMobile ? "20px 14px" : "32px 36px" }}>
        {/* 1. Choix du forfait */}
        <div role="radiogroup" aria-label="Taille de votre entreprise" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10, marginBottom: 22 }}>
          {PLANS.map(p => {
            const active = p.key === selected;
            return (
              <button key={p.key} type="button" role="radio" aria-checked={active} onClick={() => setSelected(p.key)}
                style={{
                  textAlign: "left", padding: isMobile ? "14px 12px" : "16px 16px", borderRadius: 18, cursor: "pointer",
                  background: active ? "linear-gradient(145deg, rgba(43,92,230,0.40), rgba(111,155,255,0.14))" : c.bgCard2,
                  border: active ? "1.5px solid #6f9bff" : `1px solid ${c.border}`,
                  boxShadow: active ? "0 10px 30px rgba(43,92,230,0.28)" : "none",
                }}>
                <span style={{ display: "block", fontFamily: fonts.h, fontWeight: 800, fontSize: 14, color: active ? "#6f9bff" : c.textPrimary, marginBottom: 2 }}>{p.name}</span>
                <span style={{ display: "block", fontFamily: fonts.b, fontSize: 12, color: c.textMuted, marginBottom: 8 }}>
                  {p.maxEmployees ? `jusqu'à ${p.maxEmployees} employés` : "plus de 100 employés"}
                </span>
                <span style={{ display: "block", fontFamily: fonts.h, fontWeight: 900, fontSize: isMobile ? 20 : 24, color: c.textPrimary, letterSpacing: "-1px" }}>
                  {p.price !== null ? `${p.price.toLocaleString("fr-FR")} €` : "Sur devis"}
                </span>
              </button>
            );
          })}
        </div>

        {plan.price === null ? (
          <div style={{ textAlign: "center", padding: isMobile ? "12px 4px 8px" : "16px 20px 8px" }}>
            <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textMuted, margin: "0 auto 8px", lineHeight: 1.65, maxWidth: 540 }}>
              Au-delà de 100 employés, nous construisons une offre sur mesure : plusieurs sites, intégration SIRH, accompagnement dédié.
            </p>
            <p style={{ fontFamily: fonts.b, fontSize: 13, color: "#6f9bff", margin: "0 0 24px" }}>Tarif négocié · Déploiement accompagné</p>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <span style={{ display: "inline-block", padding: "15px 34px", borderRadius: 100, background: "#2b5ce6", color: "#fff", fontFamily: fonts.h, fontWeight: 800, fontSize: 15, boxShadow: "0 6px 26px rgba(43,92,230,0.45)" }}>
                Demander un devis →
              </span>
            </a>
          </div>
        ) : (
          <div>
            {/* 2. Prix */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: isMobile ? 52 : 68, color: c.textPrimary, letterSpacing: "-3px", lineHeight: 1 }}>
                  {plan.price.toLocaleString("fr-FR")} €
                </span>
                <span style={{ fontFamily: fonts.b, fontSize: 15, color: c.textMuted }}>paiement unique</span>
              </div>
              <p style={{ fontFamily: fonts.b, fontSize: 13.5, color: c.textSecondary, margin: "8px 0 0", lineHeight: 1.6 }}>
                Jusqu&apos;à <strong style={{ color: c.textPrimary }}>{plan.maxEmployees} employés</strong> · dashboard RH accessible 12 mois · premium à vie pour chaque employé
              </p>
              <p style={{ fontFamily: fonts.b, fontSize: 11.5, color: c.textMuted, margin: "6px 0 0" }}>TVA précisée sur le devis.</p>
            </div>

            {/* 3. Rentabilité : jours d'absence évités */}
            <div style={{ borderRadius: 18, padding: isMobile ? "18px 14px" : "22px 24px", marginBottom: 22, background: "rgba(63,224,160,0.08)", border: "1px solid rgba(63,224,160,0.28)" }}>
              <p style={{ fontFamily: fonts.h, fontWeight: 800, fontSize: isMobile ? 15 : 17, color: c.textPrimary, margin: "0 0 14px", textAlign: "center", lineHeight: 1.4 }}>
                💡 Rentabilisé dès {daysCeil} jours d&apos;absence évités sur {plan.maxEmployees} employés
              </p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr auto 1fr", alignItems: "center", gap: isMobile ? 8 : 12, marginBottom: 14 }}>
                <div style={{ textAlign: "center", padding: "14px 10px", borderRadius: 14, background: "rgba(255,123,123,0.10)", border: "1px solid rgba(255,123,123,0.3)" }}>
                  <p style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 24, color: "#ff7b7b", margin: "0 0 2px" }}>{COUT_JOUR_ABSENCE_DIRECT} €</p>
                  <p style={{ fontFamily: fonts.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.4 }}>coûte en moyenne<br />1 jour d&apos;absence</p>
                </div>
                <span aria-hidden="true" style={{ textAlign: "center", fontFamily: fonts.h, fontWeight: 900, fontSize: 18, color: c.textMuted }}>×</span>
                <div style={{ textAlign: "center", padding: "14px 10px", borderRadius: 14, background: "rgba(43,92,230,0.14)", border: "1px solid rgba(111,155,255,0.4)" }}>
                  <p style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 24, color: "#6f9bff", margin: "0 0 2px" }}>{daysCeil} jours</p>
                  <p style={{ fontFamily: fonts.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.4 }}>d&apos;absence évités<br />sur {plan.maxEmployees} employés</p>
                </div>
                <span aria-hidden="true" style={{ textAlign: "center", fontFamily: fonts.h, fontWeight: 900, fontSize: 18, color: c.textMuted }}>≥</span>
                <div style={{ textAlign: "center", padding: "14px 10px", borderRadius: 14, background: "rgba(63,224,160,0.12)", border: "1px solid rgba(63,224,160,0.4)" }}>
                  <p style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 24, color: "#3fe0a0", margin: "0 0 2px" }}>{plan.price.toLocaleString("fr-FR")} €</p>
                  <p style={{ fontFamily: fonts.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.4 }}>le prix du Diagnostic<br />{plan.name}</p>
                </div>
              </div>
              <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textSecondary, margin: "0 0 10px", lineHeight: 1.65, textAlign: "center" }}>
                Soit environ <strong style={{ color: c.textPrimary }}>1 jour d&apos;absence évité pour {employeesPerDay} employés</strong>. Et davantage si l&apos;on compte le remplacement et la réorganisation.
              </p>
              <p style={{ fontFamily: fonts.b, fontSize: 11, color: c.textMuted, margin: 0, lineHeight: 1.55, textAlign: "center" }}>
                {COUT_JOUR_ABSENCE_DIRECT} € = salaire garanti versé pour un jour d&apos;absence. Avec les coûts indirects, Securex estime le coût complet à {COUT_JOUR_ABSENCE_COMPLET.toLocaleString("fr-FR")} € par jour.{" "}
                Source :{" "}
                <a href={SECUREX_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#6f9bff" }}>Securex, L&apos;absentéisme en 2022</a>
                {" "}(moyenne belge, à titre indicatif). PAW ne garantit pas un nombre de jours évités.
              </p>
            </div>

            {/* 4. Ce que vous obtenez */}
            <p style={{ fontFamily: fonts.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: c.textMuted, textTransform: "uppercase", margin: "0 0 12px" }}>
              Ce que vous obtenez
            </p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 26 }}>
              {OUTCOMES.map(o => (
                <div key={o.title} style={{ borderRadius: 18, padding: "18px", background: `linear-gradient(160deg, ${o.color}22, ${o.color}0d)`, border: `1px solid ${o.color}55` }}>
                  <p style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 16, color: o.color, margin: "0 0 6px" }}>{o.icon} {o.title}</p>
                  <p style={{ fontFamily: fonts.b, fontSize: 13, color: c.textSecondary, margin: "0 0 10px", lineHeight: 1.55 }}>{o.text}</p>
                  {o.items.map(it => (
                    <p key={it} style={{ display: "flex", gap: 8, fontFamily: fonts.b, fontSize: 12.5, color: c.textMuted, margin: "0 0 4px", lineHeight: 1.45 }}>
                      <span aria-hidden="true" style={{ color: o.color }}>✓</span>{it}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* 5. CTA */}
            <a href="#contact" style={{ textDecoration: "none" }}>
              <span style={{ display: "block", textAlign: "center", padding: "17px 0", borderRadius: 100, background: "#2b5ce6", color: "#fff", fontFamily: fonts.h, fontWeight: 800, fontSize: 16, boxShadow: "0 6px 28px rgba(43,92,230,0.5)" }}>
                Demander une démo — Diagnostic {plan.name} →
              </span>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}

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
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff7b7b", flexShrink: 0 }} />
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#ff7b7b" }}>
              Les TMS représentent plus de 80 % des maladies professionnelles reconnues en France
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
            Démo sans engagement · Mise en place rapide · Aucun contrat longue durée
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
          <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "#ff7b7b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, textAlign: "center" }}>
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
              { value: "+80 %", label: "des maladies pro reconnues sont des TMS", source: "INRS" },
              { value: "~40 000", label: "TMS du membre supérieur reconnus par an", source: "INRS" },
              { value: "+11 M", label: "de journées de travail perdues en 2021", source: "INRS" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 14,
                background: "rgba(226,75,74,0.04)",
                border: "0.5px solid rgba(226,75,74,0.12)", textAlign: "center" }}>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24,
                  color: "#ff7b7b", margin: "0 0 4px" }}>{s.value}</p>
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
            En un coup d&apos;œil : où sont les risques, pourquoi, et quoi faire en priorité.
            Données anonymisées, conformes RGPD. (Exemple illustratif.)
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

            {/* Dashboard preview — mêmes cartes, couleurs et thème que le vrai dashboard */}
            <div style={{ background: c.bgPrimary, padding: isMobile ? "16px 12px" : "24px", maxHeight: isMobile ? 560 : 640, overflow: "hidden", position: "relative" }}>
              {/* En-tête */}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
                <div>
                  <p style={{ fontFamily: T.b, fontSize: 11, color: "#6f9bff", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>🏢 Dashboard RH</p>
                  <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: c.textPrimary, margin: "0 0 4px" }}>Arcadia Distribution</p>
                  <p style={{ fontFamily: T.b, fontSize: 12.5, color: c.textMuted, margin: 0 }}>Forfait Équipe · 47 employés inscrits · 41 bilans complétés</p>
                </div>
                {!isMobile && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    {[
                      { t: "🔗 Inviter des employés", bg: "rgba(43,92,230,0.15)", col: "#6f9bff" },
                      { t: "📊 Exporter Excel (CSV)", bg: "rgba(111,155,255,0.15)", col: "#6f9bff" },
                      { t: "📄 Exporter PDF", bg: "rgba(29,158,117,0.15)", col: "#1d9e75" },
                    ].map(b => (
                      <span key={b.t} style={{ padding: "8px 14px", borderRadius: 100, background: b.bg, color: b.col, fontFamily: T.b, fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{b.t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Score santé entreprise */}
              <div style={{ borderRadius: 20, padding: isMobile ? "16px" : "24px", marginBottom: 18, background: "linear-gradient(145deg, #ffa34738, rgba(43,92,230,0.22))", border: "1px solid #ffa34777", boxShadow: "0 10px 34px #ffa34722" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", position: "relative", display: "grid", placeItems: "center", flexShrink: 0, background: `conic-gradient(#ffa347 0 67%, ${c.border} 0)`, boxShadow: "0 0 22px #ffa34744" }}>
                    <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: c.bgPrimary }} />
                    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#ffa347", lineHeight: 1 }}>67</span>
                      <span style={{ fontFamily: T.b, fontSize: 9, color: c.textMuted, marginTop: 2 }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: c.textPrimary, margin: "0 0 4px" }}>Score santé entreprise</p>
                    <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>Des améliorations sont possibles.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8 }}>
                  {[
                    { label: "Zone critique", value: "11", color: "#ff7b7b" },
                    { label: "À améliorer", value: "19", color: "#ffa347" },
                    { label: "Bon niveau", value: "11", color: "#3fe0a0" },
                    { label: "Participation", value: "87%", color: "#6f9bff" },
                  ].map(z => (
                    <div key={z.label} style={{ textAlign: "center", padding: "14px 12px", borderRadius: 18, background: `linear-gradient(160deg, ${z.color}55, ${z.color}1f)`, border: `1px solid ${z.color}aa`, boxShadow: `0 8px 24px ${z.color}2a` }}>
                      <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: z.color, margin: "0 0 4px" }}>{z.value}</p>
                      <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>{z.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Onglets */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 5, borderRadius: 20, background: c.bgCard2, border: `1px solid ${c.border}`, marginBottom: 18 }}>
                {["📊 Vue d'ensemble", "🧭 Parcours", "🔬 Analyse", "📋 Rapport", "👥 Équipe", "📈 Évolution", "🏋️ Exercices", "📚 Ressources"].map((tab, i) => (
                  <span key={tab} style={{ flex: "1 1 auto", textAlign: "center", padding: isMobile ? "8px 10px" : "10px 8px", borderRadius: 15, whiteSpace: "nowrap", fontFamily: T.b, fontWeight: 600, fontSize: isMobile ? 12 : 13, background: i === 1 ? "#2b5ce6" : "transparent", color: i === 1 ? "#fff" : c.textMuted, boxShadow: i === 1 ? "0 4px 14px rgba(43,92,230,0.5)" : "none" }}>{tab}</span>
                ))}
              </div>

              {/* Parcours d'amélioration */}
              <div style={{ borderRadius: 20, padding: "18px 22px", background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.18)", marginBottom: 20 }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: c.textPrimary, margin: "0 0 4px" }}>🧭 Parcours d&apos;amélioration</p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.65 }}>
                  Le chemin concret, étape par étape, pour réduire les TMS dans votre équipe : repérer les priorités, décider et suivre les actions, équiper les postes, installer des routines, puis vérifier les progrès.
                </p>
              </div>

              <ParcoursStep c={c} n={1} title="Repérer" subtitle="Les priorités de votre équipe">
                <div style={{ borderRadius: 24, padding: isMobile ? "18px" : "24px", background: "rgba(43,92,230,0.12)", border: "1px solid rgba(111,155,255,0.30)", marginBottom: 16 }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: "0 0 4px" }}>🎯 Actions prioritaires pour votre équipe</p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: "0 0 18px" }}>
                    Basées sur les scores les plus bas de vos employés — sur les dimensions que vous pouvez directement améliorer.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { action: "Identifier les postes à risque et adapter l'environnement", emoji: "🩺", label: "Douleurs", avg: 52, impact: "Prévention des arrêts de travail" },
                      { action: "Auditer les postes de travail — écrans, chaises, claviers", emoji: "💻", label: "Setup", avg: 58, impact: "Impact direct sur 3 dimensions" },
                      { action: "Mettre en place des pauses actives toutes les 45 minutes", emoji: "⏱️", label: "Habitudes", avg: 61, impact: "Réduction immédiate des TMS chroniques" },
                    ].map((a, i) => (
                      <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 18, background: c.cardGrad, border: `1px solid ${c.border}` }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "#2b5ce6", boxShadow: "0 3px 10px rgba(43,92,230,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.h, fontWeight: 900, fontSize: 12, color: "#fff" }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: "0 0 2px" }}>{a.action}</p>
                          <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>
                            {a.emoji} {a.label} · Score moyen : <span style={{ color: "#ffa347", fontWeight: 600 }}>{a.avg}/100</span> · {a.impact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ParcoursStep>

              <ParcoursStep c={c} n={2} title="Décider" subtitle="Les actions à mener et leur suivi" defaultOpen={false}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0 }}>Plan d&apos;action classé par impact, avec statut, responsable et échéance.</p>
              </ParcoursStep>
              <ParcoursStep c={c} n={3} title="S'équiper" subtitle="Le matériel qui fait la différence" defaultOpen={false}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0 }}>Équipements recommandés par type de poste.</p>
              </ParcoursStep>
              <ParcoursStep c={c} n={4} title="Pratiquer" subtitle="Des routines courtes, chaque semaine" defaultOpen={false}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0 }}>Programme de 10 minutes, 3 fois par semaine.</p>
              </ParcoursStep>

              {/* Fondu */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: `linear-gradient(to bottom, transparent, ${c.bgPrimary})`, pointerEvents: "none" }} />
            </div>

            {/* CTA overlay */}
            <div style={{ background: c.bgPrimary, padding: "16px 20px", textAlign: "center", borderTop: `0.5px solid ${c.border}` }}>
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
              { icon: "🧭", text: "Un parcours d'amélioration en 5 étapes : on vous dit quoi faire, pas seulement quoi mesurer" },
              { icon: "🔒", text: "Aucune donnée individuelle visible par l'employeur — vous ne voyez que des résultats agrégés" },
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
            Mise en place rapide.<br />Un premier rapport dès que vos équipes ont répondu.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 32, lineHeight: 1.65, maxWidth: 500 }}>
            Pas d&apos;installation. Pas de formation IT. Pas de contrat longue durée.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
            {[
              {
                step: "01", icon: "⚡", color: "#2b5ce6",
                title: "On crée votre espace",
                desc: "Après votre démo, on configure votre dashboard RH. Vous recevez un lien d'invitation à partager à vos équipes.",
                detail: "→ Vous ne faites rien techniquement",
              },
              {
                step: "02", icon: "📱", color: "#7c3aed",
                title: "Vos employés font leur bilan",
                desc: "5 à 10 minutes sur mobile ou PC. Questionnaire + analyse vidéo IA posturale. Chaque employé reçoit son propre rapport personnalisé.",
                detail: "→ Chaque collaborateur reçoit son propre bilan",
              },
              {
                step: "03", icon: "📊", color: "#1d9e75",
                title: "Vous pilotez et agissez",
                desc: "Votre dashboard RH se remplit en temps réel. Identifiez les zones à risque, les actions prioritaires, et suivez l'évolution.",
                detail: "→ Premier rapport dès que vos équipes ont répondu",
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
                C&apos;est une question légitime. Notre réponse : la participation repose sur le fait que chaque employé reçoit
                {" "}<strong style={{ color: c.textPrimary }}>son propre bilan personnel</strong> —
                pas un rapport collectif anonyme. Quand les gens savent qu&apos;ils vont avoir des réponses sur{" "}
                <em>leurs</em> douleurs, ils ont une vraie raison de participer.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: "12px 16px", borderRadius: 12,
            background: "rgba(63,224,160,0.06)", border: "0.5px solid rgba(63,224,160,0.15)",
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

        {/* ── 5. TARIFS + RENTABILITÉ ── */}
        <PlanSelector isMobile={isMobile} c={c} T={T} fadeUp={fadeUp} />

        {/* ESG discret */}
        <motion.div {...fadeUp(0.05)} style={{ marginBottom: 40 }}>
          <div style={{ padding: "18px 22px", borderRadius: 16,
            background: "rgba(63,224,160,0.04)", border: "0.5px solid rgba(63,224,160,0.15)",
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
          <span style={{ fontFamily: T.b, fontSize: 11, color: "#3fe0a0", fontWeight: 600 }}>
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
            <span style={{ fontFamily: T.b, fontSize: 13, color: "#6f9bff" }}>Déjà client ? Accéder au dashboard →</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
