// ─── Answer types ────────────────────────────────────────────────────────────

export interface QuestionnaireAnswers {
  // Cat 1 — Setup
  q1: string; // laptop | laptop_screen | desktop | mixed
  q2: string; // office | remote | both | open
  q3: string; // yes | approx | no | dunno
  q4: string; // close | ideal | far | dunno
  q5: string; // good | bad | trackpad

  // Cat 2 — Pain
  q6: number | null; // 0-5
  q7: number | null;
  q8: number | null;
  q9: number | null;
  q10: number | null;
  q11: string; // none | days | weeks | months | year
  q12: string; // none | morning | day | end | always

  // Cat 3 — Work habits
  q13: number; // 1-12 slider
  q14: string; // never | 1x | 2h | 1h
  q15: string; // desk | hand | headset
  q16: string; // always | sometimes | no

  // Cat 4 — Sleep & energy
  q17: number; // 4-10 slider
  q18: string; // fresh | tired | exhausted
  q19: number; // 0-10 slider
  q20: string; // never | sometimes | often | always

  // Cat 5 — Body
  q21: string[]; // none | hernie | tendinite | cervicalgie | autre
  q22: string; // never | 1x | 2-3x | daily
  q23: string; // never | sometimes | regularly
  q24: string; // good | bad | dunno | depends

  // Cat 6 — Global feeling
  q25: number | null; // 1-5
}

export const DEFAULT_ANSWERS: QuestionnaireAnswers = {
  q1: "", q2: "", q3: "", q4: "", q5: "",
  q6: null, q7: null, q8: null, q9: null, q10: null,
  q11: "", q12: "",
  q13: 7, q14: "", q15: "", q16: "",
  q17: 7, q18: "", q19: 5, q20: "",
  q21: [],
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
  // theoretical min=-60, max=70, range=130
  return clamp(Math.round(((raw + 60) / 130) * 100));
}

function scaleToScore(v: number | null): number {
  if (v === null) return 80; // benefit of the doubt if not answered
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
  const all = [
    scaleToScore(a.q6),
    scaleToScore(a.q7),
    scaleToScore(a.q8),
    scaleToScore(a.q9),
    scaleToScore(a.q10),
    q11Score,
    q12Score,
  ];
  return clamp(all.reduce((s, v) => s + v, 0) / all.length);
}

function calcHabits(a: QuestionnaireAnswers): number {
  const h = a.q13;
  const q13 =
    h <= 4 ? 100 : h <= 5 ? 85 : h <= 6 ? 70 : h <= 7 ? 55 : h <= 8 ? 40 : h <= 9 ? 25 : 10;
  const q14 = lookup({ never: 0, "1x": 30, "2h": 70, "1h": 100 }, a.q14, 50);
  const q15 = lookup({ desk: 100, headset: 80, hand: 20 }, a.q15, 50);
  const q16 = lookup({ always: 100, sometimes: 70, no: 50 }, a.q16, 50);
  return clamp((q13 + q14 + q15 + q16) / 4);
}

function calcSleepEnergy(a: QuestionnaireAnswers): number {
  const h = a.q17;
  const q17 =
    h >= 7 && h <= 8 ? 100 : h === 9 ? 80 : h === 6 ? 75 : h === 5 ? 50 : h <= 4 ? 20 : 60;
  const q18 = lookup({ fresh: 100, tired: 50, exhausted: 10 }, a.q18, 50);
  const w = a.q19;
  const q19 = w >= 8 ? 100 : w >= 6 ? 80 : w >= 4 ? 60 : w >= 2 ? 30 : 10;
  const q20 = lookup({ never: 100, sometimes: 70, often: 40, always: 10 }, a.q20, 50);
  return clamp((q17 + q18 + q19 + q20) / 4);
}

function calcLifestyle(a: QuestionnaireAnswers): number {
  const diagMap: Record<string, number> = {
    none: 100, autre: 70, tendinite: 50, cervicalgie: 40, hernie: 20,
  };
  const q21Arr = Array.isArray(a.q21) ? a.q21 : [];
  const q21 =
    q21Arr.length === 0 ? 80 : Math.min(...q21Arr.map((v) => diagMap[v] ?? 70));
  const q22 = lookup({ never: 20, "1x": 60, "2-3x": 85, daily: 100 }, a.q22, 50);
  const q23 = lookup({ never: 20, sometimes: 60, regularly: 100 }, a.q23, 50);
  const q24 = lookup({ good: 100, depends: 70, dunno: 50, bad: 20 }, a.q24, 50);
  return clamp((q21 + q22 + q23 + q24) / 4);
}

