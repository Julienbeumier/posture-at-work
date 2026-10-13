/**
 * Base de connaissances ergonomie de PAW.
 *
 * - readSignals() : lit les réponses brutes du questionnaire avec les VRAIES valeurs
 *   du formulaire (source unique, utilisée par le rapport individuel et le dashboard RH).
 * - SOURCES : références réellement consultées (liens publics).
 * - buildTeamInsights() : agrège une équipe et produit des constats
 *   « ce qu'on a vu / ce qu'on conseille / ce qu'on évite », avec niveau de preuve honnête.
 *
 * Règle de rédaction : on n'affiche aucun chiffre qui ne soit pas sourcé ci-dessous.
 * Quand les preuves sont limitées, on le dit (c'est un argument de confiance, pas une faiblesse).
 */

type Answers = Record<string, unknown> | null | undefined;

// ─── Sources ─────────────────────────────────────────────────────────────────

export const SOURCES = {
  cochrane: {
    label: "Cochrane — Hoe et al., 2018 : interventions ergonomiques (membre supérieur & nuque, travail de bureau)",
    url: "https://www.cochrane.org/evidence/CD008570",
  },
  metaanalyse: {
    label: "Méta-analyse 2025 (J. Clin. Med. 14(9):3034) — interventions ergonomiques et douleur liée au travail",
    url: "https://www.mdpi.com/2077-0383/14/9/3034",
  },
  euoshaSitting: {
    label: "EU-OSHA — TMS et station assise prolongée",
    url: "https://oshwiki.osha.europa.eu/en/themes/musculoskeletal-disorders-and-prolonged-static-sitting",
  },
  euoshaTelework: {
    label: "EU-OSHA — TMS et télétravail",
    url: "https://oshwiki.osha.europa.eu/en/themes/musculoskeletal-disorders-and-telework",
  },
  cochraneBlueLight: {
    label: "Cochrane — Lunettes filtrant la lumière bleue (Singh et al., 2023)",
    url: "https://www.cochrane.org/CD013244/",
  },
  who: {
    label: "OMS — Activité physique (fiche d'information)",
    url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
  },
} as const;

export type SourceId = keyof typeof SOURCES;

// ─── Lecture normalisée des réponses ─────────────────────────────────────────

export interface Signals {
  // douleurs bureau (0-5)
  nuque: number; epaules: number; dos: number; poignets: number; yeux: number;
  // douleurs debout (0-5)
  dDos: number; dJambes: number; dEpaules: number; dPieds: number;
  // habitudes
  heuresAssis: number;
  pauseJamais: boolean;      // q14 = never
  pauseRare: boolean;        // q14 = never | 1x
  activiteNulle: boolean;    // q14b = none
  stress: number;            // 0-5
  stressEleve: boolean;      // ≥ 4
  sommeil: number;           // heures
  sommeilCourt: boolean;     // ≤ 6
  sommeilCritique: boolean;  // ≤ 5
  // setup
  laptopSeul: boolean;
  ecranBas: boolean;
  chaiseInadaptee: boolean;
  eclairageProbleme: boolean;
  hauteurBureauMauvaise: boolean;
  // alertes cliniques
  irradiation: boolean;
  fourmillements: boolean;
  douleurNocturne: boolean;
  // contexte
  teletravail: boolean;
  // debout
  levageMauvais: boolean;
  pasDeTapis: boolean;
}

const num = (v: unknown, d = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) && v !== "" && v !== null && v !== undefined ? n : d;
};

