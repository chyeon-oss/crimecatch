import { FileText, X } from "lucide-react";

export interface SheetEvidence {
  id: string;
  title: string;
  category: string;
  presented: boolean;
}

interface Props {
  open: boolean;
  items: SheetEvidence[];
  onSelect: (evidenceId: string) => void;
  onClose: () => void;
}

/**
 * Bottom sheet used to present evidence during an interview.
 * Only evidence the detective has discovered AND read can be presented.
 */
export function EvidenceSheet({ open, items, onSelect, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-[460px] rounded-t-2xl border border-border/70 bg-card animate-fade-in"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">증거 제시</p>
            <p className="text-[13px] text-foreground">읽은 증거만 제시할 수 있습니다</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[52vh] overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="py-8 text-center text-[12px] leading-relaxed text-muted-foreground">
              아직 제시할 수 있는 증거가 없습니다.
              <br />
              사건파일에서 증거를 열어 내용을 확인하세요.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(e.id)}
                    className="flex min-h-[48px] w-full items-center gap-3 rounded-lg border border-border/60 bg-surface-elevated px-3 py-2.5 text-left transition-colors hover:border-primary/40"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-foreground">{e.title}</span>
                      <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
                        {e.category}
                        {e.presented && " · 제시함"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
