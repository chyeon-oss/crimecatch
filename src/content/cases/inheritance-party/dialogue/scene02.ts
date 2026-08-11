import type { DialogueThread } from "@/types/dialogue";

/**
 * CASE002 Scene 02 dialogue — verifying whether the champagne glass is the
 * real delivery path. Player-facing only: no culprit, motive, cover-up, or
 * hidden-truth references. The interpretation choices are recorded as flags
 * and notebook lines; none of them confirms or blocks anything.
 */
export const scene02Threads: DialogueThread[] = [
  {
    id: "t-c2-scene02-open",
    title: "잔과 경로",
    sceneId: "scene-02",
    startNodeId: "open",
    nodes: [
      {
        id: "open",
        lines: [
          {
            id: "l1",
            speakerId: "partner",
            text: "응접실 1차는 끝났습니다. 그런데 축배 잔만으로는 설명이 안 되는 부분이 있습니다.",
          },
          {
            id: "l2",
            speakerId: "me",
            text: "그래. 샴페인 잔이 실제 치사 경로인지부터 검증해야 해.",
          },
          {
            id: "l3",
            speakerId: "partner",
            text: "바 카트, 조리실 옆 팬트리, 그리고 감정 회신 문서. 순서는 상관없습니다.",
          },
          {
            id: "l4",
            speakerId: "me",
            text: "무엇이 몸에 들어갔는지 먼저 세운다. 사람 이름은 그다음이야.",
          },
        ],
      },
    ],
  },

  // ---- before-beats -----------------------------------------------------
  {
    id: "t-c2-beat-bar",
    title: "바 카트",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "축배 이후에도 뭘 마셨다면, 여기에 남아 있어야 해." },
          {
            id: "b2",
            speakerId: "partner",
            text: "피해자 전용 잔이 하나 있습니다. 위스키 잔입니다.",
          },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-bar",
    title: "개인 위스키 잔",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "잔 안쪽에 점성 있는 잔여물이 굳어 있습니다. 축배 이후에 쓴 잔입니다.",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "그러면 마지막으로 입에 닿은 게 샴페인이 아닐 수도 있다는 거지.",
          },
          {
            id: "a3",
            speakerId: "partner",
            text: "카트 아래 카펫 틈에서 은색 커프스단추도 하나 나왔습니다. 낙하 위치가 잔 방향과 안 맞습니다.",
          },
          {
            id: "a4",
            speakerId: "me",
            text: "누구 것인지는 물어보면 알겠지. 안 맞는 위치는 일단 그대로 적어둬.",
          },
        ],
      },
    ],
  },
  {
    id: "t-c2-beat-pantry",
    title: "팬트리",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "피해자가 위스키에 뭘 섞어 마셨다고 했지?" },
          {
            id: "b2",
            speakerId: "partner",
            text: "벌꿀 시럽입니다. 점적기로 몇 방울 떨어뜨리는 게 오래된 습관이었다고 합니다.",
          },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-pantry",
    title: "벌꿀 시럽 점적기",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "점적기 병입니다. 병 목 부분만 최근에 닦였습니다.",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "본인만 쓰는 물건이야. 습관은 예측 가능하고, 예측 가능한 건 이용당한다.",
          },
          { id: "a3", speakerId: "partner", text: "…아직 무엇으로 이용됐는지는 모릅니다." },
        ],
      },
    ],
  },
  {
    id: "t-c2-beat-forensic",
    title: "감정 회신 문서",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "두 잔 농도를 나란히 놓고 보자." },
          { id: "b2", speakerId: "partner", text: "예비 회신 왔습니다. 숫자가… 이상합니다." },
        ],
      },
    ],
  },
  {
    id: "t-c2-after-forensic",
    title: "두 잔의 농도",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "샴페인 잔은 치사량에 미달입니다. 위스키 잔 잔여물은 치사 농도를 넘습니다.",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "두 잔의 오염 시점이 다르다는 얘기야. 처음 그림이 흔들렸어.",
          },
        ],
      },
    ],
  },

  // ---- analysis thread (unlocked once e1 + e2 + e3 + e4 are in hand) ----
  {
    id: "t-c2-scene02-analysis",
    title: "두 잔의 해석",
    sceneId: "scene-02",
    startNodeId: "sum",
    nodes: [
      {
        id: "sum",
        lines: [
          { id: "s1", speakerId: "partner", text: "정리하면 이렇습니다." },
          {
            id: "s2",
            speakerId: "partner",
            text: "축배 잔에서 반응은 있었지만 양이 부족하고, 축배 이후 개인 잔이 따로 있었습니다.",
          },
          {
            id: "s3",
            speakerId: "partner",
            text: "그 잔에는 습관대로 쓰던 점적기가 붙어 있습니다.",
          },
          { id: "s4", speakerId: "me", text: "형사님은 이걸 어떻게 읽지?" },
        ],
        choices: [
          {
            id: "a-champagne-path",
            text: "샴페인이 주입 경로다.",
            effect: {
              goToNodeId: "r-champagne",
              setFlags: ["c2:scene02:read-champagne"],
              notebookEntry: {
                section: "theories",
                text: "가설 A — 샴페인 잔이 주입 경로. 다만 검출량이 치사량에 미달하는 점을 설명해야 함.",
              },
            },
          },
          {
            id: "a-other-path",
            text: "샴페인은 연출이고, 별도 음료 경로가 있다.",
            effect: {
              goToNodeId: "r-other",
              setFlags: ["c2:scene02:read-other-path"],
              notebookEntry: {
                section: "theories",
                text: "가설 B — 축배 잔은 시선을 끌기 위한 것이고 실제 경로는 축배 이후의 개인 잔.",
              },
            },
          },
          {
            id: "a-coincidence",
            text: "두 잔이 모두 우연히 오염됐다.",
            effect: {
              goToNodeId: "r-coincidence",
              setFlags: ["c2:scene02:read-coincidence"],
              notebookEntry: {
                section: "theories",
                text: "가설 C — 두 잔의 오염이 우연. 농도 차이와 오염 시점 차이를 먼저 배제해야 함.",
              },
            },
          },
        ],
      },
      {
        id: "r-champagne",
        lines: [
          {
            id: "c1",
            speakerId: "partner",
            text: "가장 단순한 설명이긴 합니다. 다만 양이 계속 걸립니다.",
          },
          {
            id: "c2",
            speakerId: "me",
            text: "걸리는 건 남겨둬. 지금은 어느 쪽도 확정하지 않는다. 사람을 만나야 해.",
          },
        ],
      },
      {
        id: "r-other",
        lines: [
          {
            id: "o1",
            speakerId: "partner",
            text: "그러면 축배 잔은 우리가 먼저 보게 되어 있었다는 뜻입니까?",
          },
          {
            id: "o2",
            speakerId: "me",
            text: "가능성이야. 아직 이름은 붙이지 마. 진술이 남았어.",
          },
        ],
      },
      {
        id: "r-coincidence",
        lines: [
          {
            id: "x1",
            speakerId: "partner",
            text: "우연이라면 두 잔의 오염 시점이 왜 다른지가 설명이 안 됩니다.",
          },
          {
            id: "x2",
            speakerId: "me",
            text: "그래서 배제부터 하는 거야. 확인은 심문에서 하자.",
          },
        ],
      },
    ],
  },
];
