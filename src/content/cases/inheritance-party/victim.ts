import type { Victim } from "@/types/case";

/**
 * Player-facing victim profile for CASE002: inheritance-party.
 * All fields are visible to the player and contain no spoilers.
 */
export const victim = {
  name: "한재훈",
  gender: "남성",
  age: 41,
  occupation: "한성물산 부사장 · 가족재단 신임 이사장 지명자",
  tenure: "14년",
  employeeSince: "2012년",
  profile:
    "한재훈은 한씨 가문의 장남으로, 부친 사망 이후 그룹 내 실질 관리 업무를 이어받아 왔다. 숫자에 밝고 감정을 드러내지 않는 편이며, 가족 사업의 회계 문제를 여러 차례 내부에서 정리한 전력이 있다. 가족들 사이에서는 '틀린 것은 절대 넘기지 않는 사람'으로 통했다.",
  companyReputation: {
    superior: "판단이 빠르고 뒤탈이 없다.",
    colleague: "합리적이지만 예외를 인정하지 않는다.",
    junior: "정확한 지시를 주지만 실수는 기억한다.",
  },
  recentWork: [
    "가족재단 운영권 인수 준비",
    "재단 3개년 집행 내역 재검토",
    "계열 법인 지분 정리안 작성",
    "외부 회계 검토 일정 조율",
  ],
  recentTwoWeeks: [
    "본가 방문 횟수 증가",
    "심야까지 재단 서류 열람",
    "가족 구성원과의 개별 면담 3건",
    "변호사와의 통화 빈도 급증",
  ],
  clothingAtIncident: [
    "차콜 스리피스 정장",
    "흰 드레스 셔츠",
    "네이비 실크 넥타이",
    "왼쪽 손목 시계",
  ],
  personalBelongings: [
    "가죽 다이어리",
    "만년필",
    "본가 출입 카드",
    "약통 (위장약)",
  ],
  deskItems: [
    "재단 회계 요약본",
    "유언장 낭독본 사본",
    "개인 위스키 잔",
    "벌꿀 시럽 병",
  ],
  health:
    "만성 위염으로 자극적인 음료를 피했다. 위스키에 벌꿀 시럽을 두세 방울 넣어 마시는 습관이 오래되었다.",
  family: "배우자 1명(한서연). 자녀 없음. 동생 2명, 계모 1명.",
  recentImpressions: [
    "낭독 전부터 표정이 굳어 있었다.",
    "가족 누구와도 길게 대화하지 않았다.",
    "발표할 것이 있다는 말을 두 번 했다.",
  ],
  lastOfficialSchedule: "21:00 유언장 낭독 및 가족 만찬",
  lastConfirmedLocation: "성북동 본가 1층 대응접실",
  firstReportTime: "21:24",
  firstReport: "응접실에서 사람이 쓰러졌습니다. 숨을 못 쉽니다.",
  initialPoliceNotes: [
    "외부 침입 흔적 없음.",
    "축배 잔은 그대로 보존됨.",
    "가족 전원 저택 내 대기 중.",
  ],
  // Engine-required field.
  causeOfDeath: "시안화물 중독 (급성 호흡정지, 경구 섭취 추정)",
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
