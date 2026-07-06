import type { Case } from "@/types";
import type { InvestigationState } from "./EvidenceEngine";

export interface Accusation {
  culpritId: string;
  motive?: string;
  murderMethod?: string;
}

export interface AccusationResult {
  correct: boolean;
  correctCulpritId: string;
  motiveMatches: boolean;
  methodMatches: boolean;
  missingEvidence: string[];
  earnedAchievements: string[];
}

/**
 * AccusationEngine — validates the player's final accusation against the
 * case's Solution and computes derived achievements.
 */
export const AccusationEngine = {
  submit(
    c: Case,
    accusation: Accusation,
    state: InvestigationState,
  ): AccusationResult {
    const s = c.solution;
    const correct = accusation.culpritId === s.culpritId;
    const missingEvidence = s.requiredEvidence.filter(
      (id) => !state.readEvidenceIds.has(id),
    );
    const motiveMatches = accusation.motive
      ? accusation.motive.trim() === s.motive
      : false;
    const methodMatches = accusation.murderMethod
      ? accusation.murderMethod.trim() === s.murderMethod
      : false;

    const earned: string[] = [];
    for (const a of c.achievements) {
      switch (a.trigger) {
        case "READ_ALL_EVIDENCE":
          if (state.readEvidenceIds.size === c.evidence.length) earned.push(a.id);
          break;
        case "INTERROGATE_ALL_SUSPECTS":
          if (state.interrogatedSuspectIds.size === c.suspects.length)
            earned.push(a.id);
          break;
        case "CORRECT_ACCUSATION":
          if (correct) earned.push(a.id);
          break;
        case "WRONG_ACCUSATION":
          if (!correct) earned.push(a.id);
          break;
        case "PERFECT_DETECTIVE":
          if (
            correct &&
            state.readEvidenceIds.size === c.evidence.length &&
            state.interrogatedSuspectIds.size === c.suspects.length
          ) {
            earned.push(a.id);
          }
          break;
      }
    }

    return {
      correct,
      correctCulpritId: s.culpritId,
      motiveMatches,
      methodMatches,
      missingEvidence,
      earnedAchievements: earned,
    };
  },
};
