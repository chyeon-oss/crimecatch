/**
 * Branching dialogue types — author-controlled, reusable across every case.
 *
 * This is NOT free-form AI chat: every line and choice is authored content.
 * The runtime only walks the graph, records flags, and emits effects that the
 * hosting screen (scene surface / case runtime) executes.
 *
 * Spoiler rule: dialogue content is player-facing. It must never reference
 * hiddenTruth, isCulprit, or any private canon field.
 */

import type { NotebookSectionId } from "@/lib/notebook";

export type DialogueSpeakerRole = "PARTNER" | "DETECTIVE" | "WITNESS" | "SYSTEM";

export interface DialogueSpeaker {
  id: string;
  name: string;
  role: DialogueSpeakerRole;
  /** Short title shown under the name, e.g. "강남서 강력팀". */
  title?: string;
}

export interface DialogueLine {
  id: string;
  speakerId: string;
  text: string;
  /** Typing delay before this line appears. Defaults to a length-based value. */
  delayMs?: number;
}

/** Gate for a choice (or a whole thread) becoming selectable. */
export interface DialogueRequirement {
  requiresEvidenceIds?: string[];
  requiresInvestigatedHotspotIds?: string[];
  requiresFlags?: string[];
  forbidsFlags?: string[];
}

/** Side effects a choice (or node entry) may request from the host screen. */
export interface DialogueEffect {
  /** Continue the thread at this node. */
  goToNodeId?: string;
  /** End the thread after this choice. */
  endThread?: boolean;
  /** Flags recorded in the dialogue session (persisted). */
  setFlags?: string[];
  /** Guide the player: highlight this hotspot on the scene tab. */
  focusHotspotId?: string;
  /** Run the case runtime hotspot investigation immediately. */
  investigateHotspotId?: string;
  /** Require the player to present this evidence (reserved for later scenes). */
  requirePresentEvidenceId?: string;
  /** Write a line into the detective notebook. */
  notebookEntry?: { section: NotebookSectionId; text: string };
  /** Switch the shell to this tab. */
  switchToTab?: "scene" | "talk" | "file" | "deduce";
}

export interface DialogueChoice {
  id: string;
  text: string;
  requirement?: DialogueRequirement;
  /** Copy shown when the requirement is not met. */
  lockedHint?: string;
  effect?: DialogueEffect;
}

export interface DialogueNode {
  id: string;
  lines: DialogueLine[];
  /** Applied the moment the node becomes active. */
  effectOnEnter?: DialogueEffect;
  /** Shown after every line has been revealed. */
  choices?: DialogueChoice[];
  /** When there are no choices, continue here automatically. */
  autoNextNodeId?: string;
}

export interface DialogueThread {
  id: string;
  title: string;
  /** Optional scene scoping, purely informational. */
  sceneId?: string;
  startNodeId: string;
  nodes: DialogueNode[];
}

export interface CaseDialoguePack {
  caseId: string;
  speakers: DialogueSpeaker[];
  /** Played automatically on first arrival at the scene. */
  openingThreadId: string;
  threads: DialogueThread[];
  /** hotspotId → thread played right before the evidence reveal. */
  hotspotThreadIds: Record<string, string>;
}

/** A rendered message in the conversation transcript. */
export type TranscriptKind = "LINE" | "CHOICE" | "SYSTEM";

export interface TranscriptEntry {
  id: string;
  kind: TranscriptKind;
  /** Speaker display name (LINE only). */
  speaker?: string;
  role?: DialogueSpeakerRole;
  text: string;
  /** For SYSTEM cards: "EVIDENCE" | "QUESTION" | "SCENE". */
  systemKind?: "EVIDENCE" | "QUESTION" | "SCENE";
  at: number;
}

export interface DialogueSession {
  version: 1;
  entries: TranscriptEntry[];
  threadId: string | null;
  nodeId: string | null;
  /** Lines of the current node already revealed. */
  revealed: number;
  flags: string[];
  completedThreadIds: string[];
}
