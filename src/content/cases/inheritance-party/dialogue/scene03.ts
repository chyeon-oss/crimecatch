import type { DialogueThread } from "@/types/dialogue";

/**
 * CASE002 Scene 03 dialogue — family interrogation support.
 * Player-facing only: no culprit, motive, cover-up, or hidden-truth text.
 * The thesis of this scene is separation: hiding is not the same as killing.
 */
export const scene03Threads: DialogueThread[] = [
  {
    id: "t-c2-scene03-open",
    title: "가족 심문",
    sceneId: "scene-03",
    startNodeId: "open",
    nodes: [
      {
        id: "open",
        lines: [
          {
            id: "l1",
            speakerId: "partner",
            text: "네 사람 다 진술에 응하겠다고 합니다. 대신 전부 변호사를 끼겠다는 분위기입니다.",
          },
          {
            id: "l2",
            speakerId: "me",
            text: "예상한 대로야. 가족 모두 무언가를 숨기고 있어.",
          },
          {
            id: "l3",
            speakerId: "me",
            text: "그러니까 숨김과 살인을 분리해야 해. 거짓말 하나에 사람 하나를 붙이면 사건이 틀어진다.",
          },
          {
            id: "l4",
            speakerId: "partner",
            text: "벽난로, 2층 서재, 관리실 제어 콘솔. 진술을 흔들 자료는 여기 있습니다.",
          },
          {
            id: "l5",
            speakerId: "me",
            text: "자료를 먼저 확보하고 채팅방을 열자. 증거 없이 던지는 질문은 진술을 굳히기만 해.",
          },
        ],
      },
    ],
  },

  // ---- before-beats -----------------------------------------------------
  {
    id: "t-c2-beat-fireplace",
    title: "벽난로",
    sceneId: "scene-03",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "장작 재 위에 색이 다른 재가 얹혀 있어." },
          { id: "b2", speakerId: "partner", text: "종이입니다. 태운 시점이 장작보다 늦습니다." },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-fireplace",
    title: "타다 남은 문구",
    sceneId: "scene-03",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "'지분 승계 대상에서 제외', 그리고 이름 일부가 남았습니다. 용지는 서재 프린터 것입니다.",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "낭독 전에 내용을 본 사람이 있다는 뜻이지. 다만 태운 것과 죽인 것은 별개야.",
          },
        ],
      },
    ],
  },
  {
    id: "t-c2-beat-study",
    title: "2층 서재",
    sceneId: "scene-03",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "partner", text: "피해자 노트북이 그대로 있습니다. 잠금은 해제 상태였습니다." },
          { id: "b2", speakerId: "me", text: "발표할 것이 있었다고 했지. 무엇을 쓰던 중이었나 보자." },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-study",
    title: "미발송 초안",
    sceneId: "scene-03",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "재단 외부 감사 요청 메일 초안입니다. 3개년 집행 내역 전수 검토. 20시 41분 최종 수정, 미발송.",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "발표가 재산 이야기만이 아니었다는 거군. 이 초안이 멈추면 누가 편해지는지 세어 봐야 해.",
          },
        ],
      },
    ],
  },
  {
    id: "t-c2-beat-security",
    title: "관리실 제어 콘솔",
    sceneId: "scene-03",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "이 저택은 구역별로 조명과 출입을 따로 기록해." },
          { id: "b2", speakerId: "partner", text: "진술보다 정직한 자료입니다. 시간대만 잘라내면 됩니다." },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-security",
    title: "7분의 기록",
    sceneId: "scene-03",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "팬트리 구역 21시 07분 점등, 진입 1건, 21시 14분 소등. 서재 구역은 21시 02분에 별도 진입.",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "이제 진술과 기록을 나란히 놓을 수 있다. 어긋나는 구간이 곧 질문이야.",
          },
        ],
      },
    ],
  },

  // ---- gated analysis ---------------------------------------------------
  {
    id: "t-c2-scene03-analysis",
    title: "세 갈래 분리",
    sceneId: "scene-03",
    startNodeId: "open",
    nodes: [
      {
        id: "open",
        lines: [
          {
            id: "l1",
            speakerId: "partner",
            text: "초안 조각, 감사 요청, 출입 기록. 세 자료가 다 모였습니다.",
          },
          {
            id: "l2",
            speakerId: "me",
            text: "그럼 세 갈래를 각각 따로 세우자. 동기, 접근, 그리고 치사 경로.",
          },
          {
            id: "l3",
            speakerId: "me",
            text: "동기는 여러 명에게 있어. 문서, 채무, 재산 분쟁. 전부 진짜야.",
          },
          {
            id: "l4",
            speakerId: "me",
            text: "접근은 좁아진다. 피해자 전용 용품에 손댈 수 있었던 구간은 기록에 남으니까.",
          },
          {
            id: "l5",
            speakerId: "partner",
            text: "치사 경로는 감정 회신이 정리해 줬습니다. 축배 잔이 아니라 개인 잔입니다.",
          },
          {
            id: "l6",
            speakerId: "me",
            text: "세 갈래가 한 사람에게서 겹치는지 확인하기 전까지는 이름을 말하지 않는다. 진술을 더 받자.",
          },
        ],
      },
    ],
  },
];
