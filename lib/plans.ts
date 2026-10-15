// Grille tarifaire « Diagnostic PAW » — paiement unique (octobre 2026).
// Source du coût d'un jour d'absence : Securex, « L'absentéisme en 2022 » :
// 321 € de coûts directs (salaire garanti) + 802 € de coûts indirects = 1 123 € par jour.
export const COUT_JOUR_ABSENCE_DIRECT = 321;
export const COUT_JOUR_ABSENCE_COMPLET = 1123;
export const SECUREX_URL =
  "https://www.securex.be/getmedia/a13c68a1-07b4-46b8-a7d9-21e046b77cfa/WhitePaper-Absenteisme-2022-fr.pdf?ext=.pdf";

export type PlanKey = "essentiel" | "pme" | "croissance" | "entreprise";

export type Plan = {
  key: PlanKey;
  name: string;
  /** Nombre maximum d'employés inclus (null = sur mesure). */
  maxEmployees: number | null;
  /** Prix en euros, paiement unique (null = sur devis). */
  price: number | null;
};

export const PLANS: Plan[] = [
  { key: "essentiel", name: "Essentiel", maxEmployees: 15, price: 590 },
  { key: "pme", name: "PME", maxEmployees: 50, price: 1490 },
  { key: "croissance", name: "Croissance", maxEmployees: 100, price: 2490 },
  { key: "entreprise", name: "Entreprise", maxEmployees: null, price: null },
];

/** Nombre de jours d'absence (coût direct) dont le coût égale le prix du forfait. */
export function breakEvenDays(plan: Plan): number | null {
  if (plan.price === null) return null;
  return plan.price / COUT_JOUR_ABSENCE_DIRECT;
}
