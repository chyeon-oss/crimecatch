import { useSyncExternalStore } from "react";
import type { Case } from "@/types";
import type {
  CaseResultRank,
  DeductionCommitOutcome,
  ProgressState,
} from "@/types/progress";
import { ProgressEngine } from "@/engine/ProgressEngine";
import { AchievementEngine } from "@/engine/AchievementEngine";
import {
  LocalStorageAdapter,
  type ProgressSyncAdapter,
} from "./progressSyncAdapter";

/**
 * Tiny observable store. React reads via useSyncExternalStore, so it
 * behaves like Zustand without the dependency. Persistence goes through
 * a swappable adapter — swap LocalStorageAdapter for a Supabase-backed
 * one later without touching UI code.
 */
class ProgressStore {
  private state: ProgressState;
  private listeners = new Set<() => void>();
  private adapter: ProgressSyncAdapter;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(adapter: ProgressSyncAdapter) {
    this.adapter = adapter;
    const loaded = adapter.load();
    this.state =
      loaded && !(loaded instanceof Promise)
        ? loaded
        : ProgressEngine.createInitial();
  }

  getState = (): ProgressState => this.state;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  setAdapter(adapter: ProgressSyncAdapter): void {
    this.adapter = adapter;
  }

  private commit(next: ProgressState): void {
    this.state = next;
    this.listeners.forEach((l) => l());
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.adapter.save(this.state), 150);
  }

  /* ---------- actions ---------- */

  setName(name: string): void {
    this.commit({ ...this.state, profile: { ...this.state.profile, name } });
  }

  setActiveCase(caseId: string | null): void {
    this.commit(ProgressEngine.setActiveCase(this.state, caseId));
  }

  recordEvidenceRead(caseId: string, evidenceId: string): void {
    let next = ProgressEngine.recordEvidenceRead(this.state, caseId, evidenceId);
    next = AchievementEngine.evaluate(next);
    this.commit(next);
  }

  recordContradiction(): void {
    let next = ProgressEngine.recordContradictionFound(this.state);
    next = AchievementEngine.evaluate(next);
    this.commit(next);
  }

  recordAccusation(c: Case, correct: boolean, perfect = false): void {
    let next = ProgressEngine.recordAccusation(this.state, c.id, correct, perfect);
    const read = next.perCaseEvidenceRead[c.id] ?? [];
    next = AchievementEngine.evaluate(next, {
      lastCase: c,
      lastAccusationCorrect: correct,
      readAllEvidenceInLastCase: read.length >= c.evidence.length,
    });
    this.commit(next);
  }

  /**
   * Commits one final deduction submission and returns the resulting delta
   * so the result screen can show what was saved. Idempotent for rewards:
   * only the first correct solve grants XP/reputation/achievements.
   */
  recordDeduction(
    c: Case,
    input: { score: number; rank: CaseResultRank | null; correct: boolean; perfect: boolean },
  ): DeductionCommitOutcome {
    const before = new Set(this.state.profile.achievementsUnlocked);
    const { state: committed, outcome } = ProgressEngine.recordDeduction(this.state, {
      caseId: c.id,
      score: input.score,
      rank: input.rank,
      correct: input.correct,
      perfect: input.perfect,
    });

    let next = committed;
    if (outcome.firstSolve) {
      const read = next.perCaseEvidenceRead[c.id] ?? [];
      next = AchievementEngine.evaluate(next, {
        lastCase: c,
        lastAccusationCorrect: true,
        readAllEvidenceInLastCase: read.length >= c.evidence.length,
      });
    }

    const newAchievements = next.profile.achievementsUnlocked.filter((id) => !before.has(id));
    this.commit(next);
    return { ...outcome, newAchievements };
  }

  reset(): void {
    this.commit(ProgressEngine.createInitial(this.state.profile.name));
  }
}


export const progressStore = new ProgressStore(new LocalStorageAdapter());

// Stable default used for SSR + first hydration render to avoid mismatches.
const SSR_SNAPSHOT: ProgressState = ProgressEngine.createInitial();
const getServerSnapshot = (): ProgressState => SSR_SNAPSHOT;

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getState,
    getServerSnapshot,
  );
}

export { ProgressStore };
