import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CaseRuntime } from "@/engine/CaseRuntime";
import type {
  CaseDefinition,
  CaseRuntimeState,
  RuntimeAction,
} from "@/types/runtime";
import type { NotebookSectionId } from "@/lib/notebook";
import { clearLog, isReplayable, loadLog, saveLog } from "@/lib/runtimeSession";

/**
 * React binding for the Case Runtime. Owns the reducer and, optionally,
 * drains auto-generated notebook entries into the notebook store so
 * evidence discoveries and question changes appear as handwritten notes
 * without any UI redesign.
 */
export function useCaseRuntime(def: CaseDefinition) {
  const [state, dispatch] = useReducer(
    (s: CaseRuntimeState, a: RuntimeAction) => CaseRuntime.reduce(def, s, a),
    def,
    CaseRuntime.create,
  );

  // ---------------------------------------------------------------------
  // Session restore: replay the persisted action log through the very same
  // reducer, so progression stays deterministic across reloads.
  // ---------------------------------------------------------------------
  const logRef = useRef<RuntimeAction[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    const stored = loadLog(def.id);
    logRef.current = stored;
    restoredRef.current = stored.length > 0;
    for (const action of stored) dispatch(action);
    setHydrated(true);
    // Re-hydrate only when the case changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.id]);

  const record = useCallback(
    (action: RuntimeAction) => {
      if (action.type === "RESET") {
        logRef.current = [];
        clearLog(def.id);
        return;
      }
      if (!isReplayable(action)) return;
      logRef.current = [...logRef.current, action];
      saveLog(def.id, logRef.current);
    },
    [def.id],
  );

  const commit = useCallback(
    (action: RuntimeAction) => {
      record(action);
      dispatch(action);
    },
    [record],
  );

  // Auto-forward notebook queue entries into localStorage-backed notebook.
  const drainedRef = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const queue = state.notebookQueue;
    if (queue.length <= drainedRef.current) return;
    const pending = queue.slice(drainedRef.current);
    drainedRef.current = queue.length;
    try {
      const key = `notebook:${def.id}`;
      const raw = window.localStorage.getItem(key);
      const nb: Record<NotebookSectionId, string> = raw
        ? JSON.parse(raw)
        : { suspects: "", timeline: "", evidence: "", questions: "", theories: "" };
      for (const entry of pending) {
        const prev = nb[entry.section] ?? "";
        const line = `- ${entry.text}`;
        if (prev.includes(entry.text)) continue;
        nb[entry.section] = prev ? `${prev}\n${line}` : line;
      }
      window.localStorage.setItem(key, JSON.stringify(nb));
      window.dispatchEvent(
        new CustomEvent("notebook:update", { detail: { caseId: def.id } }),
      );
    } catch {
      /* ignore */
    }
  }, [state.notebookQueue, def.id]);

  const currentScene = useMemo(
    () => CaseRuntime.currentScene(def, state),
    [def, state],
  );
  const availableHotspots = useMemo(
    () => CaseRuntime.availableHotspots(def, state),
    [def, state],
  );

  const actions = useMemo(
    () => ({
      investigateHotspot: (hotspotId: string) =>
        commit({ type: "INVESTIGATE_HOTSPOT", hotspotId }),
      discoverEvidence: (evidenceId: string) =>
        commit({ type: "DISCOVER_EVIDENCE", evidenceId }),
      readEvidence: (evidenceId: string) =>
        commit({ type: "READ_EVIDENCE", evidenceId }),
      interviewSuspect: (suspectId: string) =>
        commit({ type: "INTERVIEW_SUSPECT", suspectId }),
      solveQuestion: (questionId: string) =>
        commit({ type: "SOLVE_QUESTION", questionId }),
      advanceScene: () => commit({ type: "ADVANCE_SCENE" }),
      submitAccusation: (correct: boolean) =>
        dispatch({ type: "SUBMIT_ACCUSATION", correct }),
      reset: () => commit({ type: "RESET" }),
    }),
    [commit],
  );

  const dispatchAction = useCallback((a: RuntimeAction) => commit(a), [commit]);

  return {
    state,
    currentScene,
    availableHotspots,
    actions,
    dispatch: dispatchAction,
    hydrated,
    restored: restoredRef.current,
  };
}
