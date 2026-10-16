import { DIMENSION_META, type Dimension } from "@/lib/tips";

// ─── Dimensions (regroupement des clés de score en 5 dimensions affichées) ────

export interface DimScore {
  slug: Dimension;
  label: string;
  emoji: string;
  color: string;
  score: number;
}

const LABELS: Record<Dimension, string> = {
  setup: "Setup",
  douleurs: "Douleurs",
  habitudes: "Habitudes",
  "mode-de-vie": "Mode de vie",
  nutrition: "Nutrition",
};

const FOCUS: Record<Dimension, string> = {
  setup: "Posture et nuque",
  douleurs: "Soulagement des douleurs",
  habitudes: "Mobilité au bureau",
  "mode-de-vie": "Récupération",
  nutrition: "Bien-être global",
};

export function scoreColor(s: number) {
  return s >= 70 ? "#3fe0a0" : s >= 50 ? "#ffa347" : "#ff7b7b";
}

/** Les 5 dimensions, de la plus faible à la plus forte. */
export function dimensionScores(scores: Record<string, number> | null | undefined): DimScore[] {
  const s = scores ?? {};
  const pick = (...keys: string[]) => {
    for (const k of keys) if (typeof s[k] === "number") return s[k];
    return undefined;
  };
  const life = [pick("sleep_energy", "mode_de_vie", "sommeil"), pick("lifestyle")]
    .filter((v): v is number => v !== undefined);
  const values: Record<Dimension, number | undefined> = {
    setup: pick("setup"),
    douleurs: pick("pain", "douleurs"),
    habitudes: pick("habits", "habitudes"),
    "mode-de-vie": life.length ? Math.round(life.reduce((a, b) => a + b, 0) / life.length) : undefined,
    nutrition: pick("nutrition"),
  };
  return (Object.keys(values) as Dimension[])
    .filter(slug => values[slug] !== undefined)
    .map(slug => ({
      slug,
      label: LABELS[slug],
      emoji: DIMENSION_META[slug].emoji,
      color: DIMENSION_META[slug].color,
      score: values[slug] as number,
    }))
    .sort((a, b) => a.score - b.score);
}

export function focusLabel(dims: DimScore[]) {
  return dims[0] ? FOCUS[dims[0].slug] : "Bien-être général";
}

// ─── Checklist du jour ────────────────────────────────────────────────────────

export interface ChecklistTask { id: string; text: string; dim: string; color: string }

const TASKS: Record<Dimension, Array<{ id: string; text: string }>> = {
  setup: [
    { id: "screen_height", text: "Vérifie que le haut de ton écran est au niveau de tes yeux" },
    { id: "chair_position", text: "Pieds à plat, genoux à 90°, lombaires contre le dossier" },
  ],
  douleurs: [
    { id: "chin_tuck", text: "Fais 10 rétractions cervicales maintenant (rentre le menton)" },
    { id: "stretch_break", text: "2 minutes d'étirements dos et nuque avant 12h" },
  ],
  habitudes: [
    { id: "break_alarm", text: "Programme une alarme dans 45 min pour te lever" },
    { id: "lunch_break", text: "Mange loin de ton écran aujourd'hui" },
  ],
  nutrition: [
    { id: "water", text: "Bois un grand verre d'eau maintenant" },
    { id: "protein_lunch", text: "Prévois une source de protéine à chaque repas aujourd'hui" },
  ],
  "mode-de-vie": [
    { id: "screen_off", text: "Coupe les écrans 30 min avant de dormir ce soir" },
  ],
};

const GENERIC: Array<{ id: string; text: string; dim: Dimension }> = [
  { id: "posture_check", text: "Fais un check de ta posture maintenant : dos droit, épaules relâchées", dim: "setup" },
  { id: "water_2", text: "Vise 1,5 L d'eau aujourd'hui : tu en es où ?", dim: "nutrition" },
];

/** 4 tâches, réparties sur les dimensions les plus faibles (la plus faible d'abord). */
export function buildChecklist(dims: DimScore[]): ChecklistTask[] {
  const weak = dims.filter(d => d.score < 75);
  const out: ChecklistTask[] = [];
  const meta = (slug: Dimension) => ({ dim: LABELS[slug], color: DIMENSION_META[slug].color });
  for (let round = 0; round < 2 && out.length < 4; round++) {
    for (const d of weak) {
      const t = TASKS[d.slug][round];
      if (t && out.length < 4) out.push({ ...t, ...meta(d.slug) });
    }
  }
  for (const g of GENERIC) {
    if (out.length < 4) out.push({ id: g.id, text: g.text, ...meta(g.dim) });
  }
  return out;
}

