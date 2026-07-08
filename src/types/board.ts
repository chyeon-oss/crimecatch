export type BoardPinKind = "evidence" | "suspect" | "timeline" | "location";

export interface BoardPin {
  /** Stable pin id (independent of the referenced entity). */
  id: string;
  kind: BoardPinKind;
  /** Evidence.id | Suspect.id | TimelineEvent.time | Hotspot.id */
  refId: string;
  /** Free world-space position (px). Optional for legacy state. */
  x?: number;
  y?: number;
}

export interface BoardConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
  /** Optional short label rendered near the line. */
  label?: string;
}

export interface BoardNote {
  id: string;
  text: string;
  x: number;
  y: number;
  /** Tint index 0-3 for sticky-note colouring. */
  tint?: number;
}

export type TheoryConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface Theory {
  id: string;
  title: string;
  confidence: TheoryConfidence;
  notes: string;
  createdAt: number;
}

export interface BoardState {
  pins: BoardPin[];
  connections: BoardConnection[];
  theories: Theory[];
  notes?: BoardNote[];
}
