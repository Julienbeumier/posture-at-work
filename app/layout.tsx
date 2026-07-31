import type { Metadata } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeEnforcer from "@/components/ThemeEnforcer";

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
  metadataBase: new URL("https://postureatwork.com"),
  title: {
    default: "PostureAtWork — Bilan santé au travail par IA",
    template: "%s | PostureAtWork",
  },
  description:
    "Fais ton bilan santé au travail en 5 minutes. Questionnaire clinique validé par un kinésithérapeute + analyse vidéo IA posturale. Détecte tes risques TMS et reçois des conseils personnalisés.",
  keywords: [
    "bilan ergonomique", "posture bureau", "douleurs dos travail",
    "ergonomie poste de travail", "mal de dos télétravail",
    "bilan santé travail", "TMS prévention", "posture laptop",
  ],
  authors: [{ name: "PostureAtWork" }],
  creator: "PostureAtWork",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://postureatwork.com",
    siteName: "PostureAtWork",
    title: "PostureAtWork — Bilan ergonomique gratuit en 5 minutes",
    description: "Analyse ta posture, tes douleurs et tes habitudes au travail en 5 minutes. Conseils personnalisés et analyse IA.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PostureAtWork — Bilan ergonomique gratuit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostureAtWork — Bilan ergonomique gratuit en 5 minutes",
    description: "Analyse ta posture et tes douleurs au travail en 5 minutes. Gratuit.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://postureatwork.com",
  },
  verification: {
    google: "Ba6UTM-ePEuvCQTZGVpTAZx2Ao3aqacFw1_q7tpTu38",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${nunito.variable} ${jakarta.variable}`}>
      <head>
        {/* Anti-flash: apply saved theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('paw_theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}` }} />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
      >
        <ThemeProvider>
          <ThemeEnforcer />
          <Navbar />
          {children}
          <CookieBanner />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
