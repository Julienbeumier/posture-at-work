"use client";
import type { CSSProperties, ReactNode } from "react";

/**
 * Picto d'interface : affiche l'emoji tel quel.
 * (Centralisé ici pour pouvoir changer de style de pictos en un seul endroit.)
 */
export function Ico({ e, style }: { e: string; size?: number | string; style?: CSSProperties }) {
  return <span style={{ marginRight: "0.35em", ...style }}>{e}</span>;
}

/** Affiche un texte contenant des emojis, inchangé. */
export function withIcons(text: string): ReactNode {
  return text;
}
