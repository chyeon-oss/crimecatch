/**
 * Read-evidence persistence (per case).
 *
 * "Discovered" lives in the runtime action log; "read" is a player-side
 * reading record, so it is stored separately and restored on reload.
 * Only evidence ids are stored — never scoring or answer-key data.
 */

interface StoredReads {
  version: 1;
  ids: string[];
}

const key = (caseId: string) => `read-evidence:${caseId}`;

export function loadReadIds(caseId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(caseId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredReads;
    if (parsed?.version !== 1 || !Array.isArray(parsed.ids)) return [];
    return parsed.ids.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function saveReadIds(caseId: string, ids: Iterable<string>): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredReads = { version: 1, ids: Array.from(new Set(ids)) };
    window.localStorage.setItem(key(caseId), JSON.stringify(payload));
  } catch {
    /* storage unavailable — reads stay in-memory */
  }
}

export function clearReadIds(caseId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(caseId));
  } catch {
    /* ignore */
  }
}
