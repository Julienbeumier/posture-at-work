"use client";

import { useState } from "react";
import type { ReactNode } from "react";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

type ThemeLike = { textPrimary: string; textMuted: string; border: string; bgCard2: string };

export const PARCOURS_STEPS = [
  { n: 1, title: "Repérer", sub: "Les priorités de votre équipe" },
  { n: 2, title: "Décider", sub: "Les actions à mener et leur suivi" },
  { n: 3, title: "S'équiper", sub: "Le matériel qui fait la différence" },
  { n: 4, title: "Pratiquer", sub: "Des routines courtes, chaque semaine" },
  { n: 5, title: "Mesurer", sub: "Vérifier que ça progresse" },
];

/** Étape numérotée du parcours d'amélioration, repliable. */
export function ParcoursStep({
  c, n, title, subtitle, defaultOpen = true, status, statusColor, children,
}: {
  c: ThemeLike; n: number; title: string; subtitle: string; defaultOpen?: boolean;
  /** Petit libellé d'état affiché à droite (ex. « Fait », « 1/3 »). */
  status?: string; statusColor?: string; children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={`parcours-etape-${n}`} aria-labelledby={`parcours-step-${n}`} style={{ marginBottom: 22, scrollMarginTop: 90 }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
          padding: "10px 12px", marginBottom: open ? 12 : 0, borderRadius: 14,
          background: c.bgCard2, border: `1px solid ${c.border}`, cursor: "pointer",
        }}
      >
        <span aria-hidden="true" style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: "50%", background: "#2b5ce6", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.h, fontWeight: 900, fontSize: 14,
        }}>{n}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span id={`parcours-step-${n}`} style={{ display: "block", fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary }}>
            {title}
          </span>
          <span style={{ display: "block", fontFamily: T.b, fontSize: 12, color: c.textMuted }}>{subtitle}</span>
        </span>
        {status && (
          <span style={{
            flexShrink: 0, fontFamily: T.b, fontWeight: 700, fontSize: 12, padding: "4px 10px", borderRadius: 100,
            color: statusColor ?? c.textMuted, background: `${statusColor ?? "#ffffff"}22`,
          }}>{status}</span>
        )}
        <span aria-hidden="true" style={{ color: c.textMuted, fontSize: 18 }}>{open ? "−" : "+"}</span>
      </button>
      {open && children}
    </section>
  );
}

/** Carte d'étape avec un bouton d'action (étapes qui renvoient vers un autre onglet). */
export function ParcoursLinkCard({
  c, text, cta, onClick,
}: { c: ThemeLike; text: string; cta: string; onClick: () => void }) {
  return (
    <div style={{ borderRadius: 16, padding: "16px 18px", background: c.bgCard2, border: `1px solid ${c.border}` }}>
      <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, lineHeight: 1.65, margin: "0 0 12px" }}>{text}</p>
      <button type="button" onClick={onClick} style={{
        padding: "10px 18px", borderRadius: 100, border: "none", background: "#2b5ce6", color: "#fff",
        fontFamily: T.b, fontWeight: 700, fontSize: 13, cursor: "pointer",
      }}>{cta}</button>
    </div>
  );
}
