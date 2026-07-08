import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Search,
  CheckCircle2,
  Loader2,
  Sparkles,
  ScanSearch,
  Crosshair,
} from "lucide-react";
import type { CrimeScene as CrimeSceneData, CrimeSceneHotspot, Evidence } from "@/types";

interface Props {
  scene: CrimeSceneData;
  evidenceById: Map<string, Evidence>;
  investigatedIds: Set<string>;
  onInvestigate: (hotspot: CrimeSceneHotspot) => Promise<void> | void;
}

type Stage = "idle" | "zoom" | "searching" | "focus" | "reveal";

interface Reveal {
  hotspotId: string;
  discovered: Evidence[];
  emptyMessage?: string;
  focusHint: string;
}

// Fallback area hints when a hotspot omits its own.
const DEFAULT_HINTS = [
  "무언가 미묘한 흔적이 눈에 들어온다…",
  "손끝에 닿는 잔상, 눈에 걸리는 세부.",
  "이 자리에 남은 흐릿한 단서.",
  "표면 아래로 무언가 어긋나 있다.",
];

function pickFocusHint(h: CrimeSceneHotspot): string {
  if (h.hint && h.hint.trim().length > 0) return h.hint;
  const idx = Math.abs(hashString(h.id)) % DEFAULT_HINTS.length;
  return DEFAULT_HINTS[idx];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function CrimeScene({ scene, evidenceById, investigatedIds, onInvestigate }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const busy = stage !== "idle" && stage !== "reveal";

  const handleClick = async (h: CrimeSceneHotspot) => {
    if (busy || investigatedIds.has(h.id)) return;
    setActiveId(h.id);
    setReveal(null);

    // 1. Camera zooms in.
    setStage("zoom");
    await wait(450);

    // 2 & 3. Fade UI + "현장 조사 중..." (~800ms).
    setStage("searching");
    await wait(800);

    // 4. Highlight the interesting area briefly before evidence appears.
    setStage("focus");
    await wait(700);

    // Commit the investigation to the runtime.
    await onInvestigate(h);

    const discovered = h.revealsEvidenceIds
      .map((id) => evidenceById.get(id))
      .filter((e): e is Evidence => !!e);

    // 5. Reveal evidence card.
    setReveal({
      hotspotId: h.id,
      discovered,
      emptyMessage: h.emptyMessage,
      focusHint: pickFocusHint(h),
    });
    setStage("reveal");

    // 6 & 7. Signal notebook + question panels to animate.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cc:evidence-discovered", {
          detail: { hotspotId: h.id, evidenceIds: discovered.map((e) => e.id) },
        }),
      );
    }

    // 8. Return camera to normal after a beat (keep reveal panel visible).
    await wait(600);
    if (cancelledRef.current) return;
    setActiveId(null);
  };

  return (
    <div className="space-y-4">
      {/* Scene image placeholder */}
      <div
        className={
          "relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-surface-elevated via-background to-surface-elevated shadow-[var(--shadow-noir)] transition-transform duration-500 " +
          (busy ? "cc-scene-zooming" : "")
        }
      >
        <div className="aspect-[16/9] w-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
            <MapPin className={"h-6 w-6 text-primary/70 " + (busy ? "cc-reticle" : "")} />
            <p className="text-[11px] uppercase tracking-widest text-primary/70">
              현장 스케치
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {scene.imagePrompt ?? "사건 현장을 살펴보고 조사할 지점을 선택하세요."}
            </p>
          </div>
        </div>

        {/* Cinematic overlays */}
        {busy && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
            <div className="cc-scan-sweep" aria-hidden />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-background/70 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                {stage === "searching" ? (
                  <ScanSearch className="h-3.5 w-3.5 animate-pulse text-primary" />
                ) : (
                  <Crosshair className="h-3.5 w-3.5 cc-reticle text-primary" />
                )}
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  {stage === "focus" ? "단서 포착" : "현장 조사 중..."}
                </span>
              </div>
            </div>
          </>
        )}

        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.03]" />
      </div>

      {/* Hotspot grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {scene.hotspots.map((h) => {
          const isActive = activeId === h.id;
          const isDone = investigatedIds.has(h.id);
          const focused = isActive && (stage === "zoom" || stage === "searching" || stage === "focus");
          const dimmed = busy && !isActive;
          return (
            <button
              key={h.id}
              onClick={() => handleClick(h)}
              disabled={busy || isDone}
              className={[
                "group relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all duration-300",
                isDone
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/70 bg-surface-elevated hover:border-primary/50 hover:bg-primary/5",
                focused ? "cc-hotspot-focused border-primary/60 bg-primary/10" : "",
                dimmed ? "cc-hotspot-dimmed" : "",
              ].join(" ")}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-display text-sm text-foreground">{h.label}</span>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                ) : isActive && stage === "searching" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : isActive && (stage === "zoom" || stage === "focus") ? (
                  <Crosshair className="h-3.5 w-3.5 cc-reticle text-primary" />
                ) : (
                  <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {isActive && stage === "searching"
                  ? "현장 조사 중..."
                  : isActive && stage === "focus"
                    ? "단서 포착"
                    : isDone
                      ? "조사 완료"
                      : "미조사"}
              </span>
              {h.hint && !isActive && (
                <span className="line-clamp-1 text-[11px] text-muted-foreground/80">
                  {h.hint}
                </span>
              )}

              {/* Focus area highlight — brief pre-reveal beat */}
              {isActive && stage === "focus" && (
                <div className="cc-area-glow pointer-events-none absolute inset-0 rounded-lg ring-1 ring-primary/60">
                  <div className="cc-shimmer-line" aria-hidden />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Focus caption (between click and reveal) */}
      {reveal && stage === "reveal" && reveal.focusHint && (
        <div className="animate-fade-in rounded-md border border-primary/20 bg-background/60 px-3 py-2 text-[11px] italic text-primary/80">
          {reveal.focusHint}
        </div>
      )}

      {/* Reveal panel */}
      {reveal && stage === "reveal" && (
        <div
          key={reveal.hotspotId}
          className="animate-scale-in rounded-xl border border-primary/30 bg-primary/5 p-4 cc-discovery-flash"
        >
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-widest">
              발견
            </p>
          </div>
          {reveal.discovered.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {reveal.discovered.map((e, i) => (
                <li
                  key={e.id}
                  className="animate-fade-in text-sm text-foreground"
                  style={{ animationDelay: `${i * 90}ms`, animationFillMode: "backwards" }}
                >
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
