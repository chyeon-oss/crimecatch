import { useState } from "react";
import { MapPin, Search, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import type { CrimeScene as CrimeSceneData, CrimeSceneHotspot, Evidence } from "@/types";

interface Props {
  scene: CrimeSceneData;
  evidenceById: Map<string, Evidence>;
  investigatedIds: Set<string>;
  onInvestigate: (hotspot: CrimeSceneHotspot) => Promise<void> | void;
}

type LocalStatus = "idle" | "searching" | "done";

interface Reveal {
  hotspotId: string;
  discovered: Evidence[];
  emptyMessage?: string;
}

export function CrimeScene({ scene, evidenceById, investigatedIds, onInvestigate }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);

  const handleClick = async (h: CrimeSceneHotspot) => {
    if (busyId || investigatedIds.has(h.id)) return;
    setBusyId(h.id);
    setReveal(null);
    // Investigation animation window
    await new Promise((r) => setTimeout(r, 1400));
    await onInvestigate(h);
    setReveal({
      hotspotId: h.id,
      discovered: h.revealsEvidenceIds
        .map((id) => evidenceById.get(id))
        .filter((e): e is Evidence => !!e),
      emptyMessage: h.emptyMessage,
    });
    setBusyId(null);
  };

  return (
    <div className="space-y-4">
      {/* Scene image placeholder */}
      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-surface-elevated via-background to-surface-elevated shadow-[var(--shadow-noir)]">
        <div className="aspect-[16/9] w-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
            <MapPin className="h-6 w-6 text-primary/70" />
            <p className="text-[11px] uppercase tracking-widest text-primary/70">
              현장 스케치
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {scene.imagePrompt ?? "사건 현장을 살펴보고 조사할 지점을 선택하세요."}
            </p>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.03]" />
      </div>

      {/* Hotspot grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {scene.hotspots.map((h) => {
          const isBusy = busyId === h.id;
          const isDone = investigatedIds.has(h.id);
          return (
            <button
              key={h.id}
              onClick={() => handleClick(h)}
              disabled={!!busyId || isDone}
              className={[
                "group relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                isDone
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/70 bg-surface-elevated hover:border-primary/50 hover:bg-primary/5",
                busyId && !isBusy ? "opacity-50" : "",
              ].join(" ")}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-display text-sm text-foreground">{h.label}</span>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                ) : isBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {isBusy ? "조사 중..." : isDone ? "조사 완료" : "미조사"}
              </span>
              {h.hint && !isBusy && (
                <span className="line-clamp-1 text-[11px] text-muted-foreground/80">
                  {h.hint}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Reveal panel */}
      {reveal && (
        <div className="animate-fade-in rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-widest">
              조사 결과
            </p>
          </div>
          {reveal.discovered.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {reveal.discovered.map((e) => (
                <li key={e.id} className="text-sm text-foreground">
                  <span className="mr-2 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    NEW
                  </span>
                  {e.title}
                </li>
              ))}
              <li className="pt-1 text-[11px] text-muted-foreground">
                증거 보관함에 자동으로 보관되었습니다.
              </li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {reveal.emptyMessage ?? "특별한 단서를 찾지 못했다."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
