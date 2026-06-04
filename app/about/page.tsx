"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  };
}

type FormState = "idle" | "loading" | "sent" | "error";

export default function AboutPage() {
  const { c } = useTheme();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !email.trim() || !message.trim()) return;
    setFormState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim(), email: email.trim(), message: message.trim() }),
      });
      if (res.ok) setFormState("sent");
      else setFormState("error");
    } catch {
      setFormState("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    background: c.bgCard2,
    border: `1px solid ${c.border2}`,
    color: c.textPrimary,
    fontFamily: T.b,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <main style={{ minHeight: "100vh", background: c.mainBg, paddingBottom: 80 }}>
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "80px 24px 0" }}>

        {/* ── HEADER ── */}
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100, marginBottom: 18,
            background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.25)",
          }}>
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: "#7c9fff" }}>
              Notre histoire
            </span>
          </div>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: c.textPrimary, lineHeight: 1.2, marginBottom: 14 }}>
            Créé par un kiné, pour les gens qui bossent.
          </h1>
          <p style={{ fontFamily: T.b, fontSize: 15, color: c.textSecondary, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            Pas une startup tech. Un praticien qui en avait marre de voir les mêmes blessures revenir chaque semaine.
          </p>
        </motion.div>

        {/* ── LE CONSTAT ── */}
        <motion.div {...fadeUp(0.1)} style={{
          borderRadius: 20, padding: "28px 28px", marginBottom: 16,
          background: c.bgCard, border: `0.5px solid ${c.border}`,
        }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "#7c9fff", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Le constat
          </p>
          <p style={{ fontFamily: T.b, fontSize: 15, color: c.textSecondary, lineHeight: 1.8, margin: 0 }}>
            Chaque semaine en cabinet, je vois les mêmes TMS revenir. Dos, nuque, poignets. Des douleurs qui s&apos;installent sur des mois avant que les gens consultent — et qui auraient pu être évitées.
            <br /><br />
            La plupart n&apos;avaient jamais fait le lien entre leur poste de travail et leurs douleurs.
          </p>
        </motion.div>

        {/* ── LA SOLUTION ── */}
        <motion.div {...fadeUp(0.15)} style={{
          borderRadius: 20, padding: "28px 28px", marginBottom: 32,
          background: c.bgCard, border: `0.5px solid ${c.border}`,
        }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "#74c69d", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            La solution
          </p>
          <p style={{ fontFamily: T.b, fontSize: 15, color: c.textSecondary, lineHeight: 1.8, margin: 0 }}>
            J&apos;ai créé PostureAtWork pour combler ce vide. Un screening complet en 5 minutes — posture, setup, douleurs, sommeil, nutrition — qui donne des recommandations concrètes et actionnables.
            <br /><br />
            L&apos;objectif : que chacun puisse comprendre ce que son corps essaie de dire, avant que ça devienne un problème chronique.
          </p>
        </motion.div>

        {/* ── LE CRÉATEUR ── */}
        <motion.div {...fadeUp(0.2)} style={{
          borderRadius: 20, padding: "28px 28px", marginBottom: 48,
          background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.20)",
          display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap",
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
            background: "rgba(43,92,230,0.18)", border: "2px solid rgba(43,92,230,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}>
            👨‍⚕️
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 17, color: c.textPrimary, margin: "0 0 4px" }}>
              Julien Beumier
            </p>
            <p style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff", margin: "0 0 14px" }}>
              Kinésithérapeute · Fondateur de PostureAtWork
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: c.textSecondary, lineHeight: 1.7, margin: 0 }}>
              Kinésithérapeute basé à Bruxelles. J&apos;ai créé PAW pour que mes patients — et tous ceux qui n&apos;ont pas encore consulté — puissent comprendre ce que leur corps essaie de dire.
            </p>
          </div>
        </motion.div>

        {/* ── CONTACT ── */}
        <motion.div {...fadeUp(0.25)}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: c.textPrimary, marginBottom: 10 }}>
              Une question ? Une idée ?
            </h2>
            <p style={{ fontFamily: T.b, fontSize: 14, color: c.textSecondary, lineHeight: 1.65 }}>
              Que ce soit pour un retour sur l&apos;app, une collaboration ou une question sur ton bilan — écris-nous.
            </p>
          </div>

          {formState === "sent" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                borderRadius: 20, padding: "36px 28px", textAlign: "center",
                background: "rgba(45,106,79,0.12)", border: "0.5px solid rgba(116,198,157,0.3)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 14 }}>🙏</div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: "#74c69d", marginBottom: 8 }}>Message envoyé !</p>
              <p style={{ fontFamily: T.b, fontSize: 14, color: c.textSecondary }}>
                On te répond dans les plus brefs délais.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="contact-grid">
                <input
                  type="text"
                  placeholder="Prénom & Nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <textarea
                placeholder="Ton message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
              {formState === "error" && (
                <p style={{ fontFamily: T.b, fontSize: 13, color: "#f09595" }}>
                  Erreur lors de l&apos;envoi. Réessaie ou écris directement à hello@postureatwork.com
                </p>
              )}
              <button
                type="submit"
                disabled={formState === "loading"}
                style={{
                  padding: "15px 0", borderRadius: 100, border: "none",
                  background: "#2b5ce6", color: "#fff",
                  fontFamily: T.h, fontWeight: 800, fontSize: 15,
                  cursor: formState === "loading" ? "default" : "pointer",
                  boxShadow: "0 4px 20px rgba(43,92,230,0.35)",
                  opacity: formState === "loading" ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {formState === "loading" ? "Envoi…" : "Envoyer →"}
              </button>
            </form>
          )}

          {/* Coordonnées directes */}
          <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
            <Link href="mailto:hello@postureatwork.com" style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>
                📧 hello@postureatwork.com
              </span>
            </Link>
            <span style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>
              📍 Bruxelles, Belgique
            </span>
          </div>
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 560px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
