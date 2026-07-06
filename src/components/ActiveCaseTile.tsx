import { Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import type { Case } from "@/types";

export function ActiveCaseTile({ activeCase }: { activeCase: Case | null }) {
  if (!activeCase) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-5 text-center text-sm text-muted-foreground">
        현재 배정된 사건이 없습니다. 새로운 사건 파일을 여세요.
      </div>
    );
  }
  return (
    <Link
      to="/case/$caseId/investigate"
      params={{ caseId: activeCase.slug }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/5 p-5 transition-colors hover:bg-primary/10"
    >
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-primary/80">
          ACTIVE CASE
        </p>
        <h3 className="mt-1 font-display text-lg text-foreground">
          {activeCase.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {activeCase.subtitle}
        </p>
      </div>
      <PlayCircle className="h-8 w-8 shrink-0 text-primary" />
    </Link>
  );
}
