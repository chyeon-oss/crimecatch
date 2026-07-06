export interface InvestigationQuestion {
  id: string;
  text: string;
  /**
   * The question becomes visible once ANY of these evidence ids is discovered.
   * Empty / undefined = active from the start of the investigation.
   */
  generatedByEvidenceIds?: string[];
  /**
   * The question is automatically marked as solved once ALL of these evidence
   * ids have been read. Empty / undefined = never auto-solves (reserved for
   * future AI interrogation flows).
   */
  solvedByEvidenceIds?: string[];
}

export type QuestionStatus = "hidden" | "active" | "solved";
