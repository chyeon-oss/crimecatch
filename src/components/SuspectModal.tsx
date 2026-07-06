import { X } from "lucide-react";
import { useEffect } from "react";
import type { Suspect } from "@/types";

interface Props {
  suspect: Suspect | null;
  onClose: () => void;
}

export function SuspectModal({ suspect, onClose }: Props) {
  useEffect(() => {
    if (!suspect) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [suspect, onClose]);

  if (!suspect) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-border bg-card shadow-[var(--shadow-noir)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/60 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-primary/80">심문</p>
            <h2 className="mt-1 font-display text-xl text-foreground">{suspect.name}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {suspect.age}세 · {suspect.occupation}
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

        <div className="space-y-3 p-5">
          <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm text-foreground/90">
              AI 심문 기능은 다음 단계에서 연결됩니다.
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              곧 실제 대화형 심문이 이곳에서 시작됩니다.
            </p>
          </div>
          <div className="rounded-md border border-border/60 bg-surface-elevated p-3 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-wider text-primary/70">관계</p>
            <p className="mt-1 text-foreground/90">{suspect.relationship}</p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-primary/70">첫 진술</p>
            <p className="mt-1 italic text-foreground/80">"{suspect.initialStatement}"</p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-primary/70">알리바이</p>
            <p className="mt-1 text-foreground/80">{suspect.alibi}</p>
          </div>
        </div>

        <div className="border-t border-border/60 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-border bg-surface-elevated py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
