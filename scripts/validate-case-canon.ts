/**
 * DEV VALIDATOR — CASE002 canon reference check + spoiler isolation audit.
 *
 * Run: bun scripts/validate-case-canon.ts
 *
 * This script imports private spoiler layers on purpose. It is authoring
 * tooling and is never bundled into the app.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { validateCaseCanon } from "../src/engine/CaseValidation";
import { inheritanceParty } from "../src/content/cases/inheritance-party";
import { inheritancePartyRuntime } from "../src/content/cases/inheritance-party/runtime";
import { answerKey, solution } from "../src/content/cases/inheritance-party/_spoilers";
import { inheritancePartyTruth } from "../src/content/cases/inheritance-party/_truth";

const result = validateCaseCanon(inheritanceParty, inheritancePartyRuntime, {
  answerKeyEvidenceIds: answerKey.decisiveEvidenceIds,
  answerKeySuspectId: answerKey.correctSuspectId,
  truthBeats: inheritancePartyTruth.beats.map((b) => ({
    id: b.id,
    evidenceIds: b.evidenceIds,
  })),
  truthCulpritId: inheritancePartyTruth.summary.culpritId,
  solutionCulpritId: solution.culpritId,
  contradictionPairs: solution.contradictionPairs,
});

console.log("=== CASE002 canon validation ===");
console.log("counts:", result.counts);
console.log("reachable scenes:", result.reachableScenes.join(" → "));
console.log("required connection pairs:", answerKey.requiredConnectionPairs.length);
console.log("valid:", result.valid);
for (const e of result.errors) console.log("  ERROR:", e);

// ---- Spoiler isolation audit -------------------------------------------------
const PRIVATE_FILES = ["_spoilers", "_truth", "AUTHOR_BIBLE"];
/** Field assignments that would leak the spoiler layer into public modules. */
const FORBIDDEN_PUBLIC_TOKENS = ["isCulprit:", "hiddenTruth:"];
/**
 * Canonical solution text that must never appear in public modules. The four
 * suspect names are player-facing by design, so we instead assert that no
 * public module reproduces the private solution/truth prose that identifies
 * the culprit.
 */
const FORBIDDEN_SOLUTION_TEXT = [
  solution.motive,
  solution.murderMethod,
  solution.murderTime,
  inheritancePartyTruth.summary.motive,
  inheritancePartyTruth.summary.method,
  inheritancePartyTruth.summary.lockedRoomTrick,
  inheritancePartyTruth.summary.closing,
  `${inheritancePartyTruth.summary.culpritName}이 범인`,
  `${inheritancePartyTruth.summary.culpritName}은 진범`,
];

const PUBLIC_CONTENT_FILES = [
  "briefing.ts",
  "victim.ts",
  "suspects.ts",
  "evidence.ts",
  "timeline.ts",
  "scene.ts",
  "runtime.ts",
].map((f) => join("src/content/cases/inheritance-party", f));

const isolationErrors: string[] = [];

for (const file of PUBLIC_CONTENT_FILES) {
  const src = readFileSync(file, "utf8");
  for (const token of FORBIDDEN_PUBLIC_TOKENS) {
    if (src.includes(token)) {
      isolationErrors.push(`${file} contains forbidden token "${token}"`);
    }
  }
  for (const text of FORBIDDEN_SOLUTION_TEXT) {
    if (text && src.includes(text)) {
      isolationErrors.push(`${file} reproduces private solution text`);
    }
  }
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

const PLAYER_DIRS = [
  "src/components",
  "src/routes",
  "src/engine",
  "src/hooks",
  "src/state",
  "src/data",
];
/**
 * Final evaluation / result / truth infrastructure is the one allowed
 * consumer of the private layers (same boundary CASE001 uses).
 */
const PRIVATE_CONSUMER_ALLOWLIST = ["src/routes/case.$caseId.accuse.tsx"];
for (const dir of PLAYER_DIRS) {
  for (const file of walk(dir)) {
    if (PRIVATE_CONSUMER_ALLOWLIST.some((allowed) => file.endsWith(allowed))) continue;
    const src = readFileSync(file, "utf8");
    for (const priv of PRIVATE_FILES) {
      if (src.includes(`inheritance-party/${priv}`)) {
        isolationErrors.push(`${file} imports private module "${priv}"`);
      }
    }
  }
}


console.log("=== spoiler isolation ===");
console.log("clean:", isolationErrors.length === 0);
for (const e of isolationErrors) console.log("  ERROR:", e);

if (!result.valid || isolationErrors.length > 0) process.exit(1);
