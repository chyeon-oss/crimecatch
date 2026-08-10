import type { TimelineEvent } from "@/types/timeline";

/**
 * PUBLIC timeline — only what the investigation can establish from records
 * and statements. The exact private chronology lives in _truth.ts.
 */
export const timeline: TimelineEvent[] = [
  {
    time: "19:30",
    description: "가족 구성원 전원 본가 도착. 정문 출입 기록 확인됨.",
    location: "본가 정문",
    initiallyVisible: true,
  },
  {
    time: "20:40",
    description: "만찬 준비 시작. 조리실과 응접실 사이 인원 이동 잦아짐.",
    location: "조리실 · 응접실",
    initiallyVisible: true,
  },
  {
    time: "21:00",
    description: "유언장 낭독. 한재훈이 지분 의결권과 재단 운영권 승계자로 확정.",
    location: "대응접실",
    initiallyVisible: true,
  },
  {
    time: "21:06",
    description: "공식 축배. 참석자 전원이 샴페인 잔을 들었다.",
    location: "대응접실",
    involvedSuspectIds: ["s1", "s2", "s3", "s4"],
    initiallyVisible: true,
  },
  {
    time: "21:09",
    description: "한지원이 응접실을 떠났다고 진술한 시각.",
    location: "대응접실 → 2층",
    relatedSuspectId: "s1",
  },
  {
    time: "21:12",
    description: "피해자가 바 카트에서 개인 위스키를 따랐다는 목격 진술.",
    location: "응접실 바 카트",
  },
  {
    time: "21:20",
    description: "피해자가 응접실 중앙에서 쓰러짐.",
    location: "대응접실",
  },
  {
    time: "21:24",
    description: "신고 접수. 가사 인력이 응급 조치 시작.",
    location: "대응접실",
  },
  {
    time: "21:52",
    description: "현장 도착. 축배 잔과 위스키 잔 모두 보존 조치.",
    location: "대응접실",
  },
];
