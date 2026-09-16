import type { QuestionnaireAnswers, Scores } from "./scoring";
import { TIPS, EXERCISES, PRODUCTS, type Dimension, type DimensionInternal, type Tip, type Exercise, type Product } from "./tips";

// ─── Output types ─────────────────────────────────────────────────────────────

export interface ChecklistItem {
  priority: "urgent" | "important" | "optionnel";
  action: string;
  why: string;
  cost?: string;
}

export interface Ritual {
  moment: "matin" | "journée" | "soir" | "toujours";
  title: string;
  description: string;
  duration?: string;
}

export interface MealExample {
  moment: "petit-déjeuner" | "déjeuner" | "collation";
  example: string;
  why: string;
}

export interface DimensionAdvice {
  detected: string[];
  consequences: string;

  // Setup uniquement
  checklist?: ChecklistItem[];
  products?: Product[];

  // Douleurs uniquement
  exercises?: Exercise[];
  disclaimer?: string;
  redFlags?: string[];

  // Habitudes, Mode de vie, Nutrition
  rituals?: Ritual[];
  mealExamples?: MealExample[];
  avoidItems?: string[];

  // Commun
  tips?: Tip[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickTips(ids: string[], dimension: DimensionInternal): Tip[] {
  return ids.map((id) => TIPS[dimension]?.find((t) => t.id === id)).filter(Boolean) as Tip[];
}

function pickExercises(keys: string[]): Exercise[] {
  return keys.map((k) => EXERCISES[k]).filter(Boolean);
}

function pickProducts(keys: string[]): Product[] {
  const items = keys.map((k) => PRODUCTS[k]).filter(Boolean) as Product[];
  const order = { haute: 0, premium: 1, moyenne: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 3);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

function setupAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];
  const productKeys: string[] = [];
  const checklist: ChecklistItem[] = [];

  if (answers.q1 === "laptop_seul" || answers.q1 === "laptop") {
    detected.push("Tu travailles sur laptop sans écran externe. C'est la configuration la plus risquée pour la posture cervicale.");
    tipIds.push("s4");
    productKeys.push("support_laptop");
    checklist.push({
      priority: "urgent",
      action: "Surélève ton laptop à hauteur des yeux",
      why: "Un laptop à plat force ta tête à s'incliner de 30-40°, ce qui multiplie par 4 la charge sur ta nuque.",
      cost: "Gratuit (2 livres suffisent) ou ~30€ (support laptop)"
    });
    checklist.push({
      priority: "urgent",
      action: "Utilise un clavier et une souris externes",
      why: "Indispensable dès que ton laptop est surélevé pour garder les bras dans une position neutre.",
      cost: "~40-80€"
    });
  }

  if (answers.q3 === "non_bas") {
    detected.push("Ton écran ou ton bureau est trop bas. Ta tête s'incline en permanence, ce qui charge ta nuque de 12 à 22 kg.");
    tipIds.push("s2");
    if (!productKeys.includes("rehausseur_ecran")) productKeys.push("rehausseur_ecran");
    checklist.push({
      priority: "urgent",
      action: "Ajuste la hauteur de ton écran",
      why: "Le haut de l'écran doit être au niveau de tes yeux. Chaque centimètre trop bas = tension cervicale chronique.",
      cost: "Gratuit (régler le support) ou ~25€ (bras d'écran)"
    });
  } else if (answers.q3 === "non_haut") {
    detected.push("Ton bureau est trop haut : tes épaules restent surélevées en permanence, ce qui crée des tensions dans les trapèzes.");
    tipIds.push("s2");
  }

  if (answers.q4 === "close") {
    detected.push("Ton écran est trop proche. La fatigue visuelle et les maux de tête en fin de journée en sont souvent la cause.");
    tipIds.push("s1");
    checklist.push({
      priority: "important",
      action: "Recule ton écran à 60-70cm de tes yeux",
      why: "La distance recommandée réduit la fatigue oculaire et les maux de tête de fin de journée.",
      cost: "Gratuit"
    });
  }

  if (answers.q5b === "couch" || answers.q5b === "canapé") {
    detected.push("Tu travailles parfois depuis le canapé. 1h dans cette position = 3h de tension musculaire à récupérer.");
    tipIds.push("s7");
  }

  checklist.push({
    priority: "important",
    action: "Règle ta chaise : pieds à plat, genoux à 90°, lombaires soutenus",
    why: "Un réglage correct de chaise réduit la pression lombaire de 40%.",
    cost: "Gratuit"
  });

  if (answers.q13 >= 6) {
    checklist.push({
      priority: "optionnel",
      action: "Place ton écran perpendiculaire à la fenêtre",
      why: "Évite les reflets et les contrastes qui fatiguent les yeux sur de longues sessions.",
      cost: "Gratuit"
    });
  }

  if (answers.q9 !== null && (answers.q9 ?? 0) >= 2) {
    tipIds.push("s10");
    if (!productKeys.includes("souris_verticale")) productKeys.push("souris_verticale");
  }
  const q8 = answers.q8 ?? 0;
  if (q8 >= 2 || scores.setup < 50) {
    if (!productKeys.includes("repose_pieds")) productKeys.push("repose_pieds");
  }
  if (answers.q13 >= 8 && scores.habits < 50) {
    if (!productKeys.includes("bureau_assis_debout")) productKeys.push("bureau_assis_debout");
  }

  if (detected.length === 0) {
    detected.push("Ton setup semble correct dans l'ensemble. Quelques ajustements fins peuvent encore améliorer ton confort.");
  }
  if (!tipIds.includes("s3")) tipIds.push("s3");
  if (!tipIds.includes("s9")) tipIds.push("s9");
  if (productKeys.length === 0) productKeys.push("rehausseur_ecran", "repose_pieds");

  const priorityOrder: Record<string, number> = { urgent: 0, important: 1, optionnel: 2 };
  checklist.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const consequences = scores.setup < 50
    ? "Un écran mal positionné génère une tension cervicale permanente. À force, les muscles raccourcissent et les vertèbres se compriment. Le laptop seul oblige à courber le dos pour voir l'écran, ce qui accumule des heures de compression discale chaque semaine."
    : "Même avec un setup correct, de petits déréglages s'accumulent avec la fatigue. La tension cervicale et la fatigue oculaire sont les premiers signes qu'il faut réévaluer son installation.";

  return {
    detected,
    consequences,
    checklist,
    products: pickProducts(productKeys.slice(0, 3)),
    tips: pickTips(tipIds.slice(0, 2), "setup"),
  };
}

// ─── Douleurs ─────────────────────────────────────────────────────────────────

function douleursAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];
  const exerciseKeys: string[] = [];
  const productKeys: string[] = [];
  const redFlags: string[] = [];

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
    productKeys.push("coussin_lombaire", "foam_roller");
  } else if (q8 >= 1) {
    detected.push(`Tu as des tensions lombaires légères (${q8}/5). Les longues sessions assises sans soutien en sont souvent la cause.`);
    exerciseKeys.push("lumbar_flexion");
    productKeys.push("coussin_lombaire");
  }

  if (answers.q_irradiation === "bras" || answers.q_irradiation === "les_deux") {
    detected.push("Tu as des fourmillements ou douleurs qui descendent dans le bras. Cela peut indiquer une compression cervicale.");
    redFlags.push("Des douleurs ou fourmillements qui irradient dans les membres nécessitent une consultation médicale avant tout exercice cervical intensif.");
    tipIds.push("d2");
    exerciseKeys.push("ulnt_soft");
  }
  if (answers.q_irradiation === "jambe" || answers.q_irradiation === "les_deux") {
    detected.push("Tu as des douleurs ou fourmillements qui descendent dans la jambe. Possible sciatique — évite les flexions lombaires forcées.");
    redFlags.push("Une douleur qui irradie dans la jambe peut être une sciatique — consulte avant de faire des exercices lombaires.");
    tipIds.push("d2");
    exerciseKeys.push("slump_soft");
  }
  if (answers.q_maux_tete_nuque === "quotidien" || answers.q_maux_tete_nuque === "tete_lourde") {
    detected.push("Tu as des maux de tête ou une nuque lourde fréquents. Souvent lié à une tension cervicale chronique.");
    tipIds.push("d3", "d9");
    exerciseKeys.push("chin_tuck", "trapeze_stretch");
  }
  if ((answers.q9 ?? 0) >= 2 || answers.q_irradiation === "bras") {
    productKeys.push("repose_poignets");
  }
  if (answers.q12b === "no") {
    detected.push("Tes douleurs persistent même au repos. C'est un signal important.");
    redFlags.push("Tes douleurs persistent au repos — consulte un professionnel de santé rapidement.");
    tipIds.push("d2");
  }
  if (answers.q11 === "months" || answers.q11 === "year") {
    detected.push("Tes douleurs durent depuis plusieurs mois. Une douleur chronique se traite différemment d'une douleur aiguë.");
    redFlags.push("Une douleur présente depuis plus de 3 mois est considérée chronique — un bilan kiné est recommandé.");
    tipIds.push("d2");
    productKeys.push("foam_roller");
  }
  if (answers.q_douleur_nuit === "oui") {
    redFlags.push("Des douleurs qui réveillent la nuit doivent être évaluées par un médecin.");
  }

  if (detected.length === 0) {
    detected.push("Peu ou pas de douleurs significatives détectées. Maintiens ces bonnes habitudes pour prévenir l'apparition de douleurs.");
  }

  tipIds.push("d1", "d7", "d8");
  if (productKeys.length === 0) productKeys.push("coussin_lombaire");
  if (exerciseKeys.length === 0) exerciseKeys.push("chin_tuck", "chest_open");

  const consequences = scores.pain < 50
    ? "Les douleurs non traitées s'installent et deviennent chroniques en quelques mois. La tension musculaire protège les zones douloureuses mais fatigue les muscles voisins. Le cercle vicieux douleur → protection → fatigue → douleur s'amplifie sans intervention."
    : "Des douleurs modérées signalent que ton corps compense. Agir maintenant évite la chronicisation — 80% des douleurs de bureau disparaissent avec des ajustements simples.";

  const disclaimer = "⚕️ Ces exercices sont préventifs et informatifs. Ils ne remplacent pas un avis médical. En cas de doute, consulte un kinésithérapeute ou ton médecin.";

  return {
    detected,
    consequences,
    exercises: pickExercises([...new Set(exerciseKeys)].slice(0, 4)),
    redFlags: redFlags.length > 0 ? redFlags : undefined,
    disclaimer,
    tips: pickTips([...new Set(tipIds)].slice(0, 2), "douleurs"),
    products: pickProducts([...new Set(productKeys)].slice(0, 2)),
  };
}