export function readSignals(answers: Answers): Signals {
  const a = (answers ?? {}) as Record<string, unknown>;
  const stress = num(a.q_stress_travail, 0);
  const sommeil = num(a.q17 ?? a.q_d_sommeil, 7);
  const irr = a.q_irradiation;
  return {
    nuque: num(a.q6), epaules: num(a.q7), dos: num(a.q8), poignets: num(a.q9), yeux: num(a.q10),
    dDos: num(a.q_d_doul_dos), dJambes: num(a.q_d_doul_jambes), dEpaules: num(a.q_d_doul_epaules), dPieds: num(a.q_d_doul_pieds),
    heuresAssis: num(a.q13),
    pauseJamais: a.q14 === "never",
    pauseRare: a.q14 === "never" || a.q14 === "1x",
    activiteNulle: a.q14b === "none",
    stress, stressEleve: stress >= 4,
    sommeil, sommeilCourt: sommeil <= 6, sommeilCritique: sommeil <= 5,
    laptopSeul: a.q_double_ecran === "laptop_seul",
    ecranBas: a.q3 === "no" || a.q_hauteur_bureau === "trop_bas",
    chaiseInadaptee: a.q5b === "couch" || a.q5b === "fixed",
    eclairageProbleme: ["contre_jour", "reflets", "artificiel"].includes(String(a.q_eclairage ?? "")),
    hauteurBureauMauvaise: a.q_hauteur_bureau === "trop_bas" || a.q_hauteur_bureau === "trop_haut",
    irradiation: (typeof irr === "string" && irr !== "" && irr !== "non") || a.q_irradiation_bras === "coude" || a.q_irradiation_bras === "main",
    fourmillements: a.q_fourmillements === "permanent" || a.q_fourmillements === "travail",
    douleurNocturne: a.q_douleur_nuit === "reveille" || a.q_douleur_nuit === "souvent",
    teletravail: a.q2 === "remote" || a.q2 === "both",
    levageMauvais: a.q_d_posture_levage === "mauvaise",
    pasDeTapis: a.q_d_tapis === "non",
  };
}

// ─── Insights d'équipe ───────────────────────────────────────────────────────

export type InsightSeverity = "critique" | "eleve" | "modere";
export type EvidenceLevel = "consensus" | "moderee" | "limitee";

export interface TeamInsight {
  id: string;
  emoji: string;
  zone: string;
  severity: InsightSeverity;
  affected: number;
  total: number;
  pct: number;
  /** Ce qu'on a observé dans vos équipes */
  seen: string;
  /** Ce qu'on vous conseille */
  advise: string[];
  /** Ce que ça permet d'éviter */
  prevent: string;
  evidence: { level: EvidenceLevel; note: string; sources: SourceId[] };
}

export interface TeamRow {
  job_type: "bureau" | "debout" | null;
  answers: Record<string, unknown> | null;
}

interface Rule {
  id: string; emoji: string; zone: string;
  applies?: (r: TeamRow) => boolean;       // population concernée (défaut : tous)
  hit: (s: Signals, r: TeamRow) => boolean; // la personne est-elle concernée ?
  forceCritical?: boolean;                  // alerte clinique : critique dès 1 personne
  seen: (n: number, t: number, pct: number) => string;
  advise: string[];
  prevent: string;
  evidence: TeamInsight["evidence"];
}

const bureau = (r: TeamRow) => r.job_type !== "debout";
const debout = (r: TeamRow) => r.job_type === "debout";
const sur = (n: number, t: number) => `${n} personne${n > 1 ? "s" : ""} sur ${t}`;

