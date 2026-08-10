export type DetectiveRank =
  | "Rookie Detective"
  | "Junior Investigator"
  | "Senior Detective"
  | "Lead Investigator"
  | "Chief Detective"
  | "Legend Detective";

export interface RankDefinition {
  rank: DetectiveRank;
  koreanTitle: string;
  minLevel: number;
}

export interface MetaAchievement {
  id: string;
  title: string;
  description: string;
  /** Rule key evaluated by AchievementEngine. */
  rule:
    | "FIRST_ARREST"
    | "PERFECT_DEDUCTION"
    | "OBSERVE_EVERYTHING"
    | "NO_WRONG_QUESTIONS"
    | "COLD_CASE_MASTER"
    | "SERIAL_KILLER_HUNTER";
  /** Numeric threshold when relevant (e.g. cases solved). */
  threshold?: number;
}

export interface CaseHistoryEntry {
  caseId: string;
  solved: boolean;
  perfect: boolean;
  at: number;
  /** Deduction score for this submission, when available. */
  score?: number;
  /** Deduction rank for this submission, when available. */
  rank?: CaseResultRank;
}

export type CaseResultRank = "S" | "A" | "B" | "C";

/**
 * Durable per-case result record. Player-facing metrics only —
 * never store answer keys, truth content, or free-text reasoning here.
 */
export interface CaseResultRecord {
  caseId: string;
  attempts: number;
  bestScore: number;
  bestRank: CaseResultRank | null;
  lastScore: number;
  lastRank: CaseResultRank | null;
  solved: boolean;
  perfect: boolean;
  lastSubmittedAt: number;
  solvedAt?: number;
}

export interface DetectiveProfile {
  name: string;
  xp: number;
  level: number;
  rank: DetectiveRank;
  title: string;
  reputation: number;
  solvedCaseIds: string[];
  wrongAccusations: number;
  achievementsUnlocked: string[];
}

export interface ProgressState {
  profile: DetectiveProfile;
  activeCaseId: string | null;
  history: CaseHistoryEntry[];
  /** Per-case counters used by achievement rules. */
  perCaseEvidenceRead: Record<string, string[]>;
  contradictionCount: number;
  /** Durable per-case deduction results, keyed by case id. */
  caseResults: Record<string, CaseResultRecord>;
  version: number;
}

/** Result of committing one final deduction submission. */
export interface DeductionCommitOutcome {
  caseId: string;
  score: number;
  rank: CaseResultRank | null;
  attempts: number;
  bestScore: number;
  bestRank: CaseResultRank | null;
  newBest: boolean;
  correct: boolean;
  perfect: boolean;
  firstSolve: boolean;
  rewarded: boolean;
  newAchievements: string[];
}

