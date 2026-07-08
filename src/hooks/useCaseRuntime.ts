import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { CaseRuntime } from "@/engine/CaseRuntime";
import type {
  CaseDefinition,
  CaseRuntimeState,
  RuntimeAction,
} from "@/types/runtime";
import type { NotebookSectionId } from "@/lib/notebook";

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
        dispatch({ type: "INVESTIGATE_HOTSPOT", hotspotId }),
      discoverEvidence: (evidenceId: string) =>
        dispatch({ type: "DISCOVER_EVIDENCE", evidenceId }),
      readEvidence: (evidenceId: string) =>
        dispatch({ type: "READ_EVIDENCE", evidenceId }),
      interviewSuspect: (suspectId: string) =>
        dispatch({ type: "INTERVIEW_SUSPECT", suspectId }),
      solveQuestion: (questionId: string) =>
        dispatch({ type: "SOLVE_QUESTION", questionId }),
      advanceScene: () => dispatch({ type: "ADVANCE_SCENE" }),
      submitAccusation: (correct: boolean) =>
        dispatch({ type: "SUBMIT_ACCUSATION", correct }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    [],
  );

  const dispatchAction = useCallback(
    (a: RuntimeAction) => dispatch(a),
    [],
  );

  return { state, currentScene, availableHotspots, actions, dispatch: dispatchAction };
}