const RULES: Rule[] = [
  {
    id: "alerte-clinique", emoji: "🚩", zone: "Signaux d'alerte à orienter vers un professionnel de santé",
    applies: bureau, forceCritical: true,
    hit: s => s.irradiation || s.fourmillements || s.douleurNocturne,
    seen: (n, t) => `${sur(n, t)} déclarent des fourmillements, des douleurs qui irradient dans le bras ou des douleurs qui réveillent la nuit.`,
    advise: [
      "Diffuser à toute l'équipe une information claire : ces symptômes justifient un avis médical ou kinésithérapique rapide, sans attendre l'aménagement du poste.",
      "Désigner un référent (RH, médecin du travail, service de prévention) vers qui orienter, en gardant la confidentialité des personnes.",
      "Proposer un créneau d'évaluation individuelle (bilan kiné) aux personnes concernées.",
    ],
    prevent: "Évite qu'une compression nerveuse ou une douleur évolutive ne s'installe jusqu'à l'arrêt de travail faute d'avoir été prise en charge à temps.",
    evidence: { level: "consensus", note: "Orientation clinique standard : ces symptômes ne se traitent pas par le seul réglage du poste.", sources: [] },
  },
  {
    id: "sedentarite", emoji: "⏱️", zone: "Sédentarité et absence de pauses",
    applies: bureau,
    hit: s => s.heuresAssis >= 9 || s.pauseRare,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) passent 9 h ou plus assises par jour, ou ne se lèvent presque jamais.`,
    advise: [
      "Instaurer une micro-pause de quelques instants toutes les 20 à 30 min (rappel d'équipe ou application partagée).",
      "Viser au moins 10 min debout ou en marche après chaque période de 2 h assis ; réunions debout ou en marchant pour les points courts.",
      "Proposer des bureaux assis-debout, avec une consigne d'alternance (pas de position debout figée non plus).",
      "Faire montrer l'exemple aux managers : la culture de pause compte autant que l'équipement.",
    ],
    prevent: "Limite l'accumulation de charge statique sur le dos et la nuque, source de douleurs cervico-lombaires.",
    evidence: {
      level: "moderee",
      note: "Repères EU-OSHA : station assise ≤ 50 % de la journée, micro-pauses toutes les 20-30 min. Mais attention : dans la revue Cochrane, les pauses supplémentaires ont un niveau de preuve très faible et les bureaux assis-debout seuls n'ont pas montré d'effet sur la douleur du membre supérieur. C'est la combinaison mouvement + culture qui est recommandée, pas un équipement seul.",
      sources: ["euoshaSitting", "cochrane"],
    },
  },
  {
    id: "cervical", emoji: "🦆", zone: "Nuque et épaules",
    applies: bureau,
    hit: s => s.nuque >= 3 || s.epaules >= 3,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) déclarent des douleurs de nuque ou d'épaules de niveau 3/5 ou plus.`,
    advise: [
      "Auditer les postes : haut de l'écran au niveau des yeux, écran à environ une longueur de bras, clavier et souris à hauteur des coudes.",
      "Doter les postes sur laptop d'un écran externe, d'un clavier et d'une souris externes.",
      "Pour les personnes très symptomatiques, tester un support d'avant-bras : c'est l'un des rares équipements avec un effet démontré sur les douleurs de nuque et d'épaule.",
      "Associer à un court programme d'exercices (rétraction cervicale, mobilité d'épaule) réalisé en équipe.",
    ],
    prevent: "Évite la chronicisation des cervicalgies et des tendinopathies d'épaule, première cause de gêne au travail de bureau.",
    evidence: {
      level: "moderee",
      note: "Cochrane : un support d'avant-bras (avec souris alternative) a réduit l'incidence des TMS nuque/épaule (RR 0,52 ; preuve modérée). Une souris alternative seule ou un simple réglage du poste n'ont pas montré d'effet. La méta-analyse 2025 trouve un effet global favorable mais modeste sur la douleur (OR ≈ 0,64), et ses auteurs concluent que l'ergonomie seule ne suffit pas.",
      sources: ["cochrane", "metaanalyse"],
    },
  },
  {
    id: "lombaire-bureau", emoji: "🌿", zone: "Bas du dos (postes bureau)",
    applies: bureau,
    hit: s => s.dos >= 3,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) déclarent des douleurs lombaires de niveau 3/5 ou plus.`,
    advise: [
      "Vérifier le réglage des sièges (hauteur, soutien lombaire, pieds à plat) et remplacer les chaises non réglables.",
      "Encourager le changement fréquent de position : la meilleure posture assise est la suivante.",
      "Proposer une activité physique douce encadrée (mobilité du bas du dos, renforcement).",
    ],
    prevent: "Réduit la pression sur les disques et le risque de lombalgie récurrente liée à la position assise prolongée.",
    evidence: {
      level: "moderee",
      note: "EU-OSHA : la pression intradiscale est plus élevée assis que debout (environ 140 % sans appui dorsal). La méta-analyse 2025 rapporte un effet favorable des interventions ergonomiques sur les douleurs lombaires (OR ≈ 0,58), avec une forte hétérogénéité.",
      sources: ["euoshaSitting", "metaanalyse"],
    },
  },
  {
    id: "poignets", emoji: "🖱️", zone: "Poignets et main",
    applies: bureau,
    hit: s => s.poignets >= 3,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) déclarent des douleurs de poignet de niveau 3/5 ou plus.`,
    advise: [
      "Vérifier la position clavier/souris (avant-bras soutenus, poignets dans l'axe) avant d'acheter du matériel.",
      "Proposer des essais de souris (verticale ou autre) aux personnes concernées, sans généraliser.",
      "Intégrer des étirements de poignet avant les longues sessions au clavier.",
    ],
    prevent: "Limite l'installation de tendinopathies ou d'une compression nerveuse au poignet.",
    evidence: {
      level: "limitee",
      note: "Cochrane : une souris alternative n'a pas réduit les TMS du membre supérieur par rapport à une souris classique (preuve modérée). L'ajustement individuel prime sur l'achat systématique.",
      sources: ["cochrane"],
    },
  },
  {
    id: "setup-ecran", emoji: "🖥️", zone: "Poste de travail (écran, laptop, siège)",
    applies: bureau,
    hit: s => s.laptopSeul || s.ecranBas || s.chaiseInadaptee || s.hauteurBureauMauvaise,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) travaillent sur un laptop seul, avec un écran trop bas, une chaise inadaptée ou un bureau mal réglé.`,
    advise: [
      "Faire l'inventaire des postes concernés et les équiper en priorité : écran externe ou rehausseur, clavier et souris externes.",
      "Accompagner la dotation d'une courte formation au réglage du poste (10 min) : l'équipement sans explication est peu efficace.",
      "Inclure le poste à domicile des personnes en télétravail dans la dotation.",
    ],
    prevent: "Évite la flexion de nuque prolongée et les compensations d'épaule dues à un poste mal dimensionné.",
    evidence: {
      level: "limitee",
      note: "Un réglage de poste seul n'a pas montré d'effet dans la revue Cochrane ; les formations participatives ont des preuves faibles. L'équipement est nécessaire mais doit s'accompagner de mouvement et d'accompagnement. EU-OSHA recommande d'inclure le télétravail dans l'évaluation des risques.",
      sources: ["cochrane", "euoshaTelework"],
    },
  },
  {
    id: "yeux-eclairage", emoji: "💡", zone: "Yeux et éclairage",
    applies: bureau,
    hit: s => s.yeux >= 3 || s.eclairageProbleme,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) signalent une fatigue oculaire importante ou un éclairage de poste problématique (contre-jour, reflets, lumière artificielle seule).`,
    advise: [
      "Viser environ 500 lux au poste et placer l'écran perpendiculairement aux fenêtres (ni face ni dos), avec stores si besoin.",
      "Rappeler la règle 20-20-20 : toutes les 20 min, regarder au loin 20 secondes.",
      "Proposer un contrôle de la vue si la gêne persiste.",
    ],
    prevent: "Réduit la fatigue visuelle, les céphalées et les postures de compensation (tête avancée pour mieux voir).",
    evidence: {
      level: "limitee",
      note: "Valeurs d'éclairage et gestion des reflets : recommandations EU-OSHA. La règle 20-20-20 est une pratique courante dont les preuves sont limitées.",
      sources: ["euoshaTelework"],
    },
  },
  {
    id: "stress", emoji: "🧠", zone: "Stress au travail",
    hit: s => s.stressEleve,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) déclarent un stress au travail de niveau 4/5 ou plus.`,
    advise: [
      "Regarder la charge de travail, l'autonomie et le soutien managérial dans les équipes concernées : le stress est un facteur d'organisation, pas seulement individuel.",
      "Clarifier les horaires d'accessibilité et respecter le droit à la déconnexion.",
      "Proposer des temps de récupération collectifs (pauses, respiration, marche).",
    ],
    prevent: "Les facteurs psychosociaux augmentent le risque de TMS et d'absentéisme : agir en amont évite que le stress n'entretienne les douleurs.",
    evidence: {
      level: "moderee",
      note: "EU-OSHA recense stress, forte charge, faible autonomie et faible soutien parmi les facteurs de risque de TMS (notamment en télétravail).",
      sources: ["euoshaTelework"],
    },
  },
  {
    id: "sommeil", emoji: "🌙", zone: "Sommeil et récupération",
    hit: s => s.sommeilCourt,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) dorment 6 h ou moins par nuit.`,
    advise: [
      "Sensibiliser aux horaires et à la déconnexion en soirée (écrans, messages tardifs).",
      "Éviter les réunions en dehors des horaires normaux pour les équipes concernées.",
    ],
    prevent: "Une récupération insuffisante entretient la fatigue et la perception de la douleur au travail.",
    evidence: {
      level: "limitee",
      note: "Le sommeil est un facteur de santé reconnu (OMS : l'activité physique améliore notamment le sommeil) ; PAW ne chiffre pas ici son effet sur les douleurs.",
      sources: ["who"],
    },
  },
  {
    id: "inactivite", emoji: "🏃", zone: "Activité physique",
    hit: s => s.activiteNulle,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) ne pratiquent aucune activité physique régulière.`,
    advise: [
      "Viser au moins 150 min d'activité modérée par semaine (repère OMS) ; tout mouvement compte, par blocs d'au moins 10 min.",
      "Proposer des activités simples sur site ou hors site : marche, challenge collectif, mobilité en équipe.",
    ],
    prevent: "Diminue le risque cardio-métabolique et améliore la santé mentale et le sommeil.",
    evidence: {
      level: "consensus",
      note: "Recommandation OMS : au moins 150 min d'activité modérée par semaine pour les adultes ; limiter la sédentarité.",
      sources: ["who"],
    },
  },
  {
    id: "teletravail", emoji: "🏠", zone: "Télétravail",
    hit: s => s.teletravail,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) travaillent en tout ou partie à domicile.`,
    advise: [
      "Fournir ou financer le matériel (écran, clavier, souris, support) et un guide de réglage du poste à domicile.",
      "Définir une politique de télétravail incluant ergonomie, risques psychosociaux et déconnexion.",
      "Maintenir des points réguliers avec les équipes pour repérer les difficultés.",
    ],
    prevent: "À domicile, postes de fortune, plus de sédentarité et frontières floues entre travail et vie privée augmentent l'exposition.",
    evidence: {
      level: "moderee",
      note: "Recommandations EU-OSHA pour les employeurs : évaluation des risques avec les télétravailleurs, équipement, formation, politique claire.",
      sources: ["euoshaTelework"],
    },
  },
  {
    id: "debout-lombaire", emoji: "🏭", zone: "Dos et manutention (postes debout)",
    applies: debout,
    hit: s => s.dDos >= 3 || s.levageMauvais,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) déclarent des douleurs de dos de niveau 3/5 ou plus, ou une technique de levage insuffisante.`,
    advise: [
      "Analyser les tâches de manutention (poids, hauteur, fréquence) et réorganiser les rangements : rapprocher le fréquent, alléger ou mécaniser le lourd.",
      "Compléter par une formation pratique aux gestes et postures, sur le poste réel.",
      "Prévoir des rotations de tâches pour limiter les gestes répétitifs ou les charges en hauteur.",
    ],
    prevent: "Évite les lombalgies aiguës et les arrêts de travail liés à la manutention.",
    evidence: {
      level: "limitee",
      note: "La formation seule a des effets limités ; l'aménagement des tâches et de l'organisation est le levier principal (principe de prévention à la source). Les pourcentages d'efficacité ne sont pas chiffrés ici faute de source consultée.",
      sources: [],
    },
  },
  {
    id: "debout-jambes", emoji: "🦵", zone: "Jambes et pieds (postes debout)",
    applies: debout,
    hit: s => s.dJambes >= 3 || s.dPieds >= 3 || s.pasDeTapis,
    seen: (n, t, p) => `${sur(n, t)} (${p} %) déclarent des jambes lourdes, des douleurs de pieds ou n'ont pas de tapis au poste fixe.`,
    advise: [
      "Alterner station debout, marche et assise courte ; éviter les stations debout figées.",
      "Tester des tapis anti-fatigue aux postes fixes et des chaussures amortissantes adaptées.",
      "Encourager la surélévation des jambes après le travail pour les jambes lourdes.",
    ],
    prevent: "Réduit la fatigue des membres inférieurs et l'inconfort lié à la station debout prolongée.",
    evidence: {
      level: "limitee",
      note: "L'alternance des postures est la recommandation robuste ; l'effet des tapis et des chaussures est plus variable selon les personnes.",
      sources: [],
    },
  },
];

