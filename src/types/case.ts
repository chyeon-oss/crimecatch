import type { Evidence } from "./evidence";
import type { Suspect } from "./suspect";
import type { TimelineEvent } from "./timeline";
import type { HiddenFact } from "./fact";
import type { Solution } from "./solution";
import type { CrimeScene } from "./hotspot";
import type { InvestigationQuestion } from "./question";


export type CaseDifficulty = "쉬움" | "보통" | "어려움";
export type CaseStatus = "무료" | "신규" | "프리미엄";

export interface Victim {
  name: string;
  age: number;
  occupation: string;
  causeOfDeath: string;
  profileImage?: string;
}

export interface UnlockRules {
  /** Evidence rules are read from Evidence.unlockCondition; kept here for
   *  case-wide gating (e.g. minimum evidence read before accusation). */
  minEvidenceReadBeforeAccusation?: number;
  minSuspectsInterrogatedBeforeAccusation?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** Predicate name resolved at runtime by the engine. */
  trigger:
    | "READ_ALL_EVIDENCE"
    | "INTERROGATE_ALL_SUSPECTS"
    | "CORRECT_ACCUSATION"
    | "WRONG_ACCUSATION"
    | "PERFECT_DETECTIVE";
}

export interface Case {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  thumbnail?: string;
  difficulty: CaseDifficulty;
  status: CaseStatus;
  estimatedMinutes: number;
  description: string;
  incidentTime: string;
  incidentLocation: string;
  victim: Victim;
  suspects: Suspect[];
  evidence: Evidence[];
  crimeScene?: CrimeScene;
  timeline: TimelineEvent[];
  hiddenFacts: HiddenFact[];
  solution: Solution;
  unlockRules: UnlockRules;
  achievements: Achievement[];
  /** Investigation intelligence: questions surfaced during the case. */
  questions?: InvestigationQuestion[];
}

