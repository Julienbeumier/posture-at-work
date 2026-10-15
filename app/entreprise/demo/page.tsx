"use client";

import { planLabel } from "@/lib/plans";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { analyzeCollectiveVideo, VideoRevealBlock } from "@/components/dashboard/VideoCollective";
import { ParcoursStep, ParcoursLinkCard, PARCOURS_STEPS } from "@/components/dashboard/ParcoursStep";
import { useTheme } from "@/contexts/ThemeContext";
import type { Company } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

function useDemoAuth() {
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token === (process.env.NEXT_PUBLIC_DEMO_TOKEN ?? "pawdemo2026")) {
      setAuthorized(true);
    } else {
      window.location.href = "/entreprise";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return authorized;
}

const DIM_META: Record<string, { label: string; emoji: string; color: string; type: "employeur" | "employe" }> = {
  setup:        { label: "Setup & ergonomie",  emoji: "💻", color: "#6f9bff",  type: "employeur" },
  habits:       { label: "Habitudes de travail", emoji: "⏱️", color: "#ffa347", type: "employeur" },
  pain:         { label: "Douleurs",            emoji: "🩺", color: "#ff7b7b", type: "employeur" },
  sleep_energy: { label: "Sommeil & énergie",   emoji: "🌙", color: "#3fe0a0", type: "employe" },
  nutrition:    { label: "Nutrition",           emoji: "🍽️", color: "#a78bfa", type: "employe" },
  lifestyle:    { label: "Mode de vie actif",   emoji: "🏃", color: "#5dcaa5", type: "employe" },
};

const ACTIONS_BY_DIM: Record<string, { action: string; impact: string }> = {
  setup: { action: "Auditer les postes de travail — écrans, chaises, claviers", impact: "Impact direct sur 3 dimensions" },
  habits: { action: "Mettre en place des pauses actives toutes les 45 minutes", impact: "Réduction immédiate des TMS chroniques" },
  pain: { action: "Identifier les postes à risque et adapter l'environnement", impact: "Prévention des arrêts de travail" },
  sleep_energy: { action: "Sensibiliser aux bonnes pratiques de récupération", impact: "Amélioration de la productivité globale" },
  nutrition: { action: "Proposer des options santé à la cafétéria ou espace repas", impact: "Réduction de la fatigue post-déjeuner" },
  lifestyle: { action: "Encourager la mobilité douce (vélo, marche à midi)", impact: "Compensation de la sédentarité" },
};

const EXERCISES_BY_PROFILE: Record<string, { name: string; duration: string; desc: string; emoji: string }[]> = {
  bureau: [
    { name: "Rétraction cervicale", duration: "10 rép. × 3", desc: "Contre la projection de la tête vers l'avant — typique du laptop.", emoji: "🧘" },
    { name: "Ouverture pectorale au mur", duration: "45 sec × 2", desc: "Contre les épaules enroulées. Idéal après 2h de bureau.", emoji: "🤸" },
    { name: "Cat-Cow assis", duration: "10 cycles", desc: "Mobilisation complète de la colonne sur la chaise.", emoji: "🐱" },
    { name: "Rotation thoracique", duration: "10 rép. × 2", desc: "Déverrouille le dos moyen bloqué par la position assise.", emoji: "🔄" },
  ],
  debout: [
    { name: "Étirement mollets au mur", duration: "45 sec × 2", desc: "Aide à soulager les jambes lourdes et les crampes.", emoji: "🦵" },
    { name: "Flexion lombaire debout", duration: "30 sec × 3", desc: "Soulage le bas du dos après stations debout prolongées.", emoji: "🌿" },
    { name: "Rotation des épaules", duration: "15 rép. × 2", desc: "Libère les tensions des trapèzes — manutention et postures statiques.", emoji: "💪" },
    { name: "Équilibre unipodal", duration: "30 sec × 2", desc: "Renforce les stabilisateurs de cheville et genou.", emoji: "🦅" },
  ],
};

const RESOURCES = [
  {
    category: "Ergonomie bureau",
    color: "#2b5ce6",
    items: [
      {
        title: "Ergonomie du poste de travail — réglages et posture",
        source: "Santé au travail",
        type: "video" as const,
        url: "https://www.youtube.com/watch?v=TueBKiGd3Pg&t=132s",
        desc: "Guide complet pour régler son poste de travail et adopter une posture correcte — écran, chaise, clavier, souris.",
      },
      {
        title: "La bonne posture pour travailler à la maison — conseils de kiné",
        source: "Kiné conseil",
        type: "video" as const,
        url: "https://www.youtube.com/watch?v=MtR6vy6adPc",
        desc: "Alexandre Prims, masseur-kinésithérapeute, donne 3 conseils pratiques pour bien travailler en télétravail.",
      },
    ],
  },
  {
    category: "Manutention & postures debout",
    color: "#d4622a",
    items: [
      {
        title: "5 principes de manutention manuelle — série complète",
        source: "IRSST",
        type: "video" as const,
        url: "https://www.youtube.com/watch?v=VRfM5Sjtw6A&list=PLSbQpsBzoD3U_077FTsasCuPwHa7DD63f",
        desc: "Série complète en 5 épisodes basée sur les recherches de l'Institut de recherche Robert-Sauvé. La référence francophone sur la manutention sécurisée.",
      },
      {
        title: "Webinaire ergonomie au poste de travail",
        source: "Expert prévention",
        type: "video" as const,
        url: "https://www.youtube.com/watch?v=__pUpYt3m2g",
        desc: "Replay complet d'un webinaire professionnel sur l'ergonomie et l'amélioration des conditions de travail des salariés.",
      },
    ],
  },
  {
    category: "Guides pratiques",
    color: "#1d9e75",
    items: [
      {
        title: "Guide ergonomie du poste de travail",
        source: "INRS",
        type: "guide" as const,
        url: "https://www.inrs.fr/risques/travail-ecran/publications-outils-liens.html",
        desc: "Publication officielle ED 924 — checklist complète pour l'employeur.",
      },
      {
        title: "Prévention des TMS — dossier complet",
        source: "INRS",
        type: "guide" as const,
        url: "https://www.inrs.fr/risques/tms-troubles-musculosquelettiques/ce-qu-il-faut-retenir.html",
        desc: "Tout ce qu'un employeur doit savoir sur la prévention TMS.",
      },
    ],
  },
];

const PRODUCTS_BY_ISSUE: Record<string, { name: string; url: string; price: string; reason: string }[]> = {
  setup_bureau: [
    { name: "Rehausseur écran GRIFEMA", url: "https://www.amazon.fr/s?k=Rehausseur+%C3%A9cran+GRIFEMA&tag=postureatwo09-21", price: "~28€", reason: "Corrige la hauteur d'écran — réduit la charge cervicale de 12kg" },
    { name: "Support laptop ergonomique", url: "https://www.amazon.fr/s?k=Support+laptop+ergonomique&tag=postureatwo09-21", price: "~30€", reason: "Utile pour tout usage prolongé d'un laptop : permet de relever l'écran à hauteur des yeux" },
    { name: "Souris verticale Trust Verto", url: "https://www.amazon.fr/s?k=Souris+verticale+Trust+Verto&tag=postureatwo09-21", price: "~25€", reason: "Aide à réduire la torsion du poignet" },
  ],
  setup_debout: [
    { name: "Tapis anti-fatigue", url: "https://www.amazon.fr/s?k=Tapis+anti-fatigue&tag=postureatwo09-21", price: "~45€", reason: "Aide à réduire la fatigue des jambes et lombaires en station debout prolongée" },
    { name: "Semelles orthopédiques", url: "https://www.amazon.fr/s?k=Semelles+orthop%C3%A9diques&tag=postureatwo09-21", price: "~30€", reason: "Amorti et soutien de la voûte plantaire — peut aider sur les postes debout prolongés (à essayer individuellement)" },
    { name: "Chaussettes de compression", url: "https://www.amazon.fr/s?k=Chaussettes+de+compression&tag=postureatwo09-21", price: "~20€", reason: "Aide à soulager les jambes lourdes" },
  ],
  douleurs_bureau: [
    { name: "Coussin lombaire FORTEM", url: "https://www.amazon.fr/s?k=Coussin+lombaire+FORTEM&tag=postureatwo09-21", price: "~30€", reason: "Soutient la courbure lombaire en position assise — peut aider à réduire la gêne lombaire" },
    { name: "Balle de massage BLACKROLL", url: "https://www.amazon.fr/s?k=Balle+de+massage+BLACKROLL&tag=postureatwo09-21", price: "~15€", reason: "Permet un auto-massage des zones de tension nuque et épaules" },
  ],
  douleurs_debout: [
    { name: "Balle massage plantaire", url: "https://www.amazon.fr/s?k=Balle+massage+plantaire&tag=postureatwo09-21", price: "~15€", reason: "Peut soulager les tensions du pied après journée debout" },
    { name: "Coussin surélévation jambes", url: "https://www.amazon.fr/s?k=Coussin+sur%C3%A9l%C3%A9vation+jambes&tag=postureatwo09-21", price: "~35€", reason: "Jambes surélevées en fin de journée — aide à soulager les jambes lourdes" },
    { name: "Foam roller", url: "https://www.amazon.fr/s?k=Foam+roller&tag=postureatwo09-21", price: "~25€", reason: "5 minutes soir pour relâcher mollets, ischio-jambiers et bas du dos" },
  ],
  habits: [
    { name: "Bureau assis-debout SONGMICS", url: "https://www.amazon.fr/s?k=Bureau+assis-debout+SONGMICS&tag=postureatwo09-21", price: "~200€", reason: "Alterner assis/debout aide à réduire les douleurs lombaires" },
    { name: "Coussin d'équilibre BODYMATE", url: "https://www.amazon.fr/s?k=Coussin+d%27%C3%A9quilibre+BODYMATE&tag=postureatwo09-21", price: "~30€", reason: "Active les muscles posturaux profonds passivement" },
  ],
};

const EXERCISES_BY_ISSUE: Record<string, { name: string; duration: string; desc: string; emoji: string }[]> = {
  nuque_cervicales: [
    { name: "Rétraction cervicale", duration: "10 rép. × 5 sec", desc: "Corrige l'antépulsion de tête — typique du travail sur écran", emoji: "🦆" },
    { name: "Inclinaison latérale nuque", duration: "30 sec par côté", desc: "Étire les trapèzes supérieurs contractés", emoji: "↔️" },
    { name: "Rotation nuque", duration: "5 rotations par côté", desc: "Libère les tensions de rotation cervicale", emoji: "🔄" },
  ],
  dos_lombaires: [
    { name: "Flexion lombaire", duration: "45 sec × 2", desc: "Décompresse les disques intervertébraux", emoji: "🌿" },
    { name: "Cat-Cow assis", duration: "10 cycles", desc: "Mobilise toute la colonne", emoji: "🐱" },
    { name: "Extension lombaire debout", duration: "10 extensions", desc: "Contre la flexion prolongée de la position assise", emoji: "🏹" },
  ],
  epaules_poignets: [
    { name: "Ouverture pectorale en porte", duration: "30 sec par côté", desc: "Compense l'enroulement des épaules dû au clavier", emoji: "🦅" },
    { name: "Rétraction scapulaire", duration: "15 rép. × 3 sec", desc: "Renforce les rhomboïdes et corrige l'enroulement", emoji: "🏹" },
    { name: "Étirement fléchisseurs poignet", duration: "30 sec par côté", desc: "Aide à soulager les poignets sollicités", emoji: "🖐️" },
  ],
  jambes_pieds: [
    { name: "Élévation des mollets", duration: "15 rép. × 3", desc: "Active la circulation dans les mollets", emoji: "🦵" },
    { name: "Auto-massage plantaire", duration: "2 min par pied", desc: "Relâche les tensions du fascia plantaire", emoji: "⚾" },
    { name: "Surélévation des jambes", duration: "20 minutes soir", desc: "Drainage veineux actif après journée debout", emoji: "🧘" },
  ],
};

