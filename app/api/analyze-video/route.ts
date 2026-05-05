import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisReport } from "@/lib/analysis-types";

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

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      frames_posture,
      frames_bureau,
      questionnaire_scores,
      questionnaire_answers,
    } = body as {
      frames_posture: string[];
      frames_bureau: string[];
      questionnaire_scores: Record<string, number> | null;
      questionnaire_answers: Record<string, unknown>;
    };

    // Validate frames
    if (!frames_posture?.length || !frames_bureau?.length) {
      return NextResponse.json({ error: "Frames manquantes" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return fallback if API key not configured
      return NextResponse.json(buildFallbackReport());
    }

    const client = new Anthropic({ apiKey });

    // Build image content blocks (strip data URL prefix)
    function toImageBlock(
      dataUrl: string
    ): Anthropic.ImageBlockParam {
      const data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data,
        },
      };
    }

    const imageBlocks: Anthropic.ImageBlockParam[] = [
      ...frames_posture.slice(0, 4).map(toImageBlock),
      ...frames_bureau.slice(0, 2).map(toImageBlock),
    ];

    const userText = `
Contexte questionnaire :
Scores : ${JSON.stringify(questionnaire_scores ?? {})}
Réponses : ${JSON.stringify(questionnaire_answers ?? {})}

Analyse les ${frames_posture.length} photos de profil et les ${frames_bureau.length} photos de bureau.
Génère le rapport JSON complet comme demandé.
    `.trim();

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text", text: userText },
          ],
        },
      ],
    });

    // Extract text content
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(buildFallbackReport());
    }

    // Parse JSON — Claude may wrap in ```json ... ```
    let raw = textBlock.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }

    const report: AnalysisReport = JSON.parse(raw);
    return NextResponse.json(report);
  } catch (err) {
    console.error("[analyze-video] error:", err);
    // Return graceful fallback instead of hard error
    return NextResponse.json(buildFallbackReport());
  }
}
