import type {
  CaseDefinition,
  CaseRuntimeState,
  GameStatus,
  NotebookAutoEntry,
  RuntimeAction,
  RuntimeCompletionCondition,
  RuntimeHotspot,
  RuntimeQuestion,
  RuntimeUnlockCondition,
  Scene,
} from "@/types/runtime";

/**
 * CaseRuntime — pure, framework-agnostic state machine for a detective
 * case. UI dispatches actions; the runtime computes the next state,
 * including derived fields (active questions, unlocked hotspots, progress,
 * current objective, next scene, notebook auto-entries).
 *
 * The runtime never talks to the network, storage, or AI. It is safe to
 * unit-test and to run in SSR.
 */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function conditionMet(
  cond: RuntimeUnlockCondition | undefined,
  s: CaseRuntimeState,
): boolean {
  if (!cond) return true;
  const has = (list: string[] | undefined, pool: string[]) =>
    !list?.length || list.every((id) => pool.includes(id));
  return (
    has(cond.requiresEvidenceIds, s.discoveredEvidence) &&
    has(cond.requiresQuestionIds, s.solvedQuestions) &&
    has(cond.requiresSceneIds, s.completedScenes) &&
    has(cond.requiresInterviewedSuspectIds, s.interviewedSuspects)
  );
}

function completionMet(
  scene: Scene,
  s: CaseRuntimeState,
): boolean {
  const cond: RuntimeCompletionCondition | undefined = scene.completionCondition;
  if (!cond) {
    // Default: all reward evidence collected.
    return scene.evidenceRewardIds.every((id) =>
      s.discoveredEvidence.includes(id),
    );
  }
  const has = (list: string[] | undefined, pool: string[]) =>
    !list?.length || list.every((id) => pool.includes(id));
  const minOk =
    cond.minEvidenceRewards == null ||
    scene.evidenceRewardIds.filter((id) => s.discoveredEvidence.includes(id))
      .length >= cond.minEvidenceRewards;
  return (
    minOk &&
    has(cond.requiresEvidenceIds, s.discoveredEvidence) &&
    has(cond.requiresInterviewedSuspectIds, s.interviewedSuspects) &&
    has(cond.requiresHotspotIds, s.unlockedHotspots) &&
    has(cond.requiresSolvedQuestionIds, s.solvedQuestions)
  );
}

function recomputeQuestions(
  def: CaseDefinition,
  s: CaseRuntimeState,
): { active: string[]; solved: string[]; newlyActive: string[]; newlySolved: string[] } {
  const active = new Set(s.activeQuestions);
  const solved = new Set(s.solvedQuestions);
  const newlyActive: string[] = [];
  const newlySolved: string[] = [];

  for (const q of def.questions) {
    if (solved.has(q.id)) continue;
    const unlockList = q.unlockedByEvidenceIds ?? [];
    const shouldActivate =
      unlockList.length === 0 ||
      unlockList.some((id) => s.discoveredEvidence.includes(id));
    if (shouldActivate && !active.has(q.id)) {
      active.add(q.id);
      newlyActive.push(q.id);
    }
    const solveList = q.solvedByEvidenceIds ?? [];
    if (
      solveList.length > 0 &&
      solveList.every((id) => s.discoveredEvidence.includes(id))
    ) {
      active.delete(q.id);
      solved.add(q.id);
      newlySolved.push(q.id);
    }
  }
  return {
    active: [...active],
    solved: [...solved],
    newlyActive,
    newlySolved,
  };
}

function recomputeHotspots(
  def: CaseDefinition,
  scene: Scene | undefined,
  s: CaseRuntimeState,
): string[] {
  const unlocked = new Set(s.unlockedHotspots);
  const candidates = scene?.availableHotspotIds ?? [];
  for (const id of candidates) {
    const h = def.hotspots.find((x) => x.id === id);
    if (!h) continue;
    if (conditionMet(h.unlockCondition, s)) unlocked.add(id);
  }
  return [...unlocked];
}

function progressOf(def: CaseDefinition, s: CaseRuntimeState): number {
  const totals =
    def.evidence.length +
    def.questions.length +
    def.scenes.length +
    def.suspectIds.length;
  if (totals === 0) return 0;
  const done =
    s.discoveredEvidence.length +
    s.solvedQuestions.length +
    s.completedScenes.length +
    s.interviewedSuspects.length;
  return clamp01(done / totals);
}

