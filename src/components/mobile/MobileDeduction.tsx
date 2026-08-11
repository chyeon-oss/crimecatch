import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import type { Case, Evidence } from "@/types";
import type { DeductionScore } from "@/lib/deductionScoring";
import type { DeductionCommitOutcome } from "@/types/progress";
import type { TruthPack } from "@/types/truth";
import { MOTIVE_OPTIONS, METHOD_OPTIONS } from "@/data/deductionOptions";
import { useDetectiveBoard, type BoardEndpoint } from "@/lib/detectiveBoard";
import { clearDraft } from "@/lib/deductionDraft";
import { progressStore } from "@/state/progressStore";
import { DeductionFlow, type DeductionSelection } from "./DeductionFlow";
import { DeductionResult, type ResultSummaryRow } from "./DeductionResult";

interface Props {
  case: Case;
  /** Discovered AND read evidence — the only decisive-evidence candidates. */
  readEvidence: Evidence[];
  discoveredEvidenceIds: Set<string>;
  /** True only once the runtime has reached the ACCUSATION scene. */
  canAccuse: boolean;
  /** Jump to the case-file tab so the player can read evidence. */
  onOpenCaseFile?: () => void;
}

interface Submission {
  selection: DeductionSelection;
  score: DeductionScore | null;
  career: DeductionCommitOutcome | null;
  truth: TruthPack | null;
}

/**
 * Scene 04 host: locked notice → stepped mobile deduction → result +
 * five-beat truth reconstruction. The private canon (answer key, Truth Pack)
 * is imported lazily inside the submit handler, so nothing spoiler-bearing is
 * part of the investigation bundle.
 */
export function MobileDeduction({
  case: c,
  readEvidence,
  discoveredEvidenceIds,
  canAccuse,
  onOpenCaseFile,
}: Props) {
  const board = useDetectiveBoard(c.id);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const labelOf = (ep: BoardEndpoint): string => {
    if (ep.kind === "evidence") return c.evidence.find((e) => e.id === ep.id)?.title ?? "(증거)";
    if (ep.kind === "suspect") return c.suspects.find((s) => s.id === ep.id)?.name ?? "(용의자)";
    return c.questions?.find((q) => q.id === ep.id)?.text ?? "(의문)";
  };

  const connections = useMemo(
    () =>
      board.data.connections.map((con) => ({
        id: con.id,
        from: labelOf(con.from),
        to: labelOf(con.to),
        memo: con.memo,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board.data.connections, c],
  );

  const evidenceTitleOf = (id: string) => c.evidence.find((e) => e.id === id)?.title ?? id;

  const handleSubmit = async (selection: DeductionSelection) => {
    const [{ answerKeyFor, truthPackFor }, { scoreDeduction }] = await Promise.all([
      import("@/lib/caseAnswers"),
      import("@/lib/deductionScoring"),
    ]);

    const key = answerKeyFor(c.id);
    const score = key
      ? scoreDeduction({ ...selection, connections: board.data.connections }, key)
      : null;

    const correct = score
      ? score.breakdown.suspect.hit
      : selection.suspectId === c.solution.culpritId;
    const b = score?.breakdown;
    const perfect =
      !!score &&
      score.rank === "S" &&
      !!b &&
      b.suspect.hit &&
      b.motive.hit &&
      b.method.hit &&
      b.evidence.hit &&
      b.connections.matched >= b.connections.required;

    const career = progressStore.recordDeduction(c, {
      score: score?.score ?? 0,
      rank: score?.rank ?? null,
      correct,
      perfect,
    });

    setSubmission({ selection, score, career, truth: truthPackFor(c.id) });
  };

  if (!canAccuse) {
    return (
      <section className="px-4 py-4">
        <div className="flex items-start gap-2 rounded-xl border border-dashed border-border/60 bg-surface-elevated/50 px-3 py-4 text-[11px] leading-relaxed text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          아직 최종 추리를 제출할 수 없습니다. SCENE 04(최종 추리)에 도달하면 이 화면에서 단계별로
          결론을 제출할 수 있습니다.
        </div>
      </section>
    );
  }

  if (submission) {
    const { selection, score } = submission;
    const suspect = c.suspects.find((s) => s.id === selection.suspectId) ?? null;
    const motive = MOTIVE_OPTIONS.find((o) => o.id === selection.motiveId) ?? null;
    const method = METHOD_OPTIONS.find((o) => o.id === selection.methodId) ?? null;
    const rows: ResultSummaryRow[] = [
      {
        label: "범인",
        value: suspect?.name ?? selection.suspectId,
        hit: score?.breakdown.suspect.hit,
      },
      {
        label: "동기",
        value: motive?.label ?? selection.motiveId,
        hit: score?.breakdown.motive.hit,
      },
      {
        label: "범행 방법",
        value: method?.label ?? selection.methodId,
        hit: score?.breakdown.method.hit,
      },
      {
        label: "결정적 증거",
        value: evidenceTitleOf(selection.evidenceId),
        hit: score?.breakdown.evidence.hit,
      },
      { label: "보드 연결", value: `${connections.length}개 연결` },
    ];

    return (
      <DeductionResult
        caseTitle={c.title}
        caseSlug={c.slug}
        score={submission.score}
        career={submission.career}
        rows={rows}
        truth={submission.truth}
        discoveredEvidenceIds={discoveredEvidenceIds}
        evidenceTitleOf={evidenceTitleOf}
        onReplay={() => {
          clearDraft(c.id);
          setSubmission(null);
        }}
      />
    );
  }

  return (
    <DeductionFlow
      caseId={c.id}
      suspects={c.suspects.map((s) => ({
        id: s.id,
        name: s.name,
        occupation: s.occupation,
        relationship: s.relationship,
      }))}
      evidence={readEvidence.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        summary: e.summary,
      }))}
      connections={connections}
      onOpenCaseFile={onOpenCaseFile}
      onSubmit={handleSubmit}
    />
  );
}
