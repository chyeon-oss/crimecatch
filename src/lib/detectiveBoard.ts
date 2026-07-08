import { useEffect, useState } from "react";

export type BoardNodeKind = "evidence" | "question" | "suspect";

export interface BoardEndpoint {
  kind: BoardNodeKind;
  id: string;
}

export interface DetectiveBoardConnection {
  id: string;
  from: BoardEndpoint;
  to: BoardEndpoint;
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

export function readBoard(caseId: string): DetectiveBoardData {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(key(caseId));
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as DetectiveBoardData;
    if (!parsed || !Array.isArray(parsed.connections)) return empty();
    return parsed;
  } catch {
    return empty();
  }
}

function write(caseId: string, data: DetectiveBoardData) {
  try {
    window.localStorage.setItem(key(caseId), JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent(CHANNEL, { detail: { caseId } }),
    );
  } catch {
    /* ignore */
  }
}

function sameEndpoint(a: BoardEndpoint, b: BoardEndpoint) {
  return a.kind === b.kind && a.id === b.id;
}

function connectionExists(
  data: DetectiveBoardData,
  from: BoardEndpoint,
  to: BoardEndpoint,
) {
  return data.connections.some(
    (c) =>
      (sameEndpoint(c.from, from) && sameEndpoint(c.to, to)) ||
      (sameEndpoint(c.from, to) && sameEndpoint(c.to, from)),
  );
}

const uid = () =>
  `con_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export function useDetectiveBoard(caseId: string) {
  const [data, setData] = useState<DetectiveBoardData>(() => empty());

  useEffect(() => {
    setData(readBoard(caseId));
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ caseId: string }>).detail;
      if (detail?.caseId === caseId) setData(readBoard(caseId));
    };
    window.addEventListener(CHANNEL, onUpdate as EventListener);
    return () =>
      window.removeEventListener(CHANNEL, onUpdate as EventListener);
  }, [caseId]);

  const addConnection = (from: BoardEndpoint, to: BoardEndpoint) => {
    if (sameEndpoint(from, to)) return;
    setData((prev) => {
      if (connectionExists(prev, from, to)) return prev;
      const next: DetectiveBoardData = {
        connections: [
          ...prev.connections,
          { id: uid(), from, to, memo: "", createdAt: Date.now() },
        ],
      };
      write(caseId, next);
      return next;
    });
  };

  const updateMemo = (id: string, memo: string) => {
    setData((prev) => {
      const next: DetectiveBoardData = {
        connections: prev.connections.map((c) =>
          c.id === id ? { ...c, memo: memo.slice(0, MEMO_MAX) } : c,
        ),
      };
      write(caseId, next);
      return next;
    });
  };

  const removeConnection = (id: string) => {
    setData((prev) => {
      const next: DetectiveBoardData = {
        connections: prev.connections.filter((c) => c.id !== id),
      };
      write(caseId, next);
      return next;
    });
  };

  return { data, addConnection, updateMemo, removeConnection };
}
