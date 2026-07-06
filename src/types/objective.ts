import type { InvestigationPhase } from "./story";

export type ObjectiveStatus = "locked" | "active" | "in_progress" | "completed";
export type ObjectivePriority = "critical" | "high" | "normal" | "low";
export type ObjectiveCategory =
  | "SCENE"
  | "EVIDENCE"
  | "INTERROGATION"
  | "ANALYSIS"
  | "THEORY"
  | "ACCUSATION";

export interface Objective {
  id: string;
  title: string;
  description?: string;
  category: ObjectiveCategory;
  priority: ObjectivePriority;
  phase: InvestigationPhase;
  status: ObjectiveStatus;
  /** 0..1 progress inside the objective (e.g. 3/5 hotspots). */
  progress: number;
  /** Optional current/total to render "3/5". */
  count?: { current: number; total: number };
}
