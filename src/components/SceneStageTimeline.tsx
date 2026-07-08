import { Check } from "lucide-react";

export interface SceneStage {
  id: string;
  label: string;
}

interface Props {
  stages: SceneStage[];
  currentSceneId: string | null;
  completedSceneIds: string[];
}

/**
 * Compact horizontal indicator of the case's runtime scenes. Shows a
 * checkmark on completed stages, highlights the active one, and dims
 * the future ones. Non-interactive — it never triggers navigation.
 */
export function SceneStageTimeline({
  stages,
  currentSceneId,
  completedSceneIds,
}: Props) {
  if (stages.length <= 1) return null;
  const currentIdx = stages.findIndex((s) => s.id === currentSceneId);
  return (
    <div className="border-b border-border/60 bg-surface-elevated/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6">
        <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:inline">
          현재 수사 단계
        </span>
        <ol className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto sm:gap-2">
          {stages.map((s, i) => {
            const done = completedSceneIds.includes(s.id);
            const active = s.id === currentSceneId;
            const future = currentIdx >= 0 && i > currentIdx && !done;
            return (
              <li
                key={s.id}
                className="flex min-w-0 items-center gap-1.5 sm:gap-2"
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold tabular-nums transition-colors " +
                    (done
                      ? "border-primary/60 bg-primary/20 text-primary"
                      : active
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                        : "border-border/60 bg-surface text-muted-foreground/70")
                  }
                >
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span
                  className={
                    "truncate text-[11px] uppercase tracking-widest transition-colors " +
                    (active
                      ? "text-primary"
                      : done
                        ? "text-foreground/80"
                        : future
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground")
                  }
                >
                  {s.label}
                </span>
                {i < stages.length - 1 && (
                  <span
                    className={
                      "mx-1 h-px w-4 sm:w-8 " +
                      (done ? "bg-primary/60" : "bg-border/50")
                    }
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
