import type {
  CaseDefinition,
  RuntimeEvidence,
  RuntimeHotspot,
  RuntimeQuestion,
  Scene,
} from "@/types/runtime";

/**
 * RUNTIME LAYER — authored progression state machine for CASE002
 * "상속 파티의 비밀".
 *
 * AUTHORED BUT NOT ACTIVATED. This definition is intentionally not registered
 * in src/data/runtime/index.ts during this sprint; CASE002 stays locked.
 * It exists so the content canon can be validated ahead of the
 * runtime-integration sprint.
 *
 * Contract with the content layer:
 *   - Every evidence id here MUST exist in `case.evidence`.
 *   - Every suspect id in `suspectIds` MUST exist in `case.suspects`.
 *   - Spoiler fields live only in _spoilers.ts / _truth.ts.
 */

const evidence: RuntimeEvidence[] = [
  {
    id: "e1",
    title: "축배용 샴페인 잔",
    description: "피해자가 축배에 사용한 샴페인 잔. 시안화물 반응이 나왔다.",
    notebookEntry:
      "축배 잔에서 시안화물 양성 반응 확인. 다만 검출량은 미확인. 접촉 흔적은 다수가 섞여 특정 불가.",
    category: "FORENSIC",
    importance: "IMPORTANT",
    location: "대응접실 중앙 테이블",
    discovered: false,
    relatedQuestions: ["q-champagne"],
  },
  {
    id: "e7",
    title: "별거 협의 및 혼전계약 분쟁 서류",
    description: "응접실 소파 옆 서류 가방에서 나온 미제출 협의 초안.",
    notebookEntry:
      "별거 협의 초안과 혼전계약 의견서 확보. 작성일은 사건 11일 전. 사망으로 유리해지는 구조는 아님.",
    category: "DOCUMENT",
    importance: "UNCOMMON",
    location: "응접실 소파 옆",
    discovered: false,
    relatedQuestions: ["q-marriage"],
  },
  {
    id: "e6",
    title: "피해자 휴대전화 이동 기록",
    description: "사건 직후 피해자의 휴대전화가 잠시 자리를 벗어난 기록.",
    notebookEntry:
      "피해자 휴대전화가 21:26~21:39 사이 복도 쪽으로 이동 후 복귀. 같은 시간대 채무 관련 메시지 1건 삭제.",
    category: "PHONE",
    importance: "IMPORTANT",
    location: "복도 · 응접실",
    discovered: false,
    relatedQuestions: ["q-phone"],
  },
  {
    id: "e2",
    title: "피해자의 개인 위스키 잔",
    description: "바 카트 위에 남아 있던 피해자 전용 위스키 잔.",
    notebookEntry:
      "피해자 전용 위스키 잔 확보. 잔 안쪽에 점성 있는 투명한 잔여물이 굳어 있다. 축배 이후 사용된 흔적.",
    category: "FORENSIC",
    importance: "CRITICAL",
    location: "응접실 바 카트",
    discovered: false,
    relatedEvidence: ["e1", "e3"],
    relatedQuestions: ["q-whisky"],
  },
  {
    id: "e10",
    title: "바 카트 아래 커프스단추",
    description: "바 카트 하단 카펫 틈에서 발견된 은색 커프스단추 한 개.",
    notebookEntry:
      "바 카트 아래 은색 커프스단추 1개 수거. 카펫에 눌린 자국 동반. 낙하 위치는 위스키 잔 방향과 불일치.",
    category: "OBJECT",
    importance: "UNCOMMON",
    location: "응접실 바 카트 하단",
    discovered: false,
    relatedEvidence: ["e6"],
    relatedQuestions: ["q-cufflink"],
  },
  {
    id: "e3",
    title: "벌꿀 시럽 점적기",
    description: "피해자가 위스키에 넣어 마시던 벌꿀 시럽 병과 스포이드형 점적기.",
    notebookEntry:
      "벌꿀 시럽 점적기 확인. 피해자 전용 습관 용품. 병 목 부분만 최근에 닦인 상태.",
    category: "OBJECT",
    importance: "IMPORTANT",
    location: "조리실 옆 팬트리",
    discovered: false,
    relatedEvidence: ["e2"],
    relatedQuestions: ["q-dropper"],
  },
  {
    id: "e4",
    title: "독성 감정 예비 회신",
    description: "샴페인 잔과 위스키 잔의 시안화물 농도 비교 결과.",
    notebookEntry:
      "감정 회신 확인. 샴페인 잔은 치사량 미달, 위스키 잔 잔여물은 치사 농도 초과. 두 잔의 오염 시점이 다르다.",
    category: "DOCUMENT",
    importance: "CRITICAL",
    location: "감정 회신 문서",
    discovered: false,
    relatedEvidence: ["e1", "e2", "e3"],
    relatedQuestions: ["q-dose", "q-whisky"],
  },
  {
    id: "e5",
    title: "소각된 유언장 초안 조각",
    description: "응접실 벽난로 재 속에서 수거된 문서 조각.",
    notebookEntry:
      "벽난로에서 유언장 초안 조각 수거. 승계 제외 문구와 이름 일부 확인. 용지는 서재 프린터 용지와 동일.",
    category: "DOCUMENT",
    importance: "IMPORTANT",
    location: "응접실 벽난로",
    discovered: false,
    relatedQuestions: ["q-will"],
  },
  {
    id: "e9",
    title: "재단 외부 감사 요청 초안",
    description: "피해자가 낭독 당일 작성한 미발송 메일 초안.",
    notebookEntry:
      "피해자가 작성한 재단 외부 감사 요청 메일 초안 확인. 3개년 집행 내역 전수 검토 및 이전 판본 유언장 검토 포함. 20:41 최종 수정, 미발송.",
    category: "DOCUMENT",
    importance: "CRITICAL",
    location: "서재 노트북",
    discovered: false,
    relatedEvidence: ["e5"],
    relatedQuestions: ["q-foundation"],
  },
  {
    id: "e8",
    title: "저택 내부 출입 · 조명 제어 기록",
    description: "조리실 · 팬트리 · 서재 구역의 출입 및 조명 제어 로그.",
    notebookEntry:
      "팬트리 구역 21:07~21:14 조명 점등, 진입 카드 기록 1건. 서재 구역 21:02 별도 진입 기록. 조리실 문은 닫힌 상태.",
    category: "CCTV",
    importance: "CRITICAL",
    location: "관리실 제어 콘솔",
    discovered: false,
    relatedEvidence: ["e3", "e2"],
    relatedQuestions: ["q-access", "q-dropper"],
  },
];

