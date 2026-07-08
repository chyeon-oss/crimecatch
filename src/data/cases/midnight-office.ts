import type { Case } from "@/types";

/**
 * CONTENT LAYER — presentational case data for "한밤의 사무실 살인사건".
 *
 * This file drives the *visible copy* shown to the player: suspect cards,
 * evidence descriptions, timeline, victim, briefing. Progression, scene
 * flow, hotspot unlocks and evidence gating live in the sibling runtime
 * file: `src/data/runtime/midnightOfficeRuntime.ts`.
 *
 * Contract with the runtime layer:
 *   - Evidence ids MUST match runtime evidence ids one-to-one.
 *   - Suspect ids MUST match runtime `suspectIds`.
 *   - `hiddenTruth` and `isCulprit` are SPOILER fields. They exist for
 *     future scoring / final reconstruction only and MUST NEVER be
 *     rendered in the player-facing UI (cards, modals, partner panel,
 *     final deduction, notebook).
 *
 * Validated at dev-time by `validateCasePair()` (src/engine/CaseValidation.ts).
 */


export const midnightOffice: Case = {
  id: "midnight-office",
  slug: "midnight-office",
  title: "한밤의 사무실 살인사건",
  subtitle:
    "야근이 이어지던 개발팀 사무실, 잠긴 문 안쪽에서 팀장이 숨진 채 발견되었다.",
  difficulty: "보통",
  status: "무료",
  estimatedMinutes: 30,
  description:
    "서울 강남 스카이빌딩 12층, 국내 중견 IT 기업 ‘노바코어’의 개발본부. 3월 14일 자정 무렵, 야근 인력이 대부분 퇴근한 뒤에도 자리를 지키던 개발팀장 김도현이 자신의 개인 사무실에서 사망한 채 발견되었다. 사무실 문은 안쪽에서 잠겨 있었고, 사건 직전 30분간 12층 CCTV는 원인이 확인되지 않은 정전으로 완전히 꺼져 있었다. 최초 신고자는 야간 청소 담당자였다.",
  incidentTime: "2025년 3월 14일 오후 11시 50분경",
  incidentLocation: "서울 강남구 스카이빌딩 12층, 노바코어 개발본부 팀장실",
  victim: {
    name: "김도현",
    age: 42,
    occupation: "개발본부 개발1팀장",
    department: "노바코어 개발본부 개발1팀",
    causeOfDeath: "둔기에 의한 두부 손상 (좌측 측두부, 단일 타격 추정)",
    biography:
      "카이스트 전산학과 졸업 후 대기업 SI에서 8년을 근무하고 3년 전 노바코어 경력직으로 합류. 합류 1년 만에 팀장으로 승진했고, 회사의 주력 결제 플랫폼 리뉴얼 프로젝트를 총괄해 왔다. 사내에서는 실력은 인정받지만 회의 자리에서 팀원을 강하게 몰아붙이는 스타일로 알려져 있었다.",
    portraitPrompt:
      "40대 초반 한국 남성, 짧게 다듬은 머리와 무테 안경, 짙은 회색 셔츠 차림. 회의실 화이트보드를 배경으로 팔짱을 낀 자세, 형광등 아래에서 촬영된 사내 인물 사진 스타일, 자연광이 절제된 다큐멘터리톤 포토그래피.",
    personalNotes:
      "이혼 3년 차, 초등학생 딸의 양육권은 전 배우자에게 있음. 최근 6개월간 야근 빈도가 눈에 띄게 늘었고 주말에도 사무실에 자주 나왔다. 회사 앞 헬스장 월정액을 결제했으나 지난 두 달간 출입 기록은 없다.",
  },
  suspects: [
    {
      id: "s1",
      name: "박민수",
      age: 38,
      occupation: "개발1팀 부팀장",
      relationship:
        "피해자와 같은 팀에서 3년간 함께 일한 직속 부하. 결제 플랫폼 리뉴얼 프로젝트를 실무 리드로 함께 이끌었다.",
      personality:
        "말수가 적고 감정을 잘 드러내지 않는 편. 회의에서는 논리적이고 침착한 어조를 유지하지만, 문장 끝을 흐리며 상대의 반응을 살피는 습관이 있다.",
      initialStatement:
        "그 시간엔 저 혼자 소회의실에서 다음 주 스프린트 리뷰 자료를 정리하고 있었습니다. 팀장님 사무실 쪽은 지나가지도 않았어요.",
      alibi:
        "20시경부터 12층 소회의실 B에서 스프린트 리뷰 자료를 작성 중이었다고 진술. 회의실 예약 시스템에는 22시까지 본인 이름으로 예약이 잡혀 있음.",
      hiddenTruth:
        "정전 직전 12층 배전반에 접근한 사람은 그였다. 피해자가 자신의 승진 탈락을 조작했다고 믿고 있었다.",
      isCulprit: true,
    },
    {
      id: "s2",
      name: "이서연",
      age: 31,
      occupation: "프로덕트 기획팀 시니어 매니저",
      relationship:
        "피해자와 결제 플랫폼 리뉴얼 프로젝트를 함께 담당한 기획 파트너. 사건 당일 오후 스펙 변경 건으로 팀장실에서 큰 소리로 말다툼이 있었다는 목격 진술이 다수 확보되었다.",
      personality:
        "감정을 숨기지 않는 직설적인 화법. 말이 빠르고 손짓이 많으며, 자신이 맞다고 생각하는 지점에서는 상대의 말을 끊는 경향이 있다.",
      initialStatement:
        "낮에 다툰 건 인정해요. 그렇다고 사람을 어떻게 해요? 저는 그 시간에 탕비실에서 커피 내리고 있었어요. 필요하면 카드 로그 확인하세요.",
      alibi:
        "20시 10분경부터 12층 탕비실에서 캡슐 커피 머신을 사용했다고 진술. 탕비실 입구 CCTV에 진입 장면이 남아 있다.",
      hiddenTruth: "탕비실 CCTV에 실제로 잡혔지만 5분간 자리를 비운 구간이 있다.",
      isCulprit: false,
    },
    {
      id: "s3",
      name: "최지훈",
      age: 29,
      occupation: "개발1팀 시니어 백엔드 개발자",
      relationship:
        "피해자의 팀원. 사건 당일 오후 코드 리뷰 자리에서 피해자에게 공개적으로 강한 질책을 받았다는 진술이 있다.",
      personality:
        "조용하고 시선을 잘 마주치지 않는 편. 질문을 받으면 대답 전에 짧게 숨을 고르고, 대화 중 손을 자주 마주 잡는다.",
      initialStatement:
        "저는 그냥 제 자리에서 리뷰 코멘트 정리하고 있었어요. 이어폰 끼고 있어서 밖에서 무슨 일이 있었는지도 몰랐고요.",
      alibi:
        "본인 좌석(개발1팀 창가 라인)에서 코드 리뷰 코멘트를 작성 중이었다고 진술. 사내 저장소에 20시 12분과 20시 41분에 커밋이 남아 있다.",
      hiddenTruth: "당시 커밋 로그가 자리를 지켰음을 증명한다.",
      isCulprit: false,
    },
    {
      id: "s4",
      name: "한유리",
      age: 35,
      occupation: "인사팀장",
      relationship:
        "이번 상반기 개발본부 인사평가 실무를 총괄. 피해자와는 승진·평가 관련 회의로 최근 두 달간 접촉이 잦았다.",
      personality:
        "표정 변화가 적고 문장이 짧다. 사실관계만 답하는 원칙주의적 화법을 유지하며, 감정적인 질문에는 대답을 피하는 편.",
      initialStatement:
        "저는 15층 인사팀 사무실에 있었습니다. 결재 대기 중인 서류가 많아 야근하고 있었어요. 그 시간에 12층에 올라갈 이유가 없습니다.",
      alibi:
        "15층 인사팀 사무실에서 상반기 승진 대상자 서류를 정리하고 있었다고 진술. 인사팀 공용 프린터 로그에 20시 22분 출력 기록이 있음.",
      hiddenTruth:
        "박민수의 승진 탈락을 통보한 당사자. 사건 전 그에게서 이상한 전화를 받았다.",
      isCulprit: false,
    },
  ],
  evidence: [
    {
      id: "e1",
      title: "깨진 머그컵",
      category: "OBJECT",
      summary: "피해자 책상 옆에서 산산조각 난 채 발견.",
      detail: "커피 자국이 벽까지 튀어 있다. 다툼이 있었음을 시사한다.",
      location: "피해자 책상 옆",
      unlockOrder: 0,
      importance: "COMMON",
      relatedEvidenceIds: ["e5"],
      relatedTimelineTimes: ["23:50"],
    },
    {
      id: "e2",
      title: "꺼진 CCTV 기록",
      category: "CCTV",
      summary: "사건 직전 30분간 12층 전체 CCTV가 정전으로 꺼져 있었다.",
      detail: "정전은 12층에만 국한되었고, 배전반에 수동 조작 흔적이 남아 있다.",
      location: "관제실 서버",
      unlockOrder: 0,
      importance: "IMPORTANT",
      relatedEvidenceIds: ["e6"],
      relatedSuspectIds: ["s1"],
      relatedTimelineTimes: ["20:05", "20:30"],
    },
    {
      id: "e3",
      title: "피해자의 노트북",
      category: "PHONE",
      summary: "화면은 열린 채였고, 사건 직전 메시지가 일부 삭제된 흔적이 있다.",
      detail: "복구된 로그에서 '박' 으로 시작하는 이름과의 대화 일부가 확인된다.",
      location: "피해자 책상",
      unlockOrder: 1,
      unlockCondition: { requiresEvidenceIds: ["e1", "e2"] },
      importance: "UNCOMMON",
      relatedSuspectIds: ["s1"],
    },
    {
      id: "e4",
      title: "잠긴 사무실 문",
      category: "OBJECT",
      summary: "사무실 문은 안쪽에서 잠겨 있었다.",
      detail: "예비 열쇠 소지자는 팀장, 부팀장, 총무팀 3명뿐이다.",
      location: "사무실 출입문",
      unlockOrder: 1,
      importance: "UNCOMMON",
      relatedSuspectIds: ["s1"],
    },
    {
      id: "e5",
      title: "책상 아래 혈흔",
      category: "FORENSIC",
      summary: "책상 아래에서 소량의 혈흔 발견.",
      detail:
        "감식 결과 피해자의 것이 아닌 제3자의 혈흔. 부팀장 박민수의 손등 상처와 일치한다.",
      location: "책상 아래",
      unlockOrder: 2,
      unlockCondition: { requiresEvidenceIds: ["e3"] },
      importance: "CRITICAL",
      relatedEvidenceIds: ["e1"],
      relatedSuspectIds: ["s1"],
    },
    {
      id: "e6",
      title: "정전 기록",
      category: "DOCUMENT",
      summary: "12층 배전반에 수동 조작 흔적.",
      detail: "정전 시각 직전 배전반 앞에 접근한 인물은 박민수. 출입 카드 로그로 확인됨.",
      location: "12층 배전반",
      unlockOrder: 2,
      unlockCondition: { requiresEvidenceIds: ["e2"] },
      importance: "CRITICAL",
      relatedEvidenceIds: ["e2"],
      relatedSuspectIds: ["s1"],
      relatedTimelineTimes: ["20:05"],
    },
  ],

  crimeScene: {
    imagePrompt: "심야의 12층 개발팀 사무실, 어질러진 책상과 깜빡이는 형광등",
    hotspots: [
      {
        id: "desk",
        label: "책상",
        hint: "노트북과 서류가 널려 있다",
        revealsEvidenceIds: ["e1", "e3"],
      },
      {
        id: "bookshelf",
        label: "책장",
        hint: "가지런히 정돈된 기술서적",
        revealsEvidenceIds: [],
        emptyMessage: "특이한 점은 발견되지 않았다.",
      },
      {
        id: "window",
        label: "창문",
        hint: "12층 야경이 보인다",
        revealsEvidenceIds: [],
        emptyMessage: "창은 잠겨 있고 손댄 흔적이 없다.",
      },
      {
        id: "victim-area",
        label: "피해자 주변",
        hint: "천장 CCTV의 붉은 표시등이 꺼져 있다",
        revealsEvidenceIds: ["e2"],
      },
      {
        id: "floor",
        label: "바닥",
        hint: "책상 아래로 무언가 번져 있다",
        revealsEvidenceIds: ["e5"],
      },
      {
        id: "breaker",
        label: "배전함",
        hint: "커버가 살짝 어긋나 있다",
        revealsEvidenceIds: ["e6"],
      },
      {
        id: "door",
        label: "출입문",
        hint: "안쪽에서 잠긴 흔적",
        revealsEvidenceIds: ["e4"],
      },
    ],
  },
  timeline: [
    { time: "19:20", description: "피해자 김도현이 사무실에 들어감" },
    { time: "20:05", description: "12층 정전 발생", relatedSuspectId: "s1" },
    { time: "20:18", description: "미확인 인물이 사무실 방향으로 이동" },
    { time: "20:30", description: "정전 복구, CCTV 재가동" },
    { time: "23:50", description: "청소원이 사무실에서 피해자를 발견" },
  ],
  hiddenFacts: [
    {
      id: "h1",
      title: "박민수의 승진 탈락",
      description:
        "박민수는 피해자가 자신의 승진 평가를 의도적으로 낮췄다고 믿고 있었다.",
      relatedSuspects: ["s1", "s4"],
    },
    {
      id: "h2",
      title: "배전반 접근자",
      description: "정전 직전 12층 배전반에 접근한 카드 로그는 박민수의 것이었다.",
      relatedSuspects: ["s1"],
    },
  ],
  solution: {
    culpritId: "s1",
    motive: "승진 탈락에 대한 원한과 인사 조작 폭로 위협",
    murderMethod: "정전을 유도한 뒤 사무실에 진입, 머그컵으로 가격",
    murderTime: "20:18 ~ 20:28",
    requiredEvidence: ["e2", "e5", "e6"],
    contradictionPairs: [
      {
        evidenceId: "e6",
        suspectId: "s1",
        explanation: "회의실에 있었다는 진술과 배전반 카드 로그가 모순된다.",
      },
      {
        evidenceId: "e5",
        suspectId: "s1",
        explanation: "혈흔이 박민수의 손등 상처와 일치한다.",
      },
    ],
  },
  unlockRules: {
    minEvidenceReadBeforeAccusation: 3,
    minSuspectsInterrogatedBeforeAccusation: 2,
  },
  achievements: [
    {
      id: "a1",
      title: "모든 디테일을 관찰하다",
      description: "모든 증거를 열람했습니다.",
      trigger: "READ_ALL_EVIDENCE",
    },
    {
      id: "a2",
      title: "완벽한 탐정",
      description: "모든 증거와 심문을 마치고 정답을 맞혔습니다.",
      trigger: "PERFECT_DETECTIVE",
    },
    {
      id: "a3",
      title: "잘못된 지목",
      description: "잘못된 범인을 지목했습니다.",
      trigger: "WRONG_ACCUSATION",
    },
  ],
  questions: [
    {
      id: "q1",
      text: "누가 사건 직전 12층의 전원을 내렸는가?",
      generatedByEvidenceIds: ["e2"],
      solvedByEvidenceIds: ["e6"],
    },
    {
      id: "q2",
      text: "안쪽에서 잠긴 사무실에 어떻게 진입했는가?",
      generatedByEvidenceIds: ["e4"],
    },
    {
      id: "q3",
      text: "책상 아래 남겨진 낯선 혈흔의 주인은 누구인가?",
      generatedByEvidenceIds: ["e5"],
      solvedByEvidenceIds: ["e5"],
    },
    {
      id: "q4",
      text: "피해자와 마지막으로 대화한 인물은 누구인가?",
      generatedByEvidenceIds: ["e3"],
    },
  ],
};

