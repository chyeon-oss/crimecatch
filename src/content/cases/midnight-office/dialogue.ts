import type { CaseDialoguePack } from "@/types/dialogue";

/**
 * CASE001 Scene 01 dialogue — player-facing only.
 * No culprit, motive, or hidden-truth references anywhere in this file.
 */
export const midnightOfficeDialogue: CaseDialoguePack = {
  caseId: "midnight-office",
  openingThreadId: "t-scene01-open",
  speakers: [
    { id: "partner", name: "박선우", role: "PARTNER", title: "강남서 강력2팀" },
    { id: "me", name: "나", role: "DETECTIVE" },
  ],
  hotspotThreadIds: {
    "hs-victim-desk": "t-beat-desk",
    "hs-meeting-floor": "t-beat-floor",
    "hs-door": "t-beat-door",
  },
  threads: [
    {
      id: "t-scene01-open",
      title: "현장 도착",
      sceneId: "scene-01",
      startNodeId: "open",
      nodes: [
        {
          id: "open",
          lines: [
            { id: "l1", speakerId: "partner", text: "왔네요. 12층, 기획전략실입니다." },
            {
              id: "l2",
              speakerId: "partner",
              text: "신고는 22시 31분. 회의실 근처에서 사람이 쓰러져 있다는 내용이었습니다.",
            },
            {
              id: "l3",
              speakerId: "partner",
              text: "피해자는 한도윤 팀장. 이 회사 8년차예요.",
            },
            {
              id: "l4",
              speakerId: "me",
              text: "현장은 너무 깔끔한데. 정리된 게 아니라, 정리해 둔 것 같은 느낌이야.",
            },
            {
              id: "l5",
              speakerId: "partner",
              text: "그래서 부른 겁니다. 관계자들은 전부 건물 안에 대기 중이에요.",
            },
            {
              id: "l6",
              speakerId: "partner",
              text: "어디부터 보시겠습니까?",
            },
          ],
          choices: [
            {
              id: "c-desk",
              text: "피해자 책상부터 보죠.",
              effect: {
                goToNodeId: "guide-desk",
                setFlags: ["scene01:lead-desk"],
                focusHotspotId: "hs-victim-desk",
              },
            },
            {
              id: "c-door",
              text: "출입문 상태가 이상합니다.",
              effect: {
                goToNodeId: "guide-door",
                setFlags: ["scene01:lead-door"],
                focusHotspotId: "hs-door",
              },
            },
            {
              id: "c-floor",
              text: "회의실 바닥을 확인하죠.",
              effect: {
                goToNodeId: "guide-floor",
                setFlags: ["scene01:lead-floor"],
                focusHotspotId: "hs-meeting-floor",
              },
            },
          ],
        },
        {
          id: "guide-desk",
          lines: [
            { id: "d1", speakerId: "partner", text: "책상은 손 안 댔습니다. 그대로예요." },
            {
              id: "d2",
              speakerId: "me",
              text: "그럼 책상부터. 현장 탭에서 피해자 책상을 눌러줘.",
            },
          ],
        },
        {
          id: "guide-door",
          lines: [
            {
              id: "o1",
              speakerId: "partner",
              text: "출입문이요? 강제로 열린 흔적은 없었습니다.",
            },
            {
              id: "o2",
              speakerId: "me",
              text: "흔적이 없는 게 이상한 거야. 출입문을 먼저 확인하자.",
            },
          ],
        },
        {
          id: "guide-floor",
          lines: [
            { id: "f1", speakerId: "partner", text: "회의실 바닥은 감식이 한 번 봤습니다." },
            {
              id: "f2",
              speakerId: "me",
              text: "다시 봐야 해. 바닥은 거짓말을 못 하니까.",
            },
          ],
        },
      ],
    },
    {
      id: "t-beat-desk",
      title: "피해자 책상",
      sceneId: "scene-01",
      startNodeId: "beat",
      nodes: [
        {
          id: "beat",
          lines: [
            { id: "b1", speakerId: "me", text: "책상 오른쪽… 뭔가 깨져 있네." },
            { id: "b2", speakerId: "partner", text: "머그컵입니다. 조각이 흩어져 있어요." },
            {
              id: "b3",
              speakerId: "me",
              text: "노트북도 열린 채로 있고. 마지막까지 뭘 보고 있었지?",
            },
          ],
        },
      ],
    },
    {
      id: "t-beat-floor",
      title: "회의실 바닥",
      sceneId: "scene-01",
      startNodeId: "beat",
      nodes: [
        {
          id: "beat",
          lines: [
            { id: "b1", speakerId: "me", text: "바닥 조명 낮춰봐. 책상 아래쪽." },
            { id: "b2", speakerId: "partner", text: "…있습니다. 아주 적은 양인데요." },
            {
              id: "b3",
              speakerId: "me",
              text: "적은 게 문제야. 이 정도면 남는 흔적이 더 있어야 해.",
            },
          ],
        },
      ],
    },
    {
      id: "t-beat-door",
      title: "출입문",
      sceneId: "scene-01",
      startNodeId: "beat",
      nodes: [
        {
          id: "beat",
          lines: [
            { id: "b1", speakerId: "me", text: "손잡이, 잠금장치, 문틀 순서로 본다." },
            { id: "b2", speakerId: "partner", text: "파손 없습니다. 억지로 연 흔적도 없고요." },
            {
              id: "b3",
              speakerId: "me",
              text: "그럼 문은 열려 있었거나, 열어준 사람이 있었다는 얘기지.",
            },
          ],
        },
      ],
    },
  ],
};
