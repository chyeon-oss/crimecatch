import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Check,
  ChevronRight,
  Clock,
  FileSearch,
  FileText,
  FolderOpen,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import type { DeductionRank, DeductionScore } from "@/lib/deductionScoring";
import type { DeductionCommitOutcome } from "@/types/progress";
import type { TruthPack } from "@/types/truth";
import { META_ACHIEVEMENTS } from "@/data/achievements";

const ACHIEVEMENT_TITLES: Record<string, string> = Object.fromEntries(
  META_ACHIEVEMENTS.map((a) => [a.id, a.title]),
);

const RANK_TONE: Record<DeductionRank, string> = {
  S: "border-amber-400/50 bg-amber-500/10 text-amber-200",
  A: "border-emerald-400/50 bg-emerald-500/10 text-emerald-200",
  B: "border-sky-400/50 bg-sky-500/10 text-sky-200",
  C: "border-rose-400/50 bg-rose-500/10 text-rose-200",
};

const BEAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pre: Clock,
  meeting: Users,
  gap: FileSearch,
  scene: Search,
  final: Check,
};

export interface ResultSummaryRow {
  label: string;
  value: string;
  hit?: boolean;
}

interface Props {
  caseTitle: string;
  caseSlug: string;
  score: DeductionScore | null;
  career: DeductionCommitOutcome | null;
  rows: ResultSummaryRow[];
  truth: TruthPack | null;
  discoveredEvidenceIds: Set<string>;
  evidenceTitleOf: (id: string) => string;
  onReplay: () => void;
}

/**
 * Scene 04 result screen (mobile). Rendered only after a submission, and the
 * Truth Pack it receives is already scoped to this case by the caller.
 */
