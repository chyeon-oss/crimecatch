/**
 * Story Runtime types.
 *
 * The Story Runtime is a case-agnostic layer that sits on top of the
 * investigation engines (Evidence / Intelligence / Board). It tracks the
 * narrative shape of a playthrough — where the detective currently is in
 * the story, what they are supposed to be doing, and how far along they
 * are — without knowing anything about a specific case's content.
 */

export type InvestigationPhase =
  | "ARRIVAL"
  | "CRIME_SCENE_INVESTIGATION"
  | "EVIDENCE_ANALYSIS"
  | "SUSPECT_INVESTIGATION"
  | "THEORY_BUILDING"
  | "FINAL_ACCUSATION"
  | "TRUTH_RECONSTRUCTION";

export interface PhaseDefinition {
  phase: InvestigationPhase;
  /** Ordered index — used for progress rendering. */
  order: number;
  title: string;
  koreanTitle: string;
  description: string;
}

/**
 * A Chapter is a narrative slice of the case. Cases can declare their
 * own chapters later; the runtime treats them opaquely.
 */
export interface StoryChapter {
  id: string;
  title: string;
  /** Phase this chapter is expected to advance into. */
  targetPhase: InvestigationPhase;
}

/** A short instruction shown to the player as their current goal. */
export interface StoryObjective {
  id: string;
  text: string;
  phase: InvestigationPhase;
}

/**
 * Events emitted by gameplay actions. The runtime consumes them and
 * updates its state; UI can also render them as a timeline of what
 * happened during the investigation.
 */
export type StoryEvent =
  | { type: "HOTSPOT_INVESTIGATED"; hotspotId: string; at: number }
  | { type: "EVIDENCE_DISCOVERED"; evidenceId: string; at: number }
  | { type: "EVIDENCE_READ"; evidenceId: string; at: number }
  | { type: "SUSPECT_INTERROGATED"; suspectId: string; at: number }
  | { type: "PIN_ADDED"; pinId: string; at: number }
  | { type: "CONNECTION_ADDED"; connectionId: string; at: number }
  | { type: "THEORY_CREATED"; theoryId: string; at: number }
  | { type: "QUESTION_SOLVED"; questionId: string; at: number }
  | { type: "ACCUSATION_SUBMITTED"; correct: boolean; at: number };

export interface StoryRuntimeState {
  currentChapterId: string | null;
  currentObjectiveId: string | null;
  phase: InvestigationPhase;
  /** 0..1 progress through the whole investigation. */
  progress: number;
  discoveredEvidenceIds: string[];
  readEvidenceIds: string[];
  solvedQuestionIds: string[];
  activeQuestionIds: string[];
  events: StoryEvent[];
  accusationSubmitted: boolean;
}
