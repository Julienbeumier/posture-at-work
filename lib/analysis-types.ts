export type StatusLevel = "bon" | "attention" | "critique";

export interface PostureItem {
  status: StatusLevel;
  observation: string;
  impact: string;
}

export interface SetupItem {
  status: StatusLevel;
  observation: string;
  recommendation: string;
}

export interface PriorityAction {
  rank: number;
  title: string;
  why: string;
  how: string;
  impact: string;
}

export interface ExerciseItem {
  name: string;
  target: string;
  duration: string;
  instruction: string;
  frequency: string;
}

export interface ProductItem {
  name: string;
  reason: string;
  priority: "haute" | "moyenne" | "optionnel";
  amazon_search: string;
}

export interface AnalysisReport {
  posture_analysis: {
    score: number;
    head_position: PostureItem;
    neck_position: PostureItem;
    shoulders: PostureItem;
    trunk: PostureItem;
    overall_observation: string;
  };
  setup_analysis: {
    screen_height: SetupItem;
    screen_distance: SetupItem;
    keyboard_mouse: SetupItem;
    chair_setup: SetupItem;
    overall_observation: string;
  };
  priority_actions: PriorityAction[];
  exercises: ExerciseItem[];
  products: ProductItem[];
  final_message: string;
}

export interface StoredFrames {
  posture: string[]; // 4 base64 JPEG
  bureau: string[]; // 2 base64 JPEG
}

// ─── Dual-analysis types (bureau mode) ───────────────────────────────────────

export interface PersonneSegment {
  score: number;
  issues: string[];
  note: string;
}

export interface PersonneAnalysis {
  analysisType: "personne";
  globalPostureScore: number;
  segments: {
    tete_cou: PersonneSegment;
    epaules_dos_haut: PersonneSegment;
    bas_dos_bassin: PersonneSegment;
    membres_superieurs: PersonneSegment;
    membres_inferieurs: PersonneSegment;
  };
  mainIssues: Array<{
    zone: string;
    issue: string;
    severity: "faible" | "modéré" | "élevé";
    consequence: string;
  }>;
  positivePoints: string[];
  recommendations: Array<{
    priority: number;
    action: string;
    why: string;
    immediat: boolean;
  }>;
  overallAssessment: string;
}

export interface PosteAnalysis {
  analysisType: "poste";
  globalSetupScore: number;
  elements: {
    ecran: {
      score: number;
      hauteur: "trop_bas" | "correct" | "trop_haut";
      distance: "trop_proche" | "correcte" | "trop_loin";
      type: "laptop_seul" | "ecran_externe" | "double_ecran";
      issues: string[];
    };
    clavier_souris: { score: number; issues: string[]; repose_poignets: boolean | null };
    chaise: { score: number; type: string; issues: string[]; accoudoirs: boolean | null };
    organisation: { score: number; issues: string[]; eclairage: "bon" | "moyen" | "mauvais" };
  };
  mainIssues: Array<{
    element: string;
    issue: string;
    severity: "faible" | "modéré" | "élevé";
    fix: string;
  }>;
  positivePoints: string[];
  recommendations: Array<{
    priority: number;
    action: string;
    why: string;
    cost: "gratuit" | "< 30€" | "30-100€" | "> 100€";
  }>;
  overallAssessment: string;
}

// ─── Debout analysis type ─────────────────────────────────────────────────────

export interface DeboutPostureSegment {
  score: number;
  status: "bon" | "attention" | "critique";
  observation: string;
}

export interface DeboutAnalysis {
  analysisType: "debout";
  globalPostureScore: number;
  jobTypeDetected?: string;
  posture: {
    colonne: DeboutPostureSegment;
    epaules: DeboutPostureSegment;
    tete_cou: DeboutPostureSegment;
    appui_jambes: DeboutPostureSegment;
    membres_superieurs: DeboutPostureSegment;
  };
  environnement: {
    plan_travail: { hauteur: "adapte" | "trop_bas" | "trop_haut" | "non_visible"; observation: string };
    tapis_antifatigue: "oui" | "non" | "non_visible";
    sol: string;
    contraintes_visibles: string[];
  };
  mainIssues: Array<{
    zone: string;
    issue: string;
    severity: "faible" | "modere" | "eleve";
    consequence: string;
  }>;
  positivePoints: string[];
  recommendations: Array<{
    priority: number;
    action: string;
    why: string;
    applicable_tous_postes: boolean;
  }>;
  overallAssessment: string;
}
