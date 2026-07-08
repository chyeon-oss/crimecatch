export type EvidenceCategory =
  | "PHOTO"
  | "DOCUMENT"
  | "FORENSIC"
  | "PHONE"
  | "CCTV"
  | "OBJECT";

export type EvidenceImportance =
  | "COMMON"
  | "UNCOMMON"
  | "IMPORTANT"
  | "CRITICAL";

export type EvidenceState = "NEW" | "READ" | "CONNECTED";

export interface UnlockCondition {
  requiresEvidenceIds?: string[];
  requiresSuspectIds?: string[];
  requiresFlag?: string;
}

export interface Evidence {
  id: string;
  title: string;
  category: EvidenceCategory;
  summary: string;
  detail: string;
  imagePlaceholder?: string;
  unlockOrder: number;
  unlockCondition?: UnlockCondition;
  location?: string;
  /** Defaults to COMMON when unspecified. */
  importance?: EvidenceImportance;
  /** Cross-references surfaced in the evidence modal as clickable chips. */
  relatedEvidenceIds?: string[];
  relatedSuspectIds?: string[];
  /** TimelineEvent.time values this evidence is tied to. */
  relatedTimelineTimes?: string[];
  /** Free-form tags surfaced by the evidence locker for filtering. */
  tags?: string[];
  /** Player-facing observation hint surfaced by the investigation UI. */
  observation?: string;
  /** Auto-generated notebook entry text when this evidence is discovered. */
  notebookEntry?: string;
  /** Question text that this evidence is designed to unlock. */
  unlockedQuestion?: string;
}
