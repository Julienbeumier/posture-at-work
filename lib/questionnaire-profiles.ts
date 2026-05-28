export type QuestionType = "choice" | "multiselect" | "slider" | "painscale" | "wellbeing";

export interface QuestionOption { value: string; label: string; }

export interface QuestionDef {
  id: string;
  type: QuestionType;
  label: string;
  note?: string;
  options?: QuestionOption[];
  min?: number; max?: number; step?: number; unit?: string; reference?: string;
  alwaysAnswered?: boolean; // sliders
}

export interface CategoryDef {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  selectedBg: string;
  selectedColor: string;
  questions: QuestionDef[];
  requiredQ: string[]; // ids that must be answered for completion
}

export type JobType = "bureau" | "debout" | "artisan" | "transport" | "medical" | "enseignement";

export type GenericAnswers = Record<string, string | number | string[] | null>;

// ─── Profile defaults ──────────────────────────────────────────────────────

export function defaultAnswers(categories: CategoryDef[]): GenericAnswers {
  const out: GenericAnswers = {};
  for (const cat of categories) {
    for (const q of cat.questions) {
      if (q.type === "slider") out[q.id] = q.min !== undefined ? Math.round((q.min + (q.max ?? q.min)) / 2) : 5;
      else if (q.type === "painscale") out[q.id] = null;
      else if (q.type === "wellbeing") out[q.id] = null;
      else if (q.type === "multiselect") out[q.id] = [];
      else out[q.id] = "";
    }
  }
  return out;
}

// ─── DEBOUT profile ───────────────────────────────────────────────────────

