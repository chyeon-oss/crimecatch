import type {
  Case,
  InvestigationPhase,
  PhaseDefinition,
  StoryChapter,
  StoryEvent,
  StoryObjective,
  StoryRuntimeState,
} from "@/types";
import { IntelligenceEngine, type IntelligenceState } from "./IntelligenceEngine";
import type { BoardState } from "@/types";

/**
 * StoryRuntime — case-agnostic narrative controller.
 *
 * It never mutates the underlying investigation engines. It observes
 * their outputs plus a stream of StoryEvents, and derives:
 *   - the current investigation phase
 *   - overall progress (%)
 *   - the current chapter + objective
 *   - active vs solved questions
 *
 * Cases can declare their own chapters and objectives; if they don't,
 * the runtime falls back to a default arc built from the phase list.
 */

export const PHASES: PhaseDefinition[] = [
  {
    phase: "ARRIVAL",
    order: 0,
    title: "Arrival",
    koreanTitle: "현장 도착",
    description: "사건 브리핑을 확인하고 현장에 진입합니다.",
  },
  {
    phase: "CRIME_SCENE_INVESTIGATION",
    order: 1,
    title: "Crime Scene Investigation",
    koreanTitle: "현장 조사",
    description: "범죄 현장을 수색하고 단서를 발견합니다.",
  },
  {
    phase: "EVIDENCE_ANALYSIS",
    order: 2,
    title: "Evidence Analysis",
    koreanTitle: "증거 분석",
    description: "확보한 증거를 하나씩 열람하고 의미를 파악합니다.",
  },
  {
    phase: "SUSPECT_INVESTIGATION",
    order: 3,
    title: "Suspect Investigation",
    koreanTitle: "용의자 조사",
    description: "용의자들의 진술과 증거의 모순을 찾습니다.",
  },
  {
    phase: "THEORY_BUILDING",
    order: 4,
    title: "Theory Building",
    koreanTitle: "가설 구축",
    description: "수사 보드에 단서를 연결하며 가설을 세웁니다.",
  },
  {
    phase: "FINAL_ACCUSATION",
    order: 5,
    title: "Final Accusation",
    koreanTitle: "최종 지목",
    description: "충분한 근거를 확보하고 범인을 지목합니다.",
  },
  {
    phase: "TRUTH_RECONSTRUCTION",
    order: 6,
    title: "Truth Reconstruction",
    koreanTitle: "진실 복원",
    description: "사건의 진실을 재구성하고 마무리합니다.",
  },
];

const PHASE_BY_KEY = new Map(PHASES.map((p) => [p.phase, p]));

export interface StoryRuntimeInputs {
  case: Case;
  discoveredIds: Set<string>;
  readIds: Set<string>;
  investigatedHotspotIds: Set<string>;
  interrogatedSuspectIds?: Set<string>;
  board: BoardState;
  accusationSubmitted?: boolean;
  accusationCorrect?: boolean;
  events?: StoryEvent[];
  chapters?: StoryChapter[];
  objectives?: StoryObjective[];
}

function defaultChapters(): StoryChapter[] {
  return PHASES.map((p) => ({
    id: `chapter-${p.phase.toLowerCase()}`,
    title: p.koreanTitle,
    targetPhase: p.phase,
  }));
}

function defaultObjectives(): StoryObjective[] {
  return [
    { id: "obj-arrival", phase: "ARRIVAL", text: "사건 브리핑을 확인하고 현장을 조사할 준비를 하세요." },
    { id: "obj-scene", phase: "CRIME_SCENE_INVESTIGATION", text: "범죄 현장의 모든 지점을 조사해 증거를 확보하세요." },
    { id: "obj-analysis", phase: "EVIDENCE_ANALYSIS", text: "확보한 증거를 하나씩 열람하며 단서를 파악하세요." },
    { id: "obj-suspects", phase: "SUSPECT_INVESTIGATION", text: "용의자들의 진술과 증거의 모순을 찾으세요." },
    { id: "obj-theory", phase: "THEORY_BUILDING", text: "수사 보드에 단서를 연결하고 가설을 세우세요." },
    { id: "obj-accuse", phase: "FINAL_ACCUSATION", text: "충분히 조사했다면 범인을 지목하세요." },
    { id: "obj-truth", phase: "TRUTH_RECONSTRUCTION", text: "사건의 진실을 재구성하고 수사를 마무리하세요." },
  ];
}

