import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Fingerprint, ScanSearch } from "lucide-react";


export interface SurfaceHotspot {
  id: string;
  title: string;
}

interface Beat {
  speaker: string;
  text: string;
}

interface Props {
  sceneTitle: string;
  objective: string;
  sceneIndex: number;
  hotspots: SurfaceHotspot[];
  investigatedIds: Set<string>;
  focusedHotspotId?: string | null;
  layout: Record<string, { x: number; y: number }>;
  /** Per-case backdrop dressing, injected by the scene presentation registry. */
  renderBackdrop: (sceneIndex: number) => ReactNode;
  /** Authored monologue beats played before the evidence reveal. */
  beatsFor: (hotspotId: string) => Beat[];
  /** Runs the actual runtime investigation (evidence reveal). */
  onInvestigate: (hotspotId: string) => void;
  /** Called once the beats have played, so the transcript can record them. */
  onBeatsPlayed?: (hotspotId: string) => void;
  disabled?: boolean;
}

const FALLBACK_POS = [
  { x: 28, y: 58 },
  { x: 62, y: 70 },
  { x: 78, y: 36 },
  { x: 40, y: 30 },
  { x: 68, y: 22 },
  { x: 22, y: 76 },
];

type Stage = "IDLE" | "ZOOM" | "SEARCH" | "REVEAL";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Immersive scene surface: a cinematic crime-scene card with touchable
 * hotspots. Investigating zooms into the point, plays authored beats as
 * subtitles, then hands off to the existing runtime evidence reveal.
 */
export function SceneSurface({
  sceneTitle,
  objective,
  sceneIndex,
  hotspots,
  investigatedIds,
  focusedHotspotId,
  layout,
  renderBackdrop,
  beatsFor,
  onInvestigate,
  onBeatsPlayed,
  disabled,
}: Props) {
  const [stage, setStage] = useState<Stage>("IDLE");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [beatIndex, setBeatIndex] = useState(0);
  const [beats, setBeats] = useState<Beat[]>([]);
  const aliveRef = useRef(true);

  /**
   * The staged reveal must never be lost when the surface unmounts (tab
   * switch, scene advance). We keep the in-flight hotspot in a ref and commit
   * it on teardown, so investigating is deterministic once it has started.
   */
  const inFlightRef = useRef<{ id: string; beatsLogged: boolean } | null>(null);
  const commitRef = useRef({ onInvestigate, onBeatsPlayed });
  useEffect(() => {
    commitRef.current = { onInvestigate, onBeatsPlayed };
  }, [onInvestigate, onBeatsPlayed]);

  const commit = (id: string) => {
    const flight = inFlightRef.current;
    if (!flight || flight.id !== id) return;
    inFlightRef.current = null;
    if (!flight.beatsLogged) commitRef.current.onBeatsPlayed?.(id);
    commitRef.current.onInvestigate(id);
  };

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      const flight = inFlightRef.current;
      if (flight) commit(flight.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const posOf = (id: string, i: number) => layout[id] ?? FALLBACK_POS[i % FALLBACK_POS.length];

  const run = async (h: SurfaceHotspot) => {
    if (stage !== "IDLE" || disabled || inFlightRef.current) return;
    const list = beatsFor(h.id);
    inFlightRef.current = { id: h.id, beatsLogged: false };
    setActiveId(h.id);
    setBeats(list);
    setBeatIndex(0);
    setStage("ZOOM");
    await wait(420);
    if (!aliveRef.current) return;
    setStage("SEARCH");
    await wait(800);
    for (let i = 0; i < list.length; i += 1) {
      if (!aliveRef.current) return;
      setBeatIndex(i);
      await wait(1150);
    }
    if (!aliveRef.current) return;
    onBeatsPlayed?.(h.id);
    if (inFlightRef.current) inFlightRef.current.beatsLogged = true;
    setStage("REVEAL");
    await wait(260);
    if (!aliveRef.current) return;
    commit(h.id);
    setStage("IDLE");
    setActiveId(null);
    setBeats([]);
  };


  const busy = stage !== "IDLE";
  const activePos = activeId
    ? posOf(
        activeId,
        hotspots.findIndex((h) => h.id === activeId),
      )
    : null;

  return (
    <section className="px-4" data-testid="scene-surface" data-stage={stage}>
      <h2 className="sr-only">{`${sceneTitle} — ${objective}`}</h2>

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border/70 bg-surface-elevated">
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            transform:
              busy && activePos
                ? `scale(1.5) translate(${(50 - activePos.x) * 0.6}%, ${(50 - activePos.y) * 0.6}%)`
                : "scale(1.02)",
            filter: busy ? "brightness(0.5) saturate(0.7)" : "brightness(0.62)",
          }}
        >
          {renderBackdrop(sceneIndex)}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/25 to-background/90" />

        {/* Hotspots */}
        {hotspots.map((h, i) => {
          const pos = posOf(h.id, i);
          const done = investigatedIds.has(h.id);
          const isActive = activeId === h.id;
          const dim = busy && !isActive;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => run(h)}
              data-testid={`hotspot-${h.id}`}
              data-investigated={done ? "true" : "false"}
              disabled={busy || disabled}
              aria-label={`${h.title} 조사`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                dim ? "pointer-events-none opacity-20" : "opacity-100"
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span className="flex min-h-[44px] min-w-[44px] flex-col items-center gap-1.5">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full border backdrop-blur-sm transition-colors ${
                    done
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : isActive
                        ? "border-primary bg-primary/25 text-primary"
                        : "border-foreground/30 bg-background/50 text-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Fingerprint className="h-4 w-4" />}
                  {!done && !busy && (
                    <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-primary/40" />
                  )}
                </span>
                <span
                  className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${
                    done
                      ? "border-border/60 bg-background/70 text-muted-foreground"
                      : "border-primary/30 bg-background/80 text-foreground"
                  }`}
                >
                  {h.title}
                  {done && " · 완료"}
                </span>
              </span>
            </button>
          );
        })}

        {/* Focus ring guidance from dialogue choices */}
        {!busy &&
          focusedHotspotId &&
          hotspots.some((h) => h.id === focusedHotspotId) &&
          !investigatedIds.has(focusedHotspotId) && (
            <span
              className="pointer-events-none absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/60 shadow-[0_0_30px_hsl(0_0%_100%/0.05)]"
              style={{
                left: `${posOf(focusedHotspotId, 0).x}%`,
                top: `${posOf(focusedHotspotId, 0).y}%`,
              }}
            />
          )}

        {/* Searching state */}
        {stage === "SEARCH" && beats.length === 0 && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-background/70 px-4 py-3 text-xs text-primary">
            <ScanSearch className="h-4 w-4 animate-pulse" />
            현장 조사 중...
          </div>
        )}

        {/* Beat subtitles */}
        {busy && beats.length > 0 && stage !== "ZOOM" && (
          <div className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-background/85 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-primary">
              {beats[Math.min(beatIndex, beats.length - 1)].speaker}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-foreground">
              {beats[Math.min(beatIndex, beats.length - 1)].text}
            </p>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {investigatedIds.size > 0
          ? `${hotspots.filter((h) => investigatedIds.has(h.id)).length} / ${hotspots.length} 지점 조사 완료`
          : "빛나는 지점을 눌러 현장을 조사하세요."}
      </p>
    </section>
  );
}
