import type { Metadata } from "next";
import LandingClient from "@/components/LandingClient";

export const metadata: Metadata = {
  title: "Bilan ergonomique gratuit en 5 minutes — PostureAtWork",
  description:
    "Mal de dos, nuque tendue, fatigue ? Obtiens un bilan complet de ta santé au travail en 5 minutes. Posture, douleurs, sommeil, nutrition — conseils actionnables gratuits.",
  alternates: {
    canonical: "https://postureatwork.com",
  },
};

export default function Page() {
  return <LandingClient />;
}