const SEV_ORDER: Record<InsightSeverity, number> = { critique: 0, eleve: 1, modere: 2 };

export function buildTeamInsights(rows: TeamRow[]): TeamInsight[] {
  const out: TeamInsight[] = [];
  for (const rule of RULES) {
    const pop = rows.filter(r => (rule.applies ? rule.applies(r) : true));
    if (pop.length === 0) continue;
    const affected = pop.filter(r => rule.hit(readSignals(r.answers), r)).length;
    if (affected === 0) continue;
    const pct = Math.round((affected / pop.length) * 100);
    const severity: InsightSeverity =
      rule.forceCritical || pct >= 40 ? "critique" : pct >= 25 ? "eleve" : "modere";
    // Sous 10 % et pas d'alerte clinique : on n'encombre pas le tableau de bord.
    if (!rule.forceCritical && pct < 10) continue;
    out.push({
      id: rule.id, emoji: rule.emoji, zone: rule.zone, severity,
      affected, total: pop.length, pct,
      seen: rule.seen(affected, pop.length, pct),
      advise: rule.advise, prevent: rule.prevent, evidence: rule.evidence,
    });
  }
  return out.sort((x, y) => SEV_ORDER[x.severity] - SEV_ORDER[y.severity] || y.pct - x.pct);
}

export const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  consensus: "Recommandation établie",
  moderee: "Preuves modérées",
  limitee: "Preuves limitées",
};
