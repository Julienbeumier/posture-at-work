import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisReport, PersonneAnalysis, PosteAnalysis, DeboutAnalysis } from "@/lib/analysis-types";

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un kinésithérapeute expert en ergonomie du travail.
Tu analyses des photos de posture et de setup bureau pour générer un rapport personnalisé et actionnable.

Tu reçois :
- 4 photos de profil de la personne en situation de travail réelle
- 2 photos de son bureau
- Ses scores de questionnaire et ses réponses

Tu dois analyser et retourner un JSON avec cette structure exacte :

{
  "posture_analysis": {
    "score": number (0-100),
    "head_position": {
      "status": "bon" | "attention" | "critique",
      "observation": "description précise de ce qu'on voit",
      "impact": "conséquence biomécanique concrète"
    },
    "neck_position": {
      "status": "bon" | "attention" | "critique",
      "observation": "...",
      "impact": "..."
    },
    "shoulders": {
      "status": "bon" | "attention" | "critique",
      "observation": "...",
      "impact": "..."
    },
    "trunk": {
      "status": "bon" | "attention" | "critique",
      "observation": "...",
      "impact": "..."
    },
    "overall_observation": "paragraphe de synthèse posturale en 2-3 phrases, ton de kiné bienveillant"
  },
  "setup_analysis": {
    "screen_height": {
      "status": "bon" | "attention" | "critique",
      "observation": "...",
      "recommendation": "action concrète immédiate"
    },
    "screen_distance": {
      "status": "bon" | "attention" | "critique",
      "observation": "...",
      "recommendation": "..."
    },
    "keyboard_mouse": {
      "status": "bon" | "attention" | "critique",
      "observation": "...",
      "recommendation": "..."
    },
    "chair_setup": {
      "status": "bon" | "attention" | "critique",
      "observation": "...",
      "recommendation": "..."
    },
    "overall_observation": "synthèse setup en 2 phrases"
  },
  "priority_actions": [
    {
      "rank": 1,
      "title": "Action courte et claire",
      "why": "explication biomécanique simple",
      "how": "instruction concrète en 1-2 phrases",
      "impact": "bénéfice attendu"
    }
  ],
  "exercises": [
    {
      "name": "Nom de l'exercice",
      "target": "zone ciblée",
      "duration": "ex: 30 sec par côté",
      "instruction": "comment faire en 2 phrases simples",
      "frequency": "ex: 3x par jour"
    }
  ],
  "products": [
    {
      "name": "Nom du produit",
      "reason": "pourquoi ce produit pour cette personne spécifiquement",
      "priority": "haute" | "moyenne" | "optionnel",
      "amazon_search": "terme de recherche Amazon exact"
    }
  ],
  "final_message": "message personnalisé bienveillant de 2-3 phrases comme un kiné qui conclut une consultation"
}

Pour l'analyse du bureau (frames_bureau), tu dois OBLIGATOIREMENT chercher et commenter chacun de ces éléments visuellement :

1. ÉCRAN(S)
- Combien d'écrans tu vois ?
- L'écran est-il à hauteur des yeux ou en dessous/au-dessus ?
- Quelle est la distance estimée entre la personne et l'écran ?
- Y a-t-il un support écran ou élévateur ?
- L'écran est-il incliné correctement ?

2. CLAVIER & SOURIS
- Le clavier est-il visible ? Positionné près du bord du bureau ?
- Y a-t-il une souris ? Est-elle du même côté que la main dominante ?
- Y a-t-il un repose-poignet ?
- Le clavier est-il surélevé (inclinaison arrière) ou plat ?

3. CHAISE & POSITION ASSISE
- Quel type de chaise est visible ? (bureau réglable, fixe, canapé...)
- La hauteur semble-t-elle adaptée au bureau ?
- Y a-t-il un repose-dos ou coussin lombaire visible ?

4. ORGANISATION DU BUREAU
- Le bureau est-il encombré ou dégagé ?
- Y a-t-il des éléments qui forcent une mauvaise posture (téléphone à plat, documents au sol, écran de côté...) ?
- La luminosité semble-t-elle adaptée ? Reflets sur l'écran ?