function statusForScene(scene: Scene | undefined, fallback: GameStatus): GameStatus {
  return scene?.status ?? fallback;
}

function sectionForKind(kind: NotebookAutoEntry["kind"]): NotebookAutoEntry["section"] {
  switch (kind) {
    case "EVIDENCE_DISCOVERED":
      return "evidence";
    case "QUESTION_UNLOCKED":
    case "QUESTION_SOLVED":
      return "questions";
    case "SCENE_COMPLETED":
      return "timeline";
  }
}

function pushNote(
  queue: NotebookAutoEntry[],
  kind: NotebookAutoEntry["kind"],
  text: string,
): NotebookAutoEntry[] {
  const entry: NotebookAutoEntry = {
    id: `${kind}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`,
    kind,
    section: sectionForKind(kind),
    text,
    at: Date.now(),
  };
  return [...queue, entry];
}

export function createRuntimeState(def: CaseDefinition): CaseRuntimeState {
  const startScene = def.scenes.find((s) => s.id === def.startSceneId) ?? def.scenes[0];
  const base: CaseRuntimeState = {
    caseId: def.id,
    currentScene: startScene?.id ?? null,
    currentObjective: startScene?.objective ?? null,
    investigationProgress: 0,
    discoveredEvidence: [],
    activeQuestions: [],
    solvedQuestions: [],
    unlockedHotspots: [],
    interviewedSuspects: [],
    completedScenes: [],
    gameStatus: startScene?.status ?? "INTRO",
    notebookQueue: [],
  };
  const questions = recomputeQuestions(def, base);
  const unlockedHotspots = recomputeHotspots(def, startScene, base);
  return {
    ...base,
    activeQuestions: questions.active,
    solvedQuestions: questions.solved,
    unlockedHotspots,
    investigationProgress: progressOf(def, base),
  };
}

function applyDerived(
  def: CaseDefinition,
  s: CaseRuntimeState,
): CaseRuntimeState {
  const scene = def.scenes.find((x) => x.id === s.currentScene);
  const q = recomputeQuestions(def, s);
  let notebookQueue = s.notebookQueue;
  for (const id of q.newlyActive) {
    const meta = def.questions.find((x) => x.id === id);
    if (meta) notebookQueue = pushNote(notebookQueue, "QUESTION_UNLOCKED", `❓ ${meta.title}`);
  }
  for (const id of q.newlySolved) {
    const meta = def.questions.find((x) => x.id === id);
    if (meta) notebookQueue = pushNote(notebookQueue, "QUESTION_SOLVED", `✓ ${meta.title}`);
  }
  const unlockedHotspots = recomputeHotspots(def, scene, s);
  let next: CaseRuntimeState = {
    ...s,
    activeQuestions: q.active,
    solvedQuestions: q.solved,
    unlockedHotspots,
    notebookQueue,
  };

  // Auto-complete scene when its conditions are met.
  if (scene && !next.completedScenes.includes(scene.id) && completionMet(scene, next)) {
    next = {
      ...next,
      completedScenes: [...next.completedScenes, scene.id],
      notebookQueue: pushNote(
        next.notebookQueue,
        "SCENE_COMPLETED",
        `📍 ${scene.title} — 목표 완료`,
      ),
    };
    const nextScene = scene.nextSceneId
      ? def.scenes.find((x) => x.id === scene.nextSceneId)
      : undefined;
    if (nextScene && conditionMet(nextScene.unlockCondition, next)) {
      next = {
        ...next,
        currentScene: nextScene.id,
        currentObjective: nextScene.objective,
        gameStatus: statusForScene(nextScene, next.gameStatus),
      };
    } else if (!scene.nextSceneId) {
      next = { ...next, gameStatus: "ACCUSATION" };
    }
  }

  next = { ...next, investigationProgress: progressOf(def, next) };
  return next;
}

