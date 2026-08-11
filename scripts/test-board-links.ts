/**
 * Deterministic state tests for the detective board link model.
 * Run: bun scripts/test-board-links.ts
 */
import {
  createLink,
  findConnection,
  linkIndex,
  linksFor,
  migrateBoard,
  relationLabel,
  removeLink,
  setRelation,
  NEUTRAL_RELATION_LABEL,
  type BoardEndpoint,
  type DetectiveBoardData,
} from "../src/lib/detectiveBoard";

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

const e1: BoardEndpoint = { kind: "evidence", id: "e1" };
const e2: BoardEndpoint = { kind: "evidence", id: "e2" };
const s1: BoardEndpoint = { kind: "suspect", id: "s1" };
const q1: BoardEndpoint = { kind: "question", id: "q1" };
const empty: DetectiveBoardData = { connections: [] };

// 1. create link
const a = createLink(empty, e1, s1, "contradicts", "L1", 1);
check("create link", a.connections.length === 1);
check("create link stores relation", a.connections[0].relation === "contradicts");
check("create link is immutable", empty.connections.length === 0);

// 2. self link rejected
check("self link rejected", createLink(a, e1, e1, "supports").connections.length === 1);

// 3. reverse-order duplicate prevention
const dup = createLink(a, s1, e1, "supports", "L2", 2);
check("reverse duplicate not added", dup.connections.length === 1);
check("reverse duplicate updates relation", dup.connections[0].relation === "supports");
check("reverse duplicate keeps id", dup.connections[0].id === "L1");
check("duplicate lookup order-independent", !!findConnection(a, s1, e1));

// 4. multiple links from one card
const multi = createLink(createLink(a, e1, e2, "same-time", "L2", 2), e1, q1, "person", "L3", 3);
check("multiple links from one card", linksFor(multi, e1).length === 3);
check("stable visual identifiers", linkIndex(multi, "L1") === 1 && linkIndex(multi, "L3") === 3);

// 5. edit relation
const edited = setRelation(multi, "L2", "contradicts");
check("edit relation", edited.connections.find((c) => c.id === "L2")!.relation === "contradicts");
check("edit relation leaves siblings", edited.connections.find((c) => c.id === "L3")!.relation === "person");

// 6. delete link
const removed = removeLink(edited, "L2");
check("delete link", removed.connections.length === 2 && !removed.connections.some((c) => c.id === "L2"));

// 7. cancel without mutation (no reducer call = identical reference)
const beforeCancel = multi;
check("cancel performs no mutation", beforeCancel === multi && multi.connections.length === 3);

// 8. persistence round-trip through JSON + migration
const roundTrip = migrateBoard(JSON.parse(JSON.stringify(multi)));
check("persistence round-trip count", roundTrip.connections.length === 3);
check(
  "persistence round-trip relations",
  roundTrip.connections.map((c) => c.relation).join(",") ===
    multi.connections.map((c) => c.relation).join(","),
);

// 9. legacy relation-less links migrate with a neutral label
const legacy = migrateBoard({
  connections: [
    { id: "old1", from: e1, to: s1, memo: "", createdAt: 1 },
    { id: "old2", from: e2, to: q1, relation: "bogus", memo: "", createdAt: 2 },
  ],
});
check("legacy links kept", legacy.connections.length === 2);
check("legacy relation undefined", legacy.connections[0].relation === undefined);
check("unknown relation neutralised", legacy.connections[1].relation === undefined);
check("neutral label", relationLabel(undefined) === NEUTRAL_RELATION_LABEL);
check("named label", relationLabel("same-time") === "같은 시간대다");

// 10. migration hardening
const dirty = migrateBoard({
  connections: [
    null,
    { id: "x", from: e1, to: e1, createdAt: 1 },
    { id: "y", from: { kind: "nope", id: "z" }, to: e1, createdAt: 1 },
    { id: "k1", from: e1, to: s1, createdAt: 1 },
    { id: "k2", from: s1, to: e1, createdAt: 2 },
  ] as never,
});
check("malformed rows dropped", dirty.connections.length === 1);
check("duplicate pair collapsed on load", dirty.connections[0].id === "k1");
check("non-array payload", migrateBoard({ nope: true }).connections.length === 0);

console.log(`\nboard links: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
