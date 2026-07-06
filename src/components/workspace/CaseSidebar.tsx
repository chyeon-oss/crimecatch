import { Briefcase, Clock, FileSearch, Users, Target, MapPin } from "lucide-react";
import { StoryRuntime } from "@/engine";
import type { Case, StoryRuntimeState } from "@/types";

interface Props {
  case: Case;
  storyState: StoryRuntimeState;
  objectiveText?: string;
  discoveredCount: number;
  totalEvidence: number;
}

export function CaseSidebar({
  case: c,
  storyState,
  objectiveText,
  discoveredCount,
  totalEvidence,
}: Props) {
  const def = StoryRuntime.phaseDef(storyState.phase);
  const pct = Math.round(storyState.progress * 100);

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto border-r border-border/60 bg-card/40 p-4 backdrop-blur-sm">
      <Block icon={Briefcase} label="CASE FILE">
        <p className="font-display text-sm leading-snug text-foreground">
          {c.title}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
          {c.subtitle}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{c.incidentLocation}</span>
        </div>
      </Block>

      <Block icon={Target} label="OBJECTIVE">
        <p className="text-[10px] uppercase tracking-widest text-primary">
          {def.title} · {pct}%
        </p>
        <p className="mt-1 text-xs text-foreground/90">
          {objectiveText ?? def.koreanTitle}
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Block>

      <div className="grid grid-cols-2 gap-2">
        <Stat
          icon={FileSearch}
          label="Evidence"
          value={`${discoveredCount}/${totalEvidence}`}
        />
        <Stat icon={Users} label="Suspects" value={String(c.suspects.length)} />
      </div>

      <Block icon={Clock} label="TIMELINE">
        <ol className="relative space-y-2.5 pl-3">
          <span className="absolute left-1 top-1 bottom-1 w-px bg-border/60" />
          {c.timeline.map((t) => (
            <li key={t.time} className="relative">
              <span className="absolute -left-2.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary/70 ring-2 ring-card" />
              <p className="font-mono text-[10px] text-primary">{t.time}</p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {t.description}
              </p>
            </li>
          ))}
        </ol>
      </Block>

      <Block icon={Users} label="SUSPECTS">
        <ul className="space-y-1.5">
          {c.suspects.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-surface-elevated/40 px-2 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-foreground">
                  {s.name}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {s.occupation}
                </p>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                {s.age}
              </span>
            </li>
          ))}
        </ul>
      </Block>
    </aside>
  );
}

function Block({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Briefcase;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/60 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      {children}
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 font-display text-lg text-foreground">{value}</p>
    </div>
  );
}
