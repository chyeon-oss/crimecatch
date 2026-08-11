/**
 * Presentational placement of CASE002 runtime hotspots on the mansion backdrop.
 * Percentages of the scene card (x = left, y = top).
 * Purely visual — hotspot IDs and rewards come from the runtime.
 */
export const hotspotLayout: Record<string, { x: number; y: number }> = {
  // Scene 01 — reception room, collapse site
  "hs-victim-area": { x: 34, y: 64 },
  "hs-sofa-side": { x: 67, y: 73 },
  "hs-hallway": { x: 84, y: 44 },
  // Scene 02 — delivery path
  "hs-bar-cart": { x: 23, y: 52 },
  "hs-pantry": { x: 57, y: 31 },
  "hs-forensic-desk": { x: 79, y: 66 },
  // Scene 03 — prepared ahead of the interrogation sprint
  "hs-fireplace": { x: 30, y: 40 },
  "hs-study": { x: 62, y: 21 },
  "hs-security-console": { x: 81, y: 75 },
};
