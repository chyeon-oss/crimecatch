import type { Case } from "@/types";
import type {
  CaseHistoryEntry,
  CaseResultRank,
  CaseResultRecord,
  DeductionCommitOutcome,
  DetectiveProfile,
  DetectiveRank,
  ProgressState,
} from "@/types/progress";
import { RANKS } from "@/data/ranks";

/** Current persisted progress schema version. */
export const PROGRESS_VERSION = 2;

const RANK_ORDER: Record<CaseResultRank, number> = { C: 0, B: 1, A: 2, S: 3 };


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

/* ------------------------- migration helpers ------------------------- */

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function isRank(v: unknown): v is CaseResultRank {
  return v === "S" || v === "A" || v === "B" || v === "C";
}

function betterRank(
  a: CaseResultRank | null,
  b: CaseResultRank | null,
): CaseResultRank | null {
  if (!a) return b;
  if (!b) return a;
  return RANK_ORDER[a] >= RANK_ORDER[b] ? a : b;
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
      caseResults: {},
      version: PROGRESS_VERSION,
    };
  },

  /**
   * Migrate any previously persisted shape (v1 localStorage payloads
   * included) to the current schema. Unknown/malformed fields default
   * safely; every known field is preserved as-is.
   */
  migrate(raw: unknown): ProgressState {
    const base = ProgressEngine.createInitial();
    if (!raw || typeof raw !== "object") return base;
    const r = raw as Partial<ProgressState> & Record<string, unknown>;
    const rp = (r.profile ?? {}) as Partial<DetectiveProfile>;

    const xp = num(rp.xp, base.profile.xp);
    const level = typeof rp.level === "number" && rp.level > 0 ? rp.level : levelForXp(xp);

    const profile: DetectiveProfile = {
      name: typeof rp.name === "string" && rp.name ? rp.name : base.profile.name,
      xp,
      level,
      rank: rankForLevel(level),
      title: titleForLevel(level),
      reputation: clamp(num(rp.reputation, REPUTATION.START), REPUTATION.MIN, REPUTATION.MAX),
      solvedCaseIds: strArray(rp.solvedCaseIds),
      wrongAccusations: Math.max(0, num(rp.wrongAccusations, 0)),
      achievementsUnlocked: strArray(rp.achievementsUnlocked),
    };

    const perCaseEvidenceRead: Record<string, string[]> = {};
    const rawRead = (r.perCaseEvidenceRead ?? {}) as Record<string, unknown>;
    for (const [k, v] of Object.entries(rawRead)) perCaseEvidenceRead[k] = strArray(v);

    const history: CaseHistoryEntry[] = (
      Array.isArray(r.history) ? (r.history as unknown[]) : []
    )
      .filter((h): h is Record<string, unknown> => !!h && typeof h === "object")
      .map((h) => ({
        caseId: String(h.caseId ?? ""),
        solved: !!h.solved,
        perfect: !!h.perfect,
        at: num(h.at, 0),
        ...(typeof h.score === "number" ? { score: h.score } : {}),
        ...(isRank(h.rank) ? { rank: h.rank } : {}),
      }))
      .filter((h) => h.caseId);


    const caseResults: Record<string, CaseResultRecord> = {};
    const rawResults = (r.caseResults ?? {}) as Record<string, unknown>;
    for (const [k, v] of Object.entries(rawResults)) {
      if (!v || typeof v !== "object") continue;
      const c = v as Record<string, unknown>;
      caseResults[k] = {
        caseId: typeof c.caseId === "string" && c.caseId ? c.caseId : k,
        attempts: Math.max(0, num(c.attempts, 0)),
        bestScore: clamp(num(c.bestScore, 0), 0, 100),
        bestRank: isRank(c.bestRank) ? c.bestRank : null,
        lastScore: clamp(num(c.lastScore, 0), 0, 100),
        lastRank: isRank(c.lastRank) ? c.lastRank : null,
        solved: !!c.solved,
        perfect: !!c.perfect,
        lastSubmittedAt: num(c.lastSubmittedAt, 0),
        ...(typeof c.solvedAt === "number" ? { solvedAt: c.solvedAt } : {}),
      };
    }

    // Back-fill records for cases solved before per-case results existed.
    for (const id of profile.solvedCaseIds) {
      if (caseResults[id]) {
        caseResults[id] = { ...caseResults[id], solved: true };
        continue;
      }
      const h = history.find((e) => e.caseId === id && e.solved);
      caseResults[id] = {
        caseId: id,
        attempts: 1,
        bestScore: num(h?.score, 0),
        bestRank: isRank(h?.rank) ? h.rank : null,
        lastScore: num(h?.score, 0),
        lastRank: isRank(h?.rank) ? h.rank : null,
        solved: true,
        perfect: !!h?.perfect,
        lastSubmittedAt: num(h?.at, 0),
        ...(h?.at ? { solvedAt: h.at } : {}),
      };
    }

    return {
      profile,
      activeCaseId: typeof r.activeCaseId === "string" ? r.activeCaseId : null,
      history: history.slice(0, 50),
      perCaseEvidenceRead,
      contradictionCount: Math.max(0, num(r.contradictionCount, 0)),
      caseResults,
      version: PROGRESS_VERSION,
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

  /**
   * Records one final accusation. Idempotent for already-solved cases:
   * a repeat correct accusation grants no XP/reputation, does not duplicate
   * solvedCaseIds, and adds no new history entry.
   */
  recordAccusation(
    state: ProgressState,
    caseId: string,
    correct: boolean,
    perfect = false,
    scoreMeta?: { score?: number; rank?: CaseResultRank | null },
  ): ProgressState {
    let s = state;
    const alreadySolved = s.profile.solvedCaseIds.includes(caseId);
    if (correct && alreadySolved) return s;

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
        {
          caseId,
          solved: correct,
          perfect: correct && perfect,
          at: Date.now(),
          ...(typeof scoreMeta?.score === "number" ? { score: scoreMeta.score } : {}),
          ...(isRank(scoreMeta?.rank) ? { rank: scoreMeta.rank } : {}),
        },
        ...s.history,
      ].slice(0, 50),
    };
  },

  /**
   * Commits one final deduction submission: updates the durable per-case
   * result record and, on a first correct solve only, applies accusation
   * rewards. Returns the next state plus a UI-facing outcome delta.
   */
  recordDeduction(
    state: ProgressState,
    input: {
      caseId: string;
      score: number;
      rank: CaseResultRank | null;
      correct: boolean;
      perfect: boolean;
    },
  ): { state: ProgressState; outcome: DeductionCommitOutcome } {
    const { caseId, correct } = input;
    const score = clamp(Math.round(num(input.score, 0)), 0, 100);
    const rank = isRank(input.rank) ? input.rank : null;
    const now = Date.now();

    const prev = state.caseResults[caseId];
    const alreadySolved = !!prev?.solved || state.profile.solvedCaseIds.includes(caseId);
    const firstSolve = correct && !alreadySolved;
    const perfect = input.perfect && correct;

    let next = state;
    if (firstSolve || !correct) {
      next = ProgressEngine.recordAccusation(next, caseId, correct, perfect, {
        score,
        rank,
      });
    }

    const bestScore = Math.max(prev?.bestScore ?? 0, score);
    const bestRank = betterRank(prev?.bestRank ?? null, rank);
    const newBest = score > (prev?.bestScore ?? -1);

    const record: CaseResultRecord = {
      caseId,
      attempts: (prev?.attempts ?? 0) + 1,
      bestScore,
      bestRank,
      lastScore: score,
      lastRank: rank,
      solved: alreadySolved || correct,
      perfect: (prev?.perfect ?? false) || perfect,
      lastSubmittedAt: now,
      ...(prev?.solvedAt
        ? { solvedAt: prev.solvedAt }
        : firstSolve
          ? { solvedAt: now }
          : {}),
    };

    next = { ...next, caseResults: { ...next.caseResults, [caseId]: record } };

    return {
      state: next,
      outcome: {
        caseId,
        score,
        rank,
        attempts: record.attempts,
        bestScore: record.bestScore,
        bestRank: record.bestRank,
        newBest,
        correct,
        perfect,
        firstSolve,
        rewarded: firstSolve,
        newAchievements: [],
      },
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
