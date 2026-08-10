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

export interface CaseCanonInput {
  /** Answer key evidence ids (private layer). */
  answerKeyEvidenceIds?: string[];
  answerKeySuspectId?: string;
  /** Truth Pack beats: id + evidence ids. */
  truthBeats?: { id: string; evidenceIds: string[] }[];
  /** Truth Pack summary culprit id. */
  truthCulpritId?: string;
  /** Solution culprit id + contradiction pair suspect/evidence ids. */
  solutionCulpritId?: string;
  contradictionPairs?: { evidenceId: string; suspectId: string }[];
}

export interface CaseCanonResult extends CaseValidationResult {
  counts: {
    suspects: number;
    evidence: number;
    hotspots: number;
    questions: number;
    scenes: number;
    contradictionPairs: number;
  };
  /** Scene ids reachable from startSceneId, in order. */
  reachableScenes: string[];
}

const REQUIRED_TRUTH_BEAT_IDS = ["pre", "meeting", "gap", "scene", "final"];

/**
 * Deep canon validation for an authored (not necessarily activated) case:
 * reference integrity, scene reachability, and private-layer id consistency.
 * Pure function — safe to run in dev or tests.
 */
export function validateCaseCanon(
  c: Case,
  def: CaseDefinition,
  canon: CaseCanonInput = {},
): CaseCanonResult {
  const base = validateCasePair(c, def);
  const errors = [...base.errors];
  const caseEvidenceIds = new Set(c.evidence.map((e) => e.id));
  const caseSuspectIds = new Set(c.suspects.map((s) => s.id));

  // Case-level references (crimeScene hotspots, questions, timeline).
  for (const h of c.crimeScene?.hotspots ?? []) {
    for (const eid of h.revealsEvidenceIds) {
      if (!caseEvidenceIds.has(eid)) {
        errors.push(`crimeScene hotspot "${h.id}" reveals unknown evidence "${eid}"`);
      }
    }
  }
  for (const q of c.questions ?? []) {
    for (const eid of [
      ...(q.generatedByEvidenceIds ?? []),
      ...(q.solvedByEvidenceIds ?? []),
    ]) {
      if (!caseEvidenceIds.has(eid)) {
        errors.push(`case question "${q.id}" references unknown evidence "${eid}"`);
      }
    }
  }
  for (const e of c.evidence) {
    for (const eid of e.relatedEvidenceIds ?? []) {
      if (!caseEvidenceIds.has(eid)) {
        errors.push(`evidence "${e.id}".relatedEvidenceIds unknown "${eid}"`);
      }
    }
    for (const sid of e.relatedSuspectIds ?? []) {
      if (!caseSuspectIds.has(sid)) {
        errors.push(`evidence "${e.id}".relatedSuspectIds unknown "${sid}"`);
      }
    }
    for (const eid of e.unlockCondition?.requiresEvidenceIds ?? []) {
      if (!caseEvidenceIds.has(eid)) {
        errors.push(`evidence "${e.id}".unlockCondition unknown "${eid}"`);
      }
    }
  }
  for (const t of c.timeline) {
    for (const sid of [
      ...(t.relatedSuspectId ? [t.relatedSuspectId] : []),
      ...(t.involvedSuspectIds ?? []),
    ]) {
      if (!caseSuspectIds.has(sid)) {
        errors.push(`timeline "${t.time}" references unknown suspect "${sid}"`);
      }
    }
  }

  // Scene reachability from startSceneId, deadlock detection.
  const sceneById = new Map(def.scenes.map((s) => [s.id, s]));
  const reachableScenes: string[] = [];
  let cursor: string | null | undefined = def.startSceneId;
  const seen = new Set<string>();
  while (cursor) {
    const scene = sceneById.get(cursor);
    if (!scene) {
      errors.push(`scene chain references unknown scene "${cursor}"`);
      break;
    }
    if (seen.has(cursor)) {
      errors.push(`scene chain loops at "${cursor}"`);
      break;
    }
    seen.add(cursor);
    reachableScenes.push(cursor);

    // Deadlock check: a completion requirement must be satisfiable by
    // evidence reachable in this or an earlier scene.
    const reachableEvidence = new Set<string>();
    for (const sid of reachableScenes) {
      for (const eid of sceneById.get(sid)?.evidenceRewardIds ?? []) {
        reachableEvidence.add(eid);
      }
    }
    const cc = scene.completionCondition;
    if (cc) {
      for (const eid of cc.requiresEvidenceIds ?? []) {
        if (!reachableEvidence.has(eid)) {
          errors.push(
            `scene "${scene.id}" requires evidence "${eid}" that is not rewarded by this or an earlier scene (deadlock)`,
          );
        }
      }
      if (
        cc.minEvidenceRewards !== undefined &&
        cc.minEvidenceRewards > scene.evidenceRewardIds.length
      ) {
        errors.push(
          `scene "${scene.id}" needs ${cc.minEvidenceRewards} rewards but only offers ${scene.evidenceRewardIds.length} (deadlock)`,
        );
      }
      for (const sid of cc.requiresInterviewedSuspectIds ?? []) {
        if (!scene.availableSuspectIds.includes(sid)) {
          errors.push(
            `scene "${scene.id}" requires interviewing "${sid}" who is not available in that scene (deadlock)`,
          );
        }
      }
    }
    for (const eid of scene.unlockCondition?.requiresEvidenceIds ?? []) {
      if (!reachableEvidence.has(eid)) {
        errors.push(
          `scene "${scene.id}" unlock requires unreachable evidence "${eid}"`,
        );
      }
    }
    cursor = scene.nextSceneId ?? null;
  }
  for (const s of def.scenes) {
    if (!seen.has(s.id)) {
      errors.push(`scene "${s.id}" is unreachable from startSceneId`);
    }
  }

  // Hotspot unlock conditions must reference known scenes/evidence.
  for (const h of def.hotspots) {
    for (const sid of h.unlockCondition?.requiresSceneIds ?? []) {
      if (!sceneById.has(sid)) {
        errors.push(`hotspot "${h.id}" unlock references unknown scene "${sid}"`);
      }
    }
    for (const eid of h.unlockCondition?.requiresEvidenceIds ?? []) {
      if (!caseEvidenceIds.has(eid)) {
        errors.push(`hotspot "${h.id}" unlock references unknown evidence "${eid}"`);
      }
    }
  }

  // Private layer consistency.
  for (const eid of canon.answerKeyEvidenceIds ?? []) {
    if (!caseEvidenceIds.has(eid)) {
      errors.push(`answerKey decisive evidence "${eid}" missing from case.evidence`);
    }
  }
  if (canon.answerKeySuspectId && !caseSuspectIds.has(canon.answerKeySuspectId)) {
    errors.push(`answerKey suspect "${canon.answerKeySuspectId}" missing from case.suspects`);
  }
  if (canon.truthBeats) {
    const beatIds = canon.truthBeats.map((b) => b.id);
    for (const required of REQUIRED_TRUTH_BEAT_IDS) {
      if (!beatIds.includes(required)) {
        errors.push(`truth pack missing required beat "${required}"`);
      }
    }
    if (canon.truthBeats.length !== REQUIRED_TRUTH_BEAT_IDS.length) {
      errors.push(
        `truth pack must have exactly ${REQUIRED_TRUTH_BEAT_IDS.length} beats, found ${canon.truthBeats.length}`,
      );
    }
    for (const b of canon.truthBeats) {
      for (const eid of b.evidenceIds) {
        if (!caseEvidenceIds.has(eid)) {
          errors.push(`truth beat "${b.id}" references unknown evidence "${eid}"`);
        }
      }
    }
  }
  if (
    canon.truthCulpritId &&
    canon.solutionCulpritId &&
    canon.truthCulpritId !== canon.solutionCulpritId
  ) {
    errors.push(
      `truth culprit "${canon.truthCulpritId}" disagrees with solution culprit "${canon.solutionCulpritId}"`,
    );
  }
  if (canon.answerKeySuspectId && canon.solutionCulpritId && canon.answerKeySuspectId !== canon.solutionCulpritId) {
    errors.push(
      `answerKey culprit "${canon.answerKeySuspectId}" disagrees with solution culprit "${canon.solutionCulpritId}"`,
    );
  }
  for (const p of canon.contradictionPairs ?? []) {
    if (!caseEvidenceIds.has(p.evidenceId)) {
      errors.push(`contradiction pair references unknown evidence "${p.evidenceId}"`);
    }
    if (!caseSuspectIds.has(p.suspectId)) {
      errors.push(`contradiction pair references unknown suspect "${p.suspectId}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    counts: {
      suspects: c.suspects.length,
      evidence: c.evidence.length,
      hotspots: def.hotspots.length,
      questions: def.questions.length,
      scenes: def.scenes.length,
      contradictionPairs: (canon.contradictionPairs ?? []).length,
    },
    reachableScenes,
  };
}
