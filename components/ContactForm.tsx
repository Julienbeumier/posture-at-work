"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export default function ContactForm() {
  const { c } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  const inputStyle: React.CSSProperties = {
    padding: "12px 14px", borderRadius: 12,
    background: c.bgCard2, border: `1px solid ${c.border2}`,
    color: c.textPrimary, fontFamily: T.b, fontSize: 13, outline: "none",
  };

  if (contactSent) {
    return (
      <div style={{ padding: "28px", borderRadius: 16, textAlign: "center", background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.25)" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#1d9e75", marginBottom: 6 }}>Message reçu !</p>
        <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>
          On revient vers vous sous 24h pour organiser votre démo.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <input
          placeholder="Votre nom *"
          value={form.nom}
          onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
          style={inputStyle}
        />
        <input
          placeholder="Email professionnel *"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <input
          placeholder="Société *"
          value={form.societe}
          onChange={e => setForm(f => ({ ...f, societe: e.target.value }))}
          style={inputStyle}
        />
        <select
          value={form.effectif}
          onChange={e => setForm(f => ({ ...f, effectif: e.target.value }))}
          style={{ ...inputStyle, color: form.effectif ? c.textPrimary : c.textMuted }}
        >
          <option value="">Effectif</option>
          <option value="1-25">1 - 25 employés</option>
          <option value="26-50">26 - 50 employés</option>
          <option value="51-100">51 - 100 employés</option>
          <option value="100+">100+ employés</option>
        </select>
      </div>
      <select
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        style={{ ...inputStyle, color: form.message ? c.textPrimary : c.textMuted }}
      >
        <option value="">Votre secteur d&apos;activité</option>
        <option value="Bureau / services">Bureau / services</option>
        <option value="Logistique / entrepôt">Logistique / entrepôt</option>
        <option value="Agroalimentaire">Agroalimentaire</option>
        <option value="Commerce / retail">Commerce / retail</option>
        <option value="Santé / soins">Santé / soins</option>
        <option value="BTP / industrie">BTP / industrie</option>
        <option value="Autre">Autre</option>
      </select>
      <textarea
        placeholder="Décrivez votre situation (optionnel) — effectif, problématiques actuelles, contexte..."
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        rows={3}
        style={{ ...inputStyle, resize: "vertical" }}
      />
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
  );
}
