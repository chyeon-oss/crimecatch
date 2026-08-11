import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Fingerprint,
  HelpCircle,
  Link2,
  Pencil,
  Trash2,
  User,
  X,
  ListTree,
  LayoutGrid,
} from "lucide-react";
import {
  RELATIONS,
  RELATION_META,
  findConnection,
  linkIndex,
  linksFor,
  relationLabel,
  relationTone,
  sameEndpoint,
  useDetectiveBoard,
  type BoardEndpoint,
  type BoardNodeKind,
  type BoardRelation,
  type DetectiveBoardConnection,
} from "@/lib/detectiveBoard";
import type { BoardItem } from "@/components/DetectiveBoard";

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
    tone: "border-amber-400/40 bg-amber-500/5",
    accent: "text-amber-300",
  },
  question: {
    label: "의문",
    icon: HelpCircle,
    tone: "border-sky-400/40 bg-sky-500/5",
    accent: "text-sky-300",
  },
  suspect: {
    label: "용의자",
    icon: User,
    tone: "border-rose-400/40 bg-rose-500/5",
    accent: "text-rose-300",
  },
};

/** Clears the fixed tab bar plus the device safe area. */
const SHEET_PAD = "calc(84px + env(safe-area-inset-bottom))";

type Filter = "all" | BoardNodeKind;
type View = "cards" | "links";

