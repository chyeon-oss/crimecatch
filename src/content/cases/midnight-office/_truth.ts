/**
 * PRIVATE Truth Pack for CASE001 — midnight-office.
 *
 * SPOILER LAYER. This module MUST NEVER be imported by investigation,
 * case-file, or any other player-facing module. It is loaded only by the
 * accusation/result flow and rendered only AFTER final deduction submission.
 *
 * Consistent with _spoilers.ts (solution + answerKey). No ids are changed.
 */
import type { TruthPack } from "@/types/truth";

export const midnightOfficeTruth: TruthPack = {
  caseId: "midnight-office",
  beats: [
    {
      id: "pre",
      order: 1,
      time: "19:20 ~ 20:00",
      location: "12층 기획전략실",
      title: "사건 전",
      body:
        "한도윤은 조직개편 최종안을 검토하며 야근에 들어갔다. 그 문서에는 승진 평가 조정 내역이 남아 있었고, 박민수의 이름은 그 조정의 결과로 밀려나 있었다. 박민수는 이 사실을 이미 알고 있었다. 그는 퇴근한 척 카드로 출입 기록을 남긴 뒤, 12층에 남아 있었다.",
      evidenceIds: ["e3"],
    },
    {
      id: "meeting",
      order: 2,
      time: "20:00 ~ 20:05",
      location: "12층 회의실",
      title: "마지막 회의",
      body:
        "두 사람은 회의실에서 마지막으로 마주 앉았다. 대화는 인사 조정 문제로 격해졌다. 박민수는 평가 조작을 외부에 알리겠다고 말했고, 한도윤은 그것이 곧 박민수 본인의 경력도 끝낸다고 답했다. 그 자리에서 박민수는 책상 위의 머그컵을 집어 들었다.",
      evidenceIds: ["e1", "e3"],
    },
    {
      id: "gap",
      order: 3,
      time: "20:05 ~ 20:30",
      location: "12층 배전반 · 복도",
      title: "이상한 공백",
      body:
        "박민수는 12층 배전반에서 짧은 전원 이상을 만들었다. 전체 정전은 아니었지만, 복도 CCTV의 기록을 25분간 끊어내기에는 충분했다. 그 공백 동안 그는 한도윤을 머그컵으로 가격했고, 시신을 회의실에서 기획전략실 책상 쪽으로 옮겼다. 회의실 벽시계는 이때 배터리 덮개가 열리며 20:24에서 멈췄다. 사망 시각을 흐리려는 시도가 아니라, 옮기는 과정에서 남은 흔적이었다.",
      evidenceIds: ["e2", "e6", "e7"],
    },
    {
      id: "scene",
      order: 4,
      time: "20:30 ~ 23:50",
      location: "기획전략실 출입문",
      title: "현장 발견",
      body:
        "전원이 복구되고 CCTV가 다시 돌기 시작했을 때, 박민수는 이미 12층을 떠난 상태였다. 그가 나간 뒤 기획전략실 문은 자동 잠금 장치로 스스로 잠겼다. 강제 침입 흔적이 없는 잠긴 방이 만들어진 것은 그 때문이다. 23:50, 청소원이 문을 열고 책상 아래 쓰러진 한도윤을 발견했다. 혈흔은 책상 아래 안쪽에 작게만 남아 있었다. 그곳은 치명상을 입은 자리가 아니었기 때문이다.",
      evidenceIds: ["e4", "e5"],
    },
    {
      id: "final",
      order: 5,
      time: "판단",
      location: "사건 종결 보고",
      title: "최종 판단",
      body:
        "깨진 컵, 부족한 혈흔, 끊긴 영상, 멈춘 시계. 네 개의 어긋난 사실은 모두 같은 방향을 가리킨다. 살해는 회의실에서 일어났고, 현장은 이후에 만들어졌다. 그리고 그 25분의 공백을 만들 수 있었던 사람은 배전반에 접근한 단 한 명뿐이었다.",
      evidenceIds: ["e1", "e2", "e5", "e6"],
    },
  ],
  summary: {
    culpritId: "s1",
    culpritName: "박민수",
    motiveId: "motive-revenge",
    motive:
      "승진 평가 조작에 대한 원한. 폭로 위협이 거절당한 직후 감정이 폭발했다.",
    methodId: "method-blunt",
    method: "정전으로 CCTV 공백을 만든 뒤 회의실에서 머그컵으로 가격",
    murderWindow: "20:18 ~ 20:28",
    lockedRoomTrick:
      "기획전략실 출입문의 자동 잠금 장치. 범인이 정전 복구 전에 빠져나가자 문은 스스로 잠겼고, 강제 침입 흔적 없는 밀실처럼 보이게 되었다.",
    contradictionChain: [
      {
        claim: "정전 시간 동안 회의실이 아닌 다른 층에 있었다.",
        contradiction:
          "12층 배전반 접근 기록과 전원 이상 로그의 시각이 정확히 겹친다.",
        evidenceIds: ["e6", "e2"],
      },
      {
        claim: "피해자는 자신의 책상에서 습격당했다.",
        contradiction:
          "책상 아래 혈흔의 양이 치명상에 비해 너무 적고, 컵이 깨졌는데도 액체 흔적이 없다.",
        evidenceIds: ["e5", "e1"],
      },
      {
        claim: "사망 추정 시각은 자정 무렵이다.",
        contradiction:
          "회의실 벽시계가 20:24에 멈춰 있고, CCTV 공백 구간이 그 시각을 감싸고 있다.",
        evidenceIds: ["e7", "e2"],
      },
    ],
    closing:
      "사건은 밀실이 아니었다. 밀실처럼 보이도록 남겨진 25분이었을 뿐이다.",
  },
};

export default midnightOfficeTruth;
