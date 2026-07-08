import { useMemo, useState, type DragEvent } from "react";
import {
  Fingerprint,
  HelpCircle,
  User,
  Link2,
  X,
  Pencil,
  ArrowRight,
} from "lucide-react";
import {
  MEMO_MAX,
  useDetectiveBoard,
  type BoardEndpoint,
  type BoardNodeKind,
} from "@/lib/detectiveBoard";

export interface BoardItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface Props {
  caseId: string;
  evidence: BoardItem[];
  questions: BoardItem[];
  suspects: BoardItem[];
}

const KIND_META: Record<
  BoardNodeKind,
  { label: string; icon: typeof Fingerprint; tone: string; accent: string }
> = {
  evidence: {
    label: "증거",
    icon: Fingerprint,
    tone: "border-amber-400/40 bg-amber-500/5 text-amber-100",
    accent: "text-amber-300",
  },
  question: {
    label: "질문",
    icon: HelpCircle,
    tone: "border-sky-400/40 bg-sky-500/5 text-sky-100",
    accent: "text-sky-300",
  },
  suspect: {
    label: "용의자",
    icon: User,
    tone: "border-rose-400/40 bg-rose-500/5 text-rose-100",
    accent: "text-rose-300",
  },
};

const DRAG_MIME = "application/x-detective-board-endpoint";

