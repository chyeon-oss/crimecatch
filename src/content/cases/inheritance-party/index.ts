import type { Case, Suspect } from "@/types";
import { briefing } from "./briefing";
import { victim, victimContext } from "./victim";
import { suspects as publicSuspects } from "./suspects";
import { evidence } from "./evidence";
import { timeline } from "./timeline";
import { crimeScene, questions, achievements, unlockRules } from "./scene";
import { suspectSpoilers, hiddenFacts, solution } from "./_spoilers";
import { runtime } from "./runtime";

/**
 * Assemble the full CASE002 Case object.
 * Public content lives in the sibling files; spoiler fields (hiddenTruth,
 * isCulprit, hiddenFacts, solution) are merged from _spoilers.ts and must
 * NEVER be rendered directly to the player.
 */
const suspects: Suspect[] = publicSuspects.map((s) => ({
  ...s,
  ...suspectSpoilers[s.id],
}));

export const inheritanceParty: Case = {
  id: briefing.id,
  slug: briefing.slug,
  title: briefing.title,
  subtitle: briefing.subtitle,
  difficulty: briefing.difficulty,
  status: briefing.status,
  estimatedMinutes: briefing.estimatedMinutes,
  description: briefing.overview,
  incidentTime: briefing.incidentTime,
  incidentLocation: briefing.incidentLocation,
  victim,
  suspects,
  evidence,
  crimeScene,
  timeline,
  hiddenFacts,
  solution,
  unlockRules,
  achievements,
  questions,
};

/** Full player-facing content bundle for this case. */
export const inheritancePartyContent = {
  briefing,
  victim,
  victimContext,
  suspects: publicSuspects,
  evidence,
  timeline,
  runtime,
};

export { runtime };
export default inheritanceParty;