// ─── Habitudes ────────────────────────────────────────────────────────────────

function habitudesAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];
  const productKeys: string[] = [];
  const rituals: Ritual[] = [];

  if (answers.q13 >= 8) {
    detected.push(`Tu es assis plus de ${answers.q13}h par jour. Au-delà de 6h, les risques cardiovasculaires et musculo-squelettiques augmentent significativement.`);
    tipIds.push("h1", "h4");
    productKeys.push("coussin_equilibre");
  } else if (answers.q13 >= 6) {
    detected.push(`Tu passes environ ${answers.q13}h assis par jour. C'est proche du seuil critique — les pauses actives sont essentielles.`);
    tipIds.push("h1");
  }

  if (answers.q14 === "never" || answers.q14 === "1x") {
    detected.push(answers.q14 === "never"
      ? "Tu ne fais pas de pauses actives. 2 minutes de marche toutes les heures suffisent à relancer la circulation."
      : "Tu ne fais qu'une pause active par jour. C'est insuffisant — le corps a besoin de se lever plusieurs fois.");
    tipIds.push("h2", "h3");
    rituals.push({
      moment: "toujours",
      title: "La règle des 45 minutes",
      description: "Programme une alarme toutes les 45 minutes. Quand elle sonne, lève-toi 2 minutes — marche, fais quelques pas, n'importe quoi debout.",
      duration: "2 min toutes les 45 min"
    });
  }

  if (answers.q13 >= 6) {
    rituals.push({
      moment: "journée",
      title: "Règle 20-20-20",
      description: "Toutes les 20 minutes, fixe un point à 6 mètres pendant 20 secondes. Ça relâche la tension des muscles oculaires et prévient la fatigue visuelle.",
      duration: "20 secondes toutes les 20 min"
    });
  }

  rituals.push({
    moment: "matin",
    title: "Les 5 premières minutes debout",
    description: "Avant de t'asseoir, passe 5 minutes debout — prépare ton café, lis tes mails en marchant. Ce simple rituel active la circulation et prépare ton dos à la session assise.",
    duration: "5 min"
  });

  if (answers.q13 >= 7) {
    rituals.push({
      moment: "journée",
      title: "Vraie pause déjeuner — sans écran",
      description: "Mange loin de ton bureau. 20 minutes de déconnexion cognitive réduisent la fatigue musculaire de l'après-midi de 30%. Ton dos se décompresse quand tu bouges.",
      duration: "20 min minimum"
    });
  }

  if ((answers.q_stress_travail ?? 0) >= 3) {
    detected.push("Ton niveau de stress au travail est élevé. Le cortisol maintient les muscles en tension permanente — c'est une cause directe de douleurs chroniques.");
    tipIds.push("h11");
    rituals.push({
      moment: "journée",
      title: "Cohérence cardiaque — 5 min",
      description: "5 minutes de respiration rythmée (5 secondes inspiration, 5 secondes expiration) réduisent le cortisol. Fais-le avant un meeting stressant ou après une période intense.",
      duration: "5 min"
    });
  }

  if (answers.q_laptop_hors_bureau === "souvent" || answers.q_laptop_hors_bureau === "principale") {
    detected.push("Tu travailles souvent dans une position non ergonomique. Chaque heure dans le canapé génère des tensions cervicales équivalentes à 3h de mauvaise posture.");
    tipIds.push("h10");
  }

  if (detected.length === 0) {
    detected.push("Tes habitudes de travail sont correctes. Quelques optimisations peuvent encore améliorer ton confort quotidien.");
  }

  tipIds.push("h8", "h5");

  const consequences = scores.habits < 50
    ? "Rester assis sans bouger comprime les disques intervertébraux, ralentit la circulation et contracture les muscles posturaux. Après 6h assis, la pression discale lombaire équivaut à soulever 20 kg en continu."
    : "Les habitudes de mouvement protègent ton dos et ta circulation. Chaque pause active relâche la pression discale et réactive la circulation lymphatique.";

  return {
    detected,
    consequences,
    rituals,
    tips: pickTips([...new Set(tipIds)].slice(0, 2), "habitudes"),
    products: pickProducts(productKeys.slice(0, 1)),
  };
}

