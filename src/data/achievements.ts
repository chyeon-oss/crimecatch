import type { MetaAchievement } from "@/types/progress";

/**
 * Global (career) achievements. These are distinct from per-case
 * achievements defined in each Case's data file — those track completion
 * of a single scenario, these track the detective's whole career.
 */
export const META_ACHIEVEMENTS: MetaAchievement[] = [
  {
    id: "first_arrest",
    title: "First Arrest",
    description: "첫 사건을 해결했습니다.",
    rule: "FIRST_ARREST",
  },
  {
    id: "perfect_deduction",
    title: "Perfect Deduction",
    description: "오답 없이 사건을 완벽하게 해결했습니다.",
    rule: "PERFECT_DEDUCTION",
  },
  {
    id: "observe_everything",
    title: "Observe Everything",
    description: "한 사건의 모든 증거를 열람했습니다.",
    rule: "OBSERVE_EVERYTHING",
  },
  {
    id: "no_wrong_questions",
    title: "No Wrong Questions",
    description: "심문에서 단 한 번도 헛다리를 짚지 않았습니다.",
    rule: "NO_WRONG_QUESTIONS",
  },
  {
    id: "cold_case_master",
    title: "Cold Case Master",
    description: "5건의 사건을 해결했습니다.",
    rule: "COLD_CASE_MASTER",
    threshold: 5,
  },
  {
    id: "serial_killer_hunter",
    title: "Serial Killer Hunter",
    description: "10건의 사건을 해결했습니다.",
    rule: "SERIAL_KILLER_HUNTER",
    threshold: 10,
  },
];
