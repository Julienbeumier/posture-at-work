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
