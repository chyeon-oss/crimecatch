import { StoryRuntime } from "@/engine";
import type { StoryRuntimeState } from "@/types";
import { Compass } from "lucide-react";

interface Props {
  state: StoryRuntimeState;
  objectiveText?: string;
}

export function PhaseIndicator({ state, objectiveText }: Props) {
  const def = StoryRuntime.phaseDef(state.phase);
  const pct = Math.round(state.progress * 100);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-noir)] sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Compass className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            PHASE {def.order + 1} / {StoryRuntime.phases.length} · {def.title}
          </p>
          <h2 className="font-display text-lg text-foreground">
            {def.koreanTitle}
          </h2>
          {objectiveText && (
            <p className="mt-1 text-xs text-muted-foreground">{objectiveText}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl text-primary">{pct}%</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Progress
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-1">
        {StoryRuntime.phases.map((p) => {
          const done = p.order < def.order;
          const active = p.order === def.order;
          return (
            <div
              key={p.phase}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              title={p.koreanTitle}
            >
              <span
                className={
                  "h-1.5 w-full rounded-full " +
                  (active
                    ? "bg-primary"
                    : done
                      ? "bg-primary/50"
                      : "bg-border/60")
                }
              />
              <span
                className={
                  "truncate text-[9px] uppercase tracking-widest " +
                  (active
                    ? "text-primary"
                    : done
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50")
                }
              >
                {p.order + 1}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