export function DetectiveBoard({
  caseId,
  evidence,
  questions,
  suspects,
}: Props) {
  const { data, addConnection, updateMemo, removeConnection } =
    useDetectiveBoard(caseId);
  const [pending, setPending] = useState<BoardEndpoint | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);

  const labelOf = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of evidence) map.set(`evidence:${e.id}`, e.label);
    for (const q of questions) map.set(`question:${q.id}`, q.label);
    for (const s of suspects) map.set(`suspect:${s.id}`, s.label);
    return (ep: BoardEndpoint) =>
      map.get(`${ep.kind}:${ep.id}`) ?? "(삭제됨)";
  }, [evidence, questions, suspects]);

  const columns: { kind: BoardNodeKind; items: BoardItem[] }[] = [
    { kind: "evidence", items: evidence },
    { kind: "question", items: questions },
    { kind: "suspect", items: suspects },
  ];

  const onCardClick = (ep: BoardEndpoint) => {
    if (!pending) {
      setPending(ep);
      return;
    }
    if (pending.kind === ep.kind && pending.id === ep.id) {
      setPending(null);
      return;
    }
    addConnection(pending, ep);
    setPending(null);
  };

  const onDragStart = (e: DragEvent<HTMLButtonElement>, ep: BoardEndpoint) => {
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(ep));
    e.dataTransfer.effectAllowed = "link";
  };

  const onDragOver = (e: DragEvent<HTMLButtonElement>, key: string) => {
    if (e.dataTransfer.types.includes(DRAG_MIME)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "link";
      setDropTarget(key);
    }
  };

  const onDrop = (e: DragEvent<HTMLButtonElement>, ep: BoardEndpoint) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(DRAG_MIME);
    setDropTarget(null);
    if (!raw) return;
    try {
      const from = JSON.parse(raw) as BoardEndpoint;
      addConnection(from, ep);
    } catch {
      /* ignore */
    }
  };

  const isSelected = (ep: BoardEndpoint) =>
    pending?.kind === ep.kind && pending.id === ep.id;

  return (
    <div className="space-y-5 rounded-xl border border-amber-900/25 bg-[#0f0d0b]/90 p-4 text-neutral-100 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200/70">
            Detective Board
          </p>
          <p className="mt-0.5 font-display text-sm text-neutral-100">
            추리 보드 · 카드를 드래그하거나 두 카드를 차례로 눌러 연결하세요
          </p>
        </div>
        {pending && (
          <button
            type="button"
            onClick={() => setPending(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] text-primary transition hover:bg-primary/15"
          >
            <Link2 className="h-3 w-3" />
            연결 대기 중 · {KIND_META[pending.kind].label} · 취소
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {columns.map((col) => {
          const meta = KIND_META[col.kind];
          const Icon = meta.icon;
          return (
            <div
              key={col.kind}
              className="rounded-lg border border-neutral-800/70 bg-black/30 p-3"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${meta.accent}`} />
                <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">
                  {meta.label}
                </span>
                <span className="ml-auto text-[10px] tabular-nums text-neutral-500">
                  {col.items.length}
                </span>
              </div>
              {col.items.length === 0 ? (
                <p className="rounded-md border border-dashed border-neutral-800 bg-black/20 px-2 py-4 text-center text-[11px] italic text-neutral-500">
                  아직 없음
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {col.items.map((it) => {
                    const ep: BoardEndpoint = { kind: col.kind, id: it.id };
                    const key = `${col.kind}:${it.id}`;
                    const selected = isSelected(ep);
                    const isDropTarget = dropTarget === key;
                    return (
                      <li key={it.id}>
                        <button
                          type="button"
                          draggable
                          onDragStart={(e) => onDragStart(e, ep)}
                          onDragEnd={() => setDropTarget(null)}
                          onDragOver={(e) => onDragOver(e, key)}
                          onDragLeave={() =>
                            setDropTarget((cur) => (cur === key ? null : cur))
                          }
                          onDrop={(e) => onDrop(e, ep)}
                          onClick={() => onCardClick(ep)}
                          className={
                            "group w-full cursor-pointer select-none rounded-md border px-2.5 py-2 text-left text-[12px] leading-snug transition " +
                            (selected
                              ? "border-primary/60 bg-primary/10 text-primary"
                              : isDropTarget
                                ? "border-primary/50 bg-primary/5 text-neutral-100"
                                : `${meta.tone} hover:border-neutral-500`)
                          }
                        >
                          <span className="line-clamp-2">{it.label}</span>
                          {it.sublabel && (
                            <span className="mt-0.5 block text-[10px] text-neutral-500">
                              {it.sublabel}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">
            연결 · Connections
          </p>
          <span className="text-[10px] tabular-nums text-neutral-500">
            {data.connections.length}건
          </span>
        </div>
        {data.connections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-800 bg-black/20 px-3 py-8 text-center">
            <Link2 className="mx-auto mb-1.5 h-4 w-4 text-neutral-600" />
            <p className="text-[11px] text-neutral-500">
              아직 연결이 없습니다. 두 카드를 이어 나만의 가설을 만들어 보세요.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {data.connections.map((c) => {
              const fromMeta = KIND_META[c.from.kind];
              const toMeta = KIND_META[c.to.kind];
              const FromIcon = fromMeta.icon;
              const ToIcon = toMeta.icon;
              const editing = editingMemoId === c.id;
              return (
                <li
                  key={c.id}
                  className="rounded-lg border border-neutral-800/70 bg-black/25 p-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 ${fromMeta.tone}`}
                    >
                      <FromIcon className="h-3 w-3" />
                      <span className="max-w-[10rem] truncate">
                        {labelOf(c.from)}
                      </span>
                    </span>
                    <ArrowRight className="h-3 w-3 text-neutral-500" />
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 ${toMeta.tone}`}
                    >
                      <ToIcon className="h-3 w-3" />
                      <span className="max-w-[10rem] truncate">
                        {labelOf(c.to)}
                      </span>
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingMemoId(editing ? null : c.id)
                        }
                        className="rounded-md border border-neutral-800 bg-neutral-900/60 p-1 text-neutral-400 transition hover:text-neutral-100"
                        aria-label="메모 편집"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeConnection(c.id)}
                        className="rounded-md border border-neutral-800 bg-neutral-900/60 p-1 text-neutral-400 transition hover:text-rose-300"
                        aria-label="연결 삭제"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {(editing || c.memo) && (
                    <div className="mt-2">
                      {editing ? (
                        <div>
                          <textarea
                            autoFocus
                            value={c.memo ?? ""}
                            onChange={(e) =>
                              updateMemo(c.id, e.target.value)
                            }
                            maxLength={MEMO_MAX}
                            rows={2}
                            placeholder="이 연결에 대한 메모 (최대 100자)"
                            className="w-full resize-none rounded-md border border-neutral-800 bg-black/40 px-2 py-1.5 text-[12px] text-neutral-100 placeholder:text-neutral-600 focus:border-primary/60 focus:outline-none"
                          />
                          <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500">
                            <span>{(c.memo ?? "").length}/{MEMO_MAX}</span>
                            <button
                              type="button"
                              onClick={() => setEditingMemoId(null)}
                              className="text-neutral-300 hover:text-neutral-100"
                            >
                              완료
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="rounded-md border border-neutral-900 bg-black/30 px-2 py-1 text-[11px] italic text-neutral-300">
                          {c.memo}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-[10px] leading-relaxed text-neutral-500">
        추리 보드는 당신만의 작업 공간입니다. 잘못된 연결도 자유롭게 만들 수 있으며, 게임은 정답 여부를 판단하지 않습니다.
      </p>
    </div>
  );
}
