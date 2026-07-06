export type BoardPinKind = "evidence" | "suspect" | "timeline";

export interface BoardPin {
  /** Stable pin id (independent of the referenced entity). */
  id: string;
  kind: BoardPinKind;
  /** Evidence.id | Suspect.id | TimelineEvent.time */
  refId: string;
}

export interface BoardConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
  /** Optional short label rendered near the line. */
  label?: string;
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
}
