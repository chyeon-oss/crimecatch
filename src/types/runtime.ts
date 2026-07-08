/**
 * Case Runtime types.
 *
 * A case-agnostic runtime layer that drives a detective case as a state
 * machine: scenes → objectives → discoveries → next scene. The UI reads
 * from CaseRuntimeState; it should never mutate it directly.
 */

export type GameStatus =
  | "INTRO"
  | "INVESTIGATION"
  | "ANALYSIS"
  | "INTERROGATION"
  | "ACCUSATION"
  | "RECONSTRUCTION"
  | "COMPLETE";

export type QuestionRuntimeStatus = "LOCKED" | "ACTIVE" | "SOLVED";
export type HotspotRuntimeStatus = "LOCKED" | "AVAILABLE" | "COMPLETED";

export interface RuntimeUnlockCondition {
  requiresEvidenceIds?: string[];
  requiresQuestionIds?: string[];
  requiresSceneIds?: string[];
  requiresInterviewedSuspectIds?: string[];
}

export interface RuntimeCompletionCondition {
  requiresEvidenceIds?: string[];
  requiresInterviewedSuspectIds?: string[];
  requiresHotspotIds?: string[];
  requiresSolvedQuestionIds?: string[];
  /** Fallback: complete when N of the scene's rewards are collected. */
  minEvidenceRewards?: number;
}

export interface RuntimeEvidence {
  id: string;
  title: string;
  description: string;
  category: string;
  importance: "COMMON" | "UNCOMMON" | "IMPORTANT" | "CRITICAL";
  location?: string;
  discovered: boolean;
  relatedEvidence?: string[];
  relatedQuestions?: string[];
  /** Auto-generated notebook entry text when this evidence is discovered. */
  notebookEntry?: string;
}

export interface RuntimeQuestion {
  id: string;
  title: string;
  description: string;
  status: QuestionRuntimeStatus;
  /** Question becomes ACTIVE when ANY of these are discovered. */
  unlockedByEvidenceIds?: string[];
  /** Question becomes SOLVED when ALL of these are read/discovered. */
  solvedByEvidenceIds?: string[];
}

export interface RuntimeHotspot {
  id: string;
  title: string;
  status: HotspotRuntimeStatus;
  /** Evidence revealed when investigated. */
  revealsEvidenceIds: string[];
  unlockCondition?: RuntimeUnlockCondition;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  objective: string;
  /** Recommended game status while this scene is active. */
  status: GameStatus;
  availableHotspotIds: string[];
  availableSuspectIds: string[];
  evidenceRewardIds: string[];
  unlockCondition?: RuntimeUnlockCondition;
  completionCondition?: RuntimeCompletionCondition;
  nextSceneId?: string | null;
}

export interface CaseDefinition {
  id: string;
  title: string;
  scenes: Scene[];
  evidence: RuntimeEvidence[];
  questions: RuntimeQuestion[];
  hotspots: RuntimeHotspot[];
  suspectIds: string[];
  startSceneId: string;
}

export type NotebookAutoEntryKind =
  | "EVIDENCE_DISCOVERED"
  | "QUESTION_UNLOCKED"
  | "QUESTION_SOLVED"
  | "SCENE_COMPLETED";

export interface NotebookAutoEntry {
  id: string;
  kind: NotebookAutoEntryKind;
  section: "suspects" | "timeline" | "evidence" | "questions" | "theories";
  text: string;
  at: number;
}

export interface CaseRuntimeState {
  caseId: string;
  currentScene: string | null;
  currentObjective: string | null;
  investigationProgress: number; // 0..1
  discoveredEvidence: string[];
  activeQuestions: string[];
  solvedQuestions: string[];
  unlockedHotspots: string[];
  interviewedSuspects: string[];
  completedScenes: string[];
  gameStatus: GameStatus;
  /** Non-authoritative log of auto-generated notebook entries. */
  notebookQueue: NotebookAutoEntry[];
}

export type RuntimeAction =
  | { type: "INVESTIGATE_HOTSPOT"; hotspotId: string }
  | { type: "DISCOVER_EVIDENCE"; evidenceId: string }
  | { type: "READ_EVIDENCE"; evidenceId: string }
  | { type: "INTERVIEW_SUSPECT"; suspectId: string }
  | { type: "SOLVE_QUESTION"; questionId: string }
  | { type: "ADVANCE_SCENE" }
  | { type: "SET_STATUS"; status: GameStatus }
  | { type: "SUBMIT_ACCUSATION"; correct: boolean }
  | { type: "RESET" };
