"use client";
import { createContext, useContext, type ReactNode } from "react";

const LIGHT = {
  bgPrimary: "#f8f9fb",
  bgSecondary: "#f0f2f5",
  bgCard: "#ffffff",
  bgCard2: "#f8f9fb",
  border: "#e5e7eb",
  border2: "#d1d5db",
  textPrimary: "#111827",
  textSecondary: "#374151",
  textMuted: "#6b7280",
  accent: "#2b5ce6",
  mainBg: "#f8f9fb",
};

interface ThemeCtx {
  theme: "light";
  toggle: () => void;
  c: typeof LIGHT;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "light",
  toggle: () => {},
  c: LIGHT,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: "light", toggle: () => {}, c: LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
