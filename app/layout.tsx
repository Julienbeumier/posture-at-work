import type { Metadata } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PostureAtWork — Ton bilan santé au bureau",
  description:
    "Screening santé gratuit pour les travailleurs sédentaires. Résultats immédiats et conseils personnalisés en 5 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${nunito.variable} ${jakarta.variable}`}>
      <body
        className="min-h-screen antialiased"
        style={{
          background: "#0f0f1a",
          color: "#f0f0fa",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}
      >
        <Navbar />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
