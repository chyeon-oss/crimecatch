import { useEffect, useRef } from "react";
import { AlertTriangle, ArrowLeft, FileText, HelpCircle, Lock, Paperclip } from "lucide-react";
import type { TranscriptEntry } from "@/types/dialogue";
import type { InterviewChoice, SuspectMood } from "@/types/interview";
import type { TopicAvailability } from "@/lib/interviewRuntime";
import { MOOD_LABEL } from "@/lib/interviewRuntime";

interface Props {
  name: string;
  role: string;
  relationship: string;
  mood: SuspectMood;
  progress: { done: number; total: number };
  contradictions: Array<{ id: string; title: string; detail: string }>;
  entries: TranscriptEntry[];
  topics: TopicAvailability[];
  choices: InterviewChoice[];
  isTyping: boolean;
  onAsk: (topicId: string) => void;
  onChoose: (choiceId: string) => void;
  onPresentEvidence: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const MOOD_TONE: Record<SuspectMood, string> = {
  calm: "border-border/60 text-muted-foreground",
  guarded: "border-primary/40 text-primary",
  shaken: "border-destructive/40 text-destructive",
};

/**
 * A single suspect interrogation room. Authored questions only — the detective
 * picks from the question list, presents evidence, and follows up on captured
 * contradictions. Never displays private canon.
 */
export function InterviewRoom({
  name,
  role,
  relationship,
  mood,
  progress,
  contradictions,
  entries,
  topics,
  choices,
  isTyping,
  onAsk,
  onChoose,
  onPresentEvidence,
  onSkip,
  onBack,
}: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, isTyping, choices.length]);

  const askable = topics.filter((t) => !t.done);

  return (
    <section className="flex min-h-full flex-col">
      {/* Profile header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="인터뷰 목록으로"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-foreground">{name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {role} · {relationship}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] tracking-wide ${MOOD_TONE[mood]}`}
          >
            {MOOD_LABEL[mood]}
          </span>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          질문 {progress.done}/{progress.total}
          {contradictions.length > 0 && ` · 모순 ${contradictions.length}`}
        </p>
      </header>

      {/* Transcript */}
      <div className="flex-1 space-y-3 px-4 py-4" onClick={onSkip} role="presentation">
        {entries.length === 0 && !isTyping && (
          <p className="py-10 text-center text-[12px] leading-relaxed text-muted-foreground">
            아직 질문하지 않았습니다.
            <br />
            아래 질문 목록에서 시작하세요.
          </p>
        )}

        {entries.map((e) => {
          if (e.kind === "CHOICE") {
            return (
              <div key={e.id} className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-[13px] leading-relaxed text-primary-foreground">
                  {e.text}
                </p>
              </div>
            );
          }
          if (e.kind === "SYSTEM") {
            const isContradiction = e.systemKind === "QUESTION";
            const Icon = isContradiction ? AlertTriangle : FileText;
            return (
              <div
                key={e.id}
                className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2.5 animate-fade-in ${
                  isContradiction
                    ? "border-destructive/35 bg-destructive/5"
                    : "border-primary/25 bg-primary/5"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    isContradiction ? "text-destructive" : "text-primary"
                  }`}
                />
                <p className="whitespace-pre-line text-[12px] leading-relaxed text-foreground/90">
                  {e.text}
                </p>
              </div>
            );
          }
          const mine = e.role === "DETECTIVE";
          return (
            <div key={e.id} className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
              <span className="px-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                {e.speaker}
              </span>
              <p
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                  mine
                    ? "rounded-br-sm border border-border/70 bg-surface-elevated text-foreground"
                    : "rounded-bl-sm border border-border/50 bg-card text-foreground"
                }`}
              >
                {e.text}
              </p>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
                style={{ animationDelay: `${i * 140}ms` }}
              />
            ))}
            <span className="ml-1 text-[10px] text-muted-foreground">
              말하는 중… (탭하면 즉시 표시)
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Action rail */}
      <div className="sticky bottom-0 space-y-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur">
        {choices.length > 0 ? (
          <>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              어떻게 대응하시겠습니까
            </p>
            {choices.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChoose(c.id)}
                className="flex min-h-[48px] w-full items-center rounded-lg border border-primary/35 bg-primary/5 px-3 py-2.5 text-left text-[13px] leading-snug text-foreground transition-colors hover:border-primary/60"
              >
                {c.text}
              </button>
            ))}
          </>
        ) : (
          <>
            {askable.length > 0 ? (
              <>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">질문</p>
                {askable.map(({ topic, available }) => (
                  <button
                    key={topic.id}
                    type="button"
                    disabled={!available || isTyping}
                    onClick={() => onAsk(topic.id)}
                    className={`flex min-h-[48px] w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] leading-snug transition-colors ${
                      available
                        ? topic.kind === "PRESSURE"
                          ? "border-destructive/40 bg-destructive/5 text-foreground hover:border-destructive/60"
                          : "border-border/70 bg-surface-elevated text-foreground hover:border-primary/40"
                        : "border-border/40 bg-background text-muted-foreground"
                    }`}
                  >
                    {topic.kind === "PRESSURE" ? (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                    ) : (
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1">{topic.label}</span>
                    {!available && <Lock className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                ))}
              </>
            ) : (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                더 물을 것이 없습니다. 증거를 제시하면 다른 반응이 나올 수 있습니다.
              </p>
            )}

            <button
              type="button"
              onClick={onPresentEvidence}
              disabled={isTyping}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 text-[13px] font-medium text-foreground transition-colors hover:border-primary/60"
            >
              <Paperclip className="h-4 w-4 text-primary" />
              증거 제시
            </button>
          </>
        )}
      </div>
    </section>
  );
}
