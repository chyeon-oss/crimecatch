import { useMemo, useState } from "react";
import { Plus, X, Link2, Fingerprint, User, Clock } from "lucide-react";
import type { BoardState, Case, Evidence, BoardPinKind } from "@/types";
import { BoardEngine } from "@/engine";

interface Props {
  case: Case;
  state: BoardState;
  onChange: (next: BoardState) => void;
  discoveredEvidenceIds: Set<string>;
}

const COLS = 3;
const CELL_W = 200;
const CELL_H = 120;
const GAP = 16;
const PAD = 16;

const toneClasses: Record<
  "evidence" | "suspect" | "timeline",
  { border: string; bg: string; icon: string; label: string }
> = {
  evidence: {
    border: "border-amber-500/50",
    bg: "bg-amber-500/10",
    icon: "text-amber-300",
    label: "증거",
  },
  suspect: {
    border: "border-rose-500/50",
    bg: "bg-rose-500/10",
    icon: "text-rose-300",
    label: "용의자",
  },
  timeline: {
    border: "border-sky-500/50",
    bg: "bg-sky-500/10",
    icon: "text-sky-300",
    label: "시간대",
  },
};

const iconFor = (kind: BoardPinKind) =>
  kind === "evidence" ? Fingerprint : kind === "suspect" ? User : Clock;

