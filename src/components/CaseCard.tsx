import { Link } from "@tanstack/react-router";
import { Clock, Gauge, ArrowRight } from "lucide-react";
import type { CaseData } from "@/lib/mock-cases";

const statusStyles: Record<string, string> = {
  무료: "bg-secondary text-secondary-foreground border-border",
  신규: "bg-primary/15 text-primary border-primary/30",
  프리미엄: "bg-blood/20 text-primary border-primary/40",
};

export function CaseCard({ data }: { data: CaseData }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-noir)] transition-all hover:border-primary/40 hover:-translate-y-0.5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60" />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${statusStyles[data.status]}`}
          >
            {data.status}
          </span>
          <span className="font-display text-xs text-muted-foreground">
            CASE · {data.id.slice(0, 4).toUpperCase()}
          </span>
        </div>

        <h3 className="mt-4 font-display text-xl font-semibold text-foreground sm:text-2xl">
          {data.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {data.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-primary/80" />
            난이도 {data.difficulty}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary/80" />
            {data.playTime}
          </span>
        </div>

        <Link
          to="/case/$caseId"
          params={{ caseId: data.id }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          사건 시작
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
