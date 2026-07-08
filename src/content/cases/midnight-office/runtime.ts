import type {
  CaseDefinition,
  RuntimeEvidence,
  RuntimeHotspot,
  RuntimeQuestion,
  Scene,
} from "@/types/runtime";

/**
 * RUNTIME LAYER — progression state machine for "한밤의 사무실 살인사건".
 *
 * This file controls the *flow* of the case: scenes, objectives, hotspot
 * unlocks, evidence rewards, question gating, scene completion, and the
 * next-scene transitions the Case Runtime Engine walks through.
 *
 * The player-visible copy (suspect names, evidence descriptions, victim,
 * briefing text) lives in the sibling content files in this folder.
 *
 * Contract with the content layer:
 *   - Every evidence id here MUST exist in `case.evidence`.
 *   - Every suspect id in `suspectIds` MUST exist in `case.suspects`.
 *   - Hidden spoiler fields (`hiddenTruth`, `isCulprit`) live only on the
 *     content layer and MUST NEVER be surfaced to the player.
 */

const evidence: RuntimeEvidence[] = [
  {
    id: "e1",
    title: "깨진 머그컵",
    description: "피해자 책상 오른쪽 아래에서 발견된 깨진 머그컵.",
    notebookEntry: "깨진 머그컵 발견. 컵은 깨져 있지만 주변에 액체가 크게 흘러 있지 않다.",
    category: "OBJECT",
    importance: "IMPORTANT",
    location: "피해자 책상",
    discovered: false,
    relatedQuestions: ["q-mug"],
  },
  {
    id: "e3",
    title: "피해자의 노트북",
    description: "피해자 책상 위에 열려 있던 업무용 노트북.",
    notebookEntry:
      "피해자의 노트북 확인. 조직개편, 예산조정, 면담기록 관련 문서가 최근 열람되어 있었다.",
    category: "DOCUMENT",
    importance: "IMPORTANT",
    location: "피해자 책상",
    discovered: false,
    relatedQuestions: ["q-laptop"],
  },
  {
    id: "e5",
    title: "책상 아래 혈흔",
    description: "회의실 바닥과 책상 아래쪽에서 확인된 작은 혈흔.",
    notebookEntry: "책상 아래 혈흔 확인. 혈흔은 존재하지만 양이 많지 않고, 주변 흔적도 제한적이다.",
    category: "FORENSIC",
    importance: "CRITICAL",
    location: "회의실 바닥",
    discovered: false,
    relatedEvidence: ["e1"],
    relatedQuestions: ["q-blood"],
  },
  {
    id: "e4",
    title: "잠긴 출입문",
    description: "사건 당시 닫혀 있던 기획전략실 출입문.",
    notebookEntry: "출입문 확인. 강제 침입 흔적은 없으나 출입 기록 확인이 필요하다.",
    category: "OBJECT",
    importance: "IMPORTANT",
    location: "출입문",
    discovered: false,
    relatedQuestions: ["q-lock"],
  },
  {
    id: "e2",
    title: "꺼진 CCTV 기록",
    description: "사건 시간대 일부가 비어 있는 CCTV 관리 기록.",
    notebookEntry: "CCTV 기록 확인. 특정 시간대 영상 공백이 있으나 수동 삭제 흔적은 보이지 않는다.",
    category: "CCTV",
    importance: "IMPORTANT",
    location: "관제실 서버",
    discovered: false,
    relatedQuestions: ["q-cctv", "q-tod"],
  },
  {
    id: "e6",
    title: "정전 기록",
    description: "사건 시간대와 가까운 시각에 기록된 짧은 전원 이상 로그.",
    notebookEntry: "정전 기록 확인. 12층 일부 구역에서 짧은 전원 이상이 있었다.",
    category: "DOCUMENT",
    importance: "IMPORTANT",
    location: "12층 배전반",
    discovered: false,
    relatedEvidence: ["e2"],
    relatedQuestions: ["q-blackout"],
  },
  {
    id: "e7",
    title: "멈춘 회의실 시계",
    description: "회의실 벽에 걸린 아날로그 시계가 특정 시각에서 멈춰 있다.",
    notebookEntry: "회의실 시계 확인. 시계가 멈춰 있으며 배터리 덮개가 열려 있다.",
    category: "OBJECT",
    importance: "CRITICAL",
    location: "회의실",
    discovered: false,
    relatedQuestions: ["q-tod"],
  },
];

