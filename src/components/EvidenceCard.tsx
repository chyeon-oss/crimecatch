import { Search } from "lucide-react";
import type { Evidence } from "@/types";

interface Props {
  evidence: Evidence;
  onOpen: (e: Evidence) => void;
  isNew?: boolean;
}

export function EvidenceCard({ evidence, onOpen, isNew }: Props) {
  return (
    <div className="relative flex flex-col rounded-xl border border-border/70 bg-surface-elevated p-4 shadow-[var(--shadow-noir)]">
      {isNew && (
        <span className="absolute -right-1.5 -top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)]">
          NEW
        </span>
      )}
      <p className="text-[11px] uppercase tracking-widest text-primary/70">
        {evidence.category}
      </p>
      <h3 className="mt-1 font-display text-base text-foreground">{evidence.title}</h3>
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
