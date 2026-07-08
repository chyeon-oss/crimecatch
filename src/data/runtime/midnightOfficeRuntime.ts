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
 * briefing text) lives in the sibling content file:
 * `src/data/cases/midnight-office.ts`.
 *
 * Contract with the content layer:
 *   - Every evidence id here MUST exist in `case.evidence`.
 *   - Every suspect id in `suspectIds` MUST exist in `case.suspects`.
 *   - Hidden spoiler fields (`hiddenTruth`, `isCulprit`) live only on the
 *     content layer and MUST NEVER be surfaced to the player.
 *
 * Validated at dev-time by `validateCasePair()` (src/engine/CaseValidation.ts).
 */


const evidence: RuntimeEvidence[] = [
  {
    id: "e1",
    title: "깨진 머그컵",
    description: "피해자 책상 옆에서 산산조각 난 채 발견. 커피 자국이 벽까지 튀어 있다.",
    category: "OBJECT",
    importance: "COMMON",
    location: "피해자 책상 옆",
    discovered: false,
    relatedQuestions: ["q-mug"],
  },
  {
    id: "e3",
    title: "피해자의 노트북",
    description: "화면은 열린 채였고, 사건 직전 메시지가 일부 삭제된 흔적이 있다.",
    category: "PHONE",
    importance: "UNCOMMON",
    location: "피해자 책상",
    discovered: false,
  },
  {
    id: "e5",
    title: "책상 아래 혈흔",
    description: "감식 결과 피해자의 것이 아닌 제3자의 혈흔.",
    category: "FORENSIC",
    importance: "CRITICAL",
    location: "회의실 바닥",
    discovered: false,
    relatedEvidence: ["e1"],
  },
  {
    id: "e4",
    title: "잠긴 사무실 문",
    description: "사무실 문은 안쪽에서 잠겨 있었다. 예비 열쇠 소지자는 3명뿐이다.",
    category: "OBJECT",
    importance: "UNCOMMON",
    location: "사무실 출입문",
    discovered: false,
    relatedQuestions: ["q-lock"],
  },
  {
    id: "e2",
    title: "꺼진 CCTV 기록",
    description: "사건 직전 30분간 12층 전체 CCTV가 정전으로 꺼져 있었다.",
    category: "CCTV",
    importance: "IMPORTANT",
    location: "관제실 서버",
    discovered: false,
    relatedQuestions: ["q-cctv", "q-tod"],
  },
  {
    id: "e6",
    title: "정전 기록",
    description: "12층 배전반에 수동 조작 흔적. 정전 직전 접근자 카드 로그가 남아 있다.",
    category: "DOCUMENT",
    importance: "CRITICAL",
    location: "12층 배전반",
    discovered: false,
    relatedEvidence: ["e2"],
    relatedQuestions: ["q-blackout"],
  },
  {
    id: "e7",
    title: "멈춘 회의실 시계",
    description: "회의실 벽시계가 20:18에 멈춰 있다. 사망 추정 시각을 좁힌다.",
    category: "OBJECT",
    importance: "IMPORTANT",
    location: "회의실",
    discovered: false,
    relatedQuestions: ["q-tod"],
  },
];

const questions: RuntimeQuestion[] = [
  {
    id: "q-mug",
    title: "왜 컵은 깨졌는데 액체 흔적은 적을까?",
    description: "다툼이라기엔 흘린 커피의 양이 부자연스럽다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e1"],
  },
  {
    id: "q-lock",
    title: "문은 정말 안에서 잠긴 것이 맞을까?",
    description: "예비 열쇠 3명 중 한 명은 사건 시간대에 다른 층에 있었다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e4"],
  },
  {
    id: "q-cctv",
    title: "CCTV는 왜 꺼졌을까?",
    description: "12층에만 국한된 정전은 우연이라기엔 정확하다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e2"],
    solvedByEvidenceIds: ["e6"],
  },
  {
    id: "q-blackout",
    title: "정전은 우연이었을까?",
    description: "배전반 로그가 사건의 열쇠일 수 있다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e6"],
    solvedByEvidenceIds: ["e6"],
  },
  {
    id: "q-tod",
    title: "피해자는 정확히 언제 사망했을까?",
    description: "CCTV 공백 시간과 회의실 시계가 실마리다.",
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
    description:
      "심야의 12층 사무실. 첫 인상은 정돈되어 있으나, 자세히 보면 곳곳이 어긋나 있다.",
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
    description:
      "확보한 증거들이 하나의 시간대를 가리킨다. 정전, 꺼진 CCTV, 멈춘 시계 — 우연일까.",
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
    description:
      "네 사람이 남았다. 진술을 확인하고, 어긋난 지점을 찾을 시간이다.",
    objective: "용의자들의 진술을 확인하고 모순되는 부분을 찾으세요.",
    status: "INTERROGATION",
    availableHotspotIds: [],
    availableSuspectIds: ["s1", "s2", "s3", "s4"],
    evidenceRewardIds: [],
    unlockCondition: { requiresSceneIds: ["scene-02"] },
    completionCondition: {
      // At least 2 suspects interviewed — encoded via the reducer's
      // requiresInterviewedSuspectIds AND-list needing 2 explicit ids.
      // We instead check via a minimum count implemented by listing the
      // two primary suspects the case gates on.
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
    // Completed when the accusation is submitted (handled by runtime action).
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
