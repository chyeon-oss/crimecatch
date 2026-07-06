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
  version: number;
}
