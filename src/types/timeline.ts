export interface TimelineEvent {
  /** e.g. "19:20" or "2025-03-14 19:20". */
  time: string;
  description: string;
  /** Optional witness or suspect id (legacy single-relation). */
  relatedSuspectId?: string;
  /** Optional richer metadata for the interactive timeline. */
  location?: string;
  involvedSuspectIds?: string[];
  /** When true, event is visible before any evidence is discovered. */
  initiallyVisible?: boolean;
}
