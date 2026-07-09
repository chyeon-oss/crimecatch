export interface Suspect {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relationship: string;
  personality: string;
  profileImage?: string;
  initialStatement: string;
  alibi: string;
  /** First impression recorded by investigators (player-facing). */
  firstImpression?: string;
  /** Police notes on this suspect (player-facing, legacy alias). */
  policeNotes?: string;
  /** Notes from the first-round police interview (player-facing). */
  interviewNotes?: string;
  /** Sensitive topic to press during interrogation (player-facing). */
  pressurePoint?: string;
  /** Subtle hint toward useful evidence — never reveals the answer. */
  visibleContradictionHint?: string;
  /** Never shown directly to the player — reserved for AI interrogation. */
  hiddenTruth: string;
  isCulprit: boolean;
}