export const DEBOUT_CATEGORIES: CategoryDef[] = [
  {
    id: "cat-d1", title: "Ton poste debout", subtitle: "Sol, chaussures et ergonomie", emoji: "🦶",
    color: "#f4a261", colorBg: "rgba(212,98,42,0.08)", colorBorder: "rgba(212,98,42,0.18)",
    selectedBg: "rgba(212,98,42,0.18)", selectedColor: "#f4a261",
    requiredQ: ["q_d1", "q_d2", "q_d3", "q_d5", "q_d6", "q_d7", "q_d_charges", "q_d_repetitif", "q_d_endurance_debout"],
    questions: [
      { id: "q_d1", type: "multiselect", label: "Sur quel(s) type(s) de sol travailles-tu ?", note: "Le type de sol impacte directement la fatigue de tes pieds et de ton dos — sélectionne tout ce qui s'applique", options: [
        { value: "souple", label: "🟢 Tapis / caoutchouc (sol souple)" },
        { value: "semi_dur", label: "🟫 Parquet / lino (sol semi-dur)" },
        { value: "dur", label: "🪨 Carrelage / béton (sol dur)" },
        { value: "caillebotis", label: "🔲 Caillebotis / grilles métalliques" },
        { value: "exterieur", label: "🌿 Extérieur (pavés, asphalte)" },
        { value: "varie", label: "🔀 Ça varie beaucoup" },
      ]},
      { id: "q_d2", type: "choice", label: "As-tu un tapis anti-fatigue à ton poste ?", options: [
        { value: "oui_ergo", label: "✅ Oui, tapis ergonomique" },
        { value: "oui_fin", label: "🔸 Oui mais fin / inadapté" },
        { value: "non", label: "❌ Non, sol dur direct" },
        { value: "inconnu", label: "🤷 Je sais pas ce que c'est" },
      ]},
      { id: "q_d3", type: "choice", label: "Tes chaussures de travail sont ?", note: "Les chaussures de sécurité lourdes sans amorti sont très génératrices de douleurs aux pieds", options: [
        { value: "semelles_pro", label: "👟 Semelles amortissantes professionnelles" },
        { value: "baskets", label: "👟 Baskets confortables" },
        { value: "securite", label: "🩴 Chaussures de sécurité (embout acier)" },
        { value: "plates", label: "🥿 Chaussures plates sans amorti" },
        { value: "ville", label: "👞 Chaussures de ville / talons" },
      ]},
      { id: "q_d4", type: "slider", label: "Combien d'heures restes-tu debout par jour ?", min: 4, max: 12, step: 0.5, unit: "h", reference: "⚠️ Au-delà de 6h debout sans pause = risque élevé", alwaysAnswered: true },
      { id: "q_d_endurance_debout", type: "choice", label: "Au bout de combien de temps debout ressens-tu une gêne ou fatigue importante ?", note: "Indique ta limite avant d'avoir besoin de t'asseoir ou de changer de position", options: [
        { value: "moins_1h", label: "🚨 Moins d'1 heure" },
        { value: "un_2h", label: "😟 Entre 1h et 2h" },
        { value: "deux_4h", label: "🔸 Entre 2h et 4h" },
        { value: "plus_4h", label: "✅ Plus de 4h sans problème" },
      ]},
      { id: "q_d5", type: "choice", label: "Peux-tu varier ta position dans la journée ?", options: [
        { value: "oui", label: "✅ Oui librement (assis/debout)" },
        { value: "un_peu", label: "🔸 Un peu, rarement" },
        { value: "non", label: "❌ Non, position fixe imposée" },
      ]},
      { id: "q_d6", type: "choice", label: "As-tu accès à un siège dans la journée ?", options: [
        { value: "oui_utilise", label: "✅ Oui et je l'utilise" },
        { value: "oui_nose_pas", label: "🔸 Oui mais je n'ose pas l'utiliser" },
        { value: "non", label: "❌ Non, pas de siège disponible" },
      ]},
      { id: "q_d7", type: "choice", label: "La hauteur de ton plan de travail est ?", options: [
        { value: "adapte", label: "✅ Adaptée (coudes légèrement fléchis)" },
        { value: "trop_bas", label: "⬇️ Trop basse (je me courbe)" },
        { value: "trop_haut", label: "⬆️ Trop haute (épaules soulevées)" },
        { value: "pas_plan", label: "🤷 Je n'ai pas de plan de travail fixe" },
      ]},
      { id: "q_d_charges", type: "choice", label: "Portes-tu des charges dans ton travail ?", options: [
        { value: "legeres", label: "✅ Non ou très légères (< 5 kg)" },
        { value: "moyennes", label: "🔸 Parfois (5-15 kg)" },
        { value: "lourdes", label: "⚠️ Souvent (15-30 kg)" },
        { value: "tres_lourdes", label: "🚨 Régulièrement (> 30 kg)" },
      ]},
      { id: "q_d_repetitif", type: "choice", label: "Fais-tu des gestes répétitifs ?", options: [
        { value: "non", label: "✅ Non, gestes variés" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "toute_la_journee", label: "🔄 Oui, quasi toute la journée" },
      ]},
    ],
  },
  {
    id: "cat-d2", title: "Tes douleurs spécifiques", subtitle: "Pieds, jambes, dos — les zones clés debout", emoji: "🩺",
    color: "#f09595", colorBg: "rgba(226,75,74,0.08)", colorBorder: "rgba(226,75,74,0.18)",
    selectedBg: "rgba(226,75,74,0.18)", selectedColor: "#f09595",
    requiredQ: ["q_d8", "q_d9", "q_d10", "q_d11", "q_d12", "q_d_coude", "q_d_poignet", "q_d13", "q_d14", "q_d_irradiation", "q_d15", "q_d_varices", "q_d_crampes", "q_d_jambes_nuit"],
    questions: [
      { id: "q_d8", type: "painscale", label: "Douleurs pieds / talons", note: "La douleur au talon au premier pas du matin est un signal important — note-le" },
      { id: "q_d9", type: "painscale", label: "Douleurs genoux" },
      { id: "q_d10", type: "painscale", label: "Douleurs bas du dos" },
      { id: "q_d11", type: "painscale", label: "Douleurs mollets / jambes lourdes" },
      { id: "q_d12", type: "painscale", label: "Douleurs épaules / nuque" },
      { id: "q_d_coude", type: "painscale", label: "Douleurs coude(s)" },
      { id: "q_d_poignet", type: "painscale", label: "Douleurs poignet(s) / mains" },
      { id: "q_d13", type: "choice", label: "Tes douleurs aux pieds/talons se manifestent surtout ?", options: [
        { value: "pas", label: "✨ Pas de douleurs aux pieds" },
        { value: "fin_journee", label: "🌆 En fin de journée uniquement" },
        { value: "cours_service", label: "☀️ En cours de service" },
        { value: "premier_pas", label: "🌅 Au premier pas du matin (signal fasciite plantaire)" },
        { value: "douleur_reveil", label: "😫 Dès le réveil, avant même de se lever" },
        { value: "tout_temps", label: "🔄 Tout le temps" },
      ]},
      { id: "q_d14", type: "choice", label: "Le soir après le travail, tes jambes sont ?", options: [
        { value: "normales", label: "✅ Normales, pas de problème" },
        { value: "lourdes", label: "😐 Un peu lourdes / fatiguées" },
        { value: "tres_lourdes", label: "😫 Très lourdes, gonflées" },
        { value: "varices", label: "🔴 Douloureuses avec varices visibles" },
      ]},
      { id: "q_d_irradiation", type: "choice", label: "As-tu des douleurs qui irradient dans le bas du dos ou les jambes ?", note: "Une douleur qui descend dans la fesse, la cuisse ou jusqu'au pied peut signaler une compression nerveuse (sciatique, cruralgie)", options: [
        { value: "non", label: "✅ Non, douleurs localisées uniquement" },
        { value: "fesse_cuisse", label: "🔸 Oui, dans la fesse ou la cuisse" },
        { value: "jusqu_genou", label: "😟 Oui, jusqu'au genou" },
        { value: "jusqu_pied", label: "🚨 Oui, jusqu'au pied / aux orteils" },
      ]},
      { id: "q_d_varices", type: "choice", label: "As-tu des varices visibles sur les jambes ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "veinules", label: "🔸 Quelques petites veinules" },
        { value: "varices", label: "⚠️ Varices visibles" },
        { value: "importantes", label: "🔴 Varices importantes et douloureuses" },
      ]},
      { id: "q_d_crampes", type: "choice", label: "As-tu des crampes dans les jambes la nuit ?", note: "Les crampes nocturnes chez les travailleurs debout sont souvent liées à la déshydratation et aux carences en magnésium", options: [
        { value: "non", label: "✅ Non, jamais" },
        { value: "parfois", label: "🔸 Parfois (1-2×/mois)" },
        { value: "souvent", label: "😟 Souvent (plusieurs fois/semaine)" },
        { value: "toutes_les_nuits", label: "😫 Presque toutes les nuits" },
      ]},
      { id: "q_d_jambes_nuit", type: "choice", label: "La nuit, tes jambes sont-elles agitées ou inconfortables ?", options: [
        { value: "non", label: "✅ Non, aucun problème" },
        { value: "parfois", label: "🔸 Parfois une sensation d'inconfort" },
        { value: "souvent_agitees", label: "😟 Souvent agitées, difficile de rester immobile" },
        { value: "perturbe_sommeil", label: "😫 Oui, ça perturbe mon sommeil régulièrement" },
      ]},
      { id: "q_d15", type: "choice", label: "Depuis combien de temps as-tu ces douleurs ?", options: [
        { value: "pas", label: "✨ Pas de douleurs" },
        { value: "jours", label: "📅 Quelques jours" },
        { value: "semaines", label: "📅 Quelques semaines" },
        { value: "mois", label: "📅 Plusieurs mois" },
        { value: "an", label: "⏳ Plus d'un an" },
      ]},
    ],
  },
  {
    id: "cat-d3", title: "Tes habitudes au travail", subtitle: "Pauses, mouvement et contraintes", emoji: "⏱️",
    color: "#74c69d", colorBg: "rgba(45,106,79,0.08)", colorBorder: "rgba(45,106,79,0.18)",
    selectedBg: "rgba(45,106,79,0.18)", selectedColor: "#74c69d",
    requiredQ: ["q_d16", "q_d17", "q_d19", "q_d_protection"],
    questions: [
      { id: "q_d16", type: "choice", label: "Fais-tu des pauses assises dans la journée ?", options: [
        { value: "regulier", label: "✅ Oui régulièrement (toutes les 2h)" },
        { value: "parfois", label: "🔸 Oui parfois" },
        { value: "rarement", label: "⚠️ Rarement" },
        { value: "jamais", label: "🚫 Jamais — pas le temps ou pas autorisé" },
      ]},
      { id: "q_d17", type: "choice", label: "Bouges-tu pendant ton service ?", options: [
        { value: "beaucoup", label: "✅ Oui, je circule beaucoup" },
        { value: "parfois", label: "🔸 Parfois mais souvent immobile" },
        { value: "fixe", label: "❌ Non, poste fixe immobile" },
      ]},
      { id: "q_d19", type: "choice", label: "Hydratation pendant le service ?", options: [
        { value: "reguliere", label: "✅ Je bois régulièrement (>1.5L)" },
        { value: "parfois", label: "🔸 Parfois, pas assez" },
        { value: "rarement", label: "❌ Rarement, pas le temps" },
        { value: "interdit", label: "🚫 Je ne peux pas boire au poste" },
      ]},
      { id: "q_d_protection", type: "multiselect", label: "Utilises-tu des équipements ou protections au travail ?", note: "Certains EPI ou accessoires peuvent significativement réduire la fatigue et les douleurs", options: [
        { value: "ceinture", label: "🩹 Ceinture lombaire" },
        { value: "genouilleres", label: "🦵 Genouillères" },
        { value: "chaussures_securite", label: "👟 Chaussures de sécurité avec amorti" },
        { value: "aucun", label: "❌ Aucun équipement" },
      ]},
    ],
  },
  {
    id: "cat-d4", title: "Après le travail", subtitle: "Récupération et ressenti global", emoji: "🌙",
    color: "#a78bfa", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["q_d21"],
    questions: [
      { id: "q_d20", type: "multiselect", label: "Que fais-tu après le travail pour récupérer ?", options: [
        { value: "etirements", label: "🧘 Étirements / yoga" },
        { value: "natation", label: "🏊 Natation / vélo (faible impact)" },
        { value: "course", label: "🏃 Course à pied / sport intensif" },
        { value: "repos", label: "🛋️ Repos passif" },
        { value: "surelever", label: "🦵 Je surélève les jambes" },
        { value: "compression", label: "🧦 Je porte des chaussettes de compression" },
      ]},
      { id: "q_d21", type: "wellbeing", label: "Ressenti global en fin de journée ?" },
    ],
  },
  {
    id: "cat-d5", title: "Sommeil & récupération", subtitle: "Qualité du sommeil, heures et récupération nocturne", emoji: "🌙",
    color: "#7dd3fc", colorBg: "rgba(14,165,233,0.08)", colorBorder: "rgba(14,165,233,0.18)",
    selectedBg: "rgba(14,165,233,0.18)", selectedColor: "#7dd3fc",
    requiredQ: ["q_d_sommeil_heures", "q_d_sommeil_qualite", "q_d_sommeil_recuperation", "q_d_reveil_douleur"],
    questions: [
      { id: "q_d_sommeil_heures", type: "slider", label: "Combien d'heures dors-tu par nuit en moyenne ?", min: 5, max: 10, step: 0.5, unit: "h", reference: "⚠️ Moins de 7h = récupération musculaire incomplète pour un métier debout", alwaysAnswered: true },
      { id: "q_d_sommeil_qualite", type: "choice", label: "Quelle est la qualité de ton sommeil ?", options: [
        { value: "profond", label: "😊 Profond et réparateur" },
        { value: "correct", label: "🔸 Correct, sans problème majeur" },
        { value: "leger", label: "😐 Léger / fragmenté / réveils fréquents" },
        { value: "tres_mauvais", label: "😫 Très mauvais" },
      ]},
      { id: "q_d_sommeil_recuperation", type: "choice", label: "Te réveilles-tu reposé ?", options: [
        { value: "bien", label: "✅ Oui, je me sens récupéré" },
        { value: "partiellement", label: "🔸 Partiellement" },
        { value: "non", label: "😐 Non, je suis toujours fatigué" },
        { value: "pire", label: "😫 Je me réveille plus fatigué qu'avant de dormir" },
      ]},
      { id: "q_d_reveil_douleur", type: "choice", label: "Te réveilles-tu avec des douleurs physiques ?", options: [
        { value: "sans_douleur", label: "✅ Non, je me réveille sans douleur" },
        { value: "raideurs", label: "🔸 Légères raideurs qui passent vite" },
        { value: "douleurs_jambes", label: "😟 Douleurs aux jambes ou aux pieds au réveil" },
        { value: "douleurs_importantes", label: "😫 Douleurs importantes qui persistent le matin" },
      ]},
    ],
  },
  {
    id: "cat-d6", title: "Nutrition & énergie", subtitle: "Petit-déjeuner, crampes, boissons, pause repas", emoji: "🍽️",
    color: "#a78bfa", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["q_d_petit_dej", "q_d_crampes_alim", "q_d_energie_boisson", "q_d_repas_service"],
    questions: [
      { id: "q_d_petit_dej", type: "choice", label: "Prends-tu un vrai petit-déjeuner avant le travail ?", note: "Sans carburant le matin, tes muscles se relâchent et ta posture s'effondre dès 10h", options: [
        { value: "complet", label: "✅ Oui, complet (protéines + glucides complexes)" },
        { value: "leger", label: "🔸 Léger (café + toast)" },
        { value: "juste_cafe", label: "☕ Juste un café" },
        { value: "saute", label: "🚫 Je saute souvent le petit-déjeuner" },
      ]},
      { id: "q_d_crampes_alim", type: "choice", label: "Ressens-tu des crampes musculaires régulièrement ?", options: [
        { value: "non", label: "✅ Non, jamais" },
        { value: "parfois", label: "🔸 Parfois pendant ou après le travail" },
        { value: "souvent", label: "😟 Souvent — pieds, mollets, cuisses" },
        { value: "nocturnes_service", label: "😫 Crampes nocturnes et en service" },
      ]},
      { id: "q_d_energie_boisson", type: "choice", label: "Bois-tu des boissons sucrées ou énergisantes pour tenir pendant le service ?", options: [
        { value: "eau", label: "✅ Non, eau principalement" },
        { value: "parfois_soda", label: "🔸 Parfois un soda ou jus de fruit" },
        { value: "souvent_energisantes", label: "⚡ Souvent des boissons énergisantes" },
        { value: "seul_moyen", label: "🔄 Oui, c'est ce qui me fait tenir" },
      ]},
      { id: "q_d_repas_service", type: "choice", label: "Manges-tu correctement pendant ta pause repas ?", options: [
        { value: "repas_chaud", label: "✅ Oui, repas chaud équilibré assis" },
        { value: "sandwich_assis", label: "🔸 Sandwich ou repas rapide assis" },
        { value: "debout_travaillant", label: "😐 Je mange debout ou en travaillant" },
        { value: "saute_pause", label: "🚫 Souvent je saute la pause repas" },
      ]},
    ],
  },
  {
    id: "cat-d7", title: "Ton mode de vie", subtitle: "Étirements, activité sportive, suivi médical", emoji: "🏃",
    color: "#5dcaa5", colorBg: "rgba(93,202,165,0.08)", colorBorder: "rgba(93,202,165,0.18)",
    selectedBg: "rgba(93,202,165,0.18)", selectedColor: "#5dcaa5",
    requiredQ: ["q_d_etirements_routine", "q_d_consultation"],
    questions: [
      { id: "q_d_etirements_routine", type: "choice", label: "Fais-tu des étirements avant ou après le travail ?", options: [
        { value: "quotidienne", label: "✅ Oui, routine quotidienne (> 10 min)" },
        { value: "parfois", label: "🔸 Parfois, quelques étirements" },
        { value: "rarement", label: "❌ Rarement" },
        { value: "jamais", label: "🚫 Jamais — je ne sais pas quoi faire" },
      ]},
      { id: "q_d_activite_type", type: "multiselect", label: "Quelle activité physique pratiques-tu en dehors du travail ?", options: [
        { value: "natation_velo_marche", label: "🏊 Natation / vélo / marche (faible impact)" },
        { value: "yoga_pilates", label: "🧘 Yoga / Pilates / étirements" },
        { value: "musculation", label: "🏋️ Musculation / renforcement" },
        { value: "sport_collectif", label: "⚽ Sport collectif" },
        { value: "course", label: "🏃 Course à pied / sport intensif" },
        { value: "aucune", label: "❌ Aucune activité en dehors du travail" },
      ]},
      { id: "q_d_consultation", type: "choice", label: "As-tu déjà consulté un professionnel de santé pour tes douleurs liées au travail ?", options: [
        { value: "suivi_regulier", label: "✅ Oui, je suis suivi régulièrement" },
        { value: "consulte_une_fois", label: "🔸 Oui, j'ai consulté une fois" },
        { value: "jamais", label: "❌ Non, jamais" },
        { value: "pas_eu_temps", label: "🤷 Pas eu le temps / pas osé" },
      ]},
    ],
  },
];


