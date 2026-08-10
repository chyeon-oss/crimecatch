/**
 * Authored suspect-interview types — generic across every case.
 *
 * This is NOT free-form AI chat: every question, reply, and evidence
 * reaction is authored content. The runtime only walks the authored graph,
 * records moods/contradictions, and reports completion to the host.
 *
 * Spoiler rule: interview content is player-facing. It must never reference
 * hiddenTruth, isCulprit, or any private canon field.
 */

import type {
  DialogueLine,
  DialogueRequirement,
  DialogueSpeakerRole,
  TranscriptEntry,
} from "@/types/dialogue";

/** Psychological reaction only — never a verdict of guilt. */
export type SuspectMood = "calm" | "guarded" | "shaken";

export interface InterviewContradiction {
  id: string;
  title: string;
  detail: string;
  /** Follow-up pressure topics opened by this contradiction. */
  unlocksTopicIds?: string[];
}

export interface InterviewChoice {
  id: string;
  text: string;
  requirement?: DialogueRequirement;
  lockedHint?: string;
  /** Lines played after this choice is taken. */
  reply: DialogueLine[];
  mood?: SuspectMood;
  /** Line written into the interview memo. */
  note?: string;
  contradiction?: InterviewContradiction;
  unlocksTopicIds?: string[];
}

export interface InterviewTopic {
  id: string;
  /** Question button label shown in the chat room. */
  label: string;
  kind?: "BASE" | "PRESSURE";
  requirement?: DialogueRequirement;
  lockedHint?: string;
  lines: DialogueLine[];
  choices?: InterviewChoice[];
  mood?: SuspectMood;
  note?: string;
}

export interface EvidenceReaction {
  evidenceIds: string[];
  lines: DialogueLine[];
  mood?: SuspectMood;
  note?: string;
  contradiction?: InterviewContradiction;
}

export interface SuspectInterview {
  suspectId: string;
  /** Speaker id used by this suspect's lines. */
  speakerId: string;
  topics: InterviewTopic[];
  /** Topics that must be completed for the base interview to count as done. */
  requiredTopicIds: string[];
  evidenceReactions: EvidenceReaction[];
  /** Repeatable short reaction for unrelated evidence. */
  genericReaction: DialogueLine[];
}

export interface CaseInterviewPack {
  caseId: string;
  speakers: Array<{ id: string; name: string; role: DialogueSpeakerRole; title?: string }>;
  suspects: SuspectInterview[];
}

// --------------------------------------------------------------------------
// Session state (persisted per case)
// --------------------------------------------------------------------------

export interface InterviewSuspectState {
  entries: TranscriptEntry[];
  completedTopicIds: string[];
  /** Pressure topics revealed by contradictions. */
  unlockedTopicIds: string[];
  presentedEvidenceIds: string[];
  mood: SuspectMood;
  contradictions: Array<{ id: string; title: string; detail: string }>;
  notes: string[];
  /** New authored lines the player has not opened yet. */
  unread: boolean;
}

export interface InterviewSession {
  version: 1;
  /** Chat room the player was last in, restored on reload. */
  roomId: string | null;
  suspects: Record<string, InterviewSuspectState>;
}
