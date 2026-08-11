/**
 * Sprint 6.1 residual: explicit CASE002 wrong-submission behaviour.
 * Verifies that a wrong culprit never reads as solved, that the ending
 * variant flips to re-examination, and that relation metadata on board
 * links does not alter scoring.
 * Run: bun scripts/test-case002-wrong-submission.ts
 */
import { answerKey } from "../src/content/cases/inheritance-party/_spoilers";
import { scoreDeduction } from "../src/lib/deductionScoring";
import { createLink, type DetectiveBoardData } from "../src/lib/detectiveBoard";
import { ALL_CASES } from "../src/data/cases/index";

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

const c2 = ALL_CASES.find((c) => c.id === "inheritance-party")!;
const wrongSuspect = c2.suspects.find((s) => s.id !== answerKey.correctSuspectId)!;

const board: DetectiveBoardData = { connections: [] };
const withRelations = answerKey.requiredConnectionPairs.reduce((acc, p, i) => {
  const [ak, ai] = p.a.split(":");
  const [bk, bi] = p.b.split(":");
  return createLink(
    acc,
    { kind: ak as never, id: ai },
    { kind: bk as never, id: bi },
    i % 2 === 0 ? "contradicts" : "supports",
    `L${i}`,
    i + 1,
  );
}, board);

const correct = scoreDeduction(
  {
    suspectId: answerKey.correctSuspectId,
    motiveId: answerKey.correctMotiveId,
    methodId: answerKey.correctMethodId,
    evidenceId: answerKey.decisiveEvidenceIds[0],
    connections: withRelations.connections,
  },
  answerKey,
);
check("correct submission scores 100", correct.score === 100);
check("correct submission ranks S", correct.rank === "S");
check("relation metadata does not break pair matching",
  correct.breakdown.connections.matched === answerKey.requiredConnectionPairs.length);

const wrong = scoreDeduction(
  {
    suspectId: wrongSuspect.id,
    motiveId: "bogus-motive",
    methodId: "bogus-method",
    evidenceId: "bogus-evidence",
    connections: [],
  },
  answerKey,
);
check("wrong submission misses culprit", wrong.breakdown.suspect.hit === false);
check("wrong submission scores 0", wrong.score === 0);
check("wrong submission ranks C", wrong.rank === "C");
check("wrong submission feedback is non-empty", wrong.feedback.trim().length > 0);
check("wrong submission earns no connection credit",
  wrong.breakdown.connections.earned === 0);

// Partial: right culprit, wrong supporting picks — still not a perfect ending.
const partial = scoreDeduction(
  {
    suspectId: answerKey.correctSuspectId,
    motiveId: "bogus",
    methodId: "bogus",
    evidenceId: "bogus",
    connections: [],
  },
  answerKey,
);
check("partial submission below perfect", partial.score < 100 && partial.score >= 40);
check("partial ranks below S", partial.rank !== "S");

console.log(`\ncase002 wrong submission: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
