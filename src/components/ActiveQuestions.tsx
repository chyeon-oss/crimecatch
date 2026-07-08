import { useEffect, useRef, useState } from "react";
import { HelpCircle, CheckCircle2 } from "lucide-react";
import type { Case } from "@/types";
import { IntelligenceEngine, type IntelligenceState } from "@/engine";

interface Props {
  case: Case;
  state: IntelligenceState;
}

export function ActiveQuestions({ case: c, state }: Props) {
  const items = IntelligenceEngine.visibleQuestions(c, state);
  const prevIdsRef = useRef<Set<string> | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentActiveIds = new Set(
      items.filter((i) => i.status === "active").map((i) => i.question.id),
    );
    const prev = prevIdsRef.current;
    if (prev) {
      const fresh = new Set<string>();
      currentActiveIds.forEach((id) => {
        if (!prev.has(id)) fresh.add(id);
      });
      if (fresh.size > 0) {
        setNewlyUnlocked(fresh);
        const t = setTimeout(() => setNewlyUnlocked(new Set()), 1400);
        prevIdsRef.current = currentActiveIds;
        return () => clearTimeout(t);
      }
    }
    prevIdsRef.current = currentActiveIds;
  }, [items]);


  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 py-8 text-center">
        <HelpCircle className="h-5 w-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          현장을 조사하면 새로운 의문이 떠오릅니다.
        </p>
      </div>
    );
  }

  const active = items.filter((i) => i.status === "active");
  const solved = items.filter((i) => i.status === "solved");

  return (
    <div className="space-y-3">
      {active.length > 0 && (
        <ul className="space-y-2">
          {active.map(({ question }) => {
            const isNew = newlyUnlocked.has(question.id);
            return (
              <li
                key={question.id}
                className={
                  "flex items-start gap-2.5 rounded-lg border border-primary/25 bg-primary/5 p-3 " +
                  (isNew ? "cc-question-unlock" : "")
                }
              >
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-primary/80">
                    {isNew ? "New Question" : "Question"}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{question.text}</p>
                </div>
              </li>
            );
          })}

        </ul>
      )}

      {solved.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            해결된 의문
          </p>
          <ul className="space-y-1.5">
            {solved.map(({ question }) => (
              <li
                key={question.id}
                className="flex items-start gap-2 rounded-lg border border-border/50 bg-surface-elevated/40 p-2.5"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                <p className="text-xs text-muted-foreground line-through">
                  {question.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
