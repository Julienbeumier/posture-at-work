import type { Metadata } from "next";
import LandingClient from "@/components/LandingClient";

export const metadata: Metadata = {
  title: "PostureAtWork — Bilan santé au travail par IA",
  description:
    "Fais ton bilan santé au travail en 5 minutes. Questionnaire clinique validé par un kinésithérapeute + analyse vidéo IA posturale. Détecte tes risques TMS et reçois des conseils personnalisés.",
  alternates: {
    canonical: "https://postureatwork.com",
  },
};

export default function Page() {
  return <LandingClient />;
}
