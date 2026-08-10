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
  };
}

export function emptySession(): InterviewSession {
  return { version: 1, roomId: null, suspects: {} };
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

const KEY = (caseId: string) => `interview:${caseId}`;

export function loadSession(caseId: string): InterviewSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY(caseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InterviewSession;
    if (parsed?.version !== 1 || typeof parsed.suspects !== "object") return null;
    return parsed;
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
