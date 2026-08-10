/**
 * Presentational placement of runtime hotspots on the scene backdrop.
 * Percentages of the scene card (x = left, y = top).
 * Purely visual — hotspot IDs and rewards come from the runtime.
 */
export const hotspotLayout: Record<string, { x: number; y: number }> = {
  "hs-victim-desk": { x: 31, y: 62 },
  "hs-meeting-floor": { x: 64, y: 78 },
  "hs-door": { x: 80, y: 40 },
  "hs-cctv": { x: 22, y: 22 },
  "hs-breaker": { x: 52, y: 30 },
  "hs-meeting-clock": { x: 72, y: 18 },
};
