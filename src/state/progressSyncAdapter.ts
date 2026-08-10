import type { ProgressState } from "@/types/progress";
import { ProgressEngine } from "@/engine/ProgressEngine";

/**
 * SyncAdapter — abstract persistence. LocalStorageAdapter today,
 * SupabaseAdapter tomorrow. The store never talks to storage directly.
 */
export interface ProgressSyncAdapter {
  load(): ProgressState | null | Promise<ProgressState | null>;
  save(state: ProgressState): void | Promise<void>;
}

const KEY = "casenote.progress.v1";

export class LocalStorageAdapter implements ProgressSyncAdapter {
  load(): ProgressState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      // Any older schema (v1) is migrated forward; malformed data defaults safely.
      return ProgressEngine.migrate(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  save(state: ProgressState): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }
}

