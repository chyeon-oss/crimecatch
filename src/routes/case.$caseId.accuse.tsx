import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Gavel,
  Users,
  Flame,
  Wrench,
  FileSearch,
  PenLine,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  X,
  Clock,
  Search,
  FileText,
  AlertTriangle,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Route as CaseRoute } from "./case.$caseId";
import { useProgress } from "@/state/progressStore";
import {
  MOTIVE_OPTIONS,
  METHOD_OPTIONS,
  type DeductionOption,
} from "@/data/deductionOptions";
import type { Case, Evidence, Suspect } from "@/types";
import { readBoard, type BoardEndpoint } from "@/lib/detectiveBoard";
import { answerKey as midnightOfficeAnswerKey } from "@/content/cases/midnight-office/_spoilers";
import {
  scoreDeduction,
  type DeductionScore,
  type DeductionRank,
} from "@/lib/deductionScoring";
import type { CaseAnswerKey } from "@/content/cases/midnight-office/_spoilers";
import type { TruthPack } from "@/types/truth";
import { midnightOfficeTruth } from "@/content/cases/midnight-office/_truth";

const CASE_ANSWER_KEYS: Record<string, CaseAnswerKey> = {
  "midnight-office": midnightOfficeAnswerKey,
};



export const Route = createFileRoute("/case/$caseId/accuse")({
  head: () => ({
    meta: [
      { title: "최종 추리 — CaseNote" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccusePage,
});

export interface DeductionPayload {
  suspectId: string;
  motiveId: string;
  methodId: string;
  evidenceId: string;
  reasoning: string;
}

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: { id: StepId; label: string; short: string }[] = [
  { id: 1, label: "범인 지목", short: "SUSPECT" },
  { id: 2, label: "동기 추리", short: "MOTIVE" },
  { id: 3, label: "범행 방법", short: "METHOD" },
  { id: 4, label: "결정적 증거", short: "EVIDENCE" },
  { id: 5, label: "추리 설명", short: "REASONING" },
  { id: 6, label: "최종 확인", short: "REVIEW" },
];

function AccusePage() {
  const { data } = CaseRoute.useLoaderData() as { data: Case };
  const progress = useProgress();

  const discoveredEvidence = useMemo<Evidence[]>(() => {
    const readIds = new Set(progress.perCaseEvidenceRead[data.id] ?? []);
    const discovered = data.evidence.filter((e) => readIds.has(e.id));
    // Fallback: if nothing tracked yet (e.g. dev navigation), allow all.
    return discovered.length ? discovered : data.evidence;
  }, [progress, data]);

  const [step, setStep] = useState<StepId>(1);
  const [suspectId, setSuspectId] = useState<string | null>(null);
  const [motiveId, setMotiveId] = useState<string | null>(null);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [submitted, setSubmitted] = useState<DeductionPayload | null>(null);
  const [result, setResult] = useState<DeductionScore | null>(null);
  const [showReconstruction, setShowReconstruction] = useState(false);

  const canAdvance: Record<StepId, boolean> = {
    1: !!suspectId,
    2: !!motiveId,
    3: !!methodId,
    4: !!evidenceId,
    5: reasoning.trim().length >= 10,
    6: true,
  };

  const goNext = () => setStep((s) => (s < 6 ? ((s + 1) as StepId) : s));
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepId) : s));

  const submit = (payload: DeductionPayload) => {
    if (import.meta.env.DEV) console.log("[deduction] submit", payload);
    const key = CASE_ANSWER_KEYS[data.id] ?? CASE_ANSWER_KEYS[data.slug];
    if (key) {
      const board = readBoard(data.id);
      setResult(
        scoreDeduction(
          {
            suspectId: payload.suspectId,
            motiveId: payload.motiveId,
            methodId: payload.methodId,
            evidenceId: payload.evidenceId,
            connections: board.connections,
          },
          key,
        ),
      );
    } else {
      setResult(null);
    }
    setSubmitted(payload);
  };

  const handleSubmit = () => {
    if (!suspectId || !motiveId || !methodId || !evidenceId) return;
    submit({
      suspectId,
      motiveId,
      methodId,
      evidenceId,
      reasoning: reasoning.trim(),
    });
  };


  const suspectById = (id: string | null) =>
    data.suspects.find((s) => s.id === id) ?? null;
  const optionById = (list: DeductionOption[], id: string | null) =>
    list.find((o) => o.id === id) ?? null;
  const evidenceByIdLocal = (id: string | null) =>
    data.evidence.find((e) => e.id === id) ?? null;

  if (submitted) {
    return (
      <>
        <SubmittedScreen
          case={data}
          payload={submitted}
          suspect={suspectById(submitted.suspectId)}
          motive={optionById(MOTIVE_OPTIONS, submitted.motiveId)}
          method={optionById(METHOD_OPTIONS, submitted.methodId)}
          evidence={evidenceByIdLocal(submitted.evidenceId)}
          result={result}
          onOpenReconstruction={() => setShowReconstruction(true)}
        />
        {showReconstruction && (
          <ReconstructionModal
            case={data}
            payload={submitted}
            result={result}
            discoveredEvidence={discoveredEvidence}
            onClose={() => setShowReconstruction(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen noir-grain">
      <TopBar to="/case/$caseId/investigate" label="수사로 돌아가기" />

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
        <header className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            <Gavel className="h-6 w-6" />
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-primary/80">
            FINAL DEDUCTION
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            최종 추리
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            당신의 모든 수사는 이 순간을 위한 것이었습니다.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">{data.title}</p>
        </header>

        <StepRail current={step} />

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-noir)] sm:p-8">
          {step === 1 && (
            <StepShell
              icon={Users}
              eyebrow="Step 01"
              title="범인은 누구입니까?"
              subtitle="현재까지 수집한 정보를 바탕으로 한 명을 지목하세요."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {data.suspects.map((s) => (
                  <SelectCard
                    key={s.id}
                    selected={suspectId === s.id}
                    onSelect={() => setSuspectId(s.id)}
                    title={s.name}
                    eyebrow={s.occupation}
                    body={s.relationship}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              icon={Flame}
              eyebrow="Step 02"
              title="범행의 동기는 무엇이었습니까?"
              subtitle="사람을 움직이게 한 감정을 짚어내야 합니다."
            >
              <OptionGrid
                options={MOTIVE_OPTIONS}
                selectedId={motiveId}
                onSelect={setMotiveId}
              />
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              icon={Wrench}
              eyebrow="Step 03"
              title="범행은 어떻게 이루어졌습니까?"
              subtitle="현장의 흔적이 향하는 하나의 방법을 선택하세요."
            >
              <OptionGrid
                options={METHOD_OPTIONS}
                selectedId={methodId}
                onSelect={setMethodId}
              />
            </StepShell>
          )}

          {step === 4 && (
            <StepShell
              icon={FileSearch}
              eyebrow="Step 04"
              title="가장 결정적인 증거는 무엇입니까?"
              subtitle="지금까지 확보한 증거 중 단 하나만 선택할 수 있습니다."
            >
              {discoveredEvidence.length === 0 ? (
                <EmptyEvidence />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {discoveredEvidence.map((e) => (
                    <SelectCard
                      key={e.id}
                      selected={evidenceId === e.id}
                      onSelect={() => setEvidenceId(e.id)}
                      title={e.title}
                      eyebrow={e.category}
                      body={e.summary}
                    />
                  ))}
                </div>
              )}
            </StepShell>
          )}

          {step === 5 && (
            <StepShell
              icon={PenLine}
              eyebrow="Step 05"
              title="당신의 추리를 설명하세요."
              subtitle="선택한 증거가 어떻게 범인을 가리키는지 서술하세요."
            >
              <BoardConnectionsRecall case={data} />
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="왜 이 사람이 범인이라고 생각했습니까?"
                rows={8}
                className="w-full resize-none rounded-xl border border-border bg-surface-elevated/60 p-4 font-serif text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                최소 10자 이상 작성해 주세요. ({reasoning.trim().length}자)
              </p>
            </StepShell>
          )}

          {step === 6 && (
            <StepShell
              icon={CheckCircle2}
              eyebrow="Step 06"
              title="최종 확인"
              subtitle="아래 내용을 확인하고 결론을 제출하세요."
            >
              <SummaryList
                rows={[
                  {
                    label: "범인",
                    value: suspectById(suspectId)?.name ?? "—",
                    hint: suspectById(suspectId)?.occupation,
                  },
                  {
                    label: "동기",
                    value: optionById(MOTIVE_OPTIONS, motiveId)?.label ?? "—",
                    hint: optionById(MOTIVE_OPTIONS, motiveId)?.description,
                  },
                  {
                    label: "범행 방법",
                    value: optionById(METHOD_OPTIONS, methodId)?.label ?? "—",
                    hint: optionById(METHOD_OPTIONS, methodId)?.description,
                  },
                  {
                    label: "결정적 증거",
                    value: evidenceByIdLocal(evidenceId)?.title ?? "—",
                    hint: evidenceByIdLocal(evidenceId)?.summary,
                  },
                  {
                    label: "추리 설명",
                    value: reasoning.trim() || "—",
                    multiline: true,
                  },
                ]}
              />
            </StepShell>
          )}

          <footer className="mt-8 flex items-center justify-between gap-3 border-t border-border/60 pt-5">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              이전
            </button>

            {step < 6 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance[step]}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                다음
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01]"
              >
                <Gavel className="h-4 w-4" />
                최종 제출
              </button>
            )}
          </footer>
        </section>
      </main>
    </div>
  );
}

/* ---------- sub-components ---------- */

function StepRail({ current }: { current: StepId }) {
  return (
    <ol className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.22em]">
      {STEPS.map((s, i) => {
        const isActive = s.id === current;
        const isDone = s.id < current;
        return (
          <li key={s.id} className="flex items-center gap-3">
            <div
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors",
                isActive
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : isDone
                    ? "border-primary/25 bg-primary/5 text-primary/80"
                    : "border-border/60 bg-surface text-muted-foreground/70",
              ].join(" ")}
            >
              {isDone ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <span className="font-mono">{String(s.id).padStart(2, "0")}</span>
              )}
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="h-px w-4 bg-border/70" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepShell({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">
            {eyebrow}
          </p>
          <h2 className="mt-0.5 font-display text-xl text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SelectCard({
  selected,
  onSelect,
  title,
  eyebrow,
  body,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  eyebrow?: string;
  body?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary/60 bg-primary/10 shadow-[var(--shadow-gold)]"
          : "border-border bg-surface-elevated/60 hover:border-border/80 hover:bg-surface-elevated",
      ].join(" ")}
    >
      {eyebrow && (
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <p className="font-display text-base text-foreground">{title}</p>
      {body && (
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}
      {selected && (
        <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

function OptionGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: DeductionOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => (
        <SelectCard
          key={o.id}
          selected={selectedId === o.id}
          onSelect={() => onSelect(o.id)}
          title={o.label}
          body={o.description}
        />
      ))}
    </div>
  );
}

function EmptyEvidence() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-surface-elevated/50 py-10 text-center">
      <Lock className="h-5 w-5 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">
        아직 확보한 증거가 없습니다. 수사로 돌아가 증거를 먼저 확보하세요.
      </p>
    </div>
  );
}

function SummaryList({
  rows,
}: {
  rows: {
    label: string;
    value: string;
    hint?: string;
    multiline?: boolean;
  }[];
}) {
  return (
    <dl className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-surface-elevated/40">
      {rows.map((r) => (
        <div key={r.label} className="grid gap-1 p-4 sm:grid-cols-[140px_1fr] sm:gap-4">
          <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {r.label}
          </dt>
          <dd className="min-w-0">
            <p
              className={[
                "text-sm text-foreground",
                r.multiline ? "whitespace-pre-wrap font-serif leading-relaxed" : "font-medium",
              ].join(" ")}
            >
              {r.value}
            </p>
            {r.hint && !r.multiline && (
              <p className="mt-0.5 text-xs text-muted-foreground">{r.hint}</p>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SubmittedScreen({
  case: c,
  payload,
  suspect,
  motive,
  method,
  evidence,
  result,
  onOpenReconstruction,
}: {
  case: Case;
  payload: DeductionPayload;
  suspect: Suspect | null;
  motive: DeductionOption | null;
  method: DeductionOption | null;
  evidence: Evidence | null;
  result: DeductionScore | null;
  onOpenReconstruction: () => void;
}) {
  return (
    <div className="min-h-screen noir-grain">
      <TopBar to="/case/$caseId/investigate" label="수사로 돌아가기" />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-12">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-primary/80">
            Deduction Result
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
            추리 결과
          </h1>
          <p className="mt-1 text-xs text-muted-foreground/80">{c.title}</p>
        </div>

        {result && <ResultCard result={result} />}

        <div className="mt-8 text-left">
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            제출한 답안
          </p>
          <SummaryList
            rows={[
              { label: "범인", value: suspect?.name ?? payload.suspectId, hint: suspect?.occupation },
              { label: "동기", value: motive?.label ?? payload.motiveId, hint: motive?.description },
              { label: "범행 방법", value: method?.label ?? payload.methodId, hint: method?.description },
              { label: "결정적 증거", value: evidence?.title ?? payload.evidenceId, hint: evidence?.summary },
              { label: "추리 설명", value: payload.reasoning || "—", multiline: true },
            ]}
          />
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onOpenReconstruction}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01]"
          >
            <FileSearch className="h-4 w-4" />
            사건 재구성 보기
          </button>
          <p className="text-[11px] text-muted-foreground/70">
            전체 진실 재구성은 다음 챕터에서 공개됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}

const RANK_TONE: Record<DeductionRank, string> = {
  S: "border-amber-400/50 bg-amber-500/10 text-amber-200",
  A: "border-emerald-400/50 bg-emerald-500/10 text-emerald-200",
  B: "border-sky-400/50 bg-sky-500/10 text-sky-200",
  C: "border-rose-400/50 bg-rose-500/10 text-rose-200",
};

function ResultCard({ result }: { result: DeductionScore }) {
  const { score, rank, feedback, breakdown } = result;
  const rows: { label: string; earned: number; max: number; extra?: string }[] = [
    { label: "범인 지목", earned: breakdown.suspect.earned, max: breakdown.suspect.max },
    { label: "동기", earned: breakdown.motive.earned, max: breakdown.motive.max },
    { label: "범행 방법", earned: breakdown.method.earned, max: breakdown.method.max },
    { label: "결정적 증거", earned: breakdown.evidence.earned, max: breakdown.evidence.max },
    {
      label: "추리 보드 연결",
      earned: breakdown.connections.earned,
      max: breakdown.connections.max,
      extra: `${breakdown.connections.matched}/${breakdown.connections.required} 연결`,
    },
  ];
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-noir)]">
      <div className="flex items-center gap-5">
        <div
          className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl border font-display text-4xl ${RANK_TONE[rank]}`}
        >
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Final Score
          </p>
          <p className="mt-1 font-display text-4xl font-semibold text-foreground tabular-nums">
            {score}
            <span className="ml-1 text-sm text-muted-foreground">/ 100</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {feedback}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-1.5">
        {rows.map((r) => {
          const pct = r.max === 0 ? 0 : (r.earned / r.max) * 100;
          return (
            <li key={r.label} className="rounded-lg border border-border/60 bg-surface-elevated/40 p-3">
              <div className="flex items-baseline justify-between gap-3 text-[12px]">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="tabular-nums text-foreground">
                  {r.earned}
                  <span className="text-muted-foreground/70"> / {r.max}</span>
                  {r.extra && (
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground/70">
                      {r.extra}
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border/50">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const BEAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pre: Clock,
  meeting: Users,
  gap: FileSearch,
  scene: Search,
  final: CheckCircle2,
};

/** Truth Packs are spoiler content — keyed here, used only after submission. */
const CASE_TRUTH_PACKS: Record<string, TruthPack> = {
  "midnight-office": midnightOfficeTruth,
};

function ReconstructionModal({
  case: c,
  payload,
  result,
  discoveredEvidence,
  onClose,
}: {
  case: Case;
  payload: DeductionPayload | null;
  result: DeductionScore | null;
  discoveredEvidence: Evidence[];
  onClose: () => void;
}) {
  const safePayload = payload ?? {
    suspectId: "",
    motiveId: "",
    methodId: "",
    evidenceId: "",
    reasoning: "",
  };

  const suspect = c.suspects.find((s) => s.id === safePayload.suspectId) ?? null;
  const motive = MOTIVE_OPTIONS.find((o) => o.id === safePayload.motiveId) ?? null;
  const method = METHOD_OPTIONS.find((o) => o.id === safePayload.methodId) ?? null;
  const evidence = c.evidence.find((e) => e.id === safePayload.evidenceId) ?? null;

  const truth = CASE_TRUTH_PACKS[c.id] ?? CASE_TRUTH_PACKS[c.slug] ?? null;
  const discoveredIds = useMemo(
    () => new Set(discoveredEvidence.map((e) => e.id)),
    [discoveredEvidence],
  );
  const titleOf = (id: string) =>
    c.evidence.find((e) => e.id === id)?.title ?? id;

  const correct = truth
    ? safePayload.suspectId === truth.summary.culpritId
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-noir)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-border/60 bg-gradient-to-br from-surface-elevated to-black/50 p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
                CASE RECONSTRUCTION
              </p>
              <h2 className="mt-1 font-display text-2xl text-foreground">
                {correct === null
                  ? "사건 재구성"
                  : correct
                    ? "진실 규명"
                    : "사건 재검토 필요"}
              </h2>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                {correct === null
                  ? "사건의 흐름을 다시 정리합니다."
                  : correct
                    ? "당신의 지목은 사실과 일치했습니다. 사건의 실제 순서를 확인하십시오."
                    : "지목한 인물은 범인이 아니었습니다. 아래는 사건의 실제 순서입니다."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          {truth && (
            <section>
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/60" />
                <ul className="space-y-6">
                  {truth.beats.map((beat) => {
                    const Icon = BEAT_ICONS[beat.id] ?? Clock;
                    const chips = beat.evidenceIds.filter((id) =>
                      discoveredIds.has(id),
                    );
                    return (
                      <li key={beat.id} className="relative flex gap-5">
                        <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-surface-elevated/40 p-4">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                              BEAT {String(beat.order).padStart(2, "0")}
                            </span>
                            <span className="text-[11px] tabular-nums text-primary/80">
                              {beat.time}
                            </span>
                            <span className="text-[11px] text-muted-foreground/80">
                              {beat.location}
                            </span>
                          </div>
                          <h3 className="mt-1 font-display text-lg text-foreground">
                            {beat.order}. {beat.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {beat.body}
                          </p>
                          {chips.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {chips.map((id) => (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface px-2 py-1 text-[11px] text-muted-foreground"
                                >
                                  <FileText className="h-3 w-3" />
                                  {titleOf(id)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          )}

          {truth && (
            <section className="rounded-xl border border-primary/30 bg-primary/[0.04] p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
                FINAL TRUTH
              </p>
              <h3 className="mt-1 font-display text-xl text-foreground">
                사건의 진실
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <TruthRow label="범인" value={truth.summary.culpritName} />
                <TruthRow label="범행 시각" value={truth.summary.murderWindow} />
                <TruthRow label="동기" value={truth.summary.motive} />
                <TruthRow label="범행 방법" value={truth.summary.method} />
              </div>
              <div className="mt-3 rounded-md border border-border/60 bg-surface/60 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  밀실이 만들어진 방법
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                  {truth.summary.lockedRoomTrick}
                </p>
              </div>

              <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                모순의 연쇄
              </p>
              <ol className="mt-2 space-y-2">
                {truth.summary.contradictionChain.map((ch, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-border/60 bg-surface/50 p-3"
                  >
                    <p className="text-[12px] text-muted-foreground line-through decoration-muted-foreground/50">
                      {ch.claim}
                    </p>
                    <p className="mt-1 flex items-start gap-1.5 text-[13px] leading-relaxed text-foreground">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                      {ch.contradiction}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ch.evidenceIds.map((id) => (
                        <span
                          key={id}
                          className="rounded border border-border/60 bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {titleOf(id)}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-5 border-l-2 border-primary/50 pl-3 text-sm italic leading-relaxed text-foreground/90">
                {truth.summary.closing}
              </p>
            </section>
          )}


          <section className="rounded-xl border border-border/60 bg-surface-elevated/40 p-5">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-primary/80">
              <AlertTriangle className="h-3.5 w-3.5" />
              당신의 추리 결과
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border/60 bg-surface/60 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">지목한 용의자</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {suspect?.name ?? "미지정"}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-surface/60 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">선택한 동기</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {motive?.label ?? "미지정"}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-surface/60 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">선택한 방법</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {method?.label ?? "미지정"}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-surface/60 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">결정적 증거</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {evidence?.title ?? "미지정"}
                </p>
              </div>
            </div>
            {result && (
              <div className="mt-4 flex items-center gap-4 rounded-md border border-primary/30 bg-primary/5 p-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-primary/40 font-display text-xl text-primary">
                  {result.rank}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">최종 점수</p>
                  <p className="font-display text-lg text-foreground tabular-nums">
                    {result.score}<span className="text-sm text-muted-foreground">/100</span>
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="border-t border-border/60 p-5">
          <Link
            to="/case/$caseId"
            params={{ caseId: c.slug }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01]"
          >
            <FolderOpen className="h-4 w-4" />
            사건 파일로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}



function BoardConnectionsRecall({ case: c }: { case: Case }) {
  const board = useMemo(() => readBoard(c.id), [c.id]);
  if (board.connections.length === 0) return null;

  const labelOf = (ep: BoardEndpoint): string => {
    if (ep.kind === "evidence")
      return c.evidence.find((e) => e.id === ep.id)?.title ?? "(증거)";
    if (ep.kind === "suspect")
      return c.suspects.find((s) => s.id === ep.id)?.name ?? "(용의자)";
    return c.questions?.find((q) => q.id === ep.id)?.text ?? "(질문)";
  };

  return (
    <div className="mb-4 rounded-xl border border-border/60 bg-surface-elevated/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">
        추리 보드 · {board.connections.length}개 연결
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        수사 중 직접 이어둔 관계입니다. 이 흐름을 근거로 삼아 서술해도 좋습니다.
      </p>
      <ul className="mt-3 space-y-1.5">
        {board.connections.map((con) => (
          <li
            key={con.id}
            className="rounded-md border border-border/50 bg-surface/50 px-2.5 py-1.5 text-[12px] text-foreground"
          >
            <span className="text-muted-foreground">{labelOf(con.from)}</span>
            <span className="mx-1.5 text-primary/70">→</span>
            <span className="text-muted-foreground">{labelOf(con.to)}</span>
            {con.memo && (
              <span className="mt-0.5 block text-[11px] italic text-muted-foreground/80">
                “{con.memo}”
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

