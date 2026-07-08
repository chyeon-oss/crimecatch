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
  ListChecks,
  Clock,
  Users,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { InvestigationSection } from "@/components/InvestigationSection";

import { EvidenceModal } from "@/components/EvidenceModal";
import { EvidenceLocker } from "@/components/EvidenceLocker";
import { DetectiveNotebook } from "@/components/DetectiveNotebook";

import { CrimeScene } from "@/components/CrimeScene";
import { DiscoveryModal } from "@/components/DiscoveryModal";
import { ActiveQuestions } from "@/components/ActiveQuestions";
import { EvidenceSortBar } from "@/components/EvidenceSortBar";
import { InvestigationBoard } from "@/components/InvestigationBoard";
import { TheoriesPanel } from "@/components/TheoriesPanel";
import { CaseSidebar } from "@/components/workspace/CaseSidebar";
import { PartnerPanel } from "@/components/workspace/PartnerPanel";
import { InvestigationHUD } from "@/components/InvestigationHUD";
import { ObjectivesPanel } from "@/components/ObjectivesPanel";
import { SuspectDatabase } from "@/components/SuspectDatabase";
import { SuspectProfileModal } from "@/components/SuspectProfileModal";
import { InvestigationTimeline } from "@/components/InvestigationTimeline";
import { ObjectiveBanner } from "@/components/ObjectiveBanner";
import { SceneStageTimeline, type SceneStage } from "@/components/SceneStageTimeline";
import { SceneTransitionModal } from "@/components/SceneTransitionModal";

import {
  CaseEngine,
  IntelligenceEngine,
  ObjectivesEngine,
  StoryRuntime,
  SuspectIntelEngine,
  TimelineEngine,
  createBoardState,
  type EvidenceSortMode,
  type SuspectDossier,
} from "@/engine";
import { useCaseRuntime } from "@/hooks/useCaseRuntime";
import { getRuntimeDefinition } from "@/data/runtime";
import type {
  Case,
  Evidence,
  CrimeScene as CrimeSceneData,
  BoardState,
} from "@/types";
import type { CaseDefinition } from "@/types/runtime";

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

/**
 * Fallback runtime definition for cases that haven't been ported to the
 * runtime engine yet — one permissive scene that exposes every hotspot,
 * suspect, and evidence at once so existing cases keep working unchanged.
 */
function buildFallbackRuntime(c: Case): CaseDefinition {
  return {
    id: c.id,
    title: c.title,
    scenes: [
      {
        id: "default",
        title: c.title,
        description: c.description,
        objective: "현장을 조사하고 증거를 확보하세요.",
        status: "INVESTIGATION",
        availableHotspotIds: c.crimeScene?.hotspots.map((h) => h.id) ?? [],
        availableSuspectIds: c.suspects.map((s) => s.id),
        evidenceRewardIds: c.evidence.map((e) => e.id),
        nextSceneId: null,
      },
    ],
    evidence: c.evidence.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.summary,
      category: e.category,
      importance: e.importance ?? "COMMON",
      location: e.location,
      discovered: false,
    })),
    questions: (c.questions ?? []).map((q) => ({
      id: q.id,
      title: q.text,
      description: "",
      status: "LOCKED" as const,
      unlockedByEvidenceIds: q.generatedByEvidenceIds,
      solvedByEvidenceIds: q.solvedByEvidenceIds,
    })),
    hotspots: (c.crimeScene?.hotspots ?? []).map((h) => ({
      id: h.id,
      title: h.label,
      status: "AVAILABLE" as const,
      revealsEvidenceIds: h.revealsEvidenceIds,
    })),
    suspectIds: c.suspects.map((s) => s.id),
    startSceneId: "default",
  };
}