// ─── ARTISAN profile ──────────────────────────────────────────────────────

export const ARTISAN_CATEGORIES: CategoryDef[] = [
  {
    id: "cat-a1", title: "Ton travail physique", subtitle: "Type de travail et postures", emoji: "🔧",
    color: "#f4a261", colorBg: "rgba(212,98,42,0.08)", colorBorder: "rgba(212,98,42,0.18)",
    selectedBg: "rgba(212,98,42,0.18)", selectedColor: "#f4a261",
    requiredQ: ["a_metier", "a_position", "a_hauteur"],
    questions: [
      { id: "a_metier", type: "choice", label: "Quel est ton métier principal ?", options: [
        { value: "macon", label: "🧱 Maçon / BTP" },
        { value: "elec", label: "⚡ Électricien / plombier" },
        { value: "peintre", label: "🎨 Peintre / menuisier" },
        { value: "jardin", label: "🌿 Jardinage / espaces verts" },
        { value: "autre", label: "🔧 Autre artisan" },
      ]},
      { id: "a_h_physique", type: "slider", label: "Combien d'heures de travail physique par jour ?", min: 1, max: 10, step: 0.5, unit: "h", alwaysAnswered: true },
      { id: "a_position", type: "choice", label: "Tu travailles principalement ?", options: [
        { value: "debout", label: "🧍 Debout" },
        { value: "accroupi", label: "🤸 Accroupi / à genoux" },
        { value: "courbe", label: "🪣 Courbé" },
        { value: "varie", label: "🔀 Position variée" },
      ]},
      { id: "a_hauteur", type: "choice", label: "Travailles-tu en hauteur ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
      ]},
    ],
  },
  {
    id: "cat-a2", title: "Port de charges", subtitle: "Manutention et sécurité", emoji: "📦",
    color: "#d4622a", colorBg: "rgba(212,98,42,0.08)", colorBorder: "rgba(212,98,42,0.18)",
    selectedBg: "rgba(212,98,42,0.18)", selectedColor: "#f4a261",
    requiredQ: ["a_charges_freq", "a_technique", "a_charges_poids"],
    questions: [
      { id: "a_charges_freq", type: "choice", label: "Tu portes des charges lourdes (>10 kg) ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "toujours", label: "❌ Très souvent" },
      ]},
      { id: "a_technique", type: "choice", label: "Comment portes-tu les charges ?", options: [
        { value: "aide", label: "✅ Avec aide (collègue, matériel)" },
        { value: "seul_ok", label: "🔸 Seul, bonne technique" },
        { value: "seul_non", label: "❌ Seul, sans vraiment faire attention" },
      ]},
      { id: "a_epi", type: "choice", label: "Utilises-tu des équipements de protection ?", options: [
        { value: "ceinture", label: "🦺 Ceinture lombaire" },
        { value: "genouilleres", label: "🦵 Genouillères" },
        { value: "plusieurs", label: "✅ Plusieurs EPI" },
        { value: "rien", label: "❌ Rien" },
      ]},
      { id: "a_charges_poids", type: "choice", label: "Charges les plus lourdes que tu soulèves ?", options: [
        { value: "leger", label: "📦 < 10 kg" },
        { value: "moyen", label: "📦 10-25 kg" },
        { value: "lourd", label: "⚠️ 25-50 kg" },
        { value: "tres_lourd", label: "🚨 > 50 kg" },
      ]},
    ],
  },
  {
    id: "cat-a3", title: "Gestes répétitifs", subtitle: "Contraintes posturales", emoji: "🔄",
    color: "#7c3aed", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["a_gestes", "a_courbe", "a_inconfort"],
    questions: [
      { id: "a_gestes", type: "choice", label: "Fais-tu des gestes répétitifs ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "toujours", label: "❌ Toute la journée" },
      ]},
      { id: "a_courbe", type: "choice", label: "Travailles-tu souvent en position courbée ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "tres_souvent", label: "❌ Très souvent" },
      ]},
      { id: "a_vibrations", type: "choice", label: "As-tu des vibrations dans ton travail ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois (outils vibrants)" },
        { value: "souvent", label: "⚠️ Souvent" },
      ]},
      { id: "a_inconfort", type: "choice", label: "Travailles-tu dans des positions inconfortables ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "presque_toujours", label: "❌ Presque toujours" },
      ]},
    ],
  },
  {
    id: "cat-a4", title: "Tes douleurs", subtitle: "Douleurs spécifiques terrain", emoji: "🩺",
    color: "#f09595", colorBg: "rgba(226,75,74,0.08)", colorBorder: "rgba(226,75,74,0.18)",
    selectedBg: "rgba(226,75,74,0.18)", selectedColor: "#f09595",
    requiredQ: ["a_doul_dos", "a_doul_genoux", "a_doul_epaules", "a_doul_poignets", "a_doul_nuque", "a_doul_limite"],
    questions: [
      { id: "a_doul_dos", type: "painscale", label: "Douleur bas du dos" },
      { id: "a_doul_genoux", type: "painscale", label: "Douleur genoux" },
      { id: "a_doul_epaules", type: "painscale", label: "Douleur épaules" },
      { id: "a_doul_poignets", type: "painscale", label: "Douleur poignets / mains" },
      { id: "a_doul_nuque", type: "painscale", label: "Douleur nuque" },
      { id: "a_doul_duree", type: "choice", label: "Depuis combien de temps ?", options: [
        { value: "jours", label: "📅 Quelques jours" },
        { value: "semaines", label: "📅 Quelques semaines" },
        { value: "mois", label: "📅 Plusieurs mois" },
        { value: "an", label: "⏳ Plus d'un an" },
        { value: "pas", label: "✨ Pas de douleurs" },
      ]},
      { id: "a_doul_limite", type: "choice", label: "Tes douleurs t'empêchent-elles de travailler ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "adapte", label: "🔧 J'ai adapté mon travail" },
      ]},
    ],
  },
  {
    id: "cat-a5", title: "Récupération", subtitle: "Sommeil et habitudes post-chantier", emoji: "🌙",
    color: "#74c69d", colorBg: "rgba(45,106,79,0.08)", colorBorder: "rgba(45,106,79,0.18)",
    selectedBg: "rgba(45,106,79,0.18)", selectedColor: "#74c69d",
    requiredQ: ["a_reveil", "a_sport", "a_etirements"],
    questions: [
      { id: "a_sommeil", type: "slider", label: "Heures de sommeil par nuit", min: 4, max: 10, step: 0.5, unit: "h", alwaysAnswered: true },
      { id: "a_reveil", type: "choice", label: "Tu te réveilles comment ?", options: [
        { value: "repose", label: "😊 Reposé" },
        { value: "fatigue", label: "😐 Fatigué" },
        { value: "epuise", label: "😩 Épuisé" },
      ]},
      { id: "a_sport", type: "choice", label: "Fais-tu du sport en dehors du travail ?", options: [
        { value: "regulier", label: "✅ Oui, régulièrement" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "non", label: "❌ Non (le travail est déjà physique)" },
      ]},
      { id: "a_etirements", type: "choice", label: "Fais-tu des étirements après le chantier ?", options: [
        { value: "oui", label: "✅ Oui, régulièrement" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "non", label: "❌ Non" },
      ]},
    ],
  },
  {
    id: "cat-a6", title: "Santé & ressenti", subtitle: "Historique et ressenti global", emoji: "💭",
    color: "#a78bfa", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["a_ressenti", "a_accident"],
    questions: [
      { id: "a_accident", type: "choice", label: "As-tu déjà eu un accident de travail ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "mineur", label: "🔸 Oui, mineur" },
        { value: "grave", label: "⚠️ Oui, grave" },
      ]},
      { id: "a_maladie_pro", type: "choice", label: "As-tu une reconnaissance de maladie professionnelle ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "en_cours", label: "🔸 En cours" },
        { value: "oui", label: "📋 Oui" },
      ]},
      { id: "a_ressenti", type: "wellbeing", label: "Comment tu te sens physiquement globalement ?" },
    ],
  },
];

