import type { Case, Evidence, Suspect, TimelineEvent } from "@/types";
import {
  EvidenceEngine,
  createInvestigationState,
  type InvestigationState,
} from "./EvidenceEngine";

export interface InvestigationView {
  case: Case;
  evidence: Array<Evidence & { unlocked: boolean; lockReason: string | null }>;
  suspects: Suspect[];
  timeline: TimelineEvent[];
  canAccuse: boolean;
}

/**
 * InvestigationEngine — assembles the dashboard view for a case,
 * combining static case data with the player's runtime state.
 */
export const InvestigationEngine = {
  createState: createInvestigationState,

  view(c: Case, state: InvestigationState = createInvestigationState()): InvestigationView {
    const evidence = EvidenceEngine.sorted(c).map((e) => ({
      ...e,
      unlocked: EvidenceEngine.isUnlocked(e, state),
      lockReason: EvidenceEngine.lockReason(e, c, state),
    }));

    const rules = c.unlockRules;
    const canAccuse =
      state.readEvidenceIds.size >= (rules.minEvidenceReadBeforeAccusation ?? 0) &&
      state.interrogatedSuspectIds.size >=
        (rules.minSuspectsInterrogatedBeforeAccusation ?? 0);

    return {
      case: c,
      evidence,
      suspects: c.suspects,
      timeline: c.timeline,
      canAccuse,
    };
  },
};

export type { InvestigationState };
