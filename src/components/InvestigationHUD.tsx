import {
  BookOpen,
  MapPin,
  Clock,
  Compass,
  FileSearch,
  Target,
} from "lucide-react";
import { StoryRuntime } from "@/engine";
import type { Case, StoryRuntimeState } from "@/types";

interface Props {
  case: Case;
  storyState: StoryRuntimeState;
  discoveredCount: number;
  totalEvidence: number;
  chapterTitle?: string;
}

export function InvestigationHUD({
  case: c,
  storyState,
  discoveredCount,
  totalEvidence,
  chapterTitle,
}: Props) {
  const phaseDef = StoryRuntime.phaseDef(storyState.phase);
  const displayChapter = chapterTitle ?? phaseDef.koreanTitle;
  const evidencePct = totalEvidence
    ? Math.round((discoveredCount / totalEvidence) * 100)
    : 0;
  const truthPct = Math.round(storyState.progress * 100);

  const items = [
    {
      icon: BookOpen,
      label: "Chapter",
      value: displayChapter,
      accent: false,
    },
    {
      icon: MapPin,
      label: "Location",
      value: c.incidentLocation,
      accent: false,
    },
    {
      icon: Clock,
      label: "Time",
      value: c.incidentTime,
      accent: false,
    },
    {
      icon: Compass,
      label: "Phase",
      value: phaseDef.title,
      accent: true,
    },
    {
      icon: FileSearch,
      label: "Evidence",
      value: `${discoveredCount}/${totalEvidence} · ${evidencePct}%`,
      accent: false,
    },
    {
      icon: Target,
      label: "Truth",
      value: `${truthPct}%`,
      accent: false,
    },
  ];

  return (
    <div className="relative z-10 border-b border-border/60 bg-background/90 backdrop-blur-md">
      {/* Subtle horizontal scanner */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="h-full w-1/4 -translate-x-full animate-[hud-scan-x_5s_linear_infinite] bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] items-stretch justify-between gap-1 px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-surface-elevated/60"
              title={`${item.label}: ${item.value}`}
            >
              <div
                className={
                  "grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-all duration-200 " +
                  (item.accent
                    ? "border-gold/40 bg-gold/15 text-gold shadow-[var(--shadow-gold)]"
                    : "border-primary/20 bg-primary/10 text-primary group-hover:shadow-[var(--shadow-gold)]")
                }
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p className="truncate text-[11px] font-medium text-foreground transition-all duration-300 group-hover:text-gold">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Truth progress micro-bar */}
      <div className="relative z-10 h-0.5 w-full overflow-hidden bg-border/30">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-primary to-gold transition-all duration-700 ease-out"
          style={{ width: `${truthPct}%` }}
        />
      </div>
    </div>
  );
}
