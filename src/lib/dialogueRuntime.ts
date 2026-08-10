import type {
  CaseDialoguePack,
  DialogueChoice,
  DialogueNode,
  DialogueRequirement,
  DialogueSession,
  DialogueThread,
  TranscriptEntry,
} from "@/types/dialogue";

/**
 * Pure dialogue runtime helpers + session persistence.
 * No React, no case-specific knowledge.
 */

export function emptySession(): DialogueSession {
  return {
    version: 1,
    entries: [],
    threadId: null,
    nodeId: null,
    revealed: 0,
    flags: [],
    completedThreadIds: [],
  };
}

export function findThread(
  pack: CaseDialoguePack | null,
  threadId: string | null,
): DialogueThread | null {
  if (!threadId || !pack) return null;
  return pack.threads.find((t) => t.id === threadId) ?? null;
}

export function findNode(
  thread: DialogueThread | null,
  nodeId: string | null,
): DialogueNode | null {
  if (!thread || !nodeId) return null;
  return thread.nodes.find((n) => n.id === nodeId) ?? null;
}

export interface RequirementContext {
  discoveredEvidenceIds: Set<string>;
  investigatedHotspotIds: Set<string>;
  flags: Set<string>;
}

export function meetsRequirement(
  req: DialogueRequirement | undefined,
  ctx: RequirementContext,
): boolean {
  if (!req) return true;
  if (req.requiresEvidenceIds?.some((id) => !ctx.discoveredEvidenceIds.has(id))) return false;
  if (req.requiresInvestigatedHotspotIds?.some((id) => !ctx.investigatedHotspotIds.has(id)))
    return false;
  if (req.requiresFlags?.some((f) => !ctx.flags.has(f))) return false;
  if (req.forbidsFlags?.some((f) => ctx.flags.has(f))) return false;
  return true;
}

export function isChoiceAvailable(choice: DialogueChoice, ctx: RequirementContext): boolean {
  return meetsRequirement(choice.requirement, ctx);
}

/** Typing delay for a line, proportional to its length. */
export function lineDelay(text: string, explicit?: number): number {
  if (typeof explicit === "number") return explicit;
  return Math.min(1100, 320 + text.length * 16);
}

let seq = 0;
export function makeEntry(entry: Omit<TranscriptEntry, "id" | "at">): TranscriptEntry {
  seq += 1;
  return { ...entry, id: `t${Date.now().toString(36)}-${seq}`, at: Date.now() };
}

const KEY = (caseId: string) => `dialogue:${caseId}`;

export function loadSession(caseId: string): DialogueSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY(caseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DialogueSession;
    if (parsed?.version !== 1 || !Array.isArray(parsed.entries)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(caseId: string, session: DialogueSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY(caseId), JSON.stringify(session));
  } catch {
    /* storage unavailable — dialogue stays in-memory */
  }
}
