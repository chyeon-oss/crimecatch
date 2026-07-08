import type { Victim } from "@/types/case";

export const victim: Victim = {
  name: "김도현",
  age: 42,
  occupation: "개발본부 개발1팀장",
  department: "노바코어 개발본부 개발1팀",
  causeOfDeath: "둔기에 의한 두부 손상 (좌측 측두부, 단일 타격 추정)",
  biography:
    "카이스트 전산학과 졸업 후 대기업 SI에서 8년을 근무하고 3년 전 노바코어 경력직으로 합류. 합류 1년 만에 팀장으로 승진했고, 회사의 주력 결제 플랫폼 리뉴얼 프로젝트를 총괄해 왔다. 사내에서는 실력은 인정받지만 회의 자리에서 팀원을 강하게 몰아붙이는 스타일로 알려져 있었다.",
  portraitPrompt:
    "40대 초반 한국 남성, 짧게 다듬은 머리와 무테 안경, 짙은 회색 셔츠 차림. 회의실 화이트보드를 배경으로 팔짱을 낀 자세, 형광등 아래에서 촬영된 사내 인물 사진 스타일, 자연광이 절제된 다큐멘터리톤 포토그래피.",
  personalNotes:
    "이혼 3년 차, 초등학생 딸의 양육권은 전 배우자에게 있음. 최근 6개월간 야근 빈도가 눈에 띄게 늘었고 주말에도 사무실에 자주 나왔다. 회사 앞 헬스장 월정액을 결제했으나 지난 두 달간 출입 기록은 없다.",
};

/** Non-spoiler contextual notes surfaced alongside the victim profile. */
export const victimContext = {
  companyReputation:
    "실력은 확실하지만 회의에서 팀원을 강하게 몰아붙이는 스타일로 사내 평이 갈렸다.",
  recentWork:
    "결제 플랫폼 리뉴얼 프로젝트 총괄. 사건 전 2주간 스펙 변경 이슈로 여러 팀과 마찰이 있었다.",
  personalBelongings:
    "책상 위 무테 안경, 개인 노트북, 사내 출입증, 반쯤 마신 아메리카노 머그컵.",
  initialPoliceNotes:
    "외상은 좌측 측두부 단일 타격. 방어흔은 확인되지 않음. 사망 추정 시각은 20시 10분 ~ 20시 30분 구간.",
};
