import type { CrimeScene } from "@/types/hotspot";

export const crimeScene: CrimeScene = {
  imagePrompt: "심야의 12층 기획전략실, 어질러진 책상과 깜빡이는 형광등",
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
};

export const questions = [
  {
    id: "q1",
    text: "CCTV 공백은 누가 만든 것일까, 아니면 원래 존재하던 구간일까?",
    generatedByEvidenceIds: ["e2"],
    solvedByEvidenceIds: ["e6"],
  },
  {
    id: "q2",
    text: "문은 정말 안에서 잠긴 것이 맞을까?",
    generatedByEvidenceIds: ["e4"],
  },
  {
    id: "q3",
    text: "피해자는 정말 이 자리에서 치명상을 입은 것일까?",
    generatedByEvidenceIds: ["e5"],
  },
  {
    id: "q4",
    text: "피해자는 사건 직전 누구와 무엇을 검토하고 있었을까?",
    generatedByEvidenceIds: ["e3"],
  },
  {
    id: "q5",
    text: "왜 컵은 깨졌는데 액체 흔적은 거의 없을까?",
    generatedByEvidenceIds: ["e1"],
  },
  {
    id: "q6",
    text: "정전은 우연이었을까, 누군가 이용한 것일까?",
    generatedByEvidenceIds: ["e6"],
    solvedByEvidenceIds: ["e6"],
  },
  {
    id: "q7",
    text: "피해자는 정확히 언제 사망했을까?",
    generatedByEvidenceIds: ["e2", "e7"],
    solvedByEvidenceIds: ["e2", "e7"],
  },
  {
    id: "q8",
    text: "누가 피해자와 마지막으로 대화했을까?",
    generatedByEvidenceIds: ["e2"],
  },
  {
    id: "q9",
    text: "각 용의자의 알리바이는 증거와 일치할까?",
    generatedByEvidenceIds: ["e6"],
  },
  {
    id: "q10",
    text: "피해자가 사건 직전 검토하던 자료는 누구와 관련되어 있을까?",
    generatedByEvidenceIds: ["e3"],
  },
];

export const achievements = [
  {
    id: "a1",
    title: "모든 디테일을 관찰하다",
    description: "모든 증거를 열람했습니다.",
    trigger: "READ_ALL_EVIDENCE" as const,
  },
  {
    id: "a2",
    title: "완벽한 탐정",
    description: "모든 증거와 심문을 마치고 정답을 맞혔습니다.",
    trigger: "PERFECT_DETECTIVE" as const,
  },
  {
    id: "a3",
    title: "잘못된 지목",
    description: "잘못된 범인을 지목했습니다.",
    trigger: "WRONG_ACCUSATION" as const,
  },
];

export const unlockRules = {
  minEvidenceReadBeforeAccusation: 3,
  minSuspectsInterrogatedBeforeAccusation: 2,
};
