// ─── Tip & dimension types ────────────────────────────────────────────────────

export type Dimension = "setup" | "douleurs" | "habitudes" | "sommeil" | "nutrition" | "lifestyle";

export interface Tip {
  id: string;
  text: string;
  icon: string;
}

export interface Exercise {
  name: string;
  instruction: string;
  duration: string;
  frequency: string;
}

export interface Product {
  id: string;
  name: string;
  reason: string;
  url: string;
  priority: "haute" | "moyenne" | "premium";
  dimension: string[];
  triggers: string[];
  price: string;
  badge: string | null;
}

// ─── Dimension metadata ───────────────────────────────────────────────────────

export const DIMENSION_META: Record<Dimension, {
  label: string;
  emoji: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  scoreKey: string;
}> = {
  setup: {
    label: "Setup & ergonomie",
    emoji: "💻",
    color: "#7c9fff",
    colorBg: "rgba(43,92,230,0.10)",
    colorBorder: "rgba(43,92,230,0.25)",
    scoreKey: "setup",
  },
  douleurs: {
    label: "Douleurs",
    emoji: "🩺",
    color: "#f09595",
    colorBg: "rgba(240,149,149,0.10)",
    colorBorder: "rgba(240,149,149,0.25)",
    scoreKey: "pain",
  },
  habitudes: {
    label: "Habitudes de travail",
    emoji: "⏱️",
    color: "#f4a261",
    colorBg: "rgba(244,162,97,0.10)",
    colorBorder: "rgba(244,162,97,0.25)",
    scoreKey: "habits",
  },
  sommeil: {
    label: "Sommeil & énergie",
    emoji: "🌙",
    color: "#74c69d",
    colorBg: "rgba(116,198,157,0.10)",
    colorBorder: "rgba(116,198,157,0.25)",
    scoreKey: "sleep_energy",
  },
  nutrition: {
    label: "Nutrition & énergie",
    emoji: "🍽️",
    color: "#a78bfa",
    colorBg: "rgba(167,139,250,0.10)",
    colorBorder: "rgba(167,139,250,0.25)",
    scoreKey: "nutrition",
  },
  lifestyle: {
    label: "Mode de vie actif",
    emoji: "🏃",
    color: "#5dcaa5",
    colorBg: "rgba(93,202,165,0.10)",
    colorBorder: "rgba(93,202,165,0.25)",
    scoreKey: "lifestyle",
  },
};

// ─── Tip database ─────────────────────────────────────────────────────────────