function scoreColor(s: number) {
  return s >= 70 ? "#3fe0a0" : s >= 50 ? "#ffa347" : "#ff7b7b";
}

function scoreZone(s: number) {
  return s >= 70 ? "Bon" : s >= 50 ? "À améliorer" : "Critique";
}

interface EmployeeRow {
  anonymous_id: string;
  joined_at: string;
  global_score: number | null;
  scores: Record<string, number> | null;
  assessed_at: string | null;
  job_type: "bureau" | "debout" | null;
  answers: Record<string, unknown> | null;
  video_analysis: Record<string, unknown> | null;
}

function generateReport(assessed: EmployeeRow[]) {
  if (assessed.length === 0) return null;

  const bureauGroup = assessed.filter(e => e.job_type === "bureau");
  const deboutGroup = assessed.filter(e => e.job_type === "debout");
  const hasGroups = bureauGroup.length > 0 && deboutGroup.length > 0;

  function avgDim(group: EmployeeRow[], key: string) {
    const vals = group.map(e => e.scores?.[key]).filter((v): v is number => v !== null && v !== undefined);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }

  function avgGlobalGroup(group: EmployeeRow[]) {
    const vals = group.map(e => e.global_score).filter((v): v is number => v !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }

  const bureau = {
    count: bureauGroup.length,
    global: avgGlobalGroup(bureauGroup),
    setup: avgDim(bureauGroup, "setup"),
    pain: avgDim(bureauGroup, "pain"),
    habits: avgDim(bureauGroup, "habits"),
    sleep: avgDim(bureauGroup, "sleep_energy"),
    nutrition: avgDim(bureauGroup, "nutrition"),
    lifestyle: avgDim(bureauGroup, "lifestyle"),
    critique: bureauGroup.filter(e => (e.global_score ?? 0) < 50).length,
  };

  const debout = {
    count: deboutGroup.length,
    global: avgGlobalGroup(deboutGroup),
    setup: avgDim(deboutGroup, "setup"),
    pain: avgDim(deboutGroup, "pain"),
    habits: avgDim(deboutGroup, "habits"),
    sleep: avgDim(deboutGroup, "sleep_energy"),
    nutrition: avgDim(deboutGroup, "nutrition"),
    lifestyle: avgDim(deboutGroup, "lifestyle"),
    critique: deboutGroup.filter(e => (e.global_score ?? 0) < 50).length,
  };

  const allSetup = avgDim(assessed, "setup") ?? 0;
  const allPain = avgDim(assessed, "pain") ?? 0;
  const allHabits = avgDim(assessed, "habits") ?? 0;
  const allSleep = avgDim(assessed, "sleep_energy") ?? 0;
  const allNutrition = avgDim(assessed, "nutrition") ?? 0;
  const allLifestyle = avgDim(assessed, "lifestyle") ?? 0;
  const criticalCount = assessed.filter(e => (e.global_score ?? 0) < 50).length;
  const criticalPct = Math.round((criticalCount / assessed.length) * 100);

  const bureauMainIssue = bureau.pain !== null && bureau.pain < 50 ? "douleurs cervicales et nuque"
    : bureau.setup !== null && bureau.setup < 55 ? "setup ergonomique inadapté"
    : bureau.habits !== null && bureau.habits < 55 ? "manque de pauses actives"
    : "fatigue et récupération insuffisante";

  const deboutMainIssue = debout.pain !== null && debout.pain < 45 ? "douleurs lombaires et membres inférieurs"
    : debout.habits !== null && debout.habits < 50 ? "postures de travail et manutention"
    : debout.lifestyle !== null && debout.lifestyle < 50 ? "récupération physique insuffisante"
    : "fatigue musculaire chronique";

  return {
    bureau, debout, hasGroups,
    allSetup, allPain, allHabits, allSleep, allNutrition, allLifestyle,
    criticalCount, criticalPct,
    bureauMainIssue, deboutMainIssue,
  };
}

function analyzeEmployee(emp: EmployeeRow): {
  flags: { label: string; color: string; severity: "critical" | "warning" | "info" }[];
  mainIssues: string[];
  profile: string;
  recommendations: string[];
} {
  const a = emp.answers ?? {};
  const flags: { label: string; color: string; severity: "critical" | "warning" | "info" }[] = [];
  const mainIssues: string[] = [];
  const recommendations: string[] = [];

  if (emp.job_type === "bureau") {
    if (a.q1 === "laptop" && a.q_double_ecran === "laptop_seul") {
      flags.push({ label: "Laptop seul sans rehausseur", color: "#ff7b7b", severity: "critical" });
      mainIssues.push("Laptop seul — charge cervicale +12kg en permanence");
      recommendations.push("Rehausseur d'écran + clavier externe indispensable");
    }
    if (a.q3 === "no" || a.q_hauteur_bureau === "trop_bas") {
      flags.push({ label: "Écran trop bas", color: "#ff7b7b", severity: "critical" });
    }
    if (a.q5b === "couch" || a.q5b === "fixed") {
      flags.push({ label: "Chaise inadaptée", color: "#ffa347", severity: "warning" });
      mainIssues.push("Chaise sans soutien lombaire — posture effondrée en fin de journée");
      recommendations.push("Coussin lombaire ou chaise ergonomique réglable");
    }
    const nuque = Number(a.q6 ?? 0);
    const epaules = Number(a.q7 ?? 0);
    const dos = Number(a.q8 ?? 0);
    const poignets = Number(a.q9 ?? 0);
    if (nuque >= 3) {
      flags.push({ label: `Douleurs nuque ${nuque}/5`, color: "#ff7b7b", severity: nuque >= 4 ? "critical" : "warning" });
      mainIssues.push(`Douleurs cervicales significatives (${nuque}/5)`);
    }
    if (epaules >= 3) {
      flags.push({ label: `Douleurs épaules ${epaules}/5`, color: "#ff7b7b", severity: "warning" });
      mainIssues.push(`Douleurs épaules (${epaules}/5) — enroulement postural probable`);
    }
    if (dos >= 3) {
      flags.push({ label: `Douleurs lombaires ${dos}/5`, color: "#ffa347", severity: "warning" });
      mainIssues.push(`Lombalgies (${dos}/5) — station assise prolongée probable facteur aggravant`);
      recommendations.push("Pauses actives toutes les 45 min + coussin lombaire");
    }
    if (poignets >= 3) {
      flags.push({ label: `Douleurs poignets ${poignets}/5`, color: "#ffa347", severity: "warning" });
      recommendations.push("Souris verticale à essayer (poignets douloureux)");
    }
    if (a.q_irradiation_bras === "coude" || a.q_irradiation_bras === "main") {
      flags.push({ label: "Irradiation bras", color: "#e24b4a", severity: "critical" });
      mainIssues.push("⚠️ Irradiation dans le bras — consultation kiné recommandée");
    }
    if (a.q_fourmillements === "permanent" || a.q_fourmillements === "travail") {
      flags.push({ label: "Fourmillements", color: "#e24b4a", severity: "critical" });
      mainIssues.push("Fourmillements — avis médical ou kiné conseillé");
    }
    if (a.q_douleur_nuit === "reveille" || a.q_douleur_nuit === "souvent") {
      flags.push({ label: "Douleurs nocturnes", color: "#e24b4a", severity: "critical" });
      mainIssues.push("⚠️ Douleurs nocturnes — avis médical ou kiné conseillé");
    }
    const heures = Number(a.q13 ?? 0);
    if (heures >= 9) {
      flags.push({ label: `${heures}h/jour assis`, color: "#ffa347", severity: "warning" });
      mainIssues.push(`${heures}h assis par jour — sédentarité excessive`);
      recommendations.push("Alarme toutes les 45 min pour se lever");
    }
    if (a.q14 === "never") flags.push({ label: "Aucune pause active", color: "#ff7b7b", severity: "critical" });
    if (a.q14b === "none") {
      flags.push({ label: "Aucune activité physique", color: "#ffa347", severity: "warning" });
      recommendations.push("Encourager activité physique minimale 2x/semaine");
    }
    const stress = Number(a.q_stress_travail ?? 0);
    if (stress >= 4) {
      flags.push({ label: `Stress élevé ${stress}/5`, color: "#a78bfa", severity: "warning" });
      mainIssues.push(`Stress chronique élevé (${stress}/5) — le stress entretient la tension musculaire`);
    }
    const sommeil = Number(a.q17 ?? 7);
    if (sommeil <= 5) {
      flags.push({ label: `${sommeil}h de sommeil`, color: "#ff7b7b", severity: "critical" });
      mainIssues.push(`Manque de sommeil (${sommeil}h) — récupération musculaire insuffisante`);
    }
    if (a.qn1 === "screen") flags.push({ label: "Repas devant écran", color: "#ffa347", severity: "info" });
    if (a.qn2 === "crash") {
      flags.push({ label: "Crash post-repas", color: "#ffa347", severity: "warning" });
      recommendations.push("Pause déjeuner loin de l'écran — repas protéiné");
    }
    const profileParts: string[] = [];
    if (a.q1 === "laptop") profileParts.push("Laptop seul");
    else if (a.q1 === "laptop_screen") profileParts.push("Laptop + écran");
    else if (a.q1 === "desktop") profileParts.push("Desktop");
    if (a.q2 === "remote") profileParts.push("Télétravail");
    else if (a.q2 === "office") profileParts.push("Bureau fixe");
    else if (a.q2 === "both") profileParts.push("Hybride");
    if (a.q_anciennete_poste) {
      const anc: Record<string, string> = { moins_6mois: "< 6 mois", "6m_2ans": "6m-2 ans", "2_5ans": "2-5 ans", "5_10ans": "5-10 ans", plus_10ans: "> 10 ans" };
      profileParts.push(anc[a.q_anciennete_poste as string] ?? "");
    }
    return { flags, mainIssues, recommendations, profile: profileParts.filter(Boolean).join(" · ") };
  } else {
    const dos = Number(a.q_d_doul_dos ?? 0);
    const jambes = Number(a.q_d_doul_jambes ?? 0);
    const epaules = Number(a.q_d_doul_epaules ?? 0);
    const pieds = Number(a.q_d_doul_pieds ?? 0);
    if (dos >= 3) {
      flags.push({ label: `Douleurs dos ${dos}/5`, color: "#ff7b7b", severity: dos >= 4 ? "critical" : "warning" });
      mainIssues.push(`Lombalgies significatives (${dos}/5) — manutention et station debout prolongée`);
      recommendations.push("Formation gestes et postures de levage");
    }
    if (jambes >= 3) {
      flags.push({ label: `Jambes lourdes ${jambes}/5`, color: "#ffa347", severity: "warning" });
      mainIssues.push(`Fatigue des membres inférieurs (${jambes}/5) — fatigue des jambes à surveiller`);
      recommendations.push("Chaussettes de compression + tapis anti-fatigue");
    }
    if (epaules >= 3) {
      flags.push({ label: `Épaules ${epaules}/5`, color: "#ffa347", severity: "warning" });
      mainIssues.push(`Douleurs épaules (${epaules}/5) — gestes répétitifs ou port de charges en hauteur`);
    }
    if (pieds >= 3) {
      flags.push({ label: `Douleurs pieds ${pieds}/5`, color: "#ffa347", severity: "warning" });
      recommendations.push("Semelles orthopédiques de travail");
    }
    if (a.q_d_posture_levage === "mauvaise") {
      flags.push({ label: "Mauvaise technique levage", color: "#e24b4a", severity: "critical" });
      mainIssues.push("⚠️ Technique de levage incorrecte — risque lombalgie aiguë");
      recommendations.push("Formation urgente gestes et postures — risque arrêt de travail");
    }
    if (a.q_d_tapis === "non") {
      flags.push({ label: "Pas de tapis anti-fatigue", color: "#ffa347", severity: "warning" });
      recommendations.push("Tapis anti-fatigue au poste fixe — impact immédiat");
    }
    const sommeil = Number(a.q_d_sommeil ?? 7);
    if (sommeil <= 5) {
      flags.push({ label: `${sommeil}h de sommeil`, color: "#ff7b7b", severity: "critical" });
      mainIssues.push(`Manque de sommeil (${sommeil}h) — récupération insuffisante après journée physique`);
    }
    if (a.q_d_jambes_nuit === "souvent") {
      flags.push({ label: "Jambes agitées la nuit", color: "#a78bfa", severity: "warning" });
      mainIssues.push("Jambes agitées la nuit — à signaler au médecin si cela persiste");
    }
    const profileParts: string[] = ["Poste debout"];
    if (a.q_d1 === "dur") profileParts.push("Sol dur");
    if (a.q_d_gestes_repet === "toujours") profileParts.push("Gestes répétitifs");
    if (a.q_d_anciennete) {
      const anc: Record<string, string> = { moins_6mois: "< 6 mois", "6m_2ans": "6m-2 ans", "2_5ans": "2-5 ans", "5_10ans": "5-10 ans", plus_10ans: "> 10 ans" };
      profileParts.push(anc[a.q_d_anciennete as string] ?? "");
    }
    return { flags, mainIssues, recommendations, profile: profileParts.filter(Boolean).join(" · ") };
  }
}

export default function EntrepriseDemoDashboard() {
  const authorized = useDemoAuth();
  if (!authorized) return null;
  return <DemoDashboardInner />;
}

function DemoDashboardInner() {
  const { c } = useTheme();

  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "parcours" | "analysis" | "report" | "employees" | "evolution" | "exercises" | "resources">("overview");
  const [activeProfile, setActiveProfile] = useState<"bureau" | "debout">("bureau");
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const signals: { id: string; category: string; message: string; treated: boolean; created_at: string }[] = [];
  const [evolutionData, setEvolutionData] = useState<{ mois: string; global: number | null; bureau: number | null; debout: number | null; count: number }[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState<"all" | "bureau" | "debout">("all");
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/entreprise/demo-data");
      if (!res.ok) return;

      const data = await res.json();
      setCompany(data.company);
      setEmployees(data.employees ?? []);
      setEvolutionData(data.evolutionData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const assessed = employees.filter(e => e.global_score !== null);
  const participation = employees.length > 0 ? Math.round((assessed.length / employees.length) * 100) : 0;
  const avgGlobal = assessed.length
    ? Math.round(assessed.reduce((sum, e) => sum + (e.global_score ?? 0), 0) / assessed.length)
    : null;

  const zoneCounts = {
    critique: assessed.filter(e => (e.global_score ?? 0) < 50).length,
    ameliorer: assessed.filter(e => (e.global_score ?? 0) >= 50 && (e.global_score ?? 0) < 70).length,
    bon: assessed.filter(e => (e.global_score ?? 0) >= 70).length,
  };

  const dimAvgs = Object.entries(DIM_META).map(([key, meta]) => {
    const vals = assessed.map(e => e.scores?.[key]).filter((v): v is number => v !== undefined && v !== null);
    return {
      key,
      meta,
      avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null,
    };
  });

  const employerDims = dimAvgs.filter(d => d.meta.type === "employeur");
  const employeeDims = dimAvgs.filter(d => d.meta.type === "employe");

  // Top 3 actions prioritaires — dimensions les plus basses côté employeur
  const priorityActions = [...employerDims]
    .filter(d => d.avg !== null)
    .sort((a, b) => (a.avg ?? 100) - (b.avg ?? 100))
    .slice(0, 3);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>Chargement de la démo…</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80, overflowX: "hidden" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "70px 12px 0" : "80px 24px 0", overflowX: "hidden" }}>

        {/* ── BANDEAU MODE DÉMO ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 14, padding: "12px 16px", marginBottom: 20,
            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🎬</span>
            <div>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "#c4b5fd", margin: 0 }}>
                Mode démo — Données fictives
              </p>
              <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>
                Voici un aperçu du dashboard RH avec une entreprise de 30 employés
              </p>
            </div>
          </div>
          <Link href="/entreprise#contact" style={{ textDecoration: "none" }}>
            <div style={{ padding: "8px 16px", borderRadius: 100, background: "#7c3aed", color: "#fff", fontFamily: T.h, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              Demander ma démo →
            </div>
          </Link>
        </motion.div>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <div>
            <p style={{ fontFamily: T.b, fontSize: 11, color: "#6f9bff", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              🏢 Dashboard RH
            </p>
            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: c.textPrimary, margin: "0 0 4px" }}>
              {company?.name}
            </h1>
            <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0 }}>
              Forfait {planLabel(company?.plan)} · {employees.length} employé{employees.length > 1 ? "s" : ""} inscrit{employees.length > 1 ? "s" : ""} · {assessed.length} bilan{assessed.length > 1 ? "s" : ""} complété{assessed.length > 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>

        {/* ── SCORE SANTÉ ENTREPRISE ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{
            borderRadius: 20, padding: isMobile ? "16px" : "28px", marginBottom: 20,
            background: avgGlobal ? `${scoreColor(avgGlobal)}08` : c.bgCard,
            border: `0.5px solid ${avgGlobal ? scoreColor(avgGlobal) + "30" : c.border}`,
          }}>

          {/* Ligne du haut : cercle score + texte */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{
                width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: "50%",
                background: avgGlobal ? `${scoreColor(avgGlobal)}15` : c.bgCard2,
                border: `3px solid ${avgGlobal ? scoreColor(avgGlobal) : c.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 18 : 22, color: avgGlobal ? scoreColor(avgGlobal) : c.textMuted, lineHeight: 1 }}>
                  {avgGlobal ?? "—"}
                </span>
                <span style={{ fontFamily: T.b, fontSize: 8, color: c.textMuted }}>/ 100</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: isMobile ? 13 : 16, color: c.textPrimary, margin: "0 0 4px" }}>
                Score santé entreprise
              </p>
              <p style={{ fontFamily: T.b, fontSize: isMobile ? 11 : 13, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>
                {avgGlobal
                  ? avgGlobal >= 70 ? "Vos équipes sont en bonne santé ergonomique."
                  : avgGlobal >= 50 ? "Des améliorations sont possibles."
                  : "Plusieurs dimensions nécessitent une action rapide."
                  : "Aucun bilan complété pour l'instant."}
              </p>
            </div>
          </div>

          {/* KPIs en grid 2x2 sur mobile, row sur desktop */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 8,
          }}>
            {[
              { label: "Zone critique", value: zoneCounts.critique, color: "#ff7b7b", bg: "rgba(255,123,123,0.10)" },
              { label: "À améliorer", value: zoneCounts.ameliorer, color: "#ffa347", bg: "rgba(255,163,71,0.10)" },
              { label: "Bon niveau", value: zoneCounts.bon, color: "#3fe0a0", bg: "rgba(63,224,160,0.10)" },
              { label: "Participation", value: `${participation}%`, color: "#2b5ce6", bg: c.bgCard2 },
            ].map((z, i) => (
              <div key={i} style={{ textAlign: "center", padding: isMobile ? "10px 8px" : "12px 16px", borderRadius: 14, background: z.bg }}>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 20 : 24, color: z.color, margin: "0 0 4px" }}>{z.value}</p>
                <p style={{ fontFamily: T.b, fontSize: isMobile ? 10 : 11, color: c.textMuted, margin: 0 }}>{z.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{
            display: "flex", gap: 4, padding: 4, borderRadius: 14,
            background: c.bgCard2, border: `0.5px solid ${c.border}`,
            marginBottom: 20,
          }}>
          {([
            { key: "overview", label: isMobile ? "📊" : "📊 Vue d'ensemble" },
            { key: "parcours", label: isMobile ? "🧭" : "🧭 Parcours" },
            { key: "analysis", label: isMobile ? "🔬" : "🔬 Analyse" },
            { key: "report", label: isMobile ? "📋" : "📋 Rapport" },
            { key: "employees", label: isMobile ? "👥" : "👥 Équipe" },
            { key: "evolution", label: isMobile ? "📈" : "📈 Évolution" },
            { key: "exercises", label: isMobile ? "🏋️" : "🏋️ Exercices" },
            { key: "resources", label: isMobile ? "📚" : "📚 Ressources" },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: "1 1 auto", padding: isMobile ? "10px 0" : "10px 8px", minWidth: isMobile ? 36 : undefined, whiteSpace: "nowrap", borderRadius: 10, border: "none",
              background: activeTab === tab.key ? "#2b5ce6" : "transparent",
              color: activeTab === tab.key ? "#fff" : c.textMuted,
              fontFamily: T.b, fontWeight: 600, fontSize: 13,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── TAB OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

              <div style={{ borderRadius: 20, padding: "20px 22px", background: c.cardGrad, border: `1px solid ${c.border}`, marginBottom: 16 }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: "0 0 4px" }}>🧭 Votre parcours d&apos;amélioration</p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: "0 0 14px", lineHeight: 1.6 }}>
                  Cinq étapes pour réduire concrètement les TMS dans votre équipe, dans l&apos;ordre.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {PARCOURS_STEPS.map(s => (
                    <button key={s.n} type="button" onClick={() => setActiveTab("parcours")}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 100, background: c.bgCard2, border: `1px solid ${c.border}`, cursor: "pointer", fontFamily: T.b, fontSize: 12.5, fontWeight: 600, color: c.textPrimary }}>
                      <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: "50%", background: "#2b5ce6", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{s.n}</span>
                      {s.title}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setActiveTab("parcours")}
                  style={{ padding: "10px 20px", borderRadius: 100, border: "none", background: "#2b5ce6", color: "#fff", fontFamily: T.b, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Commencer le parcours →
                </button>
              </div>

            </motion.div>
          )}

          {activeTab === "parcours" && (
            <motion.div key="parcours" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

              <div style={{ borderRadius: 20, padding: "18px 22px", background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.18)", marginBottom: 20 }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: c.textPrimary, margin: "0 0 4px" }}>🧭 Parcours d&apos;amélioration</p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.65 }}>
                  Le chemin concret, étape par étape, pour réduire les TMS dans votre équipe : repérer les priorités, décider et suivre les actions, équiper les postes, installer des routines, puis vérifier les progrès. Les analyses détaillées sont dans l&apos;onglet Analyse.
                </p>
              </div>

              <ParcoursStep c={c} n={1} title="Repérer" subtitle="Les priorités de votre équipe">
              {/* Actions prioritaires */}
              {priorityActions.length > 0 && (
                <div style={{ borderRadius: 20, padding: "24px", background: "rgba(226,75,74,0.05)", border: "0.5px solid rgba(226,75,74,0.2)", marginBottom: 16 }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 4 }}>
                    🎯 Actions prioritaires pour votre équipe
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 18 }}>
                    Basées sur les scores les plus bas de vos employés — sur les dimensions que vous pouvez directement améliorer.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {priorityActions.map(({ key, meta, avg }, i) => (
                      <div key={key} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                        borderRadius: 12, background: c.bgCard, border: `0.5px solid ${c.border}`,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: `${scoreColor(avg ?? 0)}15`, border: `1.5px solid ${scoreColor(avg ?? 0)}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: T.h, fontWeight: 900, fontSize: 12, color: scoreColor(avg ?? 0),
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: "0 0 2px" }}>
                            {ACTIONS_BY_DIM[key].action}
                          </p>
                          <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>
                            {meta.emoji} {meta.label} · Score moyen : <span style={{ color: scoreColor(avg ?? 0), fontWeight: 600 }}>{avg}/100</span> · {ACTIONS_BY_DIM[key].impact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              </ParcoursStep>

              <ParcoursStep c={c} n={2} title="Décider" subtitle="Les actions à mener et leur suivi">
              {assessed.length > 0 && (() => {
                const r = generateReport(assessed);
                if (!r) return null;
                const { debout, hasGroups, allSetup, allPain, allHabits } = r;

                return (
                  <div style={{ borderRadius: 20, overflow: "hidden", border: `0.5px solid ${c.border}`, marginBottom: 16 }}>

                    {/* Plan d'action employeur */}
                    <div style={{ padding: "20px 24px", borderBottom: `0.5px solid ${c.border}`, background: c.bgCard }}>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>🗓️ Plan d&apos;action recommandé</p>
                      <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 16 }}>Classé par impact et faisabilité — à adapter à votre contexte.</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          {
                            horizon: "Cette semaine",
                            color: "#ff7b7b",
                            actions: [
                              allSetup < 60 ? "Faire l'inventaire des postes sans rehausseur d'écran et sans clavier externe" : null,
                              allPain < 55 ? "Identifier les 3 employés avec les scores douleurs les plus bas et les rencontrer" : null,
                              "Envoyer le programme d'exercices collectif à toutes les équipes",
                            ].filter(Boolean) as string[],
                          },
                          {
                            horizon: "Dans le mois",
                            color: "#ffa347",
                            actions: [
                              allSetup < 60 ? "Équiper les postes bureau critiques : rehausseur + clavier externe (budget ~60€/poste)" : null,
                              hasGroups && (debout.pain ?? 100) < 55 ? "Installer des tapis anti-fatigue aux postes debout fixes (budget ~45€/poste)" : null,
                              allHabits < 55 ? "Mettre en place un système de pause active toutes les 45 min (app, alarme partagée)" : null,
                              "Organiser une session de formation gestes et postures avec un kinésithérapeute",
                            ].filter(Boolean) as string[],
                          },
                          {
                            horizon: "Dans les 3 mois",
                            color: "#3fe0a0",
                            actions: [
                              "Refaire passer les bilans PAW aux équipes pour mesurer l'évolution",
                              "Intégrer les résultats dans votre reporting social (CPPT, EcoVadis)",
                              allSetup < 55 ? "Étudier l'installation de bureaux assis-debout pour les postes les plus critiques" : null,
                              "Planifier le call de restitution trimestriel avec le kinésithérapeute PAW",
                            ].filter(Boolean) as string[],
                          },
                        ].map((phase, i) => (
                          <div key={i} style={{ padding: "14px 16px", borderRadius: 12, background: c.bgCard2, border: `0.5px solid ${c.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{ width: 10, height: 10, borderRadius: "50%", background: phase.color, flexShrink: 0 }} />
                              <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: phase.color }}>{phase.horizon}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {phase.actions.map((action, j) => (
                                <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                  <span style={{ color: phase.color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                                  <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.5 }}>{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>


                  </div>
                );
              })()}
                <p style={{ fontFamily: T.b, fontSize: 12.5, color: c.textMuted, lineHeight: 1.6, margin: "0 0 4px" }}>Dans votre espace, chaque action se suit avec un statut, un responsable et une échéance.</p>
              </ParcoursStep>

              <ParcoursStep c={c} n={3} title="S'équiper" subtitle="Le matériel qui fait la différence" defaultOpen={false}>
              {assessed.length > 0 && (() => {
                const r = generateReport(assessed);
                if (!r) return null;
                const { hasGroups, allSetup, allPain } = r;

                return (
                  <div style={{ borderRadius: 20, overflow: "hidden", border: `0.5px solid ${c.border}`, marginBottom: 16 }}>

                    {/* Produits recommandés par profil */}
                    <div style={{ padding: "20px 24px", borderBottom: `0.5px solid ${c.border}`, background: c.bgCard }}>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>🛒 Équipements recommandés</p>
                      <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 16 }}>Sélection basée sur les scores de vos équipes — par profil de poste.</p>
                      <div style={{ display: "grid", gridTemplateColumns: hasGroups && !isMobile ? "1fr 1fr" : "1fr", gap: 12 }}>
                        {hasGroups ? (
                          <>
                            <div>
                              <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#6f9bff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>💻 Postes bureau</p>
                              {[
                                ...(allSetup < 65 ? PRODUCTS_BY_ISSUE.setup_bureau : []),
                                ...(allPain < 55 ? PRODUCTS_BY_ISSUE.douleurs_bureau : []),
                              ].slice(0, 3).map((prod, i) => (
                                <a key={i} href={prod.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: c.bgCard2, border: `0.5px solid ${c.border}`, marginBottom: 8 }}>
                                    <span style={{ fontSize: 16, flexShrink: 0 }}>🛒</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 12, color: c.textPrimary, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.name}</p>
                                      <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>{prod.price}</p>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                            <div>
                              <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#ffa347", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🏭 Postes debout</p>
                              {[
                                ...PRODUCTS_BY_ISSUE.setup_debout,
                                ...PRODUCTS_BY_ISSUE.douleurs_debout,
                              ].slice(0, 3).map((prod, i) => (
                                <a key={i} href={prod.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: c.bgCard2, border: `0.5px solid ${c.border}`, marginBottom: 8 }}>
                                    <span style={{ fontSize: 16, flexShrink: 0 }}>🛒</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 12, color: c.textPrimary, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.name}</p>
                                      <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>{prod.price}</p>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </>
                        ) : (
                          [...PRODUCTS_BY_ISSUE.setup_bureau, ...PRODUCTS_BY_ISSUE.douleurs_bureau].slice(0, 4).map((prod, i) => (
                            <a key={i} href={prod.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: c.bgCard2, border: `0.5px solid ${c.border}`, marginBottom: 8 }}>
                                <span style={{ fontSize: 18, flexShrink: 0 }}>🛒</span>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: c.textPrimary, margin: "0 0 2px" }}>{prod.name}</p>
                                  <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>{prod.reason}</p>
                                </div>
                                <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "#2b5ce6", flexShrink: 0 }}>{prod.price}</span>
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                    </div>


                  </div>
                );
              })()}
              </ParcoursStep>

              <ParcoursStep c={c} n={4} title="Pratiquer" subtitle="Des routines courtes, chaque semaine">
                <ParcoursLinkCard c={c} text="Un programme de 10 minutes, 3 fois par semaine, adapté aux résultats de votre équipe (bureau et postes debout). Il peut être affiché en salle de pause ou animé par un manager." cta="Voir le programme d'exercices →" onClick={() => setActiveTab("exercises")} />
              </ParcoursStep>

              <ParcoursStep c={c} n={5} title="Mesurer" subtitle="Vérifier que ça progresse">
                <ParcoursLinkCard c={c} text="Relancez un bilan tous les 3 mois et comparez : les scores doivent monter et les employés en zone critique diminuer." cta="Voir l'évolution →" onClick={() => setActiveTab("evolution")} />
              </ParcoursStep>
            </motion.div>
          )}

          {activeTab === "analysis" && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

              {/* Split employeur / employé */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>

                {/* Côté employeur */}
                <div style={{ borderRadius: 20, padding: "22px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>
                    🏢 Dimensions employeur
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 16 }}>
                    Vous pouvez agir directement sur ces scores.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {employerDims.map(({ key, meta, avg }) => (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary }}>{meta.emoji} {meta.label}</span>
                          <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: avg ? scoreColor(avg) : c.textMuted }}>{avg ?? "—"}</span>
                        </div>
                        <div style={{ height: 6, background: c.bgCard2, borderRadius: 100, overflow: "hidden" }}>
                          <motion.div
                            style={{ height: "100%", borderRadius: 100, background: avg ? scoreColor(avg) : c.border }}
                            initial={{ width: 0 }}
                            animate={{ width: avg ? `${avg}%` : "0%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Côté employé */}
                <div style={{ borderRadius: 20, padding: "22px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>
                    👤 Dimensions personnelles
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 16 }}>
                    PAW guide chaque employé individuellement sur ces points.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {employeeDims.map(({ key, meta, avg }) => (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary }}>{meta.emoji} {meta.label}</span>
                          <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: avg ? scoreColor(avg) : c.textMuted }}>{avg ?? "—"}</span>
                        </div>
                        <div style={{ height: 6, background: c.bgCard2, borderRadius: 100, overflow: "hidden" }}>
                          <motion.div
                            style={{ height: "100%", borderRadius: 100, background: avg ? scoreColor(avg) : c.border }}
                            initial={{ width: 0 }}
                            animate={{ width: avg ? `${avg}%` : "0%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "0.5px solid rgba(124,58,237,0.15)" }}>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: "#a78bfa", margin: 0, lineHeight: 1.55 }}>
                      💡 Ces dimensions sont personnelles — PAW accompagne chaque employé avec des conseils adaptés et des exercices ciblés dans son espace individuel.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── ANALYSE VIDÉO COLLECTIVE ── */}
              {(() => {
                const collective = analyzeCollectiveVideo(employees, assessed);
                if (!collective) return (
                  <div style={{ borderRadius: 20, padding: "20px 24px", marginBottom: 16, background: "rgba(124,58,237,0.05)", border: "0.5px dashed rgba(124,58,237,0.25)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>🎥</span>
                      <div>
                        <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#c4b5fd", margin: "0 0 4px" }}>
                          Analyse posturale collective
                        </p>
                        <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0 }}>
                          Aucun employé n&apos;a encore effectué l&apos;analyse vidéo. Invitez vos équipes à compléter leur bilan pour obtenir les tendances posturales collectives.
                        </p>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div style={{ borderRadius: 20, overflow: "hidden", border: "0.5px solid rgba(124,58,237,0.25)", marginBottom: 16 }}>

                    {/* Header */}
                    <div style={{ padding: "18px 20px", background: "rgba(124,58,237,0.07)", borderBottom: "0.5px solid rgba(124,58,237,0.15)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>🎥</span>
                          <div>
                            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#c4b5fd", margin: 0 }}>
                              Analyse posturale collective
                            </p>
                            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>
                              {collective.total} employé{collective.total > 1 ? "s" : ""} filmé{collective.total > 1 ? "s" : ""} sur {assessed.length} bilans complétés
                              {collective.notFilmed > 0 && ` · ${collective.notFilmed} non filmé${collective.notFilmed > 1 ? "s" : ""}`}
                            </p>
                            {collective.simulated && (
                              <span style={{ display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 100, fontFamily: T.b, fontSize: 10, fontWeight: 700, color: "#6f9bff", background: "rgba(43,92,230,0.22)", border: "1px solid rgba(111,155,255,0.5)" }}>
                                Démo : analyses vidéo simulées
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {collective.avgScoreBureau && (
                            <div style={{ textAlign: "center", padding: "6px 12px", borderRadius: 10, background: "rgba(124,58,237,0.12)" }}>
                              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "#c4b5fd", margin: 0 }}>{collective.avgScoreBureau}</p>
                              <p style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted, margin: 0 }}>Score bureau</p>
                            </div>
                          )}
                          {collective.avgScoreDebout && (
                            <div style={{ textAlign: "center", padding: "6px 12px", borderRadius: 10, background: "rgba(124,58,237,0.12)" }}>
                              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "#c4b5fd", margin: 0 }}>{collective.avgScoreDebout}</p>
                              <p style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted, margin: 0 }}>Score debout</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Narrative bureau */}
                      {collective.bureauNarrative && (
                        <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 10, background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
                          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#6f9bff", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                            💻 Équipe bureau — Observation vidéo
                          </p>
                          <p style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.7, margin: "0 0 10px" }}>
                            {collective.bureauNarrative}
                          </p>
                          {collective.bureauPositif && (
                            <p style={{ fontFamily: T.b, fontSize: 13, color: "#3fe0a0", lineHeight: 1.6, margin: "0 0 10px" }}>
                              {collective.bureauPositif}
                            </p>
                          )}
                          {collective.bureauActions.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {collective.bureauActions.map((action, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                  <span style={{ color: "#6f9bff", fontSize: 12, flexShrink: 0, marginTop: 2 }}>→</span>
                                  <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary }}>{action}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Narrative debout */}
                      {collective.deboutNarrative && (
                        <div style={{ marginTop: 10, padding: "14px 16px", borderRadius: 10, background: "rgba(212,98,42,0.06)", border: "0.5px solid rgba(212,98,42,0.2)" }}>
                          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#ffa347", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                            🏭 Équipe debout — Observation vidéo
                          </p>
                          <p style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.7, margin: "0 0 10px" }}>
                            {collective.deboutNarrative}
                          </p>
                          {collective.deboutPositif && (
                            <p style={{ fontFamily: T.b, fontSize: 13, color: "#3fe0a0", lineHeight: 1.6, margin: "0 0 10px" }}>
                              {collective.deboutPositif}
                            </p>
                          )}
                          {collective.deboutActions.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {collective.deboutActions.map((action, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                  <span style={{ color: "#ffa347", fontSize: 12, flexShrink: 0, marginTop: 2 }}>→</span>
                                  <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary }}>{action}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tendances */}
                    <div style={{ padding: "18px 20px", background: c.bgCard }}>
                      <VideoRevealBlock collective={collective} c={c} isMobile={isMobile} />
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : collective.bureauTrends.length > 0 && collective.deboutTrends.length > 0 ? "1fr 1fr" : "1fr", gap: 16 }}>

                        {/* Bureau */}
                        {collective.bureauTrends.length > 0 && (
                          <div>
                            <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#6f9bff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                              💻 Équipe bureau ({collective.bureauCount} filmés)
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {collective.bureauTrends.map((trend, i) => {
                                const critiquePct = Math.round((trend.critique / trend.total) * 100);
                                const attentionPct = Math.round((trend.attention / trend.total) * 100);
                                const bonPct = Math.round((trend.bon / trend.total) * 100);
                                const mainColor = trend.critique > trend.bon ? "#ff7b7b" : trend.attention > trend.bon ? "#ffa347" : "#3fe0a0";

                                return (
                                  <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: `${mainColor}06`, border: `0.5px solid ${mainColor}25` }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                      <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: mainColor }}>
                                        {trend.emoji} {trend.zone}
                                      </span>
                                      <span style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted }}>
                                        {trend.total} filmés
                                      </span>
                                    </div>

                                    {/* Barre de répartition */}
                                    <div style={{ height: 8, borderRadius: 100, overflow: "hidden", display: "flex", marginBottom: 8 }}>
                                      {trend.critique > 0 && <div style={{ width: `${critiquePct}%`, background: "#ff7b7b" }} />}
                                      {trend.attention > 0 && <div style={{ width: `${attentionPct}%`, background: "#ffa347" }} />}
                                      {trend.bon > 0 && <div style={{ width: `${bonPct}%`, background: "#3fe0a0" }} />}
                                    </div>

                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                                      {trend.critique > 0 && (
                                        <span style={{ fontFamily: T.b, fontSize: 11, color: "#ff7b7b" }}>
                                          ⚠️ {trend.critique} critique{trend.critique > 1 ? "s" : ""}
                                        </span>
                                      )}
                                      {trend.attention > 0 && (
                                        <span style={{ fontFamily: T.b, fontSize: 11, color: "#ffa347" }}>
                                          🟠 {trend.attention} à surveiller
                                        </span>
                                      )}
                                      {trend.bon > 0 && (
                                        <span style={{ fontFamily: T.b, fontSize: 11, color: "#3fe0a0" }}>
                                          ✅ {trend.bon} correct{trend.bon > 1 ? "s" : ""}
                                        </span>
                                      )}
                                    </div>

                                    <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0, fontStyle: "italic" }}>
                                      {trend.consequence}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Debout */}
                        {collective.deboutTrends.length > 0 && (
                          <div>
                            <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#ffa347", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                              🏭 Équipe debout ({collective.deboutCount} filmés)
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {collective.deboutTrends.map((trend, i) => {
                                const critiquePct = Math.round((trend.critique / trend.total) * 100);
                                const attentionPct = Math.round((trend.attention / trend.total) * 100);
                                const bonPct = Math.round((trend.bon / trend.total) * 100);
                                const mainColor = trend.critique > trend.bon ? "#ff7b7b" : trend.attention > trend.bon ? "#ffa347" : "#3fe0a0";

                                return (
                                  <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: `${mainColor}06`, border: `0.5px solid ${mainColor}25` }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                      <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: mainColor }}>
                                        {trend.emoji} {trend.zone}
                                      </span>
                                      <span style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted }}>
                                        {trend.total} filmés
                                      </span>
                                    </div>
                                    <div style={{ height: 8, borderRadius: 100, overflow: "hidden", display: "flex", marginBottom: 8 }}>
                                      {trend.critique > 0 && <div style={{ width: `${critiquePct}%`, background: "#ff7b7b" }} />}
                                      {trend.attention > 0 && <div style={{ width: `${attentionPct}%`, background: "#ffa347" }} />}
                                      {trend.bon > 0 && <div style={{ width: `${bonPct}%`, background: "#3fe0a0" }} />}
                                    </div>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                                      {trend.critique > 0 && <span style={{ fontFamily: T.b, fontSize: 11, color: "#ff7b7b" }}>⚠️ {trend.critique} critique{trend.critique > 1 ? "s" : ""}</span>}
                                      {trend.attention > 0 && <span style={{ fontFamily: T.b, fontSize: 11, color: "#ffa347" }}>🟠 {trend.attention} à surveiller</span>}
                                      {trend.bon > 0 && <span style={{ fontFamily: T.b, fontSize: 11, color: "#3fe0a0" }}>✅ {trend.bon} correct{trend.bon > 1 ? "s" : ""}</span>}
                                    </div>
                                    <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0, fontStyle: "italic" }}>
                                      {trend.consequence}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CTA si des employés n'ont pas filmé */}
                      {collective.notFilmed > 0 && (
                        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "0.5px solid rgba(124,58,237,0.18)" }}>
                          <p style={{ fontFamily: T.b, fontSize: 13, color: "#c4b5fd", margin: "0 0 10px" }}>
                            📢 {collective.notFilmed} employé{collective.notFilmed > 1 ? "s n'ont " : " n'a "}pas encore effectué l&apos;analyse vidéo.
                          </p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/video-intro`);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              style={{ padding: "7px 14px", borderRadius: 100, border: "none", background: "#7c3aed", color: "#fff", fontFamily: T.b, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                            >
                              {copied ? "✓ Copié !" : "📋 Copier le lien vidéo →"}
                            </button>
                            <span style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, alignSelf: "center" }}>
                              postureatwork.com/video-intro
                            </span>
                          </div>
                          <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: "8px 0 0" }}>
                            À envoyer aux employés qui ont déjà fait leur bilan questionnaire.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </motion.div>
          )}

          {activeTab === "report" && (
            <motion.div key="report" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

              {assessed.length > 0 && (() => {
                const r = generateReport(assessed);
                if (!r) return null;
                const { bureau, debout, hasGroups, allSetup, allPain, allHabits, criticalCount, criticalPct, bureauMainIssue, deboutMainIssue } = r;

                return (
                  <div style={{ borderRadius: 20, overflow: "hidden", border: `0.5px solid ${c.border}`, marginBottom: 16 }}>

                    {/* Header */}
                    <div style={{ padding: "20px 24px", background: "rgba(43,92,230,0.06)", borderBottom: `0.5px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: "0 0 4px" }}>📋 Rapport de synthèse ergonomique</p>
                        <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>
                          Basé sur {assessed.length} bilan{assessed.length > 1 ? "s" : ""} · {hasGroups ? `${bureau.count} postes bureau · ${debout.count} postes debout` : "Profil mixte"}
                        </p>
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.25)", fontFamily: T.b, fontSize: 11, fontWeight: 600, color: "#6f9bff" }}>
                        🩺 Conçu avec un kinésithérapeute
                      </span>
                    </div>

                    {/* Synthèse narrative globale */}
                    <div style={{ padding: "20px 24px", borderBottom: `0.5px solid ${c.border}`, background: c.bgCard }}>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, marginBottom: 10 }}>🔎 Synthèse générale</p>
                      <p style={{ fontFamily: T.b, fontSize: 14, color: c.textSecondary, lineHeight: 1.8, margin: "0 0 12px" }}>
                        {criticalPct > 40
                          ? `⚠️ Situation préoccupante — ${criticalPct}% de vos employés (${criticalCount} personnes) sont en zone critique (score inférieur à 50/100). Une intervention rapide est recommandée.`
                          : criticalPct > 20
                          ? `🟠 Situation à surveiller — ${criticalPct}% de vos employés (${criticalCount} personnes) nécessitent une attention particulière dans les prochaines semaines.`
                          : `✅ Situation globalement satisfaisante — seulement ${criticalPct}% d'employés en zone critique. Des améliorations restent possibles sur les dimensions les plus basses.`
                        }
                      </p>
                      {hasGroups && (
                        <p style={{ fontFamily: T.b, fontSize: 14, color: c.textSecondary, lineHeight: 1.8, margin: 0 }}>
                          {`L'analyse révèle des profils de risque distincts entre vos deux groupes : l'équipe bureau (${bureau.count} personnes, score moyen ${bureau.global}/100) présente principalement des problématiques de ${bureauMainIssue}, tandis que l'équipe debout/entrepôt (${debout.count} personnes, score moyen ${debout.global}/100) est davantage exposée aux ${deboutMainIssue}.`}
                        </p>
                      )}
                    </div>

                    {/* Comparaison par groupe */}
                    {hasGroups && (
                      <div style={{ padding: "20px 24px", borderBottom: `0.5px solid ${c.border}`, background: c.bgCard }}>
                        <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, marginBottom: 14 }}>📊 Comparaison bureau vs entrepôt</p>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                          {/* Bureau */}
                          <div style={{ padding: "16px", borderRadius: 14, background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                              <span style={{ fontSize: 18 }}>💻</span>
                              <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#6f9bff" }}>Équipe bureau ({bureau.count})</span>
                              <span style={{ marginLeft: "auto", fontFamily: T.h, fontWeight: 900, fontSize: 18, color: bureau.global ? scoreColor(bureau.global) : c.textMuted }}>{bureau.global ?? "—"}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {[
                                { label: "Setup", val: bureau.setup },
                                { label: "Douleurs", val: bureau.pain },
                                { label: "Habitudes", val: bureau.habits },
                                { label: "Sommeil", val: bureau.sleep },
                              ].map(({ label, val }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, width: 70, flexShrink: 0 }}>{label}</span>
                                  <div style={{ flex: 1, height: 5, background: c.bgCard2, borderRadius: 100, overflow: "hidden" }}>
                                    <div style={{ width: `${val ?? 0}%`, height: "100%", borderRadius: 100, background: val ? scoreColor(val) : c.border }} />
                                  </div>
                                  <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 12, color: val ? scoreColor(val) : c.textMuted, width: 24, textAlign: "right" }}>{val ?? "—"}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,123,123,0.08)", border: "0.5px solid rgba(255,123,123,0.2)" }}>
                              <p style={{ fontFamily: T.b, fontSize: 12, color: "#ff7b7b", margin: 0, lineHeight: 1.5 }}>
                                ⚠️ Principale problématique : <strong>{bureauMainIssue}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Debout */}
                          <div style={{ padding: "16px", borderRadius: 14, background: "rgba(212,98,42,0.06)", border: "0.5px solid rgba(212,98,42,0.2)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                              <span style={{ fontSize: 18 }}>🏭</span>
                              <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#ffa347" }}>Équipe debout ({debout.count})</span>
                              <span style={{ marginLeft: "auto", fontFamily: T.h, fontWeight: 900, fontSize: 18, color: debout.global ? scoreColor(debout.global) : c.textMuted }}>{debout.global ?? "—"}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {[
                                { label: "Setup", val: debout.setup },
                                { label: "Douleurs", val: debout.pain },
                                { label: "Habitudes", val: debout.habits },
                                { label: "Sommeil", val: debout.sleep },
                              ].map(({ label, val }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, width: 70, flexShrink: 0 }}>{label}</span>
                                  <div style={{ flex: 1, height: 5, background: c.bgCard2, borderRadius: 100, overflow: "hidden" }}>
                                    <div style={{ width: `${val ?? 0}%`, height: "100%", borderRadius: 100, background: val ? scoreColor(val) : c.border }} />
                                  </div>
                                  <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 12, color: val ? scoreColor(val) : c.textMuted, width: 24, textAlign: "right" }}>{val ?? "—"}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,163,71,0.08)", border: "0.5px solid rgba(255,163,71,0.2)" }}>
                              <p style={{ fontFamily: T.b, fontSize: 12, color: "#ffa347", margin: 0, lineHeight: 1.5 }}>
                                ⚠️ Principale problématique : <strong>{deboutMainIssue}</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Troubles identifiés par zone anatomique */}
                    <div style={{ padding: "20px 24px", borderBottom: `0.5px solid ${c.border}`, background: c.bgCard }}>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, marginBottom: 14 }}>🔍 Troubles identifiés par zone anatomique</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          {
                            zone: "Nuque & cervicales",
                            emoji: "🦆",
                            risk: allPain < 55 && allSetup < 65,
                            niveau: allPain < 45 ? "Critique" : allPain < 55 ? "Élevé" : "Modéré",
                            couleur: allPain < 45 ? "#ff7b7b" : allPain < 55 ? "#ffa347" : "#3fe0a0",
                            detail: hasGroups
                              ? `Bureau : douleurs cervicales liées aux écrans trop bas et laptops sans support (score setup ${bureau.setup}/100). Debout : tensions cervicales par port de charges en hauteur.`
                              : `Douleurs cervicales liées à la posture de travail — charge sur les vertèbres cervicales augmentée par la flexion de tête. Score douleurs : ${allPain}/100`,
                            conseils: [
                              "Vérifier la hauteur des écrans — haut de l'écran au niveau des yeux",
                              "Interdire l'usage de laptop seul sans rehausseur et clavier externe",
                              "Intégrer 3 min de rétraction cervicale toutes les 2h",
                            ],
                          },
                          {
                            zone: "Bas du dos & lombaires",
                            emoji: "🌿",
                            risk: allHabits < 60 || allPain < 55,
                            niveau: allHabits < 50 ? "Critique" : allHabits < 60 ? "Élevé" : "Modéré",
                            couleur: allHabits < 50 ? "#ff7b7b" : allHabits < 60 ? "#ffa347" : "#3fe0a0",
                            detail: hasGroups
                              ? `Bureau : station assise prolongée sans pauses (${bureau.habits}/100 habitudes). Debout/entrepôt : lombalgies par manutention sans formation et postures de levage incorrectes (${debout.pain}/100 douleurs).`
                              : `Lombalgies liées aux habitudes de travail — station prolongée sans alternance posturale. Score habitudes : ${allHabits}/100`,
                            conseils: [
                              "Mettre en place une alarme toutes les 45 min pour lever les équipes",
                              "Former les manutentionnaires aux 5 principes de levage sécurisé",
                              "Installer des tapis anti-fatigue aux postes debout fixes",
                            ],
                          },
                          {
                            zone: "Épaules & membres supérieurs",
                            emoji: "🦅",
                            risk: allSetup < 65,
                            niveau: allSetup < 50 ? "Critique" : allSetup < 60 ? "Élevé" : "Modéré",
                            couleur: allSetup < 50 ? "#ff7b7b" : allSetup < 60 ? "#ffa347" : "#3fe0a0",
                            detail: hasGroups
                              ? `Bureau : tensions d'épaules liées au positionnement clavier/souris (${bureau.setup}/100). Entrepôt : tensions d'épaule par gestes répétitifs au-dessus des épaules.`
                              : `TMS des membres supérieurs liés au setup ergonomique. Score setup : ${allSetup}/100`,
                            conseils: [
                              "Vérifier que clavier et souris sont à hauteur des coudes",
                              "Proposer des souris verticales aux employés signalant des douleurs poignets",
                              "Limiter les gestes répétitifs au-dessus des épaules — réorganiser les rangements",
                            ],
                          },
                          {
                            zone: "Jambes & pieds",
                            emoji: "🦵",
                            risk: hasGroups && (debout.pain ?? 100) < 55,
                            niveau: hasGroups && (debout.pain ?? 100) < 45 ? "Critique" : "Modéré",
                            couleur: hasGroups && (debout.pain ?? 100) < 45 ? "#ff7b7b" : hasGroups && (debout.pain ?? 100) < 55 ? "#ffa347" : "#3fe0a0",
                            detail: hasGroups
                              ? `Spécifique équipe debout — jambes lourdes, œdèmes en fin de journée, fatigue des jambes. Fatigue plantaire fréquente. Score douleurs entrepôt : ${debout.pain}/100`
                              : "Zone moins concernée pour les postes bureau.",
                            conseils: [
                              "Imposer des chaussures de travail avec semelle amortissante",
                              "Installer des tapis anti-fatigue sur les postes debout fixes",
                              "Encourager la surélévation des jambes 20 min après le travail",
                            ],
                          },
                        ].filter(t => t.risk || t.zone !== "Jambes & pieds" || hasGroups).map((trouble, i) => (
                          <div key={i} style={{ borderRadius: 14, overflow: "hidden", border: `0.5px solid ${trouble.couleur}30` }}>
                            <div style={{ padding: "12px 16px", background: `${trouble.couleur}08`, display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 20 }}>{trouble.emoji}</span>
                              <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: trouble.couleur }}>{trouble.zone}</span>
                              <span style={{ marginLeft: "auto", padding: "2px 10px", borderRadius: 100, background: `${trouble.couleur}15`, fontFamily: T.b, fontSize: 11, fontWeight: 600, color: trouble.couleur }}>
                                {trouble.niveau}
                              </span>
                            </div>
                            <div style={{ padding: "14px 16px", background: c.bgCard }}>
                              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.7, margin: "0 0 12px" }}>{trouble.detail}</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {trouble.conseils.map((conseil, j) => (
                                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                    <span style={{ color: trouble.couleur, fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                                    <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.5 }}>{conseil}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>


                  </div>
                );
              })()}


              {/* ── Signalements des équipes ── */}
              <div style={{ marginTop: 28 }}>
              <div style={{ borderRadius: 20, padding: "22px 24px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: 0 }}>
                    💬 Signalements de vos équipes
                  </p>
                  <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted }}>
                    {signals.filter(s => !s.treated).length} non traité{signals.filter(s => !s.treated).length > 1 ? "s" : ""}
                  </span>
                </div>

                {signals.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
                    <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>Aucun signalement pour l&apos;instant.</p>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginTop: 4 }}>
                      Vos employés peuvent signaler des problèmes ergonomiques après leur bilan.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {signals.map((signal, i) => (
                      <div key={i} style={{
                        padding: "14px 16px", borderRadius: 12,
                        background: signal.treated ? c.bgCard2 : "rgba(43,92,230,0.05)",
                        border: `0.5px solid ${signal.treated ? c.border : "rgba(43,92,230,0.2)"}`,
                        display: "flex", gap: 14, alignItems: "flex-start",
                        opacity: signal.treated ? 0.6 : 1,
                      }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>
                          {signal.category === "eclairage" ? "💡"
                            : signal.category === "temperature" ? "🌡️"
                            : signal.category === "bruit" ? "🔊"
                            : signal.category === "poste_travail" ? "🪑"
                            : signal.category === "espace" ? "📐"
                            : signal.category === "manutention" ? "📦"
                            : "💬"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(43,92,230,0.10)", fontFamily: T.b, fontSize: 10, fontWeight: 600, color: "#6f9bff", textTransform: "capitalize" }}>
                              {signal.category.replace("_", " ")}
                            </span>
                            <span style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted }}>
                              {new Date(signal.created_at).toLocaleDateString("fr-FR")}
                            </span>
                            {signal.treated && (
                              <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(29,158,117,0.12)", fontFamily: T.b, fontSize: 10, color: "#1d9e75" }}>
                                ✓ Traité
                              </span>
                            )}
                          </div>
                          <p style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>
                            {signal.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB ÉQUIPE ── */}
          {activeTab === "employees" && (
            <motion.div key="employees" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ borderRadius: 20, padding: "22px 24px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: 0 }}>
                    Employés ({employees.length})
                  </p>
                  <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted }}>
                    {assessed.length}/{employees.length} bilans complétés
                  </span>
                </div>
                {employees.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {([
                      { key: "all", label: `Tous (${employees.length})` },
                      { key: "bureau", label: `💻 Bureau (${employees.filter(e => e.job_type === "bureau").length})` },
                      { key: "debout", label: `🏭 Debout (${employees.filter(e => e.job_type === "debout").length})` },
                    ] as const).map(f => (
                      <button key={f.key} onClick={() => setEmployeeFilter(f.key)} style={{
                        padding: "7px 14px", borderRadius: 100,
                        background: employeeFilter === f.key ? "#2b5ce6" : c.bgCard2,
                        color: employeeFilter === f.key ? "#fff" : c.textMuted,
                        fontFamily: T.b, fontWeight: 600, fontSize: 12,
                        border: `0.5px solid ${employeeFilter === f.key ? "#2b5ce6" : c.border}`,
                        cursor: "pointer",
                      }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
                {employees.length === 0 ? (
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, textAlign: "center", padding: "20px 0" }}>
                    Aucun employé inscrit. Partagez le lien d&apos;invitation depuis l&apos;onglet Vue d&apos;ensemble.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {employees.filter(e => employeeFilter === "all" || e.job_type === employeeFilter).map((emp, i) => (
                      <div key={i}>
                        <div
                          onClick={() => setExpandedEmployee(expandedEmployee === emp.anonymous_id ? null : emp.anonymous_id)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 16px", borderRadius: 12,
                            background: c.bgCard2, border: `0.5px solid ${c.border}`,
                            cursor: emp.scores ? "pointer" : "default", gap: 10,
                          }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                              background: emp.global_score ? `${scoreColor(emp.global_score)}15` : c.bgCard,
                              border: `0.5px solid ${emp.global_score ? scoreColor(emp.global_score) + "35" : c.border}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontFamily: T.h, fontWeight: 900, fontSize: 13,
                              color: emp.global_score ? scoreColor(emp.global_score) : c.textMuted,
                            }}>
                              {emp.global_score ?? "—"}
                            </div>
                            <div>
                              <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: c.textPrimary, margin: 0 }}>{emp.anonymous_id}</p>
                              <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>
                                {emp.assessed_at ? `Bilan le ${new Date(emp.assessed_at).toLocaleDateString("fr-FR")}` : "Pas encore de bilan"}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {emp.global_score && (
                              <span style={{ padding: "3px 10px", borderRadius: 100, background: `${scoreColor(emp.global_score)}15`, border: `0.5px solid ${scoreColor(emp.global_score)}35`, fontFamily: T.b, fontSize: 11, color: scoreColor(emp.global_score) }}>
                                {scoreZone(emp.global_score)}
                              </span>
                            )}
                            {/* Badge vidéo */}
                            {emp.video_analysis ? (
                              (() => {
                                const va = emp.video_analysis as Record<string, unknown>;
                                const source = (va.personne as Record<string, unknown>) ?? (va.debout as Record<string, unknown>);
                                const posture = source?.posture_analysis as Record<string, unknown>;
                                const headCrit = (posture?.head_position as Record<string, unknown>)?.status === "critique";
                                const shoulderCrit = (posture?.shoulders as Record<string, unknown>)?.status === "critique";
                                const trunkCrit = (posture?.trunk as Record<string, unknown>)?.status === "critique";
                                const hasCritical = headCrit || shoulderCrit || trunkCrit;
                                return (
                                  <span style={{
                                    padding: "3px 8px", borderRadius: 100, fontSize: 11, fontFamily: T.b, fontWeight: 600,
                                    background: hasCritical ? "rgba(226,75,74,0.15)" : "rgba(29,158,117,0.12)",
                                    color: hasCritical ? "#e24b4a" : "#1d9e75",
                                    border: `0.5px solid ${hasCritical ? "rgba(226,75,74,0.3)" : "rgba(29,158,117,0.25)"}`,
                                  }}>
                                    {hasCritical ? "⚠️ Vidéo critique" : "🎥 Vidéo OK"}
                                  </span>
                                );
                              })()
                            ) : (
                              <span style={{ padding: "3px 8px", borderRadius: 100, fontSize: 11, fontFamily: T.b, background: c.bgCard2, color: c.textMuted, border: `0.5px solid ${c.border}` }}>
                                🎥 Non filmé
                              </span>
                            )}
                            {emp.scores && (
                              <span style={{ fontSize: 12, color: c.textMuted }}>{expandedEmployee === emp.anonymous_id ? "▲" : "▼"}</span>
                            )}
                          </div>
                        </div>
                        <AnimatePresence>
                          {expandedEmployee === emp.anonymous_id && emp.scores && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              style={{
                                background: c.bgCard, borderRadius: "0 0 12px 12px",
                                border: `0.5px solid ${c.border}`, borderTop: "none",
                                overflow: "hidden",
                              }}
                            >
                              <div style={{ padding: "16px 18px" }}>
                                {(() => {
                                  const analysis = analyzeEmployee(emp);
                                  return (
                                    <>
                                      <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, marginBottom: 12 }}>
                                        {emp.job_type === "bureau" ? "💻" : "🏭"} {analysis.profile}
                                      </p>

                                      {/* Scores par dimension */}
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                                        {Object.entries(DIM_META).map(([key, meta]) => {
                                          const score = emp.scores?.[key];
                                          return (
                                            <div key={key} style={{
                                              padding: "8px 10px", borderRadius: 10,
                                              background: score ? `${scoreColor(score)}08` : c.bgCard2,
                                              border: `0.5px solid ${score ? scoreColor(score) + "25" : c.border}`,
                                              textAlign: "center",
                                            }}>
                                              <p style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted, margin: "0 0 3px" }}>
                                                {meta.emoji} {meta.label}
                                              </p>
                                              <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 16, color: score ? scoreColor(score) : c.textMuted, margin: 0 }}>
                                                {score ?? "—"}
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Flags */}
                                      {analysis.flags.length > 0 && (
                                        <div style={{ marginBottom: 14 }}>
                                          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                                            Signaux détectés
                                          </p>
                                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {analysis.flags.map((flag, fi) => (
                                              <span key={fi} style={{
                                                padding: "3px 10px", borderRadius: 100,
                                                background: `${flag.color}15`,
                                                border: `0.5px solid ${flag.color}35`,
                                                fontFamily: T.b, fontSize: 11, color: flag.color,
                                                fontWeight: flag.severity === "critical" ? 700 : 400,
                                              }}>
                                                {flag.severity === "critical" ? "⚠️ " : ""}{flag.label}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Problèmes principaux */}
                                      {analysis.mainIssues.length > 0 && (
                                        <div style={{ marginBottom: 14 }}>
                                          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                                            Problèmes identifiés
                                          </p>
                                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            {analysis.mainIssues.map((issue, ii) => (
                                              <div key={ii} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                                <span style={{ color: "#ff7b7b", fontSize: 12, flexShrink: 0, marginTop: 2 }}>→</span>
                                                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textSecondary, margin: 0, lineHeight: 1.55 }}>{issue}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Recommandations */}
                                      {analysis.recommendations.length > 0 && (
                                        <div style={{
                                          padding: "12px 14px", borderRadius: 10,
                                          background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.18)",
                                        }}>
                                          <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#6f9bff", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                                            Actions recommandées
                                          </p>
                                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            {analysis.recommendations.map((rec, ri) => (
                                              <div key={ri} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                                <span style={{ color: "#6f9bff", fontSize: 12, flexShrink: 0, marginTop: 2 }}>✓</span>
                                                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textSecondary, margin: 0, lineHeight: 1.55 }}>{rec}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    {/* Analyse vidéo */}
                                    {emp.video_analysis && (() => {
                                      const va = emp.video_analysis;
                                      const personne = (va.personne as Record<string, unknown>) ?? null;
                                      const debout = (va.debout as Record<string, unknown>) ?? null;
                                      const analyse = personne ?? debout;
                                      if (!analyse) return null;

                                      const posture = analyse.posture_analysis as Record<string, unknown> ?? {};
                                      const postureScore = posture.score as number ?? null;
                                      const overall = posture.overall_observation as string ?? null;
                                      const actions = analyse.priority_actions as Record<string, unknown>[] ?? [];

                                      return (
                                        <div style={{ marginTop: 12 }}>
                                          <div style={{
                                            padding: "12px 14px", borderRadius: 10,
                                            background: "rgba(124,58,237,0.08)", border: "0.5px solid rgba(124,58,237,0.25)",
                                            marginBottom: 10,
                                          }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                              <span style={{ fontSize: 16 }}>🎥</span>
                                              <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "#c4b5fd" }}>
                                                Analyse vidéo IA posturale
                                              </span>
                                              {postureScore && (
                                                <span style={{
                                                  marginLeft: "auto", padding: "2px 10px", borderRadius: 100,
                                                  background: `${scoreColor(postureScore)}15`,
                                                  border: `0.5px solid ${scoreColor(postureScore)}35`,
                                                  fontFamily: T.h, fontWeight: 700, fontSize: 12,
                                                  color: scoreColor(postureScore),
                                                }}>
                                                  {postureScore}/100
                                                </span>
                                              )}
                                            </div>
                                            {overall && (
                                              <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t60)", lineHeight: 1.6, margin: "0 0 10px" }}>
                                                {overall}
                                              </p>
                                            )}
                                            {actions.length > 0 && (
                                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                {actions.slice(0, 2).map((action, ai) => (
                                                  <div key={ai} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                                    <span style={{ color: "#c4b5fd", fontSize: 11, flexShrink: 0, marginTop: 2 }}>
                                                      {ai + 1}.
                                                    </span>
                                                    <div>
                                                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 12, color: "#c4b5fd", margin: "0 0 2px" }}>
                                                        {action.title as string}
                                                      </p>
                                                      <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t45)", margin: 0, lineHeight: 1.5 }}>
                                                        {action.impact as string}
                                                      </p>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    {/* Badge si pas de vidéo */}
                                    {!emp.video_analysis && emp.global_score && (
                                      <div style={{
                                        marginTop: 12, padding: "10px 14px", borderRadius: 10,
                                        background: "rgba(124,58,237,0.04)", border: "0.5px dashed rgba(124,58,237,0.25)",
                                        display: "flex", alignItems: "center", gap: 8,
                                      }}>
                                        <span style={{ fontSize: 14 }}>🎥</span>
                                        <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t40)", margin: 0 }}>
                                          Analyse vidéo non effectuée — inviter cet employé à compléter son bilan
                                        </p>
                                      </div>
                                    )}
                                    </>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TAB ÉVOLUTION ── */}
          {activeTab === "evolution" && (
            <motion.div key="evolution" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {evolutionData.length < 2 ? (
                <div style={{ borderRadius: 20, padding: "48px 24px", background: c.bgCard, border: `0.5px solid ${c.border}`, textAlign: "center" }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>📊</p>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: c.textPrimary, marginBottom: 8 }}>
                    Pas encore assez de données
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, maxWidth: 360, margin: "0 auto" }}>
                    Le graphique d&apos;évolution s&apos;affiche à partir de 2 mois de données. Invitez vos équipes à compléter leur bilan.
                  </p>
                </div>
              ) : (
                <>
                  {/* Trend badge */}
                  {(() => {
                    const last = evolutionData[evolutionData.length - 1].global;
                    const prev = evolutionData[evolutionData.length - 2].global;
                    const diff = last !== null && prev !== null ? last - prev : null;
                    return diff !== null ? (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px",
                        borderRadius: 100, marginBottom: 16,
                        background: diff >= 0 ? "rgba(29,158,117,0.10)" : "rgba(255,123,123,0.10)",
                        border: `0.5px solid ${diff >= 0 ? "rgba(29,158,117,0.3)" : "rgba(255,123,123,0.3)"}`,
                      }}>
                        <span style={{ fontSize: 16 }}>{diff >= 0 ? "📈" : "📉"}</span>
                        <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: diff >= 0 ? "#1d9e75" : "#ff7b7b" }}>
                          {diff >= 0 ? "+" : ""}{diff} pts vs mois précédent
                        </span>
                        <span style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted }}>
                          Score global : {last}/100
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {/* LineChart */}
                  <div style={{ borderRadius: 20, padding: "24px", background: c.bgCard, border: `0.5px solid ${c.border}`, marginBottom: 16 }}>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 4 }}>
                      Évolution mensuelle du score santé
                    </p>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, marginBottom: 20 }}>
                      Score global · Score bureau · Score postes debout
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={evolutionData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
                        <XAxis dataKey="mois" tick={{ fontFamily: T.b, fontSize: 11, fill: c.textMuted }} />
                        <YAxis domain={[0, 100]} tick={{ fontFamily: T.b, fontSize: 11, fill: c.textMuted }} />
                        <Tooltip
                          contentStyle={{ background: c.bgCard2, border: `0.5px solid ${c.border2}`, borderRadius: 12, fontFamily: T.b, fontSize: 12 }}
                          labelStyle={{ color: c.textPrimary, fontWeight: 700, marginBottom: 4 }}
                          itemStyle={{ color: c.textSecondary }}
                        />
                        <Legend wrapperStyle={{ fontFamily: T.b, fontSize: 12, paddingTop: 12 }} />
                        <Line type="monotone" dataKey="global" name="Global" stroke="#2b5ce6" strokeWidth={2.5} dot={{ r: 4, fill: "#2b5ce6" }} activeDot={{ r: 6 }} connectNulls />
                        <Line type="monotone" dataKey="bureau" name="Bureau" stroke="#6f9bff" strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 3 }} connectNulls />
                        <Line type="monotone" dataKey="debout" name="Debout" stroke="#ffa347" strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 3 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>

                    {(() => {
                      const withVideoCount = employees.filter(e => e.video_analysis !== null).length;
                      const totalAssessed = assessed.length;
                      const videoPct = totalAssessed > 0 ? Math.round((withVideoCount / totalAssessed) * 100) : 0;
                      const avgVideoScore = employees
                        .filter(e => e.video_analysis !== null)
                        .map(e => {
                          const va = e.video_analysis as Record<string, unknown>;
                          const source = (va?.personne as Record<string, unknown>) ?? (va?.debout as Record<string, unknown>);
                          const posture = source?.posture_analysis as Record<string, unknown>;
                          return posture?.score as number ?? null;
                        })
                        .filter((s): s is number => s !== null);
                      const avgVideo = avgVideoScore.length ? Math.round(avgVideoScore.reduce((a, b) => a + b, 0) / avgVideoScore.length) : null;

                      return avgVideo ? (
                        <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(124,58,237,0.06)", border: "0.5px solid rgba(124,58,237,0.18)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#c4b5fd", margin: 0 }}>{avgVideo}</p>
                            <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>Score posture vidéo</p>
                          </div>
                          <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, flex: 1 }}>
                            Basé sur {withVideoCount} analyse{withVideoCount > 1 ? "s" : ""} vidéo ({videoPct}% de participation).
                            {avgVideo >= 65 ? " Postures globalement satisfaisantes." : avgVideo >= 50 ? " Des améliorations posturales sont possibles." : " Postures nécessitant une attention urgente."}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Tableau mensuel */}
                  <div style={{ borderRadius: 20, padding: "22px 24px", background: c.bgCard, border: `0.5px solid ${c.border}` }}>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 16 }}>
                      Détail mensuel
                    </p>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.b, fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: `0.5px solid ${c.border}` }}>
                            {["Mois", "Bilans", "Score global", "Bureau", "Debout"].map(h => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: c.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...evolutionData].reverse().map((row, i) => (
                            <tr key={i} style={{ borderBottom: `0.5px solid ${c.border}` }}>
                              <td style={{ padding: "10px 12px", color: c.textPrimary, fontWeight: 600 }}>{row.mois}</td>
                              <td style={{ padding: "10px 12px", color: c.textSecondary }}>{row.count}</td>
                              <td style={{ padding: "10px 12px" }}>
                                {row.global !== null ? (
                                  <span style={{ fontWeight: 700, color: scoreColor(row.global) }}>{row.global}/100</span>
                                ) : <span style={{ color: c.textMuted }}>—</span>}
                              </td>
                              <td style={{ padding: "10px 12px" }}>
                                {row.bureau !== null ? (
                                  <span style={{ color: "#6f9bff" }}>{row.bureau}/100</span>
                                ) : <span style={{ color: c.textMuted }}>—</span>}
                              </td>
                              <td style={{ padding: "10px 12px" }}>
                                {row.debout !== null ? (
                                  <span style={{ color: "#ffa347" }}>{row.debout}/100</span>
                                ) : <span style={{ color: c.textMuted }}>—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── TAB EXERCICES ── */}
          {activeTab === "exercises" && (
            <motion.div key="exercises" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {(() => {
                const collective = analyzeCollectiveVideo(employees, assessed);
                if (!collective || collective.total === 0) return null;

                const bureauHeadCrit = collective.bureauTrends.find(t => t.zone === "Projection de tête");
                const deboutTrunkCrit = collective.deboutTrends.find(t => t.zone === "Position tronc");
                const showBureauAlert = bureauHeadCrit && (bureauHeadCrit.critique + bureauHeadCrit.attention) > bureauHeadCrit.total * 0.5;
                const showDeboutAlert = deboutTrunkCrit && (deboutTrunkCrit.critique + deboutTrunkCrit.attention) > deboutTrunkCrit.total * 0.5;

                if (!showBureauAlert && !showDeboutAlert) return null;

                return (
                  <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 14, background: "rgba(124,58,237,0.06)", border: "0.5px solid rgba(124,58,237,0.2)" }}>
                    <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "#c4b5fd", marginBottom: 8 }}>
                      🎥 Programme adapté selon vos résultats vidéo
                    </p>
                    {showBureauAlert && (
                      <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: "0 0 4px", lineHeight: 1.55 }}>
                        💻 Bureau : projection de tête détectée chez {bureauHeadCrit!.critique + bureauHeadCrit!.attention}/{bureauHeadCrit!.total} employés — programme cervical prioritaire
                      </p>
                    )}
                    {showDeboutAlert && (
                      <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.55 }}>
                        🏭 Debout : contraintes lombaires chez {deboutTrunkCrit!.critique + deboutTrunkCrit!.attention}/{deboutTrunkCrit!.total} employés — programme lombaire prioritaire
                      </p>
                    )}
                  </div>
                );
              })()}
              <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
                {(["bureau", "debout"] as const).map(p => (
                  <button key={p} onClick={() => setActiveProfile(p)} style={{
                    padding: "9px 20px", borderRadius: 100,
                    background: activeProfile === p ? "#2b5ce6" : c.bgCard2,
                    color: activeProfile === p ? "#fff" : c.textMuted,
                    fontFamily: T.b, fontWeight: 600, fontSize: 13, cursor: "pointer",
                    border: `0.5px solid ${activeProfile === p ? "#2b5ce6" : c.border}`,
                  }}>
                    {p === "bureau" ? "💻 Postes bureau" : "🏭 Postes debout"}
                  </button>
                ))}
              </div>

              <div style={{ borderRadius: 20, padding: "24px", background: c.bgCard, border: `0.5px solid ${c.border}`, marginBottom: 16 }}>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 4 }}>
                  Programme collectif — {activeProfile === "bureau" ? "Postes bureau & télétravail" : "Postes debout & manutention"}
                </p>
                <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 20 }}>
                  Routine de 10-15 minutes, idéale en début de journée ou après déjeuner. Peut être animée par un référent interne.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {EXERCISES_BY_PROFILE[activeProfile].map((ex, i) => (
                    <a key={i} href={`/mobilite?exercise=${encodeURIComponent(ex.name)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", gap: 14, padding: "16px", borderRadius: 14, background: c.bgCard2, border: `0.5px solid ${c.border}`, cursor: "pointer", transition: "border-color 0.2s" }}>
                        <span style={{ fontSize: 28, flexShrink: 0 }}>{ex.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                            <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: 0 }}>{ex.name}</p>
                            <span style={{ padding: "2px 10px", borderRadius: 100, background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.2)", fontFamily: T.b, fontSize: 11, color: "#6f9bff", flexShrink: 0, marginLeft: 8 }}>{ex.duration}</span>
                          </div>
                          <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.55 }}>{ex.desc}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                  <a href={`/mobilite?program=${activeProfile === "bureau" ? "nuque" : "dos"}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div style={{ marginTop: 8, padding: "14px 0", borderRadius: 100, textAlign: "center", background: "#2b5ce6", color: "#fff", fontFamily: T.h, fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(43,92,230,0.3)" }}>
                      Lancer le programme complet dans PAW →
                    </div>
                  </a>
                </div>
              </div>

              <div style={{ borderRadius: 16, padding: "18px 20px", background: "rgba(29,158,117,0.06)", border: "0.5px solid rgba(29,158,117,0.2)" }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "#5dcaa5", margin: 0, lineHeight: 1.6 }}>
                  💡 <strong>Conseil d&apos;implémentation :</strong> Affichez ce programme en salle de pause ou envoyez-le par email à vos équipes. Une routine de 10 min, 3x/semaine, réduit significativement les TMS chroniques sur 3 mois.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── TAB RESSOURCES ── */}
          {activeTab === "resources" && (
            <motion.div key="resources" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {RESOURCES.map((cat, ci) => (
                  <div key={ci}>
                    <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: cat.color, textTransform: "uppercase", marginBottom: 12 }}>
                      {cat.category}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                      {cat.items.map((item, ii) => (
                        <a key={ii} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                          <div style={{
                            padding: "18px 20px", borderRadius: 16,
                            background: c.bgCard, border: `0.5px solid ${c.border}`,
                            cursor: "pointer", transition: "border-color 0.15s",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 16 }}>{item.type === "video" ? "▶️" : "📄"}</span>
                              <span style={{ padding: "2px 8px", borderRadius: 100, background: `${cat.color}15`, fontFamily: T.b, fontSize: 10, fontWeight: 700, color: cat.color }}>
                                {item.source}
                              </span>
                              <span style={{ padding: "2px 8px", borderRadius: 100, background: c.bgCard2, fontFamily: T.b, fontSize: 10, color: c.textMuted }}>
                                {item.type === "video" ? "Vidéo" : "Guide PDF"}
                              </span>
                            </div>
                            <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: "0 0 6px", lineHeight: 1.3 }}>{item.title}</p>
                            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ borderRadius: 16, padding: "20px", background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.18)", textAlign: "center" }}>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 6 }}>
                    📞 Besoin d&apos;aller plus loin ?
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
                    Votre call de restitution avec Julien Beumier, kinésithérapeute fondateur de PAW, est inclus dans votre plan. Une heure pour analyser vos résultats collectifs et définir les actions prioritaires.
                  </p>
                  <a href="mailto:hello@postureatwork.com?subject=Demande de call de restitution" style={{ textDecoration: "none" }}>
                    <button style={{ padding: "12px 24px", borderRadius: 100, border: "none", background: "#2b5ce6", color: "#fff", fontFamily: T.h, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      Planifier mon call kiné →
                    </button>
                  </a>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