const questions: RuntimeQuestion[] = [
  {
    id: "q-champagne",
    title: "축배 잔에 독을 넣을 수 있었던 사람은 누구인가?",
    description: "축배에는 전원이 참석했고, 잔에는 여러 사람의 접촉 흔적이 섞여 있다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e1"],
  },
  {
    id: "q-whisky",
    title: "피해자가 마지막으로 마신 것은 정말 샴페인이었을까?",
    description: "축배 이후 사용된 개인 잔이 따로 존재한다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e2"],
    solvedByEvidenceIds: ["e4"],
  },
  {
    id: "q-dropper",
    title: "피해자만 사용하는 용품에 접근한 사람은 누구인가?",
    description: "벌꿀 시럽 점적기는 피해자 외에는 쓰지 않는 물건이었다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e3"],
    solvedByEvidenceIds: ["e8"],
  },
  {
    id: "q-dose",
    title: "왜 두 잔의 독 농도가 이렇게 다른가?",
    description: "치사량에 미달하는 잔과 초과하는 잔이 같은 방에 있었다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e4"],
    solvedByEvidenceIds: ["e4"],
  },
  {
    id: "q-cufflink",
    title: "바 카트 앞에 몸을 낮춘 사람은 무엇을 찾고 있었는가?",
    description: "낙하 지점은 위스키 잔이 놓인 방향과 어긋난다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e10"],
    solvedByEvidenceIds: ["e6"],
  },
  {
    id: "q-phone",
    title: "사망 이후 휴대전화를 만진 사람은 누구이고, 왜인가?",
    description: "조작 시각은 사망 이후다. 살인과는 다른 종류의 은폐일 수 있다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e6"],
    solvedByEvidenceIds: ["e10"],
  },
  {
    id: "q-will",
    title: "누가 낭독 이전에 유언장 내용을 알고 있었는가?",
    description: "소각된 초안은 정식 낭독본보다 앞선 판본이다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e5"],
  },
  {
    id: "q-marriage",
    title: "배우자가 감춘 이해관계는 사건과 어떻게 연결되는가?",
    description: "감춘 것이 많다는 사실만으로 동기가 성립하지는 않는다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e7"],
  },
  {
    id: "q-foundation",
    title: "감사가 시작되면 가장 많은 것을 잃는 사람은 누구인가?",
    description: "피해자는 승계 확정 직후 외부 감사를 요청할 예정이었다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e9"],
  },
  {
    id: "q-access",
    title: "축배 이후 7분 동안 팬트리에 들어간 사람은 누구인가?",
    description: "해당 구역 진입 카드 기록은 단 하나뿐이다.",
    status: "LOCKED",
    unlockedByEvidenceIds: ["e8"],
    solvedByEvidenceIds: ["e8"],
  },
];

