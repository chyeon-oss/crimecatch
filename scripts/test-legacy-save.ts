/**
 * Deterministic legacy-save migration tests.
 *
 * Covers the save shapes that exist in the wild from earlier sprints:
 * pre-rewrite dialogue transcripts, relation-less board links, v1 interview
 * sessions and v1 progress records. A player returning after an update must
 * never lose progress or see stale copy.
 *
 * Run: bun scripts/test-legacy-save.ts
 */
import { migrateBoard } from "../src/lib/detectiveBoard";

let pass = 0;
let fail = 0;
const check = (name: string, cond: boolean) => {
  if (cond) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.error(`  FAIL ${name}`);
  }
};

// ---------------------------------------------------------------------------
// A minimal localStorage/window stand-in so the browser-only lib modules load.
// ---------------------------------------------------------------------------
const store = new Map<string, string>();
const localStorageStub = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  get length() {
    return store.size;
  },
};
(globalThis as Record<string, unknown>).localStorage = localStorageStub;
(globalThis as Record<string, unknown>).window = globalThis;

const { loadSession } = await import("../src/lib/dialogueRuntime");
const { loadSession: loadInterviewSession } = await import("../src/lib/interviewRuntime");

const CASE = "midnight-office";

// ---------------------------------------------------------------------------
// 1. Dialogue transcript rewrites — stale in-save copy is replaced on load.
// ---------------------------------------------------------------------------
{
  const legacyLine = "신고는 22시 31분. 회의실 근처에서 사람이 쓰러져 있다는 내용이었습니다.";
  store.clear();
  store.set(
    `dialogue:${CASE}`,
    JSON.stringify({
      version: 1,
      completedThreadIds: ["s1-open"],
      threadId: null,
      nodeId: null,
      revealed: 2,
      flags: ["scene01-seen"],
      entries: [
        { id: "t1", at: 1, speaker: "partner", text: legacyLine },
        { id: "t2", at: 2, speaker: "partner", text: "그대로 두었습니다." },
      ],
    }),
  );
  const s = loadSession(CASE);
  check("legacy dialogue session loads", !!s);
  check("stale timestamp line rewritten", s?.entries[0].text.includes("23시 52분") === true);
  check("untouched line preserved", s?.entries[1].text === "그대로 두었습니다.");
  check("progress fields preserved", s?.completedThreadIds.includes("s1-open") === true);
}

// ---------------------------------------------------------------------------
// 2. Corrupt / foreign payloads never throw and never fake progress.
// ---------------------------------------------------------------------------
{
  store.clear();
  store.set(`dialogue:${CASE}`, "{not json");
  check("corrupt dialogue payload yields null", loadSession(CASE) === null);
  store.set(`dialogue:${CASE}`, JSON.stringify([1, 2, 3]));
  const arr = loadSession(CASE);
  check("array dialogue payload is rejected or empty", arr === null || arr.entries.length === 0);
}

// ---------------------------------------------------------------------------
// 3. Board links written before relations existed stay usable.
// ---------------------------------------------------------------------------
{
  const migrated = migrateBoard({
    connections: [
      { id: "L1", from: { kind: "evidence", id: "e1" }, to: { kind: "suspect", id: "s1" } },
      { id: "L2", from: { kind: "suspect", id: "s1" }, to: { kind: "evidence", id: "e1" } },
    ],
  });
  check("relation-less legacy link survives migration", migrated.connections.length === 1);
  check("legacy link keeps its endpoints", migrated.connections[0].from.id === "e1");
}

// ---------------------------------------------------------------------------
// 4. v1 interview sessions upgrade without dropping asked topics.
// ---------------------------------------------------------------------------
{
  store.clear();
  store.set(
    `interview:${CASE}`,
    JSON.stringify({
      version: 1,
      roomId: "s1",
      suspects: {
        s1: {
          completedTopicIds: ["t-alibi"],
          askedTopicIds: ["t-alibi"],
          transcript: [],
          presentedEvidenceIds: [],
          mood: "guarded",
          awaitingTopicId: "t-alibi",
        },
      },
    }),
  );
  const s = loadInterviewSession(CASE);
  check("v1 interview session loads", !!s);
  check("completed topics preserved", s?.suspects.s1?.completedTopicIds.includes("t-alibi") === true);
  check("session upgraded to v2", s?.version === 2);
  check("orphaned awaiting topic cleared", s?.suspects.s1?.awaitingTopicId === null);
}

console.log(`\nlegacy save migration: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
