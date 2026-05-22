export type JobType = "bureau" | "debout" | "artisan" | "transport" | "medical" | "enseignement";

export interface JobExercise {
  id: string;
  name: string;
  target: string;
  duration: string;
  frequency: string;
  instruction: string;
  when: string;
}

export interface JobProduct {
  name: string;
  reason: string;
  priority: "haute" | "moyenne" | "premium";
  url: string;
  trigger: string;
}

export interface ScoreInterpretation {
  critical: string;
  attention: string;
  good: string;
}

export interface PriorityAction {
  title: string;
  why: string;
  how: string;
  impact: string;
}

export interface JobData {
  label: string;
  emoji: string;
  intro: string;
  risk_profile: {
    main_risks: string[];
    did_you_know: string[];
  };
  score_interpretations: Record<string, ScoreInterpretation>;
  priority_actions: Record<string, PriorityAction[]>;
  exercises: JobExercise[];
  tips: string[];
  products: JobProduct[];
}

export const JOB_CONTENT: Record<JobType, JobData> = {

  // ── BUREAU ────────────────────────────────────────────────────────────────
  bureau: {
    label: "Bureau / télétravail",
    emoji: "💻",
    intro: "Le travail de bureau est l'une des activités les plus sous-estimées en termes de risques physiques. L'immobilité prolongée est plus dangereuse que la plupart des travaux physiques légers.",
    risk_profile: {
      main_risks: [
        "Syndrome de la tête en avant (forward head posture)",
        "Syndrome du canal carpien",
        "Lombalgies chroniques par compression discale",
        "Syndrome de l'épaule douloureuse",
        "Fatigue visuelle chronique",
        "Troubles métaboliques liés à la sédentarité",
      ],
      did_you_know: [
        "Rester assis 8h brûle moins de calories que dormir 8h debout",
        "La compression discale lombaire est 40% plus élevée assis que debout",
        "Un écran trop bas pendant 8h équivaut à porter un enfant de 12kg sur la nuque",
        "Le travail sur laptop seul est la configuration la plus risquée pour la colonne",
      ],
    },
    score_interpretations: {
      setup: {
        critical: "Ton setup est critique. En tant que travailleur de bureau, ton environnement physique est ta première source de douleurs. Un mauvais écran, une chaise inadaptée ou un laptop sans support créent des contraintes posturales permanentes que ton corps subit 8h par jour.",
        attention: "Ton setup a des failles importantes. Plusieurs éléments de ton environnement créent des tensions posturales que tu ne ressens peut-être pas encore — mais qui s'accumulent chaque jour.",
        good: "Ton setup est bien configuré. Continue à le maintenir et vérifie régulièrement que rien n'a bougé (hauteur écran, distance, positionnement clavier).",
      },
      pain: {
        critical: "Tes douleurs sont significatives et installées. Pour un travailleur de bureau, ce niveau indique que ton corps a absorbé des contraintes posturales depuis trop longtemps. Une consultation chez un kinésithérapeute est fortement recommandée.",
        attention: "Tu as des douleurs modérées typiques du travail de bureau. Elles sont encore réversibles avec les bons changements — mais sans action, elles s'aggraveront progressivement.",
        good: "Tu n'as pas de douleurs significatives. C'est le meilleur moment pour agir en prévention — beaucoup plus facile que traiter des douleurs installées.",
      },
      habits: {
        critical: "Tu bouges beaucoup trop peu. Rester assis plus de 6h sans pause active est associé à des risques cardiovasculaires et musculo-squelettiques indépendamment de ton activité physique par ailleurs.",
        attention: "Tes habitudes de mouvement sont insuffisantes pour compenser ta sédentarité professionnelle.",
        good: "Tu gères bien tes pauses et ton mouvement. C'est l'une des habitudes les plus protectrices pour un travailleur de bureau.",
      },
      sleep_energy: {
        critical: "Ton sommeil et ton énergie sont très insuffisants. La fatigue amplifie la perception de la douleur et favorise l'affaissement postural — tu te tiens moins bien quand tu es épuisé.",
        attention: "Ton sommeil et ton énergie méritent attention. La qualité de récupération impacte directement ta posture et ta résistance aux TMS.",
        good: "Tu récupères bien. C'est un facteur protecteur important souvent sous-estimé.",
      },
      nutrition: {
        critical: "Ton alimentation impacte directement ton énergie et ta posture. Les pics glycémiques créent des crashes qui se traduisent par un affaissement progressif en cours de journée.",
        attention: "Quelques ajustements nutritionnels amélioreraient significativement ton énergie et ta concentration.",
        good: "Ton alimentation soutient bien ton énergie. Continue ainsi.",
      },
    },
    priority_actions: {
      setup_critical: [
        { title: "Surélève ton écran aujourd'hui", why: "Le haut de l'écran doit être à hauteur des yeux. Chaque centimètre trop bas ajoute des kilos de charge sur ta nuque.", how: "Utilise des livres, une boîte ou un support écran. Tu dois regarder droit devant toi, pas vers le bas.", impact: "Réduit la tension cervicale de 60% immédiatement" },
        { title: "Abandonne le laptop seul", why: "Il est physiquement impossible d'avoir une bonne posture sur laptop seul.", how: "Connecte un clavier externe et surélève le laptop, ou branche un écran externe.", impact: "Élimine la source principale de tension cervicale" },
        { title: "Règle ta chaise", why: "La hauteur de chaise détermine tout le reste de ta posture.", how: "Pieds à plat au sol, genoux à 90°, coudes à hauteur du bureau.", impact: "Réduit la compression lombaire de 30%" },
      ],
      pain_critical: [
        { title: "Lève-toi maintenant et marche 2 minutes", why: "La compression discale diminue immédiatement lors du mouvement.", how: "Lève-toi, marche dans la pièce, fais quelques rotations du buste. 2 minutes suffisent.", impact: "Décompression discale immédiate" },
        { title: "Programme une alarme toutes les heures", why: "Au-delà de 50 minutes assis, la compression discale et la tension musculaire augmentent exponentiellement.", how: "À chaque alarme : lever, 2 min de mouvement minimum.", impact: "Réduit de 40% l'accumulation de tension journalière" },
      ],
    },
    exercises: [
      { id: "bureau_chin_tuck", name: "Rétraction cervicale", target: "Nuque & cervicales", duration: "30 sec × 10 reps", frequency: "Toutes les heures", instruction: "Rentre le menton vers la gorge sans baisser la tête. Tiens 3 secondes. Contre directement la projection de tête en avant.", when: "pain_score < 60 || setup_score < 60" },
      { id: "bureau_scapular", name: "Rétraction scapulaire", target: "Épaules & dos haut", duration: "15 reps × 3 sec", frequency: "Toutes les 2h", instruction: "Pince les omoplates ensemble comme pour tenir un crayon entre elles. Tiens 3 secondes. Contre l'enroulement des épaules.", when: "always" },
      { id: "bureau_lumbar", name: "Flexion lombaire assise", target: "Bas du dos", duration: "45 sec × 2", frequency: "Toutes les 2h", instruction: "Assis, penche-toi vers l'avant bras entre les jambes. Laisse le dos s'arrondir. Décompresse les disques lombaires.", when: "pain_score < 70" },
      { id: "bureau_eyes", name: "Règle 20-20-20", target: "Yeux & vision", duration: "20 secondes", frequency: "Toutes les 20 min", instruction: "Regarde à 6 mètres pendant 20 secondes. Cligne des yeux plusieurs fois. Réduit la fatigue visuelle de 40%.", when: "always" },
      { id: "bureau_wrist", name: "Étirement poignets", target: "Poignets & avant-bras", duration: "30 sec par côté", frequency: "Toutes les 2h", instruction: "Bras tendu, tire les doigts vers le bas avec l'autre main. Prévient le syndrome du canal carpien.", when: "pain_score < 60" },
    ],
    tips: [
      "L'écran doit être à une longueur de bras — ni plus, ni moins",
      "Un laptop seul = garantie de mauvaise posture, toujours",
      "La règle 20-20-20 réduit la fatigue visuelle de 40%",
      "Se lever toutes les 30 min réduit le risque cardiovasculaire de 17%",
      "La caféine après 14h perturbe le sommeil même si tu t'endors bien",
      "Manger devant l'écran = pas de vraie pause cognitive",
      "Le stress chronique crée des tensions musculaires réelles et mesurables",
    ],
    products: [
      { name: "Rehausseur écran GRIFEMA", reason: "Ton écran trop bas est la cause principale de tes tensions cervicales", priority: "haute", url: "https://amzn.to/4uGNQ0y", trigger: "setup_score < 60" },
      { name: "Support laptop ergonomique", reason: "Un laptop seul impose une flexion permanente de la nuque", priority: "haute", url: "https://amzn.to/3RBejyl", trigger: "q1 === laptop" },
      { name: "Souris verticale Trust Verto", reason: "Réduit la torsion du poignet de 60%", priority: "haute", url: "https://amzn.to/4feJR71", trigger: "q9 >= 2" },
      { name: "Coussin lombaire FORTEM", reason: "Maintient la courbure naturelle du dos en position assise prolongée", priority: "moyenne", url: "https://amzn.to/4uK2owE", trigger: "q8 >= 2" },
      { name: "Lunettes anti-lumière bleue Horus X", reason: "La lumière bleue le soir décale ton horloge biologique de 2h", priority: "haute", url: "https://amzn.to/4tws0fk", trigger: "q17 <= 6" },
    ],
  },

  // ── DEBOUT ────────────────────────────────────────────────────────────────
  debout: {
    label: "Commerce / restauration",
    emoji: "🏪",
    intro: "Le travail en station debout prolongée est l'un des plus éprouvants pour le système musculo-squelettique. Contrairement aux idées reçues, rester debout immobile est plus fatiguant que marcher — les muscles se contractent en permanence sans se détendre.",
    risk_profile: {
      main_risks: [
        "Fasciite plantaire — 40% des travailleurs debout en souffrent",
        "Insuffisance veineuse et varices professionnelles",
        "Lombalgies par hyperlordose compensatoire",
        "Gonarthrose (usure des genoux) par station debout prolongée",
        "Œdèmes chroniques des membres inférieurs",
        "Syndrome des jambes lourdes",
      ],
      did_you_know: [
        "Rester debout immobile est plus fatigant que marcher — les muscles se contractent sans relâche",
        "La fasciite plantaire touche 10% de la population mais 40% des travailleurs debout",
        "Après 4h debout sur sol dur, la pression sur les pieds équivaut à 20kg supplémentaires",
        "Les chaussettes de compression portées AVANT de se lever sont 3x plus efficaces que portées après",
        "Un tapis anti-fatigue de qualité se rembourse en arrêts maladie évités en moins de 3 mois",
      ],
    },
    score_interpretations: {
      setup: {
        critical: "Ton environnement debout est très risqué. Sol dur + chaussures inadaptées + absence de tapis anti-fatigue = la combinaison la plus génératrice de fasciite plantaire et d'insuffisance veineuse. Ces facteurs s'accumulent chaque jour.",
        attention: "Ton setup debout a des failles importantes. Quelques investissements simples (tapis, semelles, chaussettes) peuvent réduire ta fatigue de fin de journée de 40%.",
        good: "Ton environnement debout est bien adapté. Continue à surveiller l'état de tes semelles et de ton tapis anti-fatigue — ils s'usent et perdent leurs propriétés.",
      },
      pain: {
        critical: "Tes douleurs sont sévères. Ce niveau pour un travailleur debout indique souvent une pathologie installée (fasciite, insuffisance veineuse). Une consultation médicale ou kiné est urgente — ces douleurs ne disparaissent pas d'elles-mêmes.",
        attention: "Tes douleurs sont modérées mais typiques d'un travailleur debout. Elles sont encore réversibles — agis maintenant plutôt que d'attendre qu'elles s'installent chroniquement.",
        good: "Tu n'as pas de douleurs significatives. C'est le meilleur moment pour agir en prévention avec les exercices de renforcement du pied.",
      },
      habits: {
        critical: "Tu ne varies pas assez ta position et tu ne fais pas de pauses assises. Rester debout sans mouvement est plus nocif que circuler. Micro-mouvements en continu.",
        attention: "Tes habitudes de mouvement au travail peuvent être améliorées. Quelques changements simples réduiraient considérablement ta fatigue.",
        good: "Tu gères bien la variation de position et les pauses. C'est la compétence la plus protectrice pour un travailleur debout.",
      },
      sleep_energy: {
        critical: "Ton sommeil est insuffisant pour récupérer d'une journée debout. La fatigue physique s'accumule sans récupération adéquate — le risque de blessure augmente.",
        attention: "Ta récupération mérite attention après des journées debout intenses.",
        good: "Tu récupères bien après tes journées debout. C'est essentiel pour prévenir les douleurs chroniques.",
      },
      nutrition: {
        critical: "L'hydratation est encore plus cruciale pour un métier debout. La déshydratation aggrave les jambes lourdes et la fatigue musculaire.",
        attention: "Quelques ajustements dans ton hydratation amélioreraient ton énergie et réduiraient les jambes lourdes.",
        good: "Ta nutrition et hydratation soutiennent bien tes journées debout. Continue ainsi.",
      },
    },
    priority_actions: {
      always: [
        { title: "Vérifie la hauteur de ton plan de travail", why: "Un plan trop bas force une flexion permanente du dos et des épaules enroulées.", how: "Idéal : coudes légèrement fléchis quand les bras sont posés. Demande un réglage si possible.", impact: "Réduit les tensions d'épaules et de dos de 40%" },
        { title: "Demande un tapis anti-fatigue", why: "C'est l'investissement ergonomique le plus rentable pour le travail debout.", how: "Parle à ton employeur — c'est son obligation légale de prévention. Un tapis de 50€ vaut mieux qu'un arrêt maladie.", impact: "Réduit la fatigue musculaire des jambes de 50% après 4h" },
        { title: "Short foot 3x par jour", why: "L'exercice le plus efficace pour renforcer la voûte plantaire et prévenir la fasciite.", how: "Raccourcis ton pied sans fléchir les orteils. Tiens 3 secondes. 10 répétitions. Faisable au poste debout.", impact: "Prévient et traite la fasciite plantaire" },
      ],
      fasciite: [
        {
          title: "Fasciite plantaire — agis maintenant",
          why: "La douleur au talon au lever est le signe classique. Sans traitement, elle peut durer 12 mois. Avec les bons exercices, 6 à 12 semaines suffisent.",
          how: "1. Étire le fascia avant le premier pas (10 × 10 sec assis au lit). 2. Glace sous le talon 10-15 min après chaque journée. 3. Ne marche jamais pieds nus sur sol dur le matin.",
          impact: "Réduit la durée de la fasciite de 12 mois à 6-8 semaines",
        },
      ],
      veines: [
        {
          title: "Insuffisance veineuse — ta priorité #1",
          why: "Tes jambes ne drainent plus correctement. La pompe veineuse des mollets est insuffisante.",
          how: "1. Porte des chaussettes de compression dès le matin AVANT de te lever. 2. Surélève les jambes 20 min en rentrant. 3. 20 montées sur pointes toutes les 30 minutes.",
          impact: "Réduit les œdèmes et prévient l'aggravation variqueuse",
        },
      ],
      plan_trop_bas: [
        {
          title: "Ton plan de travail te courbe le dos",
          why: "Un plan trop bas force une flexion permanente du tronc — tendinite d'épaule et lombalgie assurées.",
          how: "Demande une surélévation du plan. En attendant : penche-toi depuis les hanches, pas depuis le dos.",
          impact: "Réduit les tensions d'épaules et de dos de 40%",
        },
      ],
    },
    exercises: [
      { id: "short_foot", name: "Short foot", target: "Voûte plantaire", duration: "30 sec × 3", frequency: "3x par jour", instruction: "Raccourcis ton pied sans fléchir les orteils. Voûte plantaire qui se soulève. Tiens 3 sec.", when: "always" },
      { id: "calf_raise_excentric", name: "Mollet excentrique", target: "Mollets & fascia", duration: "15 reps lentes", frequency: "2x par jour", instruction: "Montée sur 2 pieds, descente lente sur 1. La phase excentrique est clé.", when: "always" },
      { id: "fascia_stretch_morning", name: "Étirement fascia matin", target: "Fascia plantaire", duration: "10 × 10 sec", frequency: "Chaque matin avant le premier pas", instruction: "Attrape tes orteils au lit, tire vers toi 10 sec × 10 avant de te lever.", when: "q_d13 === premier_pas" },
      { id: "leg_elevation", name: "Surélévation des jambes", target: "Circulation veineuse", duration: "20 minutes", frequency: "Chaque soir", instruction: "Jambes à 45° contre le mur, 20 minutes. Pieds au-dessus du cœur.", when: "q_d11 >= 2 || q_d14 !== normales" },
      { id: "plantar_massage", name: "Auto-massage plantaire", target: "Voûte plantaire", duration: "2 min par pied", frequency: "Soir après travail", instruction: "Balle de tennis ou bouteille glacée. Rouler toute la voûte.", when: "q_d8 >= 2" },
      { id: "toe_spreading", name: "Écartement des orteils", target: "Pieds", duration: "10 répétitions", frequency: "Matin et soir", instruction: "Pieds nus, écarter au maximum. Alterner gros orteil seul vs autres.", when: "always" },
    ],
    tips: [
      "La douleur au talon au premier pas du matin = fasciite plantaire — consulte un kiné",
      "Short foot 3x/jour : l'exercice le plus efficace pour protéger ta voûte plantaire",
      "Porte tes chaussettes de compression le matin AVANT de te lever — pas après",
      "Surélève les jambes 20 min en rentrant — plus efficace que 1h de massage",
      "Rester debout immobile est plus fatigant que marcher — micro-mouvements en continu",
      "Un tapis anti-fatigue de 5cm d'épaisseur réduit la fatigue musculaire de 50%",
      "Le sol dur + chaussures plates = combinaison la plus risquée pour la fasciite",
      "Si douleur au genou : ne bloque jamais le genou en hyperextension debout",
      "Alterner l'appui d'un pied sur une marche soulage le bas du dos de 25%",
      "La déshydratation aggrave les jambes lourdes — bois même si tu n'as pas soif",
      "Si sport intensif après le travail et fasciite : passe au vélo ou natation",
      "Glace sous le talon 10-15 min après le travail si douleur — anti-inflammatoire naturel",
    ],
    products: [
      { name: "Tapis anti-fatigue ergonomique", reason: "Réduit de 50% la fatigue musculaire en station debout — validé scientifiquement", priority: "haute", url: "https://www.amazon.fr/s?k=tapis+anti+fatigue+bureau+debout+ergonomique", trigger: "q_d2 !== oui_ergo" },
      { name: "Semelles orthopédiques de travail", reason: "Amorties et soutien de voûte plantaire — indispensables si tu travailles sur sol dur", priority: "haute", url: "https://www.amazon.fr/s?k=semelles+orthopediques+travail+debout+amorti", trigger: "q_d1 === dur || q_d8 >= 2" },
      { name: "Chaussettes de compression graduée", reason: "Prévient varices et insuffisance veineuse — à porter dès le matin avant de se lever", priority: "haute", url: "https://www.amazon.fr/s?k=chaussettes+compression+graduee+travail+debout", trigger: "q_d11 >= 2 || q_d14 !== normales" },
      { name: "Balle de massage lacrosse", reason: "Auto-massage plantaire quotidien — en phase aiguë avec eau glacée", priority: "moyenne", url: "https://www.amazon.fr/s?k=balle+massage+fasciite+plantaire+lacrosse", trigger: "q_d8 >= 2 || q_d13 === premier_pas" },
      { name: "Repose-pieds ergonomique", reason: "Technique du pied surélevé — soulage le bas du dos de 25%", priority: "moyenne", url: "https://amzn.to/4dIZvWb", trigger: "q_d10 >= 2" },
      { name: "Coussin surélévation jambes", reason: "20 minutes le soir : draine les œdèmes et prévient les varices professionnelles", priority: "moyenne", url: "https://www.amazon.fr/s?k=coussin+surélévation+jambes+récupération", trigger: "q_d11 >= 2 || q_d14 !== normales" },
    ],
  },
  // ── ARTISAN ───────────────────────────────────────────────────────────────
  artisan: {
    label: "Artisan / terrain",
    emoji: "🔧",
    intro: "Le travail artisanal expose à des contraintes physiques intenses et variées. Les TMS sont la première cause de maladie professionnelle en France, et les artisans sont parmi les plus touchés.",
    risk_profile: {
      main_risks: [
        "Hernie discale par port de charges répété",
        "Syndrome de la coiffe des rotateurs",
        "Épicondylite par gestes répétitifs",
        "Gonarthrose par travail à genoux prolongé",
        "Lombalgies chroniques par flexion-rotation",
        "Syndrome des vibrations main-bras",
      ],
      did_you_know: [
        "80% des artisans développent au moins un TMS au cours de leur carrière",
        "La flexion + rotation simultanée du dos est le geste le plus dangereux pour la colonne",
        "Soulever 25kg avec le dos courbé équivaut à 250kg de charge sur les disques lombaires",
        "Les TMS coûtent en moyenne 4 semaines d'arrêt par an aux artisans touchés",
      ],
    },
    score_interpretations: {
      setup: {
        critical: "Tes conditions de travail sont très contraignantes. L'absence d'EPI adaptés et de bonnes techniques de manutention multiplie considérablement tes risques de TMS graves.",
        attention: "Certaines de tes conditions méritent attention. Des ajustements dans tes techniques et équipements réduiraient tes risques.",
        good: "Tu travailles dans de bonnes conditions avec de bonnes pratiques. Continue — ils protègent ta carrière sur le long terme.",
      },
      pain: {
        critical: "Tes douleurs sont sévères. Ignorer ces signaux peut conduire à une invalidité professionnelle. Une consultation avec un kinésithérapeute est urgente.",
        attention: "Tes douleurs sont modérées mais préoccupantes pour la durabilité de ta carrière. Agir maintenant est beaucoup plus efficace qu'attendre.",
        good: "Ton corps résiste bien aux contraintes de ton métier. Continue à entretenir ta forme physique — c'est ton capital professionnel le plus précieux.",
      },
      habits: {
        critical: "Tes habitudes de récupération sont insuffisantes pour compenser l'intensité de ton travail physique.",
        attention: "Quelques ajustements dans ta récupération feraient une grande différence.",
        good: "Tu récupères bien après tes journées de travail. C'est fondamental pour un métier physique.",
      },
      sleep_energy: {
        critical: "Ton sommeil est insuffisant pour récupérer d'un travail physiquement intense. Le risque de blessure augmente avec la fatigue.",
        attention: "Ta récupération mérite attention — le travail physique exige un sommeil de qualité.",
        good: "Tu récupères bien. C'est indispensable pour un métier physique.",
      },
      nutrition: {
        critical: "Ton alimentation ne soutient pas l'énergie nécessaire à ton travail physique. Cela augmente le risque de blessure par fatigue.",
        attention: "Quelques ajustements nutritionnels soutiendraient mieux ton effort physique.",
        good: "Ton alimentation soutient bien ton activité physique professionnelle.",
      },
    },
    priority_actions: {
      always: [
        { title: "La règle d'or du dos : jamais fléchi ET en rotation", why: "La combinaison flexion + rotation est responsable de 70% des hernies discales.", how: "Pour ramasser au sol : plie les genoux, garde le dos droit, tourne avec les pieds — pas avec le dos.", impact: "Réduit de 70% le risque de hernie discale" },
        { title: "Rapproche le travail de toi", why: "La distance entre toi et ta tâche détermine la courbure de ton dos.", how: "Toujours travailler le plus près possible. Utilise des tréteaux pour travailler à hauteur. Évite de travailler à bout de bras.", impact: "Réduit la charge sur les disques de 40%" },
        { title: "5 minutes d'étirements après le chantier", why: "Les muscles artisanaux accumulent des tensions qui se cristallisent sans étirement actif.", how: "Flexion lombaire + rotation thoracique + étirement épaules. 5 minutes au camion avant de rentrer.", impact: "Réduit de 60% les courbatures du lendemain" },
      ],
    },
    exercises: [
      { id: "artisan_lumbar", name: "Décompression lombaire", target: "Bas du dos", duration: "1 minute", frequency: "Soir après chantier", instruction: "Allongé sur le dos, ramène les deux genoux vers la poitrine. Berce-toi de droite à gauche. Décompresse les disques après une journée de charges et de flexions.", when: "always" },
      { id: "artisan_shoulder", name: "Rotation épaule complète", target: "Coiffe des rotateurs", duration: "10 cercles avant + arrière", frequency: "Toutes les 2h de chantier", instruction: "Bras le long du corps, fais de grands cercles avec l'épaule complète. Amplitude maximale. Lubrifie l'articulation.", when: "q7 >= 2" },
      { id: "artisan_knee", name: "Étirement quadriceps", target: "Genoux & cuisses", duration: "30 sec par côté", frequency: "Soir après chantier", instruction: "Debout, attrape ta cheville derrière toi. Genoux joints. Sens l'étirement à l'avant de la cuisse. Récupère après le travail à genoux.", when: "always" },
      { id: "artisan_forearm", name: "Étirement avant-bras", target: "Avant-bras & coude", duration: "30 sec par bras", frequency: "Toutes les 2h", instruction: "Bras tendu, paume vers le haut, tire doucement les doigts vers le bas. Prévient l'épicondylite liée aux gestes répétitifs.", when: "q9 >= 2" },
      { id: "artisan_thoracic", name: "Rotation thoracique", target: "Dos haut & thorax", duration: "8 rotations par côté", frequency: "Pauses chantier", instruction: "Bras croisés sur la poitrine. Tourne le buste à droite puis gauche en gardant les hanches fixes. Contre les tensions de rotation.", when: "always" },
    ],
    tips: [
      "La règle du dos : jamais fléchi ET en rotation en même temps",
      "Ceinture lombaire : utile pour les charges ponctuelles, pas en permanence",
      "S'agenouiller plutôt que se pencher — toujours quand c'est possible",
      "5 min d'étirements après le chantier = moins de courbatures demain",
      "Rapprocher le travail de soi réduit de 40% la charge sur les disques",
      "Un collègue pour les charges > 25kg n'est pas une faiblesse — c'est la norme",
    ],
    products: [
      { name: "Ceinture lombaire de travail", reason: "Protection lombaire pour les charges ponctuelles importantes", priority: "haute", url: "https://www.amazon.fr/s?k=ceinture+lombaire+travail+artisan", trigger: "q8 >= 3" },
      { name: "Genouillères de chantier", reason: "Protection des genoux pour le travail en position agenouillée", priority: "haute", url: "https://www.amazon.fr/s?k=genouillères+travail+chantier", trigger: "always" },
      { name: "Foam roller récupération", reason: "5 minutes de foam roller le soir accélère la récupération musculaire", priority: "moyenne", url: "https://amzn.to/4fiSsWh", trigger: "pain_score < 70" },
      { name: "Gants anti-vibrations", reason: "Protège les nerfs et articulations des mains des outils vibrants", priority: "moyenne", url: "https://www.amazon.fr/s?k=gants+anti+vibrations+travail", trigger: "q9 >= 2" },
    ],
  },

  // ── TRANSPORT ─────────────────────────────────────────────────────────────
  transport: {
    label: "Transport / mobilité",
    emoji: "🚗",
    intro: "La conduite prolongée combine les inconvénients du travail assis avec des contraintes supplémentaires : vibrations, stress, impossibilité de se lever. Les conducteurs professionnels sont parmi les plus exposés aux lombalgies chroniques.",
    risk_profile: {
      main_risks: [
        "Lombalgies chroniques par vibrations et position assise",
        "Sciatique par compression du nerf",
        "Hernie discale cervicale",
        "Syndrome du canal carpien par tenue du volant",
        "Varices et thrombose par immobilité",
        "Fatigue chronique et troubles du sommeil",
      ],
      did_you_know: [
        "Les vibrations du véhicule sont transmises directement aux disques intervertébraux",
        "La sciatique est 3x plus fréquente chez les conducteurs professionnels",
        "Conduire 4h d'affilée sans pause augmente le risque d'accident de 400%",
        "Un mauvais réglage de siège peut générer 30% de charge lombaire supplémentaire",
      ],
    },
    score_interpretations: {
      setup: {
        critical: "Ton poste de conduite est mal configuré. Un siège mal réglé est aussi problématique qu'un bureau mal réglé — mais avec des vibrations en plus. Le réglage du siège est ton action prioritaire absolue.",
        attention: "Ton poste de conduite a des points d'amélioration. Quelques réglages peuvent réduire significativement tes douleurs.",
        good: "Ton poste de conduite est bien configuré. Vérifie régulièrement que les réglages n'ont pas bougé.",
      },
      pain: {
        critical: "Tes douleurs sont significatives. La sciatique et les lombalgies chez les conducteurs nécessitent une consultation médicale — elles peuvent s'aggraver rapidement.",
        attention: "Tes douleurs sont modérées mais typiques des conducteurs. Elles sont encore réversibles.",
        good: "Tu résistes bien aux contraintes de la conduite prolongée. Continue à maintenir tes bonnes pratiques.",
      },
      habits: {
        critical: "Tu ne fais pas assez de pauses. La loi les impose et ton corps en a besoin — pas pour se reposer, mais pour se lever et bouger.",
        attention: "Tes pauses de conduite sont insuffisantes. Quelques ajustements réduiraient considérablement tes douleurs.",
        good: "Tu gères bien tes pauses de conduite. C'est la pratique la plus protectrice pour un conducteur.",
      },
      sleep_energy: {
        critical: "Ton sommeil est insuffisant et constitue un risque de sécurité en conduite. La somnolence au volant est une urgence médicale, pas un manque de volonté.",
        attention: "Ta récupération mérite attention. La fatigue en conduite est dangereuse au-delà d'un certain seuil.",
        good: "Tu récupères bien. La vigilance en conduite dépend directement de la qualité du sommeil.",
      },
      nutrition: {
        critical: "L'hydratation est particulièrement cruciale en conduite. La déshydratation légère augmente la fatigue et réduit la vigilance.",
        attention: "Quelques ajustements dans ton hydratation et alimentation amélioreraient ta vigilance.",
        good: "Ton alimentation soutient bien ta vigilance en conduite.",
      },
    },
    priority_actions: {
      always: [
        { title: "Règle ton siège en 3 minutes", why: "Le bon réglage de siège est l'action la plus impactante pour un conducteur.", how: "Distance volant : bras légèrement fléchis. Dossier : 100-110°. Appui lombaire dans le creux du dos.", impact: "Réduit la charge lombaire de 30% en conduite" },
        { title: "Pause obligatoire toutes les 2h", why: "La loi l'impose et ton corps en a besoin.", how: "Sors du véhicule, marche 5 minutes, fais des rotations du buste. Pas question de rester assis.", impact: "Réduit de 60% l'accumulation de tension lombaire" },
        { title: "Ajoute un coussin lombaire", why: "Les sièges de véhicule sont rarement ergonomiques pour la conduite prolongée.", how: "Un coussin dans le creux du dos maintient la courbure naturelle. Essaie-le 1 semaine.", impact: "Réduit la fatigue lombaire de 40% en conduite" },
      ],
    },
    exercises: [
      { id: "transport_ankle", name: "Rotations chevilles aux arrêts", target: "Chevilles & circulation", duration: "10 cercles par pied", frequency: "Aux feux rouges / arrêts", instruction: "Soulève légèrement le pied de l'accélérateur aux feux rouges. Fais de grands cercles avec la cheville. Relance la circulation.", when: "always" },
      { id: "transport_lumbar", name: "Décompression lombaire sortie", target: "Bas du dos", duration: "1 minute", frequency: "À chaque pause", instruction: "En sortant du véhicule : mains dans le bas du dos, pousse les hanches en avant. Puis flexion vers l'avant bras ballants. Contre la compression accumulée.", when: "always" },
      { id: "transport_neck", name: "Rotation nuque aux pauses", target: "Nuque & cervicales", duration: "5 rotations par côté", frequency: "À chaque pause", instruction: "Tourne lentement la tête à droite jusqu'au maximum confortable. Tiens 3 secondes. Libère les tensions cervicales.", when: "q6 >= 2" },
      { id: "transport_piriformis", name: "Étirement sciatique", target: "Sciatique & hanches", duration: "45 sec par côté", frequency: "Pauses et soir", instruction: "Assis : pose la cheville droite sur le genou gauche. Garde le dos droit. Incline-toi légèrement en avant. Soulage la compression du nerf sciatique.", when: "q8 >= 2" },
      { id: "transport_shoulder", name: "Ouverture pectorale", target: "Épaules & poitrine", duration: "30 sec × 2", frequency: "Pauses", instruction: "Entrecroise les doigts dans le dos. Pousse la poitrine vers l'avant, épaules vers l'arrière. Contre l'enroulement lié au volant.", when: "always" },
    ],
    tips: [
      "Régler son siège prend 3 min et change tout pour 8h de conduite",
      "S'arrêter toutes les 2h n'est pas optionnel — c'est légal et vital",
      "Rotations de chevilles aux feux rouges relance la circulation",
      "Un coussin lombaire dans le siège = investissement <30€ très rentable",
      "La somnolence en conduite est un symptôme médical — pas de la fatigue normale",
      "Hydrater correctement réduit la fatigue de conduite de 25%",
    ],
    products: [
      { name: "Coussin lombaire voiture", reason: "Maintient la courbure naturelle du dos pendant les longues heures de conduite", priority: "haute", url: "https://www.amazon.fr/s?k=coussin+lombaire+voiture+conduite", trigger: "always" },
      { name: "Coussin coccyx siège voiture", reason: "Réduit la pression sur le coccyx en position assise prolongée", priority: "haute", url: "https://www.amazon.fr/s?k=coussin+coccyx+siège+voiture", trigger: "q8 >= 2" },
      { name: "Chaussettes de compression", reason: "Prévient les varices et thromboses liées à l'immobilité en conduite", priority: "moyenne", url: "https://www.amazon.fr/s?k=chaussettes+compression+conduite", trigger: "always" },
      { name: "Gourde 1.5L graduée", reason: "L'hydratation est cruciale en conduite — la déshydratation augmente la fatigue", priority: "moyenne", url: "https://amzn.to/3RAs14A", trigger: "always" },
    ],
  },

  // ── MÉDICAL ───────────────────────────────────────────────────────────────
  medical: {
    label: "Médical / paramédical",
    emoji: "🏥",
    intro: "Les professionnels de santé cumulent les risques du travail debout, de la manutention de patients et d'une charge émotionnelle intense. Le burn-out et les TMS touchent plus de 50% des soignants en cours de carrière.",
    risk_profile: {
      main_risks: [
        "Lombalgies par manutention de patients",
        "Burn-out professionnel",
        "Syndrome de la coiffe des rotateurs",
        "Varices professionnelles",
        "Troubles du sommeil liés aux gardes",
        "Fatigue compassionnelle",
      ],
      did_you_know: [
        "Les infirmiers soulèvent l'équivalent de 1.8 tonne par journée de travail",
        "Le burn-out touche 40% des infirmiers dans les 5 premières années",
        "Les accidents d'exposition au sang représentent 700 000 cas par an en Europe",
        "La hauteur du lit de soin est le facteur ergonomique le plus impactant pour les soignants",
      ],
    },
    score_interpretations: {
      setup: {
        critical: "Tes conditions de travail sont très contraignantes. L'absence de matériel de manutention adapté multiplie ta charge lombaire quotidienne.",
        attention: "Certaines de tes conditions méritent d'être améliorées. Des adaptations simples font une grande différence.",
        good: "Tu travailles dans de bonnes conditions ergonomiques. Continue à utiliser le matériel disponible.",
      },
      pain: {
        critical: "Tes douleurs sont sévères. Ce niveau indique un risque d'arrêt maladie à court terme. Parle-en à la médecine du travail — tu as des droits à des aménagements de poste.",
        attention: "Tes douleurs sont modérées mais préoccupantes. La manutention avec des douleurs non traitées aggrave rapidement la situation.",
        good: "Tu gères bien les contraintes physiques de ton métier. Continue à utiliser les équipements et techniques correctes.",
      },
      habits: {
        critical: "Tes habitudes de récupération sont insuffisantes pour un métier aussi exigeant physiquement et émotionnellement.",
        attention: "Quelques ajustements dans ta récupération feraient une grande différence.",
        good: "Tu récupères bien après tes gardes et journées intenses. C'est fondamental pour tenir dans la durée.",
      },
      sleep_energy: {
        critical: "Ton sommeil est insuffisant, surtout pour un professionnel de santé qui doit être vigilant. Les gardes de nuit demandent une récupération active.",
        attention: "Ton sommeil mérite attention — surtout si tu fais des gardes. La fatigue amplifie le risque d'erreur médicale.",
        good: "Tu récupères bien entre les gardes. C'est essentiel pour la qualité des soins et ta santé.",
      },
      nutrition: {
        critical: "L'hydratation est souvent négligée dans les services. Une déshydratation légère réduit la vigilance et amplifie la fatigue.",
        attention: "Quelques ajustements dans ton hydratation amélioreraient ta vigilance en service.",
        good: "Tu gères bien ton alimentation et hydratation en service.",
      },
    },
    priority_actions: {
      always: [
        { title: "Règle la hauteur du lit avant chaque soin", why: "C'est la règle d'or ergonomique du soin — souvent ignorée faute de temps.", how: "Lit à hauteur des hanches pour les soins debout. 5 secondes pour régler = dos protégé.", impact: "Réduit de 60% la charge lombaire lors des soins" },
        { title: "Ne mobilise jamais seul un patient >50kg", why: "La manutention à deux n'est pas une faiblesse — c'est la norme légale et ergonomique.", how: "Demande systématiquement de l'aide. Utilise le matériel disponible.", impact: "Réduit de 80% le risque de lombalgie aiguë" },
        { title: "5 minutes de décompression entre patients", why: "La charge émotionnelle s'accumule et se traduit en tensions musculaires réelles.", how: "Respiration en cohérence cardiaque (4-4-4-4). 2 minutes suffisent à réduire le cortisol.", impact: "Réduit de 30% la tension musculaire liée au stress" },
      ],
    },
    exercises: [
      { id: "medical_lumbar", name: "Décompression lombaire post-garde", target: "Bas du dos", duration: "2 minutes", frequency: "Après chaque shift", instruction: "Allongé sur le dos, genoux fléchis. Bascule le bassin pour aplatir le bas du dos. Tiens 5 secondes, relâche. 10 répétitions. Décompresse après la manutention.", when: "always" },
      { id: "medical_breathing", name: "Cohérence cardiaque", target: "Stress & mental", duration: "2 minutes", frequency: "Entre les patients", instruction: "Inspire 4 secondes. Retiens 4. Expire 4. Retiens 4. 6 cycles. Réduit le cortisol de 20% en 2 minutes.", when: "always" },
      { id: "medical_shoulder", name: "Décompression épaules", target: "Épaules & coiffe", duration: "30 sec par côté", frequency: "Pauses", instruction: "Bras croisé devant la poitrine. Attrape le coude avec l'autre main et tire doucement. Libère les tensions de manipulation.", when: "q7 >= 2" },
      { id: "medical_calf", name: "Montées sur pointes", target: "Mollets & circulation", duration: "20 répétitions", frequency: "Toutes les 30 min", instruction: "Monte sur les pointes des pieds, tiens 2 secondes, redescends lentement. Active la pompe veineuse. Prévient les varices professionnelles.", when: "always" },
    ],
    tips: [
      "La hauteur du lit de soin est le facteur ergonomique le plus impactant",
      "La manutention à deux n'est pas une faiblesse — c'est la norme légale",
      "5 min de décompression entre patients protège ta santé mentale",
      "Hydrate-toi même si tu n'as pas le temps — une gourde dans ta poche",
      "Le burn-out se prévient, pas se guérit — parler tôt est la meilleure arme",
      "Les chaussures professionnelles de soin sont un investissement, pas un luxe",
    ],
    products: [
      { name: "Chaussures professionnelles de soin", reason: "Amorties et stables pour les longues heures debout en service", priority: "haute", url: "https://www.amazon.fr/s?k=chaussures+professionnelles+soignant+confort", trigger: "always" },
      { name: "Chaussettes de compression", reason: "Prévient les varices professionnelles liées aux longues heures debout", priority: "haute", url: "https://www.amazon.fr/s?k=chaussettes+compression+soignant", trigger: "always" },
      { name: "Gourde isotherme 750ml", reason: "Hydratation essentielle en service — souvent négligée par les soignants", priority: "moyenne", url: "https://amzn.to/3RAs14A", trigger: "always" },
    ],
  },

  // ── ENSEIGNEMENT ──────────────────────────────────────────────────────────
  enseignement: {
    label: "Enseignement / formation",
    emoji: "🎓",
    intro: "Les enseignants combinent les contraintes du travail debout avec une charge vocale intense et une pression psychologique importante. La fatigue vocale et le burn-out sont les deux principales menaces de cette profession.",
    risk_profile: {
      main_risks: [
        "Dysphonie professionnelle (problèmes de voix)",
        "Burn-out enseignant",
        "Lombalgies par station debout",
        "Douleurs cervicales (tableau, vidéoprojecteur)",
        "Fatigue visuelle (corrections prolongées)",
        "TMS des membres supérieurs (correction de copies)",
      ],
      did_you_know: [
        "Les enseignants utilisent leur voix 6x plus qu'un locuteur normal",
        "1 enseignant sur 3 développe une dysphonie dans sa carrière",
        "Le burn-out enseignant touche 30% de la profession",
        "Les enseignants regardent vers le haut des milliers de fois par jour — source majeure de tensions cervicales",
      ],
    },
    score_interpretations: {
      setup: {
        critical: "Ton environnement de classe est peu ergonomique. La hauteur du tableau, la position du vidéoprojecteur et l'absence de siège accessible créent des contraintes permanentes sur ta nuque.",
        attention: "Quelques points de ton environnement méritent attention. Des ajustements simples peuvent réduire tes tensions.",
        good: "Tu as un environnement de travail correct. Continue à varier les positions et utiliser ton espace de classe de façon ergonomique.",
      },
      pain: {
        critical: "Tes douleurs sont importantes. Ce niveau impacte souvent la qualité de l'enseignement et peut mener à un arrêt. Consulte un médecin du travail.",
        attention: "Tes douleurs sont modérées mais préoccupantes. Elles risquent de s'aggraver en période de rush (corrections, conseils de classe).",
        good: "Tu gères bien les contraintes physiques de l'enseignement. Continue à varier les postures en classe.",
      },
      habits: {
        critical: "Ta charge de travail hors classe (corrections, préparations) se fait dans de mauvaises conditions ergonomiques.",
        attention: "Quelques ajustements dans ta façon de travailler hors classe réduiraient tes tensions.",
        good: "Tu gères bien ton organisation et tes conditions de travail.",
      },
      sleep_energy: {
        critical: "Ton sommeil est insuffisant pour tenir face à la charge physique et émotionnelle de l'enseignement.",
        attention: "Ta récupération mérite attention — l'enseignement est épuisant même sans symptômes apparents.",
        good: "Tu récupères bien. C'est essentiel pour tenir dans la durée dans ce métier exigeant.",
      },
      nutrition: {
        critical: "L'hydratation est particulièrement importante pour les enseignants qui parlent beaucoup. Une gorge sèche fatigue les cordes vocales.",
        attention: "Quelques ajustements dans ton hydratation protégeraient ta voix.",
        good: "Tu t'hydrates bien — c'est fondamental pour protéger tes cordes vocales.",
      },
    },
    priority_actions: {
      always: [
        { title: "Protège ta voix — c'est ton outil principal", why: "Une dysphonie peut mettre fin à une carrière d'enseignant.", how: "Parle depuis le diaphragme, pas depuis la gorge. Ne crie jamais. Hydrate-toi constamment.", impact: "Prévient la dysphonie professionnelle" },
        { title: "Varie ta position en classe", why: "Rester debout immobile devant le tableau est épuisant et inutile.", how: "Circule dans la classe. Assieds-toi parfois. Utilise un tabouret haut. Change toutes les 20 minutes.", impact: "Réduit de 40% la fatigue physique en fin de journée" },
        { title: "Centre le tableau à hauteur des yeux", why: "Regarder en haut des milliers de fois par jour crée des tensions cervicales chroniques.", how: "Le centre du tableau doit être à hauteur des yeux ou légèrement en dessous. Demande un réglage si possible.", impact: "Réduit les tensions cervicales liées au tableau" },
      ],
    },
    exercises: [
      { id: "enseignement_voice", name: "Humming vocal", target: "Cordes vocales", duration: "2 minutes", frequency: "Avant et après cours", instruction: "Lèvres fermées, produis un son 'mmmm' continu et doux. Sens les vibrations dans les lèvres. Réchauffe avant les cours, détend après.", when: "always" },
      { id: "enseignement_neck", name: "Étirement nuque post-tableau", target: "Nuque & cervicales", duration: "30 sec par côté", frequency: "Entre chaque cours", instruction: "Incline la tête vers l'épaule droite. Main droite sur la tête (sans tirer). Sens l'étirement à gauche. Contre les tensions cervicales du tableau.", when: "always" },
      { id: "enseignement_eyes", name: "Repos oculaire post-correction", target: "Yeux", duration: "1 minute", frequency: "Après chaque session correction", instruction: "Paumes chaudes sur les yeux fermés. Obscurité totale. Respire profondément. Récupère après les longues sessions de lecture.", when: "always" },
      { id: "enseignement_lumbar", name: "Décompression lombaire assise", target: "Bas du dos", duration: "45 sec", frequency: "Entre chaque cours", instruction: "Assis, penche-toi vers l'avant bras ballants entre les jambes. Laisse le dos s'arrondir. Décompresse après la station debout.", when: "q8 >= 2" },
      { id: "enseignement_wrist", name: "Étirement poignets", target: "Poignets & avant-bras", duration: "30 sec par côté", frequency: "Après correction", instruction: "Bras tendu, tire les doigts vers le bas. Sens l'étirement dans l'avant-bras. Prévient les TMS liés à la correction de copies.", when: "always" },
    ],
    tips: [
      "La voix est ton outil principal — protège-la comme un musicien son instrument",
      "Parle depuis le diaphragme, jamais depuis la gorge",
      "Hydrate-toi constamment — une gorge sèche fatigue les cordes vocales",
      "Le silence est plus efficace que crier pour obtenir l'attention",
      "Varie ta position toutes les 20 minutes — circule dans la classe",
      "Les périodes de correction sont les plus risquées pour les TMS — fais des pauses",
    ],
    products: [
      { name: "Tabouret haut ergonomique", reason: "Permet de s'asseoir tout en gardant une position semi-debout en classe", priority: "haute", url: "https://www.amazon.fr/s?k=tabouret+haut+ergonomique+bureau", trigger: "always" },
      { name: "Gourde 1.5L graduée", reason: "L'hydratation est essentielle pour protéger les cordes vocales", priority: "haute", url: "https://amzn.to/3RAs14A", trigger: "always" },
      { name: "Coussin lombaire", reason: "Pour les longues sessions de correction assis", priority: "moyenne", url: "https://amzn.to/4uK2owE", trigger: "q8 >= 2" },
    ],
  },
};

