"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PricingCalculator from "@/components/PricingCalculator";
import ContactForm from "@/components/ContactForm";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

function FAQ({ isMobile }: { isMobile: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: "Combien de temps pour déployer PAW dans mon entreprise ?",
      a: "48h. On crée votre espace, vous recevez un lien à partager à vos équipes. Pas d'installation, pas de formation IT.",
    },
    {
      q: "Est-ce que mes employés vont vraiment le faire ?",
      a: "Taux de participation moyen : 87%. Parce que chaque employé reçoit son propre bilan personnel — pas un rapport collectif anonyme. Quand les gens savent qu'ils vont avoir des réponses sur leurs douleurs, ils participent.",
    },
    {
      q: "Mes données sont-elles confidentielles ?",
      a: "Oui. En tant qu'administrateur, vous voyez uniquement des données agrégées et anonymisées. Aucune donnée de santé individuelle n'est accessible. Conformité RGPD garantie, données hébergées en Europe.",
    },
    {
      q: "Ça fonctionne pour les équipes debout (entrepôt, commerce, soins) ?",
      a: "Oui — PAW est conçu pour les deux profils. Questionnaire et analyse vidéo adaptés pour les travailleurs bureau ET les travailleurs debout.",
    },
    {
      q: "Comment justifier cet investissement auprès de ma direction ?",
      a: "Un arrêt TMS coûte en moyenne 8 000€ à l'entreprise. PAW coûte 25€/employé/an. Avec 2 arrêts évités, le ROI est positif dès la première année.",
    },
  ];

  return (
    <motion.section {...fadeUp(0)} style={{ maxWidth: 800, margin: "0 auto 80px", padding: "0 24px" }}>
      <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>
        Questions fréquentes
      </p>
      <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 24 : 30,
        color: "var(--text-primary)", marginBottom: 28, letterSpacing: "-0.5px" }}>
        Tout ce que vous voulez savoir
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderRadius: 16, overflow: "hidden",
            border: `0.5px solid ${open === i ? "rgba(43,92,230,0.3)" : "var(--border)"}`,
            background: open === i ? "rgba(43,92,230,0.04)" : "var(--bg-card)",
            transition: "all 0.2s" }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width: "100%", padding: "18px 20px", display: "flex",
                alignItems: "center", justifyContent: "space-between", gap: 16,
                background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: isMobile ? 14 : 15,
                color: "var(--text-primary)", lineHeight: 1.4 }}>{faq.q}</span>
              <span style={{ fontSize: 20, color: "#2b5ce6", flexShrink: 0,
                transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.2s", display: "inline-block" }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 20px 18px" }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t60)",
                  lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.section>
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

  const c = {
    textPrimary: "var(--text-primary)",
    textSecondary: "var(--text-secondary)",
    textMuted: "var(--t55)",
    bgCard: "var(--bg-card)",
    border: "var(--border)",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900,
        margin: "0 auto", padding: isMobile ? "100px 20px 60px" : "140px 24px 80px",
        textAlign: "center" }}>

        <motion.div {...fadeUp(0)}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100, marginBottom: 24,
            background: "rgba(226,75,74,0.08)", border: "0.5px solid rgba(226,75,74,0.2)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f09595" }} />
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#f09595" }}>
              87% des maladies professionnelles sont des TMS
            </span>
          </div>

          <h1 style={{ fontFamily: T.h, fontWeight: 900,
            fontSize: isMobile ? "32px" : "48px",
            color: "var(--text-primary)", margin: "0 0 20px",
            letterSpacing: "-1px", lineHeight: 1.1 }}>
            Vos équipes ont mal.<br />
            Vous ne savez pas exactement pourquoi.<br />
            <span style={{ color: "#2b5ce6" }}>PAW vous le dit.</span>
          </h1>

          <p style={{ fontFamily: T.b, fontSize: isMobile ? 15 : 17, color: "var(--t55)",
            lineHeight: 1.75, maxWidth: 560, margin: "0 auto 12px" }}>
            Un bilan santé au travail complet pour chaque collaborateur.
            Un dashboard RH pour piloter. Des actions concrètes pour réduire
            les arrêts TMS.
          </p>

          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t35)",
            margin: "0 auto 32px" }}>
            Démo sans engagement · Mise en place en 48h · Aucun contrat longue durée
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ padding: "16px 36px", borderRadius: 100, cursor: "pointer",
                  background: "#2b5ce6", color: "#fff",
                  fontFamily: T.h, fontWeight: 800, fontSize: 16,
                  boxShadow: "0 4px 32px rgba(43,92,230,0.4)" }}>
                Demander une démo →
              </motion.div>
            </a>
            <Link href="/auth?redirect=/entreprise/dashboard&from=entreprise"
              style={{ textDecoration: "none" }}>
              <div style={{ padding: "16px 28px", borderRadius: 100, cursor: "pointer",
                background: "transparent", border: "1.5px solid var(--border-2)",
                fontFamily: T.b, fontWeight: 600, fontSize: 15, color: "var(--t55)" }}>
                Déjà client →
              </div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── DOULEURS DRH ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900,
        margin: "0 auto 72px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0.05)}>
          <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "#f09595",
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: 16, textAlign: "center" }}>
            Ça vous parle ?
          </p>
          <div style={{ display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
            {[
              {
                emoji: "😮‍💨",
                pain: "\"On a encore 2 arrêts TMS ce trimestre\"",
                desc: "Lombalgies, douleurs cervicales, tendinites — les mêmes causes, les mêmes arrêts. Et personne ne sait vraiment pourquoi.",
              },
              {
                emoji: "📋",
                pain: "\"Le comité de prévention me demande un plan concret\"",
                desc: "Vous avez besoin de données, d'un rapport et d'actions concrètes. Pas d'un ergonome qui passe une journée et repart.",
              },
              {
                emoji: "🤷",
                pain: "\"Je ne sais pas par où commencer\"",
                desc: "La prévention TMS c'est large. PAW vous dit exactement quels postes sont à risque et quelles actions ont le plus d'impact.",
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)}
                style={{ padding: "24px", borderRadius: 18,
                  background: "rgba(226,75,74,0.04)",
                  border: "0.5px solid rgba(226,75,74,0.15)" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{item.emoji}</span>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15,
                  color: c.textPrimary, margin: "0 0 10px", lineHeight: 1.3,
                  fontStyle: "italic" }}>{item.pain}</p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)",
                  lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 8, marginTop: 16 }}>
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
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900,
        margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0.05)}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase",
            marginBottom: 12 }}>Simple à déployer</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900,
            fontSize: isMobile ? 22 : 32, color: c.textPrimary,
            marginBottom: 8, letterSpacing: "-0.5px" }}>
            Opérationnel en 48h.<br />Résultats en 30 jours.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
            marginBottom: 32, lineHeight: 1.65, maxWidth: 500 }}>
            Pas d&apos;installation. Pas de formation IT. Pas de contrat longue durée.
          </p>

          <div style={{ display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
            {[
              { step: "01", icon: "⚡", title: "On crée votre espace",
                desc: "Après votre démo, on configure votre dashboard en 48h. Vous recevez un lien d'invitation à partager à vos équipes.",
                detail: "→ Vous ne faites rien techniquement", color: "#2b5ce6" },
              { step: "02", icon: "📱", title: "Vos employés font leur bilan",
                desc: "5 à 10 minutes sur mobile ou PC. Questionnaire + analyse vidéo IA posturale. Chaque employé reçoit son propre rapport.",
                detail: "→ Taux de participation moyen : 87%", color: "#7c3aed" },
              { step: "03", icon: "📊", title: "Vous pilotez et agissez",
                desc: "Votre dashboard RH se remplit en temps réel. Identifiez les zones à risque et les actions prioritaires.",
                detail: "→ Premier rapport sous 30 jours", color: "#1d9e75" },
            ].map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                style={{ padding: "24px", borderRadius: 20,
                  background: c.bgCard, border: "0.5px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center",
                  gap: 10, marginBottom: 16 }}>
                  <div style={{ fontFamily: T.h, fontWeight: 900, fontSize: 11,
                    color: step.color, opacity: 0.5, letterSpacing: "0.1em" }}>
                    {step.step}
                  </div>
                  <div style={{ width: 1, height: 12, background: "var(--border)" }} />
                  <span style={{ fontSize: 20 }}>{step.icon}</span>
                </div>
                <h3 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16,
                  color: c.textPrimary, margin: "0 0 10px" }}>{step.title}</h3>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)",
                  lineHeight: 1.65, margin: "0 0 12px" }}>{step.desc}</p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: step.color,
                  fontWeight: 600, margin: 0 }}>{step.detail}</p>
              </motion.div>
            ))}
          </div>

          {/* Objection participation */}
          <div style={{ marginTop: 16, padding: "16px 20px", borderRadius: 16,
            background: "rgba(43,92,230,0.04)", border: "0.5px solid rgba(43,92,230,0.15)",
            display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤔</span>
            <div>
              <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
                color: c.textPrimary, margin: "0 0 4px" }}>
                &quot;Est-ce que mes employés vont vraiment le faire ?&quot;
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)",
                margin: 0, lineHeight: 1.65 }}>
                C&apos;est la question qu&apos;on nous pose le plus souvent. La réponse : oui, parce que chaque employé reçoit
                <strong style={{ color: c.textPrimary }}> son propre bilan personnel</strong> —
                pas un rapport collectif anonyme. Taux moyen constaté : <strong style={{ color: "#74c69d" }}>87%</strong>.
              </p>
            </div>
          </div>

          {/* Légal */}
          <div style={{ marginTop: 10, padding: "12px 16px", borderRadius: 12,
            background: "rgba(116,198,157,0.06)", border: "0.5px solid rgba(116,198,157,0.15)",
            display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚖️</span>
            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.65 }}>
              <strong style={{ color: "var(--text-secondary)" }}>Obligation légale :</strong>{" "}
              La loi bien-être au travail (Belgique) et le DUER (France) imposent à toute entreprise
              un plan de prévention des risques TMS. PAW documente cette obligation.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── DASHBOARD MOCKUP ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900,
        margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0.05)}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase",
            marginBottom: 12 }}>Votre dashboard RH</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900,
            fontSize: isMobile ? 22 : 32, color: c.textPrimary,
            marginBottom: 8, letterSpacing: "-0.5px" }}>
            Tout ce qu&apos;il faut pour décider.<br />
            <span style={{ color: "#2b5ce6" }}>Rien de superflu.</span>
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
            marginBottom: 28, lineHeight: 1.65, maxWidth: 520 }}>
            En un coup d&apos;œil : qui est à risque, pourquoi, et quoi faire en priorité.
            Données anonymisées, conformes RGPD.
          </p>

          {/* Browser chrome mockup */}
          <div style={{ borderRadius: 20, overflow: "hidden",
            border: "1px solid rgba(43,92,230,0.3)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
            <div style={{ background: "#1a1a2e", padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
              borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((col, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: col }} />
                ))}
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.06)",
                borderRadius: 6, padding: "4px 12px", marginLeft: 8 }}>
                <span style={{ fontFamily: T.b, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  postureatwork.com/entreprise/dashboard
                </span>
              </div>
            </div>

            <div style={{ background: "#0f0f1a", padding: isMobile ? "16px" : "20px",
              maxHeight: 440, overflow: "hidden", position: "relative" }}>

              {/* Mini header */}
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "#fff" }}>
                    Arcadia Distribution
                  </div>
                  <div style={{ fontFamily: T.b, fontSize: 11,
                    color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    47 employés · 41 bilans complétés · 22 analyses vidéo
                  </div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 100,
                  background: "rgba(212,162,42,0.12)", border: "1px solid rgba(212,162,42,0.3)" }}>
                  <span style={{ fontSize: 14 }}>🥈</span>
                  <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "#d4a22a" }}>
                    Score Social Silver
                  </span>
                </div>
              </div>

              {/* Score */}
              <div style={{ borderRadius: 16, padding: "16px",
                background: "rgba(116,198,157,0.06)", border: "0.5px solid rgba(116,198,157,0.2)",
                marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%",
                    border: "2.5px solid #74c69d", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: "rgba(116,198,157,0.1)" }}>
                    <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18,
                      color: "#74c69d", lineHeight: 1 }}>67</span>
                    <span style={{ fontFamily: T.b, fontSize: 8, color: "rgba(255,255,255,0.3)" }}>/100</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14,
                      color: "#fff", marginBottom: 3 }}>Score santé entreprise</div>
                    <div style={{ fontFamily: T.b, fontSize: 12,
                      color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
                      Des améliorations identifiées — 11 employés en zone critique
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
                    <div key={i} style={{ padding: "8px 6px", borderRadius: 10,
                      background: k.bg, textAlign: "center" }}>
                      <div style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: k.color }}>
                        {k.val}
                      </div>
                      <div style={{ fontFamily: T.b, fontSize: 9,
                        color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{k.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertes */}
              {[
                { color: "rgba(240,149,149,0.08)", border: "rgba(240,149,149,0.2)",
                  text: "🔴 Douleurs lombaires critiques — 8 employés entrepôt. Formation gestes et postures urgente." },
                { color: "rgba(244,162,97,0.06)", border: "rgba(244,162,97,0.18)",
                  text: "🟠 11 employés bureau sur laptop sans rehausseur — charge cervicale +12kg permanente." },
              ].map((a, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 10,
                  background: a.color, border: `0.5px solid ${a.border}`,
                  marginBottom: 6, fontFamily: T.b, fontSize: 11,
                  color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                  {a.text}
                </div>
              ))}

              {/* Gradient fade */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
                background: "linear-gradient(to bottom, transparent, #0f0f1a)",
                pointerEvents: "none" }} />
            </div>

            <div style={{ background: "#0f0f1a", padding: "14px 20px",
              textAlign: "center", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
              <a href="#contact" style={{ textDecoration: "none" }}>
                <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 100,
                  background: "#2b5ce6", color: "#fff",
                  fontFamily: T.h, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Voir une démo complète →
                </div>
              </a>
            </div>
          </div>

          {/* Points clés */}
          <div style={{ display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 10, marginTop: 16 }}>
            {[
              { icon: "🎯", text: "Actions prioritaires identifiées automatiquement" },
              { icon: "🔒", text: "Données 100% anonymisées — RGPD garanti" },
              { icon: "📈", text: "Suivi de l'évolution trimestrielle en temps réel" },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center",
                padding: "12px 14px", borderRadius: 12,
                background: c.bgCard, border: "0.5px solid var(--border)" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
                <span style={{ fontFamily: T.b, fontSize: 12,
                  color: "var(--t60)", lineHeight: 1.4 }}>{p.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900,
        margin: "0 auto 80px", padding: "0 24px" }}>
        <PricingCalculator isMobile={isMobile} c={c} T={T} />
      </section>

      {/* ── KINÉ ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900,
        margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0.05)}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start",
            padding: 28, borderRadius: 20, background: c.bgCard,
            border: "0.5px solid var(--border)", flexWrap: "wrap" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: "rgba(43,92,230,0.12)", border: "1.5px solid rgba(43,92,230,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              🩺
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15,
                color: c.textPrimary, margin: "0 0 4px" }}>
                Fondateur kinésithérapeute
              </p>
              <p style={{ fontFamily: T.b, fontSize: 12, color: "#2b5ce6",
                fontWeight: 600, margin: "0 0 10px" }}>
                Spécialisé TMS · Bruxelles
              </p>
              <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
                lineHeight: 1.65, margin: "0 0 12px" }}>
                &quot;En cabinet, je vois chaque semaine les mêmes TMS revenir.
                Des douleurs qui s&apos;installent sur des mois avant que les gens consultent —
                et qui auraient pu être évitées. PAW, c&apos;est la prévention que je ne pouvais pas
                donner à tous mes patients faute de temps.&quot;
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Validé cliniquement", "Modèle biopsychosocial", "Données RGPD"].map((badge, i) => (
                  <span key={i} style={{ padding: "4px 12px", borderRadius: 100,
                    background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.2)",
                    fontFamily: T.b, fontSize: 11, color: "#7c9fff", fontWeight: 600 }}>
                    ✓ {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── ESG ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900,
        margin: "0 auto 40px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0.05)}>
          <div style={{ padding: "18px 22px", borderRadius: 16,
            background: "rgba(116,198,157,0.04)", border: "0.5px solid rgba(116,198,157,0.15)",
            display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🌿</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
                color: c.textPrimary, margin: "0 0 4px" }}>
                Un bonus pour votre reporting social
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)",
                margin: 0, lineHeight: 1.65 }}>
                Le rapport PAW alimente vos indicateurs bien-être pour votre comité de prévention,
                vos appels d&apos;offres grands comptes et votre score EcoVadis Social —
                sans travail supplémentaire.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ── */}
      <FAQ isMobile={isMobile} />

      {/* ── CONTACT ── */}
      <section id="contact" style={{ position: "relative", zIndex: 1, maxWidth: 640,
        margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div {...fadeUp(0.05)}>
          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase",
            marginBottom: 12 }}>Demander une démo</p>
          <h2 style={{ fontFamily: T.h, fontWeight: 900,
            fontSize: isMobile ? 22 : 28, color: c.textPrimary,
            marginBottom: 8, letterSpacing: "-0.5px" }}>
            On vous rappelle sous 24h.
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
            marginBottom: 28, lineHeight: 1.65 }}>
            Démo personnalisée · Sans engagement · Mise en place en 48h si accord
          </p>
          <ContactForm />
        </motion.div>
      </section>

      {/* ── BADGES TECH ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900,
        margin: "0 auto 40px", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          gap: 20, flexWrap: "wrap", opacity: 0.45 }}>
          <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)" }}>Propulsé par</span>
          {["✦ Claude AI (Anthropic)", "Stripe", "Supabase EU"].map((b, i) => (
            <span key={i} style={{ fontFamily: T.b, fontSize: 11,
              color: "var(--t40)", fontWeight: 600 }}>{b}</span>
          ))}
          <span style={{ fontFamily: T.b, fontSize: 11, color: "#74c69d", fontWeight: 600 }}>
            🔒 RGPD · Données EU
          </span>
        </div>
      </section>

    </main>
  );
}
