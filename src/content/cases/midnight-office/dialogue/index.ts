import type { CaseDialoguePack } from "@/types/dialogue";
import { scene01Threads } from "./scene01";
import { scene02Threads } from "./scene02";

/**
 * CASE001 dialogue pack — assembled from per-scene authored content.
 * Player-facing only: no culprit, motive, or hidden-truth references.
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
    "hs-cctv": "t-beat-cctv",
    "hs-breaker": "t-beat-breaker",
    "hs-meeting-clock": "t-beat-clock",
  },
  hotspotAfterThreadIds: {
    "hs-cctv": "t-after-cctv",
    "hs-breaker": "t-after-breaker",
    "hs-meeting-clock": "t-after-clock",
  },
  autoThreads: [
    { threadId: "t-scene02-open", sceneId: "scene-02" },
    {
      threadId: "t-scene02-analysis",
      sceneId: "scene-02",
      requirement: { requiresEvidenceIds: ["e2", "e6", "e7"] },
    },
  ],
  threads: [...scene01Threads, ...scene02Threads],
};