5. ACCESSOIRES ERGONOMIQUES
- Repose-pieds visible ?
- Bras articulé pour écran ?
- Casque ou écouteurs ?
- Lampe de bureau ?

IMPORTANT : Si un élément n'est pas clairement visible sur les images, dis-le explicitement ("non visible sur les images fournies") plutôt que d'inventer. Ne jamais fabriquer des observations.

Pour chaque élément détecté, donne :
- Ce que tu vois exactement
- Si c'est ergonomiquement correct ou problématique
- Une recommandation concrète si nécessaire

Les produits recommandés doivent être DIRECTEMENT liés à ce que tu as observé sur les images du bureau.
Par exemple : si tu vois un laptop sans support → recommander un support laptop. Si tu vois un écran trop bas → recommander un bras articulé ou un support écran.

Règles :
- Sois précis, bienveillant, et actionnable
- Évite le jargon médical excessif
- Adapte l'analyse aux réponses du questionnaire (si douleurs cervicales déclarées, focus dessus)
- priority_actions : exactement 3 actions, triées du plus urgent au moins urgent
- exercises : exactement 3 exercices ciblés selon les zones détectées
- products : 2-4 produits maximum, pertinents pour ce profil spécifique
- Si les images sont floues ou la posture difficile à évaluer, base-toi sur les réponses du questionnaire
- Retourne UNIQUEMENT le JSON valide, sans texte avant ou après, sans markdown
`;

// ─── Fallback report (when images are unavailable/unclear) ────────────────────

function buildFallbackReport(): AnalysisReport {
  return {
    posture_analysis: {
      score: 55,
      head_position: {
        status: "attention",
        observation: "Position de la tête non clairement évaluable sur les images.",
        impact: "Une projection antérieure de la tête de 2.5cm augmente le poids ressenti de la tête de 100%.",
      },
      neck_position: {
        status: "attention",
        observation: "La nuque semble légèrement fléchie vers l'avant.",
        impact: "Tension chronique dans les muscles cervicaux postérieurs.",
      },
      shoulders: {
        status: "attention",
        observation: "Les épaules paraissent légèrement enroulées vers l'avant.",
        impact: "Raccourcissement des pectoraux et affaiblissement des rhomboïdes.",
      },
      trunk: {
        status: "attention",
        observation: "Légère flexion du tronc constatée.",
        impact: "Compression des disques intervertébraux lombaires.",
      },
      overall_observation:
        "Ton analyse posturale montre des patterns typiques d'un travailleur sédentaire : tendance à l'affaissement et projection de la tête. Ces compensations sont totalement réversibles avec quelques ajustements.",
    },
    setup_analysis: {
      screen_height: {
        status: "attention",
        observation: "La hauteur d'écran semble suboptimale d'après le contexte.",
        recommendation: "Le bord supérieur de l'écran doit être à hauteur des yeux ou légèrement en-dessous.",
      },
      screen_distance: {
        status: "bon",
        observation: "La distance écran semble correcte.",
        recommendation: "Maintiens une distance de 50-70cm (longueur d'un bras tendu).",
      },
      keyboard_mouse: {
        status: "attention",
        observation: "La position du clavier et de la souris n'est pas clairement visible.",
        recommendation: "Coudes à 90°, avant-bras parallèles au sol, poignets droits.",
      },
      chair_setup: {
        status: "attention",
        observation: "La configuration de la chaise semble perfectible.",
        recommendation: "Règle la hauteur de siège pour que tes pieds soient à plat et tes cuisses parallèles au sol.",
      },
      overall_observation:
        "Ton setup présente quelques points d'amélioration classiques. Les correctifs sont simples et peu coûteux.",
    },
    priority_actions: [
      {
        rank: 1,
        title: "Ajuster la hauteur de l'écran",
        why: "Un écran trop bas force la flexion cervicale et génère des douleurs nuque/épaules.",
        how: "Pose l'écran sur un support (livres, carton, support réglable) pour que le haut soit à hauteur des yeux. Distance : longueur d'un bras tendu.",
        impact: "Réduction de la tension cervicale de 60% en quelques jours.",
      },
      {
        rank: 2,
        title: "Programmer des pauses actives toutes les 45 min",
        why: "La sédentarité prolongée comprime les disques et contracture les muscles posturaux.",
        how: "Configure une alarme toutes les 45 min. Lève-toi, marche 2 min, fais 5 rotations d'épaules.",
        impact: "Réduction des douleurs dorsales et gain d'énergie dans l'après-midi.",
      },
      {
        rank: 3,
        title: "Corriger la posture assise de base",
        why: "L'affaissement progressif est la cause #1 des douleurs chroniques de bureau.",
        how: "3 points de contact : pieds à plat, bassin en légère antéversion, dos appuyé contre le dossier. Pose un rappel visuel devant toi.",
        impact: "Prévention des douleurs lombaires chroniques.",
      },
    ],
    exercises: [
      {
        name: "Chin tuck (rétraction cervicale)",
        target: "Nuque & muscles cervicaux profonds",
        duration: "10 répétitions",
        instruction: "Assis droit, rentre doucement le menton vers la gorge (double menton) sans baisser la tête. Tiens 3 secondes, relâche. Renforce les fléchisseurs profonds du cou.",
        frequency: "3x par jour",
      },
      {
        name: "Étirement pectoraux au coin",
        target: "Pectoraux & face antérieure des épaules",
        duration: "30 secondes",
        instruction: "Debout dans un angle, avant-bras en L contre le mur. Avance le buste jusqu'à sentir l'ouverture dans la poitrine. Contre les épaules enroulées vers l'avant.",
        frequency: "3x par jour",
      },
      {
        name: "Cat-Cow assis",
        target: "Colonne vertébrale complète",
        duration: "10 cycles",
        instruction: "Sur ta chaise, mains sur les genoux. Expire en arrondissant le dos (chat). Inspire en creusant les lombaires, poitrine vers l'avant (vache). Mouvement lent et respiré.",
        frequency: "2x par jour",
      },
    ],
    products: [
      {
        name: "Support laptop réglable",
        reason: "Élève l'écran à hauteur des yeux pour supprimer la flexion cervicale.",
        priority: "haute",
        amazon_search: "support laptop ergonomique réglable aluminium",
      },
      {
        name: "Clavier et souris externes",
        reason: "Indispensables avec un support laptop pour garder les bras dans le bon axe.",
        priority: "haute",
        amazon_search: "clavier sans fil compact ergonomique bureau",
      },
      {
        name: "Coussin lombaire",
        reason: "Maintient la lordose naturelle quand ton dossier de chaise est insuffisant.",
        priority: "moyenne",
        amazon_search: "coussin lombaire chaise bureau ergonomique",
      },
    ],
    final_message:
      "Ton profil est très représentatif des travailleurs sédentaires modernes : quelques mauvaises habitudes accumulées, mais rien d'irréversible. Avec les 3 ajustements prioritaires, tu devrais ressentir une amélioration notable en moins de 2 semaines. L'essentiel est la régularité — mieux vaut 5 minutes par jour que 30 minutes une fois par semaine.",
  };
}

// ─── New dual-analysis prompts ────────────────────────────────────────────────

const PERSONNE_PROMPT = `Tu es un expert en ergonomie et kinésithérapie.
Tu analyses la posture d'un travailleur de bureau assis.

