export type EvidenceCategory =
  | "PHOTO"
  | "DOCUMENT"
  | "FORENSIC"
  | "PHONE"
  | "CCTV"
  | "OBJECT";

export interface UnlockCondition {
  /** Requires these evidence ids to be read first. */
  requiresEvidenceIds?: string[];
  /** Requires these suspects to have been interrogated. */
  requiresSuspectIds?: string[];
  /** Free-form key that a future AI interrogation flow can flip. */
  requiresFlag?: string;
}

export interface Evidence {
  id: string;
  title: string;
  category: EvidenceCategory;
  summary: string;
  detail: string;
  imagePlaceholder?: string;
  /** Lower numbers unlock earlier. `0` = always unlocked. */
  unlockOrder: number;
  unlockCondition?: UnlockCondition;
  location?: string;
}
