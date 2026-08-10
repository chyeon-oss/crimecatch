import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileSearch,
  Flame,
  Gavel,
  Link2,
  Lock,
  Users,
  Wrench,
} from "lucide-react";
import { MOTIVE_OPTIONS, METHOD_OPTIONS, type DeductionOption } from "@/data/deductionOptions";
import {
  emptyDraft,
  loadDraft,
  saveDraft,
  type DeductionDraft,
} from "@/lib/deductionDraft";

export interface DeductionSelection {
  suspectId: string;
  motiveId: string;
  methodId: string;
  evidenceId: string;
}

export interface FlowSuspect {
  id: string;
  name: string;
  occupation: string;
  relationship: string;
}

export interface FlowEvidence {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface FlowConnection {
  id: string;
  from: string;
  to: string;
  memo?: string;
}

interface Props {
  caseId: string;
  suspects: FlowSuspect[];
  /** Only evidence the detective discovered AND read. */
  evidence: FlowEvidence[];
  connections: FlowConnection[];
  onSubmit: (selection: DeductionSelection) => void;
}

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: "범인" },
  { id: 2, label: "동기" },
  { id: 3, label: "방법" },
  { id: 4, label: "증거" },
  { id: 5, label: "연결" },
  { id: 6, label: "확인" },
];

const STEP_META: Record<
  StepId,
  { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }
> = {
  1: {
    icon: Users,
    title: "범인은 누구입니까?",
    subtitle: "지금까지 들은 진술과 확보한 증거를 근거로 한 명만 지목하세요.",
  },
  2: {
    icon: Flame,
    title: "동기는 무엇이었습니까?",
    subtitle: "사람을 움직인 감정을 하나 고르세요.",
  },
  3: {
    icon: Wrench,
    title: "범행은 어떻게 이루어졌습니까?",
    subtitle: "현장의 흔적이 향하는 방법을 고르세요.",
  },
  4: {
    icon: FileSearch,
    title: "결정적 증거는 무엇입니까?",
    subtitle: "읽어서 내용을 확인한 증거만 선택할 수 있습니다.",
  },
  5: {
    icon: Link2,
    title: "추리 보드 연결 검토",
    subtitle: "직접 이어둔 관계를 마지막으로 확인하세요.",
  },
  6: {
    icon: CheckCircle2,
    title: "최종 확인",
    subtitle: "아래 결론을 제출하면 수사가 종결됩니다.",
  },
};

/**
 * Scene 04 — mobile, one-decision-per-screen final deduction.
 * Selections are persisted as a draft so a reload resumes the same step.
 */
