import type { DialogueThread } from "@/types/dialogue";

/**
 * CASE002 Scene 01 dialogue — player-facing only.
 * No culprit, motive, cover-up, or hidden-truth references anywhere here.
 * The champagne glass is allowed to look like the answer; it is never
 * confirmed as one.
 */
export const scene01Threads: DialogueThread[] = [
  {
    id: "t-c2-scene01-open",
    title: "낭독 직후의 응접실",
    sceneId: "scene-01",
    startNodeId: "open",
    nodes: [
      {
        id: "open",
        lines: [
          {
            id: "l1",
            speakerId: "partner",
            text: "성북동 저택입니다. 눈 때문에 감식이 조금 늦게 들어왔습니다.",
          },
          {
            id: "l2",
            speakerId: "partner",
            text: "유언장 낭독이 끝난 직후였습니다. 축배를 들고 몇 분 뒤에 한재훈 씨가 쓰러졌습니다.",
          },
          {
            id: "l3",
            speakerId: "partner",
            text: "축배용 샴페인 잔에서 시안화물 반응이 나왔습니다. 예비 결과입니다.",
          },
          {
            id: "l4",
            speakerId: "me",
            text: "반응이 나왔다는 것과, 그 잔이 사인이라는 건 다른 얘기야.",
          },
          {
            id: "l5",
            speakerId: "partner",
            text: "가족 네 명 전원 저택 안에 있습니다. 아직 아무도 나가지 않았습니다.",
          },
          { id: "l6", speakerId: "partner", text: "어디부터 보시겠습니까?" },
        ],
        choices: [
          {
            id: "c-victim",
            text: "쓰러진 자리부터 봅니다.",
            effect: {
              goToNodeId: "guide-victim",
              setFlags: ["c2:scene01:lead-victim"],
              focusHotspotId: "hs-victim-area",
            },
          },
          {
            id: "c-sofa",
            text: "소파 옆 서류가 눈에 걸립니다.",
            effect: {
              goToNodeId: "guide-sofa",
              setFlags: ["c2:scene01:lead-sofa"],
              focusHotspotId: "hs-sofa-side",
            },
          },
          {
            id: "c-hallway",
            text: "복도 동선을 먼저 확인하죠.",
            effect: {
              goToNodeId: "guide-hallway",
              setFlags: ["c2:scene01:lead-hallway"],
              focusHotspotId: "hs-hallway",
            },
          },
        ],
      },
      {
        id: "guide-victim",
        lines: [
          {
            id: "v1",
            speakerId: "partner",
            text: "잔은 그대로 뒀습니다. 테이블 위치도 손대지 않았습니다.",
          },
          { id: "v2", speakerId: "me", text: "현장 탭에서 피해자 주변을 눌러줘." },
        ],
      },
      {
        id: "guide-sofa",
        lines: [
          {
            id: "s1",
            speakerId: "partner",
            text: "소파 옆에 서류 가방이 열린 채로 있었습니다.",
          },
          { id: "s2", speakerId: "me", text: "누가 열었는지도 나중에 물어야겠지. 먼저 보자." },
        ],
      },
      {
        id: "guide-hallway",
        lines: [
          {
            id: "h1",
            speakerId: "partner",
            text: "복도는 응접실과 조리실을 잇는 유일한 통로입니다.",
          },
          { id: "h2", speakerId: "me", text: "사람이 움직였다면 거기로 움직였다는 뜻이야." },
        ],
      },
    ],
  },

  // ---- before-beats -----------------------------------------------------
  {
    id: "t-c2-beat-victim",
    title: "피해자 주변",
    sceneId: "scene-01",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "잔이 세 개… 아니, 축배 잔만 여기 남았네." },
          {
            id: "b2",
            speakerId: "partner",
            text: "낭독 직후 전원이 잔을 들었습니다. 손자국이 여러 겹입니다.",
          },
          { id: "b3", speakerId: "me", text: "여러 겹이면 아무것도 특정할 수 없다는 뜻이지." },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-victim",
    title: "축배 잔",
    sceneId: "scene-01",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "이 잔에서 시안화물이 나왔습니다. 사실상 결론에 가깝지 않습니까?",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "가장 그럴듯한 그림이야. 그래서 제일 먼저 의심해야 하는 그림이기도 해.",
          },
          {
            id: "a3",
            speakerId: "me",
            text: "검출량이 아직 없어. 양이 없으면 경로도 없는 거야.",
          },
        ],
      },
    ],
  },
  {
    id: "t-c2-beat-sofa",
    title: "응접실 소파 옆",
    sceneId: "scene-01",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "가방 안쪽. 종이가 접힌 방향이 급해." },
          { id: "b2", speakerId: "partner", text: "법률사무소 봉투인데, 제출 도장은 없습니다." },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-sofa",
    title: "미제출 협의 초안",
    sceneId: "scene-01",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "별거 협의 초안과 혼전계약 의견서입니다. 배우자 쪽 문제겠죠.",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "숨긴 게 있다는 건 확실해. 다만 이 서류만 보면 사망이 유리한 구조는 아니야.",
          },
          {
            id: "a3",
            speakerId: "partner",
            text: "…감춘 것과 죽인 것을 분리하라는 말씀이시군요.",
          },
        ],
      },
    ],
  },
  {
    id: "t-c2-beat-hallway",
    title: "복도",
    sceneId: "scene-01",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "복도 조명만 따로 켜져 있었어?" },
          { id: "b2", speakerId: "partner", text: "그렇습니다. 응접실과 별도 회로입니다." },
          { id: "b3", speakerId: "me", text: "이 짧은 통로에서 누가 뭘 했는지가 중요해지겠군." },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-hallway",
    title: "휴대전화 이동 기록",
    sceneId: "scene-01",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "피해자 휴대전화가 21시 26분부터 39분까지 복도 쪽으로 갔다가 돌아왔습니다.",
          },
          {
            id: "a2",
            speakerId: "partner",
            text: "같은 시간대에 메시지 한 건이 삭제됐습니다.",
          },
          {
            id: "a3",
            speakerId: "me",
            text: "본인이 들고 갔을 수도, 누가 들고 갔을 수도 있어. 13분이면 충분히 뭘 지운다.",
          },
        ],
      },
    ],
  },
];
