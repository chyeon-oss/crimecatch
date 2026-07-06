import { Link } from "@tanstack/react-router";
import { Calendar, Clock, Gauge, MapPin, User, ArrowRight } from "lucide-react";
import type { Case } from "@/types";
import { CaseEngine } from "@/engine";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3 border-t border-border/60 py-3 first:border-t-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-right text-sm text-foreground">{value}</span>
      </div>
    </div>
  );
}

export function CaseDetail({ data }: { data: Case }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:pt-10">
      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium tracking-wide text-primary">
        {data.status} · CASE FILE
      </span>

      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        {data.title}
      </h1>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-noir)] sm:p-6">
        <h2 className="font-display text-lg text-primary">사건 개요</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {data.description}
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-noir)] sm:p-6">
        <h2 className="font-display text-lg text-primary">사건 정보</h2>
        <div className="mt-3">
          <Row
            icon={User}
            label="피해자"
            value={`${data.victim.name} (${data.victim.age}세, ${data.victim.occupation})`}
          />
          <Row icon={Calendar} label="사건 시각" value={data.incidentTime} />
          <Row icon={MapPin} label="사건 장소" value={data.incidentLocation} />
          <Row icon={Gauge} label="난이도" value={data.difficulty} />
          <Row icon={Clock} label="예상 소요" value={CaseEngine.formatPlayTime(data)} />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Link
            to="/case/$caseId/investigate"
            params={{ caseId: data.slug }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01]"
          >
            수사 시작
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
