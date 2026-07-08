/**
 * Final Deduction scoring.
 *
 * The answer key lives in each case's private `_spoilers.ts`. This module
 * is only invoked AFTER the player submits — never render its output to
 * the UI before submission.
 */
import type { CaseAnswerKey } from "@/content/cases/midnight-office/_spoilers";
import type { DetectiveBoardConnection } from "@/lib/detectiveBoard";

export type DeductionRank = "S" | "A" | "B" | "C";

export interface DeductionInput {
  suspectId: string;
  motiveId: string;
  methodId: string;
  /** Player-selected "decisive" evidence (single pick in current UI). */
  evidenceId: string;
  connections: DetectiveBoardConnection[];
}

export interface DeductionScoreBreakdown {
  suspect: { earned: number; max: number; hit: boolean };
  motive: { earned: number; max: number; hit: boolean };
  method: { earned: number; max: number; hit: boolean };
  evidence: { earned: number; max: number; hit: boolean };
  connections: {
    earned: number;
    max: number;
    matched: number;
    required: number;
  };
}

export interface DeductionScore {
  score: number;
  rank: DeductionRank;
  feedback: string;
  breakdown: DeductionScoreBreakdown;
}

const WEIGHTS = {
  suspect: 40,
  motive: 15,
  method: 15,
  evidence: 15,
  connections: 15,
} as const;

const endpointKey = (kind: string, id: string) => `${kind}:${id}`;

function pairKey(a: string, b: string) {
  return [a, b].sort().join("::");
}

export function scoreDeduction(
  input: DeductionInput,
  key: CaseAnswerKey,
): DeductionScore {
  const suspectHit = input.suspectId === key.correctSuspectId;
  const motiveHit = input.motiveId === key.correctMotiveId;
  const methodHit = input.methodId === key.correctMethodId;
  const evidenceHit = key.decisiveEvidenceIds.includes(input.evidenceId);

  const boardPairs = new Set(
    input.connections.map((c) =>
      pairKey(
        endpointKey(c.from.kind, c.from.id),
        endpointKey(c.to.kind, c.to.id),
      ),
    ),
  );
  const requiredKeys = key.requiredConnectionPairs.map((p) => pairKey(p.a, p.b));
  const matched = requiredKeys.filter((k) => boardPairs.has(k)).length;
  const required = requiredKeys.length;
  const connectionRatio = required === 0 ? 1 : matched / required;

  const breakdown: DeductionScoreBreakdown = {
    suspect: {
      earned: suspectHit ? WEIGHTS.suspect : 0,
      max: WEIGHTS.suspect,
      hit: suspectHit,
    },
    motive: {
      earned: motiveHit ? WEIGHTS.motive : 0,
      max: WEIGHTS.motive,
      hit: motiveHit,
    },
    method: {
      earned: methodHit ? WEIGHTS.method : 0,
      max: WEIGHTS.method,
      hit: methodHit,
    },
    evidence: {
      earned: evidenceHit ? WEIGHTS.evidence : 0,
      max: WEIGHTS.evidence,
      hit: evidenceHit,
    },
    connections: {
      earned: Math.round(connectionRatio * WEIGHTS.connections),
      max: WEIGHTS.connections,
      matched,
      required,
    },
  };

  const score =
    breakdown.suspect.earned +
    breakdown.motive.earned +
    breakdown.method.earned +
    breakdown.evidence.earned +
    breakdown.connections.earned;

  const rank: DeductionRank =
    score >= 90 ? "S" : score >= 75 ? "A" : score >= 60 ? "B" : "C";

  const feedback = buildFeedback(rank, breakdown);

  return { score, rank, feedback, breakdown };
}

function buildFeedback(
  rank: DeductionRank,
  b: DeductionScoreBreakdown,
): string {
  if (rank === "S") {
    return "완벽에 가까운 추리입니다. 범인, 동기, 방법, 그리고 결정적 증거까지 하나의 흐름으로 이어졌습니다.";
  }
  if (rank === "A") {
    if (!b.connections.matched && b.connections.required)
      return "핵심 판단은 정확했습니다. 다만 추리 보드 위 연결이 조금 더 촘촘했다면 더 단단한 결론이 되었을 것입니다.";
    return "훌륭한 판단입니다. 몇 가지 세부 요소만 다시 살피면 완결에 가까워집니다.";
  }
  if (rank === "B") {
    if (!b.suspect.hit)
      return "지목한 인물에 대한 확신은 이해합니다. 그러나 다른 흔적들이 다른 방향을 가리키고 있었습니다.";
    return "방향은 옳았습니다. 하지만 동기 또는 방법에 대한 근거가 아직 부족합니다.";
  }
  if (!b.suspect.hit)
    return "이번 추리는 진실에서 조금 벗어나 있었습니다. 놓친 증거와 진술을 다시 이어 보세요.";
  return "핵심을 짚었지만 세부가 어긋났습니다. 증거의 연결 관계를 다시 정리해 보시기 바랍니다.";
}
