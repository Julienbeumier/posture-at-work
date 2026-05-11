import type { QuestionnaireAnswers, Scores } from "./scoring";
import { TIPS, EXERCISES, PRODUCTS, type Dimension, type Tip, type Exercise, type Product } from "./tips";

// ─── Output types ─────────────────────────────────────────────────────────────

export interface DimensionAdvice {
  detected: string[];        // "Ce qu'on a détecté" — 1-3 bullet points
  consequences: string;      // "Ce que ça provoque" — paragraph
  tips: Tip[];               // Selected tips for this profile
  exercises: Exercise[];     // Targeted exercises
  products: Product[];       // Recommended products
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function pickTips(ids: string[], dimension: Dimension): Tip[] {
  return ids.map((id) => TIPS[dimension].find((t) => t.id === id)).filter(Boolean) as Tip[];
}

function pickExercises(keys: string[]): Exercise[] {
  return keys.map((k) => EXERCISES[k]).filter(Boolean);
}

function pickProducts(keys: string[]): Product[] {
  const items = keys.map((k) => PRODUCTS[k]).filter(Boolean) as Product[];
  // Sort: haute first, then moyenne, then premium; max 3
  const order = { haute: 0, moyenne: 1, premium: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 3);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

function setupAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];
  const productKeys: string[] = [];

  if (answers.q1 === "laptop") {
    detected.push("Tu travailles sur laptop sans écran externe. C'est la configuration la plus risquée pour la posture cervicale.");
    tipIds.push("s4");
    productKeys.push("laptop_stand");
  }
  if (answers.q3 === "non" || answers.q3 === "no") {
    detected.push("Ton écran est en dessous de la hauteur des yeux. Ta tête s'incline en permanence, ce qui charge ta nuque de 12 à 22 kg.");
    tipIds.push("s2");
    if (!productKeys.includes("screen_riser")) productKeys.push("screen_riser");
  }
  if (answers.q5b === "couch" || answers.q5b === "canapé") {
    detected.push("Tu travailles parfois depuis le canapé. 1h dans cette position = 3h de tension musculaire à récupérer.");
    tipIds.push("s7");
  }
  if (answers.q4 === "close") {
    detected.push("Ton écran est trop proche. La fatigue visuelle et les maux de tête en fin de journée en sont souvent la cause.");
    tipIds.push("s1");
  }
  if (answers.q9 !== null && (answers.q9 ?? 0) >= 2) {
    tipIds.push("s10");
    if (!productKeys.includes("vertical_mouse")) productKeys.push("vertical_mouse");
  }
  const q8 = answers.q8 ?? 0;
  if (q8 >= 2 || scores.setup < 50) {
    if (!productKeys.includes("footrest")) productKeys.push("footrest");
  }
  if (answers.q13 >= 8 && scores.habits < 50) {
    if (!productKeys.includes("standing_desk")) productKeys.push("standing_desk");
  }

  // Fill defaults if not enough
  if (detected.length === 0) {
    detected.push("Ton setup semble correct dans l'ensemble. Quelques ajustements fins peuvent encore améliorer ton confort.");
  }
  if (!tipIds.includes("s3")) tipIds.push("s3");
  if (!tipIds.includes("s9")) tipIds.push("s9");
  if (!tipIds.includes("s6")) tipIds.push("s6");
  if (productKeys.length === 0) productKeys.push("screen_riser", "footrest");

  const consequences = scores.setup < 50
    ? "Un écran mal positionné génère une tension cervicale permanente. À force, les muscles raccourcissent et les vertèbres se compriment. Le laptop seul oblige à courber le dos pour voir l'écran, ce qui accumule des heures de compression discale chaque semaine."
    : "Même avec un setup correct, de petits déréglages s'accumulent avec la fatigue. La tension cervicale et la fatigue oculaire sont les premiers signes qu'il faut réévaluer son installation.";

  return {
    detected,
    consequences,
    tips: pickTips(tipIds.slice(0, 5), "setup"),
    exercises: pickExercises(["chin_tuck", "chest_open"]),
    products: pickProducts(productKeys.slice(0, 3)),
  };
}

// ─── Douleurs ─────────────────────────────────────────────────────────────────

function douleursAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];
  const exerciseKeys: string[] = [];
  const productKeys: string[] = [];

  const q6 = answers.q6 ?? 0;
  const q8 = answers.q8 ?? 0;

  if (q6 >= 3) {
    detected.push(`Tu as des douleurs cervicales significatives (${q6}/5). À ce niveau, c'est un signal que ton corps envoie depuis un moment.`);
    tipIds.push("d3");
    exerciseKeys.push("chin_tuck", "trapeze_stretch");
  } else if (q6 >= 1) {
    detected.push(`Tu ressens des tensions cervicales légères (${q6}/5). Souvent liées à la posture de l'écran ou au téléphone.`);
    exerciseKeys.push("chin_tuck");
  }

  if (q8 >= 3) {
    detected.push(`Ton bas du dos est sous pression (${q8}/5). Cette douleur est typique d'une position assise prolongée sans soutien lombaire.`);
    tipIds.push("d6");
    exerciseKeys.push("lumbar_flexion", "thoracic_rotation");
    productKeys.push("lumbar_cushion");
    if (answers.q22 === "never") productKeys.push("balance_cushion");
  } else if (q8 >= 1) {
    detected.push(`Tu as des tensions lombaires légères (${q8}/5). Les longues sessions assises sans soutien en sont souvent la cause.`);
    exerciseKeys.push("lumbar_flexion");
    productKeys.push("lumbar_cushion");
  }

  if (answers.q12b === "no") {
    detected.push("⚠️ Tes douleurs persistent même au repos. C'est un signal important — consulte un professionnel de santé.");
    tipIds.push("d2");
  }

  if (answers.q11 === "months" || answers.q11 === "year") {
    detected.push("Tes douleurs durent depuis plusieurs mois. Une douleur chronique se traite différemment d'une douleur aiguë.");
    tipIds.push("d2");
    productKeys.push("hot_water_bottle");
  }

  if (detected.length === 0) {
    detected.push("Peu ou pas de douleurs significatives détectées. Maintiens ces bonnes habitudes pour prévenir l'apparition de douleurs.");
  }

  tipIds.push("d1", "d7", "d8");

  if (productKeys.length === 0) productKeys.push("lumbar_cushion");

  const consequences = scores.pain < 50
    ? "Les douleurs non traitées s'installent et deviennent chroniques en quelques mois. La tension musculaire protège les zones douloureuses mais fatigue les muscles voisins. Le cercle vicieux douleur → protection → fatigue → douleur s'amplifie sans intervention."
    : "Des douleurs modérées signalent que ton corps compense. Agir maintenant évite la chronicisation — 80% des douleurs de bureau disparaissent avec des ajustements simples.";

  if (exerciseKeys.length === 0) exerciseKeys.push("chin_tuck", "chest_open");

  return {
    detected,
    consequences,
    tips: pickTips([...new Set(tipIds)].slice(0, 5), "douleurs"),
    exercises: pickExercises([...new Set(exerciseKeys)].slice(0, 3)),
    products: pickProducts([...new Set(productKeys)].slice(0, 3)),
  };
}

// ─── Habitudes ────────────────────────────────────────────────────────────────

function habitudesAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];
  const productKeys: string[] = [];

  if (answers.q13 >= 8) {
    detected.push(`Tu es assis plus de ${answers.q13}h par jour. Au-delà de 6h, les risques cardiovasculaires et musculo-squelettiques augmentent significativement.`);
    tipIds.push("h1", "h4");
    productKeys.push("desk_timer");
  } else if (answers.q13 >= 6) {
    detected.push(`Tu passes environ ${answers.q13}h assis par jour. C'est proche du seuil critique — les pauses actives sont essentielles.`);
    tipIds.push("h1");
  }

  if (answers.q14 === "never") {
    detected.push("Tu ne fais pas de pauses actives. 2 minutes de marche toutes les heures suffisent à relancer la circulation.");
    tipIds.push("h2", "h3");
  } else if (answers.q14 === "1x") {
    detected.push("Tu ne fais qu'une pause active par jour. C'est insuffisant — le corps a besoin de se lever plusieurs fois.");
    tipIds.push("h2");
  }

  if (answers.q15 === "hand") {
    detected.push("Tu tiens ton téléphone en main pendant les appels. Cela force une posture asymétrique et comprime les cervicales.");
    tipIds.push("h7");
  }

  if (detected.length === 0) {
    detected.push("Tes habitudes de travail sont correctes. Quelques optimisations peuvent encore améliorer ton confort quotidien.");
  }

  tipIds.push("h8", "h5", "h9");

  const consequences = scores.habits < 50
    ? "Rester assis sans bouger comprime les disques intervertébraux, ralentit la circulation et contracture les muscles posturaux. Après 6h assis, la pression discale lombaire équivaut à soulever 20 kg en continu."
    : "Les habitudes de mouvement protègent ton dos et ta circulation. Chaque pause active relâche la pression discale et réactive la circulation lymphatique.";

  return {
    detected,
    consequences,
    tips: pickTips([...new Set(tipIds)].slice(0, 5), "habitudes"),
    exercises: pickExercises(["active_walk", "shoulder_rotation", "lateral_flexion"]),
    products: pickProducts(productKeys.slice(0, 2)),
  };
}

