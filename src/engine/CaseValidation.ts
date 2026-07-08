import type { Case } from "@/types";
import type { CaseDefinition } from "@/types/runtime";

export interface CaseValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a presentational Case and its runtime CaseDefinition together.
 *
 * The two layers are authored separately but must stay id-compatible:
 *   - evidence ids referenced by runtime must exist in case.evidence
 *   - suspect ids referenced by runtime must exist in case.suspects
 *   - internal runtime references (scene→hotspot, hotspot→evidence,
 *     question→evidence) must resolve
 *
 * Pure function. Safe to call in dev to console.warn drift.
 */
export function validateCasePair(
  c: Case,
  def: CaseDefinition,
): CaseValidationResult {
  const errors: string[] = [];
  const caseEvidenceIds = new Set(c.evidence.map((e) => e.id));
  const caseSuspectIds = new Set(c.suspects.map((s) => s.id));
  const runtimeEvidenceIds = new Set(def.evidence.map((e) => e.id));
  const runtimeHotspotIds = new Set(def.hotspots.map((h) => h.id));

  // Evidence ids: runtime ⊆ case, and every case id used by runtime must exist.
  for (const e of def.evidence) {
    if (!caseEvidenceIds.has(e.id)) {
      errors.push(`runtime.evidence "${e.id}" missing from case.evidence`);
    }
  }
  // Suspect ids referenced by runtime must exist in case.
  for (const id of def.suspectIds) {
    if (!caseSuspectIds.has(id)) {
      errors.push(`runtime.suspectIds "${id}" missing from case.suspects`);
    }
  }
  // Scene → hotspot / suspect / evidence references.
  for (const scene of def.scenes) {
    for (const hid of scene.availableHotspotIds) {
      if (!runtimeHotspotIds.has(hid)) {
        errors.push(`scene "${scene.id}" references unknown hotspot "${hid}"`);
      }
    }
    for (const sid of scene.availableSuspectIds) {
      if (!def.suspectIds.includes(sid)) {
        errors.push(`scene "${scene.id}" references unknown suspect "${sid}"`);
      }
    }
    for (const eid of scene.evidenceRewardIds) {
      if (!runtimeEvidenceIds.has(eid)) {
        errors.push(
          `scene "${scene.id}" rewards unknown evidence "${eid}"`,
        );
      }
    }
  }
  // Hotspot → evidence references.
  for (const h of def.hotspots) {
    for (const eid of h.revealsEvidenceIds) {
      if (!runtimeEvidenceIds.has(eid)) {
        errors.push(
          `hotspot "${h.id}" reveals unknown evidence "${eid}"`,
        );
      }
    }
  }
  // Question → evidence references.
  for (const q of def.questions) {
    for (const eid of q.unlockedByEvidenceIds ?? []) {
      if (!runtimeEvidenceIds.has(eid)) {
        errors.push(
          `question "${q.id}".unlockedByEvidenceIds references unknown "${eid}"`,
        );
      }
    }
    for (const eid of q.solvedByEvidenceIds ?? []) {
      if (!runtimeEvidenceIds.has(eid)) {
        errors.push(
          `question "${q.id}".solvedByEvidenceIds references unknown "${eid}"`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
