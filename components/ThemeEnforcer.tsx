"use client";
import { useEffect } from "react";

const KEEP_COLORS = [
  "#e24b4a", "#d4622a", "#2d6a4f",
  "#2b5ce6", "#7c3aed", "#1d9e75",
  "#74c69d", "#f4a261", "#f09595",
  "#f59e0b", "#22c55e", "#2563eb",
  "#a78bfa", "#7c9fff", "#5dcaa5",
];

const COLORED_BGS = [
  "#2b5ce6", "#2563eb", "#e24b4a",
  "#2d6a4f", "#d4622a", "#7c3aed",
  "#1d9e75", "#f59e0b",
];

const WHITISH = [
  "white", "#fff", "#ffffff",
  "#f0f0fa", "#f0f0ff", "#fffffe",
  "rgba(255,255,255", "rgba(255, 255, 255",
  "rgba(240,240,250", "rgba(240, 240, 250",
  "rgba(220,220,245", "rgba(220, 220, 245",
];

function hasColoredAncestor(el: HTMLElement): boolean {
  let node = el.parentElement;
  let depth = 0;
  while (node && depth < 5) {
    const bg = node.style.background || node.style.backgroundColor;
    if (bg) {
      if (COLORED_BGS.some((c) => bg.includes(c))) return true;
      if (bg.includes("linear-gradient") && (bg.includes("2b5ce6") || bg.includes("2563eb") || bg.includes("f59e0b"))) return true;
    }
    node = node.parentElement;
    depth++;
  }
  return false;
}

function ownHasColoredBg(el: HTMLElement): boolean {
  const bg = el.style.background || el.style.backgroundColor;
  if (!bg) return false;
  if (COLORED_BGS.some((c) => bg.includes(c))) return true;
  if (bg.includes("linear-gradient") && (bg.includes("2b5ce6") || bg.includes("2563eb") || bg.includes("f59e0b"))) return true;
  return false;
}

function enforce() {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem("paw_theme") !== "light") return;

  document.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const color = el.style.color;
    if (!color) return;

    // Never touch PAW accent colors
    if (KEEP_COLORS.some((c) => color.toLowerCase().includes(c.toLowerCase()))) return;

    // Skip elements on or inside colored backgrounds
    if (ownHasColoredBg(el) || hasColoredAncestor(el)) return;

    const isWhitish = WHITISH.some((w) => color.toLowerCase().includes(w.toLowerCase()));
    if (!isWhitish) return;

    // Pick darkness level from opacity hint in the value
    if (color.includes("0.6") || color.includes("0.55") || color.includes("0.65") || color.includes("0.7") || color.includes("0.75")) {
      el.style.color = "#3E4C63";
    } else if (color.includes("0.3") || color.includes("0.35") || color.includes("0.4") || color.includes("0.45") || color.includes("0.5")) {
      el.style.color = "#6B7A99";
    } else {
      el.style.color = "#0B1220";
    }
  });
}

export default function ThemeEnforcer() {
  useEffect(() => {
    enforce();

    const observer = new MutationObserver(() => {
      if (localStorage.getItem("paw_theme") === "light") enforce();
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: false });

    return () => observer.disconnect();
  }, []);

  return null;
}