export function reduceRuntime(
  def: CaseDefinition,
  state: CaseRuntimeState,
  action: RuntimeAction,
): CaseRuntimeState {
  switch (action.type) {
    case "RESET":
      return createRuntimeState(def);

    case "SET_STATUS":
      return { ...state, gameStatus: action.status };

    case "INVESTIGATE_HOTSPOT": {
      const hotspot: RuntimeHotspot | undefined = def.hotspots.find(
        (h) => h.id === action.hotspotId,
      );
      if (!hotspot) return state;
      if (!state.unlockedHotspots.includes(hotspot.id)) return state;
      let next = state;
      for (const evId of hotspot.revealsEvidenceIds) {
        if (!next.discoveredEvidence.includes(evId)) {
          const ev = def.evidence.find((e) => e.id === evId);
          next = {
            ...next,
            discoveredEvidence: [...next.discoveredEvidence, evId],
            notebookQueue: pushNote(
              next.notebookQueue,
              "EVIDENCE_DISCOVERED",
              ev ? `🔎 ${ev.title}` : `🔎 ${evId}`,
            ),
          };
        }
      }
      return applyDerived(def, next);
    }

    case "DISCOVER_EVIDENCE": {
      if (state.discoveredEvidence.includes(action.evidenceId)) return state;
      const ev = def.evidence.find((e) => e.id === action.evidenceId);
      if (!ev) return state;
      const next: CaseRuntimeState = {
        ...state,
        discoveredEvidence: [...state.discoveredEvidence, ev.id],
        notebookQueue: pushNote(
          state.notebookQueue,
          "EVIDENCE_DISCOVERED",
          `🔎 ${ev.title}`,
        ),
      };
      return applyDerived(def, next);
    }

    case "READ_EVIDENCE": {
      // Reading is derived; we still route through applyDerived so questions
      // whose solved-by list overlaps discovered evidence can flip.
      if (!state.discoveredEvidence.includes(action.evidenceId)) return state;
      return applyDerived(def, state);
    }

    case "INTERVIEW_SUSPECT": {
      if (state.interviewedSuspects.includes(action.suspectId)) return state;
      const next: CaseRuntimeState = {
        ...state,
        interviewedSuspects: [...state.interviewedSuspects, action.suspectId],
        gameStatus:
          state.gameStatus === "INVESTIGATION" ? "INTERROGATION" : state.gameStatus,
      };
      return applyDerived(def, next);
    }

    case "SOLVE_QUESTION": {
      if (state.solvedQuestions.includes(action.questionId)) return state;
      const q: RuntimeQuestion | undefined = def.questions.find(
        (x) => x.id === action.questionId,
      );
      if (!q) return state;
      const next: CaseRuntimeState = {
        ...state,
        activeQuestions: state.activeQuestions.filter((id) => id !== q.id),
        solvedQuestions: [...state.solvedQuestions, q.id],
        notebookQueue: pushNote(
          state.notebookQueue,
          "QUESTION_SOLVED",
          `✓ ${q.title}`,
        ),
      };
      return applyDerived(def, next);
    }

    case "ADVANCE_SCENE": {
      const scene = def.scenes.find((x) => x.id === state.currentScene);
      const target = scene?.nextSceneId
        ? def.scenes.find((x) => x.id === scene.nextSceneId)
        : undefined;
      if (!target || !conditionMet(target.unlockCondition, state)) return state;
      const next: CaseRuntimeState = {
        ...state,
        currentScene: target.id,
        currentObjective: target.objective,
        gameStatus: statusForScene(target, state.gameStatus),
      };
      return applyDerived(def, next);
    }

    case "SUBMIT_ACCUSATION": {
      return {
        ...state,
        gameStatus: action.correct ? "RECONSTRUCTION" : "COMPLETE",
      };
    }

    default:
      return state;
  }
}

export const CaseRuntime = {
  create: createRuntimeState,
  reduce: reduceRuntime,
  currentScene(def: CaseDefinition, s: CaseRuntimeState): Scene | null {
    return def.scenes.find((x) => x.id === s.currentScene) ?? null;
  },
  availableHotspots(def: CaseDefinition, s: CaseRuntimeState): RuntimeHotspot[] {
    const scene = def.scenes.find((x) => x.id === s.currentScene);
    const ids = scene?.availableHotspotIds ?? [];
    return ids
      .map((id) => def.hotspots.find((h) => h.id === id))
      .filter((h): h is RuntimeHotspot => !!h)
      .map((h) => ({
        ...h,
        status: s.completedScenes.includes(h.id)
          ? "COMPLETED"
          : s.unlockedHotspots.includes(h.id)
            ? "AVAILABLE"
            : "LOCKED",
      }));
  },
  drainNotebook(s: CaseRuntimeState): [NotebookAutoEntry[], CaseRuntimeState] {
    return [s.notebookQueue, { ...s, notebookQueue: [] }];
  },
};
