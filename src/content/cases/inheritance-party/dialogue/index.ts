import type { CaseDialoguePack } from "@/types/dialogue";
import { scene01Threads } from "./scene01";
import { scene02Threads } from "./scene02";
import { scene03Threads } from "./scene03";

/**
 * CASE002 dialogue pack — assembled from per-scene authored content.
 * Player-facing only: no culprit, motive, cover-up, or hidden-truth references.
 */
export const inheritancePartyDialogue: CaseDialoguePack = {
  caseId: "inheritance-party",
  openingThreadId: "t-c2-scene01-open",
  speakers: [
    { id: "partner", name: "윤가람", role: "PARTNER", title: "성북서 강력1팀" },
    { id: "me", name: "나", role: "DETECTIVE" },
  ],
  hotspotThreadIds: {
    "hs-victim-area": "t-c2-beat-victim",
    "hs-sofa-side": "t-c2-beat-sofa",
    "hs-hallway": "t-c2-beat-hallway",
    "hs-bar-cart": "t-c2-beat-bar",
    "hs-pantry": "t-c2-beat-pantry",
    "hs-forensic-desk": "t-c2-beat-forensic",
    "hs-fireplace": "t-c2-beat-fireplace",
    "hs-study": "t-c2-beat-study",
    "hs-security-console": "t-c2-beat-security",
  },
  hotspotAfterThreadIds: {
    "hs-victim-area": "t-c2-after-victim",
    "hs-sofa-side": "t-c2-after-sofa",
    "hs-hallway": "t-c2-after-hallway",
    "hs-bar-cart": "t-c2-after-bar",
    "hs-pantry": "t-c2-after-pantry",
    "hs-forensic-desk": "t-c2-after-forensic",
    "hs-fireplace": "t-c2-after-fireplace",
    "hs-study": "t-c2-after-study",
    "hs-security-console": "t-c2-after-security",
  },
  autoThreads: [
    { threadId: "t-c2-scene02-open", sceneId: "scene-02" },
    {
      threadId: "t-c2-scene02-analysis",
      sceneId: "scene-02",
      requirement: { requiresEvidenceIds: ["e1", "e2", "e3", "e4"] },
    },
    { threadId: "t-c2-scene03-open", sceneId: "scene-03" },
    {
      threadId: "t-c2-scene03-analysis",
      sceneId: "scene-03",
      requirement: { requiresEvidenceIds: ["e5", "e8", "e9"] },
    },
  ],
  threads: [...scene01Threads, ...scene02Threads, ...scene03Threads],
};
