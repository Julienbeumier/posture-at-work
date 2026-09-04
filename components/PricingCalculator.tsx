"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const defaultFadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

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

export default function PricingCalculator({
  isMobile,
  c,
  T: fonts,
  fadeUp: fu,
}: {
  isMobile: boolean;
  c: { textPrimary: string; textSecondary: string; textMuted: string; bgCard: string; border: string };
  T: { h: string; b: string };
  fadeUp?: (delay?: number) => object;
}) {
  const fadeUpFn = fu ?? defaultFadeUp;
  const [employees, setEmployees] = useState(20);
  const price = calculatePrice(employees);
  const isDevis = price.tier === "Entreprise";

  return (
    <motion.div {...fadeUpFn(0.2)} style={{ marginBottom: 72 }}>
      <p style={{ fontFamily: fonts.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2b5ce6", textTransform: "uppercase", marginBottom: 12 }}>Tarifs</p>
      <h2 style={{ fontFamily: fonts.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, marginBottom: 8, letterSpacing: "-0.5px" }}>
        Transparent. Sans surprise.
      </h2>
      <p style={{ fontFamily: fonts.b, fontSize: 14, color: c.textMuted, marginBottom: 32 }}>
        Accès PAW inclus pour chaque employé. Prix dégressif à partir de 50 personnes.
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
                  les <strong style={{ color: c.textPrimary }}>{employees} bilans</strong> + le dashboard RH collectif
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
                `${employees} bilans PAW`,
                `${employees} analyses vidéo IA`,
                "Dashboard RH anonymisé",
                "Rapport trimestriel PDF",
                "Rapport bien-être valorisable",
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
