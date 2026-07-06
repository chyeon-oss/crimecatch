import { useState } from "react";
import { Plus, X, Lightbulb } from "lucide-react";
import type { BoardState, Theory, TheoryConfidence } from "@/types";
import { BoardEngine } from "@/engine";

interface Props {
  state: BoardState;
  onChange: (next: BoardState) => void;
}

const CONF_META: Record<
  TheoryConfidence,
  { label: string; className: string }
> = {
  LOW: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border/60",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  },
  HIGH: {
    label: "High",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  },
};

export function TheoriesPanel({ state, onChange }: Props) {
  const [drafting, setDrafting] = useState(false);
  const [title, setTitle] = useState("");
  const [confidence, setConfidence] = useState<TheoryConfidence>("MEDIUM");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setTitle("");
    setConfidence("MEDIUM");
    setNotes("");
    setDrafting(false);
  };

  const submit = () => {
    if (!title.trim() && !notes.trim()) {
      setDrafting(false);
      return;
    }
    onChange(BoardEngine.addTheory(state, { title, confidence, notes }));
    reset();
  };

  return (
    <div className="space-y-3">
      {state.theories.length === 0 && !drafting && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 py-8 text-center">
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            수사 중 떠오르는 가설을 정리하세요.
          </p>
        </div>
      )}

      {state.theories.length > 0 && (
        <ul className="space-y-2">
          {state.theories.map((t) => (
            <TheoryItem
              key={t.id}
              theory={t}
              onRemove={() =>
                onChange(BoardEngine.removeTheory(state, t.id))
              }
            />
          ))}
        </ul>
      )}

      {drafting ? (
        <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="가설 제목 (예: 부팀장이 정전을 유도했다)"
            className="w-full rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              확신도
            </span>
            {(Object.keys(CONF_META) as TheoryConfidence[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setConfidence(k)}
                className={`rounded-full border px-2 py-0.5 text-[10px] transition ${
                  confidence === k
                    ? CONF_META[k].className
                    : "border-border/60 bg-surface-elevated text-muted-foreground hover:text-foreground"
                }`}
              >
                {CONF_META[k].label}
              </button>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="근거·연결·의문점을 자유롭게 기록"
            className="min-h-20 w-full resize-y rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              취소
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              가설 저장
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDrafting(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-elevated px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          새 가설 추가
        </button>
      )}
    </div>
  );
}

function TheoryItem({
  theory,
  onRemove,
}: {
  theory: Theory;
  onRemove: () => void;
}) {
  const meta = CONF_META[theory.confidence];
  return (
    <li className="rounded-lg border border-border/60 bg-surface-elevated/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">
              {theory.title}
            </h4>
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${meta.className}`}
            >
              {meta.label}
            </span>
          </div>
          {theory.notes && (
            <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
              {theory.notes}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground hover:text-rose-400"
          aria-label="가설 삭제"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
