import { Link } from "@tanstack/react-router";
import { Clock, Users, Target, Lock, CheckCircle2, ArrowUpRight, Gauge } from "lucide-react";
import type { Case } from "@/types";
import { CaseEngine } from "@/engine";

type DossierStatus = "LOCKED" | "AVAILABLE" | "COMPLETED";

// Deterministic pseudo-metrics derived from case id.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function formatPlayers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const statusMeta: Record<DossierStatus, { label: string; className: string; Icon: typeof Lock }> = {
  LOCKED: {
    label: "잠김",
    className: "border-muted-foreground/30 bg-background/60 text-muted-foreground",
    Icon: Lock,
  },
  AVAILABLE: {
    label: "수사 가능",
    className: "border-primary/50 bg-primary/10 text-primary",
    Icon: Target,
  },
  COMPLETED: {
    label: "해결 완료",
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
    Icon: CheckCircle2,
  },
};


const difficultyMeta: Record<string, { dots: number; tone: string }> = {
  "쉬움": { dots: 1, tone: "text-emerald-300" },
  "보통": { dots: 2, tone: "text-primary" },
  "어려움": { dots: 3, tone: "text-blood" },
};

export function DossierCard({ data, index }: { data: Case; index: number }) {
  const seed = hash(data.id);
  const players = 300 + (seed % 4200);
  const completion = 12 + (seed % 68);
  const status: DossierStatus = data.status === "프리미엄" ? "LOCKED" : "AVAILABLE";
  const meta = statusMeta[status];
  const StatusIcon = meta.Icon;
  const diff = difficultyMeta[data.difficulty] ?? difficultyMeta["보통"];
  const caseNumber = String(index + 1).padStart(3, "0");
  const locked = status === "LOCKED";

  const inner = (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_60px_-15px_color-mix(in_oklab,var(--gold)_35%,transparent)]"
    >
      {/* Top gold hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Corner registration marks */}
      <div className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-primary/40" />
      <div className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-primary/40" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-primary/20" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-primary/20" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            사건 파일
          </p>
          <p className="mt-0.5 font-mono text-lg font-semibold tracking-widest text-primary">
            № {caseNumber}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${meta.className}`}
        >
          <StatusIcon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-6 font-display text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {data.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {data.subtitle}
      </p>

      {/* Divider */}
      <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Stats grid */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
        <div>
          <dt className="flex items-center gap-1.5 font-mono uppercase tracking-widest text-muted-foreground/70">
            <Gauge className="h-3 w-3" /> 난이도
          </dt>
          <dd className={`mt-1 flex items-center gap-1 font-medium ${diff.tone}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-4 rounded-full ${i < diff.dots ? "bg-current" : "bg-current/20"}`}
              />
            ))}
            <span className="ml-1.5">{data.difficulty}</span>
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 font-mono uppercase tracking-widest text-muted-foreground/70">
            <Clock className="h-3 w-3" /> 소요 시간
          </dt>
          <dd className="mt-1 font-medium text-foreground">{CaseEngine.formatPlayTime(data)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 font-mono uppercase tracking-widest text-muted-foreground/70">
            <Users className="h-3 w-3" /> 참여 형사
          </dt>
          <dd className="mt-1 font-medium text-foreground">{formatPlayers(players)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 font-mono uppercase tracking-widest text-muted-foreground/70">
            <Target className="h-3 w-3" /> 해결률
          </dt>
          <dd className="mt-1 font-medium text-foreground">{completion}%</dd>
        </div>
      </dl>

      {/* Footer CTA */}
      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {locked ? "열람 권한 필요" : "사건 파일 열기"}
        </span>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
            locked
              ? "border-muted-foreground/30 text-muted-foreground"
              : "border-primary/40 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[var(--shadow-gold)]"
          }`}
        >
          {locked ? <Lock className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
        </span>
      </div>

    </article>
  );

  if (locked) {
    return <div className="cursor-not-allowed opacity-70">{inner}</div>;
  }

  return (
    <Link to="/case/$caseId" params={{ caseId: data.slug }} className="block h-full">
      {inner}
    </Link>
  );
}