export function InvestigationBoard({
  case: c,
  state,
  onChange,
  discoveredEvidenceIds,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState<BoardPinKind | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const discoveredEvidence: Evidence[] = useMemo(
    () => c.evidence.filter((e) => discoveredEvidenceIds.has(e.id)),
    [c.evidence, discoveredEvidenceIds],
  );

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    state.pins.forEach((p, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      map.set(p.id, {
        x: PAD + col * (CELL_W + GAP) + CELL_W / 2,
        y: PAD + row * (CELL_H + GAP) + CELL_H / 2,
      });
    });
    return map;
  }, [state.pins]);

  const rows = Math.max(1, Math.ceil(state.pins.length / COLS));
  const boardWidth = PAD * 2 + COLS * CELL_W + (COLS - 1) * GAP;
  const boardHeight = PAD * 2 + rows * CELL_H + (rows - 1) * GAP;

  const pinCard = (pinId: string) => {
    const pin = state.pins.find((p) => p.id === pinId);
    if (!pin) return null;
    const label = BoardEngine.labelFor(pin, c);
    if (!label) return null;
    const tone = toneClasses[label.tone];
    const Icon = iconFor(pin.kind);
    const isSelected = selectedPinId === pinId;

    return (
      <div
        key={pin.id}
        className={`group absolute rounded-lg border ${tone.border} ${tone.bg} p-2.5 shadow-sm backdrop-blur-sm transition ${
          isSelected
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
            : "hover:border-primary/60"
        }`}
        style={{
          width: CELL_W,
          height: CELL_H,
          left: (positions.get(pin.id)?.x ?? 0) - CELL_W / 2,
          top: (positions.get(pin.id)?.y ?? 0) - CELL_H / 2,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Icon className={`h-3.5 w-3.5 ${tone.icon}`} />
            <span
              className={`text-[9px] font-semibold uppercase tracking-widest ${tone.icon}`}
            >
              {tone.label}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (selectedPinId === pin.id) setSelectedPinId(null);
              onChange(BoardEngine.removePin(state, pin.id));
            }}
            className="rounded p-0.5 text-muted-foreground opacity-0 transition hover:bg-background/60 hover:text-foreground group-hover:opacity-100"
            aria-label="핀 제거"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
          {label.title}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
          {label.subtitle}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!selectedPinId) {
              setSelectedPinId(pin.id);
              return;
            }
            if (selectedPinId === pin.id) {
              setSelectedPinId(null);
              return;
            }
            onChange(BoardEngine.connect(state, selectedPinId, pin.id));
            setSelectedPinId(null);
          }}
          className={`absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] transition ${
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 className="h-2.5 w-2.5" />
          {isSelected ? "대상 선택" : "연결"}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {(["evidence", "suspect", "timeline"] as BoardPinKind[]).map((k) => {
          const tone = toneClasses[k === "evidence" ? "evidence" : k === "suspect" ? "suspect" : "timeline"];
          const Icon = iconFor(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => setPickerOpen(pickerOpen === k ? null : k)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                pickerOpen === k
                  ? `${tone.border} ${tone.bg} ${tone.icon}`
                  : "border-border/60 bg-surface-elevated text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="h-3 w-3" />
              <Icon className="h-3 w-3" />
              {tone.label} 핀
            </button>
          );
        })}
        {selectedPinId && (
          <span className="ml-auto text-[11px] text-primary">
            연결할 다른 핀을 선택하세요 ·{" "}
            <button
              type="button"
              onClick={() => setSelectedPinId(null)}
              className="underline underline-offset-2"
            >
              취소
            </button>
          </span>
        )}
      </div>

      {/* Picker */}
      {pickerOpen && (
        <PinPicker
          kind={pickerOpen}
          c={c}
          discoveredEvidence={discoveredEvidence}
          alreadyPinned={(kind, refId) =>
            state.pins.some((p) => p.kind === kind && p.refId === refId)
          }
          onPick={(refId) => {
            onChange(BoardEngine.addPin(state, pickerOpen, refId));
            setPickerOpen(null);
          }}
          onClose={() => setPickerOpen(null)}
        />
      )}

      {/* Board */}
      <div
        className="relative overflow-auto rounded-xl border border-border/70 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:16px_16px]"
        style={{ minHeight: 220 }}
      >
        {state.pins.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              보드가 비어 있습니다.
            </p>
            <p className="text-[11px] text-muted-foreground">
              위 도구로 증거·용의자·시간대를 핀 하세요.
            </p>
          </div>
        ) : (
          <div
            className="relative"
            style={{ width: boardWidth, height: boardHeight }}
          >
            {/* Connections layer */}
            <svg
              className="pointer-events-none absolute inset-0"
              width={boardWidth}
              height={boardHeight}
            >
              {state.connections.map((conn) => {
                const a = positions.get(conn.fromPinId);
                const b = positions.get(conn.toPinId);
                if (!a || !b) return null;
                return (
                  <g key={conn.id}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="rgb(239 68 68 / 0.55)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                    <circle cx={a.x} cy={a.y} r={3} fill="rgb(239 68 68)" />
                    <circle cx={b.x} cy={b.y} r={3} fill="rgb(239 68 68)" />
                  </g>
                );
              })}
            </svg>

            {/* Pin cards */}
            {state.pins.map((p) => pinCard(p.id))}
          </div>
        )}
      </div>

      {/* Connection list */}
      {state.connections.length > 0 && (
        <ul className="space-y-1">
          {state.connections.map((conn) => {
            const from = state.pins.find((p) => p.id === conn.fromPinId);
            const to = state.pins.find((p) => p.id === conn.toPinId);
            const fromLabel = from ? BoardEngine.labelFor(from, c) : null;
            const toLabel = to ? BoardEngine.labelFor(to, c) : null;
            if (!fromLabel || !toLabel) return null;
            return (
              <li
                key={conn.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-surface-elevated/40 px-2.5 py-1.5 text-[11px]"
              >
                <span className="truncate text-muted-foreground">
                  <span className="text-foreground">{fromLabel.title}</span>
                  {"  ↔  "}
                  <span className="text-foreground">{toLabel.title}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(BoardEngine.removeConnection(state, conn.id))
                  }
                  className="rounded p-0.5 text-muted-foreground hover:text-rose-400"
                  aria-label="연결 삭제"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface PickerProps {
  kind: BoardPinKind;
  c: Case;
  discoveredEvidence: Evidence[];
  alreadyPinned: (kind: BoardPinKind, refId: string) => boolean;
  onPick: (refId: string) => void;
  onClose: () => void;
}

function PinPicker({
  kind,
  c,
  discoveredEvidence,
  alreadyPinned,
  onPick,
}: PickerProps) {
  const items: { refId: string; title: string; sub: string }[] =
    kind === "evidence"
      ? discoveredEvidence.map((e) => ({
          refId: e.id,
          title: e.title,
          sub: e.category,
        }))
      : kind === "suspect"
        ? c.suspects.map((s) => ({
            refId: s.id,
            title: s.name,
            sub: s.occupation,
          }))
        : c.timeline.map((t) => ({
            refId: t.time,
            title: t.time,
            sub: t.description,
          }));

  return (
    <div className="rounded-lg border border-border/60 bg-surface-elevated/70 p-2">
      {items.length === 0 ? (
        <p className="p-3 text-center text-[11px] text-muted-foreground">
          아직 보드에 올릴 항목이 없습니다.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {items.map((it) => {
            const pinned = alreadyPinned(kind, it.refId);
            return (
              <li key={it.refId}>
                <button
                  type="button"
                  disabled={pinned}
                  onClick={() => onPick(it.refId)}
                  className="flex w-full items-start gap-2 rounded-md border border-border/40 bg-background/40 p-2 text-left text-xs transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">{it.title}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {it.sub}
                    </p>
                  </div>
                  {pinned && (
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      핀됨
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
}
