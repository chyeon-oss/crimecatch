import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  FileText,
  Archive,
  Users,
  NotebookPen,
  Gavel,
  User,
  Calendar,
  MapPin,
  Clock,
  Footprints,
  Lock,
} from "lucide-react";
import { useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { InvestigationSection } from "@/components/InvestigationSection";
import { EvidenceCard } from "@/components/EvidenceCard";
import { EvidenceModal } from "@/components/EvidenceModal";
import { SuspectCard } from "@/components/SuspectCard";
import { SuspectModal } from "@/components/SuspectModal";
import { DetectiveNote } from "@/components/DetectiveNote";
import { CrimeScene } from "@/components/CrimeScene";
import { CaseEngine } from "@/engine";
import type { Evidence, Suspect, CrimeSceneHotspot } from "@/types";

export const Route = createFileRoute("/case/$caseId/investigate")({
  loader: ({ params }) => {
    const data = CaseEngine.get(params.caseId);
    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `수사 중: ${loaderData.data.title} — CaseNote` }]
      : [{ title: "수사 — CaseNote" }, { name: "robots", content: "noindex" }],
  }),
  component: InvestigatePage,
});

function InvestigatePage() {
  const { data } = Route.useLoaderData();
  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const [openSuspect, setOpenSuspect] = useState<Suspect | null>(null);

  // Discovery state — local only, ready for a future sync/AI layer.
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [investigatedHotspotIds, setInvestigatedHotspotIds] = useState<Set<string>>(
    new Set(),
  );

  const evidenceById = useMemo(
    () => new Map(data.evidence.map((e) => [e.id, e])),
    [data.evidence],
  );

  const discoveredEvidence = useMemo(
    () =>
      discoveredIds
        .map((id) => evidenceById.get(id))
        .filter((e): e is Evidence => !!e),
    [discoveredIds, evidenceById],
  );

  const handleInvestigate = (h: CrimeSceneHotspot) => {
    setInvestigatedHotspotIds((prev) => {
      const next = new Set(prev);
      next.add(h.id);
      return next;
    });
    if (h.revealsEvidenceIds.length === 0) return;
    setDiscoveredIds((prev) => {
      const set = new Set(prev);
      const added: string[] = [];
      for (const id of h.revealsEvidenceIds) {
        if (!set.has(id) && evidenceById.has(id)) {
          set.add(id);
          added.push(id);
        }
      }
      if (added.length) {
        setNewIds((n) => {
          const nn = new Set(n);
          added.forEach((id) => nn.add(id));
          return nn;
        });
      }
      return Array.from(set);
    });
  };

  const openEvidenceAndClearNew = (e: Evidence) => {
    setOpenEvidence(e);
    setNewIds((n) => {
      if (!n.has(e.id)) return n;
      const nn = new Set(n);
      nn.delete(e.id);
      return nn;
    });
  };

  const totalHotspots = data.crimeScene?.hotspots.length ?? 0;
  const investigatedCount = investigatedHotspotIds.size;

  return (
    <div className="min-h-screen noir-grain">
      <TopBar
        to="/case/$caseId"
        label="사건 정보로"
        right={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            수사 진행 중
          </span>
        }
      />

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:pt-10">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            CASE FILE
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {data.title}
          </h1>
        </div>

        <div className="grid gap-4">
          <InvestigationSection icon={FileText} title="사건 개요" subtitle="지금까지 확인된 사실">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data.subtitle}
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <InfoTile
                icon={User}
                label="피해자"
                value={`${data.victim.name} (${data.victim.age}세)`}
              />
              <InfoTile icon={Calendar} label="사건 시각" value={data.incidentTime} />
              <InfoTile icon={MapPin} label="사건 장소" value={data.incidentLocation} />
            </dl>
          </InvestigationSection>

          {data.crimeScene && (
            <InvestigationSection
              icon={Footprints}
              title="사건 현장"
              subtitle={`${investigatedCount} / ${totalHotspots} 지점 조사 완료`}
            >
              <CrimeScene
                scene={data.crimeScene}
                evidenceById={evidenceById}
                investigatedIds={investigatedHotspotIds}
                onInvestigate={handleInvestigate}
              />
            </InvestigationSection>
          )}

          <InvestigationSection
            icon={Archive}
            title="증거 보관함"
            subtitle={
              discoveredEvidence.length
                ? `${discoveredEvidence.length}개의 증거 확보`
                : "아직 발견된 증거가 없습니다"
            }
          >
            {discoveredEvidence.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 py-8 text-center">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  현장을 조사하면 증거가 이곳에 보관됩니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {discoveredEvidence.map((e) => (
                  <EvidenceCard
                    key={e.id}
                    evidence={e}
                    onOpen={openEvidenceAndClearNew}
                    isNew={newIds.has(e.id)}
                  />
                ))}
              </div>
            )}
          </InvestigationSection>

          <InvestigationSection
            icon={Users}
            title="용의자 목록"
            subtitle={`${data.suspects.length}명의 용의자`}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.suspects.map((s) => (
                <SuspectCard key={s.id} suspect={s} onInterrogate={setOpenSuspect} />
              ))}
            </div>
          </InvestigationSection>

          <InvestigationSection
            icon={Clock}
            title="사건 타임라인"
            subtitle={`${data.timeline.length}개의 확인된 사건`}
          >
            <ol className="relative space-y-3 border-l border-border/60 pl-4">
              {data.timeline.map((t, i) => (
                <li key={i} className="text-sm">
                  <span className="absolute -left-1 mt-1.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-[11px] uppercase tracking-wider text-primary/70">
                    {t.time}
                  </p>
                  <p className="text-foreground/90">{t.description}</p>
                </li>
              ))}
            </ol>
          </InvestigationSection>

          <InvestigationSection
            icon={NotebookPen}
            title="추리 노트"
            subtitle="당신의 가설을 기록하세요"
          >
            <DetectiveNote storageKey={`note-${data.id}`} />
          </InvestigationSection>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Link
            to="/case/$caseId/accuse"
            params={{ caseId: data.slug }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01]"
          >
            <Gavel className="h-4 w-4" />
            범인 지목하기
          </Link>
        </div>
      </div>

      <EvidenceModal evidence={openEvidence} onClose={() => setOpenEvidence(null)} />
      <SuspectModal suspect={openSuspect} onClose={() => setOpenSuspect(null)} />
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-surface-elevated px-3 py-2">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 text-primary/70" />
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}
