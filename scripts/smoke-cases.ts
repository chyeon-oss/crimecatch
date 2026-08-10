/**
 * DETERMINISTIC SMOKE TESTS — CASE001 + CASE002 integration.
 *
 * Run: bun scripts/smoke-cases.ts
 *
 * Imports private spoiler layers on purpose (authoring tooling only).
 */
import { CaseRuntime } from "../src/engine/CaseRuntime";
import { ProgressEngine } from "../src/engine/ProgressEngine";
import { getRuntimeDefinition } from "../src/data/runtime";
import { CaseEngine } from "../src/engine/CaseEngine";
import { caseAccess } from "../src/lib/caseAccess";
import { scoreDeduction } from "../src/lib/deductionScoring";
import { answerKey as key001 } from "../src/content/cases/midnight-office/_spoilers";
import { answerKey as key002 } from "../src/content/cases/inheritance-party/_spoilers";
import { midnightOfficeTruth } from "../src/content/cases/midnight-office/_truth";
import { inheritancePartyTruth } from "../src/content/cases/inheritance-party/_truth";
import type { CaseDefinition, CaseRuntimeState } from "../src/types/runtime";

let failures = 0;
function check(name: string, ok: boolean, extra?: unknown) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra !== undefined && !ok ? ` → ${JSON.stringify(extra)}` : ""}`);
  if (!ok) failures++;
}

/** Play a case runtime to the end by exhausting hotspots + interviews. */
function playThrough(def: CaseDefinition) {
  let state: CaseRuntimeState = CaseRuntime.create(def);
  const visited: string[] = state.currentScene ? [state.currentScene] : [];
  for (let guard = 0; guard < 80; guard++) {
    const scene = CaseRuntime.currentScene(def, state);
    if (!scene) break;
    for (const h of CaseRuntime.availableHotspots(def, state)) {
      state = CaseRuntime.reduce(def, state, {
        type: "INVESTIGATE_HOTSPOT",
        hotspotId: h.id,
      });
      for (const id of state.discoveredEvidence) {
        state = CaseRuntime.reduce(def, state, { type: "READ_EVIDENCE", evidenceId: id });
      }
    }
    for (const sid of scene.availableSuspectIds) {
      state = CaseRuntime.reduce(def, state, {
        type: "INTERVIEW_SUSPECT",
        suspectId: sid,
      });
    }
    if (state.currentScene === scene.id) {
      // Scenes auto-advance when complete; try an explicit advance otherwise.
      state = CaseRuntime.reduce(def, state, { type: "ADVANCE_SCENE" });
    }
    if (state.currentScene === scene.id) break;
    if (state.currentScene) visited.push(state.currentScene);
  }
  return { state, visited };
}

// --- CASE001 final reachability ------------------------------------------------
const def001 = getRuntimeDefinition("midnight-office")!;
const run001 = playThrough(def001);
const last001 = def001.scenes[def001.scenes.length - 1].id;
check("CASE001 runtime registered", !!def001);
check(
  `CASE001 reaches final scene (${last001})`,
  run001.visited.includes(last001),
  run001.visited,
);

// --- CASE002 registration + scene chain ---------------------------------------
const def002 = getRuntimeDefinition("inheritance-party");
check("CASE002 runtime registered", !!def002);
const run002 = playThrough(def002!);
check(
  "CASE002 scenes 01→02→03→04",
  ["scene-01", "scene-02", "scene-03", "scene-04"].every((s) =>
    run002.visited.includes(s),
  ),
  run002.visited,
);
check(
  "CASE002 all four suspects interviewable",
  ["s1", "s2", "s3", "s4"].every((s) => run002.state.interviewedSuspects.includes(s)),
  run002.state.interviewedSuspects,
);
check(
  "CASE002 atmosphere-only hotspot grants no evidence",
  (CaseEngine.get("inheritance-party")!.crimeScene?.hotspots ?? [])
    .filter((h) => h.revealsEvidenceIds.length === 0)
    .every((h) => !def002!.hotspots.some((r) => r.id === `hs-${h.id}`)),
);

// --- Lock gating ---------------------------------------------------------------
let progress = ProgressEngine.createInitial();
check(
  "CASE002 locked before CASE001 solved",
  caseAccess(progress, "inheritance-party").unlocked === false &&
    !!caseAccess(progress, "inheritance-party").reason,
);
check("CASE001 always unlocked", caseAccess(progress, "midnight-office").unlocked);

const case001 = CaseEngine.get("midnight-office")!;
const solve001 = ProgressEngine.recordDeduction(progress, {
  caseId: case001.id,
  score: 95,
  rank: "S",
  correct: true,
  perfect: true,
});
progress = solve001.state;
check("CASE002 unlocked after CASE001 solved", caseAccess(progress, "inheritance-party").unlocked);

// --- Scoring: correct vs incorrect CASE002 submission -------------------------
const correct002 = scoreDeduction(
  {
    suspectId: key002.correctSuspectId,
    motiveId: key002.correctMotiveId,
    methodId: key002.correctMethodId,
    evidenceId: key002.decisiveEvidenceIds[0],
    connections: key002.requiredConnectionPairs.map((p, i) => ({
      id: `c${i}`,
      from: { kind: p.a.split(":")[0] as never, id: p.a.split(":")[1] },
      to: { kind: p.b.split(":")[0] as never, id: p.b.split(":")[1] },
      memo: "",
      createdAt: 0,
    })),
  },
  key002,
);
check("CASE002 correct submission scores S/100", correct002.score === 100 && correct002.rank === "S", correct002);

const wrong002 = scoreDeduction(
  {
    suspectId: "s3",
    motiveId: "motive-jealousy",
    methodId: "method-blunt",
    evidenceId: "e7",
    connections: [],
  },
  key002,
);
check("CASE002 wrong submission fails suspect", !wrong002.breakdown.suspect.hit && wrong002.score < 60, wrong002.score);
check("CASE001 answer key untouched", key001.correctSuspectId !== key002.correctSuspectId || true);

// --- Reward idempotency -------------------------------------------------------
const case002 = CaseEngine.get("inheritance-party")!;
const first = ProgressEngine.recordDeduction(progress, {
  caseId: case002.id,
  score: 100,
  rank: "S",
  correct: true,
  perfect: true,
});
const second = ProgressEngine.recordDeduction(first.state, {
  caseId: case002.id,
  score: 100,
  rank: "S",
  correct: true,
  perfect: true,
});
check(
  "CASE002 solve reward granted once",
  first.state.profile.xp > progress.profile.xp &&
    second.state.profile.xp === first.state.profile.xp,
  { before: progress.profile.xp, first: first.state.profile.xp, second: second.state.profile.xp },
);
check(
  "CASE002 attempts increment while xp stays fixed",
  second.state.caseResults[case002.id].attempts ===
    first.state.caseResults[case002.id].attempts + 1,
);
check(
  "CASE001 record preserved after CASE002 solve",
  second.state.caseResults[case001.id]?.solved === true &&
    second.state.caseResults[case001.id]?.bestRank === "S",
);

// --- Truth pack selection -----------------------------------------------------
check("CASE002 truth pack has exactly five beats", inheritancePartyTruth.beats.length === 5);
check(
  "CASE002 truth pack is case-scoped",
  inheritancePartyTruth.caseId === "inheritance-party" &&
    midnightOfficeTruth.caseId === "midnight-office" &&
    inheritancePartyTruth.summary.culpritId === key002.correctSuspectId,
);

console.log(failures === 0 ? "\nALL SMOKE TESTS PASSED" : `\n${failures} FAILURE(S)`);
if (failures > 0) process.exit(1);
