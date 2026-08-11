/**
 * CASE002 mobile 2.0 migration checks.
 * Verifies the dialogue pack wires to the real runtime (ids, gates, scenes),
 * the presentation registry covers every hotspot, and no spoiler vocabulary
 * leaks into player-facing dialogue.
 *
 * Run: bun run scripts/test-case002-dialogue.ts
 */
import { getCaseDialogue } from "@/data/dialogue";
import { getRuntimeDefinition } from "@/data/runtime";
import { getScenePresentation } from "@/data/scenePresentation";
import { inheritanceParty } from "@/content/cases/inheritance-party";
import { meetsRequirement } from "@/lib/dialogueRuntime";

let pass = 0;
let fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) {
    pass += 1;
    console.log(`PASS  ${name}`);
  } else {
    fail += 1;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const CASE_ID = "inheritance-party";
const pack = getCaseDialogue(CASE_ID)!;
const def = getRuntimeDefinition(CASE_ID)!;

check("a1) CASE002 dialogue pack registered", !!pack);
check("a2) CASE002 runtime definition registered", !!def);
check("a3) pack caseId matches runtime case", pack.caseId === CASE_ID);

const threadIds = new Set(pack.threads.map((t) => t.id));
check("b1) opening thread exists", threadIds.has(pack.openingThreadId));

const hotspotIds = new Set(def.scenes.flatMap((s) => s.hotspots.map((h) => h.id)));
const evidenceIds = new Set(inheritanceParty.evidence.map((e) => e.id));

for (const [hs, tid] of Object.entries(pack.hotspotThreadIds)) {
  check(`b2) before-thread for ${hs}`, hotspotIds.has(hs) && threadIds.has(tid));
}
for (const [hs, tid] of Object.entries(pack.hotspotAfterThreadIds ?? {})) {
  check(`b3) after-thread for ${hs}`, hotspotIds.has(hs) && threadIds.has(tid));
}

const sceneIds = new Set(def.scenes.map((s) => s.id));
for (const auto of pack.autoThreads ?? []) {
  check(
    `c1) auto thread ${auto.threadId} targets a real scene`,
    threadIds.has(auto.threadId) && (!auto.sceneId || sceneIds.has(auto.sceneId)),
  );
  for (const id of auto.requirement?.requiresEvidenceIds ?? []) {
    check(`c2) auto gate evidence ${id} exists`, evidenceIds.has(id));
  }
}

// Every node/choice target resolves; every referenced speaker exists.
const speakerIds = new Set(pack.speakers.map((s) => s.id));
let badTargets = 0;
let badSpeakers = 0;
for (const t of pack.threads) {
  const nodeIds = new Set(t.nodes.map((n) => n.id));
  if (!nodeIds.has(t.startNodeId)) badTargets += 1;
  for (const n of t.nodes) {
    for (const l of n.lines) if (!speakerIds.has(l.speakerId)) badSpeakers += 1;
    if (n.autoNextNodeId && !nodeIds.has(n.autoNextNodeId)) badTargets += 1;
    for (const c of n.choices ?? []) {
      const go = c.effect?.goToNodeId;
      if (go && !nodeIds.has(go)) badTargets += 1;
      const focus = c.effect?.focusHotspotId;
      if (focus && !hotspotIds.has(focus)) badTargets += 1;
      for (const id of c.requirement?.requiresEvidenceIds ?? []) {
        if (!evidenceIds.has(id)) badTargets += 1;
      }
    }
  }
}
check("d1) all node/hotspot/evidence targets resolve", badTargets === 0, `${badTargets} broken`);
check("d2) all lines use registered speakers", badSpeakers === 0, `${badSpeakers} unknown`);

// Analysis gate must be closed before the Scene 02 evidence is in hand.
const analysis = (pack.autoThreads ?? []).find((a) => a.threadId === "t-c2-scene02-analysis")!;
const empty = {
  discoveredEvidenceIds: new Set<string>(),
  investigatedHotspotIds: new Set<string>(),
  flags: new Set<string>(),
};
const full = {
  ...empty,
  discoveredEvidenceIds: new Set(analysis.requirement!.requiresEvidenceIds!),
};
check("e1) analysis thread gated before evidence", !meetsRequirement(analysis.requirement, empty));
check("e2) analysis thread opens with evidence", meetsRequirement(analysis.requirement, full));

// Presentation registry covers every runtime hotspot for the migrated scenes.
const presentation = getScenePresentation(CASE_ID);
const migrated = def.scenes.slice(0, 2).flatMap((s) => s.hotspots.map((h) => h.id));
const missingLayout = migrated.filter((id) => !presentation.layout[id]);
check("f1) scene 01~02 hotspots have layout", missingLayout.length === 0, missingLayout.join(","));
check("f2) presentation registry supplies a backdrop", typeof presentation.renderBackdrop === "function");

// Spoiler isolation: player-facing dialogue must not name the answer.
const FORBIDDEN = ["범인은", "isCulprit", "hiddenTruth", "윤미란이 범인", "진범"];
const allText = pack.threads
  .flatMap((t) => t.nodes.flatMap((n) => [...n.lines.map((l) => l.text), ...(n.choices ?? []).map((c) => c.text)]))
  .join("\n");
const leaked = FORBIDDEN.filter((w) => allText.includes(w));
check("g1) no spoiler vocabulary in dialogue", leaked.length === 0, leaked.join(","));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("ALL CASE002 DIALOGUE TESTS PASSED");
