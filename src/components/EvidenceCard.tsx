import { Search, Circle, Star, Flame, Zap, Link2, BookOpen } from "lucide-react";
import type { Evidence, EvidenceState } from "@/types";
import { IntelligenceEngine } from "@/engine";

interface Props {
  evidence: Evidence;
  onOpen: (e: Evidence) => void;
  state?: EvidenceState;
}

const ICONS = { Circle, Star, Flame, Zap };

const STATE_META: Record<
  EvidenceState,
  { label: string; className: string; Icon: typeof Circle }
> = {
  NEW: {
    label: "NEW",
    className: "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]",
    Icon: Circle,
  },
  READ: {
    label: "READ",
    className: "bg-surface-elevated text-muted-foreground border border-border/70",
    Icon: BookOpen,
  },
  CONNECTED: {
    label: "CONNECTED",
    className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
    Icon: Link2,
  },
};

export function EvidenceCard({ evidence, onOpen, state = "NEW" }: Props) {
  const importance = IntelligenceEngine.importanceOf(evidence);
  const style = IntelligenceEngine.styleFor(importance);
  const ImpIcon = ICONS[style.icon];
  const stateMeta = STATE_META[state];
  const StateIcon = stateMeta.Icon;

  return (
    <div className="relative flex flex-col rounded-xl border border-border/70 bg-surface-elevated p-4 shadow-[var(--shadow-noir)]">
      <span
        className={`absolute -right-1.5 -top-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${stateMeta.className}`}
      >
        <StateIcon className="h-2.5 w-2.5" />
        {stateMeta.label}
      </span>

      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-widest text-primary/70">
          {evidence.category}
        </p>
        <span
          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${style.badgeClass}`}
        >
          <ImpIcon className="h-2.5 w-2.5" />
          {style.label}
        </span>
      </div>

      <h3 className="mt-1 font-display text-base text-foreground">
        {evidence.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {evidence.summary}
      </p>
      <button
        onClick={() => onOpen(evidence)}
        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <Search className="h-3.5 w-3.5" />
        자세히 보기
      </button>
    </div>
  );
}
