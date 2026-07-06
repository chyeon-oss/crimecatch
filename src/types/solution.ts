export interface ContradictionPair {
  /** Evidence or fact id that contradicts a suspect statement. */
  evidenceId: string;
  suspectId: string;
  explanation: string;
}

export interface Solution {
  culpritId: string;
  motive: string;
  murderMethod: string;
  murderTime: string;
  requiredEvidence: string[];
  contradictionPairs: ContradictionPair[];
}