// ─── Main scoring function ────────────────────────────────────────────────────

export function calculateScores(a: QuestionnaireAnswers): Scores {
  const setup = calcSetup(a);
  const pain = calcPain(a);
  const habits = calcHabits(a);
  const sleep_energy = calcSleepEnergy(a);
  const lifestyle = calcLifestyle(a);
  const global = clamp(
    setup * 0.2 + pain * 0.3 + habits * 0.2 + sleep_energy * 0.15 + lifestyle * 0.15
  );
  return { global, setup, pain, habits, sleep_energy, lifestyle };
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
  score: number; // the score that triggered this rec (for sorting)
}

export function getRecommendations(
  scores: Scores,
  a: QuestionnaireAnswers
): Recommendation[] {
  const candidates: Recommendation[] = [];

  // Setup recommendations
  if (scores.setup < 50) {
    let desc =
      "🖥️ Un écran mal placé génère jusqu'à 4x plus de tension cervicale. ";
    if (a.q1 === "laptop")
      desc +=
        "Laptop seul = combo catastrophique. Investis dans un support + clavier/souris externes (moins de 40€). ";
    if (a.q3 === "no")
      desc +=
        "Ton écran est trop bas : remonte-le exactement à hauteur des yeux (distance d'un bras). ";
    if (a.q4 === "close")
      desc +=
        "Tu es trop proche de ton écran — recule à 50-70cm pour réduire la fatigue oculaire. ";
    if (a.q5 === "bad")
      desc +=
        "Éloigner les bras du corps génère de la tension dans les trapèzes. Rapproche clavier + souris.";
    candidates.push({
      title: "Ton setup est ton problème #1",
      description: desc.trim(),
      priority: scores.setup < 30 ? "urgent" : "important",
      score: scores.setup,
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

    let desc =
      "Tes douleurs sont significatives et installées — elles nécessitent une action immédiate. ";
    if (painAreas.length > 0)
      desc += `Zones critiques : ${painAreas.join(", ")}. `;
    if (a.q11 === "year" || a.q11 === "months")
      desc +=
        "Après plusieurs mois, consulte un kinésithérapeute pour éviter une chronicisation. ";
    if (a.q12 === "always")
      desc +=
        "Des douleurs permanentes signalent une inflammation active — ne continue pas à forcer.";

    candidates.push({
      title: "🔴 Tes douleurs nécessitent une action immédiate",
      description: desc.trim(),
      priority: scores.pain < 30 ? "urgent" : "important",
      score: scores.pain,
    });
  }

  // Habits recommendations
  if (scores.habits < 50) {
    let desc =
      "Rester assis sans bouger est la cause #1 des TMS au bureau. ";
    if (a.q13 >= 8)
      desc += `${a.q13}h assis/jour dépasse largement le seuil critique de 6h. `;
    if (a.q14 === "never")
      desc +=
        "Tu ne te lèves jamais : programme une alarme toutes les 45min pour te lever 2 minutes. ";
    else if (a.q14 === "1x")
      desc +=
        "1 pause/jour c'est insuffisant. Vise minimum toutes les 2h, idéalement toutes les heures. ";
    if (a.q15 === "hand")
      desc +=
        "Tenir le téléphone à la main tête baissée est très destructeur pour la nuque — passe en mode mains-libres.";
    candidates.push({
      title: "⏱️ Tu restes assis trop longtemps",
      description: desc.trim(),
      priority: "important",
      score: scores.habits,
    });
  }

  // Sleep & energy recommendations
  if (scores.sleep_energy < 50) {
    let desc =
      "Le manque de récupération amplifie toutes tes douleurs et réduit ta résistance au stress. ";
    if (a.q18 === "exhausted")
      desc +=
        "Se réveiller épuisé = dette de sommeil chronique. Vise une heure de coucher fixe + coupe les écrans 1h avant. ";
    if (a.q19 <= 3)
      desc += `Avec ${a.q19} verres d'eau/jour tu es probablement déshydraté — ça cause fatigue et maux de tête. Pose une gourde sur ton bureau. `;
    if (a.q20 === "always" || a.q20 === "often")
      desc +=
        "Les coups de fatigue post-déjeuner viennent souvent d'un repas trop riche en glucides + pas assez d'eau.";
    candidates.push({
      title: "😴 Ton manque de récupération amplifie tout",
      description: desc.trim(),
      priority: a.q18 === "exhausted" ? "urgent" : "important",
      score: scores.sleep_energy,
    });
  }

  // Lifestyle recommendations
  if (scores.lifestyle < 50) {
    let desc =
      "Ton corps manque de mouvement pour compenser la sédentarité. ";
    if (a.q22 === "never")
      desc +=
        "Même 20min de marche rapide 3x/semaine réduit significativement les douleurs chroniques. ";
    if (a.q23 === "never")
      desc +=
        "5min d'étirements matin et soir (nuque + pectoraux + hanches) peuvent transformer ton confort en 2 semaines. ";
    if (a.q24 === "bad")
      desc +=
        "Tu sais que tu t'affaisses souvent — pose un rappel visuel devant toi : '3 points de contact : pieds, bassin, dos'.";
    if ((a.q21 ?? []).includes("hernie") || (a.q21 ?? []).includes("cervicalgie"))
      desc +=
        "Avec ton historique médical, toute reprise d'activité doit être validée par un professionnel de santé.";
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
        "Tes scores sont globalement solides. Continue sur cette lancée et travaille sur le ou les indicateurs les plus faibles pour atteindre un confort optimal au quotidien.",
      priority: "good",
      score: scores.global,
    });
  }

  // Sort by score ascending (lowest = most urgent first), take top 3
  return candidates.sort((a, b) => a.score - b.score).slice(0, 3);
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
        "Assis droit, baisse lentement le menton vers la poitrine, puis tourne la tête à droite jusqu'à regarder par-dessus l'épaule. Retour au centre. Répète à gauche. 5 cycles de chaque côté, mouvements lents et contrôlés.",
      emoji: "🔄",
      targets: "Nuque & trapèzes",
    });
  }

  if ((a.q8 ?? 0) >= 2 || a.q13 >= 7) {
    ex.push({
      name: "Étirement chat-vache",
      duration: "1 min — 2x par jour",
      description:
        "Sur ta chaise, mains posées sur les genoux. Expire en arrondissant le dos vers l'arrière (chat). Inspire en creusant le bas du dos, poitrine vers l'avant (vache). 10 répétitions lentes et respirées.",
      emoji: "🐱",
      targets: "Colonne vertébrale & lombaires",
    });
  }

  if ((a.q7 ?? 0) >= 2 || (a.q9 ?? 0) >= 2 || a.q1 === "laptop") {
    ex.push({
      name: "Ouverture pectorale au coin",
      duration: "30 sec — chaque pause",
      description:
        "Debout face au coin d'un mur ou d'une porte. Place un avant-bras de chaque côté en L à 90°. Avance doucement le buste jusqu'à sentir l'étirement dans la poitrine. Tiens 30 secondes. Contre les épaules enroulées vers l'avant.",
      emoji: "🤸",
      targets: "Pectoraux & épaules",
    });
  }

  if ((a.q9 ?? 0) >= 2) {
    ex.push({
      name: "Étirements poignets & avant-bras",
      duration: "1 min — après chaque heure de clavier",
      description:
        "Tends un bras devant toi, paume vers le bas. Avec l'autre main, tire doucement les doigts vers toi (10 sec). Puis paume vers le haut, tire les doigts vers le bas (10 sec). Alterne les deux bras. Préventif contre les tendinites.",
      emoji: "🙌",
      targets: "Poignets & avant-bras",
    });
  }

  if (scores.sleep_energy < 50 || (a.q10 ?? 0) >= 2) {
    ex.push({
      name: "Respiration 4-7-8",
      duration: "1 min — en cas de fatigue",
      description:
        "Inspire silencieusement par le nez pendant 4 secondes. Bloque la respiration 7 secondes. Expire par la bouche en 8 secondes. 4 cycles. Active le système parasympathique, réduit le stress et l'inflammation en moins d'une minute.",
      emoji: "🌬️",
      targets: "Système nerveux & yeux",
    });
  }

  if (ex.length < 2) {
    ex.push({
      name: "Marche active post-déjeuner",
      duration: "10 min — après chaque repas",
      description:
        "10 minutes de marche après le déjeuner réduisent la glycémie, améliorent la digestion et rechargent l'énergie pour l'après-midi. Sans écran, à l'air libre si possible. L'habitude la plus ROI pour la santé sédentaire.",
      emoji: "🚶",
      targets: "Énergie & métabolisme",
    });
  }

  return ex.slice(0, 3);
}
