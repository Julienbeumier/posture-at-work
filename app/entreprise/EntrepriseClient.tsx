"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const STATS = [
  { value: "1 sur 3", label: "salariés touchés par un TMS chaque année" },
  { value: "3 500€", label: "coût moyen d'un arrêt TMS par cas" },
  { value: "60%", label: "des TMS évitables avec un dépistage précoce" },
];

const FEATURES = [
  {
    icon: "📋",
    title: "Screening en 5 minutes",
    desc: "Vos employés répondent au questionnaire PAW depuis leur téléphone ou ordinateur. Aucune installation, aucun matériel.",
    color: "#2b5ce6",
  },
  {
    icon: "📊",
    title: "Dashboard RH anonymisé",
    desc: "Visualisez les scores moyens par dimension, la répartition des profils à risque et l'évolution dans le temps.",
    color: "#7c3aed",
  },
  {
    icon: "🌿",
    title: "Angle ESG / CSRD",
    desc: "Documentez vos actions de prévention TMS pour votre score ESG Social. Conforme aux obligations de reporting CSRD.",
    color: "#1d9e75",
  },
  {
    icon: "🔒",
    title: "Données anonymisées",
    desc: "L'employeur voit les scores agrégés, jamais les données individuelles nominatives. Conforme RGPD.",
    color: "#d4622a",
  },
  {
    icon: "📄",
    title: "Rapport collectif PDF",
    desc: "Exportez un rapport trimestriel complet pour vos réunions RH, votre CSSCT ou vos agences de notation ESG.",
    color: "#e24b4a",
  },
  {
    icon: "⚡",
    title: "Déploiement immédiat",
    desc: "Invitez vos employés par email en 2 minutes. Les premiers résultats arrivent dès la première heure.",
    color: "#f59e0b",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "490€",
    period: "/an",
    desc: "Pour les petites équipes",
    employees: "Jusqu'à 25 employés",
    features: [
      "Dashboard RH anonymisé",
      "Invitations par email",
      "Scores par dimension",
      "Support email",
    ],
    color: "#2b5ce6",
    cta: "Démarrer",
    highlight: false,
  },
  {
    name: "PME",
    price: "1 490€",
    period: "/an",
    desc: "Pour les équipes moyennes",
    employees: "Jusqu'à 100 employés",
    features: [
      "Tout Starter +",
      "Rapport collectif PDF",
      "Suivi trimestriel",
      "Export données CSV",
      "Support prioritaire",
    ],
    color: "#7c3aed",
    cta: "Choisir PME",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    period: "",
    desc: "Pour les grandes organisations",
    employees: "100+ employés",
    features: [
      "Tout PME +",
      "Intégration SSO",
      "Dashboard multi-sites",
      "Accompagnement dédié",
      "Rapport ESG/CSRD personnalisé",
    ],
    color: "#1d9e75",
    cta: "Nous contacter",
    highlight: false,
  },
];

const ROI = [
  { label: "Coût PAW Starter / an", value: "490€", color: "#2b5ce6", sign: "" },
  { label: "Coût moyen d'un arrêt TMS", value: "3 500€", color: "#e24b4a", sign: "" },
  { label: "Arrêts évités pour être rentabilisé", value: "1", color: "#1d9e75", sign: "✓" },
];