function InvestigatePage() {
  const { data } = Route.useLoaderData() as { data: Case };

  const runtimeDef = useMemo<CaseDefinition>(
    () => getRuntimeDefinition(data.id) ?? buildFallbackRuntime(data),
    [data],
  );
  const {
    state: runtimeState,
    currentScene,
    availableHotspots,
    actions,
  } = useCaseRuntime(runtimeDef);

  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const [openSuspect, setOpenSuspect] = useState<SuspectDossier | null>(null);

  const [discoveredAt, setDiscoveredAt] = useState<Map<string, number>>(
    () => new Map(),
  );
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [investigatedHotspotIds, setInvestigatedHotspotIds] = useState<
    Set<string>
  >(new Set());
  const [discoveryQueue, setDiscoveryQueue] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<EvidenceSortMode>("discovery");
  const [boardState, setBoardState] = useState<BoardState>(() =>
    createBoardState(),
  );

  const evidenceById = useMemo(
    () => new Map<string, Evidence>(data.evidence.map((e) => [e.id, e])),
    [data.evidence],
  );

  const discoveredIds = runtimeState.discoveredEvidence;
  const discoveredSet = useMemo(
    () => new Set(discoveredIds),
    [discoveredIds],
  );

  // Track newly-discovered evidence coming from runtime → discovery queue.
  const seenRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const added: string[] = [];
    for (const id of discoveredIds) {
      if (!seenRef.current.has(id) && evidenceById.has(id)) {
        seenRef.current.add(id);
        added.push(id);
      }
    }
    if (added.length) {
      const now = Date.now();
      setDiscoveredAt((prev) => {
        const next = new Map(prev);
        added.forEach((id, i) => {
          if (!next.has(id)) next.set(id, now + i);
        });
        return next;
      });
      setDiscoveryQueue((q) => [...q, ...added]);
    }
  }, [discoveredIds, evidenceById]);

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

  // Scene-scoped crime scene fed into the existing CrimeScene component so
  // only the current scene's hotspots are actionable — no whole-map dump.
  const scopedScene: CrimeSceneData | null = useMemo(() => {
    if (!currentScene || availableHotspots.length === 0) return null;
    return {
      imagePrompt: currentScene.description,
      hotspots: availableHotspots.map((h) => ({
        id: h.id,
        label: h.title,
        hint: "",
        revealsEvidenceIds: h.revealsEvidenceIds,
      })),
    };
  }, [currentScene, availableHotspots]);

  const handleInvestigate = (h: { id: string }) => {
    setInvestigatedHotspotIds((prev) => {
      if (prev.has(h.id)) return prev;
      const next = new Set(prev);
      next.add(h.id);
      return next;
    });
    actions.investigateHotspot(h.id);
  };

  const openEvidenceAndMarkRead = (e: Evidence) => {
    setOpenEvidence(e);
    setReadIds((prev) => {
      if (prev.has(e.id)) return prev;
      const next = new Set(prev);
      next.add(e.id);
      return next;
    });
    actions.readEvidence(e.id);
  };

  const openSuspectAndInterview = (d: SuspectDossier) => {
    setOpenSuspect(d);
    // Interviewing happens the moment the detective opens the profile —
    // for now that IS the interrogation surface.
    actions.interviewSuspect(d.suspect.id);
  };

  const currentDiscovery = discoveryQueue[0]
    ? (evidenceById.get(discoveryQueue[0]) ?? null)
    : null;
  const continueDiscovery = () => setDiscoveryQueue((q) => q.slice(1));

  const totalHotspots = availableHotspots.length;
  const investigatedCount = availableHotspots.filter((h) =>
    investigatedHotspotIds.has(h.id),
  ).length;

  const activeQuestionsCount = runtimeState.activeQuestions.length;

  const storyState = useMemo(
    () =>
      StoryRuntime.derive({
        case: data,
        discoveredIds: discoveredSet,
        readIds,
        investigatedHotspotIds,
        board: boardState,
      }),
    [data, discoveredSet, readIds, investigatedHotspotIds, boardState],
  );

  const objectives = useMemo(
    () =>
      ObjectivesEngine.derive({
        case: data,
        discoveredIds: discoveredSet,
        readIds,
        investigatedHotspotIds,
        board: boardState,
      }),
    [data, discoveredSet, readIds, investigatedHotspotIds, boardState],
  );
  const objectivesSummary = ObjectivesEngine.summary(objectives);

  const allSuspectDossiers = useMemo(
    () =>
      SuspectIntelEngine.all({
        case: data,
        discoveredIds: discoveredSet,
        readIds,
      }),
    [data, discoveredSet, readIds],
  );
  const sceneSuspectIds = new Set(currentScene?.availableSuspectIds ?? []);
  const suspectDossiers = allSuspectDossiers.filter((d) =>
    sceneSuspectIds.has(d.suspect.id),
  );
  const showSuspects =
    (currentScene?.availableSuspectIds.length ?? 0) > 0 &&
    (currentScene?.status === "INTERROGATION" ||
      currentScene?.status === "ACCUSATION" ||
      currentScene?.status === "RECONSTRUCTION");
  const primeSuspectCount = suspectDossiers.filter(
    (d) => d.status === "PRIME_SUSPECT",
  ).length;

  const timelineEntries = useMemo(
    () => TimelineEngine.derive({ case: data, discoveredIds: discoveredSet }),
    [data, discoveredSet],
  );
  const timelineSummary = TimelineEngine.summary(timelineEntries);

  const canAccuse = currentScene?.status === "ACCUSATION";

  const stageLabelFor = (status: string, fallback: string): string => {
    switch (status) {
      case "INVESTIGATION":
        return "현장 도착";
      case "ANALYSIS":
        return "증거 분석";
      case "INTERROGATION":
        return "용의자 조사";
      case "ACCUSATION":
      case "RECONSTRUCTION":
        return "최종 추리";
      default:
        return fallback;
    }
  };
  const sceneStages: SceneStage[] = useMemo(
    () =>
      runtimeDef.scenes.map((s) => ({
        id: s.id,
        label: stageLabelFor(s.status, s.title.replace(/^SCENE\s*\d+\s*—\s*/i, "")),
      })),
    [runtimeDef.scenes],
  );

  // Detect automatic scene transitions to surface a "수사 단계 갱신" modal.
  const prevSceneIdRef = useRef<string | null>(runtimeState.currentScene);
  const [transition, setTransition] = useState<{
    prevTitle: string | null;
    newTitle: string | null;
    newObjective: string | null;
  } | null>(null);
  useEffect(() => {
    const prevId = prevSceneIdRef.current;
    const curId = runtimeState.currentScene;
    if (prevId && curId && prevId !== curId) {
      const prev = runtimeDef.scenes.find((s) => s.id === prevId) ?? null;
      const next = runtimeDef.scenes.find((s) => s.id === curId) ?? null;
      setTransition({
        prevTitle: prev?.title ?? null,
        newTitle: next?.title ?? null,
        newObjective: next?.objective ?? runtimeState.currentObjective ?? null,
      });
    }
    prevSceneIdRef.current = curId;
  }, [runtimeState.currentScene, runtimeState.currentObjective, runtimeDef.scenes]);


  return (
    <div className="flex min-h-screen flex-col noir-grain">
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

      <SceneStageTimeline
        stages={sceneStages}
        currentSceneId={runtimeState.currentScene}
        completedSceneIds={runtimeState.completedScenes}
      />

      <InvestigationHUD
        case={data}
        storyState={storyState}
        discoveredCount={discoveredIds.length}
        totalEvidence={data.evidence.length}
      />

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {/* LEFT: Case briefing */}
        <ResizablePanel defaultSize={22} minSize={16} maxSize={30}>
          <CaseSidebar
            case={data}
            storyState={storyState}
            objectiveText={runtimeState.currentObjective ?? undefined}
            discoveredCount={discoveredIds.length}
            totalEvidence={data.evidence.length}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* CENTER: Investigation scene */}
        <ResizablePanel defaultSize={54} minSize={40}>
          <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 pb-16 pt-6">
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  ACTIVE INVESTIGATION
                </p>
                <h1 className="mt-1 font-display text-xl font-semibold text-foreground sm:text-2xl">
                  {data.title}
                </h1>
              </div>

              {currentScene && (
                <ObjectiveBanner
                  sceneTitle={currentScene.title}
                  objective={runtimeState.currentObjective ?? currentScene.objective}
                  gameStatus={runtimeState.gameStatus}
                  progress={runtimeState.investigationProgress}
                />
              )}

              <div className="grid gap-4">
                <InvestigationSection
                  icon={ListChecks}
                  title="Investigation Objectives"
                  subtitle={`${objectivesSummary.completed} / ${objectivesSummary.total} 완료 · ${objectivesSummary.active} 진행 중`}
                >
                  <ObjectivesPanel objectives={objectives} />
                </InvestigationSection>

                {scopedScene && (
                  <InvestigationSection
                    icon={Footprints}
                    title={currentScene?.title ?? "현재 씬"}
                    subtitle={`${investigatedCount} / ${totalHotspots} 지점 조사 완료`}
                  >
                    <CrimeScene
                      scene={scopedScene}
                      evidenceById={evidenceById}
                      investigatedIds={investigatedHotspotIds}
                      onInvestigate={handleInvestigate}
                    />
                  </InvestigationSection>
                )}

                {showSuspects && (
                  <InvestigationSection
                    icon={Users}
                    title="Suspect Database"
                    subtitle={
                      primeSuspectCount > 0
                        ? `${suspectDossiers.length}명 프로파일 · 유력 용의자 ${primeSuspectCount}명`
                        : `${suspectDossiers.length}명 프로파일 등록`
                    }
                  >
                    <SuspectDatabase
                      dossiers={suspectDossiers}
                      onOpen={openSuspectAndInterview}
                    />
                  </InvestigationSection>
                )}

                <InvestigationSection
                  icon={Clock}
                  title="Investigation Timeline"
                  subtitle={`${timelineSummary.revealed} / ${timelineSummary.total} 시간대 확인${
                    timelineSummary.hidden > 0
                      ? ` · ${timelineSummary.hidden}개 미확인`
                      : ""
                  }`}
                >
                  <InvestigationTimeline
                    entries={timelineEntries}
                    onOpenEvidence={openEvidenceAndMarkRead}
                  />
                </InvestigationSection>

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
                      <EvidenceLocker
                        evidence={discoveredEvidence}
                        discoveredAt={discoveredAt}
                        onOpen={openEvidenceAndMarkRead}
                        stateOf={(e) =>
                          IntelligenceEngine.stateOf(e, intelligenceState)
                        }
                      />
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
                  title="Detective's Notebook"
                  subtitle="용의자·타임라인·증거·의문·가설을 자유롭게 기록하세요 (Markdown 지원)"
                >
                  <DetectiveNotebook caseId={data.id} />
                </InvestigationSection>

                {canAccuse ? (
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
                ) : (
                  <InvestigationSection
                    icon={Gavel}
                    title="최종 추리"
                    subtitle="아직 조사가 부족합니다. 다음 씬으로 진행하세요."
                  >
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 p-3 text-xs text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      SCENE 04에 도달하면 범인 지목이 가능해집니다.
                    </div>
                  </InvestigationSection>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* RIGHT: Detective Partner */}
        <ResizablePanel defaultSize={24} minSize={18} maxSize={34}>
          <PartnerPanel
            case={data}
            intelligenceState={intelligenceState}
            storyState={storyState}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

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

      <SuspectProfileModal
        dossier={openSuspect}
        onClose={() => setOpenSuspect(null)}
      />

      <SceneTransitionModal
        open={transition !== null}
        previousSceneTitle={transition?.prevTitle ?? null}
        newSceneTitle={transition?.newTitle ?? null}
        newObjective={transition?.newObjective ?? null}
        onContinue={() => setTransition(null)}
      />
    </div>
  );
}
