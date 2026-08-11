import type { DialogueRequirement } from "@/types/dialogue";
import type {
  CaseInterviewPack,
  InterviewSession,
  InterviewSuspectState,
  InterviewTopic,
  SuspectInterview,
} from "@/types/interview";
import { meetsRequirement, type RequirementContext } from "@/lib/dialogueRuntime";

/**
 * Pure helpers + persistence for the authored suspect-interview runtime.
 * No React, no case-specific knowledge.
 */

export function emptySuspectState(): InterviewSuspectState {
  return {
    entries: [],
    completedTopicIds: [],
    unlockedTopicIds: [],
    presentedEvidenceIds: [],
    mood: "calm",
    contradictions: [],
    notes: [],
    unread: false,
    awaitingTopicId: null,
  };
}

export function emptySession(): InterviewSession {
  return { version: 2, roomId: null, suspects: {} };
}

export function suspectStateOf(session: InterviewSession, suspectId: string): InterviewSuspectState {
  return session.suspects[suspectId] ?? emptySuspectState();
}

export function findInterview(
  pack: CaseInterviewPack | null,
  suspectId: string | null,
): SuspectInterview | null {
  if (!pack || !suspectId) return null;
  return pack.suspects.find((s) => s.suspectId === suspectId) ?? null;
}

export function speakerOf(pack: CaseInterviewPack | null, speakerId: string) {
  return pack?.speakers.find((s) => s.id === speakerId) ?? null;
}

export interface TopicAvailability {
  topic: InterviewTopic;
  available: boolean;
  done: boolean;
}

export function topicsFor(
  interview: SuspectInterview,
  state: InterviewSuspectState,
  ctx: RequirementContext,
): TopicAvailability[] {
  return interview.topics
    .filter((t) => t.kind !== "PRESSURE" || state.unlockedTopicIds.includes(t.id))
    .map((t) => ({
      topic: t,
      done: state.completedTopicIds.includes(t.id),
      available: requirementOk(t.requirement, ctx),
    }));
}

export function requirementOk(
  req: DialogueRequirement | undefined,
  ctx: RequirementContext,
): boolean {
  return meetsRequirement(req, ctx);
}

/** Base-interview completion: every required topic answered. */
export function isInterviewComplete(
  interview: SuspectInterview,
  state: InterviewSuspectState,
): boolean {
  return interview.requiredTopicIds.every((id) => state.completedTopicIds.includes(id));
}

/**
 * Required-topic progress — the single source of truth behind the completion
 * gate, the room header, and the hub list.
 */
export function requiredProgress(
  interview: SuspectInterview,
  state: InterviewSuspectState,
): { done: number; total: number } {
  return {
    done: interview.requiredTopicIds.filter((id) => state.completedTopicIds.includes(id)).length,
    total: interview.requiredTopicIds.length,
  };
}

export function interviewProgress(
  interview: SuspectInterview,
  state: InterviewSuspectState,
): { done: number; total: number } {
  const base = interview.topics.filter((t) => t.kind !== "PRESSURE");
  return {
    done: base.filter((t) => state.completedTopicIds.includes(t.id)).length,
    total: base.length,
  };
}

export function reactionFor(interview: SuspectInterview, evidenceId: string) {
  return interview.evidenceReactions.find((r) => r.evidenceIds.includes(evidenceId)) ?? null;
}

export const MOOD_LABEL: Record<InterviewSuspectState["mood"], string> = {
  calm: "차분함",
  guarded: "경계",
  shaken: "동요",
};

/**
 * v1 sessions had no per-suspect `awaitingTopicId` (the pending choice lived in
 * volatile React state). Migrating simply normalises every suspect record and
 * drops the orphaned awaiting state, so the topic can be asked again.
 */
export function migrateSession(raw: unknown): InterviewSession | null {
  const parsed = raw as
    | (Omit<InterviewSession, "version"> & { version?: number })
    | null;
  if (!parsed || typeof parsed !== "object") return null;
  const version = parsed.version;
  if (version !== 1 && version !== 2) return null;
  if (!parsed.suspects || typeof parsed.suspects !== "object") return null;
  const suspects: Record<string, InterviewSuspectState> = {};
  for (const [id, st] of Object.entries(parsed.suspects)) {
    const base = emptySuspectState();
    suspects[id] = {
      ...base,
      ...st,
      awaitingTopicId: version === 2 ? (st.awaitingTopicId ?? null) : null,
    };
  }
  return { version: 2, roomId: parsed.roomId ?? null, suspects };
}

const KEY = (caseId: string) => `interview:${caseId}`;

export function loadSession(caseId: string): InterviewSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY(caseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InterviewSession & { version: number };
    return migrateSession(parsed);
  } catch {
    return null;
  }
}

export function saveSession(caseId: string, session: InterviewSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY(caseId), JSON.stringify(session));
  } catch {
    /* storage unavailable — interviews stay in-memory */
  }
}
