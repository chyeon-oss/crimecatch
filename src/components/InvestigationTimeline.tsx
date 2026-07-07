import { useState } from "react";
import { Clock, MapPin, Users, FileSearch, Lock, Sparkles } from "lucide-react";
import type { Evidence } from "@/types";
import type { TimelineEntry } from "@/engine/TimelineEngine";

interface Props {
  entries: TimelineEntry[];
  onOpenEvidence?: (e: Evidence) => void;
}

export function InvestigationTimeline({ entries, onOpenEvidence }: Props) {
  const [activeTime, setActiveTime] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        타임라인 데이터가 없습니다.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3 pl-6">
      {/* vertical rail */}
      <span
        aria-hidden
        className="absolute bottom-1 left-2 top-1 w-px bg-gradient-to-b from-primary/40 via-border to-transparent"
      />
      {entries.map((entry, i) => {
        const { event, visible, evidence, people, location } = entry;
        const isActive = activeTime === event.time;

        if (!visible) {
          return (
            <li
              key={`${event.time}-${i}`}
              className="relative animate-fade-in"
            >
              <span
                aria-hidden
                className="absolute -left-[17px] top-3 grid h-3 w-3 place-items-center rounded-full border border-border bg-background"
              />
              <div className="rounded-lg border border-dashed border-border/60 bg-surface-elevated/30 px-3 py-2.5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground/70">
                  <Lock className="h-3 w-3" />
                  <span>미확인 시간대</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  증거를 확보하면 이 사건 시간대가 드러납니다.
                </p>
              </div>
            </li>
          );
        }

        return (
          <li key={`${event.time}-${i}`} className="relative animate-fade-in">
            <span
              aria-hidden
              className={`absolute -left-[19px] top-3 grid h-4 w-4 place-items-center rounded-full border-2 ${
                isActive
                  ? "border-primary bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]"
                  : "border-primary/60 bg-background"
              } transition-all`}
            >
              {entry.justRevealed && !isActive && (
                <Sparkles className="h-2 w-2 text-primary animate-pulse" />
              )}
            </span>

            <button
              type="button"
              onClick={() =>
                setActiveTime((prev) => (prev === event.time ? null : event.time))
              }
              className={`group block w-full rounded-lg border px-3 py-2.5 text-left transition-all ${
                isActive
                  ? "border-primary/60 bg-primary/5 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]"
                  : "border-border bg-surface-elevated/60 hover:-translate-y-[1px] hover:border-primary/40 hover:bg-surface-elevated"
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </span>
                {location && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>
                )}
                {people.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {people.map((p) => p.name).join(", ")}
                  </span>
                )}
                {evidence.length > 0 && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    <FileSearch className="h-3 w-3" />
                    증거 {evidence.length}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-foreground">
                {event.description}
              </p>

              {isActive && (evidence.length > 0 || people.length > 0) && (
                <div className="mt-3 space-y-2 border-t border-border/60 pt-3 animate-fade-in">
                  {evidence.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {evidence.map((e) => (
                        <span
                          key={e.id}
                          role="button"
                          tabIndex={0}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onOpenEvidence?.(e);
                          }}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              ev.stopPropagation();
                              onOpenEvidence?.(e);
                            }
                          }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground transition hover:border-primary/50 hover:text-primary"
                        >
                          <FileSearch className="h-3 w-3" />
                          {e.title}
                        </span>
                      ))}
                    </div>
                  )}
                  {people.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {people.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface-elevated px-2 py-1 text-[11px] text-muted-foreground"
                        >
                          <Users className="h-3 w-3" />
                          {p.name}
                          <span className="text-muted-foreground/60">
                            · {p.occupation}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
