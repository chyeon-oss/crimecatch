import type { CaseDialoguePack } from "@/types/dialogue";
import { midnightOfficeDialogue } from "@/content/cases/midnight-office/dialogue";

const REGISTRY: Record<string, CaseDialoguePack> = {
  "midnight-office": midnightOfficeDialogue,
};

export function getCaseDialogue(caseId: string): CaseDialoguePack | null {
  return REGISTRY[caseId] ?? null;
}