// ─── Mode de vie & Récupération (fusion sommeil + lifestyle) ──────────────────

function modeDeVieAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const rituals: Ritual[] = [];
  const tipIds: string[] = [];
  const productKeys: string[] = [];

  // ── Sommeil ──
  if (answers.q17 <= 6) {
    detected.push(`Tu dors moins de ${answers.q17}h par nuit. Un manque de sommeil amplifie la perception de la douleur de 25% dès la 2ème nuit courte.`);
    tipIds.push("sl4", "sl1");
    rituals.push({
      moment: "soir",
      title: "Routine de déconnexion",
      description: "30 minutes avant de dormir, coupe les écrans et baisse la lumière. La lumière bleue retarde la mélatonine de 1 à 2 heures — tu t'endors plus tard sans t'en rendre compte.",
      duration: "30 min avant le coucher"
    });
  } else if (answers.q17 <= 7) {
    detected.push(`Tu dors environ ${answers.q17}h — c'est à la limite du minimum recommandé.`);
    tipIds.push("sl1");
  }

  if (answers.q18 === "exhausted") {
    detected.push("Tu te réveilles épuisé. Ton corps ne récupère pas suffisamment — la qualité du sommeil prime sur la quantité.");
    rituals.push({
      moment: "soir",
      title: "Température de chambre",
      description: "Une chambre entre 16 et 19°C favorise le sommeil profond. C'est contre-intuitif mais le corps a besoin de se refroidir pour bien récupérer.",
      duration: "Permanent"
    });
    productKeys.push("magnesium");
  }

  if (answers.q20 === "often" || answers.q20 === "always") {
    detected.push("Tu utilises des écrans le soir. La lumière bleue décale ton horloge biologique et réduit la durée de ton sommeil profond.");
    productKeys.push("lunettes_horus");
    tipIds.push("sl3");
  }

  // ── Activité physique ──
  if (answers.q14b === "none") {
    detected.push("Tu ne pratiques pas d'activité physique régulière en dehors du travail. C'est la combinaison la plus défavorable avec un travail sédentaire.");
    tipIds.push("l1", "l4");
    rituals.push({
      moment: "journée",
      title: "10 minutes de marche après déjeuner",
      description: "Une marche de 10 minutes après le repas améliore la glycémie, relance la circulation et réduit la fatigue de l'après-midi. C'est le geste le plus simple et le plus efficace.",
      duration: "10 min"
    });
  } else if (answers.q14b === "yoga" || answers.q14b === "etirements") {
    detected.push("Tu pratiques du yoga ou des étirements — excellent pour compenser les tensions du bureau. Assure-toi de cibler aussi les zones identifiées dans ton bilan.");
  } else if (answers.q14b === "cardio" || answers.q14b === "musculation") {
    detected.push("Tu as une activité sportive régulière — c'est excellent. Pense à inclure des étirements ciblés pour compenser les postures spécifiques à ton poste.");
  }

  // ── Stress ──
  if ((answers.q_stress_travail ?? 0) >= 3 || answers.q24 === "bad") {
    detected.push("Ton stress chronique maintient les muscles en tension permanente — c'est une cause directe de douleurs qui persistent malgré les bons gestes.");
    rituals.push({
      moment: "journée",
      title: "Cohérence cardiaque — 3x/jour",
      description: "5 minutes de respiration rythmée (5s inspiration, 5s expiration) 3 fois par jour. Prouvé pour réduire le cortisol et relâcher les tensions musculaires réflexes.",
      duration: "5 min × 3"
    });
    tipIds.push("l2");
  }

  if (detected.length === 0) {
    detected.push("Ton mode de vie équilibre bien le travail sédentaire. Continue — c'est ce qui prévient les douleurs à long terme.");
  }

  tipIds.push("sl5", "l3");
  if (productKeys.length === 0) productKeys.push("lunettes_horus");

  const avgScore = Math.round((scores.sleep_energy + scores.lifestyle) / 2);
  const consequences = avgScore < 50
    ? "Sédentarité + manque de récupération = le cocktail le plus dommageable pour les TMS. Le corps répare la nuit et se renforce en bougeant — sans les deux, les douleurs s'installent structurellement."
    : "Un bon équilibre vie active / récupération protège ton dos durablement. Le mouvement régulier renforce les muscles stabilisateurs que le bureau affaiblit.";

  return {
    detected,
    consequences,
    rituals,
    tips: pickTips([...new Set(tipIds)].slice(0, 3), "sommeil"),
    products: pickProducts(productKeys.slice(0, 2)),
  };
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