export const TIPS: Record<Dimension, Tip[]> = {
  setup: [
    { id: "s1", icon: "📏", text: "L'écran doit être à une longueur de bras — pas moins, pas plus." },
    { id: "s2", icon: "👁️", text: "Le haut de l'écran au niveau des yeux, jamais en dessous." },
    { id: "s3", icon: "⌨️", text: "Souris et clavier sur la même ligne, coudes à 90°." },
    { id: "s4", icon: "💻", text: "Un laptop seul = garantie de mauvaise posture, toujours." },
    { id: "s5", icon: "🖥️", text: "Le deuxième écran : place celui que tu regardes le plus en face." },
    { id: "s6", icon: "📱", text: "Ton téléphone sur le bureau = tête baissée 40° en moyenne." },
    { id: "s7", icon: "🛋️", text: "Travailler en canapé 1h = 3h de tension musculaire à récupérer." },
    { id: "s8", icon: "🪑", text: "La chaise parfaite n'existe pas — le mouvement, si." },
    { id: "s9", icon: "🦵", text: "Pieds à plat, genoux à 90°, hanches légèrement plus hautes que les genoux." },
    { id: "s10", icon: "🖱️", text: "Un repose-poignets pour la souris : petit investissement, grand impact." },
  ],
  douleurs: [
    { id: "d1", icon: "⚡", text: "La douleur est un signal, pas une fatalité." },
    { id: "d2", icon: "📅", text: "Une douleur qui dure plus de 3 semaines mérite une consultation." },
    { id: "d3", icon: "🧠", text: "Les cervicales supportent 5 kg. La tête en avant à 45° charge 22 kg sur les vertèbres." },
    { id: "d4", icon: "✋", text: "Le syndrome du tunnel carpien se prévient avec des pauses et des étirements." },
    { id: "d5", icon: "😤", text: "Les tensions aux épaules sont souvent liées au stress, pas au setup." },
    { id: "d6", icon: "🌇", text: "La douleur au bas du dos augmente en fin de journée — c'est la fatigue musculaire." },
    { id: "d7", icon: "🤸", text: "Le stretching passif (étirer et tenir 30 sec) relâche la tension efficacement." },
    { id: "d8", icon: "🌡️", text: "La chaleur (bouillotte) détend les muscles. Le froid réduit l'inflammation." },
    { id: "d9", icon: "💧", text: "Les maux de tête en fin de journée = souvent déshydratation ou fatigue visuelle." },
  ],
  habitudes: [
    { id: "h1", icon: "🚶", text: "Se lever toutes les 30 min réduit le risque cardiovasculaire de 17%." },
    { id: "h2", icon: "⏱️", text: "2 minutes de marche toutes les heures suffisent à relancer la circulation." },
    { id: "h3", icon: "⚡", text: "Les micropauses de 30 secondes valent mieux que rien." },
    { id: "h4", icon: "↕️", text: "Alterner assis/debout : 4h assis, 4h debout, c'est l'idéal." },
    { id: "h5", icon: "💧", text: "Un verre d'eau toutes les heures = hydratation correcte sans y penser." },
    { id: "h6", icon: "🪜", text: "L'escalier plutôt que l'ascenseur : 3 min d'activité qui comptent vraiment." },
    { id: "h7", icon: "📞", text: "Téléphoner debout — une habitude simple qui change tout." },
    { id: "h8", icon: "👁️", text: "Règle 20-20-20 : toutes les 20 min, regarder à 6m pendant 20 secondes." },
    { id: "h9", icon: "🚶", text: "Marcher pendant les réunions en remote : productivité + santé." },
  ],
  sommeil: [
    { id: "sl1", icon: "😴", text: "7h de sommeil réparent ce que 8h de bureau abîment." },
    { id: "sl2", icon: "📵", text: "Se coucher avec le téléphone = 45 min de sommeil en moins en moyenne." },
    { id: "sl3", icon: "💡", text: "La lumière bleue le soir décale ton horloge biologique de 2h." },
    { id: "sl4", icon: "😣", text: "Un manque de sommeil amplifie la perception de la douleur." },
    { id: "sl5", icon: "😪", text: "La sieste de 20 min l'après-midi : légale, efficace, sous-cotée." },
    { id: "sl6", icon: "🌞", text: "Le cortisol (hormone du stress) est au max le matin — c'est normal." },
    { id: "sl7", icon: "🛏️", text: "Dormir sur le ventre = pire position pour les cervicales." },
    { id: "sl8", icon: "🦵", text: "Un oreiller entre les genoux en dormant sur le côté protège le bas du dos." },
    { id: "sl9", icon: "🔧", text: "La récupération c'est quand le corps répare — pas pendant le boulot." },
  ],
  nutrition: [
    { id: "n1", icon: "📈", text: "Le pic de glycémie après le déjeuner = le fameux coup de barre de 14h." },
    { id: "n2", icon: "🧠", text: "Manger à son bureau augmente le stress et réduit la récupération mentale." },
    { id: "n3", icon: "☕", text: "La caféine après 14h perturbe le sommeil même si tu t'endors bien." },
    { id: "n4", icon: "💪", text: "Un déjeuner riche en protéines = énergie stable l'après-midi." },
    { id: "n5", icon: "🌅", text: "Sauter le petit-déjeuner = concentration en berne avant 11h." },
    { id: "n6", icon: "🥜", text: "5 noix le matin = apport en oméga-3 qui protège les articulations." },
    { id: "n7", icon: "💧", text: "La déshydratation à -2% affecte la concentration et augmente la fatigue." },
    { id: "n8", icon: "🍬", text: "Les sucres rapides au bureau = montée d'énergie suivie d'un crash garanti." },
  ],
  lifestyle: [
    { id: "l1", icon: "😤", text: "Le stress chronique crée des tensions musculaires réelles et mesurables." },
    { id: "l2", icon: "🫁", text: "La respiration abdominale en 4 temps calme le système nerveux en 2 minutes." },
    { id: "l3", icon: "🔔", text: "Les notifications constantes maintiennent le cortisol élevé toute la journée." },
    { id: "l4", icon: "😵", text: "Une journée sans pause = cerveau en mode survie dès 15h." },
    { id: "l5", icon: "🍅", text: "Pomodoro : 25 min de focus, 5 min de pause — le cerveau adore ça." },
    { id: "l6", icon: "🎛️", text: "Le sentiment de contrôle sur son environnement de travail réduit le stress de 30%." },
  ],
};

// ─── Exercises database ───────────────────────────────────────────────────────

