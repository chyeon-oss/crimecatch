/**
 * PRIVATE spoiler layer for CASE002 — hiddenTruth / isCulprit per suspect,
 * solution, and the Final Deduction answer key.
 *
 * Never import from a component or a player-facing module.
 * Merged into the Case object inside this folder's index.ts.
 */
export const suspectSpoilers: Record<string, { hiddenTruth: string; isCulprit: boolean }> = {
  s1: {
    hiddenTruth:
      "낭독 전날 서재 프린터로 유언장 초안을 출력해 읽었고, 자신이 승계에서 제외된 것을 확인했다. 21:02에 서재에 들어가 사본을 챙긴 뒤, 축배가 끝나고 벽난로에 태웠다. 살인과는 무관하며, 문서 은닉과 서재 방문 부인만이 그의 거짓이다.",
    isCulprit: false,
  },
  s2: {
    hiddenTruth:
      "6년간 가족재단 집행 내역을 조작해 개인 채무와 부동산 손실을 메워 왔고, 이전 판본 유언장의 배분 조항도 손댔다. 피해자가 승계 즉시 외부 감사를 요청할 예정임을 20:50경 알게 되었다. 축배 직후 팬트리에 들어가 벌꿀 시럽 점적기에 시안화물을 넣었고, 발견을 대비해 샴페인 잔에는 소량만 흘려 넣어 축배 독살처럼 보이게 만들었다.",
    isCulprit: true,
  },
  s3: {
    hiddenTruth:
      "사설 대출로 4억 원대 채무를 지고 있으며, 형에게 마지막으로 거절당한 상태였다. 축배 전 바 카트 앞에 몸을 낮춰 떨어뜨린 휴대전화를 찾다가 커프스단추를 잃었다. 사망 이후 형의 휴대전화를 가져가 채무 관련 메시지를 지웠다. 독에는 손대지 않았다.",
    isCulprit: false,
  },
  s4: {
    hiddenTruth:
      "별거와 혼전계약 분쟁이 진행 중이었고, 재산 분할에 대비해 사전에 재무 문서를 열람했다. 다만 피해자의 사망은 혼전계약상 자신에게 불리하게 작용한다. 감춘 것은 이해관계이며 범행과 무관하다.",
    isCulprit: false,
  },
};

export const hiddenFacts = [
  {
    id: "h1",
    title: "재단 집행 내역 조작",
    description:
      "가족재단의 최근 3개년 집행 내역에는 실체가 없는 지원 항목이 반복되어 있고, 그 실무 권한은 한 사람에게만 있었다.",
    relatedSuspects: ["s2"],
  },
  {
    id: "h2",
    title: "피해자의 습관은 공개된 정보였다",
    description:
      "위스키에 벌꿀 시럽을 두세 방울 넣는 습관은 가족 모두가 알고 있었으나, 점적기가 놓인 팬트리에 접근할 이유가 있는 사람은 만찬 준비 담당자뿐이었다.",
    relatedSuspects: ["s2"],
  },
  {
    id: "h3",
    title: "축배 잔은 연출이었다",
    description:
      "샴페인 잔의 시안화물은 치사량에 크게 미달한다. 발견 시 수사 방향을 축배로 고정하기 위한 배치였다.",
    relatedSuspects: ["s2"],
  },
];

export const solution = {
  culpritId: "s2",
  motive:
    "가족재단 집행 내역 조작과 이전 판본 유언장 손질을 은폐하기 위함. 피해자가 승계 직후 외부 감사를 발표할 예정이었다.",
  murderMethod:
    "축배 직후 팬트리에서 벌꿀 시럽 점적기에 시안화물을 주입, 피해자의 개인 위스키 습관을 통해 치사량 전달. 샴페인 잔에는 소량만 흘려 축배 독살로 위장.",
  murderTime: "21:07 ~ 21:14 (팬트리 조작) / 21:12 ~ 21:20 (섭취 및 발현)",
  requiredEvidence: ["e2", "e3", "e4", "e8"],
  contradictionPairs: [
    {
      evidenceId: "e4",
      suspectId: "s2",
      explanation:
        "축배 잔 독살이라는 전제가 감정 회신과 모순된다. 샴페인은 치사량 미달이고 치사 농도는 위스키 잔 잔여물에서만 나왔다.",
    },
    {
      evidenceId: "e8",
      suspectId: "s2",
      explanation:
        "21:07~21:14 팬트리 진입 카드 기록은 하나뿐이며, 그 시간 조리실에 있었다는 그의 진술과 겹치지 않는다.",
    },
    {
      evidenceId: "e9",
      suspectId: "s2",
      explanation:
        "재단 감사 요청 초안의 존재는 '발표 내용을 몰랐다'는 진술과 어긋나며, 은폐 동기를 직접 성립시킨다.",
    },
    {
      evidenceId: "e3",
      suspectId: "s2",
      explanation:
        "점적기 병 목만 최근에 닦여 있다는 사실은, 만찬 준비 외에는 팬트리를 만지지 않았다는 진술과 맞지 않는다.",
    },
  ],
};

/**
 * PRIVATE answer key for Final Deduction scoring.
 * Consumed only by src/lib/deductionScoring.ts AFTER the player submits.
 * MUST NEVER be rendered in the UI before submission.
 */
export interface CaseAnswerKey {
  correctSuspectId: string;
  correctMotiveId: string;
  correctMethodId: string;
  decisiveEvidenceIds: string[];
  /** Endpoint pairs formatted as "kind:id" (evidence|question|suspect). Order-insensitive. */
  requiredConnectionPairs: { a: string; b: string }[];
}

export const answerKey: CaseAnswerKey = {
  correctSuspectId: "s2",
  correctMotiveId: "motive-cover-up",
  correctMethodId: "method-poison",
  decisiveEvidenceIds: ["e4", "e8", "e3", "e9"],
  requiredConnectionPairs: [
    { a: "evidence:e4", b: "evidence:e2" },
    { a: "evidence:e8", b: "suspect:s2" },
    { a: "evidence:e9", b: "suspect:s2" },
  ],
};
