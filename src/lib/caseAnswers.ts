/**
 * PRIVATE CANON BRIDGE — answer keys + Truth Packs, selected strictly by caseId.
 *
 * Nothing in this module may be imported by investigation-phase UI. It is
 * loaded lazily (`await import("@/lib/caseAnswers")`) from the final-deduction
 * submit handler so spoiler content never reaches the initial bundle of the
 * investigation screen.
 */
import {
  answerKey as midnightOfficeAnswerKey,
  type CaseAnswerKey,
} from "@/content/cases/midnight-office/_spoilers";
import { answerKey as inheritancePartyAnswerKey } from "@/content/cases/inheritance-party/_spoilers";
import { midnightOfficeTruth } from "@/content/cases/midnight-office/_truth";
import { inheritancePartyTruth } from "@/content/cases/inheritance-party/_truth";
import type { TruthPack } from "@/types/truth";

const ANSWER_KEYS: Record<string, CaseAnswerKey> = {
  "midnight-office": midnightOfficeAnswerKey,
  "inheritance-party": inheritancePartyAnswerKey,
};

const TRUTH_PACKS: Record<string, TruthPack> = {
  "midnight-office": midnightOfficeTruth,
  "inheritance-party": inheritancePartyTruth,
};

export function answerKeyFor(caseId: string): CaseAnswerKey | null {
  return ANSWER_KEYS[caseId] ?? null;
}

/** Truth Packs are self-identifying: a pack whose caseId drifts is rejected. */
export function truthPackFor(caseId: string): TruthPack | null {
  const pack = TRUTH_PACKS[caseId] ?? null;
  if (!pack) return null;
  return pack.caseId === caseId ? pack : null;
}

export type { CaseAnswerKey };
