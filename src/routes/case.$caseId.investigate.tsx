import { createFileRoute, notFound } from "@tanstack/react-router";
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
import { RuntimeDebugPanel } from "@/components/RuntimeDebugPanel";
import { CaseIntro, shouldShowIntro } from "@/components/CaseIntro";
import { CaseLockedGuard } from "@/components/CaseLockedGuard";
import { caseAccess, caseCode } from "@/lib/caseAccess";
import { useProgress } from "@/state/progressStore";

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
import { useDialogueRuntime } from "@/hooks/useDialogueRuntime";
import { getRuntimeDefinition } from "@/data/runtime";
import { getCaseDialogue } from "@/data/dialogue";
import { getScenePresentation } from "@/data/scenePresentation";
import {
  MobileInvestigationShell,
  type ShellTab,
} from "@/components/mobile/MobileInvestigationShell";
import { SceneSurface } from "@/components/mobile/SceneSurface";
import { ConversationSurface } from "@/components/mobile/ConversationSurface";
import { InterviewHub } from "@/components/mobile/InterviewHub";
import { InterviewRoom } from "@/components/mobile/InterviewRoom";
import { EvidenceSheet } from "@/components/mobile/EvidenceSheet";
import { MobileDeduction } from "@/components/mobile/MobileDeduction";
import { loadReadIds, saveReadIds } from "@/lib/readEvidence";

import { useInterviewRuntime } from "@/hooks/useInterviewRuntime";
import { getCaseInterviews } from "@/data/interviews";
import { meetsRequirement } from "@/lib/dialogueRuntime";
import { isPresentable } from "@/lib/evidenceGating";
import { validateCasePair } from "@/engine/CaseValidation";
import type { Case, Evidence, CrimeScene as CrimeSceneData, BoardState } from "@/types";
import type { DialogueEffect } from "@/types/dialogue";
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
  const progress = useProgress();
  const access = caseAccess(progress, data.id);
  if (!access.unlocked) {
    return <CaseLockedGuard title={data.title} reason={access.reason ?? ""} />;
  }
  return <InvestigateWorkspace />;
}

