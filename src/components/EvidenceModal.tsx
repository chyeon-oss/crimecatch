import { X, MapPin } from "lucide-react";
import { useEffect } from "react";
import type { Evidence } from "@/lib/mock-cases";

interface Props {
  evidence: Evidence | null;
  onClose: () => void;
}

export function EvidenceModal({ evidence, onClose }: Props) {
  useEffect(() => {
    if (!evidence) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [evidence, onClose]);

  if (!evidence) return null;

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
            <p className="text-[11px] uppercase tracking-widest text-primary/80">증거 상세</p>
            <h2 className="mt-1 font-display text-xl text-foreground">{evidence.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-foreground/90">{evidence.description}</p>
          {evidence.location && (
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-surface-elevated px-3 py-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary/70" />
              발견 장소 · {evidence.location}
            </div>
          )}
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
