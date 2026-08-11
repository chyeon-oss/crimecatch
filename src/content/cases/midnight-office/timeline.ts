import type { TimelineEvent } from "@/types/timeline";

/** Player-visible known timeline only. Hidden-truth timeline is elsewhere. */
export const timeline: TimelineEvent[] = [
  { time: "19:20", description: "피해자 한도윤이 기획전략실에 들어감" },
  { time: "20:05", description: "12층 일부 구역 전원 이상 발생", relatedSuspectId: "s1" },
  { time: "20:18", description: "미확인 인물이 사무실 방향으로 이동" },
  { time: "20:30", description: "복도 CCTV 기록 재개" },
  { time: "23:50", description: "청소원이 사무실에서 피해자를 발견" },
];
