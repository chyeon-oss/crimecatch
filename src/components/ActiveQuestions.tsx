import { useEffect, useRef, useState } from "react";
import { HelpCircle, CheckCircle2, Sparkles } from "lucide-react";
import type { Case } from "@/types";
import { IntelligenceEngine, type IntelligenceState } from "@/engine";

interface Props {
  case: Case;
  state: IntelligenceState;
}

const SUBTITLE_POOL = [
  "이 질문은 아직 답이 없습니다.",
  "관련 증거를 더 확인해야 합니다.",
  "다른 단서와 연결해볼 필요가 있습니다.",
];

function subtitleFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return SUBTITLE_POOL[h % SUBTITLE_POOL.length];
}

export function ActiveQuestions({ case: c, state }: Props) {
  const items = IntelligenceEngine.visibleQuestions(c, state);
  const evidenceById = new Map((c.evidence ?? []).map((e) => [e.id, e]));

  const prevIdsRef = useRef<Set<string> | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Set<string>>(new Set());
  const seenRef = useRef<Set<string>>(new Set());
  const [sessionNew, setSessionNew] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentActiveIds = new Set(
      items.filter((i) => i.status === "active").map((i) => i.question.id),
    );
    const prev = prevIdsRef.current;

    if (prev === null) {
      // First mount — treat as already seen (don't badge everything).
      currentActiveIds.forEach((id) => seenRef.current.add(id));
    } else {
      const fresh = new Set<string>();
      currentActiveIds.forEach((id) => {
        if (!prev.has(id) && !seenRef.current.has(id)) {
          fresh.add(id);
          seenRef.current.add(id);
        }
      });
      if (fresh.size > 0) {
        setNewlyUnlocked(fresh);
        setSessionNew((cur) => {
          const next = new Set(cur);
          fresh.forEach((id) => next.add(id));
          return next;
        });
        const t = setTimeout(() => setNewlyUnlocked(new Set()), 1600);
        prevIdsRef.current = currentActiveIds;
        return () => clearTimeout(t);
      }
    }
    prevIdsRef.current = currentActiveIds;
  }, [items]);

  const active = items.filter((i) => i.status === "active");
  const solved = items.filter((i) => i.status === "solved");

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          현재 남은 의문
        </h3>
        {active.length > 0 && (
          <span className="text-[10px] tabular-nums text-muted-foreground/70">
            {active.length}건 진행 중
          </span>
        )}
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 py-8 text-center">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            아직 명확한 의문은 없습니다. 현장을 더 조사하세요.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {active.map(({ question }, idx) => {
            const justUnlocked = newlyUnlocked.has(question.id);
            const isNewSession = sessionNew.has(question.id);
            const relatedId = question.generatedByEvidenceIds?.find((id) =>
              evidenceById.has(id),
            );
            const related = relatedId ? evidenceById.get(relatedId) : undefined;
            return (
              <li
                key={question.id}
                style={
                  justUnlocked
                    ? { animationDelay: `${idx * 120}ms` }
                    : undefined
                }
                className={
                  "rounded-lg border border-primary/25 bg-primary/5 p-3 " +
                  (justUnlocked ? "cc-question-unlock" : "")
                }
              >
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-primary/80">
                        Active
                      </span>
                      {isNewSession && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-widest text-primary">
                          <Sparkles className="h-2.5 w-2.5" />
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm leading-snug text-foreground">
                      {question.text}
                    </p>
                    <p className="mt-1 text-[11px] italic text-muted-foreground/80">
                      {subtitleFor(question.id)}
                    </p>
                    {related && (
                      <p className="mt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                        관련 증거 · <span className="normal-case tracking-normal text-muted-foreground">{related.title}</span>
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {solved.length > 0 && (
        <div className="pt-1">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            해결된 의문
          </p>
          <ul className="space-y-1.5">
            {solved.map(({ question }) => {
              const relatedId = question.generatedByEvidenceIds?.find((id) =>
                evidenceById.has(id),
              );
              const related = relatedId ? evidenceById.get(relatedId) : undefined;
              return (
                <li
                  key={question.id}
                  className="flex items-start gap-2 rounded-lg border border-border/50 bg-surface-elevated/40 p-2.5 opacity-80"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Solved
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-through">
                      {question.text}
                    </p>
                    {related && (
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        관련 증거 · <span className="normal-case tracking-normal">{related.title}</span>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
