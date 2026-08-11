import { useCallback, useEffect, useState } from "react";

export type BoardNodeKind = "evidence" | "question" | "suspect";

export interface BoardEndpoint {
  kind: BoardNodeKind;
  id: string;
}

/** Relationship kinds a player can assign to a link. */
export type BoardRelation =
  | "contradicts"
  | "supports"
  | "same-time"
  | "person";

export const RELATIONS: BoardRelation[] = [
  "contradicts",
  "supports",
  "same-time",
  "person",
];

export const RELATION_META: Record<
  BoardRelation,
  { label: string; short: string; tone: string; dot: string }
> = {
  contradicts: {
    label: "모순된다",
    short: "모순",
    tone: "border-rose-400/50 bg-rose-500/10 text-rose-200",
    dot: "bg-rose-400",
  },
  supports: {
    label: "뒷받침한다",
    short: "뒷받침",
    tone: "border-emerald-400/50 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },
  "same-time": {
    label: "같은 시간대다",
    short: "동시간",
    tone: "border-sky-400/50 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
  },
  person: {
    label: "인물과 관련 있다",
    short: "인물",
    tone: "border-amber-400/50 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
  },
};

/** Legacy links created before relationships existed render neutrally. */
export const NEUTRAL_RELATION_LABEL = "관련 있음";

export function relationLabel(relation?: BoardRelation): string {
  return relation ? RELATION_META[relation].label : NEUTRAL_RELATION_LABEL;
}

export function relationTone(relation?: BoardRelation): string {
  return relation
    ? RELATION_META[relation].tone
    : "border-neutral-600/60 bg-neutral-500/10 text-neutral-200";
}

export interface DetectiveBoardConnection {
  id: string;
  from: BoardEndpoint;
  to: BoardEndpoint;
  /** Optional — absent on legacy links. */
  relation?: BoardRelation;
  memo?: string;
  createdAt: number;
}

export interface DetectiveBoardData {
  connections: DetectiveBoardConnection[];
}

export const MEMO_MAX = 100;

const empty = (): DetectiveBoardData => ({ connections: [] });
const key = (caseId: string) => `detective-board:${caseId}`;
const CHANNEL = "detective-board:update";

const uid = () =>
  `con_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export function sameEndpoint(a: BoardEndpoint, b: BoardEndpoint) {
  return a.kind === b.kind && a.id === b.id;
}

/** Order-independent pair identity. */
export function samePair(
  c: Pick<DetectiveBoardConnection, "from" | "to">,
  from: BoardEndpoint,
  to: BoardEndpoint,
) {
  return (
    (sameEndpoint(c.from, from) && sameEndpoint(c.to, to)) ||
    (sameEndpoint(c.from, to) && sameEndpoint(c.to, from))
  );
}

export function findConnection(
  data: DetectiveBoardData,
  from: BoardEndpoint,
  to: BoardEndpoint,
): DetectiveBoardConnection | undefined {
  return data.connections.find((c) => samePair(c, from, to));
}

function isEndpoint(v: unknown): v is BoardEndpoint {
  const e = v as BoardEndpoint | null;
  return (
    !!e &&
    typeof e.id === "string" &&
    (e.kind === "evidence" || e.kind === "question" || e.kind === "suspect")
  );
}

/**
 * Normalises persisted payloads: drops malformed rows, keeps relation-less
 * legacy links intact (they render with the neutral label).
 */
export function migrateBoard(raw: unknown): DetectiveBoardData {
  const parsed = raw as DetectiveBoardData | null;
  if (!parsed || !Array.isArray(parsed.connections)) return empty();
  const connections: DetectiveBoardConnection[] = [];
  for (const c of parsed.connections) {
    if (!c || typeof c.id !== "string") continue;
    if (!isEndpoint(c.from) || !isEndpoint(c.to)) continue;
    if (sameEndpoint(c.from, c.to)) continue;
    if (connections.some((x) => samePair(x, c.from, c.to))) continue;
    connections.push({
      id: c.id,
      from: { kind: c.from.kind, id: c.from.id },
      to: { kind: c.to.kind, id: c.to.id },
      relation:
        c.relation && RELATIONS.includes(c.relation) ? c.relation : undefined,
      memo: typeof c.memo === "string" ? c.memo.slice(0, MEMO_MAX) : "",
      createdAt: typeof c.createdAt === "number" ? c.createdAt : Date.now(),
    });
  }
  return { connections };
}

/* ------------------------------------------------------------------ */
/* Pure reducers (deterministically testable, no DOM required)         */
/* ------------------------------------------------------------------ */

export function createLink(
  data: DetectiveBoardData,
  from: BoardEndpoint,
  to: BoardEndpoint,
  relation?: BoardRelation,
  id: string = uid(),
  now: number = Date.now(),
): DetectiveBoardData {
  if (sameEndpoint(from, to)) return data;
  const existing = findConnection(data, from, to);
  if (existing) {
    // Never duplicate a pair — update the relation of the existing link.
    return relation ? setRelation(data, existing.id, relation) : data;
  }
  return {
    connections: [
      ...data.connections,
      { id, from, to, relation, memo: "", createdAt: now },
    ],
  };
}

export function setRelation(
  data: DetectiveBoardData,
  id: string,
  relation: BoardRelation,
): DetectiveBoardData {
  return {
    connections: data.connections.map((c) =>
      c.id === id ? { ...c, relation } : c,
    ),
  };
}

export function setMemo(
  data: DetectiveBoardData,
  id: string,
  memo: string,
): DetectiveBoardData {
  return {
    connections: data.connections.map((c) =>
      c.id === id ? { ...c, memo: memo.slice(0, MEMO_MAX) } : c,
    ),
  };
}

export function removeLink(
  data: DetectiveBoardData,
  id: string,
): DetectiveBoardData {
  return { connections: data.connections.filter((c) => c.id !== id) };
}

/** Stable 1-based visual identifier for a link. */
export function linkIndex(data: DetectiveBoardData, id: string): number {
  return data.connections.findIndex((c) => c.id === id) + 1;
}

export function linksFor(
  data: DetectiveBoardData,
  ep: BoardEndpoint,
): DetectiveBoardConnection[] {
  return data.connections.filter(
    (c) => sameEndpoint(c.from, ep) || sameEndpoint(c.to, ep),
  );
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

export function readBoard(caseId: string): DetectiveBoardData {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(key(caseId));
    if (!raw) return empty();
    return migrateBoard(JSON.parse(raw));
  } catch {
    return empty();
  }
}

function write(caseId: string, data: DetectiveBoardData) {
  try {
    window.localStorage.setItem(key(caseId), JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { caseId } }));
  } catch {
    /* ignore */
  }
}

export function useDetectiveBoard(caseId: string) {
  const [data, setData] = useState<DetectiveBoardData>(() => empty());

  useEffect(() => {
    setData(readBoard(caseId));
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ caseId: string }>).detail;
      if (detail?.caseId === caseId) setData(readBoard(caseId));
    };
    window.addEventListener(CHANNEL, onUpdate as EventListener);
    return () => window.removeEventListener(CHANNEL, onUpdate as EventListener);
  }, [caseId]);

  const commit = useCallback(
    (fn: (prev: DetectiveBoardData) => DetectiveBoardData) => {
      setData((prev) => {
        const next = fn(prev);
        if (next !== prev) write(caseId, next);
        return next;
      });
    },
    [caseId],
  );

  const addConnection = useCallback(
    (from: BoardEndpoint, to: BoardEndpoint, relation?: BoardRelation) =>
      commit((prev) => createLink(prev, from, to, relation)),
    [commit],
  );

  const updateRelation = useCallback(
    (id: string, relation: BoardRelation) =>
      commit((prev) => setRelation(prev, id, relation)),
    [commit],
  );

  const updateMemo = useCallback(
    (id: string, memo: string) => commit((prev) => setMemo(prev, id, memo)),
    [commit],
  );

  const removeConnection = useCallback(
    (id: string) => commit((prev) => removeLink(prev, id)),
    [commit],
  );

  return {
    data,
    addConnection,
    updateRelation,
    updateMemo,
    removeConnection,
  };
}
