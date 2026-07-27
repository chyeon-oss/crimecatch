import { Link } from "@tanstack/react-router";
import { Lock, Clock, CheckCircle2, Sparkles } from "lucide-react";
import type { Case, CaseDifficulty } from "@/types";
import type { DetectiveRank } from "@/types/progress";
import { CaseEngine } from "@/engine";

export interface LockedCaseRosterItem {
  caseNumber: string;
  locked: true;
  title: string;
  subtitle: string;
  difficulty: CaseDifficulty;
  estimatedMinutes: number;
}

export interface PlayableCaseRosterItem {
  caseNumber: string;
  locked: false;
  data: Case;
  completed: boolean;
  rank?: DetectiveRank;
}

export type CaseRosterItem = LockedCaseRosterItem | PlayableCaseRosterItem;

const DIFFICULTY_DOTS: Record<CaseDifficulty, number> = {
  쉬움: 1,
  보통: 2,
  어려움: 3,
};

function DifficultyDots({ difficulty }: { difficulty: CaseDifficulty }) {
  const active = DIFFICULTY_DOTS[difficulty];
  return (
    <div className="flex items-center gap-1" aria-label={`난이도 ${difficulty}`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= active ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function CaseStatusBadge({
  locked,
  completed,
}: {
  locked: boolean;
  completed: boolean;
}) {
  if (locked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-muted-foreground/30 bg-muted/60 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Lock className="h-3 w-3" />
        LOCKED
      </span>
    );
  }
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-200">
        <CheckCircle2 className="h-3 w-3" />
        COMPLETED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
      <Sparkles className="h-3 w-3" />
      AVAILABLE
    </span>
  );
}

function LockedCard({ item }: { item: LockedCaseRosterItem }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-6 opacity-70 grayscale transition-all duration-300">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
      <div className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-muted-foreground/30" />
      <div className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-muted-foreground/30" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
            사건 파일
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-widest text-muted-foreground">
            {item.caseNumber}
          </p>
        </div>
        <CaseStatusBadge locked completed={false} />
      </div>

      <div className="mt-8 flex flex-1 flex-col">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-muted-foreground/30 bg-muted/50">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-foreground/60">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground/70">
          {item.subtitle}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
        <DifficultyDots difficulty={item.difficulty} />
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/70">
          <Clock className="h-3 w-3" />
          약 {item.estimatedMinutes}분
        </span>
      </div>
    </article>
  );
}

function PlayableCard({
  item,
}: {
  item: PlayableCaseRosterItem;
}) {
  const { data, completed, rank, caseNumber } = item;
  const href = `/case/${data.slug}`;

  return (
    <Link
      to={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-noir)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_24px_70px_-18px_color-mix(in_oklab,var(--gold)_30%,transparent)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-primary/40" />
      <div className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-primary/40" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-3 w-3 border-b border-l border-primary/20" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-3 w-3 border-b border-r border-primary/20" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            사건 파일
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-widest text-primary">
            {caseNumber}
          </p>
        </div>
        <CaseStatusBadge locked={false} completed={completed} />
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
          {data.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {data.subtitle}
        </p>

        {completed && rank && (
          <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              최고 등급
            </span>
            <span className="font-mono text-xs font-semibold text-primary">
              {rank}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        <DifficultyDots difficulty={data.difficulty} />
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {CaseEngine.formatPlayTime(data)}
        </span>
      </div>
    </Link>
  );
}

export function CaseSelectionCard({ item }: { item: CaseRosterItem }) {
  if (item.locked) {
    return <LockedCard item={item} />;
  }
  return <PlayableCard item={item} />;
}
