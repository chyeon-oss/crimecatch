/**
 * PRIVATE Truth Pack for CASE002 — inheritance-party.
 *
 * SPOILER LAYER. This module MUST NEVER be imported by investigation,
 * case-file, or any other player-facing module. It is loaded only by the
 * accusation/result flow and rendered only AFTER final deduction submission.
 *
 * Consistent with _spoilers.ts (solution + answerKey). No ids are changed.
 */
import type { TruthPack } from "@/types/truth";

export const inheritancePartyTruth: TruthPack = {
  caseId: "inheritance-party",
  beats: [
    {
      id: "pre",
      order: 1,
      time: "18:00 ~ 20:41",
      location: "성북동 본가 2층 서재",
      title: "사건 전",
      body:
        "한재훈은 승계가 확정되는 순간을 이미 다음 단계의 시작으로 보고 있었다. 서재 노트북에는 외부 회계법인에 보낼 메일 초안이 열려 있었고, 요청 항목은 가족재단 3개년 집행 내역 전수 검토와 이전 판본 유언장 검토였다. 초안의 마지막 수정 시각은 20:41. 그는 낭독이 끝나면 그 자리에서 발송할 생각이었다. 같은 시간, 한지원은 전날 출력한 유언장 초안을 접어 들고 있었다. 자신이 승계에서 제외되었다는 사실을 그는 이미 알고 있었다.",
      evidenceIds: ["e9", "e5"],
    },
    {
      id: "meeting",
      order: 2,
      time: "20:50 ~ 21:06",
      location: "1층 대응접실 · 조리실",
      title: "마지막 회의",
      body:
        "낭독 직전 짧은 대화가 있었다. 한재훈은 윤미란에게 승계 직후 발표할 것이 있다고 말했고, 감사라는 단어를 한 번 썼다. 그 한 단어로 충분했다. 6년간 재단 집행 내역을 손질해 개인 손실을 메워 온 사람에게, 전수 검토는 곧 종결을 의미했다. 21:00 낭독이 끝나고 21:06 축배가 진행되는 동안 그는 이미 다음 7분을 계획하고 있었다.",
      evidenceIds: ["e9", "e1"],
    },
    {
      id: "gap",
      order: 3,
      time: "21:07 ~ 21:14",
      location: "조리실 옆 팬트리",
      title: "이상한 공백",
      body:
        "축배가 끝나자 윤미란은 만찬 준비를 이유로 응접실을 빠져나갔다. 팬트리 구역 조명이 21:07에 켜졌고, 그 구역에 진입한 카드 기록은 단 하나였다. 그는 피해자만 쓰는 벌꿀 시럽 병의 점적기에 시안화물을 넣고 병 목을 닦았다. 그리고 응접실로 돌아오는 길에 이미 비워진 축배 잔에 소량을 흘려 넣었다. 죽음의 경로와 죽음의 설명을 분리해 둔 것이다. 조리실 문은 그 시간 닫혀 있었고, 가사 인력은 응접실 쪽에 있었다.",
      evidenceIds: ["e8", "e3", "e1"],
    },
    {
      id: "scene",
      order: 4,
      time: "21:12 ~ 21:39",
      location: "응접실 바 카트 · 응접실 중앙",
      title: "현장 발견",
      body:
        "21:12, 한재훈은 습관대로 바 카트에서 개인 잔에 위스키를 따르고 벌꿀 시럽을 두 방울 떨어뜨렸다. 8분 뒤 그는 응접실 중앙에서 쓰러졌다. 응급 조치를 지시한 사람은 윤미란이었다. 혼란 속에서 두 가지 일이 더 일어났다. 한지원은 벽난로에 초안을 넣어 태웠고, 한성준은 형의 휴대전화를 복도로 가져가 채무 메시지를 지운 뒤 되돌려 놓았다. 두 사람의 행동은 모두 사망 이후였고, 그래서 두 사람은 범인이 아니다.",
      evidenceIds: ["e2", "e10", "e6", "e5"],
    },
    {
      id: "final",
      order: 5,
      time: "판단",
      location: "사건 종결 보고",
      title: "최종 판단",
      body:
        "축배 잔의 독은 치사량에 미달했다. 치사 농도는 피해자만 쓰던 위스키 잔과 벌꿀 시럽에서 나왔다. 그 습관을 이용할 수 있고, 축배 이후 7분 동안 팬트리에 들어간 카드 기록을 가진 사람은 한 명뿐이다. 그리고 그 한 명은 승계 직후 시작될 감사로 모든 것을 잃게 되어 있었다. 세 갈래는 각각 다른 방향에서 왔지만 같은 자리에서 만난다.",
      evidenceIds: ["e4", "e8", "e9"],
    },
  ],
  summary: {
    culpritId: "s2",
    culpritName: "윤미란",
    motiveId: "motive-cover-up",
    motive:
      "가족재단 집행 내역 조작과 이전 판본 유언장 손질의 은폐. 피해자가 승계 직후 외부 감사를 요청할 예정이었고, 감사가 시작되면 6년간의 유용이 전부 드러날 상황이었다.",
    methodId: "method-poison",
    method:
      "축배 직후 팬트리에서 피해자 전용 벌꿀 시럽 점적기에 시안화물을 주입. 피해자의 위스키 습관이 치사량을 스스로 옮기게 만들었다.",
    murderWindow: "21:07 ~ 21:20 (조작 21:07~21:14, 섭취 21:12, 발현 21:20)",
    lockedRoomTrick:
      "밀실 대신 '잔의 치환'이 쓰였다. 이미 비워진 축배 잔에 치사량 미달의 시안화물을 소량 흘려 넣어, 수사가 축배 시점과 참석자 전원의 접촉 흔적에 고정되도록 만들었다. 실제 경로인 개인 위스키와 벌꿀 시럽은 습관이라는 이유로 의심 대상에서 밀려나게 설계되었다.",
    contradictionChain: [
      {
        claim: "피해자는 축배 잔의 독으로 사망했다.",
        contradiction:
          "감정 회신에서 샴페인 잔은 치사량 미달, 개인 위스키 잔 잔여물은 치사 농도 초과로 나왔다. 두 잔의 오염 시점도 다르다.",
        evidenceIds: ["e4", "e2"],
      },
      {
        claim: "그 시간 나는 조리실과 응접실을 오갔다.",
        contradiction:
          "21:07~21:14 조리실 문은 닫혀 있었고, 같은 시각 팬트리 구역 조명이 켜지며 진입 카드 기록이 단 하나 남았다. 점적기 병 목만 최근에 닦여 있었다.",
        evidenceIds: ["e8", "e3"],
      },
      {
        claim: "피해자가 무엇을 발표할 예정이었는지는 몰랐다.",
        contradiction:
          "20:41에 최종 수정된 재단 외부 감사 요청 초안과 낭독 직전 대화가 그 주장을 무너뜨린다. 감사는 곧 그의 6년을 여는 열쇠였다.",
        evidenceIds: ["e9"],
      },
    ],
    closing:
      "그는 사람을 독으로 죽인 것이 아니라, 오래된 습관을 독으로 바꿔 놓았을 뿐이다.",
  },
};

export default inheritancePartyTruth;
