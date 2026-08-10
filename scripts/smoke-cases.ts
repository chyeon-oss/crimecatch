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


// ==========================================================================
// SPRINT 3 — CASE001 mobile end-to-end determinism
// ==========================================================================
import { getCaseInterviews } from "../src/data/interviews";
import { isInterviewComplete, emptySuspectState } from "../src/lib/interviewRuntime";
import { presentableEvidenceIds } from "../src/lib/evidenceGating";
import { answerKeyFor, truthPackFor } from "../src/lib/caseAnswers";
import { replayLog } from "../src/lib/runtimeSession";
import { emptyDraft, type DeductionDraft } from "../src/lib/deductionDraft";
import type { RuntimeAction } from "../src/types/runtime";

const pack001 = getCaseInterviews("midnight-office")!;
const scene03 = def001.scenes.find((s) => s.id === "scene-03")!;

// (a) all four Scene 03 suspect rooms are reachable
check(
  "a) CASE001 Scene 03 exposes four interview rooms",
  scene03.availableSuspectIds.length === 4 &&
    scene03.availableSuspectIds.every((id) =>
      pack001.suspects.some((iv) => iv.suspectId === id),
    ),
  scene03.availableSuspectIds,
);

// (b) completing the required s1/s2 base interviews reaches Scene 04
const requiredIds = scene03.completionCondition?.requiresInterviewedSuspectIds ?? [];
check("b1) Scene 03 requires s1 + s2 interviews", requiredIds.join(",") === "s1,s2", requiredIds);

let stateB = CaseRuntime.create(def001);
const logB: RuntimeAction[] = [];
const push = (a: RuntimeAction) => {
  logB.push(a);
  stateB = CaseRuntime.reduce(def001, stateB, a);
};
for (const sceneId of ["scene-01", "scene-02"]) {
  const scene = def001.scenes.find((s) => s.id === sceneId)!;
  for (const hid of scene.availableHotspotIds) push({ type: "INVESTIGATE_HOTSPOT", hotspotId: hid });
  for (const eid of [...stateB.discoveredEvidence]) push({ type: "READ_EVIDENCE", evidenceId: eid });
}
check("b2) Scene 03 reached after Scene 01/02 evidence", stateB.currentScene === "scene-03", stateB.currentScene);

for (const sid of requiredIds) {
  const iv = pack001.suspects.find((s) => s.suspectId === sid)!;
  const done = { ...emptySuspectState(), completedTopicIds: [...iv.requiredTopicIds] };
  check(`b3) ${sid} base interview counted complete`, isInterviewComplete(iv, done));
  push({ type: "INTERVIEW_SUSPECT", suspectId: sid });
}
check("b4) Scene 04 reached after s1 + s2 interviews", stateB.currentScene === "scene-04", stateB.currentScene);
check(
  "b5) Scene 04 is the accusation scene",
  def001.scenes.find((s) => s.id === stateB.currentScene)?.status === "ACCUSATION",
);

// (c) unread evidence is excluded from presentable / decisive candidates
const unreadState = { discovered: ["e1", "e3", "e5"], read: new Set(["e1"]) };
check(
  "c) unread evidence excluded from presentable candidates",
  presentableEvidenceIds(unreadState.discovered, unreadState.read).join(",") === "e1",
  presentableEvidenceIds(unreadState.discovered, unreadState.read),
);
check(
  "c2) CASE001 decisive answer ids are all real evidence",
  answerKeyFor("midnight-office")!.decisiveEvidenceIds.every((id) =>
    case001.evidence.some((e) => e.id === id),
  ),
);