export function DeductionResult({
  caseTitle,
  caseSlug,
  score,
  career,
  rows,
  truth,
  discoveredEvidenceIds,
  evidenceTitleOf,
  onReplay,
}: Props) {
  const [reconstruction, setReconstruction] = useState(false);
  const correct = score ? score.breakdown.suspect.hit : null;

  return (
    <section className="px-4 py-5 pb-8" data-testid="deduction-result">
      <header className="text-center">
        <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">DEDUCTION RESULT</p>
        <h2 className="mt-1 font-display text-[22px] text-foreground">
          {correct === null ? "추리 결과" : correct ? "진실 규명" : "사건 재검토 필요"}
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">{caseTitle}</p>
      </header>

      {score && (
        <div className="mt-5 rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-4">
            <div
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl border font-display text-3xl ${RANK_TONE[score.rank]}`}
            >
              {score.rank}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Final Score
              </p>
              <p className="font-display text-3xl tabular-nums text-foreground">
                {score.score}
                <span className="ml-1 text-[13px] text-muted-foreground">/ 100</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-foreground/90">{score.feedback}</p>

          <ul className="mt-4 space-y-1.5">
            {[
              { label: "범인 지목", b: score.breakdown.suspect },
              { label: "동기", b: score.breakdown.motive },
              { label: "범행 방법", b: score.breakdown.method },
              { label: "결정적 증거", b: score.breakdown.evidence },
            ].map((r) => (
              <li
                key={r.label}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-elevated/40 px-3 py-2 text-[12px]"
              >
                <span className="text-muted-foreground">{r.label}</span>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums text-foreground">
                    {r.b.earned}
                    <span className="text-muted-foreground/70"> / {r.b.max}</span>
                  </span>
                  <span
                    className={`rounded-full border px-1.5 py-0.5 text-[9px] tracking-wide ${
                      r.b.hit
                        ? "border-emerald-400/45 text-emerald-200"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    {r.b.hit ? "적중" : "빗나감"}
                  </span>
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-elevated/40 px-3 py-2 text-[12px]">
              <span className="text-muted-foreground">추리 보드 연결</span>
              <span className="tabular-nums text-foreground">
                {score.breakdown.connections.earned}
                <span className="text-muted-foreground/70"> / {score.breakdown.connections.max}</span>
                <span className="ml-2 text-[10px] text-muted-foreground/70">
                  {score.breakdown.connections.matched}/{score.breakdown.connections.required} 연결
                </span>
              </span>
            </li>
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border/60 bg-surface-elevated/40 p-4">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">제출한 답안</p>
        <dl className="mt-2 space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-3">
              <dt className="text-[11px] text-muted-foreground">{r.label}</dt>
              <dd className="min-w-0 text-right text-[12px] font-medium text-foreground">
                {r.value}
                {r.hit !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] ${
                      r.hit ? "text-emerald-300" : "text-muted-foreground"
                    }`}
                  >
                    {r.hit ? "○" : "×"}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {career && (
        <div className="mt-4 rounded-2xl border border-border/60 bg-surface-elevated/40 p-4">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">경력 기록</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { l: "이번 제출", v: `${career.score}` },
              { l: "개인 최고", v: `${career.bestScore}${career.bestRank ? ` · ${career.bestRank}` : ""}` },
              { l: "제출 횟수", v: `${career.attempts}회` },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border border-border/60 bg-card/50 p-2">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{c.l}</p>
                <p className="mt-0.5 font-display text-[13px] tabular-nums text-foreground">{c.v}</p>
              </div>
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-[11px] leading-relaxed">
            {career.firstSolve && (
              <li className="text-emerald-200">
                첫 해결 보상이 지급되었습니다{career.perfect ? " (완벽 해결 보너스 포함)" : ""}.
              </li>
            )}
            {!career.firstSolve && career.correct && (
              <li className="text-muted-foreground">
                이미 종결된 사건입니다. 기록은 갱신되지만 보상은 다시 지급되지 않습니다.
              </li>
            )}
            {!career.correct && (
              <li className="text-rose-200/90">
                이번 판단은 시도로만 기록되었습니다. 사건은 아직 종결되지 않았습니다.
              </li>
            )}
            {career.newAchievements.length > 0 && (
              <li className="flex flex-wrap items-center gap-1.5 pt-1">
                <Award className="h-3.5 w-3.5 text-primary" />
                {career.newAchievements.map((id) => (
                  <span
                    key={id}
                    className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                  >
                    {ACHIEVEMENT_TITLES[id] ?? id}
                  </span>
                ))}
              </li>
            )}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setReconstruction(true)}
        data-testid="reconstruction-open"
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground shadow-[var(--shadow-gold)]"
      >
        <FileSearch className="h-4 w-4" />
        사건 재구성 보기
      </button>
      <p className="mt-1.5 text-center text-[11px] text-muted-foreground/80">
        사건의 실제 순서와 최종 진실을 확인할 수 있습니다.
      </p>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={onReplay}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border/70 bg-surface-elevated text-[13px] text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          다시 추리하기
        </button>
        <Link
          to="/"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border/70 bg-surface-elevated text-[13px] text-foreground"
        >
          <FolderOpen className="h-4 w-4" />
          사건 목록으로
        </Link>
        <Link
          to="/case/$caseId"
          params={{ caseId: caseSlug }}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border/70 bg-surface-elevated text-[13px] text-foreground"
        >
          <FileText className="h-4 w-4" />
          사건 파일로
        </Link>
      </div>

      {reconstruction && (
        <ReconstructionView
          truth={truth}
          discoveredEvidenceIds={discoveredEvidenceIds}
          evidenceTitleOf={evidenceTitleOf}
          correct={correct}
          onClose={() => setReconstruction(false)}
        />
      )}
    </section>
  );
}

function ReconstructionView({
  truth,
  discoveredEvidenceIds,
  evidenceTitleOf,
  correct,
  onClose,
}: {
  truth: TruthPack | null;
  discoveredEvidenceIds: Set<string>;
  evidenceTitleOf: (id: string) => string;
  correct: boolean | null;
  onClose: () => void;
}) {
  const beats = truth?.beats ?? [];
  const [revealed, setRevealed] = useState(1);
  const shown = beats.slice(0, Math.min(revealed, beats.length));
  const allShown = revealed >= beats.length;

  return (
    <div
      className="fixed inset-0 z-[58] flex justify-center bg-background/95 backdrop-blur"
      data-testid="reconstruction-view"
    >
      <div className="flex h-full w-full max-w-[460px] flex-col border-border/60 sm:border-x">
        <header className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
              CASE RECONSTRUCTION
            </p>
            <h3 className="truncate font-display text-[17px] text-foreground">
              {correct === null ? "사건 재구성" : correct ? "진실 규명" : "사건 재검토 필요"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/60 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {!truth && (
            <p className="py-10 text-center text-[12px] text-muted-foreground">
              이 사건의 재구성 데이터를 불러올 수 없습니다.
            </p>
          )}

          <ol className="space-y-3">
            {shown.map((beat) => {
              const Icon = BEAT_ICONS[beat.id] ?? Clock;
              const chips = beat.evidenceIds.filter((id) => discoveredEvidenceIds.has(id));
              return (
                <li
                  key={beat.id}
                  className="animate-fade-in rounded-xl border border-border/60 bg-surface-elevated/40 p-3.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      BEAT {String(beat.order).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] tabular-nums text-primary/80">{beat.time}</span>
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {beat.location}
                  </p>
                  <h4 className="mt-0.5 font-display text-[15px] text-foreground">{beat.title}</h4>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                    {beat.body}
                  </p>
                  {chips.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {chips.map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface px-2 py-1 text-[10px] text-muted-foreground"
                        >
                          <FileText className="h-3 w-3" />
                          {evidenceTitleOf(id)}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {truth && allShown && (
            <section className="animate-fade-in rounded-xl border border-primary/30 bg-primary/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">FINAL TRUTH</p>
              <h4 className="mt-1 font-display text-[17px] text-foreground">사건의 진실</h4>
              <dl className="mt-3 space-y-2">
                {[
                  { l: "범인", v: truth.summary.culpritName },
                  { l: "범행 시각", v: truth.summary.murderWindow },
                  { l: "동기", v: truth.summary.motive },
                  { l: "범행 방법", v: truth.summary.method },
                  { l: "밀실이 만들어진 방법", v: truth.summary.lockedRoomTrick },
                ].map((r) => (
                  <div key={r.l} className="rounded-lg border border-border/60 bg-surface/60 p-2.5">
                    <dt className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      {r.l}
                    </dt>
                    <dd className="mt-0.5 text-[12px] leading-relaxed text-foreground">{r.v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-4 text-[9px] uppercase tracking-widest text-muted-foreground">
                모순의 연쇄
              </p>
              <ol className="mt-1.5 space-y-2">
                {truth.summary.contradictionChain.map((ch, i) => (
                  <li key={i} className="rounded-lg border border-border/60 bg-surface/50 p-2.5">
                    <p className="text-[11px] text-muted-foreground line-through decoration-muted-foreground/50">
                      {ch.claim}
                    </p>
                    <p className="mt-1 flex items-start gap-1.5 text-[12px] leading-relaxed text-foreground">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                      {ch.contradiction}
                    </p>
                  </li>
                ))}
              </ol>

              <p className="mt-4 border-l-2 border-primary/50 pl-3 text-[12px] italic leading-relaxed text-foreground/90">
                {truth.summary.closing}
              </p>
            </section>
          )}
        </div>

        <div
          className="border-t border-border/60 px-4 py-3"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          {truth && !allShown ? (
            <button
              type="button"
              onClick={() => setRevealed((r) => r + 1)}
              data-testid="reconstruction-next"
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground shadow-[var(--shadow-gold)]"
            >
              다음 장면 ({Math.min(revealed, beats.length)}/{beats.length})
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-border/70 bg-surface-elevated text-[13px] text-foreground"
            >
              결과로 돌아가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
