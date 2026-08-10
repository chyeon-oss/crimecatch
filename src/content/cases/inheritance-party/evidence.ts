import type { Evidence } from "@/types/evidence";

/**
 * PUBLIC evidence for CASE002 — inheritance-party.
 * Player-facing copy only. No culprit flags, no solution text.
 *
 * Logic layering:
 *   e1        → supports the obvious (wrong) champagne theory
 *   e2, e3    → establish the victim's private whisky / honey-dropper ritual
 *   e4        → dose distribution proves the champagne was not lethal
 *   e8        → access & timing record narrows who could touch the dropper
 *   e5,e6,e7,e10 → real wrongdoing by non-culprits (resolvable red herrings)
 *   e9        → the reason someone needed the announcement stopped
 */
export const evidence: Evidence[] = [
  {
    id: "e1",
    title: "축배용 샴페인 잔",
    category: "FORENSIC",
    summary: "피해자가 축배에 사용한 샴페인 잔. 시안화물 반응이 나왔다.",
    detail:
      "응접실 중앙 테이블에 남아 있던 잔이다. 내용물은 3분의 1 정도 남았고, 예비 시약 검사에서 시안화물 양성 반응이 나왔다. 잔 표면에는 여러 사람의 접촉 흔적이 뒤섞여 있어 특정이 어렵다. 축배 잔에 독이 들어 있었다는 결론은 자연스럽지만, 아직 검출량은 확인되지 않았다.",
    location: "대응접실 중앙 테이블",
    unlockOrder: 0,
    importance: "IMPORTANT",
    observation:
      "독이 검출된 것과, 그 양이 사람을 죽일 수 있는 양인지는 별개의 문제다.",
    notebookEntry:
      "축배 잔에서 시안화물 양성 반응 확인. 다만 검출량은 미확인. 접촉 흔적은 다수가 섞여 특정 불가.",
    unlockedQuestion: "축배 잔에 독을 넣을 수 있었던 사람은 누구인가?",
    relatedTimelineTimes: ["21:06"],
    tags: ["독극물", "축배"],
  },
  {
    id: "e2",
    title: "피해자의 개인 위스키 잔",
    category: "FORENSIC",
    summary: "바 카트 위에 남아 있던 피해자 전용 위스키 잔.",
    detail:
      "손잡이 없는 두꺼운 크리스털 잔이다. 바닥에 소량의 위스키가 남아 있고, 잔 안쪽 벽면에 점성이 있는 투명한 띠가 굳어 있다. 가사 인력은 이 잔을 피해자 외에는 아무도 쓰지 않았다고 진술했다. 잔은 축배 이후 사용된 것으로 보인다.",
    location: "응접실 바 카트",
    unlockOrder: 1,
    unlockCondition: { requiresEvidenceIds: ["e1"] },
    importance: "CRITICAL",
    observation:
      "축배 잔이 아니라 이 잔이 피해자가 마지막으로 입에 댄 용기일 수 있다.",
    notebookEntry:
      "피해자 전용 위스키 잔 확보. 잔 안쪽에 점성 있는 투명한 잔여물이 굳어 있다. 축배 이후 사용된 흔적.",
    unlockedQuestion: "피해자가 마지막으로 마신 것은 정말 샴페인이었을까?",
    relatedEvidenceIds: ["e1", "e3"],
    relatedTimelineTimes: ["21:12"],
    tags: ["위스키", "잔여물"],
  },
  {
    id: "e3",
    title: "벌꿀 시럽 점적기",
    category: "OBJECT",
    summary: "피해자가 위스키에 넣어 마시던 벌꿀 시럽 병과 스포이드형 점적기.",
    detail:
      "조리실 옆 팬트리 선반에 놓인 작은 유리병이다. 피해자는 만성 위염 때문에 위스키에 벌꿀 시럽을 두세 방울 떨어뜨려 마시는 습관이 있었고, 이 점적기는 그 용도로만 쓰였다. 가족 대부분이 이 습관을 알고 있었다. 병 목 부분이 최근에 닦인 듯 유독 깨끗하다.",
    location: "조리실 옆 팬트리",
    unlockOrder: 1,
    importance: "IMPORTANT",
    observation:
      "이 습관은 오래된 것이다. 오래된 습관은 예측 가능하고, 예측 가능한 것은 이용될 수 있다.",
    notebookEntry:
      "벌꿀 시럽 점적기 확인. 피해자 전용 습관 용품. 병 목 부분만 최근에 닦인 상태.",
    unlockedQuestion: "피해자만 사용하는 용품에 접근한 사람은 누구인가?",
    relatedEvidenceIds: ["e2"],
    tags: ["습관", "팬트리"],
  },
  {
    id: "e4",
    title: "독성 감정 예비 회신",
    category: "DOCUMENT",
    summary: "샴페인 잔과 위스키 잔의 시안화물 농도 비교 결과.",
    detail:
      "감정 회신에 따르면 샴페인 잔의 시안화물 농도는 치사량에 크게 미치지 못했다. 반대로 위스키 잔 잔여물과 점성 물질에서는 치사 농도를 훨씬 넘는 값이 나왔다. 회신은 두 잔의 오염 시점이 다를 가능성을 명시했다. 즉, 축배 잔의 독은 죽음의 원인이 아니라 죽음의 설명처럼 놓여 있었던 것이 된다.",
    location: "감정 회신 문서",
    unlockOrder: 2,
    unlockCondition: { requiresEvidenceIds: ["e1", "e2"] },
    importance: "CRITICAL",
    observation:
      "죽인 잔과 보여주기 위한 잔이 따로 있다면, 범인은 발견될 것을 예상했다는 뜻이다.",
    notebookEntry:
      "감정 회신 확인. 샴페인 잔은 치사량 미달, 위스키 잔 잔여물은 치사 농도 초과. 두 잔의 오염 시점이 다르다.",
    unlockedQuestion: "왜 두 잔의 독 농도가 이렇게 다른가?",
    relatedEvidenceIds: ["e1", "e2", "e3"],
    tags: ["감정", "치사량"],
  },
  {
    id: "e5",
    title: "소각된 유언장 초안 조각",
    category: "DOCUMENT",
    summary: "응접실 벽난로 재 속에서 수거된 문서 조각.",
    detail:
      "타다 남은 조각에 '지분 승계 대상에서 제외' 라는 문구와 '지원' 이라는 이름의 일부가 남아 있다. 용지 종류는 서재 프린터의 것과 같다. 이 초안은 정식 낭독본보다 앞선 판본으로 보인다. 누군가 낭독 이전에 이미 내용을 알고 있었다는 뜻이 된다.",
    location: "응접실 벽난로",
    unlockOrder: 2,
    importance: "IMPORTANT",
    observation:
      "문서를 태운 사람과 사람을 죽인 사람이 반드시 같을 필요는 없다.",
    notebookEntry:
      "벽난로에서 유언장 초안 조각 수거. 승계 제외 문구와 이름 일부 확인. 용지는 서재 프린터 용지와 동일.",
    unlockedQuestion: "누가 낭독 이전에 유언장 내용을 알고 있었는가?",
    relatedSuspectIds: ["s1"],
    relatedTimelineTimes: ["21:00"],
    tags: ["유언장", "소각"],
  },
  {
    id: "e6",
    title: "피해자 휴대전화 이동 기록",
    category: "PHONE",
    summary: "사건 직후 피해자의 휴대전화가 잠시 자리를 벗어난 기록.",
    detail:
      "기기 로그에는 21:26부터 21:39 사이 위치가 응접실에서 복도 쪽으로 이동한 뒤 되돌아온 흔적이 남아 있다. 같은 시간대에 채무 관련 메시지 한 건이 삭제되었다. 삭제된 메시지의 발신자는 사설 대출 중개 번호였다. 이 조작은 사망 이후에 일어났다.",
    location: "복도 · 응접실",
    unlockOrder: 1,
    importance: "IMPORTANT",
    observation:
      "사망 이후의 조작은 살인과 다른 종류의 죄다. 시각을 확인해야 한다.",
    notebookEntry:
      "피해자 휴대전화가 21:26~21:39 사이 복도 쪽으로 이동 후 복귀. 같은 시간대 채무 관련 메시지 1건 삭제.",
    unlockedQuestion: "사망 이후 휴대전화를 만진 사람은 누구이고, 왜인가?",
    relatedSuspectIds: ["s3"],
    relatedEvidenceIds: ["e10"],
    tags: ["휴대전화", "삭제"],
  },
  {
    id: "e7",
    title: "별거 협의 및 혼전계약 분쟁 서류",
    category: "DOCUMENT",
    summary: "응접실 소파 옆 서류 가방에서 나온 미제출 협의 초안.",
    detail:
      "별거 협의 초안과 혼전계약 조항 해석에 대한 의견서가 함께 들어 있었다. 작성일은 사건 11일 전이다. 배우자 측이 재산 분할 관련 문서를 사전에 열람한 기록도 첨부되어 있다. 다만 어느 문서도 피해자의 사망으로 유리해지는 구조는 아니다 — 사망 시 혼전계약 조항 일부는 오히려 효력을 잃는다.",
    location: "응접실 소파 옆",
    unlockOrder: 1,
    importance: "UNCOMMON",
    observation:
      "숨긴 것이 많다는 사실이 곧 살인 동기가 되는 것은 아니다.",
    notebookEntry:
      "별거 협의 초안과 혼전계약 의견서 확보. 작성일은 사건 11일 전. 사망으로 유리해지는 구조는 아님.",
    unlockedQuestion: "배우자가 감춘 이해관계는 사건과 어떻게 연결되는가?",
    relatedSuspectIds: ["s4"],
    tags: ["혼전계약", "별거"],
  },
  {
    id: "e8",
    title: "저택 내부 출입 · 조명 제어 기록",
    category: "CCTV",
    summary: "조리실 · 팬트리 · 서재 구역의 출입 및 조명 제어 로그.",
    detail:
      "본가는 구역별 출입 카드와 조명 제어 기록을 남긴다. 21:07부터 21:14 사이 팬트리 구역 조명이 켜졌고, 해당 구역에 진입한 카드 기록은 단 하나다. 같은 시간 조리실 문은 닫힌 상태였고, 가사 인력은 응접실 쪽에 있었다. 서재 구역에는 21:02에 별개의 진입 기록이 남아 있다.",
    location: "관리실 제어 콘솔",
    unlockOrder: 2,
    unlockCondition: { requiresEvidenceIds: ["e3"] },
    importance: "CRITICAL",
    observation:
      "축배와 쓰러짐 사이의 7분. 그 구역에 들어간 카드는 하나뿐이다.",
    notebookEntry:
      "팬트리 구역 21:07~21:14 조명 점등, 진입 카드 기록 1건. 서재 구역 21:02 별도 진입 기록. 조리실 문은 닫힌 상태.",
    unlockedQuestion: "축배 이후 7분 동안 팬트리에 들어간 사람은 누구인가?",
    relatedEvidenceIds: ["e3", "e2"],
    relatedTimelineTimes: ["21:06", "21:12"],
    tags: ["출입기록", "시간대"],
  },
  {
    id: "e9",
    title: "재단 외부 감사 요청 초안",
    category: "DOCUMENT",
    summary: "피해자가 낭독 당일 작성한 미발송 메일 초안.",
    detail:
      "수신자는 외부 회계법인이고, 본문에는 가족재단의 최근 3개년 집행 내역 전수 검토를 요청하는 문장이 들어 있다. 첨부 목록에는 '이전 판본 유언장 검토'라는 항목도 포함되어 있다. 초안 최종 수정 시각은 20:41이다. 피해자는 승계가 확정되는 즉시 이것을 발송할 예정이었다.",
    location: "서재 노트북",
    unlockOrder: 2,
    unlockCondition: { requiresEvidenceIds: ["e5"] },
    importance: "CRITICAL",
    observation:
      "재단 집행 내역이 열리면 곤란해지는 사람이 이 집 안에 있다.",
    notebookEntry:
      "피해자가 작성한 재단 외부 감사 요청 메일 초안 확인. 3개년 집행 내역 전수 검토 및 이전 판본 유언장 검토 포함. 20:41 최종 수정, 미발송.",
    unlockedQuestion: "감사가 시작되면 가장 많은 것을 잃는 사람은 누구인가?",
    relatedEvidenceIds: ["e5"],
    tags: ["재단", "감사"],
  },
  {
    id: "e10",
    title: "바 카트 아래 커프스단추",
    category: "OBJECT",
    summary: "바 카트 하단 카펫 틈에서 발견된 은색 커프스단추 한 개.",
    detail:
      "카펫 결에 걸려 있었다. 각인은 없고, 사건 당일 착용 복장과 대조 가능한 형태다. 낙하 위치는 바 카트 앞 30cm 지점이며, 위스키 잔이 놓인 자리와는 다른 방향이다. 카펫에는 눌린 자국이 함께 남아 있어, 누군가 카트 앞에 몸을 낮춘 적이 있음을 시사한다.",
    location: "응접실 바 카트 하단",
    unlockOrder: 1,
    importance: "UNCOMMON",
    observation:
      "카트 앞에 몸을 낮춘 사람이 있었다. 다만 그가 찾던 것이 잔이었는지는 알 수 없다.",
    notebookEntry:
      "바 카트 아래 은색 커프스단추 1개 수거. 카펫에 눌린 자국 동반. 낙하 위치는 위스키 잔 방향과 불일치.",
    unlockedQuestion: "바 카트 앞에 몸을 낮춘 사람은 무엇을 찾고 있었는가?",
    relatedSuspectIds: ["s3"],
    relatedEvidenceIds: ["e6"],
    tags: ["바카트", "물리흔적"],
  },
];
