import type { CaseInterviewPack } from "@/types/interview";
import { midnightOfficeInterviews } from "@/content/cases/midnight-office/interviews";
import { inheritancePartyInterviews } from "@/content/cases/inheritance-party/interviews";

const REGISTRY: Record<string, CaseInterviewPack> = {
  "midnight-office": midnightOfficeInterviews,
  "inheritance-party": inheritancePartyInterviews,
};

export function getCaseInterviews(caseId: string): CaseInterviewPack | null {
  return REGISTRY[caseId] ?? null;
}
