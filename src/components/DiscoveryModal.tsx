import { useEffect } from "react";
import { Sparkles, Circle, Star, Flame, Zap } from "lucide-react";
import type { Evidence } from "@/types";
import { IntelligenceEngine } from "@/engine";

interface Props {
  evidence: Evidence | null;
  remaining: number;
  onContinue: () => void;
}

const ICONS = { Circle, Star, Flame, Zap };

export function DiscoveryModal({ evidence, remaining, onContinue }: Props) {
  useEffect(() => {
    if (!evidence) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onContinue();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [evidence, onContinue]);

  if (!evidence) return null;

  const importance = IntelligenceEngine.importanceOf(evidence);
  const style = IntelligenceEngine.styleFor(importance);
  const Icon = ICONS[style.icon];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-fade-in relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-[var(--shadow-noir)]"
      >
        {/* Decorative scanline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />

        <div className="relative flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
              NEW EVIDENCE DISCOVERED
            </p>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>

          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {evidence.category}
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {evidence.title}
          </h2>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${style.badgeClass}`}
          >
            <Icon className="h-3.5 w-3.5" />
            중요도 · {style.label}
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {evidence.summary}
          </p>

          <button
            data-testid="discovery-continue"
            onClick={onContinue}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01]"
          >
            {remaining > 0
              ? `계속 수사하기 (+${remaining})`
              : "계속 수사하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
