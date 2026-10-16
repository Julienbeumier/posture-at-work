"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const TYPES = [
  { key: "douleur", label: "Douleur physique", showZone: true, showIntensity: true },
  { key: "equipement", label: "Problème d'équipement", showZone: false, showIntensity: false },
  { key: "contrainte", label: "Contrainte posturale", showZone: true, showIntensity: false },
  { key: "autre", label: "Autre", showZone: false, showIntensity: false },
];
const ZONES = ["Lombaires / dos bas", "Cervicales / nuque", "Épaules", "Poignets / mains", "Jambes / genoux", "Pieds", "Autre"];

const field: React.CSSProperties = {
  padding: "11px 13px", borderRadius: 10, outline: "none", width: "100%", boxSizing: "border-box",
  background: "var(--bg-card-2)", border: "1px solid var(--border-2)",
  color: "var(--text-primary)", fontFamily: T.b, fontSize: 14,
};

export default function SignalForm({ companyId, anonymousId }: { companyId: string; anonymousId: string }) {
  const [type, setType] = useState("");
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = TYPES.find(t => t.key === type);

  async function handleSubmit() {
    if (!type || !description.trim() || loading) return;
    setLoading(true);
    setError(null);
    const { error: e } = await createClient().from("signals").insert({
      company_id: companyId, anonymous_id: anonymousId, type,
      zone: zone || null, description: description.trim().slice(0, 1000),
      intensity: selected?.showIntensity ? intensity : null,
    });
    setLoading(false);
    if (e) { setError("Le signalement n'a pas pu être envoyé. Réessaie dans un instant."); return; }
    setSent(true);
  }

  function reset() {
    setType(""); setZone(""); setDescription(""); setIntensity(3); setSent(false); setError(null);
  }

  if (sent) {
    return (
      <div role="status" style={{ borderRadius: 20, padding: "20px 22px", background: "rgba(63,224,160,0.08)", border: "1px solid rgba(63,224,160,0.28)" }}>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#3fe0a0", margin: "0 0 6px" }}>Signalement envoyé</p>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.6, margin: "0 0 12px" }}>
          Merci. Il a été transmis à ton entreprise sous ton identifiant anonyme, sans ton nom.
        </p>
        <button type="button" onClick={reset} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.b, fontWeight: 700, fontSize: 13, color: "#6f9bff" }}>
          Faire un autre signalement
        </button>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 20, padding: "20px 22px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: "0 0 4px" }}>
        Signaler un problème à ton entreprise
      </p>
      <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.5, margin: "0 0 14px" }}>
        Une douleur, un siège inadapté, un écran mal placé. Ton employeur ne voit jamais ton nom.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div role="group" aria-label="Type de signalement" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {TYPES.map(t => (
            <button key={t.key} type="button" aria-pressed={type === t.key} onClick={() => setType(t.key)}
              style={{
                padding: "11px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", minHeight: 44,
                background: type === t.key ? "rgba(255,163,71,0.16)" : "var(--bg-card-2)",
                border: `1px solid ${type === t.key ? "rgba(255,163,71,0.5)" : "var(--border)"}`,
                fontFamily: T.b, fontSize: 13, fontWeight: 600,
                color: type === t.key ? "#ffa347" : "var(--t65)",
              }}>
              {t.label}
            </button>
          ))}
        </div>
        {selected?.showZone && (
          <select aria-label="Zone concernée" value={zone} onChange={e => setZone(e.target.value)} style={field}>
            <option value="">Zone concernée (optionnel)</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        )}
        {selected?.showIntensity && (
          <div>
            <label htmlFor="signal-intensity" style={{ display: "block", fontFamily: T.b, fontSize: 13, color: "var(--t55)", marginBottom: 6 }}>
              Intensité : <strong style={{ color: "#ffa347" }}>{intensity}/5</strong>
            </label>
            <input id="signal-intensity" type="range" min={1} max={5} step={1} value={intensity}
              onChange={e => setIntensity(Number(e.target.value))} style={{ width: "100%", accentColor: "#ffa347" }} />
          </div>
        )}
        {type && (
          <textarea aria-label="Description du problème" placeholder="Décris brièvement le problème…"
            value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={1000}
            style={{ ...field, resize: "none", lineHeight: 1.5 }} />
        )}
        {error && <p role="alert" style={{ fontFamily: T.b, fontSize: 13, color: "#ff7b7b", margin: 0 }}>{error}</p>}
        {type && description.trim() && (
          <button type="button" onClick={handleSubmit} disabled={loading}
            style={{
              padding: "13px 0", borderRadius: 100, border: "none", cursor: loading ? "default" : "pointer",
              background: "#ffa347", color: "#1a1206", opacity: loading ? 0.7 : 1,
              fontFamily: T.h, fontWeight: 800, fontSize: 14,
            }}>
            {loading ? "Envoi…" : "Envoyer le signalement"}
          </button>
        )}
      </div>
    </div>
  );
}
