import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PostureAtWork — Ton bilan santé au bureau",
  description:
    "Screening santé gratuit pour les travailleurs sédentaires. Résultats immédiats et conseils personnalisés en 5 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="min-h-screen bg-[#0a0a0a] text-slate-100 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
