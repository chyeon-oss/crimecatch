import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  Users,
  FlaskConical,
  Camera,
  Network,
  Gavel,
  CircleDot,
  Lock,
  type LucideIcon,
} from "lucide-react";
import type {
  Objective,
  ObjectiveCategory,
  ObjectivePriority,
} from "@/types";

interface Props {
  objectives: Objective[];
}

const CATEGORY_META: Record<
  ObjectiveCategory,
  { icon: LucideIcon; label: string }
> = {
  SCENE: { icon: Search, label: "Crime Scene" },
  EVIDENCE: { icon: Camera, label: "Evidence" },
  INTERROGATION: { icon: Users, label: "Interrogation" },
  ANALYSIS: { icon: FlaskConical, label: "Analysis" },
  THEORY: { icon: Network, label: "Theory" },
  ACCUSATION: { icon: Gavel, label: "Accusation" },
};

const PRIORITY_ORDER: Record<ObjectivePriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const PRIORITY_STYLES: Record<ObjectivePriority, string> = {
  critical: "text-red-400 border-red-500/40 bg-red-500/10",
  high: "text-primary border-primary/40 bg-primary/10",
  normal: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  low: "text-muted-foreground border-border bg-surface-elevated/40",
};

export function ObjectivesPanel({ objectives }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);

  const { active, completed, ratio } = useMemo(() => {
    const active = objectives
      .filter((o) => o.status !== "completed")
      .sort(
        (a, b) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
          Number(a.status === "locked") - Number(b.status === "locked"),
      );
    const completed = objectives.filter((o) => o.status === "completed");
    const ratio = objectives.length ? completed.length / objectives.length : 0;
    return { active, completed, ratio };
  }, [objectives]);

  const nextUp = active.find((o) => o.status !== "locked") ?? active[0];

  return (
    <div className="space-y-4">
      {/* Header w/ progress */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Next up
          </p>
          <p className="mt-0.5 font-display text-sm text-foreground">
            {nextUp?.title ?? "All objectives completed"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg text-primary">
            {completed.length}
            <span className="text-muted-foreground">/{objectives.length}</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            complete
          </p>
        </div>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>

      {/* Active list */}
      <ul className="space-y-2">
        {active.map((o) => (
          <ObjectiveRow key={o.id} objective={o} />
        ))}
        {active.length === 0 && (
          <li className="rounded-lg border border-dashed border-border/60 bg-surface-elevated/30 py-6 text-center text-xs text-muted-foreground">
            남은 임무가 없습니다.
          </li>
        )}
      </ul>

      {/* Completed collapsible */}
      {completed.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-surface-elevated/30">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              {showCompleted ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Completed · {completed.length}
            </span>
            <span className="text-primary/80">✓</span>
          </button>
          {showCompleted && (
            <ul className="space-y-1.5 border-t border-border/40 p-2">
              {completed.map((o) => (
                <ObjectiveRow key={o.id} objective={o} dim />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ObjectiveRow({
  objective,
  dim,
}: {
  objective: Objective;
  dim?: boolean;
}) {
  const meta = CATEGORY_META[objective.category];
  const Icon = meta.icon;
  const isDone = objective.status === "completed";
  const isLocked = objective.status === "locked";
  const pct = Math.round(objective.progress * 100);

  return (
    <li
      className={`group relative overflow-hidden rounded-lg border border-border/60 bg-card/60 p-2.5 transition-all duration-300 ${
        isDone
          ? "opacity-70"
          : "hover:border-primary/40 hover:bg-card hover:shadow-[0_0_0_1px_rgba(200,168,108,0.12)]"
      } ${dim ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <div
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-300 ${
            isDone
              ? "border-primary bg-primary text-primary-foreground"
              : isLocked
                ? "border-border bg-surface-elevated/40 text-muted-foreground"
                : "border-border bg-surface-elevated/40 text-transparent group-hover:border-primary/60"
          }`}
        >
          {isDone ? (
            <Check className="h-3 w-3 animate-scale-in" strokeWidth={3} />
          ) : isLocked ? (
            <Lock className="h-2.5 w-2.5" />
          ) : objective.status === "in_progress" ? (
            <CircleDot className="h-3 w-3 text-primary" />
          ) : null}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
              {meta.label}
            </span>
            <span
              className={`ml-auto rounded-sm border px-1.5 py-0 text-[9px] uppercase tracking-widest ${PRIORITY_STYLES[objective.priority]}`}
            >
              {objective.priority}
            </span>
          </div>
          <p
            className={`mt-1 text-[13px] leading-snug ${
              isDone
                ? "text-muted-foreground line-through"
                : isLocked
                  ? "text-muted-foreground"
                  : "text-foreground"
            }`}
          >
            {objective.title}
          </p>
          {objective.description && !isDone && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
              {objective.description}
            </p>
          )}

          {/* Progress */}
          {objective.progress > 0 && !isDone && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-primary/80 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {objective.count ? (
                <span className="font-mono text-[10px] text-muted-foreground">
                  {objective.count.current}/{objective.count.total}
                </span>
              ) : (
                <span className="font-mono text-[10px] text-muted-foreground">
                  {pct}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completion sweep */}
      {isDone && (
        <span className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent [animation:obj-sweep_600ms_ease-out]" />
      )}
    </li>
  );
}
