import { Target } from "lucide-react";

interface Props {
  sceneTitle: string;
  objective: string;
  gameStatus: string;
  progress: number; // 0..1
}

/**
 * ObjectiveBanner — always visible reminder of what the detective should
 * be doing right now. Renders the current runtime scene, game status, and
 * a progress bar. Non-destructive addition that sits above the existing
 * sections; it does not replace or restyle any current component.
 */
export function ObjectiveBanner({
  sceneTitle,
  objective,
  gameStatus,
  progress,
}: Props) {
  const pct = Math.round(progress * 100);
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface-elevated to-background shadow-[var(--shadow-gold)]">
      <div className="flex items-start gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
              현재 목표
            </span>
            <span className="rounded-full border border-border/60 bg-surface px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              {gameStatus}
            </span>
            <span className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
              {sceneTitle}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium leading-snug text-foreground">
            {objective}
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            수사 진행률
          </p>
          <p className="tabular-nums font-display text-lg text-primary">
            {pct}%
          </p>
        </div>
      </div>
      <div className="h-1 w-full bg-border/30">
        <div
          className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
