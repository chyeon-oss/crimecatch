import { useEffect } from "react";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  previousSceneTitle: string | null;
  newSceneTitle: string | null;
  newObjective: string | null;
  onContinue: () => void;
}

/**
 * SceneTransitionModal — surfaces an automatic runtime scene change so
 * the player sees explicitly that the case has advanced. Purely
 * presentational; the runtime already performed the transition before
 * this modal opens.
 */
export function SceneTransitionModal({
  open,
  previousSceneTitle,
  newSceneTitle,
  newObjective,
  onContinue,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") onContinue();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onContinue]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onContinue()}>
      <DialogContent className="max-w-md border-primary/30 bg-gradient-to-br from-surface-elevated via-background to-surface-elevated p-0 shadow-[var(--shadow-gold)]">
        <div className="border-b border-primary/20 bg-primary/5 px-6 py-4">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">
                Case Update
              </span>
            </div>
            <DialogTitle className="font-display text-xl text-foreground">
              수사 단계 갱신
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              새로운 국면에 진입했습니다.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-surface/60 p-3">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                이전 단계
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground line-through decoration-muted-foreground/40">
                {previousSceneTitle ?? "—"}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1 rounded-lg border border-primary/40 bg-primary/10 p-3">
              <p className="text-[9px] uppercase tracking-widest text-primary/80">
                다음 단계
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
                {newSceneTitle ?? "—"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent p-4">
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">
                새로운 목표
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-snug text-foreground">
              {newObjective ?? "다음 단계로 이동하세요."}
            </p>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01]"
          >
            계속 수사하기
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