// ─── TRANSPORT profile ────────────────────────────────────────────────────

export const TRANSPORT_CATEGORIES: CategoryDef[] = [
  {
    id: "cat-t1", title: "Ton poste de conduite", subtitle: "Ergonomie véhicule", emoji: "🚗",
    color: "#7c9fff", colorBg: "rgba(43,92,230,0.08)", colorBorder: "rgba(43,92,230,0.18)",
    selectedBg: "rgba(43,92,230,0.18)", selectedColor: "#7c9fff",
    requiredQ: ["t_vehicule", "t_siege", "t_distance_volant", "t_lombaire"],
    questions: [
      { id: "t_vehicule", type: "choice", label: "Quel véhicule conduis-tu principalement ?", options: [
        { value: "voiture", label: "🚗 Voiture" },
        { value: "camionnette", label: "🚐 Camionnette" },
        { value: "camion", label: "🚛 Camion" },
        { value: "bus", label: "🚌 Bus / car" },
        { value: "plusieurs", label: "🔀 Plusieurs" },
      ]},
      { id: "t_h_conduite", type: "slider", label: "Combien d'heures conduis-tu par jour ?", min: 1, max: 12, step: 0.5, unit: "h", alwaysAnswered: true },
      { id: "t_siege", type: "choice", label: "Ton siège de conduite est-il réglable ?", options: [
        { value: "oui_regle", label: "✅ Oui, bien réglé" },
        { value: "oui_mal", label: "🔸 Oui, mais je sais pas régler" },
        { value: "non", label: "❌ Non" },
      ]},
      { id: "t_distance_volant", type: "choice", label: "La distance entre toi et le volant est-elle confortable ?", options: [
        { value: "oui", label: "✅ Oui" },
        { value: "approx", label: "🔸 À peu près" },
        { value: "trop_loin", label: "📏 Non, trop loin" },
        { value: "trop_pres", label: "📏 Non, trop près" },
      ]},
      { id: "t_lombaire", type: "choice", label: "As-tu un appui lombaire dans ton siège ?", options: [
        { value: "integre", label: "✅ Oui, intégré" },
        { value: "coussin", label: "🛋️ Oui, coussin ajouté" },
        { value: "non", label: "❌ Non" },
      ]},
    ],
  },
  {
    id: "cat-t2", title: "Douleurs en conduite", subtitle: "Douleurs liées à la position", emoji: "🩺",
    color: "#f09595", colorBg: "rgba(226,75,74,0.08)", colorBorder: "rgba(226,75,74,0.18)",
    selectedBg: "rgba(226,75,74,0.18)", selectedColor: "#f09595",
    requiredQ: ["t_doul_dos", "t_doul_nuque", "t_doul_jambes", "t_doul_quand", "t_fourmillements"],
    questions: [
      { id: "t_doul_dos", type: "painscale", label: "Douleur bas du dos" },
      { id: "t_doul_nuque", type: "painscale", label: "Douleur nuque" },
      { id: "t_doul_epaules", type: "painscale", label: "Douleur épaules" },
      { id: "t_doul_jambes", type: "painscale", label: "Douleur jambes / sciatique" },
      { id: "t_doul_quand", type: "choice", label: "Tes douleurs apparaissent ?", options: [
        { value: "debut", label: "🌅 Au début du trajet" },
        { value: "apres_2h", label: "⏰ Après 1-2h" },
        { value: "fin", label: "🌆 En fin de journée" },
        { value: "toujours", label: "🔄 Tout le temps" },
        { value: "pas", label: "✨ Pas de douleurs" },
      ]},
      { id: "t_fourmillements", type: "choice", label: "As-tu des fourmillements dans les jambes ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "toujours", label: "❌ Tout le temps" },
      ]},
    ],
  },
  {
    id: "cat-t3", title: "Pauses & posture route", subtitle: "Habitudes de conduite", emoji: "⏱️",
    color: "#f4a261", colorBg: "rgba(212,98,42,0.08)", colorBorder: "rgba(212,98,42,0.18)",
    selectedBg: "rgba(212,98,42,0.18)", selectedColor: "#f4a261",
    requiredQ: ["t_pauses", "t_que_pauses"],
    questions: [
      { id: "t_pauses", type: "choice", label: "Fais-tu des pauses régulières en conduite ?", options: [
        { value: "2h", label: "✅ Toutes les 2h" },
        { value: "3h", label: "🔸 Toutes les 3-4h" },
        { value: "rarement", label: "⚠️ Rarement" },
        { value: "jamais", label: "❌ Jamais" },
      ]},
      { id: "t_que_pauses", type: "choice", label: "Que fais-tu pendant tes pauses ?", options: [
        { value: "marche", label: "🚶 Marche" },
        { value: "etirements", label: "🧘 Étirements" },
        { value: "assis", label: "🪑 Rester assis" },
        { value: "telephone", label: "📱 Téléphone" },
      ]},
      { id: "t_regulateur", type: "choice", label: "Utilises-tu le régulateur de vitesse ?", options: [
        { value: "toujours", label: "✅ Oui, toujours" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "non", label: "❌ Non" },
      ]},
      { id: "t_vibrations", type: "choice", label: "As-tu des vibrations importantes ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "legeres", label: "🔸 Légères" },
        { value: "importantes", label: "⚠️ Importantes" },
      ]},
    ],
  },
  {
    id: "cat-t4", title: "Sommeil & fatigue route", subtitle: "Récupération essentielle", emoji: "🌙",
    color: "#74c69d", colorBg: "rgba(45,106,79,0.08)", colorBorder: "rgba(45,106,79,0.18)",
    selectedBg: "rgba(45,106,79,0.18)", selectedColor: "#74c69d",
    requiredQ: ["t_reveil", "t_somnolence"],
    questions: [
      { id: "t_sommeil", type: "slider", label: "Heures de sommeil par nuit", min: 4, max: 10, step: 0.5, unit: "h", alwaysAnswered: true },
      { id: "t_reveil", type: "choice", label: "Tu te réveilles comment ?", options: [
        { value: "repose", label: "😊 Reposé" },
        { value: "fatigue", label: "😐 Fatigué" },
        { value: "epuise", label: "😩 Épuisé" },
      ]},
      { id: "t_somnolence", type: "choice", label: "Ressens-tu de la somnolence en conduisant ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "🚨 Souvent (important pour la sécurité)" },
      ]},
    ],
  },
  {
    id: "cat-t5", title: "Stress & charge mentale", subtitle: "Pression et bien-être", emoji: "💭",
    color: "#a78bfa", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["t_stress", "t_pression", "t_ressenti"],
    questions: [
      { id: "t_stress", type: "choice", label: "Le trafic / les délais te stressent-ils ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "tres_souvent", label: "❌ Très souvent" },
      ]},
      { id: "t_pression", type: "choice", label: "Ressens-tu une pression sur tes horaires ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "legere", label: "🔸 Légère" },
        { value: "importante", label: "⚠️ Importante" },
        { value: "tres_forte", label: "❌ Très forte" },
      ]},
      { id: "t_ressenti", type: "wellbeing", label: "Comment tu te sens globalement ?" },
    ],
  },
];

