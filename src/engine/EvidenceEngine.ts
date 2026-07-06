import type { Case, Evidence } from "@/types";

export interface InvestigationState {
  readEvidenceIds: Set<string>;
  interrogatedSuspectIds: Set<string>;
  flags: Set<string>;
}

export function createInvestigationState(): InvestigationState {
  return {
    readEvidenceIds: new Set(),
    interrogatedSuspectIds: new Set(),
    flags: new Set(),
  };
}

/**
 * EvidenceEngine — resolves progressive unlock rules.
 * The UI asks the engine whether a piece of evidence is currently
 * available; the engine never mutates React state directly.
 */
export const EvidenceEngine = {
  isUnlocked(evidence: Evidence, state: InvestigationState): boolean {
    const cond = evidence.unlockCondition;
    if (!cond) return true;
    if (cond.requiresEvidenceIds?.some((id) => !state.readEvidenceIds.has(id))) {
      return false;
    }
    if (
      cond.requiresSuspectIds?.some(
        (id) => !state.interrogatedSuspectIds.has(id),
      )
    ) {
      return false;
    }
    if (cond.requiresFlag && !state.flags.has(cond.requiresFlag)) {
      return false;
    }
    return true;
  },

  sorted(c: Case): Evidence[] {
    return [...c.evidence].sort((a, b) => a.unlockOrder - b.unlockOrder);
  },

  /** Human readable reason the evidence is locked, for UI hints. */
  lockReason(evidence: Evidence, c: Case, state: InvestigationState): string | null {
    if (this.isUnlocked(evidence, state)) return null;
    const cond = evidence.unlockCondition;
    if (!cond) return null;
    const missing = (cond.requiresEvidenceIds ?? []).filter(
      (id) => !state.readEvidenceIds.has(id),
    );
    if (missing.length) {
      const titles = missing
        .map((id) => c.evidence.find((e) => e.id === id)?.title ?? id)
        .join(", ");
      return `${titles} 을(를) 먼저 확인해야 합니다.`;
    }
    return "아직 열람할 수 없습니다.";
  },
};
