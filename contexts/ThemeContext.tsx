"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const DARK = {
  bgPrimary: "#1f2d4d",
  bgSecondary: "#263760",
  bgCard: "rgba(255,255,255,0.09)",
  bgCard2: "rgba(255,255,255,0.11)",
  border: "rgba(255,255,255,0.14)",
  border2: "rgba(255,255,255,0.16)",
  cardGrad: "linear-gradient(160deg, rgba(255,255,255,0.17), rgba(255,255,255,0.07))",
  borderStrong: "rgba(255,255,255,0.24)",
  textPrimary: "#f5f8ff",
  textSecondary: "rgba(238,243,255,0.80)",
  textMuted: "rgba(238,243,255,0.60)",
  accent: "#2b5ce6",
  mainBg: [
    "radial-gradient(900px 650px at 12% 0%, rgba(104,146,255,0.42), transparent 60%)",
    "radial-gradient(700px 500px at 88% 4%, rgba(124,159,255,0.14), transparent 55%)",
    "#1f2d4d",
  ].join(", "),
};

const LIGHT = {
  bgPrimary: "#DCE5F4",
  bgSecondary: "#D0DBEE",
  bgCard: "rgba(255,255,255,0.74)",
  bgCard2: "rgba(255,255,255,0.66)",
  border: "rgba(30,50,90,0.14)",
  border2: "rgba(30,50,90,0.17)",
  cardGrad: "linear-gradient(160deg, rgba(255,255,255,0.97), rgba(255,255,255,0.70))",
  borderStrong: "rgba(30,50,90,0.22)",
  textPrimary: "#14213D",
  textSecondary: "#44557A",
  textMuted: "#5E6E92",
  accent: "#2563EB",
  mainBg: [
    "radial-gradient(1100px 700px at 12% 8%, rgba(91,127,255,0.20), transparent 58%)",
    "radial-gradient(900px 600px at 92% 14%, rgba(56,189,248,0.10), transparent 55%)",
    "linear-gradient(180deg, #DCE5F4, #D0DBEE)",
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
