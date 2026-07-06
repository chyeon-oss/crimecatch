import type {
  BoardConnection,
  BoardPin,
  BoardPinKind,
  BoardState,
  Case,
  Theory,
  TheoryConfidence,
} from "@/types";

export function createBoardState(): BoardState {
  return { pins: [], connections: [], theories: [] };
}

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export interface BoardPinLabel {
  title: string;
  subtitle: string;
  tone: "evidence" | "suspect" | "timeline";
}

export const BoardEngine = {
  addPin(state: BoardState, kind: BoardPinKind, refId: string): BoardState {
    const exists = state.pins.some(
      (p) => p.kind === kind && p.refId === refId,
    );
    if (exists) return state;
    const pin: BoardPin = { id: uid("pin"), kind, refId };
    return { ...state, pins: [...state.pins, pin] };
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

  removeConnection(state: BoardState, connectionId: string): BoardState {
    return {
      ...state,
      connections: state.connections.filter((c) => c.id !== connectionId),
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
    const t = c.timeline.find((x) => x.time === pin.refId);
    if (!t) return null;
    return { title: t.time, subtitle: t.description, tone: "timeline" };
  },
};