// ─── Sommeil ──────────────────────────────────────────────────────────────────

function sommeilAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];
  const productKeys: string[] = [];

  const needsBlueLightGlasses =
    answers.q17 <= 6 || answers.q18 === "exhausted" || answers.q20 === "often" || answers.q20 === "always";

  if (answers.q17 <= 6) {
    detected.push(`Tu dors moins de ${answers.q17}h par nuit. Un manque de sommeil amplifie directement la perception de la douleur.`);
    tipIds.push("sl4", "sl1");
  } else if (answers.q17 <= 7) {
    detected.push(`Tu dors environ ${answers.q17}h — c'est à la limite du minimum recommandé.`);
    tipIds.push("sl1");
  }

  if (answers.q18 === "exhausted") {
    detected.push("Tu te réveilles épuisé. Ton corps ne récupère pas suffisamment — souvent lié à la qualité plus qu'à la durée du sommeil.");
    tipIds.push("sl9", "sl2");
  } else if (answers.q18 === "tired") {
    detected.push("Tu te réveilles souvent fatigué. Des petits ajustements sur l'environnement de sommeil peuvent faire une grande différence.");
  }

  if (answers.q20 === "often" || answers.q20 === "always") {
    detected.push("Tu utilises souvent des écrans le soir. La lumière bleue décale ton horloge biologique et réduit la qualité du sommeil profond.");
    tipIds.push("sl3", "sl2");
  }

  if (needsBlueLightGlasses) productKeys.push("blue_light_glasses");
  if (productKeys.length === 0) productKeys.push("blue_light_glasses");

  if (detected.length === 0) {
    detected.push("Ton sommeil semble correct. Maintenir ces habitudes est essentiel pour la récupération musculaire et cognitive.");
  }

  tipIds.push("sl5", "sl7", "sl8");

  const consequences = scores.sleep_energy < 50
    ? "Un manque de sommeil réduit le seuil de tolérance à la douleur, augmente le cortisol et ralentit la réparation musculaire. Après 2 nuits courtes, la douleur perçue augmente de 25%."
    : "Un sommeil de qualité est la base de la récupération. Les muscles réparent la nuit ce que le bureau abîme le jour — c'est littéralement ce qui se passe.";

  return {
    detected,
    consequences,
    tips: pickTips([...new Set(tipIds)].slice(0, 5), "sommeil"),
    exercises: pickExercises(["pre_sleep_stretch", "breathing_478"]),
    products: pickProducts(productKeys.slice(0, 3)),
  };
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

function nutritionAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];

  if (answers.qn1 === "screen") {
    detected.push("Tu manges devant ton écran. Pas de vraie coupure = fatigue cognitive qui s'accumule et posture qui s'effondre l'après-midi.");
    tipIds.push("n2");
  }

  if (answers.qn2 === "crash" || answers.qn2 === "unfocused") {
    detected.push("Tu as un coup de barre systématique après le déjeuner. C'est le signe d'un repas trop riche en glucides rapides.");
    tipIds.push("n1", "n4");
  } else if (answers.qn2 === "slight_dip") {
    detected.push("Tu ressens une légère baisse d'énergie après le déjeuner. Un ajustement de ton repas peut supprimer ce creux.");
    tipIds.push("n1");
  }

  if (answers.qn3 === "always" || answers.qn3 === "afternoon") {
    detected.push("Tu grignotes régulièrement. Les sucres rapides créent des pics glycémiques suivis de crashes d'énergie.");
    tipIds.push("n8", "n6");
  }

  if (answers.qn4 === "skip") {
    detected.push("Tu sautes régulièrement des repas. La concentration et l'énergie en pâtissent directement en matinée.");
    tipIds.push("n5");
  }

  if (detected.length === 0) {
    detected.push("Tes habitudes alimentaires semblent équilibrées. Quelques optimisations peuvent encore améliorer ton énergie au bureau.");
  }

  tipIds.push("n3", "n7");

  const consequences = scores.nutrition < 50
    ? "Les pics glycémiques créent une fatigue cérébrale qui se traduit par une difficulté à se concentrer, des envies de sucre, et une posture qui s'affaisse progressivement. Le cerveau représente 20% de la consommation d'énergie — il est le premier touché par une nutrition inadaptée."
    : "L'énergie alimentaire conditionne directement ta concentration et ton tonus musculaire postural. Un repas trop lourd et ton dos s'affaisse d'un centimètre en moins d'une heure.";

  return {
    detected,
    consequences,
    tips: pickTips([...new Set(tipIds)].slice(0, 5), "nutrition"),
    exercises: [],  // No specific exercises for nutrition
    products: [],   // No specific products
  };
}

// ─── Lifestyle ────────────────────────────────────────────────────────────────

function lifestyleAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];

  if (answers.q14b === "none") {
    detected.push("Tu ne pratiques pas d'activité physique régulière. Le mouvement est le meilleur antidote à la sédentarité du bureau.");
    tipIds.push("l1", "l4");
  } else if (answers.q14b === "cardio" || answers.q14b === "strength") {
    detected.push("Tu as une activité sportive régulière — c'est excellent. Assure-toi de compenser les tensions spécifiques au bureau.");
  }

  if (answers.q24 === "bad") {
    detected.push("Tu perçois ton bien-être général comme mauvais. Le stress chronique génère des tensions musculaires réelles et mesurables.");
    tipIds.push("l1", "l2");
  }

  if (answers.q22 === "never") {
    detected.push("Tu ne fais pas d'étirements ou de stretching. C'est pourtant la façon la plus rapide de soulager les tensions accumulées.");
    tipIds.push("l5");
  }

  if (detected.length === 0) {
    detected.push("Ton mode de vie actif compense bien la sédentarité du bureau. Continue et assure-toi de varier les types d'activité.");
  }

  tipIds.push("l2", "l3", "l5", "l6");

  const consequences = scores.lifestyle < 50
    ? "Un mode de vie sédentaire hors du bureau amplifie tous les problèmes posturaux. Le corps ne récupère que si on lui donne l'occasion de bouger. Sans activité régulière, les muscles posturaux faiblissent et la fatigue s'installe structurellement."
    : "Le mouvement régulier est la meilleure assurance contre les douleurs chroniques. Chaque séance d'activité physique renforce les muscles stabilisateurs qui tiennent ta posture.";

  return {
    detected,
    consequences,
    tips: pickTips([...new Set(tipIds)].slice(0, 5), "lifestyle"),
    exercises: pickExercises(["abdo_breathing", "active_walk", "shoulder_rotation"]),
    products: [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getDimensionAdvice(
  dimension: Dimension,
  answers: QuestionnaireAnswers,
  scores: Scores
): DimensionAdvice {
  switch (dimension) {
    case "setup":     return setupAdvice(answers, scores);
    case "douleurs":  return douleursAdvice(answers, scores);
    case "habitudes": return habitudesAdvice(answers, scores);
    case "sommeil":   return sommeilAdvice(answers, scores);
    case "nutrition": return nutritionAdvice(answers, scores);
    case "lifestyle": return lifestyleAdvice(answers, scores);
  }
}

export function isValidDimension(s: string): s is Dimension {
  return ["setup", "douleurs", "habitudes", "sommeil", "nutrition", "lifestyle"].includes(s);
}
