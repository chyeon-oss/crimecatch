import type { CaseDialoguePack } from "@/types/dialogue";
import { midnightOfficeDialogue } from "@/content/cases/midnight-office/dialogue";
import { inheritancePartyDialogue } from "@/content/cases/inheritance-party/dialogue";

const REGISTRY: Record<string, CaseDialoguePack> = {
  "midnight-office": midnightOfficeDialogue,
  "inheritance-party": inheritancePartyDialogue,
};

export function getCaseDialogue(caseId: string): CaseDialoguePack | null {
  return REGISTRY[caseId] ?? null;
}
