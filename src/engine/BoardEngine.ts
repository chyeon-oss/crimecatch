import type {
  BoardConnection,
  BoardNote,
  BoardPin,
  BoardPinKind,
  BoardState,
  Case,
  Theory,
  TheoryConfidence,
} from "@/types";

export function createBoardState(): BoardState {
  return { pins: [], connections: [], theories: [], notes: [] };
}

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export interface BoardPinLabel {
  title: string;
  subtitle: string;
  tone: "evidence" | "suspect" | "timeline" | "location";
}

// Default drop zone (world space) used when no position is supplied.
const DEFAULT_SPAWN = { x: 240, y: 200, spread: 320 };
const spawnPos = (i: number) => ({
  x: DEFAULT_SPAWN.x + ((i * 173) % DEFAULT_SPAWN.spread),
  y: DEFAULT_SPAWN.y + ((i * 211) % DEFAULT_SPAWN.spread),
});

export const BoardEngine = {
  addPin(
    state: BoardState,
    kind: BoardPinKind,
    refId: string,
    pos?: { x: number; y: number },
  ): BoardState {
    const exists = state.pins.some(
      (p) => p.kind === kind && p.refId === refId,
    );
    if (exists) return state;
    const fallback = pos ?? spawnPos(state.pins.length);
    const pin: BoardPin = {
      id: uid("pin"),
      kind,
      refId,
      x: fallback.x,
      y: fallback.y,
    };
    return { ...state, pins: [...state.pins, pin] };
  },

  movePin(
    state: BoardState,
    pinId: string,
    x: number,
    y: number,
  ): BoardState {
    return {
      ...state,
      pins: state.pins.map((p) => (p.id === pinId ? { ...p, x, y } : p)),
    };
  },

  removePin(state: BoardState, pinId: string): BoardState {
    return {
      ...state,
      pins: state.pins.filter((p) => p.id !== pinId),
      connections: state.connections.filter(
        (c) => c.fromPinId !== pinId && c.toPinId !== pinId,
      ),
    };
  },

  connect(state: BoardState, fromPinId: string, toPinId: string): BoardState {
    if (fromPinId === toPinId) return state;
    const dup = state.connections.some(
      (c) =>
        (c.fromPinId === fromPinId && c.toPinId === toPinId) ||
        (c.fromPinId === toPinId && c.toPinId === fromPinId),
    );
    if (dup) return state;
    const conn: BoardConnection = {
      id: uid("con"),
      fromPinId,
      toPinId,
    };
    return { ...state, connections: [...state.connections, conn] };
  },

  setConnectionLabel(
    state: BoardState,
    connectionId: string,
    label: string,
  ): BoardState {
    return {
      ...state,
      connections: state.connections.map((c) =>
        c.id === connectionId
          ? { ...c, label: label.trim() ? label.trim() : undefined }
          : c,
      ),
    };
  },

  removeConnection(state: BoardState, connectionId: string): BoardState {
    return {
      ...state,
      connections: state.connections.filter((c) => c.id !== connectionId),
    };
  },

  addNote(
    state: BoardState,
    input: { text?: string; x: number; y: number; tint?: number },
  ): BoardState {
    const note: BoardNote = {
      id: uid("note"),
      text: input.text ?? "",
      x: input.x,
      y: input.y,
      tint: input.tint ?? Math.floor(Math.random() * 4),
    };
    return { ...state, notes: [...(state.notes ?? []), note] };
  },

  updateNote(state: BoardState, id: string, text: string): BoardState {
    return {
      ...state,
      notes: (state.notes ?? []).map((n) =>
        n.id === id ? { ...n, text } : n,
      ),
    };
  },

  moveNote(state: BoardState, id: string, x: number, y: number): BoardState {
    return {
      ...state,
      notes: (state.notes ?? []).map((n) =>
        n.id === id ? { ...n, x, y } : n,
      ),
    };
  },

  removeNote(state: BoardState, id: string): BoardState {
    return {
      ...state,
      notes: (state.notes ?? []).filter((n) => n.id !== id),
    };
  },

  addTheory(
    state: BoardState,
    input: { title: string; confidence: TheoryConfidence; notes: string },
  ): BoardState {
    const theory: Theory = {
      id: uid("thy"),
      title: input.title.trim() || "새 가설",
      confidence: input.confidence,
      notes: input.notes,
      createdAt: Date.now(),
    };
    return { ...state, theories: [theory, ...state.theories] };
  },

  removeTheory(state: BoardState, id: string): BoardState {
    return { ...state, theories: state.theories.filter((t) => t.id !== id) };
  },

  labelFor(pin: BoardPin, c: Case): BoardPinLabel | null {
    if (pin.kind === "evidence") {
      const e = c.evidence.find((x) => x.id === pin.refId);
      if (!e) return null;
      return { title: e.title, subtitle: e.category, tone: "evidence" };
    }
    if (pin.kind === "suspect") {
      const s = c.suspects.find((x) => x.id === pin.refId);
      if (!s) return null;
      return { title: s.name, subtitle: s.occupation, tone: "suspect" };
    }
    if (pin.kind === "location") {
      const h = c.crimeScene?.hotspots.find((x) => x.id === pin.refId);
      if (!h) return null;
      return {
        title: h.label,
        subtitle: h.hint ?? "현장 위치",
        tone: "location",
      };
    }
    const t = c.timeline.find((x) => x.time === pin.refId);
    if (!t) return null;
    return { title: t.time, subtitle: t.description, tone: "timeline" };
  },
};