const hotspots: RuntimeHotspot[] = [
  // Scene 01 — collapse site / reception room
  {
    id: "hs-victim-area",
    title: "피해자 주변",
    status: "AVAILABLE",
    revealsEvidenceIds: ["e1"],
  },
  {
    id: "hs-sofa-side",
    title: "응접실 소파 옆",
    status: "AVAILABLE",
    revealsEvidenceIds: ["e7"],
  },
  {
    id: "hs-hallway",
    title: "복도",
    status: "AVAILABLE",
    revealsEvidenceIds: ["e6"],
  },
  // Scene 02 — glass vs. actual poison-delivery path
  {
    id: "hs-bar-cart",
    title: "바 카트",
    status: "LOCKED",
    revealsEvidenceIds: ["e2", "e10"],
    unlockCondition: { requiresSceneIds: ["scene-01"] },
  },
  {
    id: "hs-pantry",
    title: "팬트리",
    status: "LOCKED",
    revealsEvidenceIds: ["e3"],
    unlockCondition: { requiresSceneIds: ["scene-01"] },
  },
  {
    id: "hs-forensic-desk",
    title: "감정 회신 문서",
    status: "LOCKED",
    revealsEvidenceIds: ["e4"],
    unlockCondition: {
      requiresSceneIds: ["scene-01"],
      requiresEvidenceIds: ["e1", "e2"],
    },
  },
  // Scene 03 — interrogation support material
  {
    id: "hs-fireplace",
    title: "벽난로",
    status: "LOCKED",
    revealsEvidenceIds: ["e5"],
    unlockCondition: { requiresSceneIds: ["scene-02"] },
  },
  {
    id: "hs-study",
    title: "2층 서재",
    status: "LOCKED",
    revealsEvidenceIds: ["e9"],
    unlockCondition: { requiresSceneIds: ["scene-02"] },
  },
  {
    id: "hs-security-console",
    title: "관리실 제어 콘솔",
    status: "LOCKED",
    revealsEvidenceIds: ["e8"],
    unlockCondition: { requiresSceneIds: ["scene-02"] },
  },
];

const scenes: Scene[] = [
  {
    id: "scene-01",
    title: "SCENE 01 — 쓰러진 상속자",
    description:
      "낭독이 끝난 응접실. 축배 잔은 그대로 남아 있고, 가족들은 각자 다른 방향을 보고 있다.",
    objective: "쓰러진 자리와 응접실을 조사해 첫 단서를 확보하세요.",
    status: "INVESTIGATION",
    availableHotspotIds: ["hs-victim-area", "hs-sofa-side", "hs-hallway"],
    availableSuspectIds: [],
    evidenceRewardIds: ["e1", "e7", "e6"],
    completionCondition: { minEvidenceRewards: 2 },
    nextSceneId: "scene-02",
  },
  {
    id: "scene-02",
    title: "SCENE 02 — 잔과 경로",
    description:
      "독이 나온 잔과 실제로 마신 잔이 다를 수 있다. 무엇이 몸에 들어갔는지부터 다시 세워야 한다.",
    objective: "실제 독이 전달된 경로를 특정하세요.",
    status: "ANALYSIS",
    availableHotspotIds: ["hs-bar-cart", "hs-pantry", "hs-forensic-desk"],
    availableSuspectIds: [],
    evidenceRewardIds: ["e2", "e10", "e3", "e4"],
    unlockCondition: { requiresSceneIds: ["scene-01"] },
    completionCondition: { requiresEvidenceIds: ["e2", "e3", "e4"] },
    nextSceneId: "scene-03",
  },
  {
    id: "scene-03",
    title: "SCENE 03 — 가족 심문",
    description:
      "네 사람 모두 무언가를 숨기고 있다. 숨긴 것과 죽인 것을 분리해야 한다.",
    objective: "진술을 확인하고 접근 기록과 어긋나는 지점을 찾아내세요.",
    status: "INTERROGATION",
    availableHotspotIds: ["hs-fireplace", "hs-study", "hs-security-console"],
    availableSuspectIds: ["s1", "s2", "s3", "s4"],
    evidenceRewardIds: ["e5", "e9", "e8"],
    unlockCondition: { requiresSceneIds: ["scene-02"] },
    completionCondition: {
      requiresEvidenceIds: ["e8"],
      requiresInterviewedSuspectIds: ["s1", "s2"],
    },
    nextSceneId: "scene-04",
  },
  {
    id: "scene-04",
    title: "SCENE 04 — 최종 추리",
    description: "잔, 습관, 기록, 진술. 네 갈래가 한 사람에게서 겹친다.",
    objective: "확보한 증거와 진술을 바탕으로 최종 추리를 제출하세요.",
    status: "ACCUSATION",
    availableHotspotIds: [],
    availableSuspectIds: ["s1", "s2", "s3", "s4"],
    evidenceRewardIds: [],
    unlockCondition: { requiresSceneIds: ["scene-03"] },
    nextSceneId: null,
  },
];

export const inheritancePartyRuntime: CaseDefinition = {
  id: "inheritance-party",
  title: "상속 파티의 비밀",
  scenes,
  evidence,
  questions,
  hotspots,
  suspectIds: ["s1", "s2", "s3", "s4"],
  startSceneId: "scene-01",
};

export { inheritancePartyRuntime as runtime };
