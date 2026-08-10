/**
 * Final-deduction draft persistence (per case).
 *
 * Only player selections and the current step are stored — never scoring
 * or answer-key data.
 */

export interface DeductionDraft {
  version: 1;
  step: number;
  suspectId: string | null;
  motiveId: string | null;
  methodId: string | null;
  evidenceId: string | null;
}

export function emptyDraft(): DeductionDraft {
  return {
    version: 1,
    step: 1,
    suspectId: null,
    motiveId: null,
    methodId: null,
    evidenceId: null,
  };
}

const key = (caseId: string) => `deduction-draft:${caseId}`;

export function loadDraft(caseId: string): DeductionDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(caseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeductionDraft;
    if (parsed?.version !== 1) return null;
    return { ...emptyDraft(), ...parsed };
  } catch {
    return null;
  }
}

export function saveDraft(caseId: string, draft: DeductionDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(caseId), JSON.stringify(draft));
  } catch {
    /* storage unavailable — draft stays in-memory */
  }
}

export function clearDraft(caseId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(caseId));
  } catch {
    /* ignore */
  }
}
