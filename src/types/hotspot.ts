export type HotspotStatus = "idle" | "searching" | "investigated";

export interface CrimeSceneHotspot {
  id: string;
  label: string;
  hint?: string;
  /** Evidence ids revealed when this hotspot is investigated. Empty = red herring. */
  revealsEvidenceIds: string[];
  /** Shown when nothing meaningful is found. */
  emptyMessage?: string;
  /** Reserved: future AI-driven flags this hotspot can raise. */
  flagsOnInvestigate?: string[];
}

export interface CrimeScene {
  /** Short description of the scene image; the UI renders a placeholder for now. */
  imagePrompt?: string;
  hotspots: CrimeSceneHotspot[];
}
