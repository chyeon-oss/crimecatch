import { MessageCircle, User } from "lucide-react";
import type { Suspect } from "@/types";

interface Props {
  suspect: Suspect;
  onInterrogate: (s: Suspect) => void;
}

export function SuspectCard({ suspect, onInterrogate }: Props) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface-elevated p-4 shadow-[var(--shadow-noir)]">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-foreground">
            {suspect.name}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {suspect.age}세 · {suspect.occupation}
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {suspect.relationship}
          </p>
        </div>
      </div>
      <button
        onClick={() => onInterrogate(suspect)}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        심문하기
      </button>
    </div>
  );
}
