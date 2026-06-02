"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const DARK = {
  bgPrimary: "#0f0f1a",
  bgSecondary: "#1b1b2e",
  bgCard: "rgba(255,255,255,0.03)",
  bgCard2: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.08)",
  textPrimary: "#f0f0fa",
  textSecondary: "rgba(220,220,245,0.65)",
  textMuted: "rgba(220,220,245,0.40)",
  accent: "#2b5ce6",
  mainBg: "#0f0f1a",
};

const LIGHT = {
  bgPrimary: "#F3F7FF",
  bgSecondary: "#ECF7FF",
  bgCard: "rgba(255,255,255,0.74)",
  bgCard2: "rgba(255,255,255,0.60)",
  border: "rgba(15,23,42,0.12)",
  border2: "rgba(15,23,42,0.15)",
  textPrimary: "#0B1220",
  textSecondary: "#3E4C63",
  textMuted: "#6B7A99",
  accent: "#2563EB",
  mainBg: [
    "radial-gradient(1100px 700px at 12% 8%, rgba(37,99,235,0.12), transparent 58%)",
    "radial-gradient(900px 600px at 92% 14%, rgba(56,189,248,0.10), transparent 55%)",
    "radial-gradient(850px 520px at 65% 92%, rgba(16,185,129,0.08), transparent 55%)",
    "linear-gradient(180deg, #F3F7FF, #ECF7FF)",
  ].join(", "),
};

interface ThemeCtx {
  theme: "dark" | "light";
  toggle: () => void;
  c: typeof DARK;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("paw_theme") || "dark") as "dark" | "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("paw_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, c: theme === "dark" ? DARK : LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