export const EXERCISES: Record<string, Exercise> = {
  chin_tuck: {
    name: "Rétraction cervicale",
    instruction: "Assis droit, rentre doucement le menton vers la gorge (double menton) sans baisser la tête. Tiens 3 secondes, relâche.",
    duration: "30 sec × 3",
    frequency: "Toutes les heures",
  },
  chest_open: {
    name: "Ouverture pectorale",
    instruction: "Debout dans un angle, avant-bras en L contre le mur. Avance le buste jusqu'à sentir l'ouverture dans la poitrine.",
    duration: "45 sec × 2",
    frequency: "Matin et soir",
  },
  trapeze_stretch: {
    name: "Étirement trapèzes",
    instruction: "Incline doucement la tête vers l'épaule droite. La main droite tire légèrement le haut du crâne. Garde l'épaule gauche basse. Change de côté.",
    duration: "30 sec par côté × 2",
    frequency: "2–3× par jour",
  },
  lumbar_flexion: {
    name: "Flexion lombaire",
    instruction: "Assis, penche-toi lentement en avant, bras ballants vers le sol. Laisse le dos s'arrondir complètement. Remonte vertebre par vertebre.",
    duration: "45 sec × 2",
    frequency: "Toutes les 2h",
  },
  thoracic_rotation: {
    name: "Rotation thoracique",
    instruction: "Assis, croise les bras sur la poitrine. Tourne le buste lentement vers la droite, tiens 2 secondes. Reviens au centre, puis à gauche.",
    duration: "30 sec par côté × 2",
    frequency: "2× par jour",
  },
  active_walk: {
    name: "Marche active",
    instruction: "Lève-toi de ton bureau, marche à pas vifs. Tu peux marcher dans le couloir, faire des escaliers, ou marcher dehors si possible.",
    duration: "2 min",
    frequency: "Toutes les heures",
  },
  shoulder_rotation: {
    name: "Rotations d'épaules debout",
    instruction: "Debout, fais de grands cercles vers l'arrière avec les deux épaules simultanément. Sens les omoplates se rapprocher au passage arrière.",
    duration: "10 cercles × 2",
    frequency: "Toutes les 2h",
  },
  lateral_flexion: {
    name: "Flexion latérale",
    instruction: "Debout, lève le bras droit, incline le buste vers la gauche. Sens l'étirement sur tout le côté droit. Change de côté.",
    duration: "30 sec par côté",
    frequency: "3× par jour",
  },
  pre_sleep_stretch: {
    name: "Étirement avant coucher",
    instruction: "Allongé sur le dos, ramène les deux genoux sur la poitrine. Balance doucement de gauche à droite. Détend les lombaires et prépare le sommeil.",
    duration: "2 min",
    frequency: "Chaque soir avant de dormir",
  },
  breathing_478: {
    name: "Respiration 4-7-8",
    instruction: "Inspire par le nez pendant 4 secondes. Retiens ta respiration pendant 7 secondes. Expire lentement par la bouche pendant 8 secondes.",
    duration: "4 cycles",
    frequency: "Avant de dormir ou en cas de stress",
  },
  abdo_breathing: {
    name: "Respiration abdominale",
    instruction: "Pose une main sur le ventre. Inspire lentement par le nez en gonflant le ventre (pas la poitrine). Expire lentement. Sense le relâchement.",
    duration: "2 min",
    frequency: "En pause ou en cas de tension",
  },
};

// ─── Products database ────────────────────────────────────────────────────────