function nutritionAdvice(answers: QuestionnaireAnswers, scores: Scores): DimensionAdvice {
  const detected: string[] = [];
  const tipIds: string[] = [];
  const mealExamples: MealExample[] = [];
  const rituals: Ritual[] = [];
  const avoidItems: string[] = [];

  // ── Détection ──
  if (answers.qn1 === "screen") {
    detected.push("Tu manges devant ton écran. Pas de vraie coupure = fatigue cognitive qui s'accumule et posture qui s'effondre l'après-midi.");
    tipIds.push("n2");
    rituals.push({
      moment: "journée",
      title: "Mange loin de ton écran",
      description: "20 minutes sans écran pendant le repas améliore la digestion, réduit les quantités mangées et donne au cerveau une vraie pause. Ton dos se redresse quand tu manges assis correctement.",
      duration: "20 min minimum"
    });
  }

  if (answers.qn2 === "crash" || answers.qn2 === "unfocused") {
    detected.push("Tu as un coup de barre systématique après le déjeuner. Signe classique d'un repas trop riche en glucides rapides sans protéines.");
    tipIds.push("n1", "n4");
  } else if (answers.qn2 === "slight_dip") {
    detected.push("Tu ressens une légère baisse d'après-déjeuner. Un rééquilibrage protéines/glucides la supprimera.");
    tipIds.push("n1");
  }

  if (answers.qn3 === "always" || answers.qn3 === "afternoon") {
    detected.push("Tu grignotes régulièrement. Les sucres rapides créent des pics glycémiques suivis de crashes — le cercle vicieux de la fatigue de bureau.");
    tipIds.push("n8", "n6");
  }

  if (answers.qn4 === "skip") {
    detected.push("Tu sautes des repas. Sans carburant le matin, ton cerveau fonctionne en mode dégradé dès 10h.");
    tipIds.push("n5");
  }

  if (detected.length === 0) {
    detected.push("Tes habitudes alimentaires semblent équilibrées. Quelques optimisations peuvent encore améliorer ta concentration et ton tonus postural.");
  }

  // ── Repas types protéinés ──
  mealExamples.push({
    moment: "petit-déjeuner",
    example: "3 œufs brouillés + 2 tranches de pain complet + fromage blanc 0% + café",
    why: "30g de protéines au petit-déjeuner stabilisent la glycémie jusqu'à midi et réduisent les fringales de 60%. Les œufs sont la source protéique la plus complète."
  });

  mealExamples.push({
    moment: "déjeuner",
    example: "150g de poulet ou thon + riz complet ou patate douce + légumes verts + huile d'olive",
    why: "Protéine + glucides complexes + légumes = assiette équilibrée qui évite le pic glycémique. Pas de glucides seuls — c'est eux qui provoquent le coup de barre à 14h."
  });

  if (answers.qn3 === "always" || answers.qn3 === "afternoon") {
    mealExamples.push({
      moment: "collation",
      example: "1 poignée de noix + 1 carré de chocolat noir 85%+ OU fromage blanc + 1 fruit",
      why: "Les protéines et graisses calent sans pic glycémique. Évite les barres 'healthy' — souvent autant de sucre qu'une confiserie."
    });
  }

  // ── Rituels ──
  rituals.push({
    moment: "toujours",
    title: "1,5 à 2L d'eau par jour",
    description: "La déshydratation de 1% réduit les capacités cognitives de 10%. Les disques intervertébraux sont composés de 80% d'eau — boire régulièrement les garde hydratés et résistants.",
    duration: "Permanent"
  });

  // ── À éviter ──
  if (answers.qn3 === "always") {
    avoidItems.push("Viennoiseries et biscuits en collation → pic glycémique suivi d'un crash d'énergie");
  }
  if (answers.qn2 === "crash") {
    avoidItems.push("Pâtes ou pizza au déjeuner sans protéines → coup de barre garanti à 14h");
  }
  if (answers.qn1 === "screen") {
    avoidItems.push("Manger devant l'écran → tu manges 30% de plus sans t'en rendre compte");
  }

  tipIds.push("n3", "n7");

  const consequences = scores.nutrition < 50
    ? "Les pics glycémiques créent une fatigue cérébrale qui se traduit par une difficulté à se concentrer, des envies de sucre, et une posture qui s'affaisse progressivement. Le cerveau représente 20% de la consommation d'énergie — il est le premier touché par une nutrition inadaptée."
    : "Ce que tu manges conditionne directement ta concentration et ton tonus musculaire postural. Un repas trop lourd et ton dos s'affaisse d'un centimètre en moins d'une heure.";

  const nutritionProducts: string[] = [];
  if ((answers.q19 ?? 0) <= 4) nutritionProducts.push("gourde_graduee");
  if (answers.qn2 === "crash" || scores.nutrition < 50) nutritionProducts.push("luminette");
  if (nutritionProducts.length === 0) nutritionProducts.push("gourde_graduee");

  return {
    detected,
    consequences,
    mealExamples,
    rituals,
    avoidItems: avoidItems.length > 0 ? avoidItems : undefined,
    tips: pickTips([...new Set(tipIds)].slice(0, 2), "nutrition"),
    products: pickProducts(nutritionProducts.slice(0, 2)),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getDimensionAdvice(
  dimension: Dimension,
  answers: QuestionnaireAnswers,
  scores: Scores
): DimensionAdvice {
  switch (dimension) {
    case "setup":        return setupAdvice(answers, scores);
    case "douleurs":     return douleursAdvice(answers, scores);
    case "habitudes":    return habitudesAdvice(answers, scores);
    case "mode-de-vie":  return modeDeVieAdvice(answers, scores);
    case "nutrition":    return nutritionAdvice(answers, scores);
  }
}

export function isValidDimension(s: string): s is Dimension {
  return ["setup", "douleurs", "habitudes", "mode-de-vie", "nutrition"].includes(s);
}

export function getTopProduct(
  dimension: Dimension,
  answers: QuestionnaireAnswers,
  scores: Scores
): Product | null {
  const advice = getDimensionAdvice(dimension, answers, scores);
  return advice.products?.[0] ?? null;
}
