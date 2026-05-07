// ─── Answer types ────────────────────────────────────────────────────────────

export interface QuestionnaireAnswers {
  // Cat 1 — Setup
  q1: string;   // laptop | laptop_screen | desktop | mixed
  q2: string;   // office | remote | both | open
  q3: string;   // yes | approx | no | dunno
  q4: string;   // close | ideal | far | dunno
  q5: string;   // good | bad | trackpad
  q5b: string;  // adjustable | fixed | couch | ball
  q5c: string;  // adapted | not_adapted | none_needed

  // Cat 2 — Pain
  q6: number | null;   // 0-5
  q7: number | null;
  q8: number | null;
  q9: number | null;
  q10: number | null;
  q11: string;  // none | days | weeks | months | year
  q12: string;  // none | morning | day | end | always
  q12b: string; // yes | partial | no | none

  // Cat 3 — Work habits
  q13: number;  // 1-12 slider
  q14: string;  // never | 1x | 2h | 1h
  q14b: string; // cardio | strength | yoga | team | mixed | none
  q15: string;  // headset | hand | speaker | rarely

  // Cat 4 — Sleep & energy
  q17: number;  // 4-10 slider
  q18: string;  // fresh | tired | exhausted
  q19: number;  // 0-3 liters slider (step 0.25)
  q20: string;  // never | sometimes | often | always

  // Cat 5 — Nutrition
  qn1: string;  // screen | cafeteria | outside | home
  qn2: string;  // energetic | slight_dip | crash | unfocused
  qn3: string;  // never | morning | afternoon | always
  qn4: string;  // balanced | sandwich | hot | varies | skip

  // Cat 6 — Body (formerly Cat 5)
  q21: string[];   // none | back | cervical | tendinite | burnout | sleep_disorder | autre
  q21_other: string;
  q22: string;  // never | 1x | 2-3x | daily
  q23: string;  // never | sometimes | regularly
  q24: string;  // good | bad | dunno | depends

  // Cat 7 — Global feeling (formerly Cat 6)
  q25: number | null; // 1-5
}

export const DEFAULT_ANSWERS: QuestionnaireAnswers = {
  q1: "", q2: "", q3: "", q4: "", q5: "", q5b: "", q5c: "",
  q6: null, q7: null, q8: null, q9: null, q10: null,
  q11: "", q12: "", q12b: "",
  q13: 7, q14: "", q14b: "", q15: "",
  q17: 7, q18: "", q19: 1.5, q20: "",
  qn1: "", qn2: "", qn3: "", qn4: "",
  q21: [], q21_other: "",
  q22: "", q23: "", q24: "",
  q25: null,
};

// ─── Score types ─────────────────────────────────────────────────────────────

