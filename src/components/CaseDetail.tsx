import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, MapPin, ShieldAlert, UserRound } from "lucide-react";
import type { Case } from "@/types";
import { CaseEngine } from "@/engine";
import { getCaseVisuals } from "@/data/caseVisuals";

/**
 * Pre-investigation briefing. Deliberately short: statements, alibis and
 * detailed dossiers belong to the investigation and unlock there.
 */
export function CaseDetail({ data }: { data: Case }) {
  const visuals = getCaseVisuals(data.id);

  return (
    <main className="mx-auto min-h-[calc(100vh-56px)] w-full max-w-[460px] pb-28">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border/60 bg-surface-elevated">
        {visuals.detailHero ? (
          <img
            src={visuals.detailHero}
            alt="사건 현장"
            className="h-full w-full object-cover brightness-[0.62] saturate-75"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-x-4 bottom-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
            CASE 001 · {data.status}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-foreground">
            {data.title}
          </h1>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5">
        <p className="text-[15px] leading-7 text-foreground/90">{data.subtitle}</p>

        <section className="grid grid-cols-2 gap-2" aria-label="사건 기본 정보">
          <Info icon={Clock3} label="추정 시간" value={data.incidentTime} />
          <Info icon={MapPin} label="장소" value={data.incidentLocation} />
          <Info icon={ShieldAlert} label="난이도" value={data.difficulty} />
          <Info icon={Clock3} label="예상 소요" value={CaseEngine.formatPlayTime(data)} />
        </section>

        <section className="rounded-xl border border-border/60 bg-surface-elevated/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
            사건 브리핑
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{data.description}</p>
        </section>

        <section className="rounded-xl border border-border/60 bg-surface-elevated/60 p-4">
          <div className="flex items-center gap-2 text-primary">
            <UserRound className="h-4 w-4" />
            <p className="font-mono text-[10px] uppercase tracking-[0.24em]">피해자</p>
          </div>
          <p className="mt-3 font-display text-xl text-foreground">{data.victim.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.victim.age}세 · {data.victim.occupation}
          </p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            상세 신상과 관계자 진술은 현장 수사 중 확인됩니다.
          </p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[460px] border-t border-border/60 bg-background/95 p-3 backdrop-blur">
        <Link
          to="/case/$caseId/investigate"
          params={{ caseId: data.slug }}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)]"
        >
          사건 현장으로 이동
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-surface-elevated/50 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 break-words text-xs leading-5 text-foreground">{value}</p>
    </div>
  );
}
