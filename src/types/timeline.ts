export interface TimelineEvent {
  /** e.g. "19:20" or "2025-03-14 19:20". */
  time: string;
  description: string;
  /** Optional witness or suspect id. */
  relatedSuspectId?: string;
}