function derivePhase(inputs: StoryRuntimeInputs): InvestigationPhase {
  const {
    case: c,
    discoveredIds,
    readIds,
    investigatedHotspotIds,
    interrogatedSuspectIds,
    board,
    accusationSubmitted,
  } = inputs;

  if (accusationSubmitted) return "TRUTH_RECONSTRUCTION";

  const totalHotspots = c.crimeScene?.hotspots.length ?? 0;
  const totalEvidence = c.evidence.length;
  const totalSuspects = c.suspects.length;

  const hotspotRatio = totalHotspots ? investigatedHotspotIds.size / totalHotspots : 1;
  const discoveryRatio = totalEvidence ? discoveredIds.size / totalEvidence : 0;
  const readRatio = discoveredIds.size ? readIds.size / discoveredIds.size : 0;
  const suspectRatio = totalSuspects
    ? (interrogatedSuspectIds?.size ?? 0) / totalSuspects
    : 0;

  const rules = c.unlockRules;
  const canAccuse =
    readIds.size >= (rules.minEvidenceReadBeforeAccusation ?? 0) &&
    (interrogatedSuspectIds?.size ?? 0) >=
      (rules.minSuspectsInterrogatedBeforeAccusation ?? 0);

  if (canAccuse && board.theories.length > 0) return "FINAL_ACCUSATION";
  if (board.pins.length >= 2 || board.theories.length > 0) return "THEORY_BUILDING";
  if (suspectRatio > 0 && readRatio >= 0.5) return "SUSPECT_INVESTIGATION";
  if (discoveryRatio >= 0.5 && readRatio > 0) return "EVIDENCE_ANALYSIS";
  if (hotspotRatio > 0 || discoveredIds.size > 0) return "CRIME_SCENE_INVESTIGATION";
  return "ARRIVAL";
}

function computeProgress(inputs: StoryRuntimeInputs, phase: InvestigationPhase): number {
  if (phase === "TRUTH_RECONSTRUCTION") return 1;
  const def = PHASE_BY_KEY.get(phase);
  if (!def) return 0;
  // Base progress = phase index / total, plus a small intra-phase bonus.
  const base = def.order / (PHASES.length - 1);
  const nextBoundary = (def.order + 1) / (PHASES.length - 1);
  const span = nextBoundary - base;

  const c = inputs.case;
  const totalEvidence = c.evidence.length || 1;
  const intra =
    (inputs.readIds.size / totalEvidence) * 0.5 +
    (inputs.discoveredIds.size / totalEvidence) * 0.5;
  return Math.min(1, base + span * Math.min(1, intra));
}

export const StoryRuntime = {
  phases: PHASES,
  phaseDef(phase: InvestigationPhase) {
    return PHASE_BY_KEY.get(phase)!;
  },

  createInitialState(): StoryRuntimeState {
    return {
      currentChapterId: null,
      currentObjectiveId: null,
      phase: "ARRIVAL",
      progress: 0,
      discoveredEvidenceIds: [],
      readEvidenceIds: [],
      solvedQuestionIds: [],
      activeQuestionIds: [],
      events: [],
      accusationSubmitted: false,
    };
  },

  /**
   * Pure derivation — given the current investigation inputs, compute
   * the story runtime state. Safe to call every render.
   */
  derive(inputs: StoryRuntimeInputs): StoryRuntimeState {
    const chapters = inputs.chapters ?? defaultChapters();
    const objectives = inputs.objectives ?? defaultObjectives();
    const phase = derivePhase(inputs);

    const intelState: IntelligenceState = {
      discoveredIds: inputs.discoveredIds,
      readIds: inputs.readIds,
    };
    const visibleQuestions = IntelligenceEngine.visibleQuestions(
      inputs.case,
      intelState,
    );
    const active = visibleQuestions.filter((q) => q.status === "active");
    const solved = visibleQuestions.filter((q) => q.status === "solved");

    const chapter = chapters.find((c) => c.targetPhase === phase) ?? chapters[0] ?? null;
    const objective =
      objectives.find((o) => o.phase === phase) ?? objectives[0] ?? null;

    return {
      currentChapterId: chapter?.id ?? null,
      currentObjectiveId: objective?.id ?? null,
      phase,
      progress: computeProgress(inputs, phase),
      discoveredEvidenceIds: Array.from(inputs.discoveredIds),
      readEvidenceIds: Array.from(inputs.readIds),
      solvedQuestionIds: solved.map((s) => s.question.id),
      activeQuestionIds: active.map((s) => s.question.id),
      events: inputs.events ?? [],
      accusationSubmitted: !!inputs.accusationSubmitted,
    };
  },

  /** Append an event immutably. Reserved for future persistence. */
  recordEvent(state: StoryRuntimeState, event: StoryEvent): StoryRuntimeState {
    return { ...state, events: [...state.events, event] };
  },

  defaultChapters,
  defaultObjectives,
};

export type { StoryRuntimeState };
