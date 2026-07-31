import type { Metadata } from "next";
import EntrepriseClient from "./EntrepriseClient";

export const metadata: Metadata = {
  title: "PostureAtWork Entreprise — Prévention TMS & Score ESG Social",
  description: "Screenez la santé ergonomique de vos équipes en 5 minutes. Dashboard RH anonymisé, rapport bien-être, conformité CPPT/DUER. À partir de 490€/an.",
  alternates: { canonical: "https://postureatwork.com/entreprise" },
};

export default function EntreprisePage() {
  return <EntrepriseClient />;
}
