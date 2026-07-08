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
  /** Police notes on this suspect (player-facing). */
  policeNotes?: string;
  /** Never shown directly to the player — reserved for AI interrogation. */
  hiddenTruth: string;
  isCulprit: boolean;
}
