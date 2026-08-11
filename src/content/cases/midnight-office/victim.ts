import type { Victim } from "@/types/case";

/**
 * Player-facing victim profile for CASE001: midnight-office.
 *
 * All fields below are visible to the player and contain no spoilers.
 * The `causeOfDeath` field is preserved only because the engine type requires it.
 */
export const victim = {
  name: "한도윤",
  gender: "남성",
  age: 38,
  occupation: "기획전략실 팀장",
  tenure: "8년 4개월",
  employeeSince: "2018년",
  profile:
    "한도윤은 블루웨이브 솔루션즈 창립 초기부터 함께한 핵심 직원이다. 문제를 빠르게 파악하고 프로젝트를 정리하는 능력이 뛰어나 여러 대형 사업을 성공적으로 이끌었다. 반면 원칙을 지나치게 중시한다는 평가도 있었으며, 업무에서는 타협을 거의 하지 않는 것으로 알려져 있다.",
  companyReputation: {
    superior: "믿고 맡길 수 있는 사람.",
    colleague: "능력은 인정하지만 같이 일하기는 쉽지 않다.",
    junior: "무섭지만 많이 배우게 되는 사람.",
  },
  recentWork: ["신규 사업 TF 총괄", "연간 조직 개편 검토", "프로젝트 예산 승인", "인사평가 검토"],
  recentTwoWeeks: ["야근 증가", "외부 미팅 다수", "회의실 예약 빈도 증가", "퇴근 시간 불규칙"],
  clothingAtIncident: ["흰 셔츠", "네이비 슬랙스", "검정 가죽 벨트", "손목시계 착용"],
  personalBelongings: ["회사 출입카드", "스마트폰", "무선 이어폰", "검정 볼펜", "다이어리"],
  deskItems: ["노트북", "머그컵", "서류철", "메모지", "명함 케이스"],
  health: "특이 병력 없음. 복용 중인 약 없음.",
  family: "배우자 1명. 자녀 없음.",
  recentImpressions: [
    "평소보다 말수가 적었다.",
    "며칠 전부터 잠을 거의 못 잔 것 같았다.",
    "무언가를 계속 고민하는 표정이었다.",
  ],
  lastOfficialSchedule: "20:00 조직개편안 검토 회의",
  lastConfirmedLocation: "블루웨이브 솔루션즈 12층 기획전략실",
  firstReportTime: "23:52",
  firstReport: "기획전략실 안에 한 팀장님이 쓰러져 있습니다.",
  initialPoliceNotes: [
    "외부 침입 흔적은 아직 확인되지 않음.",
    "현장은 보존 중.",
    "사건 관계자들은 건물 내 대기 중.",
  ],
  // Engine-required field; kept from the existing case definition.
  causeOfDeath: "둔기에 의한 두부 손상 (좌측 측두부, 단일 타격 추정)",
};

// Runtime type check: the engine expects `victim` to satisfy the Victim shape.
const _runtimeVictimTypeCheck: Victim = victim;
void _runtimeVictimTypeCheck;

/** Non-spoiler contextual notes surfaced alongside the victim profile. */
export const victimContext = {
  companyReputation: victim.companyReputation,
  recentWork: victim.recentWork,
  recentTwoWeeks: victim.recentTwoWeeks,
  clothingAtIncident: victim.clothingAtIncident,
  personalBelongings: victim.personalBelongings,
  deskItems: victim.deskItems,
  health: victim.health,
  family: victim.family,
  recentImpressions: victim.recentImpressions,
  lastOfficialSchedule: victim.lastOfficialSchedule,
  lastConfirmedLocation: victim.lastConfirmedLocation,
  firstReportTime: victim.firstReportTime,
  firstReport: victim.firstReport,
  initialPoliceNotes: victim.initialPoliceNotes,
};