const questions: RuntimeQuestion[] = [
  {
    id: "q-mug",
    title: "왜 컵은 깨졌는데 액체 흔적은 거의 없을까?",
    description: "깨진 컵 주변의 흔적이 말해주는 것이 있다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e1"],
  },
  {
    id: "q-lock",
    title: "문은 정말 안에서 잠긴 것이 맞을까?",
    description: "잠긴 문뿐만으로 외부 침입을 배제할 수 없다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e4"],
  },
  {
    id: "q-laptop",
    title: "피해자는 사건 직전 누구와 무엇을 검토하고 있었을까?",
    description: "마지막 업무 문서들이 사건의 배경을 말해줄 수 있다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e3"],
  },
  {
    id: "q-blood",
    title: "피해자는 정말 이 자리에서 치명상을 입은 것일까?",
    description: "혈흔의 양과 위치가 진술과 맞지 않는다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e5"],
  },
  {
    id: "q-cctv",
    title: "CCTV 공백은 누가 만든 것일까, 아니면 원래 존재하던 구간일까?",
    description: "영상이 사라진 방식과 기록의 공백이 의도된 흔적인지 아직 단정할 수 없다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e2"],
    solvedByEvidenceIds: ["e6"],
  },
  {
    id: "q-blackout",
    title: "정전은 우연이었을까, 누군가 이용한 것일까?",
    description: "12층 일부 구역에서만 발생한 짧은 전원 이상의 원인을 확인해야 한다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e6"],
    solvedByEvidenceIds: ["e6"],
  },
  {
    id: "q-tod",
    title: "피해자는 정확히 언제 사망했을까?",
    description: "멈춘 시계와 CCTV 공백이 실제 사망 시각을 좁혀줄 수 있다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e2", "e7"],
    solvedByEvidenceIds: ["e2", "e7"],
  },
];

const hotspots: RuntimeHotspot[] = [
  // Scene 01
  {
    id: "hs-victim-desk",
    title: "피해자 책상",
    status: "AVAILABLE",
    revealsEvidenceIds: ["e1", "e3"],
  },
  {
    id: "hs-meeting-floor",
    title: "회의실 바닥",
    status: "AVAILABLE",
    revealsEvidenceIds: ["e5"],
  },
  {
    id: "hs-door",
    title: "출입문",
    status: "AVAILABLE",
    revealsEvidenceIds: ["e4"],
  },
  // Scene 02
  {
    id: "hs-cctv",
    title: "CCTV 관리 콘솔",
    status: "LOCKED",
    revealsEvidenceIds: ["e2"],
    unlockCondition: { requiresSceneIds: ["scene-01"] },
  },
  {
    id: "hs-breaker",
    title: "배전함",
    status: "LOCKED",
    revealsEvidenceIds: ["e6"],
    unlockCondition: { requiresSceneIds: ["scene-01"] },
  },
  {
    id: "hs-meeting-clock",
    title: "회의실 시계",
    status: "LOCKED",
    revealsEvidenceIds: ["e7"],
    unlockCondition: { requiresSceneIds: ["scene-01"] },
  },
];

const scenes: Scene[] = [
  {
    id: "scene-01",
    title: "SCENE 01 — 사건 현장 도착",
    description: "심야의 12층 사무실. 첫 인상은 정돈되어 있으나, 자세히 보면 곳곳이 어긋나 있다.",
    objective: "사건 현장을 둘러보고 첫 번째 단서를 확보하세요.",
    status: "INVESTIGATION",
    availableHotspotIds: ["hs-victim-desk", "hs-meeting-floor", "hs-door"],
    availableSuspectIds: [],
    evidenceRewardIds: ["e1", "e3", "e5", "e4"],
    completionCondition: { minEvidenceRewards: 3 },
    nextSceneId: "scene-02",
  },
  {
    id: "scene-02",
    title: "SCENE 02 — 이상한 시간대",
    description: "확보한 증거들이 하나의 시간대를 가리킨다. 정전, 꺼진 CCTV, 멈춘 시계 — 우연일까.",
    objective: "확보한 증거를 분석하고 사건의 이상한 시간대를 확인하세요.",
    status: "ANALYSIS",
    availableHotspotIds: ["hs-cctv", "hs-breaker", "hs-meeting-clock"],
    availableSuspectIds: [],
    evidenceRewardIds: ["e2", "e6", "e7"],
    unlockCondition: { requiresSceneIds: ["scene-01"] },
    completionCondition: { minEvidenceRewards: 3 },
    nextSceneId: "scene-03",
  },
  {
    id: "scene-03",
    title: "SCENE 03 — 용의자 조사",
    description: "네 사람이 남았다. 진술을 확인하고, 어긋난 지점을 찾을 시간이다.",
    objective: "용의자들의 진술을 확인하고 모순되는 부분을 찾으세요.",
    status: "INTERROGATION",
    availableHotspotIds: [],
    availableSuspectIds: ["s1", "s2", "s3", "s4"],
    evidenceRewardIds: [],
    unlockCondition: { requiresSceneIds: ["scene-02"] },
    completionCondition: {
      requiresInterviewedSuspectIds: ["s1", "s2"],
    },
    nextSceneId: "scene-04",
  },
  {
    id: "scene-04",
    title: "SCENE 04 — 최종 추리",
    description: "이제 모든 조각을 하나의 이야기로 엮을 시간이다.",
    objective: "확보한 증거와 진술을 바탕으로 최종 추리를 제출하세요.",
    status: "ACCUSATION",
    availableHotspotIds: [],
    availableSuspectIds: ["s1", "s2", "s3", "s4"],
    evidenceRewardIds: [],
    unlockCondition: { requiresSceneIds: ["scene-03"] },
    nextSceneId: null,
  },
];

export const midnightOfficeRuntime: CaseDefinition = {
  id: "midnight-office",
  title: "한밤의 사무실 살인사건",
  scenes,
  evidence,
  questions,
  hotspots,
  suspectIds: ["s1", "s2", "s3", "s4"],
  startSceneId: "scene-01",
};

export { midnightOfficeRuntime as runtime };