export function DeductionFlow({ caseId, suspects, evidence, connections, onSubmit }: Props) {
  const [draft, setDraft] = useState<DeductionDraft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const stored = loadDraft(caseId);
    if (stored) setDraft(stored);
    setHydrated(true);
  }, [caseId]);

  useEffect(() => {
    if (!hydrated) return;
    saveDraft(caseId, draft);
  }, [caseId, draft, hydrated]);

  const step = Math.min(6, Math.max(1, draft.step)) as StepId;
  const patch = (p: Partial<DeductionDraft>) => setDraft((d) => ({ ...d, ...p }));

  const readableIds = useMemo(() => new Set(evidence.map((e) => e.id)), [evidence]);
  const evidenceId = draft.evidenceId && readableIds.has(draft.evidenceId) ? draft.evidenceId : null;

  const complete: Record<StepId, boolean> = {
    1: !!draft.suspectId,
    2: !!draft.motiveId,
    3: !!draft.methodId,
    4: !!evidenceId,
    5: true,
    6: true,
  };
  const allSet = complete[1] && complete[2] && complete[3] && complete[4];

  const suspect = suspects.find((s) => s.id === draft.suspectId) ?? null;
  const motive = MOTIVE_OPTIONS.find((o) => o.id === draft.motiveId) ?? null;
  const method = METHOD_OPTIONS.find((o) => o.id === draft.methodId) ?? null;
  const decisive = evidence.find((e) => e.id === evidenceId) ?? null;

  const meta = STEP_META[step];
  const Icon = meta.icon;

  const goNext = () => patch({ step: Math.min(6, step + 1) });
  const goBack = () => patch({ step: Math.max(1, step - 1) });

  const doSubmit = () => {
    if (submittedRef.current) return;
    if (!draft.suspectId || !draft.motiveId || !draft.methodId || !evidenceId) return;
    submittedRef.current = true;
    setConfirming(false);
    onSubmit({
      suspectId: draft.suspectId,
      motiveId: draft.motiveId,
      methodId: draft.methodId,
      evidenceId,
    });
  };

  return (
    <section className="px-4 py-4 pb-8">
      {/* progress rail */}
      <ol className="flex items-center gap-1.5">
        {STEPS.map((s) => {
          const state = s.id === step ? "active" : s.id < step ? "done" : "todo";
          return (
            <li key={s.id} className="min-w-0 flex-1">
              <div
                className={`h-1 rounded-full ${
                  state === "todo" ? "bg-border/60" : "bg-primary"
                } ${state === "active" ? "opacity-100" : "opacity-70"}`}
              />
              <p
                className={`mt-1 truncate text-center text-[9px] tracking-wide ${
                  state === "todo" ? "text-muted-foreground/70" : "text-primary"
                }`}
              >
                {s.label}
              </p>
            </li>
          );
        })}
      </ol>

      <header className="mt-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/35 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
            STEP {String(step).padStart(2, "0")} / 06
          </p>
          <h2 className="mt-0.5 font-display text-[17px] leading-snug text-foreground">
            {meta.title}
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{meta.subtitle}</p>
        </div>
      </header>

      <div className="mt-4 space-y-2">
        {step === 1 &&
          suspects.map((s) => (
            <PickRow
              key={s.id}
              selected={draft.suspectId === s.id}
              onSelect={() => patch({ suspectId: s.id })}
              title={s.name}
              eyebrow={s.occupation}
              body={s.relationship}
            />
          ))}

        {step === 2 && (
          <OptionRows
            options={MOTIVE_OPTIONS}
            selectedId={draft.motiveId}
            onSelect={(id) => patch({ motiveId: id })}
          />
        )}

        {step === 3 && (
          <OptionRows
            options={METHOD_OPTIONS}
            selectedId={draft.methodId}
            onSelect={(id) => patch({ methodId: id })}
          />
        )}

        {step === 4 &&
          (evidence.length === 0 ? (
            <EmptyPanel text="읽어서 확인한 증거가 없습니다. 사건파일에서 증거를 열어 내용을 확인하세요." />
          ) : (
            evidence.map((e) => (
              <PickRow
                key={e.id}
                selected={evidenceId === e.id}
                onSelect={() => patch({ evidenceId: e.id })}
                title={e.title}
                eyebrow={e.category}
                body={e.summary}
              />
            ))
          ))}

        {step === 5 &&
          (connections.length === 0 ? (
            <EmptyPanel text="추리 보드에 연결한 관계가 없습니다. 이대로 제출해도 되지만, 연결이 있으면 결론이 더 단단해집니다." />
          ) : (
            <ul className="space-y-2">
              {connections.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-border/60 bg-surface-elevated/50 px-3 py-2.5 text-[12px]"
                >
                  <p className="text-foreground">
                    <span className="text-muted-foreground">{c.from}</span>
                    <span className="mx-1.5 text-primary/70">→</span>
                    <span className="text-muted-foreground">{c.to}</span>
                  </p>
                  {c.memo && (
                    <p className="mt-1 text-[11px] italic text-muted-foreground/80">“{c.memo}”</p>
                  )}
                </li>
              ))}
            </ul>
          ))}

        {step === 6 && (
          <dl className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-surface-elevated/40">
            {[
              { label: "범인", value: suspect?.name, hint: suspect?.occupation },
              { label: "동기", value: motive?.label, hint: motive?.description },
              { label: "범행 방법", value: method?.label, hint: method?.description },
              { label: "결정적 증거", value: decisive?.title, hint: decisive?.category },
              {
                label: "보드 연결",
                value: `${connections.length}개 연결`,
                hint: undefined,
              },
            ].map((r) => (
              <div key={r.label} className="px-3 py-2.5">
                <dt className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  {r.label}
                </dt>
                <dd className="mt-0.5 text-[13px] font-medium text-foreground">
                  {r.value ?? "미선택"}
                </dd>
                {r.hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{r.hint}</p>}
              </div>
            ))}
          </dl>
        )}

        {step === 6 && !allSet && (
          <p className="flex items-start gap-1.5 rounded-lg border border-destructive/35 bg-destructive/5 px-3 py-2.5 text-[11px] leading-relaxed text-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
            아직 선택하지 않은 항목이 있습니다. 이전 단계로 돌아가 모두 선택하세요.
          </p>
        )}
      </div>

      {/* step controls */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-surface-elevated text-[13px] text-foreground disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          이전
        </button>
        {step < 6 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!complete[step]}
            className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-40 disabled:shadow-none"
          >
            다음
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!allSet}
            className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-40 disabled:shadow-none"
          >
            <Gavel className="h-4 w-4" />
            최종 제출
          </button>
        )}
      </div>

      {!complete[step] && step < 6 && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          이 단계의 선택을 완료하면 다음으로 넘어갈 수 있습니다.
        </p>
      )}

      {confirming && (
        <div className="fixed inset-0 z-[55] flex items-end justify-center">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setConfirming(false)}
            className="absolute inset-0 bg-background/85 backdrop-blur-sm"
          />
          <div
            className="animate-fade-in relative w-full max-w-[460px] rounded-t-2xl border border-primary/40 bg-card p-5"
            style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}
            role="dialog"
            aria-modal="true"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">FINAL CHECK</p>
            <h3 className="mt-1 font-display text-[17px] text-foreground">
              제출 후 사건의 진실이 공개됩니다
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              {suspect?.name ?? "—"} · {motive?.label ?? "—"} · {method?.label ?? "—"} 으로 결론을
              제출합니다. 제출하면 되돌릴 수 없습니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="min-h-[48px] rounded-lg border border-border/70 bg-surface-elevated text-[13px] text-foreground"
              >
                더 조사하기
              </button>
              <button
                type="button"
                onClick={doSubmit}
                className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground shadow-[var(--shadow-gold)]"
              >
                <Check className="h-4 w-4" />
                제출합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PickRow({
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
      className={`relative flex min-h-[56px] w-full flex-col items-start gap-1 rounded-xl border px-3.5 py-3 pr-10 text-left transition-colors ${
        selected
          ? "border-primary/60 bg-primary/10"
          : "border-border/60 bg-surface-elevated/60 hover:border-border"
      }`}
    >
      {eyebrow && (
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </span>
      )}
      <span className="text-[13px] font-medium text-foreground">{title}</span>
      {body && (
        <span className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {body}
        </span>
      )}
      {selected && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

function OptionRows({
  options,
  selectedId,
  onSelect,
}: {
  options: DeductionOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {options.map((o) => (
        <PickRow
          key={o.id}
          selected={selectedId === o.id}
          onSelect={() => onSelect(o.id)}
          title={o.label}
          body={o.description}
        />
      ))}
    </>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed border-border/60 bg-surface-elevated/50 px-3 py-4 text-[11px] leading-relaxed text-muted-foreground">
      <Lock className="mt-0.5 h-4 w-4 shrink-0" />
      {text}
    </div>
  );
}
