import type { TimelineEvent } from "@/types/timeline";

/** Player-visible known timeline only. Hidden-truth timeline is elsewhere. */
export const timeline: TimelineEvent[] = [
  { time: "19:20", description: "피해자 김도현이 사무실에 들어감" },
  { time: "20:05", description: "12층 정전 발생", relatedSuspectId: "s1" },
  { time: "20:18", description: "미확인 인물이 사무실 방향으로 이동" },
  { time: "20:30", description: "정전 복구, CCTV 재가동" },
  { time: "23:50", description: "청소원이 사무실에서 피해자를 발견" },
];
