import type { DialogueThread } from "@/types/dialogue";

/**
 * CASE001 Scene 02 dialogue — evidence analysis with the partner.
 * Player-facing only: no culprit, motive, or hidden-truth references.
 *
 * The three system records (CCTV 공백, 정전 기록, 멈춘 시계) can be examined
 * in any order. Each has a "before" beat played on the scene surface and an
 * "after" beat logged into the transcript once the evidence is revealed.
 */
export const scene02Threads: DialogueThread[] = [
  {
    id: "t-scene02-open",
    title: "이상한 시간대",
    sceneId: "scene-02",
    startNodeId: "open",
    nodes: [
      {
        id: "open",
        lines: [
          {
            id: "l1",
            speakerId: "partner",
            text: "현장 1차는 끝났습니다. 이제 기록 쪽을 봐야 할 것 같은데요.",
          },
          {
            id: "l2",
            speakerId: "partner",
            text: "관제실 CCTV 로그, 12층 배전반 기록, 그리고 회의실 시계. 세 개가 남았습니다.",
          },
          {
            id: "l3",
            speakerId: "me",
            text: "순서는 상관없어. 다만 세 개를 다 봐야 시간대가 맞춰질 거야.",
          },
          {
            id: "l4",
            speakerId: "partner",
            text: "알겠습니다. 현장 탭에서 원하는 것부터 확인하시죠.",
          },
        ],
      },
    ],
  },

  // ---- before-beats -----------------------------------------------------
  {
    id: "t-beat-cctv",
    title: "CCTV 관리 콘솔",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "관제 로그부터. 저장 주기랑 실제 파일을 같이 봐." },
          { id: "b2", speakerId: "partner", text: "…12층 복도 구간만 비어 있습니다." },
          { id: "b3", speakerId: "me", text: "삭제인지 미기록인지, 그게 완전히 다른 얘기야." },
        ],
      },
    ],
  },
  {
    id: "t-after-cctv",
    title: "CCTV 공백",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "수동 삭제 흔적은 없습니다. 그 구간이 아예 기록되지 않은 쪽에 가깝습니다.",
          },
          {
            id: "a2",
            speakerId: "me",
            text: "그럼 카메라가 아니라 카메라에 전기를 주던 쪽을 봐야겠지.",
          },
        ],
      },
    ],
  },
  {
    id: "t-beat-breaker",
    title: "배전함",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "partner", text: "12층 배전반입니다. 잠금은 걸려 있지 않았어요." },
          { id: "b2", speakerId: "me", text: "로그 남지? 짧은 이상도 기록될 거야." },
        ],
      },
    ],
  },
  {
    id: "t-after-breaker",
    title: "정전 기록",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          {
            id: "a1",
            speakerId: "partner",
            text: "12층 일부 구역, 아주 짧은 전원 이상. 층 전체는 아니었습니다.",
          },
          { id: "a2", speakerId: "me", text: "일부 구역만. 그게 우연이라면 꽤 운이 좋은 우연이네." },
        ],
      },
    ],
  },
  {
    id: "t-beat-clock",
    title: "회의실 시계",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "b1", speakerId: "me", text: "회의실 벽시계. 아직 아무도 안 만졌지?" },
          { id: "b2", speakerId: "partner", text: "그대로입니다. 그런데… 멈춰 있습니다." },
        ],
      },
    ],
  },
  {
    id: "t-after-clock",
    title: "멈춘 시계",
    sceneId: "scene-02",
    startNodeId: "beat",
    nodes: [
      {
        id: "beat",
        lines: [
          { id: "a1", speakerId: "partner", text: "배터리 덮개가 열려 있습니다. 이건 좀 이상한데요." },
          {
            id: "a2",
            speakerId: "me",
            text: "멈춘 시각 자체를 믿으면 안 돼. 다만 왜 멈췄는지는 의미가 있어.",
          },
        ],
      },
    ],
  },

  // ---- analysis thread (unlocked when e2 + e6 + e7 are in hand) ---------
  {
    id: "t-scene02-analysis",
    title: "세 기록의 교집합",
    sceneId: "scene-02",
    startNodeId: "sum",
    nodes: [
      {
        id: "sum",
        lines: [
          { id: "s1", speakerId: "partner", text: "세 개를 나란히 놓아봤습니다." },
          {
            id: "s2",
            speakerId: "partner",
            text: "CCTV 공백, 전원 이상, 멈춘 시계. 세 기록이 같은 시간대를 가리킵니다.",
          },
          {
            id: "s3",
            speakerId: "me",
            text: "같은 시간대라는 건 확실해. 그 시간에 무슨 일이 있었는지는 아직 아니야.",
          },
          { id: "s4", speakerId: "partner", text: "형사님은 어떻게 보십니까?" },
        ],
        choices: [
          {
            id: "a-coincidence",
            text: "설비 문제일 수도 있습니다. 우연을 먼저 배제하죠.",
            effect: {
              goToNodeId: "r-coincidence",
              setFlags: ["scene02:read-coincidence"],
              notebookEntry: {
                section: "timeline",
                text: "세 기록이 같은 시간대를 가리킴 — 설비 이상 가능성부터 배제할 필요.",
              },
            },
          },
          {
            id: "a-intent",
            text: "누군가 그 시간대를 비워두려 했을 수 있습니다.",
            effect: {
              goToNodeId: "r-intent",
              setFlags: ["scene02:read-intent"],
              notebookEntry: {
                section: "timeline",
                text: "세 기록의 공백이 겹침 — 특정 시간대를 비워둔 흔적일 가능성.",
              },
            },
          },
          {
            id: "a-time",
            text: "사망 추정 시각 자체가 틀렸을 수 있습니다.",
            effect: {
              goToNodeId: "r-time",
              setFlags: ["scene02:read-time"],
              notebookEntry: {
                section: "timeline",
                text: "기록된 시각과 실제 시각이 다를 가능성 — 사망 추정 시각 재검토.",
              },
            },
          },
        ],
      },
      {
        id: "r-coincidence",
        lines: [
          {
            id: "c1",
            speakerId: "partner",
            text: "설비팀에 확인 요청해두겠습니다. 다만 세 개가 동시에라는 게 걸립니다.",
          },
          {
            id: "c2",
            speakerId: "me",
            text: "걸려도 확인은 해야지. 지금은 어느 쪽도 단정하지 않는다.",
          },
        ],
      },
      {
        id: "r-intent",
        lines: [
          { id: "i1", speakerId: "partner", text: "의도라면, 건물 구조를 아는 사람이겠죠." },
          {
            id: "i2",
            speakerId: "me",
            text: "가능성은 열어두되 이름은 아직 붙이지 마. 진술을 들어봐야 해.",
          },
        ],
      },
      {
        id: "r-time",
        lines: [
          {
            id: "t1",
            speakerId: "partner",
            text: "신고 시각과 기록 시각이 어긋난다는 말씀이시군요.",
          },
          {
            id: "t2",
            speakerId: "me",
            text: "그래. 시간이 흔들리면 알리바이도 같이 흔들려. 이제 사람을 만나자.",
          },
        ],
      },
    ],
  },
];
