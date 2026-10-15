"use client";

import { useState } from "react";
import type { ReactNode } from "react";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

// Palette minimale attendue (compatible avec useTheme().c)
type ThemeLike = {
  textPrimary: string; textMuted: string; border: string; borderStrong?: string;
  cardGrad: string; bgCard2: string;
};

const CHECKLIST: { zone: string; emoji: string; items: string[] }[] = [
  {
    zone: "Écran", emoji: "🖥️",
    items: [
      "Le haut de l'écran est à peu près à hauteur des yeux (rehausseur ou pile de livres si besoin).",
      "L'écran est face à soi, ni très près ni très loin : on lit sans se pencher en avant.",
      "L'écran est perpendiculaire aux fenêtres : pas de reflet, pas d'éblouissement.",
      "Avec un laptop : clavier et souris externes, et laptop surélevé.",
    ],
  },
  {
    zone: "Clavier & souris", emoji: "⌨️",
    items: [
      "Les coudes sont proches du corps, avant-bras soutenus, épaules relâchées.",
      "Les poignets restent alignés avec l'avant-bras (pas cassés vers le haut ou le côté).",
      "La souris est à portée sans tendre le bras.",
    ],
  },
  {
    zone: "Siège & posture", emoji: "🪑",
    items: [
      "Les pieds sont à plat au sol (ou sur un repose-pieds).",
      "Le bas du dos est soutenu par le dossier.",
      "Les genoux sont à peu près à la hauteur des hanches, sans pression sous les cuisses.",
    ],
  },
  {
    zone: "Rythme de travail", emoji: "⏱️",
    items: [
      "On se lève ou on change de position régulièrement (repère EU-OSHA : micro-pause toutes les 20 à 30 minutes).",
      "Les appels et réunions courtes se font debout ou en marchant quand c'est possible.",
      "Les yeux se reposent régulièrement en regardant au loin.",
    ],
  },
];

const KIT = [
  {
    key: "annonce",
    title: "Message d'annonce aux équipes",
    text: `Objet : Votre bilan ergonomique PAW (5 minutes, confidentiel)

Bonjour,

Pour prendre soin de votre confort au poste, nous mettons à votre disposition PostureAtWork : un bilan de 5 minutes sur votre poste de travail, vos douleurs éventuelles et vos habitudes.

• C'est volontaire.
• Vos réponses individuelles ne nous sont pas communiquées : nous ne voyons que des résultats collectifs.
• Vous recevez des conseils personnalisés et des exercices adaptés.

Lien d'accès : [collez ici votre lien d'invitation]

Merci d'avance,
[Votre prénom]`,
  },
  {
    key: "relance",
    title: "Message de relance (une semaine après)",
    text: `Bonjour,

Petit rappel : le bilan PostureAtWork ne prend que 5 minutes. Plus nous sommes nombreux à répondre, plus les résultats collectifs sont fiables et plus les aménagements décidés seront adaptés à vos besoins.

Lien : [collez ici votre lien d'invitation]

Merci !`,
  },
  {
    key: "atelier",
    title: "Mini-atelier de 15 minutes (en équipe)",
    text: `1. (3 min) Présenter les résultats collectifs du dashboard : les 2 ou 3 points d'attention principaux.
2. (5 min) Chacun passe la checklist d'auto-audit de son propre poste et note un réglage à corriger.
3. (4 min) Faire ensemble 2 exercices de mobilité courts (voir l'onglet Exercices).
4. (3 min) Décider UNE action concrète pour la semaine (ex. : rehausseurs pour les laptops, rappel de micro-pause) avec un responsable et une date.`,
  },
  {
    key: "affiche",
    title: "Texte d'affiche pour la salle de pause",
    text: `Mon poste, mon confort
• Haut de l'écran à hauteur des yeux
• Coudes près du corps, poignets alignés
• Pieds à plat, dos soutenu
• Je me lève ou je change de position régulièrement
Un doute ? Faites votre bilan PostureAtWork (5 minutes).`,
  },
];

function CopyButton({ text, c }: { text: string; c: ThemeLike }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch { /* presse-papiers indisponible */ }
      }}
      style={{
        padding: "6px 14px", borderRadius: 100, border: `1px solid ${c.border}`, background: "transparent",
        color: done ? "#3fe0a0" : "#6f9bff", fontFamily: T.b, fontWeight: 700, fontSize: 12, cursor: "pointer",
      }}
    >
      {done ? "✓ Copié" : "Copier"}
    </button>
  );
}

function Card({ c, children }: { c: ThemeLike; children: ReactNode }) {
  return (
    <div style={{ borderRadius: 20, padding: "20px 22px", background: c.cardGrad, border: `1px solid ${c.border}` }}>
      {children}
    </div>
  );
}

export default function ManagerToolkit({ c }: { c: ThemeLike }) {
  const [openKit, setOpenKit] = useState<string | null>("annonce");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
      <Card c={c}>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: "0 0 4px" }}>
          ✅ Checklist d&apos;auto-audit de poste
        </p>
        <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: "0 0 16px", lineHeight: 1.6 }}>
          À diffuser à vos équipes : 5 minutes pour vérifier son propre poste. Ce sont des repères généraux, à adapter à chaque personne. En cas de douleur persistante, mieux vaut un avis médical.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {CHECKLIST.map(block => (
            <div key={block.zone}>
              <p style={{ fontFamily: T.b, fontWeight: 700, fontSize: 13, color: c.textPrimary, margin: "0 0 6px" }}>
                {block.emoji} {block.zone}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {block.items.map(item => (
                  <li key={item} style={{ display: "flex", gap: 8, fontFamily: T.b, fontSize: 13, color: c.textMuted, lineHeight: 1.5 }}>
                    <span aria-hidden="true" style={{ color: "#3fe0a0" }}>☐</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <CopyButton c={c} text={CHECKLIST.map(b => `${b.zone}\n${b.items.map(i => `☐ ${i}`).join("\n")}`).join("\n\n")} />
        </div>
      </Card>

      <Card c={c}>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: "0 0 4px" }}>
          📣 Kit d&apos;animation pour managers
        </p>
        <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: "0 0 14px", lineHeight: 1.6 }}>
          Des textes prêts à l&apos;emploi pour faire participer vos équipes et transformer les résultats en actions.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {KIT.map(item => {
            const open = openKit === item.key;
            return (
              <div key={item.key} style={{ borderRadius: 14, border: `1px solid ${c.border}`, background: c.bgCard2, overflow: "hidden" }}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenKit(open ? null : item.key)}
                  style={{
                    width: "100%", textAlign: "left", padding: "12px 14px", background: "transparent", border: "none",
                    color: c.textPrimary, fontFamily: T.b, fontWeight: 700, fontSize: 13, cursor: "pointer",
                    display: "flex", justifyContent: "space-between", gap: 8,
                  }}
                >
                  <span>{item.title}</span>
                  <span aria-hidden="true">{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <div style={{ padding: "0 14px 14px" }}>
                    <pre style={{
                      whiteSpace: "pre-wrap", fontFamily: T.b, fontSize: 12.5, color: c.textMuted, lineHeight: 1.6,
                      margin: "0 0 10px",
                    }}>{item.text}</pre>
                    <CopyButton c={c} text={item.text} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
