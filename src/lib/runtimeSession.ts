import { CaseRuntime } from "@/engine/CaseRuntime";
import type { CaseDefinition, CaseRuntimeState, RuntimeAction } from "@/types/runtime";

/**
 * Runtime session persistence.
 *
 * The Case Runtime reducer is intentionally left untouched: instead of
 * serialising derived state we persist the ordered log of player actions and
 * replay it through the very same reducer on reload. That keeps progression
 * deterministic and makes stored sessions forward-compatible with content
 * changes (unknown ids simply become no-ops inside the reducer).
 */

const REPLAYABLE: ReadonlySet<RuntimeAction["type"]> = new Set([
  "INVESTIGATE_HOTSPOT",
  "READ_EVIDENCE",
  "INTERVIEW_SUSPECT",
  "SOLVE_QUESTION",
  "ADVANCE_SCENE",
  "DISCOVER_EVIDENCE",
]);

export function isReplayable(action: RuntimeAction): boolean {
  return REPLAYABLE.has(action.type);
}

interface StoredLog {
  version: 1;
  caseId: string;
  actions: RuntimeAction[];
}

const key = (caseId: string) => `runtime-log:${caseId}`;

export function loadLog(caseId: string): RuntimeAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(caseId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredLog;
    if (parsed?.version !== 1 || parsed.caseId !== caseId) return [];
    if (!Array.isArray(parsed.actions)) return [];
    return parsed.actions.filter(
      (a): a is RuntimeAction => !!a && typeof a.type === "string" && isReplayable(a),
    );
  } catch {
    return [];
  }
}

export function saveLog(caseId: string, actions: RuntimeAction[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredLog = { version: 1, caseId, actions };
    window.localStorage.setItem(key(caseId), JSON.stringify(payload));
  } catch {
    /* storage unavailable — session stays in-memory */
  }
}

export function clearLog(caseId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(caseId));
  } catch {
    /* ignore */
  }
}

/** Deterministically rebuild runtime state from a persisted action log. */
export function replayLog(def: CaseDefinition, actions: RuntimeAction[]): CaseRuntimeState {
  return actions.reduce<CaseRuntimeState>(
    (state, action) => CaseRuntime.reduce(def, state, action),
    CaseRuntime.create(def),
  );
}

/** Restore the persisted runtime state for a case (empty state when none). */
export function restoreRuntimeState(def: CaseDefinition): CaseRuntimeState {
  return replayLog(def, loadLog(def.id));
}
