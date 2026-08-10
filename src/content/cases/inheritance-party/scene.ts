import type { CrimeScene } from "@/types/hotspot";

/**
 * PUBLIC scene layer for CASE002 — hotspots, investigation questions,
 * achievements and case-wide unlock rules. No spoilers.
 */
export const crimeScene: CrimeScene = {
  imagePrompt:
    "겨울밤 성북동 저택 대응접실, 낭독 후 흐트러진 만찬 테이블과 바 카트, 벽난로의 잔불",
  hotspots: [
    {
      id: "victim-area",
      label: "피해자 주변",
      hint: "중앙 테이블에 잔이 그대로 남아 있다",
      revealsEvidenceIds: ["e1"],
    },
    {
      id: "sofa-side",
      label: "응접실 소파 옆",
      hint: "서류 가방이 반쯤 열려 있다",
      revealsEvidenceIds: ["e7"],
    },
    {
      id: "hallway",
      label: "복도",
      hint: "응접실과 서재를 잇는 통로",
      revealsEvidenceIds: ["e6"],
    },
    {
      id: "bar-cart",
      label: "바 카트",
      hint: "위스키 잔 하나가 따로 놓여 있다",
      revealsEvidenceIds: ["e2", "e10"],
    },
    {
      id: "pantry",
      label: "팬트리",
      hint: "선반 위 작은 유리병",
      revealsEvidenceIds: ["e3"],
    },
    {
      id: "forensic-desk",
      label: "감정 회신 문서",
      hint: "두 잔의 비교 결과가 도착했다",
      revealsEvidenceIds: ["e4"],
    },
    {
      id: "fireplace",
      label: "벽난로",
      hint: "재 속에 타다 남은 종이",
      revealsEvidenceIds: ["e5"],
    },
    {
      id: "study",
      label: "2층 서재",
      hint: "노트북이 열려 있다",
      revealsEvidenceIds: ["e9"],
    },
    {
      id: "security-console",
      label: "관리실 제어 콘솔",
      hint: "구역별 출입·조명 기록",
      revealsEvidenceIds: ["e8"],
    },
    {
      id: "terrace",
      label: "정원 테라스",
      hint: "재떨이에 꽁초가 여러 개 남아 있다",
      revealsEvidenceIds: [],
      emptyMessage: "오래 서 있었던 흔적뿐이다. 시각을 특정할 만한 것은 없다.",
    },
  ],
};

export const questions = [
  {
    id: "q1",
    text: "축배 잔에 독을 넣을 수 있었던 사람은 누구인가?",
    generatedByEvidenceIds: ["e1"],
  },
  {
    id: "q2",
    text: "피해자가 마지막으로 마신 것은 정말 샴페인이었을까?",
    generatedByEvidenceIds: ["e2"],
    solvedByEvidenceIds: ["e4"],
  },
  {
    id: "q3",
    text: "피해자만 사용하는 용품에 접근한 사람은 누구인가?",
    generatedByEvidenceIds: ["e3"],
    solvedByEvidenceIds: ["e8"],
  },
  {
    id: "q4",
    text: "왜 두 잔의 독 농도가 이렇게 다른가?",
    generatedByEvidenceIds: ["e4"],
    solvedByEvidenceIds: ["e4"],
  },
  {
    id: "q5",
    text: "누가 낭독 이전에 유언장 내용을 알고 있었는가?",
    generatedByEvidenceIds: ["e5"],
  },
  {
    id: "q6",
    text: "사망 이후 휴대전화를 만진 사람은 누구이고, 왜인가?",
    generatedByEvidenceIds: ["e6"],
    solvedByEvidenceIds: ["e10"],
  },
  {
    id: "q7",
    text: "배우자가 감춘 이해관계는 사건과 어떻게 연결되는가?",
    generatedByEvidenceIds: ["e7"],
  },
  {
    id: "q8",
    text: "축배 이후 7분 동안 팬트리에 들어간 사람은 누구인가?",
    generatedByEvidenceIds: ["e8"],
    solvedByEvidenceIds: ["e8"],
  },
  {
    id: "q9",
    text: "감사가 시작되면 가장 많은 것을 잃는 사람은 누구인가?",
    generatedByEvidenceIds: ["e9"],
  },
  {
    id: "q10",
    text: "바 카트 앞에 몸을 낮춘 사람은 무엇을 찾고 있었는가?",
    generatedByEvidenceIds: ["e10"],
    solvedByEvidenceIds: ["e6"],
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
  minEvidenceReadBeforeAccusation: 5,
  minSuspectsInterrogatedBeforeAccusation: 3,
};