// ─── MEDICAL profile ──────────────────────────────────────────────────────

export const MEDICAL_CATEGORIES: CategoryDef[] = [
  {
    id: "cat-m1", title: "Ton environnement de soin", subtitle: "Poste de travail médical", emoji: "🏥",
    color: "#74c69d", colorBg: "rgba(45,106,79,0.08)", colorBorder: "rgba(45,106,79,0.18)",
    selectedBg: "rgba(45,106,79,0.18)", selectedColor: "#74c69d",
    requiredQ: ["m_specialite", "m_position", "m_gardes"],
    questions: [
      { id: "m_specialite", type: "choice", label: "Quelle est ta spécialité ?", options: [
        { value: "infirmier", label: "💉 Infirmier(e)" },
        { value: "aide_soignant", label: "🤝 Aide-soignant(e)" },
        { value: "kine", label: "🏋️ Kinésithérapeute" },
        { value: "medecin", label: "👨‍⚕️ Médecin" },
        { value: "dentiste", label: "🦷 Dentiste / chirurgien" },
        { value: "autre", label: "🏥 Autre paramédical" },
      ]},
      { id: "m_position", type: "choice", label: "Tu es principalement ?", options: [
        { value: "debout", label: "🧍 Debout" },
        { value: "assis", label: "🪑 Assis" },
        { value: "les_deux", label: "🔀 Les deux selon les moments" },
      ]},
      { id: "m_h_shift", type: "slider", label: "Heures par shift de travail ?", min: 6, max: 14, step: 1, unit: "h", alwaysAnswered: true },
      { id: "m_gardes", type: "choice", label: "Fais-tu des gardes de nuit ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "toujours", label: "❌ C'est mon rythme habituel" },
      ]},
    ],
  },
  {
    id: "cat-m2", title: "Gestes de soin", subtitle: "Postures et manutention", emoji: "💪",
    color: "#f4a261", colorBg: "rgba(212,98,42,0.08)", colorBorder: "rgba(212,98,42,0.18)",
    selectedBg: "rgba(212,98,42,0.18)", selectedColor: "#f4a261",
    requiredQ: ["m_mobilisation", "m_courbe", "m_materiel"],
    questions: [
      { id: "m_mobilisation", type: "choice", label: "Fais-tu des mobilisations de patients ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "tres_souvent", label: "❌ Très souvent" },
      ]},
      { id: "m_courbe", type: "choice", label: "Travailles-tu souvent courbé sur un patient ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "tres_souvent", label: "❌ Très souvent" },
      ]},
      { id: "m_gestes_prec", type: "choice", label: "Fais-tu des gestes de précision répétitifs ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "toujours", label: "❌ Toute la journée" },
      ]},
      { id: "m_materiel", type: "choice", label: "Utilises-tu du matériel de manutention ?", options: [
        { value: "oui_toujours", label: "✅ Oui, toujours" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "rarement", label: "⚠️ Rarement" },
        { value: "pas_dispo", label: "❌ Pas disponible" },
      ]},
    ],
  },
  {
    id: "cat-m3", title: "Douleurs soignants", subtitle: "Zones critiques du soin", emoji: "🩺",
    color: "#f09595", colorBg: "rgba(226,75,74,0.08)", colorBorder: "rgba(226,75,74,0.18)",
    selectedBg: "rgba(226,75,74,0.18)", selectedColor: "#f09595",
    requiredQ: ["m_doul_dos", "m_doul_epaules", "m_doul_nuque"],
    questions: [
      { id: "m_doul_dos", type: "painscale", label: "Douleur bas du dos" },
      { id: "m_doul_epaules", type: "painscale", label: "Douleur épaules" },
      { id: "m_doul_poignets", type: "painscale", label: "Douleur poignets" },
      { id: "m_doul_nuque", type: "painscale", label: "Douleur nuque" },
      { id: "m_doul_jambes", type: "painscale", label: "Douleur jambes (si debout)" },
    ],
  },
  {
    id: "cat-m4", title: "Charge mentale", subtitle: "Burn-out et émotionnel", emoji: "🧠",
    color: "#a78bfa", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["m_charge_emo", "m_burnout"],
    questions: [
      { id: "m_charge_emo", type: "choice", label: "La charge émotionnelle de ton travail est ?", options: [
        { value: "legere", label: "😊 Légère" },
        { value: "moderee", label: "😐 Modérée" },
        { value: "importante", label: "😕 Importante" },
        { value: "tres_lourde", label: "😩 Très lourde" },
      ]},
      { id: "m_burnout", type: "choice", label: "Ressens-tu des signes de burn-out ?", options: [
        { value: "non", label: "✅ Non, ça va" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent — parler en est le premier pas" },
      ]},
      { id: "m_soutien", type: "choice", label: "As-tu du soutien psychologique au travail ?", options: [
        { value: "oui", label: "✅ Oui" },
        { value: "non_voudrait", label: "🔸 Non, mais j'en voudrais" },
        { value: "non_ok", label: "😊 Non, et ça va" },
      ]},
    ],
  },
  {
    id: "cat-m5", title: "Sommeil & récupération", subtitle: "Indispensable pour les soignants", emoji: "🌙",
    color: "#74c69d", colorBg: "rgba(45,106,79,0.08)", colorBorder: "rgba(45,106,79,0.18)",
    selectedBg: "rgba(45,106,79,0.18)", selectedColor: "#74c69d",
    requiredQ: ["m_reveil", "m_fatigue_chrono"],
    questions: [
      { id: "m_sommeil", type: "slider", label: "Heures de sommeil par nuit", min: 4, max: 10, step: 0.5, unit: "h", alwaysAnswered: true },
      { id: "m_reveil", type: "choice", label: "Tu te réveilles comment ?", options: [
        { value: "repose", label: "😊 Reposé" },
        { value: "fatigue", label: "😐 Fatigué" },
        { value: "epuise", label: "😩 Épuisé" },
      ]},
      { id: "m_fatigue_chrono", type: "choice", label: "Ressens-tu une fatigue chronique ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
      ]},
    ],
  },
  {
    id: "cat-m6", title: "Ressenti global", subtitle: "Ton bien-être général", emoji: "💭",
    color: "#a78bfa", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["m_ressenti_physique", "m_ressenti_mental"],
    questions: [
      { id: "m_ressenti_physique", type: "wellbeing", label: "Comment tu te sens physiquement ?" },
      { id: "m_ressenti_mental", type: "wellbeing", label: "Comment tu te sens mentalement ?" },
    ],
  },
];

