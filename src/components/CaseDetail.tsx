import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Case, Suspect } from "@/types";
import { CaseEngine } from "@/engine";
import { cn } from "@/lib/utils";

function Section({
  number,
  title,
  children,
  className,
}: {
  number?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-noir)] sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        {number && (
          <span className="font-mono text-xs font-semibold text-primary/70">
            {number}
          </span>
        )}
        <h2 className="font-display text-lg font-medium text-primary">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Meta({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | number;
  className?: string;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium leading-relaxed text-foreground break-words">
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium leading-relaxed text-foreground break-words">
        {value}
      </span>
    </div>
  );
}

function NoteList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
          <span className="text-sm leading-relaxed text-muted-foreground">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SuspectCard({ suspect }: { suspect: Suspect }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-medium text-foreground">
            {suspect.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {suspect.age}세 · {suspect.occupation}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border/80 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {suspect.relationship}
        </span>
      </div>

      <div className="mt-3 border-t border-border/40 pt-3">
        <Field label="성격" value={suspect.personality} />
        <Field label="최초 진술" value={suspect.initialStatement} />
        <Field label="알리바이" value={suspect.alibi} />
      </div>

      {(suspect.firstImpression || suspect.policeNotes) && (
        <div className="mt-3 border-t border-border/40 pt-3">
          <Field label="첫인상" value={suspect.firstImpression} />
          <Field label="수사 메모" value={suspect.policeNotes} />
        </div>
      )}
    </div>
  );
}

export function CaseDetail({ data }: { data: Case }) {
  const victim = data.victim;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:pt-10">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium tracking-wide text-primary">
          {data.status} · CASE FILE
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          ID: {data.slug}
        </span>
      </div>

      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        {data.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{data.subtitle}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Meta label="사건 시각" value={data.incidentTime} />
        <Meta label="사건 장소" value={data.incidentLocation} />
        <Meta label="난이도" value={data.difficulty} />
        <Meta label="예상 소요" value={CaseEngine.formatPlayTime(data)} />
      </div>

      <Section number="01" title="Case Summary" className="mt-6">
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {data.description}
        </p>
      </Section>

      <Section number="02" title="Victim" className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Meta label="이름" value={victim.name} />
          <Meta label="성별" value={victim.gender} />
          <Meta label="나이" value={victim.age ? `${victim.age}세` : undefined} />
          <Meta label="직업" value={victim.occupation} />
          <Meta label="근속" value={victim.tenure} />
          <Meta label="입사" value={victim.employeeSince} />
        </div>

        <hr className="my-4 border-border/40" />

        <Field label="프로필" value={victim.profile} />

        {(victim.health || victim.family) && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Meta label="건강" value={victim.health} />
            <Meta label="가족" value={victim.family} />
          </div>
        )}

        {victim.companyReputation && (
          <div className="mt-4 rounded-lg border border-border/60 bg-surface p-4">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">
              회사 내 평판
            </h4>
            <div className="mt-2 grid gap-1">
              <Field label="상사" value={victim.companyReputation.superior} />
              <Field label="동료" value={victim.companyReputation.colleague} />
              <Field label="후배" value={victim.companyReputation.junior} />
            </div>
          </div>
        )}

        {(victim.clothingAtIncident || victim.personalBelongings || victim.deskItems) && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Meta label="착의" value={victim.clothingAtIncident?.join(", ")} />
            <Meta label="소지품" value={victim.personalBelongings?.join(", ")} />
            <Meta label="책상 위" value={victim.deskItems?.join(", ")} />
          </div>
        )}
      </Section>

      <Section number="03" title="Initial Police Notes" className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Meta label="사인" value={victim.causeOfDeath} />
          <Meta label="최종 공식 일정" value={victim.lastOfficialSchedule} />
          <Meta label="최종 확인 위치" value={victim.lastConfirmedLocation} />
          <Meta label="최초 신고 시각" value={victim.firstReportTime} />
        </div>
        <Field label="최초 신고 내용" value={victim.firstReport} />
        <div className="mt-4">
          <h4 className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            초기 수사 메모
          </h4>
          <NoteList items={victim.initialPoliceNotes} />
        </div>
      </Section>

      <Section number="04" title="Recent Activity" className="mt-4">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              최근 업무
            </h4>
            <NoteList items={victim.recentWork} />
          </div>
          <div>
            <h4 className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              최근 2주 동향
            </h4>
            <NoteList items={victim.recentTwoWeeks} />
          </div>
          <div>
            <h4 className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              주변 인상
            </h4>
            <NoteList items={victim.recentImpressions} />
          </div>
        </div>
      </Section>

      <Section number="05" title="Known Facts" className="mt-4">
        <div className="relative">
          {data.timeline.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
                {idx < data.timeline.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-border/60" />
                )}
              </div>
              <div className="pb-5">
                <span className="font-mono text-xs text-primary">{event.time}</span>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Suspect Dossiers" className="mt-4">
        <div className="space-y-4">
          {data.suspects.map((suspect) => (
            <SuspectCard key={suspect.id} suspect={suspect} />
          ))}
        </div>
      </Section>

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
