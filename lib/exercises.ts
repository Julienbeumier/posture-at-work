export interface Exercise {
  id: string;
  name: string;
  subtitle: string | null;
  zone: string;
  zoneColor: string;
  duration: number; // seconds
  reps: string;
  frequency: string;
  location: string[];
  difficulty: "facile" | "moyen" | "difficile";
  discreet: boolean;
  instruction: string;
  benefit: string;
  emoji: string;
  jobTypes?: string[]; // specific job profiles this exercise targets
}

export const EXERCISES: Record<string, Exercise> = {
  // ── Cervicales & Nuque ──
  chin_tuck: {
    id: "chin_tuck", name: "Rétraction cervicale", subtitle: "Chin Tuck",
    zone: "Nuque & cervicales", zoneColor: "#e24b4a", duration: 30,
    reps: "10 répétitions × 5 sec", frequency: "Toutes les heures",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🦆",
    instruction: "Assis dos droit, rentre doucement le menton vers la gorge sans baisser la tête. Imagine qu'on tire tes cheveux vers le plafond. Tiens 5 secondes, relâche. Tu dois sentir un léger étirement à la base du crâne.",
    benefit: "Corrige l'antépulsion de tête et soulage les cervicales",
  },
  neck_rotation: {
    id: "neck_rotation", name: "Rotation nuque", subtitle: null,
    zone: "Nuque & cervicales", zoneColor: "#e24b4a", duration: 40,
    reps: "5 rotations par côté", frequency: "3x par jour",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🔄",
    instruction: "Tourne lentement la tête vers la droite jusqu'au maximum confortable. Tiens 3 secondes. Reviens au centre. Fais l'autre côté. Mouvements lents et contrôlés uniquement.",
    benefit: "Libère les tensions de rotation cervicale",
  },
  neck_tilt: {
    id: "neck_tilt", name: "Inclinaison latérale nuque", subtitle: null,
    zone: "Nuque & cervicales", zoneColor: "#e24b4a", duration: 40,
    reps: "30 sec par côté", frequency: "Matin et soir",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "↔️",
    instruction: "Incline la tête vers l'épaule droite. Pose doucement la main droite sur la tête (sans tirer). Sens l'étirement dans le côté gauche du cou. Respire profondément.",
    benefit: "Étire les trapèzes supérieurs et scalènes",
  },
  trap_stretch: {
    id: "trap_stretch", name: "Étirement trapèze", subtitle: null,
    zone: "Nuque & cervicales", zoneColor: "#e24b4a", duration: 60,
    reps: "45 sec par côté", frequency: "Matin et soir",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🏔️",
    instruction: "Assis, place la main gauche sous ta fesse gauche pour ancrer l'épaule. Incline la tête à droite et légèrement en avant. Sens l'étirement profond dans le trapèze gauche. Change de côté.",
    benefit: "Relâche les trapèzes chroniquement contractés",
  },
  // ── Épaules & Dos haut ──
  chest_opener: {
    id: "chest_opener", name: "Ouverture pectorale en porte", subtitle: null,
    zone: "Épaules & poitrine", zoneColor: "#d4622a", duration: 60,
    reps: "30 sec par côté", frequency: "3x par jour",
    location: ["bureau", "maison"],
    difficulty: "facile", discreet: false, emoji: "🦅",
    instruction: "Debout dans l'encadrement d'une porte. Place l'avant-bras droit contre le montant (coude à 90°). Tourne doucement le corps vers la gauche jusqu'à sentir l'étirement dans le pectoral et l'épaule droite. Respire profondément.",
    benefit: "Compense l'enroulement des épaules dû au clavier",
  },
  thoracic_rotation: {
    id: "thoracic_rotation", name: "Rotation thoracique", subtitle: null,
    zone: "Dos haut & thorax", zoneColor: "#d4622a", duration: 40,
    reps: "8 rotations par côté", frequency: "3x par jour",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🌀",
    instruction: "Assis, croise les bras sur la poitrine. Tourne lentement le buste à droite en gardant les hanches fixes. Reviens au centre. Fais l'autre côté. Ne tourne que le thorax, pas les hanches.",
    benefit: "Libère les blocages thoraciques de la position assise",
  },
  scapular_retraction: {
    id: "scapular_retraction", name: "Rétraction scapulaire", subtitle: "Pincement omoplates",
    zone: "Épaules & dos haut", zoneColor: "#d4622a", duration: 30,
    reps: "15 répétitions × 3 sec", frequency: "Toutes les 2h",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🏹",
    instruction: "Assis droit, bras le long du corps. Pince les omoplates ensemble comme si tu voulais tenir un crayon entre elles. Tiens 3 secondes. Relâche complètement. Répète.",
    benefit: "Renforce les rhomboïdes et corrige l'enroulement",
  },
  shoulder_circles: {
    id: "shoulder_circles", name: "Rotation épaules", subtitle: null,
    zone: "Épaules", zoneColor: "#d4622a", duration: 30,
    reps: "10 cercles avant + 10 arrière", frequency: "Toutes les heures",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "⭕",
    instruction: "Pose les mains sur les épaules. Fais de grands cercles avec les coudes. 10 fois vers l'avant, 10 fois vers l'arrière. Amplitude maximale à chaque cercle.",
    benefit: "Débloque l'articulation scapulo-humérale",
  },
  // ── Dos bas & Lombaires ──
  lumbar_flexion: {
    id: "lumbar_flexion", name: "Flexion lombaire", subtitle: null,
    zone: "Bas du dos", zoneColor: "#7c3aed", duration: 60,
    reps: "45 sec × 2", frequency: "Toutes les 2h",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🌿",
    instruction: "Assis au bord de la chaise, penche-toi lentement vers l'avant, bras entre les jambes vers le sol. Laisse le dos s'arrondir naturellement. Respire profondément. Décompresse les disques lombaires.",
    benefit: "Décompresse les disques intervertébraux lombaires",
  },
  piriformis_stretch: {
    id: "piriformis_stretch", name: "Étirement piriforme", subtitle: "Cheville sur genou",
    zone: "Bas du dos & hanches", zoneColor: "#7c3aed", duration: 60,
    reps: "45 sec par côté", frequency: "Matin et soir",
    location: ["bureau", "maison"],
    difficulty: "facile", discreet: false, emoji: "🦋",
    instruction: "Assis, pose la cheville droite sur le genou gauche. Redresse le dos. Incline-toi légèrement en avant jusqu'à sentir l'étirement dans la fesse droite. Change de côté.",
    benefit: "Soulage la sciatique et les tensions des hanches",
  },
  cat_cow: {
    id: "cat_cow", name: "Cat-Cow assis", subtitle: null,
    zone: "Colonne vertébrale", zoneColor: "#7c3aed", duration: 40,
    reps: "10 cycles lents", frequency: "3x par jour",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🐱",
    instruction: "Assis au bord de la chaise, mains sur les genoux. Inspire en creusant le dos (cow). Expire en arrondissant le dos et rentrant le ventre (cat). Mouvements fluides et synchronisés à la respiration.",
    benefit: "Mobilise toute la colonne et libère les blocages",
  },
  lumbar_extension: {
    id: "lumbar_extension", name: "Extension lombaire debout", subtitle: null,
    zone: "Bas du dos", zoneColor: "#7c3aed", duration: 30,
    reps: "10 extensions douces", frequency: "Toutes les 2h",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🏹",
    instruction: "Debout, place les mains dans le bas du dos. Pousse doucement les hanches vers l'avant en regardant légèrement vers le haut. Tiens 2 secondes. Reviens. Compense la flexion prolongée en position assise.",
    benefit: "Contre la flexion prolongée de la position assise",
  },
  // ── Poignets & Avant-bras ──
  wrist_flexor: {
    id: "wrist_flexor", name: "Étirement fléchisseurs poignet", subtitle: null,
    zone: "Poignets & avant-bras", zoneColor: "#2d6a4f", duration: 40,
    reps: "30 sec par côté", frequency: "Toutes les 2h",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🖐️",
    instruction: "Bras tendu devant toi, paume vers le haut. Avec l'autre main, tire doucement les doigts vers le bas. Sens l'étirement dans l'avant-bras. Change de côté. Essentiel pour prévenir le syndrome du canal carpien.",
    benefit: "Prévient le syndrome du canal carpien",
  },
  wrist_rotation: {
    id: "wrist_rotation", name: "Rotation poignet", subtitle: null,
    zone: "Poignets", zoneColor: "#2d6a4f", duration: 20,
    reps: "10 cercles par côté", frequency: "Toutes les heures",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "⭕",
    instruction: "Ferme le poing doucement. Fais de grands cercles avec le poignet — 10 dans un sens, 10 dans l'autre. Amplitude maximale. Les deux poignets.",
    benefit: "Lubrifie l'articulation du poignet",
  },
  shake_out: {
    id: "shake_out", name: "Shake-out mains", subtitle: "Secouement mains",
    zone: "Mains & poignets", zoneColor: "#2d6a4f", duration: 15,
    reps: "15 secondes", frequency: "Toutes les heures",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: false, emoji: "✋",
    instruction: "Lève les mains devant toi et secoue-les vigoureusement pendant 15 secondes comme si tu voulais faire tomber de l'eau. Relâche toute tension accumulée.",
    benefit: "Relâche instantanément la tension des extenseurs",
  },
  forearm_massage: {
    id: "forearm_massage", name: "Automassage avant-bras", subtitle: null,
    zone: "Avant-bras", zoneColor: "#2d6a4f", duration: 40,
    reps: "20 sec par bras", frequency: "Midi et soir",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: true, emoji: "💆",
    instruction: "Avec le pouce de la main opposée, masse l'avant-bras en remontant du poignet vers le coude. Appuie sur les zones tendues. Fais des petits cercles sur les points douloureux.",
    benefit: "Libère les tensions des muscles fléchisseurs",
  },
  // ── Corps entier & Mobilité ──
  chair_squat: {
    id: "chair_squat", name: "Squat chaise", subtitle: "Assis-debout",
    zone: "Corps entier", zoneColor: "#2b5ce6", duration: 45,
    reps: "10 répétitions", frequency: "Toutes les 2h",
    location: ["bureau", "maison"],
    difficulty: "facile", discreet: false, emoji: "🏋️",
    instruction: "Debout devant ta chaise, pieds à largeur d'épaules. Descends lentement comme pour t'asseoir mais sans toucher la chaise. Remonte. Si trop difficile, touche juste la chaise avant de remonter.",
    benefit: "Active la circulation et renforce les jambes",
  },
  marching: {
    id: "marching", name: "Marche sur place", subtitle: "Genoux hauts",
    zone: "Corps entier", zoneColor: "#2b5ce6", duration: 30,
    reps: "20 pas (10 par côté)", frequency: "Toutes les heures",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🚶",
    instruction: "Debout, marche sur place en montant les genoux à hauteur des hanches. Balancement naturel des bras. Rythme modéré. Relance la circulation après une longue période assise.",
    benefit: "Relance la circulation en 30 secondes",
  },
  calf_stretch: {
    id: "calf_stretch", name: "Étirement mollets", subtitle: null,
    zone: "Mollets & chevilles", zoneColor: "#2b5ce6", duration: 40,
    reps: "30 sec par côté", frequency: "Matin et soir",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🦵",
    instruction: "Debout, fais un grand pas en avant. Plie le genou avant, garde le genou arrière tendu, talon arrière au sol. Sens l'étirement dans le mollet arrière. Change de côté.",
    benefit: "Prévient les crampes et améliore la circulation",
  },
  lateral_flexion: {
    id: "lateral_flexion", name: "Flexion latérale debout", subtitle: null,
    zone: "Flancs & colonne", zoneColor: "#2b5ce6", duration: 40,
    reps: "30 sec par côté", frequency: "3x par jour",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🌲",
    instruction: "Debout, lève le bras droit au-dessus de la tête. Incline-toi lentement vers la gauche en gardant les hanches fixes. Sens l'étirement sur tout le côté droit. Change de côté.",
    benefit: "Libère les tensions latérales de la colonne",
  },
  // ── Yeux & Vision ──
  rule_20_20_20: {
    id: "rule_20_20_20", name: "Règle 20-20-20", subtitle: "Repos oculaire",
    zone: "Yeux & vision", zoneColor: "#1d9e75", duration: 20,
    reps: "20 secondes", frequency: "Toutes les 20 min",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "👁️",
    instruction: "Toutes les 20 minutes, pose les yeux sur un objet à au moins 6 mètres (fenêtre, mur lointain). Regarde sans forcer pendant 20 secondes. Cligne des yeux plusieurs fois. Relâche la tension oculaire accumulée.",
    benefit: "Réduit la fatigue visuelle de 40%",
  },
  palming: {
    id: "palming", name: "Palming yeux", subtitle: null,
    zone: "Yeux & vision", zoneColor: "#1d9e75", duration: 30,
    reps: "30 secondes", frequency: "3x par jour",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🤲",
    instruction: "Frotte tes paumes énergiquement pendant 5 secondes pour les réchauffer. Pose-les doucement en coupe sur tes yeux fermés sans appuyer. Sens la chaleur et l'obscurité totale. Respire lentement.",
    benefit: "Relaxe profondément les muscles oculaires",
  },
  eye_movements: {
    id: "eye_movements", name: "Mouvements oculaires", subtitle: null,
    zone: "Yeux & vision", zoneColor: "#1d9e75", duration: 30,
    reps: "5 directions × 3 sec", frequency: "Matin et soir",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "👀",
    instruction: "Sans bouger la tête, dirige le regard vers le haut, tiens 3 sec. Puis bas, gauche, droite, et en diagonale. Termine par 5 grands cercles dans chaque sens. Yeux ouverts, mouvements lents.",
    benefit: "Mobilise tous les muscles oculomoteurs",
  },
  // ── Renforcement postural ──
  seated_core: {
    id: "seated_core", name: "Gainage assis", subtitle: "Core isométrique",
    zone: "Abdominaux & posture", zoneColor: "#d4622a", duration: 30,
    reps: "10 sec × 5 répétitions", frequency: "3x par jour",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "moyen", discreet: true, emoji: "💪",
    instruction: "Assis droit, inspire. En expirant, rentre le ventre comme pour toucher ta colonne avec ton nombril. Tiens en respirant normalement 10 secondes. Relâche. Invisible pour les collègues.",
    benefit: "Renforce le transverse et stabilise la colonne",
  },
  superman_seated: {
    id: "superman_seated", name: "Superman assis", subtitle: null,
    zone: "Dos haut & posture", zoneColor: "#d4622a", duration: 30,
    reps: "10 répétitions × 3 sec", frequency: "2x par jour",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🦸",
    instruction: "Assis, tends les bras devant toi à hauteur d'épaules. Ouvre-les en croix en pinçant les omoplates. Tourne légèrement les pouces vers le haut. Tiens 3 secondes. Reviens. Comme si tu voulais embrasser la pièce.",
    benefit: "Renforce les rhomboïdes et correcteurs de posture",
  },
  neck_massage: {
    id: "neck_massage", name: "Automassage nuque", subtitle: null,
    zone: "Nuque & trapèzes", zoneColor: "#e24b4a", duration: 40,
    reps: "40 secondes", frequency: "Midi et soir",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🤲",
    instruction: "Place les deux mains à la base du crâne. Avec les pouces, fais des petits cercles de chaque côté de la colonne cervicale. Descends progressivement vers les épaules. Appuie sur les zones tendues.",
    benefit: "Libère les tensions sous-occipitales",
  },
  tapping: {
    id: "tapping", name: "Tapping épaules", subtitle: null,
    zone: "Épaules & trapèzes", zoneColor: "#d4622a", duration: 20,
    reps: "20 secondes", frequency: "Toutes les heures",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: false, emoji: "🥁",
    instruction: "Avec les doigts détendus, tapote légèrement le haut de l'épaule droite avec la main gauche. Couvre toute la zone épaule-trapèze. Change de côté. Les tapotements réveillent la circulation locale.",
    benefit: "Stimule la circulation et relâche les trapèzes",
  },
  // ── Respiration & Mental ──
  coherence_cardiaque: {
    id: "coherence_cardiaque", name: "Cohérence cardiaque", subtitle: "Respiration 4-4-4-4",
    zone: "Stress & mental", zoneColor: "#a78bfa", duration: 120,
    reps: "2 minutes (6 cycles)", frequency: "3x par jour idéalement",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "💜",
    instruction: "Inspire par le nez pendant 4 secondes. Retiens 4 secondes. Expire par la bouche pendant 4 secondes. Retiens 4 secondes. Répète 6 fois. Réduit le cortisol en 2 minutes.",
    benefit: "Réduit le cortisol de 20% en 2 minutes",
  },
  body_scan: {
    id: "body_scan", name: "Body scan rapide", subtitle: null,
    zone: "Stress & mental", zoneColor: "#a78bfa", duration: 120,
    reps: "2 minutes", frequency: "Matin et soir",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🧘",
    instruction: "Ferme les yeux. Porte ton attention sur les pieds — sont-ils contractés ? Remonte progressivement : mollets, genoux, hanches, ventre, thorax, épaules, nuque, visage. À chaque zone, relâche consciemment la tension.",
    benefit: "Prend conscience des tensions pour mieux les relâcher",
  },

  // ── Debout spécifiques ───────────────────────────────────────────────────
  short_foot: {
    id: "short_foot", name: "Short foot", subtitle: "Renforcement voûte plantaire",
    zone: "Pieds & voûte plantaire", zoneColor: "#e24b4a", duration: 30,
    reps: "10 répétitions × 3 sec", frequency: "3x par jour",
    location: ["debout", "bureau", "maison"],
    difficulty: "moyen", discreet: true, emoji: "🦶",
    instruction: "Assis ou debout, essaie de raccourcir ton pied en rapprochant la tête des métatarses du talon, SANS fléchir les orteils. La voûte plantaire se soulève légèrement. Tiens 3 secondes. Relâche. L'exercice le plus efficace pour protéger la voûte plantaire.",
    benefit: "Renforce les muscles intrinsèques et protège la voûte plantaire",
    jobTypes: ["debout", "artisan", "transport"],
  },
  calf_raise_excentric: {
    id: "calf_raise_excentric", name: "Mollet excentrique", subtitle: "Protocole Alfredson modifié",
    zone: "Mollets & tendon d'Achille", zoneColor: "#e24b4a", duration: 45,
    reps: "15 répétitions lentes", frequency: "2x par jour",
    location: ["debout", "maison"],
    difficulty: "moyen", discreet: false, emoji: "🦵",
    instruction: "Debout sur une marche (avant-pied). Monte sur les deux pieds (2 sec). En haut, soulève le pied sain — redescends lentement sur le pied travaillé uniquement (4 sec). La phase de descente est la plus importante. Renforce mollet ET fascia plantaire.",
    benefit: "Protocole validé contre les douleurs au talon et tendinopathie achilléenne",
    jobTypes: ["debout"],
  },
  fascia_stretch_morning: {
    id: "fascia_stretch_morning", name: "Étirement fascia matin", subtitle: "Avant le premier pas",
    zone: "Fascia plantaire", zoneColor: "#e24b4a", duration: 30,
    reps: "10 × 10 sec", frequency: "Chaque matin avant de se lever",
    location: ["maison"],
    difficulty: "facile", discreet: true, emoji: "🛏️",
    instruction: "Assis au bord du lit, croise le pied douloureux sur le genou. Attrape les orteils et tire-les vers toi. Tu dois sentir l'étirement sous le pied. Tiens 10 secondes. Répète 10 fois AVANT de poser le pied au sol. Réduit la douleur du premier pas de 75%.",
    benefit: "Réduit les douleurs au talon le matin de 75%",
    jobTypes: ["debout"],
  },
  leg_elevation: {
    id: "leg_elevation", name: "Surélévation des jambes", subtitle: "Drainage veineux",
    zone: "Jambes & circulation", zoneColor: "#2d6a4f", duration: 1200,
    reps: "20 minutes", frequency: "Chaque soir après le travail",
    location: ["maison"],
    difficulty: "facile", discreet: false, emoji: "🧘",
    instruction: "Allongé sur le dos. Place tes jambes à 45° contre un mur ou sur des coussins empilés. Les pieds doivent être au-dessus du niveau du cœur. Reste ainsi 20 minutes. Écoute un podcast, lis. Draine activement les œdèmes et soulage l'insuffisance veineuse.",
    benefit: "Draine les œdèmes et prévient les varices professionnelles",
    jobTypes: ["debout", "medical"],
  },
  toe_spreading: {
    id: "toe_spreading", name: "Écartement des orteils", subtitle: "Mobilité du pied",
    zone: "Pieds & orteils", zoneColor: "#e24b4a", duration: 20,
    reps: "10 répétitions", frequency: "Matin et soir",
    location: ["maison", "bureau"],
    difficulty: "facile", discreet: false, emoji: "🦶",
    instruction: "Assis, pieds nus. Essaie d'écarter les orteils le plus possible. Tiens 3 secondes. Puis soulève uniquement le gros orteil en gardant les autres au sol. Puis l'inverse. Réveille les muscles intrinsèques du pied atrophiés par les chaussures.",
    benefit: "Réactive les muscles du pied et protège la voûte plantaire",
    jobTypes: ["debout"],
  },
  plantar_massage: {
    id: "plantar_massage", name: "Auto-massage plantaire", subtitle: "Balle ou bouteille",
    zone: "Voûte plantaire", zoneColor: "#e24b4a", duration: 120,
    reps: "2 min par pied", frequency: "Soir après travail",
    location: ["maison", "bureau"],
    difficulty: "facile", discreet: false, emoji: "⚾",
    instruction: "Assis, pose le pied sur une balle de tennis ou une bouteille d'eau. Roule lentement toute la voûte plantaire du talon vers les orteils. Insiste sur les zones tendues. En phase aiguë : utilise une bouteille d'eau GLACÉE — anti-inflammatoire et massage simultanément.",
    benefit: "Relâche les tensions du fascia et réduit l'inflammation",
    jobTypes: ["debout"],
  },

  // ── Mobilisation neurale ──
  ulnt_soft: {
    id: "ulnt_soft", name: "Mobilisation neurale bras", subtitle: "ULNT doux",
    zone: "Bras & nerfs cervicaux", zoneColor: "#a78bfa", duration: 40,
    reps: "5 répétitions lentes par côté", frequency: "2× par jour — sans douleur",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: true, emoji: "💫",
    instruction: "Bras tendu sur le côté à l'horizontale, paume vers le haut. Penche doucement la tête vers l'épaule OPPOSÉE. Sens l'étirement dans le bras. Si douleur électrique ou choc, arrête immédiatement. Tiens 3 secondes, relâche.",
    benefit: "Mobilise le nerf médian — soulage les compressions cervicales",
    jobTypes: ["bureau"],
  },
  slump_soft: {
    id: "slump_soft", name: "Mobilisation neurale jambe", subtitle: "Slump doux",
    zone: "Jambe & nerf sciatique", zoneColor: "#a78bfa", duration: 40,
    reps: "5 répétitions par jambe", frequency: "2× par jour — douceur absolue",
    location: ["bureau", "maison"],
    difficulty: "facile", discreet: false, emoji: "🦵",
    instruction: "Assis au bord de ta chaise, dos légèrement arrondi. Tends une jambe vers l'avant, orteil vers toi (pied en flexion). Sens l'étirement dans l'arrière de la jambe. Maintiens 3 secondes. Relâche et plie le genou. Change de jambe. STOP si douleur électrique.",
    benefit: "Libère le nerf sciatique — réduit les douleurs de jambe",
    jobTypes: ["bureau", "debout"],
  },

  // ── Poignets & mains ──
  wrist_stretch: {
    id: "wrist_stretch", name: "Étirement poignets", subtitle: "Prévention canal carpien",
    zone: "Poignets & mains", zoneColor: "#f4a261", duration: 60,
    reps: "30 sec par côté × 2", frequency: "Après chaque heure de clavier",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🖐️",
    instruction: "Tends le bras devant toi, paume vers le bas. Avec l'autre main, tire doucement les doigts vers toi (paume en flexion) pendant 15 sec. Puis retourne la paume vers le haut et tire les doigts vers le bas pendant 15 sec. Change de bras.",
    benefit: "Prévient le syndrome du canal carpien",
    jobTypes: ["bureau"],
  },

  // ── Yeux ──
  eye_rest: {
    id: "eye_rest", name: "Repos oculaire 20-20-20", subtitle: "Fatigue visuelle",
    zone: "Yeux & vision", zoneColor: "#74c69d", duration: 20,
    reps: "20 secondes toutes les 20 min", frequency: "Toutes les 20 minutes",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: true, emoji: "👁️",
    instruction: "Toutes les 20 minutes, détourne le regard de l'écran. Fixe un point à au moins 6 mètres (fenêtre, mur lointain). Garde ce point fixé pendant 20 secondes. Cligne des yeux lentement 5 fois pour hydrater.",
    benefit: "Réduit la fatigue oculaire et les maux de tête de 35%",
    jobTypes: ["bureau"],
  },

  // ── Activité générale ──
  active_walk: {
    id: "active_walk", name: "Marche active", subtitle: null,
    zone: "Corps entier", zoneColor: "#1d9e75", duration: 300,
    reps: "5 à 10 minutes", frequency: "Après chaque heure de travail",
    location: ["bureau", "maison", "deplacement"],
    difficulty: "facile", discreet: false, emoji: "🚶",
    instruction: "Lève-toi et marche à rythme soutenu — couloir, escalier, dehors peu importe. Bras qui balancent naturellement, regard droit devant. L'objectif est d'augmenter légèrement ton rythme cardiaque et de sortir de la position assise.",
    benefit: "Relance la circulation, décompresse les disques lombaires",
    jobTypes: ["bureau"],
  },
  abdo_breathing: {
    id: "abdo_breathing", name: "Respiration abdominale", subtitle: "Anti-stress",
    zone: "Respiration & système nerveux", zoneColor: "#a78bfa", duration: 120,
    reps: "2 minutes", frequency: "En pause ou en cas de tension",
    location: ["bureau", "maison", "voiture", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🌬️",
    instruction: "Pose une main à plat sur le ventre, une autre sur la poitrine. Inspire lentement par le nez en 4 secondes — seul le ventre doit se soulever, la main sur la poitrine reste immobile. Expire doucement par la bouche en 6 secondes. La main sur la poitrine ne doit pas bouger.",
    benefit: "Active le système parasympathique — réduit cortisol et tensions musculaires",
    jobTypes: ["bureau", "debout"],
  },

  // ── Rétraction scapulaire (alias) ──
  shoulder_blade: {
    id: "shoulder_blade", name: "Pincement d'omoplates", subtitle: "Posture épaules",
    zone: "Épaules & dos haut", zoneColor: "#d4622a", duration: 45,
    reps: "15 répétitions × 3 sec", frequency: "3× par jour",
    location: ["bureau", "maison", "voyage"],
    difficulty: "facile", discreet: true, emoji: "🏹",
    instruction: "Assis bien droit, bras naturellement le long du corps. Rapproche lentement les deux omoplates vers la colonne vertébrale, comme si tu voulais tenir un crayon entre elles. Tiens 3 secondes en respirant normalement. Relâche complètement. Sens la différence entre contracté et relâché.",
    benefit: "Renforce les rhomboïdes et corrige l'enroulement postural",
    jobTypes: ["bureau"],
  },
};

// ─── Programs ─────────────────────────────────────────────────────────────────

export interface Program {
  id: string;
  label: string;
  icon: string;
  duration: string;
  exerciseIds: string[];
  description: string;
  tab: "bureau" | "maison" | "deplacement" | "pour_moi";
}

export const PROGRAMS: Program[] = [
  {
    id: "bureau_express",
    label: "Express", icon: "⚡", duration: "2 min", tab: "bureau",
    description: "3 exercices discrets, sans quitter ton bureau",
    exerciseIds: ["chin_tuck", "scapular_retraction", "coherence_cardiaque"],
  },
  {
    id: "bureau_pause",
    label: "Pause active", icon: "🎯", duration: "8 min", tab: "bureau",
    description: "6 exercices pour une vraie coupure musculaire",
    exerciseIds: ["chin_tuck", "thoracic_rotation", "lumbar_extension", "wrist_flexor", "rule_20_20_20", "coherence_cardiaque", "wrist_stretch", "eye_rest"],
  },
  {
    id: "maison_reveil",
    label: "Réveil actif", icon: "🌅", duration: "10 min", tab: "maison",
    description: "7 exercices pour bien démarrer la journée",
    exerciseIds: ["cat_cow", "chest_opener", "lumbar_flexion", "piriformis_stretch", "lateral_flexion", "calf_stretch", "body_scan"],
  },
  {
    id: "maison_recup",
    label: "Récupération soir", icon: "🌙", duration: "12 min", tab: "maison",
    description: "8 exercices pour relâcher toutes les tensions",
    exerciseIds: ["neck_tilt", "trap_stretch", "lumbar_flexion", "piriformis_stretch", "wrist_flexor", "forearm_massage", "neck_massage", "coherence_cardiaque", "abdo_breathing"],
  },
  {
    id: "deplacement_voiture",
    label: "En voiture", icon: "🚗", duration: "5 min", tab: "deplacement",
    description: "5 exercices assis, moteur à l'arrêt",
    exerciseIds: ["chin_tuck", "neck_rotation", "scapular_retraction", "seated_core", "coherence_cardiaque"],
  },
  {
    id: "deplacement_voyage",
    label: "En voyage", icon: "✈️", duration: "8 min", tab: "deplacement",
    description: "8 exercices pour les longs trajets",
    exerciseIds: ["chin_tuck", "shoulder_circles", "thoracic_rotation", "wrist_rotation", "shake_out", "marching", "rule_20_20_20", "coherence_cardiaque"],
  },
  {
    id: "debout_recovery",
    label: "Récupération debout", icon: "🏪", duration: "15 min", tab: "maison",
    description: "Programme du soir après une journée debout",
    exerciseIds: ["fascia_stretch_morning", "calf_raise_excentric", "leg_elevation", "plantar_massage", "short_foot", "toe_spreading"],
  },
  {
    id: "debout_pause",
    label: "Pause active debout", icon: "⚡", duration: "3 min", tab: "bureau",
    description: "À faire pendant ton service toutes les 2h",
    exerciseIds: ["calf_raise_excentric", "marching", "wrist_rotation", "short_foot"],
  },
];

export const TARGETED_PROGRAMS: Program[] = [
  {
    id: "cible_cervicales",
    label: "Nuque & cervicales", icon: "🔴", duration: "~6 min", tab: "pour_moi",
    description: "Programme ciblé pour tes douleurs cervicales",
    exerciseIds: ["chin_tuck", "neck_rotation", "neck_tilt", "trap_stretch", "ulnt_soft"],
  },
  {
    id: "cible_lombaires",
    label: "Bas du dos", icon: "🟣", duration: "~6 min", tab: "pour_moi",
    description: "Programme ciblé pour tes douleurs lombaires",
    exerciseIds: ["lumbar_flexion", "piriformis_stretch", "cat_cow", "lumbar_extension"],
  },
  {
    id: "cible_epaules",
    label: "Épaules & poignets", icon: "🟠", duration: "~5 min", tab: "pour_moi",
    description: "Programme ciblé pour épaules et poignets",
    exerciseIds: ["chest_opener", "scapular_retraction", "wrist_flexor", "forearm_massage"],
  },
  {
    id: "cible_sommeil",
    label: "Sommeil & récupération", icon: "🌙", duration: "~7 min", tab: "pour_moi",
    description: "Programme pour améliorer ton sommeil",
    exerciseIds: ["body_scan", "coherence_cardiaque", "neck_massage", "lumbar_flexion"],
  },
  {
    id: "general",
    label: "Programme général", icon: "🎯", duration: "~8 min", tab: "pour_moi",
    description: "Programme complet équilibré recommandé",
    exerciseIds: ["chin_tuck", "thoracic_rotation", "lumbar_flexion", "wrist_flexor", "coherence_cardiaque", "rule_20_20_20"],
  },
];

export const WEEKLY_CHALLENGES = [
  { id: "c1", label: "5 jours de pause express sans exception", goal: 5, badge: "🏆 Maître de la pause" },
  { id: "c2", label: "Cohérence cardiaque chaque matin pendant 7 jours", goal: 7, badge: "💜 Maître du souffle" },
  { id: "c3", label: "Règle 20-20-20 toute la semaine", goal: 7, badge: "👁️ Protecteur des yeux" },
  { id: "c4", label: "Programme complet 3 fois cette semaine", goal: 3, badge: "🦸 Champion de la mobilité" },
  { id: "c5", label: "Mode discret au bureau tous les jours", goal: 5, badge: "🤫 Expert discret" },
];
