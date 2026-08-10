import type { ProgressState } from "@/types/progress";

/**
 * Case availability gating.
 *
 * Player-facing only: this module never imports spoiler layers. It answers
 * "may this player open this case yet?" from the persisted progress state.
 */

/** caseId → caseId that must be solved first. */
export const CASE_PREREQUISITES: Record<string, string> = {
  "inheritance-party": "midnight-office",
};

/** Display titles used in prerequisite copy (no spoilers). */
const CASE_TITLES: Record<string, string> = {
  "midnight-office": "CASE 001 자정의 사무실",
  "inheritance-party": "CASE 002 상속 파티의 비밀",
};

export function isCaseSolved(progress: ProgressState, caseId: string): boolean {
  return (
    !!progress.caseResults[caseId]?.solved ||
    progress.profile.solvedCaseIds.includes(caseId)
  );
}

export interface CaseAccess {
  unlocked: boolean;
  /** Korean, spoiler-free explanation shown on locked cards / guards. */
  reason: string | null;
}

export function caseAccess(progress: ProgressState, caseId: string): CaseAccess {
  const prereq = CASE_PREREQUISITES[caseId];
  if (!prereq) return { unlocked: true, reason: null };
  if (isCaseSolved(progress, prereq)) return { unlocked: true, reason: null };
  const title = CASE_TITLES[prereq] ?? prereq;
  return {
    unlocked: false,
    reason: `${title} 사건을 해결한 뒤 열람할 수 있습니다.`,
  };
}

/** Display file codes used by the intro cinematic and case chrome. */
const CASE_CODES: Record<string, string> = {
  "midnight-office": "CASE001",
  "inheritance-party": "CASE002",
};

export function caseCode(caseId: string): string {
  return CASE_CODES[caseId] ?? "CASE";
}