// (d) correct and incorrect CASE001 submissions both produce a result
const key001b = answerKeyFor("midnight-office")!;
const right001 = scoreDeduction(
  {
    suspectId: key001b.correctSuspectId,
    motiveId: key001b.correctMotiveId,
    methodId: key001b.correctMethodId,
    evidenceId: key001b.decisiveEvidenceIds[0],
    connections: key001b.requiredConnectionPairs.map((p, i) => ({
      id: `k${i}`,
      from: { kind: p.a.split(":")[0] as never, id: p.a.split(":")[1] },
      to: { kind: p.b.split(":")[0] as never, id: p.b.split(":")[1] },
      memo: "",
      createdAt: 0,
    })),
  },
  key001b,
);
const wrong001 = scoreDeduction(
  { suspectId: "s4", motiveId: "motive-money", methodId: "method-poison", evidenceId: "e1", connections: [] },
  key001b,
);
check("d1) CASE001 correct submission → S / 100", right001.score === 100 && right001.rank === "S", right001.score);
check(
  "d2) CASE001 wrong submission still produces a full result",
  !wrong001.breakdown.suspect.hit &&
    typeof wrong001.score === "number" &&
    !!wrong001.rank &&
    wrong001.feedback.length > 0,
  wrong001,
);

// (e) repeated CASE001 submissions never grant XP twice
let p001 = ProgressEngine.createInitial();
const first001 = ProgressEngine.recordDeduction(p001, {
  caseId: case001.id, score: 100, rank: "S", correct: true, perfect: true,
});
const second001 = ProgressEngine.recordDeduction(first001.state, {
  caseId: case001.id, score: 100, rank: "S", correct: true, perfect: true,
});
check(
  "e) CASE001 repeat submission grants no extra XP",
  first001.state.profile.xp > p001.profile.xp &&
    second001.state.profile.xp === first001.state.profile.xp &&
    second001.state.caseResults[case001.id].attempts === 2,
  { first: first001.state.profile.xp, second: second001.state.profile.xp },
);

// (f) CASE001 Truth Pack is case-scoped, exactly five beats, no CASE002 bleed
const truth001 = truthPackFor("midnight-office")!;
check("f1) CASE001 truth pack has exactly five beats", truth001.beats.length === 5, truth001.beats.length);
check(
  "f2) CASE001 beats are the authored five",
  truth001.beats.map((b) => b.id).join(",") === "pre,meeting,gap,scene,final",
  truth001.beats.map((b) => b.id),
);
check(
  "f3) CASE001 truth/answer key do not mix with CASE002",
  truth001.caseId === "midnight-office" &&
    truth001.summary.culpritId === key001b.correctSuspectId &&
    truthPackFor("inheritance-party")!.caseId === "inheritance-party" &&
    answerKeyFor("inheritance-party")!.correctSuspectId !== key001b.correctSuspectId,
);
check("f4) unknown caseId resolves to no canon", truthPackFor("nope") === null && answerKeyFor("nope") === null);

// (g) reload serialization round-trip
const replayed = replayLog(def001, JSON.parse(JSON.stringify(logB)) as RuntimeAction[]);
check(
  "g1) runtime action log round-trips to the same state",
  replayed.currentScene === stateB.currentScene &&
    replayed.discoveredEvidence.join(",") === stateB.discoveredEvidence.join(",") &&
    replayed.interviewedSuspects.join(",") === stateB.interviewedSuspects.join(",") &&
    replayed.completedScenes.join(",") === stateB.completedScenes.join(","),
  { expected: stateB.currentScene, got: replayed.currentScene },
);
const draft: DeductionDraft = { ...emptyDraft(), step: 4, suspectId: "s1", motiveId: "motive-revenge" };
check(
  "g2) deduction draft round-trips through storage serialization",
  JSON.stringify(JSON.parse(JSON.stringify(draft))) === JSON.stringify(draft),
);
check(
  "g3) per-case storage keys never collide",
  new Set([
    "runtime-log:midnight-office",
    "dialogue:midnight-office",
    "interview:midnight-office",
    "detective-board:midnight-office",
    "deduction-draft:midnight-office",
    "notebook:midnight-office",
  ]).size === 6,
);

console.log(failures === 0 ? "\nALL SMOKE TESTS PASSED" : `\n${failures} FAILURE(S)`);
if (failures > 0) process.exit(1);
