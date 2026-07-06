import type { Case } from "@/types";
import type { ProgressState } from "@/types/progress";
import { META_ACHIEVEMENTS } from "@/data/achievements";
import { ProgressEngine } from "./ProgressEngine";

/**
 * AchievementEngine — evaluates career achievements after each event.
 * Pure: takes a state + context, returns a new state with newly unlocked
 * achievements added. Never mutates.
 */
export const AchievementEngine = {
  all: META_ACHIEVEMENTS,

  /** Run after any state-changing event. Context describes what just happened. */
  evaluate(
    state: ProgressState,
    ctx: {
      lastCase?: Case;
      lastAccusationCorrect?: boolean;
      readAllEvidenceInLastCase?: boolean;
      wrongInterrogationCount?: number;
    } = {},
  ): ProgressState {
    let s = state;
    for (const a of META_ACHIEVEMENTS) {
      if (s.profile.achievementsUnlocked.includes(a.id)) continue;

      const solved = s.profile.solvedCaseIds.length;
      let unlocked = false;

      switch (a.rule) {
        case "FIRST_ARREST":
          unlocked = solved >= 1;
          break;
        case "PERFECT_DEDUCTION":
          unlocked =
            ctx.lastAccusationCorrect === true &&
            s.profile.wrongAccusations === 0 &&
            ctx.readAllEvidenceInLastCase === true;
          break;
        case "OBSERVE_EVERYTHING":
          if (ctx.lastCase) {
            const read = s.perCaseEvidenceRead[ctx.lastCase.id] ?? [];
            unlocked = read.length >= ctx.lastCase.evidence.length;
          }
          break;
        case "NO_WRONG_QUESTIONS":
          unlocked = solved >= 1 && (ctx.wrongInterrogationCount ?? 0) === 0;
          break;
        case "COLD_CASE_MASTER":
          unlocked = solved >= (a.threshold ?? 5);
          break;
        case "SERIAL_KILLER_HUNTER":
          unlocked = solved >= (a.threshold ?? 10);
          break;
      }

      if (unlocked) s = ProgressEngine.unlockAchievement(s, a.id);
    }
    return s;
  },
};