export default function EntrepriseClient() {
  const { c } = useTheme();
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", societe: "", effectif: "", message: "" });

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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

        {/* ── HERO ── */}
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", padding: "60px 0 48px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100, marginBottom: 20,
            background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.25)",
          }}>
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#7c9fff" }}>
              🏢 Solution entreprise · Prévention TMS
            </span>
          </div>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 36, color: c.textPrimary, lineHeight: 1.15, marginBottom: 16 }}>
            Dépistez les TMS de vos équipes<br />
            <span style={{ color: "#2b5ce6" }}>avant qu&apos;ils coûtent cher.</span>
          </h1>
          <p style={{ fontFamily: T.b, fontSize: 16, color: c.textSecondary, lineHeight: 1.7, maxWidth: 600, margin: "0 auto 32px" }}>
            PostureAtWork screene la santé ergonomique de vos employés en 5 minutes. Dashboard RH anonymisé, rapport collectif, et un argument béton pour votre score ESG Social.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "14px 28px", borderRadius: 100, border: "none",
                background: "#2b5ce6", color: "#fff",
                fontFamily: T.h, fontWeight: 800, fontSize: 15,
                boxShadow: "0 4px 24px rgba(43,92,230,0.35)", cursor: "pointer",
              }}>
                Demander une démo →
              </button>
            </a>
            <Link href="/entreprise/signup" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "14px 28px", borderRadius: 100,
                background: "transparent", border: `1.5px solid ${c.border2}`,
                color: c.textPrimary, fontFamily: T.h, fontWeight: 700, fontSize: 15,
                cursor: "pointer",
              }}>
                Créer un espace entreprise
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ── STATS ── */}
        <motion.div {...fadeUp(0.1)} style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16, marginBottom: 64,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: "center", padding: "24px 20px",
              borderRadius: 16, background: c.bgCard, border: `0.5px solid ${c.border}`,
            }}>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "#2b5ce6", margin: "0 0 6px" }}>{s.value}</p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── FEATURES ── */}
        <motion.div {...fadeUp(0.15)} style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: c.textPrimary, textAlign: "center", marginBottom: 8 }}>
            Tout ce dont votre équipe RH a besoin
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, textAlign: "center", marginBottom: 32 }}>
            Déployé en 2 minutes, résultats dès la première heure.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)} style={{
                padding: "22px", borderRadius: 16,
                background: c.bgCard, border: `0.5px solid ${c.border}`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${f.color}15`, border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 14,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, lineHeight: 1.6, margin: 0 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── ROI ── */}
        <motion.div {...fadeUp(0.2)} style={{
          borderRadius: 24, padding: "32px", marginBottom: 64,
          background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.2)",
        }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: c.textPrimary, marginBottom: 8, textAlign: "center" }}>
            Le calcul est simple
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, textAlign: "center", marginBottom: 28 }}>
            Il suffit d&apos;éviter un seul arrêt TMS pour rentabiliser PAW 7 fois.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
            {ROI.map((r, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "20px 16px",
                borderRadius: 14, background: c.bgCard, border: `0.5px solid ${c.border}`,
              }}>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: r.color, margin: "0 0 6px" }}>
                  {r.sign} {r.value}
                </p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>{r.label}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#1d9e75", textAlign: "center", margin: 0 }}>
            ✓ ROI positif dès le premier arrêt évité
          </p>
        </motion.div>

        {/* ── PRICING ── */}
        <motion.div {...fadeUp(0.25)} style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: c.textPrimary, textAlign: "center", marginBottom: 8 }}>
            Tarifs transparents
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, textAlign: "center", marginBottom: 32 }}>
            Sans engagement. Annulation à tout moment.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{
                borderRadius: 20, padding: "28px 24px",
                background: plan.highlight ? `${plan.color}10` : c.bgCard,
                border: `${plan.highlight ? "1.5px" : "0.5px"} solid ${plan.highlight ? plan.color + "50" : c.border}`,
                position: "relative",
              }}>
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    padding: "4px 14px", borderRadius: 100,
                    background: plan.color, color: "#fff",
                    fontFamily: T.b, fontWeight: 700, fontSize: 11,
                  }}>
                    Recommandé
                  </div>
                )}
                <p style={{ fontFamily: T.b, fontSize: 12, color: plan.color, fontWeight: 600, marginBottom: 4 }}>{plan.name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: c.textPrimary }}>{plan.price}</span>
                  <span style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>{plan.period}</span>
                </div>
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 6 }}>{plan.desc}</p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: plan.color, fontWeight: 600, marginBottom: 20 }}>{plan.employees}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: plan.color, fontSize: 12 }}>✓</span>
                      <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#contact" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%", padding: "12px 0", borderRadius: 100,
                    background: plan.highlight ? plan.color : "transparent",
                    border: `1.5px solid ${plan.color}`,
                    color: plan.highlight ? "#fff" : plan.color,
                    fontFamily: T.h, fontWeight: 700, fontSize: 14,
                    cursor: "pointer",
                  }}>
                    {plan.cta}
                  </button>
                </a>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CONTACT / DÉMO ── */}
        <motion.div {...fadeUp(0.3)} id="contact" style={{
          borderRadius: 24, padding: "36px 32px", marginBottom: 32,
          background: c.bgCard, border: `0.5px solid ${c.border}`,
        }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 24, color: c.textPrimary, marginBottom: 8 }}>
            Demander une démo
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted, marginBottom: 28, lineHeight: 1.6 }}>
            On vous montre le dashboard en 20 minutes et on adapte la solution à votre organisation.
          </p>

          {contactSent ? (
            <div style={{
              padding: "24px", borderRadius: 16, textAlign: "center",
              background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.25)",
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#1d9e75", marginBottom: 6 }}>
                Message envoyé !
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>
                On vous répond sous 24h.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  placeholder="Votre nom *"
                  value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none" }}
                />
                <input
                  placeholder="Email professionnel *"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  placeholder="Société *"
                  value={form.societe}
                  onChange={e => setForm(f => ({ ...f, societe: e.target.value }))}
                  style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none" }}
                />
                <select
                  value={form.effectif}
                  onChange={e => setForm(f => ({ ...f, effectif: e.target.value }))}
                  style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: form.effectif ? c.textPrimary : c.textMuted, fontFamily: T.b, fontSize: 13, outline: "none" }}
                >
                  <option value="">Effectif</option>
                  <option value="1-25">1 - 25 employés</option>
                  <option value="26-100">26 - 100 employés</option>
                  <option value="100+">100+ employés</option>
                </select>
              </div>
              <textarea
                placeholder="Un message ? (optionnel)"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={3}
                style={{ padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `1px solid ${c.border2}`, color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none", resize: "vertical" }}
              />
              <button
                onClick={handleContact}
                disabled={!form.nom || !form.email || !form.societe || contactLoading}
                style={{
                  padding: "14px 0", borderRadius: 100, border: "none",
                  background: form.nom && form.email && form.societe ? "#2b5ce6" : c.bgCard2,
                  color: form.nom && form.email && form.societe ? "#fff" : c.textMuted,
                  fontFamily: T.h, fontWeight: 800, fontSize: 15,
                  cursor: form.nom && form.email && form.societe ? "pointer" : "default",
                  boxShadow: form.nom && form.email && form.societe ? "0 4px 24px rgba(43,92,230,0.35)" : "none",
                  transition: "all 0.2s", opacity: contactLoading ? 0.7 : 1,
                }}
              >
                {contactLoading ? "Envoi…" : "Envoyer la demande →"}
              </button>
            </div>
          )}
        </motion.div>

        {/* ── FOOTER LINK ── */}
        <div style={{ textAlign: "center", paddingBottom: 20 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>
              ← Retour à PostureAtWork B2C
            </span>
          </Link>
        </div>

      </div>
    </main>
  );
}
