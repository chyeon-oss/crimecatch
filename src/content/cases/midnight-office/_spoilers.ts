/**
 * PRIVATE spoiler layer — hiddenTruth / isCulprit per suspect.
 * Never import from a component or a player-facing module.
 * Merged into the Case object inside this folder's index.ts.
 */
export const suspectSpoilers: Record<string, { hiddenTruth: string; isCulprit: boolean }> = {
  s1: {
    hiddenTruth:
      "정전 직전 12층 배전반에 접근한 사람은 그였다. 피해자가 자신의 승진 탈락을 조작했다고 믿고 있었다.",
    isCulprit: true,
  },
  s2: {
    hiddenTruth: "탕비실 CCTV에 실제로 잡혔지만 5분간 자리를 비운 구간이 있다.",
    isCulprit: false,
  },
  s3: {
    hiddenTruth: "당시 커밋 로그가 자리를 지켰음을 증명한다.",
    isCulprit: false,
  },
  s4: {
    hiddenTruth:
      "박민수의 승진 탈락을 통보한 당사자. 사건 전 그에게서 이상한 전화를 받았다.",
    isCulprit: false,
  },
};

export const hiddenFacts = [
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
];

export const solution = {
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
};
