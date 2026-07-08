import { useEffect, useState } from "react";

export type NotebookSectionId =
  | "suspects"
  | "timeline"
  | "evidence"
  | "questions"
  | "theories";

export interface NotebookSectionDef {
  id: NotebookSectionId;
  label: string;
  hint: string;
  placeholder: string;
}

export const NOTEBOOK_SECTIONS: NotebookSectionDef[] = [
  {
    id: "suspects",
    label: "Suspects",
    hint: "용의자의 태도, 모순, 알리바이를 기록",
    placeholder:
      "## 김비서\n- 알리바이: 19:20 로비 CCTV\n- **모순**: 사장실 조명이 켜져 있었다고 진술\n- 동기: 승진 누락",
  },
  {
    id: "timeline",
    label: "Timeline",
    hint: "시간대별 사건의 흐름을 재구성",
    placeholder:
      "- **19:00** 회식 시작\n- **19:20** 피해자 사무실 복귀\n- **19:45** 조명 꺼짐 (?)\n- **20:10** 시신 발견",
  },
  {
    id: "evidence",
    label: "Evidence",
    hint: "물리적 증거와 그 의미를 정리",
    placeholder:
      "## 깨진 유리컵\n- 위치: 책상 우측\n- 지문: 검출 안 됨\n- 의심점: 닦아낸 흔적",
  },
  {
    id: "questions",
    label: "Questions",
    hint: "아직 풀리지 않은 의문들",
    placeholder:
      "1. 왜 조명이 꺼졌는가?\n2. 두 번째 잔의 주인은?\n3. 20:00 ~ 20:10 사이 누가 있었나?",
  },
  {
    id: "theories",
    label: "Theories",
    hint: "가설과 그 근거",
    placeholder:
      "### 가설 A — 내부 소행\n> 김비서가 승진 누락에 앙심을 품고 회식 도중 이탈\n\n**근거**: CCTV 공백 · 지워진 지문",
  },
];

type Notebook = Record<NotebookSectionId, string>;

const empty = (): Notebook =>
  NOTEBOOK_SECTIONS.reduce(
    (acc, s) => ({ ...acc, [s.id]: "" }),
    {} as Notebook,
  );

const key = (caseId: string) => `notebook:${caseId}`;

function read(caseId: string): Notebook {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(key(caseId));
    if (!raw) return empty();
    return { ...empty(), ...(JSON.parse(raw) as Notebook) };
  } catch {
    return empty();
  }
}

const CHANNEL = "notebook:update";

export function useNotebook(caseId: string) {
  const [state, setState] = useState<Notebook>(() => empty());

  useEffect(() => {
    setState(read(caseId));
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ caseId: string }>).detail;
      if (detail?.caseId === caseId) setState(read(caseId));
    };
    window.addEventListener(CHANNEL, onUpdate as EventListener);
    return () =>
      window.removeEventListener(CHANNEL, onUpdate as EventListener);
  }, [caseId]);

  const update = (id: NotebookSectionId, value: string) => {
    setState((prev) => {
      const next = { ...prev, [id]: value };
      try {
        window.localStorage.setItem(key(caseId), JSON.stringify(next));
        window.dispatchEvent(
          new CustomEvent(CHANNEL, { detail: { caseId } }),
        );
      } catch {
        /* ignore quota */
      }
      return next;
    });
  };

  return { notebook: state, update };
}

export function notebookSummary(nb: Record<NotebookSectionId, string>) {
  const filled = NOTEBOOK_SECTIONS.filter((s) => nb[s.id]?.trim().length);
  const words = NOTEBOOK_SECTIONS.reduce(
    (n, s) => n + (nb[s.id]?.trim().split(/\s+/).filter(Boolean).length ?? 0),
    0,
  );
  return {
    filledSections: filled.map((s) => s.label),
    filledCount: filled.length,
    totalSections: NOTEBOOK_SECTIONS.length,
    words,
  };
}
