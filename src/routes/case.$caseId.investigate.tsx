import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Archive,
  NotebookPen,
  Gavel,
  Lock,
  Footprints,
  HelpCircle,
  LayoutGrid,
  Lightbulb,
} from "lucide-react";
import { useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { InvestigationSection } from "@/components/InvestigationSection";
import { EvidenceCard } from "@/components/EvidenceCard";
import { EvidenceModal } from "@/components/EvidenceModal";
import { DetectiveNote } from "@/components/DetectiveNote";
import { CrimeScene } from "@/components/CrimeScene";
import { DiscoveryModal } from "@/components/DiscoveryModal";
import { ActiveQuestions } from "@/components/ActiveQuestions";
import { EvidenceSortBar } from "@/components/EvidenceSortBar";
import { InvestigationBoard } from "@/components/InvestigationBoard";
import { TheoriesPanel } from "@/components/TheoriesPanel";
import {
  CaseEngine,
  IntelligenceEngine,
  createBoardState,
  type EvidenceSortMode,
} from "@/engine";
import type { Case, Evidence, CrimeSceneHotspot, BoardState } from "@/types";


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
  const { data } = Route.useLoaderData() as { data: Case };
  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);

  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [investigatedHotspotIds, setInvestigatedHotspotIds] = useState<Set<string>>(
    new Set(),
  );
  const [discoveryQueue, setDiscoveryQueue] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<EvidenceSortMode>("discovery");
  const [boardState, setBoardState] = useState<BoardState>(() => createBoardState());


  const evidenceById = useMemo(
    () => new Map<string, Evidence>(data.evidence.map((e) => [e.id, e])),
    [data.evidence],
  );

  const discoveredSet = useMemo(() => new Set(discoveredIds), [discoveredIds]);

  const intelligenceState = useMemo(
    () => ({ discoveredIds: discoveredSet, readIds }),
    [discoveredSet, readIds],
  );

  const discoveredEvidence = useMemo(() => {
    const list = discoveredIds
      .map((id) => evidenceById.get(id))
      .filter((e): e is Evidence => !!e);
    return IntelligenceEngine.sortEvidence(list, discoveredIds, sortMode);
  }, [discoveredIds, evidenceById, sortMode]);

  const handleInvestigate = (h: CrimeSceneHotspot) => {
    setInvestigatedHotspotIds((prev) => {
      const next = new Set(prev);
      next.add(h.id);
      return next;
    });
    if (h.revealsEvidenceIds.length === 0) return;
    const added: string[] = [];
    setDiscoveredIds((prev) => {
      const set = new Set(prev);
      for (const id of h.revealsEvidenceIds) {
        if (!set.has(id) && evidenceById.has(id)) {
          set.add(id);
          added.push(id);
        }
      }
      return Array.from(set);
    });
    if (added.length) {
      setDiscoveryQueue((q) => [...q, ...added]);
    }
  };

  const openEvidenceAndMarkRead = (e: Evidence) => {
    setOpenEvidence(e);
    setReadIds((prev) => {
      if (prev.has(e.id)) return prev;
      const next = new Set(prev);
      next.add(e.id);
      return next;
    });
  };

  const currentDiscovery = discoveryQueue[0]
    ? evidenceById.get(discoveryQueue[0]) ?? null
    : null;
  const continueDiscovery = () =>
    setDiscoveryQueue((q) => q.slice(1));

  const totalHotspots = data.crimeScene?.hotspots.length ?? 0;
  const investigatedCount = investigatedHotspotIds.size;

  const activeQuestionsCount = IntelligenceEngine.visibleQuestions(
    data,
    intelligenceState,
  ).filter((q) => q.status === "active").length;

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
            ACTIVE INVESTIGATION
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            수사 중: {data.title}
          </h1>
        </div>

        <div className="grid gap-4">
          {data.crimeScene && (
            <InvestigationSection
              icon={Footprints}
              title="범죄 현장"
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
              <div className="space-y-3">
                <EvidenceSortBar value={sortMode} onChange={setSortMode} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {discoveredEvidence.map((e) => (
                    <EvidenceCard
                      key={e.id}
                      evidence={e}
                      onOpen={openEvidenceAndMarkRead}
                      state={IntelligenceEngine.stateOf(e, intelligenceState)}
                    />
                  ))}
                </div>
              </div>
            )}
          </InvestigationSection>

          <InvestigationSection
            icon={LayoutGrid}
            title="Investigation Board"
            subtitle={
              boardState.pins.length
                ? `${boardState.pins.length}개 핀 · ${boardState.connections.length}개 연결`
                : "증거·용의자·시간대를 핀 하여 관계를 시각화하세요"
            }
          >
            <InvestigationBoard
              case={data}
              state={boardState}
              onChange={setBoardState}
              discoveredEvidenceIds={discoveredSet}
            />
          </InvestigationSection>

          <InvestigationSection
            icon={Lightbulb}
            title="Current Theories"
            subtitle={
              boardState.theories.length
                ? `${boardState.theories.length}개의 가설`
                : "아직 세워진 가설이 없습니다"
            }
          >
            <TheoriesPanel state={boardState} onChange={setBoardState} />
          </InvestigationSection>

          <InvestigationSection
            icon={HelpCircle}
            title="Open Questions"
            subtitle={
              activeQuestionsCount > 0
                ? `${activeQuestionsCount}개의 의문이 남아 있습니다`
                : "지금은 새로운 의문이 없습니다"
            }
          >
            <ActiveQuestions case={data} state={intelligenceState} />
          </InvestigationSection>


          <InvestigationSection
            icon={NotebookPen}
            title="추리 노트"
            subtitle="당신의 가설을 기록하세요"
          >
            <DetectiveNote storageKey={`note-${data.id}`} />
          </InvestigationSection>

          <InvestigationSection
            icon={Gavel}
            title="최종 추리"
            subtitle="충분히 조사했다면 범인을 지목하세요"
          >
            <Link
              to="/case/$caseId/accuse"
              params={{ caseId: data.slug }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01]"
            >
              <Gavel className="h-4 w-4" />
              범인 지목하기
            </Link>
          </InvestigationSection>
        </div>
      </main>

      <EvidenceModal
        evidence={openEvidence}
        case={data}
        discoveredIds={discoveredSet}
        onClose={() => setOpenEvidence(null)}
        onOpenEvidence={openEvidenceAndMarkRead}
      />

      <DiscoveryModal
        evidence={currentDiscovery}
        remaining={Math.max(0, discoveryQueue.length - 1)}
        onContinue={continueDiscovery}
      />
    </div>
  );
}
