import type { CaseInterviewPack } from "@/types/interview";
import { midnightOfficeInterviews } from "@/content/cases/midnight-office/interviews";

const REGISTRY: Record<string, CaseInterviewPack> = {
  "midnight-office": midnightOfficeInterviews,
};

export function getCaseInterviews(caseId: string): CaseInterviewPack | null {
  return REGISTRY[caseId] ?? null;
}