export function MobileLinkBoard({
  caseId,
  evidence,
  questions,
  suspects,
}: Props) {
  const { data, addConnection, updateRelation, removeConnection } =
    useDetectiveBoard(caseId);

  const [view, setView] = useState<View>("cards");
  const [filter, setFilter] = useState<Filter>("all");
  const [source, setSource] = useState<BoardEndpoint | null>(null);
  const [linking, setLinking] = useState(false);
  const [detail, setDetail] = useState<BoardEndpoint | null>(null);
  const [pendingTarget, setPendingTarget] = useState<BoardEndpoint | null>(null);
  const [openLinkId, setOpenLinkId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const cards = useMemo(() => {
    const rows: { ep: BoardEndpoint; item: BoardItem }[] = [];
    for (const e of evidence) rows.push({ ep: { kind: "evidence", id: e.id }, item: e });
    for (const q of questions) rows.push({ ep: { kind: "question", id: q.id }, item: q });
    for (const s of suspects) rows.push({ ep: { kind: "suspect", id: s.id }, item: s });
    return rows;
  }, [evidence, questions, suspects]);

  const itemOf = useCallback(
    (ep: BoardEndpoint): BoardItem | undefined =>
      cards.find((r) => sameEndpoint(r.ep, ep))?.item,
    [cards],
  );
  const labelOf = useCallback(
    (ep: BoardEndpoint) => itemOf(ep)?.label ?? "(삭제된 항목)",
    [itemOf],
  );

  const visible = useMemo(
    () => (filter === "all" ? cards : cards.filter((r) => r.ep.kind === filter)),
    [cards, filter],
  );

  const exitLinking = useCallback(() => {
    setLinking(false);
    setPendingTarget(null);
    setSource(null);
  }, []);

  // Escape leaves link mode without mutating anything.
  useEffect(() => {
    if (!linking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pendingTarget) exitLinking();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [linking, pendingTarget, exitLinking]);

  const onCardTap = (ep: BoardEndpoint) => {
    if (linking) {
      if (!source || sameEndpoint(source, ep)) return;
      const existing = findConnection(data, source, ep);
      if (existing) {
        // Duplicate pair — open/edit the existing link instead.
        setLinking(false);
        setSource(null);
        setOpenLinkId(existing.id);
        setEditingLinkId(existing.id);
        return;
      }
      setPendingTarget(ep);
      return;
    }
    setDetail(ep);
  };

  const confirmRelation = (relation: BoardRelation) => {
    if (!source || !pendingTarget) return;
    addConnection(source, pendingTarget, relation);
    exitLinking();
  };

  const openLink = data.connections.find((c) => c.id === openLinkId) ?? null;

  return (
    <div className="space-y-3" data-testid="mobile-link-board">
      {/* View switch */}
      <div className="flex items-center gap-2">
        <SegBtn
          active={view === "cards"}
          onClick={() => setView("cards")}
          icon={LayoutGrid}
          testId="board-view-cards"
        >
          카드
        </SegBtn>
        <SegBtn
          active={view === "links"}
          onClick={() => setView("links")}
          icon={ListTree}
          testId="board-view-links"
        >
          내 연결 {data.connections.length > 0 && `· ${data.connections.length}`}
        </SegBtn>
      </div>

      {view === "cards" ? (
        <>
          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            {(["all", "evidence", "question", "suspect"] as Filter[]).map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={active}
                  className={`min-h-11 rounded-full border px-3.5 text-[12px] transition ${
                    active
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border/60 bg-surface-elevated text-muted-foreground"
                  }`}
                >
                  {f === "all" ? "전체" : KIND_META[f].label}
                </button>
              );
            })}
          </div>

          {/* Link-target mode banner */}
          {linking && source && (
            <div
              role="status"
              aria-live="polite"
              data-testid="link-mode-banner"
              className="rounded-lg border border-primary/50 bg-primary/10 p-3"
            >
              <p className="text-[12px] text-primary">
                <span className="font-semibold">{labelOf(source)}</span>
                와 연결할 카드를 하나 선택하세요.
              </p>
              <button
                type="button"
                onClick={exitLinking}
                data-testid="link-mode-cancel"
                className="mt-2 min-h-11 w-full rounded-md border border-border/60 bg-background/60 px-3 text-[12px] text-muted-foreground"
              >
                연결 취소
              </button>
            </div>
          )}

          <ul className="space-y-2">
            {visible.map(({ ep, item }) => {
              const meta = KIND_META[ep.kind];
              const Icon = meta.icon;
              const isSource = source ? sameEndpoint(source, ep) : false;
              const invalid = linking && isSource;
              const myLinks = linksFor(data, ep);
              return (
                <li key={`${ep.kind}:${ep.id}`}>
                  <button
                    type="button"
                    disabled={invalid}
                    onClick={() => onCardTap(ep)}
                    data-testid={`board-card-${ep.kind}-${ep.id}`}
                    aria-label={`${meta.label} ${item.label}`}
                    aria-selected={isSource}
                    aria-disabled={invalid}
                    className={`w-full min-h-11 rounded-lg border px-3 py-3 text-left transition ${
                      isSource
                        ? "border-primary bg-primary/15 ring-1 ring-primary"
                        : linking
                          ? "border-emerald-400/60 bg-emerald-500/10"
                          : meta.tone
                    } ${invalid ? "opacity-35" : ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.accent}`} />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {meta.label}
                      </span>
                      {myLinks.length > 0 && (
                        <span className="ml-auto flex shrink-0 items-center gap-1">
                          {myLinks.slice(0, 3).map((l) => (
                            <LinkBadge
                              key={l.id}
                              n={linkIndex(data, l.id)}
                              relation={l.relation}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-foreground">
                      {item.label}
                    </p>
                    {item.sublabel && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {item.sublabel}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="rounded-lg border border-dashed border-border/60 px-3 py-8 text-center text-[12px] text-muted-foreground">
                해당 분류의 카드가 아직 없습니다.
              </li>
            )}
          </ul>
        </>
      ) : (
        <ul className="space-y-2" data-testid="board-link-list">
          {data.connections.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setOpenLinkId(c.id)}
                data-testid={`board-link-${c.id}`}
                className="w-full min-h-11 rounded-lg border border-border/60 bg-surface-elevated px-3 py-3 text-left"
              >
                <p className="text-[12px] leading-relaxed text-foreground">
                  <LinkBadge n={linkIndex(data, c.id)} relation={c.relation} />{" "}
                  <span className="align-middle">{labelOf(c.from)}</span>
                  <span className="mx-1 align-middle text-muted-foreground">
                    ↔
                  </span>
                  <span className="align-middle">{labelOf(c.to)}</span>
                  <span className="align-middle text-muted-foreground">
                    {" · "}
                    {relationLabel(c.relation)}
                  </span>
                </p>
              </button>
            </li>
          ))}
          {data.connections.length === 0 && (
            <li className="rounded-lg border border-dashed border-border/60 px-3 py-8 text-center text-[12px] text-muted-foreground">
              아직 연결이 없습니다. 카드를 눌러 «단서 연결»을 시작하세요.
            </li>
          )}
        </ul>
      )}

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        추리 보드는 당신만의 작업 공간입니다. 잘못된 연결도 자유롭게 만들 수 있으며, 게임은 정답 여부를 판단하지 않습니다.
      </p>

      {/* Card detail sheet */}
      {detail && (
        <Sheet
          title={KIND_META[detail.kind].label}
          onClose={() => setDetail(null)}
          testId="board-card-sheet"
        >
          <p className="text-[14px] leading-snug text-foreground">
            {labelOf(detail)}
          </p>
          {itemOf(detail)?.sublabel && (
            <p className="mt-1 text-[12px] text-muted-foreground">
              {itemOf(detail)!.sublabel}
            </p>
          )}
          {linksFor(data, detail).length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {linksFor(data, detail).map((l) => {
                const other = sameEndpoint(l.from, detail) ? l.to : l.from;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setDetail(null);
                        setOpenLinkId(l.id);
                      }}
                      className={`flex min-h-11 w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-[12px] ${relationTone(l.relation)}`}
                    >
                      <LinkBadge n={linkIndex(data, l.id)} relation={l.relation} />
                      <span className="min-w-0 flex-1 truncate">
                        {labelOf(other)}
                      </span>
                      <span className="shrink-0 text-[11px] opacity-80">
                        {relationLabel(l.relation)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            data-testid="board-start-link"
            onClick={() => {
              setSource(detail);
              setLinking(true);
              setView("cards");
              setDetail(null);
            }}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-primary/60 bg-primary/15 px-3 text-[13px] font-medium text-primary"
          >
            <Link2 className="h-4 w-4" />
            단서 연결
          </button>
        </Sheet>
      )}

      {/* Relation picker for a new link */}
      {pendingTarget && source && (
        <Sheet
          title="관계 선택"
          onClose={() => setPendingTarget(null)}
          testId="relation-sheet"
        >
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            <span className="text-foreground">{labelOf(source)}</span> ↔{" "}
            <span className="text-foreground">{labelOf(pendingTarget)}</span>
          </p>
          <div
            role="radiogroup"
            aria-label="관계 선택"
            className="mt-3 space-y-1.5"
          >
            {RELATIONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={false}
                data-testid={`relation-${r}`}
                onClick={() => confirmRelation(r)}
                className={`flex min-h-11 w-full items-center gap-2 rounded-md border px-3 text-left text-[13px] ${RELATION_META[r].tone}`}
              >
                <span className={`h-2 w-2 rounded-full ${RELATION_META[r].dot}`} />
                {RELATION_META[r].label}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {/* Saved link detail / edit / delete */}
      {openLink && (
        <Sheet
          title={`연결 ${linkIndex(data, openLink.id)}`}
          onClose={() => {
            setOpenLinkId(null);
            setEditingLinkId(null);
            setConfirmDeleteId(null);
          }}
          testId="board-link-sheet"
        >
          <div className="space-y-2">
            <EndpointRow ep={openLink.from} label={labelOf(openLink.from)} sub={itemOf(openLink.from)?.sublabel} />
            <p
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${relationTone(openLink.relation)}`}
              data-testid="board-link-relation"
            >
              {relationLabel(openLink.relation)}
            </p>
            <EndpointRow ep={openLink.to} label={labelOf(openLink.to)} sub={itemOf(openLink.to)?.sublabel} />
          </div>

          {editingLinkId === openLink.id ? (
            <div
              role="radiogroup"
              aria-label="관계 변경"
              className="mt-4 space-y-1.5"
            >
              {RELATIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={openLink.relation === r}
                  data-testid={`edit-relation-${r}`}
                  onClick={() => {
                    updateRelation(openLink.id, r);
                    setEditingLinkId(null);
                  }}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-md border px-3 text-left text-[13px] ${RELATION_META[r].tone} ${
                    openLink.relation === r ? "ring-1 ring-primary" : ""
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${RELATION_META[r].dot}`} />
                  {RELATION_META[r].label}
                </button>
              ))}
            </div>
          ) : confirmDeleteId === openLink.id ? (
            <div className="mt-4 space-y-2">
              <p className="text-[12px] text-rose-200">
                이 연결을 삭제할까요? 되돌릴 수 없습니다.
              </p>
              <button
                type="button"
                data-testid="board-link-delete-confirm"
                onClick={() => {
                  removeConnection(openLink.id);
                  setConfirmDeleteId(null);
                  setOpenLinkId(null);
                }}
                className="min-h-11 w-full rounded-md border border-rose-400/60 bg-rose-500/15 px-3 text-[13px] text-rose-100"
              >
                삭제 확인
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="min-h-11 w-full rounded-md border border-border/60 px-3 text-[13px] text-muted-foreground"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                data-testid="board-link-edit"
                onClick={() => setEditingLinkId(openLink.id)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-border/60 bg-surface-elevated px-3 text-[13px] text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
                관계 수정
              </button>
              <button
                type="button"
                data-testid="board-link-delete"
                onClick={() => setConfirmDeleteId(openLink.id)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-rose-400/40 px-3 text-[13px] text-rose-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            </div>
          )}
        </Sheet>
      )}
    </div>
  );
}

function EndpointRow({
  ep,
  label,
  sub,
}: {
  ep: BoardEndpoint;
  label: string;
  sub?: string;
}) {
  const meta = KIND_META[ep.kind];
  const Icon = meta.icon;
  return (
    <div className={`rounded-md border px-3 py-2 ${meta.tone}`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${meta.accent}`} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {meta.label}
        </span>
      </div>
      <p className="mt-0.5 text-[13px] leading-snug text-foreground">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function LinkBadge({ n, relation }: { n: number; relation?: BoardRelation }) {
  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-full border px-1.5 text-[10px] tabular-nums ${relationTone(relation)}`}
      aria-label={`연결 ${n} · ${relationLabel(relation)}`}
    >
      {n}
    </span>
  );
}

function SegBtn({
  active,
  onClick,
  icon: Icon,
  children,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-testid={testId}
      className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border px-3 text-[12px] transition ${
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border/60 bg-surface-elevated text-muted-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function Sheet({
  title,
  onClose,
  children,
  testId,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  testId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end" data-testid={testId}>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative z-10 max-h-[76vh] w-full animate-fade-in overflow-y-auto rounded-t-2xl border-t border-border/60 bg-[#0f1117] px-4 pt-4 outline-none"
        style={{ paddingBottom: SHEET_PAD }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            data-testid={`${testId}-close`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border/60 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