function InvestigateWorkspace() {
  const { data } = Route.useLoaderData() as { data: Case };

  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (shouldShowIntro(data.id)) setShowIntro(true);
  }, [data.id]);

  const runtimeDef = useMemo<CaseDefinition>(
    () => getRuntimeDefinition(data.id) ?? buildFallbackRuntime(data),
    [data],
  );

  // Dev-only content/runtime drift check. Never blocks gameplay.
  if (import.meta.env.DEV) {
    const result = validateCasePair(data, runtimeDef);
    if (!result.valid) {
      console.warn(
        `[CaseValidation] ${data.id} has ${result.errors.length} issue(s):`,
        result.errors,
      );
    }
  }

  const {
    state: runtimeState,
    currentScene,
    availableHotspots,
    actions,
    hydrated: runtimeHydrated,
  } = useCaseRuntime(runtimeDef);

  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const [openSuspect, setOpenSuspect] = useState<SuspectDossier | null>(null);

  const [discoveredAt, setDiscoveredAt] = useState<Map<string, number>>(() => new Map());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [readHydrated, setReadHydrated] = useState(false);

  // Reading records survive reload alongside the runtime action log, so the
  // decisive-evidence step keeps its candidates after a refresh.
  useEffect(() => {
    setReadIds(new Set(loadReadIds(data.id)));
    setReadHydrated(true);
  }, [data.id]);

  useEffect(() => {
    if (!readHydrated) return;
    saveReadIds(data.id, readIds);
  }, [data.id, readIds, readHydrated]);

  const [investigatedHotspotIds, setInvestigatedHotspotIds] = useState<Set<string>>(new Set());
  const [discoveryQueue, setDiscoveryQueue] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<EvidenceSortMode>("discovery");
  const [boardState, setBoardState] = useState<BoardState>(() => createBoardState());

  const evidenceById = useMemo(
    () => new Map<string, Evidence>(data.evidence.map((e) => [e.id, e])),
    [data.evidence],
  );

  const discoveredIds = runtimeState.discoveredEvidence;
  const discoveredSet = useMemo(() => new Set(discoveredIds), [discoveredIds]);

  // Active discovery id (the one whose modal is visible). Kept in a ref
  // alongside state so the enqueue effect can dedupe against it without
  // depending on render timing.
  const [activeDiscoveryId, setActiveDiscoveryId] = useState<string | null>(null);
  const activeDiscoveryIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeDiscoveryIdRef.current = activeDiscoveryId;
  }, [activeDiscoveryId]);

  // A restored session must not replay its discovery modals. This effect is
  // declared before the enqueue effect so the same commit sees primed ids.
  const primedRef = useRef(false);
  useEffect(() => {
    if (!runtimeHydrated || primedRef.current) return;
    primedRef.current = true;
    for (const id of discoveredIds) seenRef.current.add(id);
    setDiscoveredAt((prev) => {
      if (discoveredIds.length === 0) return prev;
      const next = new Map(prev);
      const now = Date.now();
      discoveredIds.forEach((id, i) => {
        if (!next.has(id)) next.set(id, now + i);
      });
      return next;
    });
    setInvestigatedHotspotIds((prev) => {
      const next = new Set(prev);
      for (const h of runtimeDef.hotspots) {
        if (h.revealsEvidenceIds.length && h.revealsEvidenceIds.every((e) => discoveredSet.has(e))) {
          next.add(h.id);
        }
      }
      return next;
    });
    prevSceneIdRef.current = runtimeState.currentScene;
    // Runs once, on the first hydrated commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeHydrated]);

  // Track newly-discovered evidence coming from runtime → discovery queue.
  const seenRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!runtimeHydrated || !primedRef.current) return;
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
      setDiscoveryQueue((q) => {
        const existing = new Set(q);
        if (activeDiscoveryIdRef.current) existing.add(activeDiscoveryIdRef.current);
        const fresh = added.filter((id) => !existing.has(id));
        if (import.meta.env.DEV && fresh.length) {
          for (const id of fresh) console.log("[discovery] queued", id);
          console.log("[discovery] queue length", q.length + fresh.length);
        }
        return fresh.length ? [...q, ...fresh] : q;
      });
    }
  }, [discoveredIds, evidenceById, runtimeHydrated]);

  // Cooldown between two modals so the first fully unmounts before the next
  // appears (150ms, per spec). Set to false during dismiss and flipped back
  // on via setTimeout; the promotion effect only runs when true.
  const [promoteReady, setPromoteReady] = useState(true);
  useEffect(() => {
    if (!promoteReady) return;
    if (activeDiscoveryId !== null) return;
    if (discoveryQueue.length === 0) return;
    const [head, ...rest] = discoveryQueue;
    setDiscoveryQueue(rest);
    setActiveDiscoveryId(head);
    if (import.meta.env.DEV) {
      console.log("[discovery] shown", head, "· remaining", rest.length);
    }
  }, [promoteReady, activeDiscoveryId, discoveryQueue]);

  const intelligenceState = useMemo(
    () => ({ discoveredIds: discoveredSet, readIds }),
    [discoveredSet, readIds],
  );

  const discoveredEvidence = useMemo(() => {
    const list = discoveredIds.map((id) => evidenceById.get(id)).filter((e): e is Evidence => !!e);
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
    // Opening a dossier is reading, not interviewing. The scene gate is driven
    // solely by authored interview completion (useInterviewRuntime →
    // actions.interviewSuspect), so UI progress and runtime never disagree.
    setOpenSuspect(d);
  };

  const currentDiscovery = activeDiscoveryId ? (evidenceById.get(activeDiscoveryId) ?? null) : null;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);
  const dismissDiscovery = () => {
    if (import.meta.env.DEV) {
      console.log(
        "[discovery] dismissed",
        activeDiscoveryIdRef.current,
        "· queue length",
        discoveryQueue.length,
      );
    }
    // Close immediately — never wait for scene / investigation animation.
    setActiveDiscoveryId(null);
    if (discoveryQueue.length > 0) {
      setPromoteReady(false);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => setPromoteReady(true), 150);
    }
  };

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
  const suspectDossiers = allSuspectDossiers.filter((d) => sceneSuspectIds.has(d.suspect.id));
  const showSuspects =
    (currentScene?.availableSuspectIds.length ?? 0) > 0 &&
    (currentScene?.status === "INTERROGATION" ||
      currentScene?.status === "ACCUSATION" ||
      currentScene?.status === "RECONSTRUCTION");
  const primeSuspectCount = suspectDossiers.filter((d) => d.status === "PRIME_SUSPECT").length;

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
    if (!runtimeHydrated || !primedRef.current) return;
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
      if (import.meta.env.DEV) {
        console.log("[scene] transition queued", prevId, "→", curId);
      }
    }
    prevSceneIdRef.current = curId;
  }, [
    runtimeState.currentScene,
    runtimeState.currentObjective,
    runtimeDef.scenes,
    runtimeHydrated,
  ]);

  // Discovery modals always take priority over the scene-transition modal
  // (spec: show all discoveries first, then transition, then objective).
  const hasPendingDiscovery = activeDiscoveryId !== null || discoveryQueue.length > 0;
  const showTransition = transition !== null && !hasPendingDiscovery;
  const shownTransitionRef = useRef(false);
  useEffect(() => {
    if (showTransition && !shownTransitionRef.current) {
      shownTransitionRef.current = true;
      if (import.meta.env.DEV) console.log("[scene] transition shown");
    } else if (!showTransition) {
      shownTransitionRef.current = false;
    }
  }, [showTransition]);

  // ---------------------------------------------------------------------
  // Mobile shell + branching dialogue
  // ---------------------------------------------------------------------
  const dialoguePack = useMemo(() => getCaseDialogue(data.id), [data.id]);
  const [tab, setTab] = useState<ShellTab>("scene");
  const [focusedHotspot, setFocusedHotspot] = useState<string | null>(null);

  const requirementContext = useMemo(
    () => ({
      discoveredEvidenceIds: discoveredSet,
      investigatedHotspotIds,
      // Dialogue flags are owned by the dialogue runtime itself; authored
      // Scene 01 choices are not flag-gated.
      flags: new Set<string>(),
    }),
    [discoveredSet, investigatedHotspotIds],
  );

  const handleDialogueEffect = (effect: DialogueEffect) => {
    if (effect.focusHotspotId) {
      setFocusedHotspot(effect.focusHotspotId);
      setTab("scene");
    }
    if (effect.investigateHotspotId) {
      handleInvestigate({ id: effect.investigateHotspotId });
    }
    if (effect.switchToTab) setTab(effect.switchToTab);
  };

  const dialogue = useDialogueRuntime({
    caseId: data.id,
    pack: dialoguePack,
    requirementContext,
    onEffect: handleDialogueEffect,
  });

  // Opening thread plays once per case, on the 대화 tab.
  const openedRef = useRef(false);
  useEffect(() => {
    if (!dialogue.hydrated || !dialoguePack || openedRef.current) return;
    openedRef.current = true;
    if (dialogue.entries.length === 0) {
      dialogue.startThread(dialoguePack.openingThreadId, { once: true });
      setTab("talk");
    }
  }, [dialogue, dialoguePack]);

  // System cards inside the conversation flow: new evidence, new questions.
  useEffect(() => {
    if (!dialogue.hydrated) return;
    for (const id of discoveredIds) {
      const e = evidenceById.get(id);
      if (e) dialogue.logSystem(`새 증거 확보 — ${e.title}`, "EVIDENCE");
    }
  }, [discoveredIds, evidenceById, dialogue]);

  useEffect(() => {
    if (!dialogue.hydrated) return;
    for (const qid of runtimeState.activeQuestions) {
      const q = (data.questions ?? []).find((x) => x.id === qid);
      if (q) dialogue.logSystem(`새로운 의문 — ${q.text}`, "QUESTION");
    }
  }, [runtimeState.activeQuestions, data.questions, dialogue]);

  const beatsFor = (hotspotId: string) => {
    const threadId = dialoguePack?.hotspotThreadIds[hotspotId];
    return threadId ? dialogue.threadBeats(threadId) : [];
  };
  const logBeats = (hotspotId: string) => {
    const threadId = dialoguePack?.hotspotThreadIds[hotspotId];
    if (threadId) dialogue.logThread(threadId);
  };

  // Hotspot investigation → runtime reveal, then the authored "after" beat
  // (Scene 02 analysis reactions) is appended to the transcript.
  const investigateWithBeats = (h: { id: string }) => {
    handleInvestigate(h);
    const after = dialoguePack?.hotspotAfterThreadIds?.[h.id];
    if (after) dialogue.logThread(after);
  };

  // Scene-entry and requirement-gated auto threads (Scene 02 opening +
  // the "same time window" analysis once e2/e6/e7 are all in hand).
  useEffect(() => {
    if (!dialogue.hydrated || !dialoguePack?.autoThreads) return;
    for (const auto of dialoguePack.autoThreads) {
      if (auto.sceneId && auto.sceneId !== runtimeState.currentScene) continue;
      if (dialogue.completedThreadIds.includes(auto.threadId)) continue;
      if (!meetsRequirement(auto.requirement, requirementContext)) continue;
      dialogue.startThread(auto.threadId, { once: true });
      break;
    }
  }, [dialogue, dialoguePack, runtimeState.currentScene, requirementContext]);

  // ---------------------------------------------------------------------
  // Scene 03 — authored suspect interviews
  // ---------------------------------------------------------------------
  const interviewPack = useMemo(() => getCaseInterviews(data.id), [data.id]);
  const [evidenceSheetOpen, setEvidenceSheetOpen] = useState(false);

  const interviews = useInterviewRuntime({
    caseId: data.id,
    pack: interviewPack,
    requirementContext,
    onInterviewComplete: (suspectId) => actions.interviewSuspect(suspectId),
  });

  const suspectById = useMemo(
    () => new Map(data.suspects.map((s) => [s.id, s])),
    [data.suspects],
  );

  const interviewMode = !!interviewPack && showSuspects;

  /** Suspects the runtime requires before the case can advance. */
  const requiredInterviewIds = useMemo(
    () => currentScene?.completionCondition?.requiresInterviewedSuspectIds ?? [],
    [currentScene],
  );
  const remainingRequiredNames = useMemo(
    () =>
      requiredInterviewIds
        .filter((id) => !interviews.rooms.find((r) => r.suspectId === id)?.complete)
        .map((id) => suspectById.get(id)?.name ?? id),
    [requiredInterviewIds, interviews.rooms, suspectById],
  );

  const hubRooms = useMemo(
    () =>
      interviews.rooms
        .filter((r) => sceneSuspectIds.has(r.suspectId))
        .map((r) => {
          const s = suspectById.get(r.suspectId);
          const entries = interviews.stateOf(r.suspectId).entries;
          const last = [...entries].reverse().find((e) => e.kind === "LINE");
          return {
            suspectId: r.suspectId,
            name: s?.name ?? r.suspectId,
            title: s?.occupation ?? "",
            progress: r.progress,
            complete: r.complete,
            mood: r.mood,
            contradictions: r.contradictions.length,
            started: r.started,
            lastLine: last?.text ?? null,
          };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interviews.rooms, interviews.stateOf, suspectById, currentScene?.id],
  );

  const activeInterview = useMemo(() => {
    if (!interviews.roomId) return null;
    const s = suspectById.get(interviews.roomId);
    const iv = interviewPack?.suspects.find((x) => x.suspectId === interviews.roomId) ?? null;
    return {
      suspectId: interviews.roomId,
      name: s?.name ?? interviews.roomId,
      role: s?.occupation ?? "",
      relationship: s?.relationship ?? "",
      requiredTopicIds: iv?.requiredTopicIds ?? [],
      state: interviews.stateOf(interviews.roomId),
      room: interviews.rooms.find((r) => r.suspectId === interviews.roomId) ?? null,
    };
  }, [interviews, suspectById, interviewPack]);

  /** Only discovered AND read evidence can be presented in an interview. */
  const presentableEvidence = useMemo(() => {
    if (!activeInterview) return [];
    const presented = new Set(activeInterview.state.presentedEvidenceIds);
    return discoveredEvidence
      .filter((e) => isPresentable(e.id, discoveredSet, readIds))
      .map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        presented: presented.has(e.id),
      }));
  }, [activeInterview, discoveredEvidence, discoveredSet, readIds]);


  /** Discovered AND read evidence — decisive-evidence candidates. */
  const readEvidence = useMemo(
    () => discoveredEvidence.filter((e) => isPresentable(e.id, discoveredSet, readIds)),
    [discoveredEvidence, discoveredSet, readIds],
  );

  const presentation = useMemo(() => getScenePresentation(data.id), [data.id]);

  const sceneIndex = Math.max(
    0,
    runtimeDef.scenes.findIndex((s) => s.id === runtimeState.currentScene),
  );

  /**
   * Final-deduction block. Once the runtime reaches SCENE 04 this becomes the
   * first thing on the 추리 tab — at 390–430px the submit flow must be the
   * primary content, not something buried under the notebook and the board.
   */
  const deductionSection = (
    <InvestigationSection
      icon={Gavel}
      title="최종 추리"
      subtitle={
        canAccuse
          ? "한 화면에 한 가지 결정 — 여섯 단계로 결론을 제출합니다"
          : "SCENE 04에 도달하면 제출이 열립니다"
      }
    >
      <div className="-mx-4" data-testid="deduction-host">
        <MobileDeduction
          case={data}
          readEvidence={readEvidence}
          discoveredEvidenceIds={discoveredSet}
          canAccuse={canAccuse}
          onOpenCaseFile={() => setTab("file")}

        />
      </div>
    </InvestigationSection>
  );


  return (
    <div className="noir-grain">
      {showIntro && (
        <CaseIntro
          caseId={data.id}
          caseCode={caseCode(data.id)}
          caseTitle={(data.title ?? "").toUpperCase()}
          onDone={() => setShowIntro(false)}
        />
      )}

      <MobileInvestigationShell
        active={tab}
        onChange={setTab}
        badges={{
          talk: interviewMode
            ? hubRooms.filter((r) => !r.complete).length
            : dialogue.awaitingChoice
              ? 1
              : 0,
          scene: totalHotspots - investigatedCount,
          deduce: canAccuse ? 1 : 0,
        }}
        header={
          <>
            <TopBar
              to="/case/$caseId"
              label="사건 정보"
              right={
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  수사 중
                </span>
              }
            />
            <SceneStageTimeline
              stages={sceneStages}
              currentSceneId={runtimeState.currentScene}
              completedSceneIds={runtimeState.completedScenes}
            />
          </>
        }
      >
        {tab === "scene" && (
          <div className="space-y-4 pb-6">
            {currentScene && (
              <div className="px-4 pt-4">
                <ObjectiveBanner
                  sceneTitle={currentScene.title}
                  objective={runtimeState.currentObjective ?? currentScene.objective}
                  gameStatus={runtimeState.gameStatus}
                  progress={runtimeState.investigationProgress}
                />
              </div>
            )}

            {scopedScene ? (
              <SceneSurface
                sceneTitle={currentScene?.title ?? "현재 씬"}
                objective={runtimeState.currentObjective ?? currentScene?.objective ?? ""}
                sceneIndex={sceneIndex}
                hotspots={availableHotspots.map((h) => ({
                  id: h.id,
                  title: h.title,
                }))}
                investigatedIds={investigatedHotspotIds}
                focusedHotspotId={focusedHotspot}
                layout={presentation.layout}
                renderBackdrop={presentation.renderBackdrop}
                beatsFor={beatsFor}
                onBeatsPlayed={logBeats}
                onInvestigate={(id) => investigateWithBeats({ id })}
              />
            ) : (
              <div className="px-4">
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 p-3 text-xs text-muted-foreground">
                  <Footprints className="h-4 w-4" />이 단계에서는 현장 조사 대신 진술과 추리에
                  집중하세요.
                </div>
              </div>
            )}

            {showSuspects && (
              <div className="px-4">
                <InvestigationSection
                  icon={Users}
                  title="용의자"
                  subtitle={
                    primeSuspectCount > 0
                      ? `${suspectDossiers.length}명 · 유력 용의자 ${primeSuspectCount}명`
                      : `${suspectDossiers.length}명 프로파일`
                  }
                >
                  <SuspectDatabase dossiers={suspectDossiers} onOpen={openSuspectAndInterview} />

                  {/* Cases without authored interview trees still need a
                      deterministic, explicit way to record that a statement was
                      heard. Opening a profile never counts — the detective has
                      to log it. */}
                  {!interviewPack && requiredInterviewIds.length > 0 && (
                    <div className="mt-3 space-y-2 rounded-lg border border-border/60 bg-surface-elevated/50 p-3">
                      <p className="text-[11px] text-muted-foreground">
                        프로필을 열어 진술을 확인한 뒤, 청취를 마친 상대를 직접 기록하세요.
                      </p>
                      {requiredInterviewIds.map((id) => {
                        const done = runtimeState.interviewedSuspects.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            data-testid={`statement-log-${id}`}
                            data-logged={done ? "true" : "false"}
                            disabled={done}
                            onClick={() => actions.interviewSuspect(id)}
                            className={`flex min-h-[44px] w-full items-center justify-between rounded-lg border px-3 text-[12px] transition-colors ${
                              done
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border/70 bg-background/60 text-foreground hover:bg-primary/10"
                            }`}
                          >
                            <span>{suspectById.get(id)?.name ?? id}</span>
                            <span>{done ? "청취 완료" : "진술 청취 완료로 기록"}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </InvestigationSection>
              </div>
            )}


            <div className="px-4">
              <InvestigationSection
                icon={ListChecks}
                title="현재 목표"
                subtitle={`${objectivesSummary.completed} / ${objectivesSummary.total} 완료`}
              >
                <ObjectivesPanel objectives={objectives} />
              </InvestigationSection>
            </div>

            {import.meta.env.DEV && (
              <div className="px-4">
                <RuntimeDebugPanel
                  state={runtimeState}
                  availableHotspotIds={availableHotspots.map((h) => h.id)}
                />
              </div>
            )}
          </div>
        )}

        {tab === "talk" &&
          (interviewMode ? (
            activeInterview ? (
              <InterviewRoom
                name={activeInterview.name}
                role={activeInterview.role}
                relationship={activeInterview.relationship}
                mood={activeInterview.state.mood}
                progress={activeInterview.room?.progress ?? { done: 0, total: 0 }}
                contradictions={activeInterview.state.contradictions}
                entries={activeInterview.state.entries}
                topics={interviews.topics(activeInterview.suspectId)}
                requiredTopicIds={activeInterview.requiredTopicIds}
                choices={interviews.activeChoices}
                awaitingTopicId={interviews.awaitingTopicId}
                isTyping={interviews.isTyping}
                onAsk={(topicId) => interviews.ask(activeInterview.suspectId, topicId)}
                onChoose={(choiceId) => interviews.choose(activeInterview.suspectId, choiceId)}
                onPresentEvidence={() => setEvidenceSheetOpen(true)}
                onSkip={interviews.skip}
                onBack={interviews.closeRoom}
              />
            ) : (
              <InterviewHub
                rooms={hubRooms}
                onOpen={interviews.openRoom}
                remainingRequiredNames={remainingRequiredNames}
              />
            )
          ) : (
            <ConversationSurface
              entries={dialogue.entries}
              isTyping={dialogue.isTyping}
              choices={dialogue.availableChoices}
              onChoose={dialogue.choose}
              onSkip={dialogue.skip}
              threadTitle={dialogue.activeThreadTitle}
            />
          ))}


        {tab === "file" && (
          <div className="space-y-4 px-4 py-4 pb-8">
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
                    stateOf={(e) => IntelligenceEngine.stateOf(e, intelligenceState)}
                  />
                </div>
              )}
            </InvestigationSection>

            <InvestigationSection
              icon={Clock}
              title="타임라인"
              subtitle={`${timelineSummary.revealed} / ${timelineSummary.total} 시간대 확인`}
            >
              <InvestigationTimeline
                entries={timelineEntries}
                onOpenEvidence={openEvidenceAndMarkRead}
              />
            </InvestigationSection>

            <InvestigationSection
              icon={HelpCircle}
              title="남은 의문"
              subtitle={
                activeQuestionsCount > 0
                  ? `${activeQuestionsCount}개의 의문이 남아 있습니다`
                  : "지금은 새로운 의문이 없습니다"
              }
            >
              <ActiveQuestions case={data} state={intelligenceState} />
            </InvestigationSection>

            <InvestigationSection
              icon={Users}
              title="용의자"
              subtitle={
                showSuspects
                  ? `${suspectDossiers.length}명 프로파일 열람 가능`
                  : "아직 용의자 조사 단계가 아닙니다"
              }
            >
              {showSuspects ? (
                <SuspectDatabase dossiers={suspectDossiers} onOpen={openSuspectAndInterview} />
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 p-3 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  SCENE 03에서 진술 조사가 열립니다.
                </div>
              )}
            </InvestigationSection>

            <div className="overflow-hidden rounded-xl border border-border/60">
              <CaseSidebar
                case={data}
                storyState={storyState}
                objectiveText={runtimeState.currentObjective ?? undefined}
                discoveredCount={discoveredIds.length}
                totalEvidence={data.evidence.length}
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-border/60">
              <PartnerPanel
                case={data}
                intelligenceState={intelligenceState}
                storyState={storyState}
              />
            </div>
          </div>
        )}

        {tab === "deduce" && (
          <div className="space-y-4 px-4 py-4 pb-8">
            {canAccuse && deductionSection}

            <InvestigationSection
              icon={NotebookPen}

              title="수사 노트"
              subtitle="증거·의문·용의자를 정리하고 추리 보드를 연결하세요"
            >
              <DetectiveNotebook
                caseId={data.id}
                boardEvidence={discoveredEvidence.map((e) => ({
                  id: e.id,
                  label: e.title,
                  sublabel: e.category,
                }))}
                boardQuestions={IntelligenceEngine.visibleQuestions(data, intelligenceState).map(
                  ({ question, status }) => ({
                    id: question.id,
                    label: question.text,
                    sublabel: status === "solved" ? "해결됨" : "진행 중",
                  }),
                )}
                boardSuspects={suspectDossiers.map((d) => ({
                  id: d.suspect.id,
                  label: d.suspect.name,
                  sublabel: d.suspect.occupation,
                }))}
              />
            </InvestigationSection>

            <InvestigationSection
              icon={LayoutGrid}
              title="관계도"
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
              title="가설"
              subtitle={
                boardState.theories.length
                  ? `${boardState.theories.length}개의 가설`
                  : "아직 세워진 가설이 없습니다"
              }
            >
              <TheoriesPanel state={boardState} onChange={setBoardState} />
            </InvestigationSection>

            {!canAccuse && deductionSection}
          </div>

        )}
      </MobileInvestigationShell>

      <EvidenceModal
        evidence={openEvidence}
        case={data}
        discoveredIds={discoveredSet}
        onClose={() => setOpenEvidence(null)}
        onOpenEvidence={openEvidenceAndMarkRead}
      />

      {currentDiscovery && (
        <DiscoveryModal
          evidence={currentDiscovery}
          remaining={discoveryQueue.length}
          onContinue={dismissDiscovery}
        />
      )}

      <EvidenceSheet
        open={evidenceSheetOpen && !!activeInterview}
        items={presentableEvidence}
        onSelect={(evidenceId) => {
          const e = evidenceById.get(evidenceId);
          if (activeInterview && e) {
            interviews.presentEvidence(activeInterview.suspectId, e.id, e.title);
          }
          setEvidenceSheetOpen(false);
        }}
        onClose={() => setEvidenceSheetOpen(false)}
      />

      <SuspectProfileModal dossier={openSuspect} onClose={() => setOpenSuspect(null)} />

      {showTransition && (
        <SceneTransitionModal
          open
          previousSceneTitle={transition?.prevTitle ?? null}
          newSceneTitle={transition?.newTitle ?? null}
          newObjective={transition?.newObjective ?? null}
          onContinue={() => setTransition(null)}
        />
      )}
    </div>
  );
}