// ─── Parcours : étape suivante ────────────────────────────────────────────────

export const REBILAN_DAYS = 28;
export const EXERCISE_GOAL = 3;

export interface NextStep {
  step: 2 | 3 | 4 | 5 | null;
  title: string;
  text: string;
  cta?: string;
  href?: string;
}

export function nextStep(p: {
  hasVideo: boolean;
  exerciseDays: number;
  checklistDone: number;
  checklistTotal: number;
  daysSinceBilan: number;
}): NextStep {
  if (!p.hasVideo) {
    return {
      step: 2, title: "Analyse ta posture en vidéo",
      text: "40 secondes pour voir ce que ton corps fait réellement à ton poste.",
      cta: "Lancer l'analyse", href: "/video-intro",
    };
  }
  if (p.exerciseDays < EXERCISE_GOAL) {
    return {
      step: 3, title: "Fais ta séance d'exercices",
      text: p.exerciseDays === 0
        ? "Un programme court, ciblé sur ta priorité du moment."
        : `${p.exerciseDays} séance${p.exerciseDays > 1 ? "s" : ""} cette semaine. Objectif : ${EXERCISE_GOAL}.`,
      cta: "Voir mon programme", href: "/mobilite",
    };
  }
  if (p.checklistDone < p.checklistTotal) {
    return {
      step: 4, title: "Termine ta checklist du jour",
      text: `${p.checklistDone} sur ${p.checklistTotal} faits. Ce sont de petits gestes, mais c'est leur régularité qui compte.`,
      cta: "Voir la checklist", href: "#parcours-etape-4",
    };
  }
  if (p.daysSinceBilan >= REBILAN_DAYS) {
    return {
      step: 5, title: "Refais ton bilan pour mesurer tes progrès",
      text: `Ton dernier bilan date de ${p.daysSinceBilan} jours. Compare avec tes résultats d'avant.`,
      cta: "Refaire mon bilan", href: "/questionnaire",
    };
  }
  const left = REBILAN_DAYS - p.daysSinceBilan;
  return {
    step: null, title: "Tout est à jour pour aujourd'hui",
    text: `Continue tes exercices et tes bons réflexes. Ton prochain bilan est conseillé dans ${left} jour${left > 1 ? "s" : ""}.`,
  };
}

// ─── Astuce du jour ───────────────────────────────────────────────────────────

const TIPS = [
  "Plus ta tête est inclinée vers l'avant, plus la charge sur tes cervicales augmente.",
  "Se lever et marcher quelques minutes régulièrement soulage le dos (EU-OSHA : micro-pause toutes les 20 à 30 min).",
  "Un écran trop bas force ta nuque en flexion permanente. Le haut de l'écran doit être au niveau des yeux.",
  "La règle 20-20-20 : toutes les 20 min, fixe un point à 6 m pendant 20 secondes.",
  "Un sommeil insuffisant peut augmenter la sensibilité à la douleur.",
  "Manger devant l'écran réduit l'attention portée au repas.",
  "Une hydratation insuffisante peut favoriser la fatigue et réduire la concentration.",
  "Travailler depuis le canapé expose à des postures prolongées défavorables pour la nuque et le dos.",
  "Le stress chronique maintient les muscles en tension : c'est un facteur de risque de TMS reconnu (EU-OSHA).",
  "Les disques intervertébraux contiennent beaucoup d'eau : boire régulièrement fait partie d'une bonne hygiène de vie pour le dos.",
  "Une vraie pause déjeuner sans écran aide à réduire la fatigue musculaire de l'après-midi.",
  "Régler sa chaise correctement aide à réduire la pression lombaire.",
  "5 min de cohérence cardiaque (respiration lente) : une technique simple pour favoriser la détente.",
  "Un laptop seul sans rehausseur impose une flexion de nuque prolongée.",
];

export function tipOfDay(nowMs: number) {
  return TIPS[Math.floor(nowMs / 86400000) % TIPS.length];
}
