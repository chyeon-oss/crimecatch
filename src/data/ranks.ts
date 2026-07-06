import type { RankDefinition } from "@/types/progress";

/** Sorted ascending by minLevel. */
export const RANKS: RankDefinition[] = [
  { rank: "Rookie Detective", koreanTitle: "신참 형사", minLevel: 1 },
  { rank: "Junior Investigator", koreanTitle: "수사관보", minLevel: 3 },
  { rank: "Senior Detective", koreanTitle: "선임 형사", minLevel: 5 },
  { rank: "Lead Investigator", koreanTitle: "주임 수사관", minLevel: 8 },
  { rank: "Chief Detective", koreanTitle: "수사반장", minLevel: 11 },
  { rank: "Legend Detective", koreanTitle: "전설의 탐정", minLevel: 15 },
];
