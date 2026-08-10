/**
 * Evidence gating shared by the interview evidence sheet and the final
 * deduction's decisive-evidence step: only evidence the detective has
 * discovered AND actually read may be used.
 */

export function presentableEvidenceIds(
  discoveredIds: readonly string[],
  readIds: ReadonlySet<string>,
): string[] {
  return discoveredIds.filter((id) => readIds.has(id));
}

export function isPresentable(
  evidenceId: string,
  discoveredIds: ReadonlySet<string>,
  readIds: ReadonlySet<string>,
): boolean {
  return discoveredIds.has(evidenceId) && readIds.has(evidenceId);
}