// ─── ENSEIGNEMENT profile ─────────────────────────────────────────────────

export const ENSEIGNEMENT_CATEGORIES: CategoryDef[] = [
  {
    id: "cat-e1", title: "Ton environnement", subtitle: "Salle de classe et matériel", emoji: "🎓",
    color: "#f4a261", colorBg: "rgba(212,98,42,0.08)", colorBorder: "rgba(212,98,42,0.18)",
    selectedBg: "rgba(212,98,42,0.18)", selectedColor: "#f4a261",
    requiredQ: ["e_niveau", "e_position", "e_bureau"],
    questions: [
      { id: "e_niveau", type: "choice", label: "Tu enseignes ?", options: [
        { value: "primaire", label: "🎨 Primaire" },
        { value: "college", label: "📚 Collège" },
        { value: "lycee", label: "🏫 Lycée" },
        { value: "superieur", label: "🎓 Supérieur" },
        { value: "formation", label: "💼 Formation professionnelle" },
      ]},
      { id: "e_position", type: "choice", label: "Tu es principalement ?", options: [
        { value: "debout", label: "🧍 Debout" },
        { value: "assis", label: "🪑 Assis" },
        { value: "les_deux", label: "🔀 Les deux" },
      ]},
      { id: "e_tbi", type: "choice", label: "Ta salle est-elle équipée d'un tableau interactif ?", options: [
        { value: "oui", label: "✅ Oui, TBI" },
        { value: "non", label: "🖊️ Non, tableau classique" },
        { value: "les_deux", label: "🔀 Les deux" },
      ]},
      { id: "e_bureau", type: "choice", label: "As-tu un bureau assis pour travailler ?", options: [
        { value: "ergo", label: "✅ Oui, ergonomique" },
        { value: "standard", label: "🔸 Oui, standard" },
        { value: "non", label: "❌ Non, debout seulement" },
      ]},
    ],
  },
  {
    id: "cat-e2", title: "Voix & posture", subtitle: "Santé vocale et douleurs", emoji: "🎤",
    color: "#f09595", colorBg: "rgba(226,75,74,0.08)", colorBorder: "rgba(226,75,74,0.18)",
    selectedBg: "rgba(226,75,74,0.18)", selectedColor: "#f09595",
    requiredQ: ["e_voix", "e_doul_nuque", "e_doul_dos"],
    questions: [
      { id: "e_voix", type: "choice", label: "As-tu des problèmes de voix ?", options: [
        { value: "jamais", label: "✅ Jamais" },
        { value: "parfois", label: "🔸 Parfois, fatigue vocale" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "ortho", label: "🏥 J'ai consulté un orthophoniste" },
      ]},
      { id: "e_bruit", type: "choice", label: "Travailles-tu dans des classes bruyantes ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "toujours", label: "❌ Très souvent" },
      ]},
      { id: "e_doul_nuque", type: "painscale", label: "Douleur nuque" },
      { id: "e_doul_dos", type: "painscale", label: "Douleur dos" },
      { id: "e_doul_jambes", type: "painscale", label: "Douleur jambes (si debout)" },
    ],
  },
  {
    id: "cat-e3", title: "Charge de travail", subtitle: "Préparation et surcharge", emoji: "📚",
    color: "#7c3aed", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["e_prep_h", "e_prep_lieu", "e_surcharge"],
    questions: [
      { id: "e_prep_h", type: "choice", label: "Heures de préparation par semaine ?", options: [
        { value: "peu", label: "< 5h" },
        { value: "moyen", label: "5-10h" },
        { value: "beaucoup", label: "10-20h" },
        { value: "tres_bcp", label: "> 20h" },
      ]},
      { id: "e_prep_lieu", type: "choice", label: "Ces heures se font ?", options: [
        { value: "bureau_ergo", label: "✅ Bureau ergonomique" },
        { value: "table_cuisine", label: "🔸 Table de cuisine" },
        { value: "canape_lit", label: "⚠️ Canapé / lit" },
        { value: "mixte", label: "🔀 Mixte" },
      ]},
      { id: "e_surcharge", type: "choice", label: "Ressens-tu une surcharge de travail ?", options: [
        { value: "non", label: "✅ Non" },
        { value: "parfois", label: "🔸 Parfois" },
        { value: "souvent", label: "⚠️ Souvent" },
        { value: "burnout", label: "🚨 Signe de burn-out possible" },
      ]},
    ],
  },
  {
    id: "cat-e4", title: "Sommeil & ressenti", subtitle: "Récupération et bien-être", emoji: "🌙",
    color: "#74c69d", colorBg: "rgba(45,106,79,0.08)", colorBorder: "rgba(45,106,79,0.18)",
    selectedBg: "rgba(45,106,79,0.18)", selectedColor: "#74c69d",
    requiredQ: ["e_reveil", "e_ressenti"],
    questions: [
      { id: "e_sommeil", type: "slider", label: "Heures de sommeil par nuit", min: 4, max: 10, step: 0.5, unit: "h", alwaysAnswered: true },
      { id: "e_reveil", type: "choice", label: "Tu te réveilles comment ?", options: [
        { value: "repose", label: "😊 Reposé" },
        { value: "fatigue", label: "😐 Fatigué" },
        { value: "epuise", label: "😩 Épuisé" },
      ]},
      { id: "e_ressenti", type: "wellbeing", label: "Comment tu te sens globalement ?" },
    ],
  },
];

// ─── Profile registry ─────────────────────────────────────────────────────

export const PROFILE_CATEGORIES: Record<Exclude<JobType, "bureau">, CategoryDef[]> = {
  debout:       DEBOUT_CATEGORIES,
  artisan:      ARTISAN_CATEGORIES,
  transport:    TRANSPORT_CATEGORIES,
  medical:      MEDICAL_CATEGORIES,
  enseignement: ENSEIGNEMENT_CATEGORIES,
};

export const JOB_META: Record<JobType, { emoji: string; label: string }> = {
  bureau:       { emoji: "💻", label: "Bureau / télétravail" },
  debout:       { emoji: "🏪", label: "Commerce / restauration" },
  artisan:      { emoji: "🔧", label: "Artisan / terrain" },
  transport:    { emoji: "🚗", label: "Transport / mobilité" },
  medical:      { emoji: "🏥", label: "Médical / paramédical" },
  enseignement: { emoji: "🎓", label: "Enseignement / formation" },
};
