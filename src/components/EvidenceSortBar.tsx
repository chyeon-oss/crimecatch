import { ArrowDownWideNarrow } from "lucide-react";
import type { EvidenceSortMode } from "@/engine";

interface Props {
  value: EvidenceSortMode;
  onChange: (v: EvidenceSortMode) => void;
}

const OPTIONS: Array<{ value: EvidenceSortMode; label: string }> = [
  { value: "discovery", label: "발견 순서" },
  { value: "importance", label: "중요도" },
  { value: "category", label: "카테고리" },
];

export function EvidenceSortBar({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <ArrowDownWideNarrow className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
        Sort by
      </span>
      <div className="flex gap-1">
        {OPTIONS.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={[
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                active
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border/60 bg-surface-elevated text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
