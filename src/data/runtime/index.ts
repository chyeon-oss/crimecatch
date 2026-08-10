import type { CaseDefinition } from "@/types/runtime";
import { midnightOfficeRuntime } from "./midnightOfficeRuntime";
import { inheritancePartyRuntime } from "@/content/cases/inheritance-party/runtime";

const REGISTRY: Record<string, CaseDefinition> = {
  "midnight-office": midnightOfficeRuntime,
  "inheritance-party": inheritancePartyRuntime,
};

export function getRuntimeDefinition(caseId: string): CaseDefinition | null {
  return REGISTRY[caseId] ?? null;
}
