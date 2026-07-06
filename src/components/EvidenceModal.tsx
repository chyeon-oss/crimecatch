import { X, MapPin, Circle, Star, Flame, Zap, FileSearch, User, Clock } from "lucide-react";
import { useEffect } from "react";
import type { Case, Evidence } from "@/types";
import { IntelligenceEngine } from "@/engine";

interface Props {
  evidence: Evidence | null;
  case: Case;
  discoveredIds: Set<string>;
  onClose: () => void;
  onOpenEvidence: (e: Evidence) => void;
}

const ICONS = { Circle, Star, Flame, Zap };

export function EvidenceModal({
  evidence,
  case: c,
  discoveredIds,
  onClose,
  onOpenEvidence,
}: Props) {
  useEffect(() => {
    if (!evidence) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [evidence, onClose]);

  if (!evidence) return null;

  const importance = IntelligenceEngine.importanceOf(evidence);
  const style = IntelligenceEngine.styleFor(importance);
  const ImpIcon = ICONS[style.icon];

  const relatedEvidence = (evidence.relatedEvidenceIds ?? [])
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => !!e);

  const relatedSuspects = (evidence.relatedSuspectIds ?? [])
    .map((id) => c.suspects.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);

  const relatedTimeline = (evidence.relatedTimelineTimes ?? [])
    .map((t) => c.timeline.find((ev) => ev.time === t))
    .filter((ev): ev is NonNullable<typeof ev> => !!ev);

  const hasRelations =
    relatedEvidence.length + relatedSuspects.length + relatedTimeline.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card shadow-[var(--shadow-noir)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/60 p-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-widest text-primary/80">
              {evidence.category} · 증거 상세
            </p>
            <h2 className="mt-1 font-display text-xl text-foreground">
              {evidence.title}
            </h2>
            <div className="mt-2 inline-flex">
              <span
                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.badgeClass}`}
              >
                <ImpIcon className="h-3 w-3" />
                중요도 · {style.label}
              </span>
            </div>
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
          <p className="text-sm leading-relaxed text-foreground/90">
            {evidence.summary}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {evidence.detail}
          </p>
          {evidence.location && (
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-surface-elevated px-3 py-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary/70" />
              발견 장소 · {evidence.location}
            </div>
          )}

          {hasRelations && (
            <div className="space-y-3 rounded-lg border border-border/60 bg-surface-elevated/60 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                연관 정보
              </p>

              {relatedEvidence.length > 0 && (
                <ChipRow icon={<FileSearch className="h-3 w-3" />} label="증거">
                  {relatedEvidence.map((e) => {
                    const discovered = discoveredIds.has(e.id);
                    return (
                      <button
                        key={e.id}
                        disabled={!discovered}
                        onClick={() => discovered && onOpenEvidence(e)}
                        className={[
                          "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                          discovered
                            ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                            : "border-border/60 bg-surface text-muted-foreground/70",
                        ].join(" ")}
                      >
                        {discovered ? e.title : "??? (미발견)"}
                      </button>
                    );
                  })}
                </ChipRow>
              )}

              {relatedSuspects.length > 0 && (
                <ChipRow icon={<User className="h-3 w-3" />} label="용의자">
                  {relatedSuspects.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full border border-border/60 bg-surface px-2.5 py-0.5 text-[11px] text-foreground"
                    >
                      {s.name}
                    </span>
                  ))}
                </ChipRow>
              )}

              {relatedTimeline.length > 0 && (
                <ChipRow icon={<Clock className="h-3 w-3" />} label="타임라인">
                  {relatedTimeline.map((ev) => (
                    <span
                      key={ev.time}
                      className="rounded-full border border-border/60 bg-surface px-2.5 py-0.5 text-[11px] text-foreground"
                    >
                      {ev.time} · {ev.description}
                    </span>
                  ))}
                </ChipRow>
              )}
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

function ChipRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