export const PRODUCTS: Record<string, Product> = {
  // ── Setup & Ergonomie ──
  support_laptop: {
    id: "support_laptop",
    name: "Support laptop ergonomique",
    reason: "Un laptop seul impose une flexion permanente de la nuque — ce support corrige ça immédiatement et libère la place pour un vrai clavier",
    url: "https://amzn.to/3RBejyl",
    priority: "haute",
    dimension: ["setup"],
    triggers: ["q1 === laptop", "setup_score < 50"],
    price: "~30€",
    badge: "Indispensable",
  },
  rehausseur_ecran: {
    id: "rehausseur_ecran",
    name: "Rehausseur écran GRIFEMA",
    reason: "Ton écran trop bas force ta tête à s'incliner — ça représente 12kg de charge supplémentaire sur ta nuque. Ce rehausseur règle ça en 2 minutes",
    url: "https://amzn.to/4uGNQ0y",
    priority: "haute",
    dimension: ["setup"],
    triggers: ["q3 === non", "setup_score < 60"],
    price: "~28€",
    badge: "Priorité #1",
  },
  souris_verticale: {
    id: "souris_verticale",
    name: "Souris verticale Trust Verto",
    reason: "Réduit la torsion du poignet de 60% — indispensable si tu as des douleurs aux poignets ou aux avant-bras",
    url: "https://amzn.to/4feJR71",
    priority: "haute",
    dimension: ["setup", "douleurs"],
    triggers: ["q9 >= 2", "q5 === bad"],
    price: "~25€",
    badge: "Bestseller",
  },
  repose_pieds: {
    id: "repose_pieds",
    name: "Repose-pieds réglable ergonomique",
    reason: "Stabilise ta posture et soulage la pression sur le bas du dos — souvent ignoré mais très efficace",
    url: "https://amzn.to/4dIZvWb",
    priority: "moyenne",
    dimension: ["setup", "douleurs"],
    triggers: ["q8 >= 2", "setup_score < 60"],
    price: "~35€",
    badge: null,
  },
  coussin_equilibre: {
    id: "coussin_equilibre",
    name: "Coussin d'équilibre BODYMATE",
    reason: "Active les muscles profonds du dos sans effort conscient — transforme ton siège en outil de renforcement postural",
    url: "https://amzn.to/3Rh9avh",
    priority: "moyenne",
    dimension: ["setup", "habitudes"],
    triggers: ["lifestyle_score < 60", "q22 === never"],
    price: "~30€",
    badge: null,
  },
  bureau_assis_debout: {
    id: "bureau_assis_debout",
    name: "Bureau assis-debout SONGMICS",
    reason: "Alterner assis/debout réduit les douleurs lombaires de 50% sur la journée — le changement le plus impactant pour ta santé au bureau",
    url: "https://amzn.to/4fcmzPe",
    priority: "premium",
    dimension: ["setup", "habitudes"],
    triggers: ["q13 >= 8", "habits_score < 50"],
    price: "~200€",
    badge: "Investissement santé",
  },
  // ── Douleurs & Récupération ──
  coussin_lombaire: {
    id: "coussin_lombaire",
    name: "Coussin lombaire FORTEM",
    reason: "Maintient la courbure naturelle du dos et soulage immédiatement les douleurs lombaires — soulagement dès la première utilisation",
    url: "https://amzn.to/4uK2owE",
    priority: "haute",
    dimension: ["douleurs"],
    triggers: ["q8 >= 2"],
    price: "~30€",
    badge: "Soulagement rapide",
  },
  foam_roller: {
    id: "foam_roller",
    name: "Foam roller massage musculaire",
    reason: "5 minutes le soir pour relâcher toutes les tensions accumulées — aussi efficace qu'un massage pour les muscles superficiels",
    url: "https://amzn.to/4fiSsWh",
    priority: "haute",
    dimension: ["douleurs", "habitudes"],
    triggers: ["pain_score < 60", "q6 >= 2"],
    price: "~25€",
    badge: "Récupération",
  },
  balle_massage: {
    id: "balle_massage",
    name: "Balle de massage BLACKROLL",
    reason: "Libère les points de tension dans les épaules et la nuque en quelques minutes — à garder sur son bureau",
    url: "https://amzn.to/3Rk6nS1",
    priority: "moyenne",
    dimension: ["douleurs"],
    triggers: ["q6 >= 2", "q7 >= 2"],
    price: "~15€",
    badge: "Achat malin",
  },
  // ── Sommeil & Énergie ──
  lunettes_horus: {
    id: "lunettes_horus",
    name: "Lunettes anti-lumière bleue Horus X",
    reason: "La lumière bleue le soir décale ton horloge biologique de 2h — ces lunettes bloquent ça pour retrouver un sommeil naturel",
    url: "https://amzn.to/4tws0fk",
    priority: "haute",
    dimension: ["sommeil"],
    triggers: ["q17 <= 6", "q18 === exhausted", "q20 === always"],
    price: "~30€",
    badge: "Bestseller",
  },
  oreiller_cervical: {
    id: "oreiller_cervical",
    name: "Oreiller ergonomique cervical HOMCA",
    reason: "Maintient ta nuque alignée toute la nuit — essentiel si tu as des douleurs cervicales au réveil. 8h de récupération sans tension",
    url: "https://amzn.to/4d6w3tV",
    priority: "haute",
    dimension: ["sommeil", "douleurs"],
    triggers: ["q6 >= 2", "q18 === exhausted"],
    price: "~45€",
    badge: "Nuits sans douleur",
  },
  luminette: {
    id: "luminette",
    name: "Luminette — Lunettes de luminothérapie",
    reason: "20 min le matin pendant ton café booste la sérotonine et régule ton horloge biologique — énergie naturelle toute la journée",
    url: "https://amzn.to/4u79cnZ",
    priority: "premium",
    dimension: ["sommeil", "nutrition"],
    triggers: ["q18 === exhausted", "sleep_energy_score < 50"],
    price: "~150€",
    badge: "Coup de boost naturel",
  },
  // ── Nutrition & Hydratation ──
  gourde_graduee: {
    id: "gourde_graduee",
    name: "Gourde graduée avec horaires 1.5L",
    reason: "Te rappelle de boire toute la journée — la déshydratation à -2% réduit déjà ta concentration et amplifie la fatigue",
    url: "https://amzn.to/3RAs14A",
    priority: "haute",
    dimension: ["nutrition"],
    triggers: ["q19 <= 4", "nutrition_score < 60"],
    price: "~15€",
    badge: "Achat malin",
  },
};