// ─── Job dimension content (per-job conseils pages) ──────────────────────────

export interface DeboutTip { id: string; icon: string; text: string; }
export interface DeboutProduct {
  id: string; name: string; reason: string; url: string;
  priority: "haute" | "moyenne" | "premium";
  price: string; badge: string | null;
  dimension: string[]; triggers: string[];
}

export interface JobDimensionContent {
  detected: string[];
  consequences: string;
  tips: DeboutTip[];
  immediateActions: string[];
  exerciseIds: string[];
  programId: string;
  products: DeboutProduct[];
}

function mkProduct(
  id: string, name: string, reason: string, url: string,
  priority: "haute" | "moyenne" | "premium", price: string, badge: string | null = null
): DeboutProduct {
  return { id, name, reason, url, priority, price, badge, dimension: [], triggers: [] };
}

function getDeboutDimensionContent(
  dimension: string,
  answers: Record<string, unknown>,
): JobDimensionContent | null {

  const a = (key: string) => answers[key];
  const n = (key: string) => Number(answers[key] ?? 0);

  switch (dimension) {

    case "setup": {
      const detected: string[] = [];
      if (a("q_d1") === "dur") {
        detected.push("Tu travailles sur sol dur (carrelage/béton). C'est la surface la plus génératrice de fasciite plantaire et de fatigue musculaire des membres inférieurs.");
      }
      if (a("q_d2") !== "oui_ergo") {
        detected.push("Tu n'as pas de tapis anti-fatigue ergonomique. Après 4h debout sur sol dur sans amorti, la pression sur tes pieds équivaut à 20 kg supplémentaires.");
      }
      if (a("q_d3") === "ville" || a("q_d3") === "plates") {
        detected.push("Tes chaussures ne sont pas adaptées au travail debout prolongé. C'est le facteur de risque #1 de la fasciite plantaire.");
      }
      if (a("q_d7") === "trop_bas") {
        detected.push("Ton plan de travail est trop bas. Tu te courbes en permanence, ce qui surcharge le bas du dos et les épaules.");
      }
      if (a("q_d6") === "non") {
        detected.push("Tu n'as pas accès à un siège. La variation posturale assis/debout est le meilleur rempart contre les TMS du travail debout.");
      }
      if (detected.length === 0) {
        detected.push("Ton environnement debout est globalement bien adapté — continue à surveiller l'état de tes semelles et de ton tapis anti-fatigue.");
      }
      return {
        detected,
        consequences: "Le travail debout sur sol dur sans équipement adapté provoque une fatigue musculaire accélérée, des micro-traumatismes plantaires répétés et des compensations posturales (dos cambré, genoux bloqués) qui mènent aux TMS chroniques.",
        tips: [
          { id: "dt1", icon: "🪑", text: "Demande un tapis anti-fatigue à ton employeur — c'est son obligation légale de prévention" },
          { id: "dt2", icon: "👟", text: "Change de chaussures si elles n'ont pas de semelles amortissantes — c'est ton investissement #1" },
          { id: "dt3", icon: "🦶", text: "Alterne l'appui d'un pied sur une marche ou repose-pieds toutes les 20 minutes — soulage le bas du dos de 25%" },
        ],
        immediateActions: [
          "Fais 20 montées sur pointes maintenant — relance la circulation veineuse immédiatement",
          "Transfère ton poids d'un pied à l'autre lentement pendant 1 minute",
          "Si tu as de la glace : applique-la sous le talon 10 minutes après le service",
        ],
        exerciseIds: ["short_foot", "calf_raise_excentric", "marching", "toe_spreading", "calf_stretch"],
        programId: "debout_recovery",
        products: [
          mkProduct("tapis_af", "Tapis anti-fatigue ergonomique", "Réduit de 50% la fatigue musculaire en station debout — validé scientifiquement", "https://www.amazon.fr/s?k=tapis+anti+fatigue+bureau+debout+ergonomique", "haute", "~45€", "Priorité #1"),
          mkProduct("semelles_o", "Semelles orthopédiques de travail", "Amorties et soutien de voûte plantaire — indispensables si tu travailles sur sol dur", "https://www.amazon.fr/s?k=semelles+orthopediques+travail+debout+amorti", "haute", "~25€"),
          mkProduct("repose_pied", "Repose-pieds ergonomique", "Technique du pied surélevé — soulage le bas du dos de 25%", "https://amzn.to/4dIZvWb", "moyenne", "~30€"),
        ],
      };
    }

    case "douleurs": {
      const detected: string[] = [];
      const exerciseIds: string[] = [];
      const products: DeboutProduct[] = [];

      const q_d8 = n("q_d8");
      const q_d9 = n("q_d9");
      const q_d10 = n("q_d10");
      const q_d11 = n("q_d11");
      const q_d13 = String(a("q_d13") ?? "");
      const q_d14 = String(a("q_d14") ?? "normales");

      if (q_d8 >= 3 && q_d13 === "premier_pas") {
        detected.push("⚠️ Douleur au talon au lever : signe classique de fasciite plantaire. Sans prise en charge : 6 à 12 mois. Avec les bons exercices : 6 à 12 semaines.");
        exerciseIds.push("fascia_stretch_morning", "short_foot", "calf_raise_excentric", "plantar_massage");
        products.push(mkProduct("semelles_f", "Semelles orthopédiques de travail", "Soutien de voûte plantaire — indispensables contre la fasciite", "https://www.amazon.fr/s?k=semelles+orthopediques+travail+debout+amorti", "haute", "~25€", "Urgence fasciite"));
        products.push(mkProduct("balle_m", "Balle de massage lacrosse", "Auto-massage plantaire quotidien — en phase aiguë avec eau glacée", "https://www.amazon.fr/s?k=balle+massage+fasciite+plantaire+lacrosse", "moyenne", "~10€"));
      } else if (q_d8 >= 1) {
        detected.push("Tu as des douleurs aux pieds ou talons. Même légères, elles méritent attention — elles sont le premier signe d'une fasciite en formation.");
        exerciseIds.push("short_foot", "calf_raise_excentric", "toe_spreading");
      }

      if (q_d9 >= 2) {
        detected.push("Tes genoux subissent une compression continue. La gonarthrose est 3x plus fréquente chez les travailleurs debout.");
        if (!exerciseIds.includes("calf_stretch")) exerciseIds.push("chair_squat", "calf_stretch");
      }

      if (q_d11 >= 2 && q_d14 !== "normales") {
        detected.push("Tes jambes lourdes en fin de service indiquent une insuffisance veineuse professionnelle. Les chaussettes de compression portées LE MATIN (avant de se lever) sont 3x plus efficaces que portées après.");
        if (!exerciseIds.includes("leg_elevation")) exerciseIds.push("marching", "leg_elevation");
        products.push(mkProduct("chaussettes_c", "Chaussettes de compression graduée", "Prévient varices et insuffisance veineuse — à porter dès le matin avant de se lever", "https://www.amazon.fr/s?k=chaussettes+compression+graduee+travail+debout", "haute", "~20€"));
        products.push(mkProduct("coussin_el", "Coussin surélévation jambes", "20 minutes le soir : draine les œdèmes et prévient les varices professionnelles", "https://www.amazon.fr/s?k=coussin+surélévation+jambes+récupération", "moyenne", "~30€"));
      } else if (q_d11 >= 1) {
        detected.push("Tu ressens une légère lourdeur des jambes. C'est le début du syndrome veineux professionnel — agis maintenant en prévention.");
        if (!exerciseIds.includes("marching")) exerciseIds.push("marching", "calf_raise_excentric");
      }

      if (q_d10 >= 2) {
        detected.push("Tes douleurs lombaires sont typiques du travail debout. L'hyperlordose compensatoire (creuser le bas du dos) est le mécanisme principal — corrigeable avec les bons exercices.");
        if (!exerciseIds.includes("lumbar_extension")) exerciseIds.push("lumbar_extension", "cat_cow");
        products.push(mkProduct("repose_pf", "Repose-pieds ergonomique", "Alterner l'appui d'un pied soulage le bas du dos de 25%", "https://amzn.to/4dIZvWb", "moyenne", "~30€"));
      }

      if (detected.length === 0) {
        detected.push("Tu n'as pas de douleurs significatives. C'est le meilleur moment pour agir en prévention avec les exercices de renforcement du pied.");
        exerciseIds.push("short_foot", "toe_spreading", "calf_raise_excentric");
      }

      const tips: DeboutTip[] = [];
      if (q_d8 >= 3 && q_d13 === "premier_pas") {
        tips.push({ id: "dp1", icon: "🦶", text: "Ne marche jamais pieds nus sur sol dur le matin — met tes chaussures avant le premier pas" });
        tips.push({ id: "dp2", icon: "🧊", text: "Glace sous le talon 10-15 min après chaque journée — anti-inflammatoire gratuit et efficace" });
        tips.push({ id: "dp3", icon: "🧘", text: "Étire le fascia avant le premier pas : attrape tes orteils, tire 10 sec × 10 reps au lit" });
      } else if (q_d11 >= 2 && q_d14 !== "normales") {
        tips.push({ id: "dp4", icon: "🧦", text: "Porte les chaussettes de compression LE MATIN avant de te lever — 3x plus efficaces qu'après" });
        tips.push({ id: "dp5", icon: "🦵", text: "Surélève les jambes 20 min en rentrant — plus efficace qu'1h de massage" });
        tips.push({ id: "dp6", icon: "🏊", text: "Natation ou vélo après le travail : circulation veineuse sans impact sur les pieds" });
      } else if (q_d10 >= 2) {
        tips.push({ id: "dp7", icon: "🦶", text: "Alterne l'appui d'un pied sur une marche toutes les 20 min — soulage le bas du dos de 25%" });
        tips.push({ id: "dp8", icon: "🪑", text: "Demande un repose-pieds si tu n'en as pas — c'est l'équipement lombaire #1 pour les debout" });
        tips.push({ id: "dp9", icon: "🧘", text: "Flexion lombaire 30 sec toutes les 2h : assis, bras entre les jambes, laisse le dos s'arrondir" });
      } else {
        tips.push({ id: "dp10", icon: "🦶", text: "Short foot 3x par jour : le meilleur exercice pour prévenir la fasciite plantaire" });
        tips.push({ id: "dp11", icon: "⬆️", text: "20 montées sur pointes après chaque service : relance la pompe veineuse" });
        tips.push({ id: "dp12", icon: "🧦", text: "Chaussettes de compression en prévention si tu travailles plus de 6h debout" });
      }

      return {
        detected,
        consequences: "Les douleurs des membres inférieurs chez les travailleurs debout s'installent progressivement et deviennent chroniques sans intervention. Fasciite, insuffisance veineuse et lombalgies par hyperlordose sont les trois pathologies les plus fréquentes — toutes évitables avec les bons gestes.",
        tips,
        immediateActions: [
          q_d8 >= 2 ? "Fais l'étirement du fascia maintenant : attrape tes orteils, tire 10 secondes × 5 reps" : "Fais 20 montées sur pointes maintenant — relance la circulation immédiatement",
          q_d11 >= 2 ? "Allonge-toi et mets les jambes contre le mur 5 minutes dès maintenant" : "Transfère ton poids d'un pied à l'autre lentement pendant 1 minute",
          "Si tu as de la glace : applique-la sous le talon ou sur la zone douloureuse 10 minutes",
        ],
        exerciseIds: exerciseIds.slice(0, 5),
        programId: q_d8 >= 3 ? "debout_recovery" : "debout_pause",
        products: products.slice(0, 3),
      };
    }

    case "habitudes": {
      const detected: string[] = [];
      const q_d16 = String(a("q_d16") ?? "");
      const q_d17 = String(a("q_d17") ?? "");
      const q_d18 = String(a("q_d18") ?? "");
      const q_d19 = String(a("q_d19") ?? "");

      if (q_d16 === "jamais" || q_d16 === "rarement") {
        detected.push("Tu ne fais pas de pauses assises. Rester debout immobile sans variation est plus nocif que marcher — les muscles se contractent sans jamais se relâcher.");
      }
      if (q_d17 === "fixe") {
        detected.push("Tu restes en poste fixe immobile. Le mouvement continu protège infiniment mieux que rester debout statique.");
      }
      if (q_d18 === "lourdes" || q_d18 === "tres_lourdes") {
        detected.push("Tu portes des charges lourdes. La combinaison travail debout + port de charges est la plus génératrice de TMS lombaires.");
      }
      if (q_d19 === "rarement" || q_d19 === "interdit") {
        detected.push("Tu t'hydrates insuffisamment. La déshydratation aggrave la fatigue musculaire, les jambes lourdes et les crampes nocturnes des mollets.");
      }
      if (detected.length === 0) {
        detected.push("Tes habitudes au travail sont globalement bonnes. Continue à varier les positions et à t'hydrater régulièrement.");
      }
      return {
        detected,
        consequences: "Les mauvaises habitudes au poste debout accélèrent la fatigue et les TMS. La variation posturale est le facteur protecteur le plus puissant — plus même que l'équipement.",
        tips: [
          { id: "dh1", icon: "🔄", text: "Variation posturale toutes les 20 min : assis, debout, un pied surélevé — alterner c'est tout" },
          { id: "dh2", icon: "🚶", text: "Micro-mouvements en service : weight shift, montées sur pointes, écartement d'orteils — faisables au poste" },
          { id: "dh3", icon: "💧", text: "Hydratation critique : bois avant d'avoir soif — au travail debout on déshydrate plus vite" },
          { id: "dh4", icon: "📦", text: "Port de charges : dos droit, charge proche du corps, jamais en flexion + rotation simultanées" },
        ],
        immediateActions: [
          "Bois un grand verre d'eau maintenant",
          "Mets une alarme toutes les 20 min pour changer de position",
          "Fais 10 montées sur pointes et 10 transferts de poids — faisable au poste",
        ],
        exerciseIds: ["short_foot", "marching", "toe_spreading", "calf_raise_excentric", "lumbar_extension"],
        programId: "debout_pause",
        products: [
          mkProduct("tapis_h", "Tapis anti-fatigue ergonomique", "Réduit de 50% la fatigue liée à l'immobilité — investissement #1 pour les habitudes debout", "https://www.amazon.fr/s?k=tapis+anti+fatigue+bureau+debout+ergonomique", "haute", "~45€", "Essentiel"),
          mkProduct("gourde_h", "Gourde 1.5L graduée", "Rappel visuel de l'hydratation — boire sans y penser", "https://amzn.to/3RAs14A", "moyenne", "~15€"),
        ],
      };
    }

    case "sommeil": {
      const detected: string[] = [];
      const q_d11 = n("q_d11");
      const q_d14 = String(a("q_d14") ?? "normales");
      const q_d21 = n("q_d21");

      if (q_d11 >= 2 && q_d14 !== "normales") {
        detected.push("Tes jambes lourdes en fin de journée peuvent perturber ton sommeil. Le syndrome des jambes sans repos (agitation nocturne, crampes) est fréquent chez les travailleurs debout.");
      }
      if (q_d11 >= 3) {
        detected.push("Douleurs aux mollets la nuit : souvent des crampes liées à la déshydratation et la déplétion en magnésium après une journée physique intense.");
      }
      if (q_d21 <= 2) {
        detected.push("Ton énergie est basse en fin de journée — récupération insuffisante pour la charge physique de ton métier.");
      }
      if (detected.length === 0) {
        detected.push("Tu récupères correctement après tes journées debout. Continue à prioriser le sommeil — c'est là que les muscles se réparent.");
      }
      return {
        detected,
        consequences: "Un métier debout physiquement exigeant nécessite une récupération de qualité. Sans sommeil suffisant, la fatigue musculaire s'accumule, la douleur s'intensifie et le risque de blessure augmente progressivement.",
        tips: [
          { id: "ds1", icon: "🦵", text: "Surélève les jambes 20 min avant de dormir — draine les œdèmes, améliore le sommeil" },
          { id: "ds2", icon: "🧦", text: "Si crampes nocturnes aux mollets : magnésium le soir (300-400mg) + hydratation en soirée" },
          { id: "ds3", icon: "🧊", text: "Bain de pieds froid (15°C) 10 min avant le lit — réduit les inflammations et facilite l'endormissement" },
          { id: "ds4", icon: "🛏️", text: "Dors avec un oreiller sous les mollets si jambes lourdes — légère élévation toute la nuit" },
        ],
        immediateActions: [
          "Ce soir : surélève les jambes 20 min contre le mur avant de dormir",
          "Bois un grand verre d'eau avec une pincée de sel ou de magnésium",
          "Masse les mollets avec les pouces vers le haut pendant 2 minutes",
        ],
        exerciseIds: ["leg_elevation", "plantar_massage", "body_scan", "coherence_cardiaque", "toe_spreading"],
        programId: "debout_recovery",
        products: [
          mkProduct("coussin_s", "Coussin surélévation jambes", "20 minutes le soir : draine les œdèmes et améliore la qualité du sommeil", "https://www.amazon.fr/s?k=coussin+surélévation+jambes+récupération", "haute", "~30€", "Récupération"),
          mkProduct("mag_s", "Magnésium marin (bisglycinate)", "Réduit les crampes nocturnes des mollets après journée physique", "https://www.amazon.fr/s?k=magnésium+bisglycinate+crampes+mollets", "moyenne", "~15€"),
        ],
      };
    }

    case "nutrition": {
      const detected: string[] = [];
      const q_d19 = String(a("q_d19") ?? "");
      const q_d18 = String(a("q_d18") ?? "");
      const q_d8 = n("q_d8");

      if (q_d19 === "rarement" || q_d19 === "interdit") {
        detected.push("Tu t'hydrates insuffisamment. Le travail debout augmente les pertes hydriques (transpiration debout) — une déshydratation de seulement 2% aggrave les jambes lourdes et la fatigue musculaire.");
      }
      if (q_d18 === "lourdes" || q_d18 === "tres_lourdes") {
        detected.push("Ton travail est physiquement intense. Tes besoins caloriques sont 20-30% plus élevés qu'un travailleur assis — un sous-apport énergétique crée une fatigue chronique.");
      }
      if (q_d8 >= 2) {
        detected.push("Si tu as de la fasciite plantaire, les anti-inflammatoires naturels (curcuma + pipérine, oméga-3) peuvent réduire significativement l'inflammation plantaire.");
      }
      if (detected.length === 0) {
        detected.push("Ton alimentation semble adaptée à ton activité. Continue à t'hydrater correctement — c'est le levier nutritionnel #1 du travail debout.");
      }
      return {
        detected,
        consequences: "La nutrition et l'hydratation impactent directement la performance et la récupération d'un métier physique. Les carences (eau, magnésium, protéines) se traduisent en fatigue accélérée, crampes et récupération insuffisante.",
        tips: [
          { id: "dn1", icon: "💧", text: "Hydratation critique : 2 à 2.5L par jour (pas 1.5L) pour un métier debout physique" },
          { id: "dn2", icon: "🥩", text: "Apport protéique élevé : ton corps répare les muscles la nuit — 1.5g/kg de protéines minimum" },
          { id: "dn3", icon: "🌿", text: "Curcuma + pipérine quotidien si fasciite ou douleurs articulaires — anti-inflammatoire naturel validé" },
          { id: "dn4", icon: "🐟", text: "Oméga-3 (sardines, maquereaux ou capsules) : réduit l'inflammation et les douleurs articulaires" },
        ],
        immediateActions: [
          "Bois 500ml d'eau maintenant et prépare une bouteille pour les prochaines heures",
          "Ce soir : repas avec protéines (viande, poisson, œufs, légumineuses) pour récupération musculaire",
          "Prends du magnésium ce soir si crampes aux mollets",
        ],
        exerciseIds: ["coherence_cardiaque", "body_scan", "marching", "leg_elevation"],
        programId: "debout_recovery",
        products: [
          mkProduct("gourde_n", "Gourde 1.5L graduée", "Rappel visuel — boire sans y penser tout au long du service", "https://amzn.to/3RAs14A", "haute", "~15€", "Hydratation #1"),
          mkProduct("omega3_n", "Oméga-3 (EPA/DHA concentré)", "Réduit l'inflammation articulaire et plantaire — particulièrement efficace si fasciite", "https://www.amazon.fr/s?k=omega+3+EPA+DHA+articulations+inflammation", "moyenne", "~20€"),
          mkProduct("curcuma_n", "Curcuma + pipérine 95%", "Anti-inflammatoire naturel puissant — efficacité prouvée sur les douleurs articulaires", "https://www.amazon.fr/s?k=curcuma+pipérine+anti+inflammatoire+articulations", "moyenne", "~18€"),
        ],
      };
    }

    default:
      return null;
  }
}

export function getJobDimensionContent(
  dimension: string,
  jobType: string,
  answers: Record<string, unknown>,
): JobDimensionContent | null {
  if (jobType === "debout") return getDeboutDimensionContent(dimension, answers);
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getJobContent(jobType?: string | null): JobData {
  return JOB_CONTENT[(jobType as JobType) ?? "bureau"] ?? JOB_CONTENT.bureau;
}

export function getScoreInterpretation(
  jobData: JobData,
  dimension: string,
  score: number
): string {
  const interp = jobData.score_interpretations[dimension];
  if (!interp) return "";
  if (score < 50) return interp.critical;
  if (score < 70) return interp.attention;
  return interp.good;
}