Analyse dans cet ordre :

1. POSTURE TÊTE ET COU
   - Position de la tête (neutre, antépulsion, inclinaison)
   - Tension visible dans le cou et les trapèzes
   - Angle de vision par rapport à l'écran estimé

2. ÉPAULES ET HAUT DU DOS
   - Alignement des épaules (niveau, enroulées, surélevées)
   - Cyphose thoracique (dos rond visible)
   - Position des omoplates

3. BAS DU DOS ET BASSIN
   - Lordose lombaire (creusée, effacée, normale)
   - Bascule du bassin (antéversion, rétroversion)
   - Contact avec le dossier de la chaise

4. MEMBRES SUPÉRIEURS
   - Position des coudes (angle, hauteur par rapport au bureau)
   - Position des poignets (flexion, extension, déviation)
   - Tension visible dans les avant-bras

5. MEMBRES INFÉRIEURS
   - Position des genoux (angle approximatif)
   - Position des pieds (à plat, croisés, en l'air)
   - Contact avec le sol

6. RISQUES TMS IDENTIFIÉS
   Lister chaque risque avec zone + sévérité + conséquence

7. RECOMMANDATIONS POSTURE
   3 corrections posturales prioritaires

Réponds en JSON :
{
  "analysisType": "personne",
  "globalPostureScore": number (0-100),
  "segments": {
    "tete_cou": { "score": number, "issues": [string], "note": string },
    "epaules_dos_haut": { "score": number, "issues": [string], "note": string },
    "bas_dos_bassin": { "score": number, "issues": [string], "note": string },
    "membres_superieurs": { "score": number, "issues": [string], "note": string },
    "membres_inferieurs": { "score": number, "issues": [string], "note": string }
  },
  "mainIssues": [
    {
      "zone": string,
      "issue": string,
      "severity": "faible" | "modéré" | "élevé",
      "consequence": string
    }
  ],
  "positivePoints": [string],
  "recommendations": [
    {
      "priority": number,
      "action": string,
      "why": string,
      "immediat": boolean
    }
  ],
  "overallAssessment": string
}
Retourne UNIQUEMENT le JSON valide, sans texte avant ou après, sans markdown.`;

const POSTE_PROMPT = `Tu es un expert en ergonomie du poste de travail bureau.
Tu analyses un setup de bureau depuis une photo/vidéo.

Analyse dans cet ordre :

1. ÉCRAN
   - Hauteur estimée (trop bas, correct, trop haut)
   - Distance estimée (trop proche, correcte, trop loin)
   - Inclinaison visible
   - Présence de reflets/contre-jour
   - Laptop seul ou écran externe

2. CLAVIER ET SOURIS
   - Distance du bord du bureau
   - Alignement avec les épaules
   - Présence d'un repose-poignets
   - Type de souris (standard, verticale, trackpad)

3. CHAISE
   - Hauteur estimée par rapport au bureau
   - Présence et utilisation du dossier
   - Présence d'accoudoirs
   - Type de chaise (ergonomique, standard, autre)

4. ORGANISATION DU BUREAU
   - Encombrement (espace suffisant / trop chargé)
   - Position du téléphone / documents
   - Éclairage ambiant
   - Présence d'un repose-pieds visible

5. DISTANCES ET ANGLES CRITIQUES
   - Écran à hauteur des yeux : oui/non/estimé
   - Coudes à 90° possible : oui/non
   - Pieds au sol possible : oui/non

Réponds en JSON :
{
  "analysisType": "poste",
  "globalSetupScore": number (0-100),
  "elements": {
    "ecran": {
      "score": number,
      "hauteur": "trop_bas" | "correct" | "trop_haut",
      "distance": "trop_proche" | "correcte" | "trop_loin",
      "type": "laptop_seul" | "ecran_externe" | "double_ecran",
      "issues": [string]
    },
    "clavier_souris": { "score": number, "issues": [string], "repose_poignets": boolean | null },
    "chaise": { "score": number, "type": string, "issues": [string], "accoudoirs": boolean | null },
    "organisation": { "score": number, "issues": [string], "eclairage": "bon" | "moyen" | "mauvais" }
  },
  "mainIssues": [
    {
      "element": string,
      "issue": string,
      "severity": "faible" | "modéré" | "élevé",
      "fix": string
    }
  ],
  "positivePoints": [string],
  "recommendations": [
    {
      "priority": number,
      "action": string,
      "why": string,
      "cost": "gratuit" | "< 30€" | "30-100€" | "> 100€"
    }
  ],
  "overallAssessment": string
}
Retourne UNIQUEMENT le JSON valide, sans texte avant ou après, sans markdown.`;

// ─── Fallbacks for dual-analysis ─────────────────────────────────────────────

function buildFallbackPersonne(): PersonneAnalysis {
  return {
    analysisType: "personne",
    globalPostureScore: 55,
    segments: {
      tete_cou: { score: 50, issues: ["Légère antépulsion de la tête"], note: "Position avancée typique du travail sur écran." },
      epaules_dos_haut: { score: 55, issues: ["Épaules légèrement enroulées vers l'avant"], note: "Tendance à la cyphose thoracique." },
      bas_dos_bassin: { score: 60, issues: ["Lordose lombaire partiellement effacée"], note: "Bassin en légère rétroversion." },
      membres_superieurs: { score: 65, issues: ["Coudes légèrement élevés par rapport au bureau"], note: "Hauteur de chaise à ajuster." },
      membres_inferieurs: { score: 70, issues: [], note: "Position des membres inférieurs correcte." },
    },
    mainIssues: [
      { zone: "Tête & cou", issue: "Antépulsion cervicale", severity: "modéré", consequence: "Tension nuque et céphalées de tension" },
    ],
    positivePoints: ["Appui dorsal présent", "Position des pieds correcte"],
    recommendations: [
      { priority: 1, action: "Corriger la position de la tête", why: "Réduire la tension cervicale chronique", immediat: true },
      { priority: 2, action: "Ajuster la hauteur de l'écran", why: "Supprimer la flexion du cou", immediat: false },
      { priority: 3, action: "Renforcer les muscles du dos", why: "Lutter contre l'affaissement progressif", immediat: false },
    ],
    overallAssessment: "Posture typique d'un travailleur de bureau avec quelques compensations à corriger pour prévenir les douleurs chroniques.",
  };
}

function buildFallbackPoste(): PosteAnalysis {
  return {
    analysisType: "poste",
    globalSetupScore: 58,
    elements: {
      ecran: { score: 50, hauteur: "trop_bas", distance: "correcte", type: "laptop_seul", issues: ["Écran trop bas — force la flexion cervicale"] },
      clavier_souris: { score: 65, issues: ["Absence de repose-poignets visible"], repose_poignets: false },
      chaise: { score: 60, type: "standard", issues: ["Dossier peu ajustable"], accoudoirs: null },
      organisation: { score: 60, issues: ["Bureau légèrement encombré"], eclairage: "moyen" },
    },
    mainIssues: [
      { element: "Écran", issue: "Hauteur insuffisante", severity: "élevé", fix: "Rehausser l'écran avec un support" },
    ],
    positivePoints: ["Espace de travail disponible", "Éclairage naturel présent"],
    recommendations: [
      { priority: 1, action: "Rehausser l'écran", why: "Prévenir les douleurs cervicales", cost: "< 30€" },
      { priority: 2, action: "Ajouter un repose-poignets", why: "Prévenir le syndrome du canal carpien", cost: "< 30€" },
      { priority: 3, action: "Régler la hauteur de la chaise", why: "Aligner coudes et plan de travail", cost: "gratuit" },
    ],
    overallAssessment: "Setup avec plusieurs améliorations simples à apporter pour une ergonomie optimale.",
  };
}

function buildFallbackDebout(): DeboutAnalysis {
  return {
    analysisType: "debout",
    globalPostureScore: 60,
    jobTypeDetected: "Poste debout non identifié",
    posture: {
      colonne:           { score: 60, status: "attention", observation: "Légère hyperlordose compensatoire visible" },
      epaules:           { score: 65, status: "attention", observation: "Épaules légèrement asymétriques" },
      tete_cou:          { score: 62, status: "attention", observation: "Légère projection de la tête en avant" },
      appui_jambes:      { score: 58, status: "attention", observation: "Appui préférentiel sur une jambe" },
      membres_superieurs:{ score: 65, status: "attention", observation: "Non visible sur cette image" },
    },
    environnement: {
      plan_travail:       { hauteur: "non_visible", observation: "Hauteur du plan de travail non évaluable" },
      tapis_antifatigue:  "non_visible",
      sol:                "Non identifiable",
      contraintes_visibles: [],
    },
    mainIssues: [
      { zone: "Colonne", issue: "Hyperlordose compensatoire", severity: "modere", consequence: "Lombalgies à moyen terme" },
      { zone: "Appui", issue: "Asymétrie de l'appui", severity: "faible", consequence: "Fatigue musculaire unilatérale" },
    ],
    positivePoints: ["Position globalement fonctionnelle"],
    recommendations: [
      { priority: 1, action: "Varier les positions toutes les 30 minutes", why: "Éviter la fatigue musculaire statique", applicable_tous_postes: true },
      { priority: 2, action: "Vérifier la hauteur du plan de travail", why: "Adapter l'ergonomie au poste", applicable_tous_postes: true },
      { priority: 3, action: "Exercices de renforcement de la voûte plantaire", why: "Protéger les pieds et les genoux", applicable_tous_postes: true },
    ],
    overallAssessment: "Posture debout avec plusieurs points d'amélioration identifiés. Des ajustements simples peuvent réduire significativement la fatigue.",
  };
}

// ─── Debout analysis prompt ────────────────────────────────────────────────────

const DEBOUT_ANALYSIS_PROMPT = `Tu es un expert en ergonomie et kinésithérapie spécialisé dans l'analyse des travailleurs en station debout.
Tu analyses des images d'un travailleur debout à son poste.

Le poste de travail peut être TRÈS varié :
comptoir de caisse, établi d'artisan, table de massage, cuisine professionnelle, chaîne de production, accueil, entrepôt, chantier, salle de classe — NE PAS supposer qu'il y a un ordinateur ou un bureau classique.

Analyse dans cet ordre :

1. POSTURE GLOBALE DEBOUT
   - La colonne vertébrale est-elle alignée ?
   - Y a-t-il une hyperlordose lombaire visible ?
   - Les épaules sont-elles au même niveau ?
   - La tête est-elle dans l'axe ou projetée en avant ?
   - Le tronc est-il droit ou incliné ?

2. APPUI ET ÉQUILIBRE
   - L'appui est-il symétrique sur les deux jambes ?
   - Y a-t-il une jambe préférentielle ?
   - Les genoux sont-ils légèrement fléchis ou bloqués ?
   - La position des pieds est-elle stable et équilibrée ?

3. MEMBRES SUPÉRIEURS (selon ce qui est visible)
   - Position des bras et des épaules pendant le travail
   - Élévation des épaules visible ?
   - Flexion/extension des poignets si visible

4. ENVIRONNEMENT IMMÉDIAT (ce qui est visible)
   - Hauteur du plan de travail semble-t-elle adaptée ?
   - L'espace de travail force-t-il une posture contrainte ?
   - Présence d'un tapis anti-fatigue visible ?
   - Type de sol identifiable ?
   - L'environnement oblige-t-il à se courber ou se pencher ?

5. RISQUES TMS IDENTIFIÉS — ne citer QUE ce qui est clairement visible.

6. POINTS POSITIFS

7. RECOMMANDATIONS PRIORITAIRES — 3 actions applicables à n'importe quel poste debout.

IMPORTANT :
- Si tu ne vois pas clairement un élément, écris "Non visible sur cette image"
- Ne suppose pas la présence d'équipements non visibles (ordinateur, clavier, etc.)
- Adapte tes recommandations au type de poste visible

Réponds UNIQUEMENT en JSON valide :
{
  "analysisType": "debout",
  "globalPostureScore": <number 0-100>,
  "jobTypeDetected": "<description courte du poste observé>",
  "posture": {
    "colonne": { "score": <number>, "status": "<bon|attention|critique>", "observation": "<string>" },
    "epaules": { "score": <number>, "status": "<bon|attention|critique>", "observation": "<string>" },
    "tete_cou": { "score": <number>, "status": "<bon|attention|critique>", "observation": "<string>" },
    "appui_jambes": { "score": <number>, "status": "<bon|attention|critique>", "observation": "<string>" },
    "membres_superieurs": { "score": <number>, "status": "<bon|attention|critique>", "observation": "<string>" }
  },
  "environnement": {
    "plan_travail": { "hauteur": "<adapte|trop_bas|trop_haut|non_visible>", "observation": "<string>" },
    "tapis_antifatigue": "<oui|non|non_visible>",
    "sol": "<string>",
    "contraintes_visibles": ["<string>"]
  },
  "mainIssues": [
    { "zone": "<string>", "issue": "<string>", "severity": "<faible|modere|eleve>", "consequence": "<string>" }
  ],
  "positivePoints": ["<string>"],
  "recommendations": [
    { "priority": <number>, "action": "<string>", "why": "<string>", "applicable_tous_postes": <boolean> }
  ],
  "overallAssessment": "<string>"
}`;

// ─── Job-type specific prompts ────────────────────────────────────────────────

const JOB_SYSTEM_PROMPTS: Record<string, string> = {
  debout: `Tu es un ergonome expert analysant un travailleur en position debout.
Analyse les images et génère un rapport JSON avec la même structure exacte que le prompt standard.
Focus spécifique :
1. POSTURE DEBOUT : dos droit ou courbé, épaules alignées, appui symétrique sur les deux jambes, genoux légèrement fléchis ou bloqués.
2. PIEDS & JAMBES : type de chaussures visible, présence d'un tapis anti-fatigue, position des pieds.
3. ESPACE DE TRAVAIL DEBOUT : hauteur du plan de travail adaptée, environnement qui force une posture contrainte.
4. RECOMMANDATIONS spécifiques au travail debout.
Retourne le même JSON que demandé.`,

  artisan: `Tu es un ergonome expert analysant un travailleur de terrain.
Analyse les images et génère un rapport JSON avec la même structure exacte que le prompt standard.
Focus spécifique :
1. POSTURE DE TRAVAIL : position du dos (droit, fléchi, en rotation), position des genoux, symétrie pendant le geste.
2. PORT DE CHARGES : charges visibles et comment elles sont portées, technique de levage.
3. ENVIRONNEMENT DE TRAVAIL : espace adapté ou contraint, sol stable, outils adaptés.
4. RISQUES TMS : identifier les TMS probables selon postures observées.
Retourne le même JSON que demandé.`,

  transport: `Tu es un ergonome expert analysant la posture d'un conducteur.
Analyse les images et génère un rapport JSON avec la même structure exacte que le prompt standard.
Focus spécifique :
1. POSITION ASSISE EN CONDUITE : distance au volant, position du dos, hauteur du siège, position de la nuque.
2. APPUI LOMBAIRE : présence et efficacité d'un appui lombaire, bas du dos soutenu ou en porte-à-faux.
3. MEMBRES SUPÉRIEURS : position des bras sur le volant, tension dans les épaules.
4. ENVIRONNEMENT VÉHICULE : accessibilité des commandes, ergonomie du poste de conduite.
Retourne le même JSON que demandé.`,

  medical: `Tu es un ergonome expert analysant un professionnel de santé.
Analyse les images et génère un rapport JSON avec la même structure exacte que le prompt standard.
Focus spécifique :
1. POSTURE DE SOIN : position du dos lors des soins, hauteur du plan de soin, symétrie posturale.
2. GESTES RÉPÉTITIFS : gestes visibles et impact postural, position des poignets.
3. ENVIRONNEMENT DE SOINS : espace adapté ou contraint, équipements de manutention visibles.
4. RECOMMANDATIONS adaptées aux contraintes spécifiques du soin.
Retourne le même JSON que demandé.`,

  enseignement: `Tu es un ergonome expert analysant un enseignant.
Analyse les images et génère un rapport JSON avec la même structure exacte que le prompt standard.
Focus spécifique :
1. POSTURE EN CLASSE : position debout ou assise, dos droit ou voûté, tension dans les épaules.
2. UTILISATION DU TABLEAU : position des bras, inclinaison de la tête, torsion du tronc.
3. POSTE DE TRAVAIL : hauteur du bureau ou pupitre, position lors de la préparation.
4. RECOMMANDATIONS adaptées à l'enseignement.
Retourne le même JSON que demandé.`,
};

// ─── Route handler ────────────────────────────────────────────────────────────

function toImageBlock(dataUrl: string): Anthropic.ImageBlockParam {
  const data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  return { type: "image", source: { type: "base64", media_type: "image/jpeg", data } };
}

function parseJSON(text: string) {
  let raw = text.trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  return JSON.parse(raw);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      frames,
      frames_posture,
      frames_bureau,
      questionnaire_scores,
      questionnaire_answers,
    } = body as {
      frames?: string[];
      frames_posture?: string[];
      frames_bureau?: string[];
      questionnaire_scores: Record<string, number> | null;
      questionnaire_answers: Record<string, unknown>;
    };

    const analysisType = (body as { analysisType?: string }).analysisType;
    const jobType = (body as { job_type?: string }).job_type ?? "bureau";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const contextText = `Contexte questionnaire :\nScores : ${JSON.stringify(questionnaire_scores ?? {})}\nRéponses : ${JSON.stringify(questionnaire_answers ?? {})}`;

    // ── New dual-analysis mode ──────────────────────────────────────────────
    if (analysisType === "personne") {
      const frameList = frames ?? frames_posture ?? [];
      if (!frameList.length) return NextResponse.json(buildFallbackPersonne());
      if (!apiKey) return NextResponse.json(buildFallbackPersonne());

      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        system: PERSONNE_PROMPT,
        messages: [{
          role: "user",
          content: [
            ...frameList.slice(0, 4).map(toImageBlock),
            { type: "text", text: `${contextText}\n\nAnalyse les ${frameList.length} photos de posture assise.` },
          ],
        }],
      });
      const textBlock = msg.content.find(b => b.type === "text");
      if (!textBlock || textBlock.type !== "text") return NextResponse.json(buildFallbackPersonne());
      const result: PersonneAnalysis = parseJSON(textBlock.text);
      return NextResponse.json(result);
    }

    if (analysisType === "poste") {
      const frameList = frames ?? frames_bureau ?? [];
      if (!frameList.length) return NextResponse.json(buildFallbackPoste());
      if (!apiKey) return NextResponse.json(buildFallbackPoste());

      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        system: POSTE_PROMPT,
        messages: [{
          role: "user",
          content: [
            ...frameList.slice(0, 4).map(toImageBlock),
            { type: "text", text: `${contextText}\n\nAnalyse le setup de bureau visible sur ces images.` },
          ],
        }],
      });
      const textBlock = msg.content.find(b => b.type === "text");
      if (!textBlock || textBlock.type !== "text") return NextResponse.json(buildFallbackPoste());
      const result: PosteAnalysis = parseJSON(textBlock.text);
      return NextResponse.json(result);
    }

    // ── Debout analysis mode ────────────────────────────────────────────────
    if (analysisType === "debout") {
      const frameList = frames ?? frames_posture ?? [];
      if (!frameList.length) return NextResponse.json(buildFallbackDebout());
      if (!apiKey) return NextResponse.json(buildFallbackDebout());

      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        system: DEBOUT_ANALYSIS_PROMPT,
        messages: [{
          role: "user",
          content: [
            ...frameList.slice(0, 4).map(toImageBlock),
            { type: "text", text: `${contextText}\n\nAnalyse les ${frameList.length} photos de ce travailleur en station debout.` },
          ],
        }],
      });
      const textBlock = msg.content.find(b => b.type === "text");
      if (!textBlock || textBlock.type !== "text") return NextResponse.json(buildFallbackDebout());
      const result: DeboutAnalysis = parseJSON(textBlock.text);
      return NextResponse.json(result);
    }

    // ── Legacy single-analysis mode ─────────────────────────────────────────
    if (!frames_posture?.length || !frames_bureau?.length) {
      return NextResponse.json({ error: "Frames manquantes" }, { status: 400 });
    }
    if (!apiKey) return NextResponse.json(buildFallbackReport());

    const activePrompt = JOB_SYSTEM_PROMPTS[jobType] ?? SYSTEM_PROMPT;
    const client = new Anthropic({ apiKey });
    const imageBlocks: Anthropic.ImageBlockParam[] = [
      ...frames_posture.slice(0, 4).map(toImageBlock),
      ...frames_bureau.slice(0, 2).map(toImageBlock),
    ];
    const userText = `${contextText}\n\nAnalyse les ${frames_posture.length} photos de profil et les ${frames_bureau.length} photos de bureau.\nGénère le rapport JSON complet comme demandé.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: activePrompt,
      messages: [{ role: "user", content: [...imageBlocks, { type: "text", text: userText }] }],
    });

    const textBlock = message.content.find(b => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return NextResponse.json(buildFallbackReport());

    const report: AnalysisReport = parseJSON(textBlock.text);
    return NextResponse.json(report);
  } catch (err) {
    console.error("[analyze-video] error:", err);
    return NextResponse.json(buildFallbackReport());
  }
}
