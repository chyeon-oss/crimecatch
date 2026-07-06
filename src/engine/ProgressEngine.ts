import type { Case } from "@/types";
import type {
  DetectiveProfile,
  DetectiveRank,
  ProgressState,
} from "@/types/progress";
import { RANKS } from "@/data/ranks";

export const XP_REWARDS = {
  EVIDENCE_READ: 5,
  CONTRADICTION_FOUND: 20,
  CORRECT_ACCUSATION: 100,
  PERFECT_BONUS: 75,
} as const;

export const REPUTATION = {
  START: 50,
  MIN: 0,
  MAX: 100,
  CORRECT_DELTA: +10,
  WRONG_DELTA: -20,
  PERFECT_DELTA: +5,
} as const;

/** Level curve: level = floor(sqrt(xp / 50)) + 1. Cheap and monotonic. */
export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

export function xpForLevel(level: number): number {
  return 50 * Math.pow(Math.max(1, level) - 1, 2);
}

export function rankForLevel(level: number): DetectiveRank {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) current = r;
    else break;
  }
  return current.rank;
}

export function titleForLevel(level: number): string {
  const rank = rankForLevel(level);
  return RANKS.find((r) => r.rank === rank)?.koreanTitle ?? "형사";
}

export function successRate(profile: DetectiveProfile): number {
  const total = profile.solvedCaseIds.length + profile.wrongAccusations;
  if (total === 0) return 0;
  return Math.round((profile.solvedCaseIds.length / total) * 100);
}

export function xpProgress(profile: DetectiveProfile): {
  current: number;
  nextLevel: number;
  nextLevelXp: number;
  currentLevelXp: number;
  ratio: number;
} {
  const currentLevelXp = xpForLevel(profile.level);
  const nextLevelXp = xpForLevel(profile.level + 1);
  const span = nextLevelXp - currentLevelXp || 1;
  const ratio = Math.min(1, Math.max(0, (profile.xp - currentLevelXp) / span));
  return {
    current: profile.xp,
    nextLevel: profile.level + 1,
    nextLevelXp,
    currentLevelXp,
    ratio,
  };
}

/** Case unlock predicate. Extend Case.unlockRules with optional fields. */
export function canUnlockCase(
  profile: DetectiveProfile,
  c: Case,
): { unlocked: boolean; reason?: string } {
  const rules = c.unlockRules as typeof c.unlockRules & {
    minReputation?: number;
    minLevel?: number;
    requiresSolvedCaseIds?: string[];
  };
  if (rules.minLevel && profile.level < rules.minLevel) {
    return { unlocked: false, reason: `Lv.${rules.minLevel} 이상 필요` };
  }
  if (rules.minReputation && profile.reputation < rules.minReputation) {
    return { unlocked: false, reason: `평판 ${rules.minReputation} 이상 필요` };
  }
  if (rules.requiresSolvedCaseIds?.some((id) => !profile.solvedCaseIds.includes(id))) {
    return { unlocked: false, reason: "이전 사건을 먼저 해결하세요" };
  }
  return { unlocked: true };
}

/* -------------------------------------------------------------------------- */
/*  Pure state transitions — the store applies these, no side effects here.   */
/* -------------------------------------------------------------------------- */

function applyXp(state: ProgressState, delta: number): ProgressState {
  const xp = Math.max(0, state.profile.xp + delta);
  const level = levelForXp(xp);
  return {
    ...state,
    profile: {
      ...state.profile,
      xp,
      level,
      rank: rankForLevel(level),
      title: titleForLevel(level),
    },
  };
}

function applyReputation(state: ProgressState, delta: number): ProgressState {
  const reputation = Math.max(
    REPUTATION.MIN,
    Math.min(REPUTATION.MAX, state.profile.reputation + delta),
  );
  return { ...state, profile: { ...state.profile, reputation } };
}

export const ProgressEngine = {
  createInitial(name = "익명 탐정"): ProgressState {
    const level = 1;
    return {
      profile: {
        name,
        xp: 0,
        level,
        rank: rankForLevel(level),
        title: titleForLevel(level),
        reputation: REPUTATION.START,
        solvedCaseIds: [],
        wrongAccusations: 0,
        achievementsUnlocked: [],
      },
      activeCaseId: null,
      history: [],
      perCaseEvidenceRead: {},
      contradictionCount: 0,
      version: 1,
    };
  },

  setActiveCase(state: ProgressState, caseId: string | null): ProgressState {
    return { ...state, activeCaseId: caseId };
  },

  recordEvidenceRead(
    state: ProgressState,
    caseId: string,
    evidenceId: string,
  ): ProgressState {
    const readForCase = state.perCaseEvidenceRead[caseId] ?? [];
    if (readForCase.includes(evidenceId)) return state;
    const next = applyXp(state, XP_REWARDS.EVIDENCE_READ);
    return {
      ...next,
      perCaseEvidenceRead: {
        ...next.perCaseEvidenceRead,
        [caseId]: [...readForCase, evidenceId],
      },
    };
  },

  recordContradictionFound(state: ProgressState): ProgressState {
    const s = applyXp(state, XP_REWARDS.CONTRADICTION_FOUND);
    return { ...s, contradictionCount: s.contradictionCount + 1 };
  },

  recordAccusation(
    state: ProgressState,
    caseId: string,
    correct: boolean,
    perfect = false,
  ): ProgressState {
    let s = state;
    if (correct) {
      s = applyXp(s, XP_REWARDS.CORRECT_ACCUSATION + (perfect ? XP_REWARDS.PERFECT_BONUS : 0));
      s = applyReputation(
        s,
        REPUTATION.CORRECT_DELTA + (perfect ? REPUTATION.PERFECT_DELTA : 0),
      );
      s = {
        ...s,
        profile: {
          ...s.profile,
          solvedCaseIds: Array.from(new Set([...s.profile.solvedCaseIds, caseId])),
        },
        activeCaseId: s.activeCaseId === caseId ? null : s.activeCaseId,
      };
    } else {
      s = applyReputation(s, REPUTATION.WRONG_DELTA);
      s = {
        ...s,
        profile: { ...s.profile, wrongAccusations: s.profile.wrongAccusations + 1 },
      };
    }
    return {
      ...s,
      history: [
        { caseId, solved: correct, perfect: correct && perfect, at: Date.now() },
        ...s.history,
      ].slice(0, 50),
    };
  },

  unlockAchievement(state: ProgressState, id: string): ProgressState {
    if (state.profile.achievementsUnlocked.includes(id)) return state;
    return {
      ...state,
      profile: {
        ...state.profile,
        achievementsUnlocked: [...state.profile.achievementsUnlocked, id],
      },
    };
  },

  successRate,
  xpProgress,
  canUnlockCase,
};