export interface Scores {
  global: number;
  setup: number;
  pain: number;
  habits: number;
  sleep_energy: number;
  lifestyle: number;
  nutrition: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function lookup(map: Record<string, number>, key: string, fallback = 50): number {
  return key in map ? map[key] : fallback;
}

// ─── Sub-score calculators ────────────────────────────────────────────────────

function calcSetup(a: QuestionnaireAnswers): number {
  let raw = 0;
  raw += lookup({ laptop: -15, laptop_screen: 5, desktop: 10, mixed: 0 }, a.q1, 0);
  raw += lookup({ yes: 20, approx: 10, no: -20, dunno: 0 }, a.q3, 0);
  raw += lookup({ close: -10, ideal: 20, far: -5, dunno: 0 }, a.q4, 0);
  raw += lookup({ good: 20, bad: -15, trackpad: -5 }, a.q5, 0);
  raw += lookup({ adjustable: 20, fixed: -10, couch: -25, ball: 10 }, a.q5b, 0);
  raw += lookup({ adapted: 10, not_adapted: -5, none_needed: 5 }, a.q5c, 0);
  // min=-75, max=90, range=165
  return clamp(Math.round(((raw + 75) / 165) * 100));
}

function scaleToScore(v: number | null): number {
  if (v === null) return 80;
  return Math.max(0, 100 - v * 20);
}

function calcPain(a: QuestionnaireAnswers): number {
  const q11Score = lookup(
    { none: 100, days: 80, weeks: 60, months: 40, year: 20 },
    a.q11, 80
  );
  const q12Score = lookup(
    { none: 100, morning: 60, day: 70, end: 75, always: 30 },
    a.q12, 80
  );
  const q12bScore = lookup(
    { yes: 90, partial: 70, no: 15, none: 100 },
    a.q12b, 80
  );
  const all = [
    scaleToScore(a.q6),
    scaleToScore(a.q7),
    scaleToScore(a.q8),
    scaleToScore(a.q9),
    scaleToScore(a.q10),
    q11Score,
    q12Score,
    q12bScore,
  ];
  return clamp(all.reduce((s, v) => s + v, 0) / all.length);
}

function calcHabits(a: QuestionnaireAnswers): number {
  const h = a.q13;
  const q13 =
    h <= 4 ? 100 : h <= 5 ? 85 : h <= 6 ? 70 : h <= 7 ? 55 : h <= 8 ? 40 : h <= 9 ? 25 : 10;
  const q14 = lookup({ never: 0, "1x": 30, "2h": 70, "1h": 100 }, a.q14, 50);
  const q14b = lookup(
    { yoga: 100, mixed: 90, cardio: 75, team: 70, strength: 65, none: 15 },
    a.q14b, 50
  );
  const q15 = lookup({ headset: 100, rarely: 90, speaker: 80, hand: 20 }, a.q15, 50);
  return clamp((q13 + q14 + q14b + q15) / 4);
}

function calcSleepEnergy(a: QuestionnaireAnswers): number {
  const h = a.q17;
  const q17 =
    h >= 7 && h <= 8 ? 100 : h === 9 ? 80 : h === 6 ? 75 : h === 5 ? 50 : h <= 4 ? 20 : 60;
  const q18 = lookup({ fresh: 100, tired: 50, exhausted: 10 }, a.q18, 50);
  const w = a.q19; // liters (0-3)
  const q19 = w >= 2 ? 100 : w >= 1.5 ? 85 : w >= 1 ? 60 : w >= 0.5 ? 30 : 10;
  const q20 = lookup({ never: 100, sometimes: 70, often: 40, always: 10 }, a.q20, 50);
  return clamp((q17 + q18 + q19 + q20) / 4);
}

function calcLifestyle(a: QuestionnaireAnswers): number {
  const diagMap: Record<string, number> = {
    none: 100, autre: 70, burnout: 65, sleep_disorder: 65,
    tendinite: 50, cervical: 40, back: 25,
  };
  const q21Arr = Array.isArray(a.q21) ? a.q21 : [];
  const q21 =
    q21Arr.length === 0 ? 80 : Math.min(...q21Arr.map((v) => diagMap[v] ?? 70));
  const q22 = lookup({ never: 20, "1x": 60, "2-3x": 85, daily: 100 }, a.q22, 50);
  const q23 = lookup({ never: 20, sometimes: 60, regularly: 100 }, a.q23, 50);
  const q24 = lookup({ good: 100, depends: 70, dunno: 50, bad: 20 }, a.q24, 50);
  return clamp((q21 + q22 + q23 + q24) / 4);
}

function calcNutrition(a: QuestionnaireAnswers): number {
  const qn1 = lookup({ outside: 100, cafeteria: 85, home: 75, screen: 20 }, a.qn1, 50);
  const qn2 = lookup({ energetic: 100, slight_dip: 75, unfocused: 40, crash: 20 }, a.qn2, 50);
  const qn3 = lookup({ never: 100, morning: 70, afternoon: 45, always: 20 }, a.qn3, 50);
  const qn4 = lookup({ balanced: 100, hot: 75, varies: 60, sandwich: 45, skip: 10 }, a.qn4, 50);
  return clamp((qn1 + qn2 + qn3 + qn4) / 4);
}

// ─── Main scoring function ────────────────────────────────────────────────────

export function calculateScores(a: QuestionnaireAnswers): Scores {
  const setup = calcSetup(a);
  const pain = calcPain(a);
  const habits = calcHabits(a);
  const sleep_energy = calcSleepEnergy(a);
  const lifestyle = calcLifestyle(a);
  const nutrition = calcNutrition(a);
  const global = clamp(
    setup * 0.2 + pain * 0.3 + habits * 0.2 + sleep_energy * 0.1 + lifestyle * 0.1 + nutrition * 0.1
  );
  return { global, setup, pain, habits, sleep_energy, lifestyle, nutrition };
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Bon";
  if (score >= 50) return "Moyen";
  if (score >= 35) return "Faible";
  return "Critique";
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#eab308";
  if (score >= 35) return "#f97316";
  return "#ef4444";
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export interface Recommendation {
  title: string;
  description: string;
  priority: "urgent" | "important" | "good";
  score: number;
}

export function getRecommendations(
  scores: Scores,
  a: QuestionnaireAnswers
): Recommendation[] {
  const candidates: Recommendation[] = [];

  // Priority 0 — persistent pain at rest (pathological signal)
  if (a.q12b === "no") {
    candidates.push({
      title: "⚠️ Tes douleurs persistent au repos — consulte un professionnel",
      description:
        "Des douleurs qui restent même pendant les vacances ou le week-end ne sont pas d'origine purement posturale. C'est un signal qui nécessite un avis médical (médecin, kinésithérapeute ou ostéopathe) avant toute autre démarche.",
      priority: "urgent",
      score: 0, // always first
    });
  }

  // Setup recommendations
  if (scores.setup < 50) {
    let desc = "🖥️ Un écran mal placé génère jusqu'à 4x plus de tension cervicale. ";
    if (a.q5b === "couch")
      desc += "🛋️ Travailler depuis le canapé est la cause #1 des lombalgies en télétravail — investis dans une chaise de bureau même basique. ";
    if (a.q1 === "laptop")
      desc += "Laptop seul = combo catastrophique. Investis dans un support + clavier/souris externes (moins de 40€). ";
    if (a.q3 === "no")
      desc += "Ton écran est trop bas : remonte-le exactement à hauteur des yeux. ";
    if (a.q4 === "close")
      desc += "Tu es trop proche de ton écran — recule à 50-70cm. ";
    if (a.q5c === "not_adapted")
      desc += "👓 Des lunettes non adaptées à l'écran forcent ton corps à compenser — consulte un opticien.";
    candidates.push({
      title: "Ton setup est ton problème #1",
      description: desc.trim(),
      priority: scores.setup < 30 ? "urgent" : "important",
      score: scores.setup,
    });
  } else if (a.q5b === "couch") {
    candidates.push({
      title: "🛋️ Le canapé détruit ta posture",
      description:
        "Travailler depuis le canapé est la cause #1 des lombalgies en télétravail. Même une chaise de bureau basique à 50€ fera une différence immédiate.",
      priority: "important",
      score: scores.setup,
    });
  } else if (a.q5c === "not_adapted") {
    candidates.push({
      title: "👓 Tes lunettes ne sont pas adaptées à l'écran",
      description:
        "Des lunettes non adaptées obligent ton corps à se rapprocher de l'écran ou à incliner la tête, créant des tensions cervicales. Consulte un opticien pour des verres anti-reflet ou progressifs.",
      priority: "important",
      score: scores.setup + 5,
    });
  }

  // Pain recommendations
  if (scores.pain < 50) {
    const painAreas: string[] = [];
    if ((a.q6 ?? 0) >= 3) painAreas.push("nuque/cou");
    if ((a.q7 ?? 0) >= 3) painAreas.push("haut du dos/épaules");
    if ((a.q8 ?? 0) >= 3) painAreas.push("bas du dos");
    if ((a.q9 ?? 0) >= 3) painAreas.push("poignets/avant-bras");
    if ((a.q10 ?? 0) >= 3) painAreas.push("yeux/tête");
    let desc = "Tes douleurs sont significatives et installées — elles nécessitent une action immédiate. ";
    if (painAreas.length > 0) desc += `Zones critiques : ${painAreas.join(", ")}. `;
    if (a.q11 === "year" || a.q11 === "months")
      desc += "Après plusieurs mois, consulte un kinésithérapeute pour éviter la chronicisation. ";
    if (a.q12 === "always")
      desc += "Des douleurs permanentes signalent une inflammation active.";
    candidates.push({
      title: "🔴 Tes douleurs nécessitent une action immédiate",
      description: desc.trim(),
      priority: scores.pain < 30 ? "urgent" : "important",
      score: scores.pain,
    });
  }

  // Habits recommendations
  if (scores.habits < 50) {
    let desc = "Rester assis sans bouger est la cause #1 des TMS au bureau. ";
    if (a.q13 >= 8) desc += `${a.q13}h assis/jour dépasse le seuil critique de 6h. `;
    if (a.q14 === "never")
      desc += "Programme une alarme toutes les 45min pour te lever 2 minutes. ";
    else if (a.q14 === "1x")
      desc += "1 pause/jour c'est insuffisant. Vise minimum toutes les 2h. ";
    if (a.q15 === "hand")
      desc += "Tenir le téléphone à la main tête baissée est destructeur pour la nuque — passe en mains-libres.";
    if (a.q14b === "none")
      desc += "Aucune activité physique avec la sédentarité du bureau = risque élevé. Commence par 20min de marche 3x/semaine.";
    candidates.push({
      title: "⏱️ Tu restes assis trop longtemps",
      description: desc.trim(),
      priority: "important",
      score: scores.habits,
    });
  }

  // Sleep & energy recommendations
  if (scores.sleep_energy < 50) {
    let desc = "Le manque de récupération amplifie toutes tes douleurs et réduit ta résistance. ";
    if (a.q18 === "exhausted")
      desc += "Se réveiller épuisé = dette de sommeil chronique. Vise une heure fixe + coupe les écrans 1h avant. ";
    if (a.q19 <= 0.75)
      desc += `Avec ${a.q19}L d'eau/jour tu es probablement déshydraté — ça cause fatigue et maux de tête. Pose une gourde sur ton bureau. `;
    if (a.q20 === "always" || a.q20 === "often")
      desc += "Les coups de fatigue post-déjeuner viennent souvent d'un repas trop riche en glucides.";
    candidates.push({
      title: "😴 Ton manque de récupération amplifie tout",
      description: desc.trim(),
      priority: a.q18 === "exhausted" ? "urgent" : "important",
      score: scores.sleep_energy,
    });
  }

  // Nutrition recommendations
  if (scores.nutrition < 50) {
    let desc = "🍽️ Ton alimentation impacte directement ton énergie et ta concentration. ";
    if (a.qn1 === "screen")
      desc += "Manger devant l'écran empêche la déconnexion cognitive et favorise les pics glycémiques. Fais une vraie pause. ";
    if (a.qn2 === "crash")
      desc += "Le coup de barre post-déjeuner est souvent lié à un repas trop riche en glucides rapides — rééquilibre avec des protéines. ";
    if (a.qn4 === "skip")
      desc += "Sauter le repas crée des hypoglycémies qui réduisent la concentration et favorisent les fringales. ";
    if (a.qn3 === "always")
      desc += "Les grignotages constants signalent un déséquilibre alimentaire — vise 3 repas structurés.";
    candidates.push({
      title: "🍽️ Ton alimentation freine tes performances",
      description: desc.trim(),
      priority: "important",
      score: scores.nutrition,
    });
  }

  // Lifestyle recommendations
  if (scores.lifestyle < 50) {
    let desc = "Ton corps manque de mouvement pour compenser la sédentarité. ";
    if (a.q22 === "never")
      desc += "Même 20min de marche rapide 3x/semaine réduit significativement les douleurs chroniques. ";
    if (a.q23 === "never")
      desc += "5min d'étirements matin et soir peuvent transformer ton confort en 2 semaines. ";
    if (a.q24 === "bad")
      desc += "Rappel visuel : '3 points de contact : pieds au sol, bassin en arrière, dos contre le dossier'.";
    if ((a.q21 ?? []).includes("back") || (a.q21 ?? []).includes("cervical"))
      desc += "Avec ton historique médical, toute reprise d'activité doit être validée par un professionnel.";
    candidates.push({
      title: "💪 Ton corps a besoin de plus de mouvement",
      description: desc.trim(),
      priority: "important",
      score: scores.lifestyle,
    });
  }

  // Positive rec if overall score is good
  if (scores.global >= 70 && candidates.length === 0) {
    candidates.push({
      title: "✅ Tu as de bonnes habitudes",
      description:
        "Tes scores sont globalement solides. Continue sur cette lancée et travaille sur le ou les indicateurs les plus faibles pour atteindre un confort optimal.",
      priority: "good",
      score: scores.global,
    });
  }

  return candidates.sort((a, b) => a.score - b.score).slice(0, 4);
}

// ─── Exercises ────────────────────────────────────────────────────────────────

export interface Exercise {
  name: string;
  duration: string;
  description: string;
  emoji: string;
  targets: string;
}

export function getExercises(
  scores: Scores,
  a: QuestionnaireAnswers
): Exercise[] {
  const ex: Exercise[] = [];

  if ((a.q6 ?? 0) >= 2 || (a.q7 ?? 0) >= 2 || a.q1 === "laptop") {
    ex.push({
      name: "Rotations cervicales lentes",
      duration: "2 min — toutes les heures",
      description:
        "Assis droit, baisse lentement le menton vers la poitrine, puis tourne la tête à droite jusqu'à regarder par-dessus l'épaule. Retour au centre. Répète à gauche. 5 cycles de chaque côté.",
      emoji: "🔄",
      targets: "Nuque & trapèzes",
    });
  }

  if ((a.q8 ?? 0) >= 2 || a.q13 >= 7 || a.q5b === "couch") {
    ex.push({
      name: "Étirement chat-vache",
      duration: "1 min — 2x par jour",
      description:
        "Sur ta chaise, mains posées sur les genoux. Expire en arrondissant le dos vers l'arrière (chat). Inspire en creusant le bas du dos, poitrine vers l'avant (vache). 10 répétitions lentes.",
      emoji: "🐱",
      targets: "Colonne vertébrale & lombaires",
    });
  }

  if ((a.q7 ?? 0) >= 2 || (a.q9 ?? 0) >= 2 || a.q1 === "laptop") {
    ex.push({
      name: "Ouverture pectorale au coin",
      duration: "30 sec — chaque pause",
      description:
        "Debout face au coin d'un mur. Place un avant-bras de chaque côté en L à 90°. Avance doucement le buste jusqu'à sentir l'étirement dans la poitrine. Tiens 30 secondes.",
      emoji: "🤸",
      targets: "Pectoraux & épaules",
    });
  }

  if ((a.q9 ?? 0) >= 2) {
    ex.push({
      name: "Étirements poignets & avant-bras",
      duration: "1 min — après chaque heure de clavier",
      description:
        "Tends un bras devant toi, paume vers le bas. Tire doucement les doigts vers toi (10 sec). Puis paume vers le haut, tire les doigts vers le bas (10 sec). Alterne les deux bras.",
      emoji: "🙌",
      targets: "Poignets & avant-bras",
    });
  }

  if (scores.sleep_energy < 50 || (a.q10 ?? 0) >= 2) {
    ex.push({
      name: "Respiration 4-7-8",
      duration: "1 min — en cas de fatigue",
      description:
        "Inspire silencieusement par le nez pendant 4 secondes. Bloque 7 secondes. Expire par la bouche en 8 secondes. 4 cycles. Active le système parasympathique en moins d'une minute.",
      emoji: "🌬️",
      targets: "Système nerveux & yeux",
    });
  }

  if (ex.length < 2) {
    ex.push({
      name: "Marche active post-déjeuner",
      duration: "10 min — après chaque repas",
      description:
        "10 minutes de marche après le déjeuner réduisent la glycémie, améliorent la digestion et rechargent l'énergie pour l'après-midi. Sans écran, à l'air libre si possible.",
      emoji: "🚶",
      targets: "Énergie & métabolisme",
    });
  }

  return ex.slice(0, 3);
}
