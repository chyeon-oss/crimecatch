/**
 * Types for the PRIVATE Truth Pack layer.
 *
 * A case's Truth Pack contains the canonical reconstruction of the crime.
 * It MUST only be imported by the accusation/result flow and only rendered
 * AFTER the player submits their final deduction.
 */

export interface TruthBeat {
  /** Stable beat id, aligned with the reconstruction modal sequence. */
  id: "pre" | "meeting" | "gap" | "scene" | "final";
  /** Display order (1-5). */
  order: number;
  /** In-fiction clock time or window, e.g. "20:05 ~ 20:12". */
  time: string;
  location: string;
  title: string;
  /** Narrative body for this beat. */
  body: string;
  /** ONLY the evidence ids that matter for this beat. */
  evidenceIds: string[];
}

export interface TruthContradiction {
  /** Suspect statement or apparent fact that is undermined. */
  claim: string;
  /** What actually contradicts it. */
  contradiction: string;
  evidenceIds: string[];
}

export interface TruthSummary {
  culpritId: string;
  culpritName: string;
  motiveId: string;
  motive: string;
  methodId: string;
  method: string;
  /** Actual murder window. */
  murderWindow: string;
  /** How the locked-room / closed-door impression was manufactured. */
  lockedRoomTrick: string;
  /** Ordered contradiction chain that convicts the culprit. */
  contradictionChain: TruthContradiction[];
  /** Closing line shown at the end of the reconstruction. */
  closing: string;
}

export interface TruthPack {
  caseId: string;
  beats: TruthBeat[];
  summary: TruthSummary;
}
