import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  Plus,
  X,
  Link2,
  Fingerprint,
  User,
  Clock,
  MapPin,
  StickyNote,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Move,
  Trash2,
  Pencil,
} from "lucide-react";
import type { BoardState, Case, Evidence, BoardPinKind } from "@/types";
import { BoardEngine } from "@/engine";

interface Props {
  case: Case;
  state: BoardState;
  onChange: (next: BoardState) => void;
  discoveredEvidenceIds: Set<string>;
}

const CARD_W = 208;
const CARD_H = 116;

const tones: Record<
  "evidence" | "suspect" | "timeline" | "location",
  { border: string; bg: string; icon: string; label: string; stroke: string }
> = {
  evidence: {
    border: "border-amber-400/60",
    bg: "bg-amber-500/10",
    icon: "text-amber-300",
    label: "증거",
    stroke: "rgb(251 191 36)",
  },
  suspect: {
    border: "border-rose-400/60",
    bg: "bg-rose-500/10",
    icon: "text-rose-300",
    label: "용의자",
    stroke: "rgb(251 113 133)",
  },
  timeline: {
    border: "border-sky-400/60",
    bg: "bg-sky-500/10",
    icon: "text-sky-300",
    label: "시간대",
    stroke: "rgb(56 189 248)",
  },
  location: {
    border: "border-emerald-400/60",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-300",
    label: "장소",
    stroke: "rgb(52 211 153)",
  },
};

const iconFor = (kind: BoardPinKind) =>
  kind === "evidence"
    ? Fingerprint
    : kind === "suspect"
      ? User
      : kind === "location"
        ? MapPin
        : Clock;

const NOTE_TINTS = [
  "bg-[#fef3c7] text-[#3f3011]",
  "bg-[#fecaca] text-[#3f0f0f]",
  "bg-[#bae6fd] text-[#0c2540]",
  "bg-[#bbf7d0] text-[#0f2e1c]",
];

interface Vec {
  x: number;
  y: number;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export function InvestigationBoard({
  case: c,
  state,
  onChange,
  discoveredEvidenceIds,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState<BoardPinKind | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [editingConnId, setEditingConnId] = useState<string | null>(null);

  // Camera: pan (tx, ty) and zoom
  const [cam, setCam] = useState({ tx: 0, ty: 0, z: 1 });

  // Drag state
  const dragRef = useRef<{
    mode: "pan" | "pin" | "note";
    id?: string;
    startClient: Vec;
    startVal: Vec;
    startCam?: Vec;
  } | null>(null);

  const discoveredEvidence: Evidence[] = useMemo(
    () => c.evidence.filter((e) => discoveredEvidenceIds.has(e.id)),
    [c.evidence, discoveredEvidenceIds],
  );

  const notes = state.notes ?? [];

  // Pin position resolver (supports legacy pins without x/y)
  const pinPos = useCallback(
    (id: string): Vec => {
      const p = state.pins.find((x) => x.id === id);
      if (!p) return { x: 0, y: 0 };
      if (typeof p.x === "number" && typeof p.y === "number") {
        return { x: p.x, y: p.y };
      }
      const i = state.pins.findIndex((x) => x.id === id);
      return { x: 240 + (i * 173) % 320, y: 200 + (i * 211) % 320 };
    },
    [state.pins],
  );

  // Screen → world coords
  const toWorld = useCallback(
    (clientX: number, clientY: number): Vec => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - cam.tx) / cam.z,
        y: (clientY - rect.top - cam.ty) / cam.z,
      };
    },
    [cam],
  );

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      setCam((prev) => {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return prev;
        const nz = clamp(prev.z * factor, 0.35, 2.4);
        const px = clientX - rect.left;
        const py = clientY - rect.top;
        const wx = (px - prev.tx) / prev.z;
        const wy = (py - prev.ty) / prev.z;
        return { z: nz, tx: px - wx * nz, ty: py - wy * nz };
      });
    },
    [],
  );

  const onWheel = (e: ReactWheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      // still allow trackpad pinch (ctrlKey true) and simple wheel zoom
    }
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0015);
    zoomAt(e.clientX, e.clientY, factor);
  };

  // Pointer handlers
  const onViewportPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    // Ignore drags that start inside a pin/note (they set their own handlers).
    const target = e.target as HTMLElement;
    if (target.closest("[data-board-node]")) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      mode: "pan",
      startClient: { x: e.clientX, y: e.clientY },
      startVal: { x: 0, y: 0 },
      startCam: { x: cam.tx, y: cam.ty },
    };
    setSelectedPinId(null);
    setEditingConnId(null);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.mode === "pan" && d.startCam) {
      const dx = e.clientX - d.startClient.x;
      const dy = e.clientY - d.startClient.y;
      setCam((prev) => ({ ...prev, tx: d.startCam!.x + dx, ty: d.startCam!.y + dy }));
    } else if (d.mode === "pin" && d.id) {
      const dx = (e.clientX - d.startClient.x) / cam.z;
      const dy = (e.clientY - d.startClient.y) / cam.z;
      onChange(
        BoardEngine.movePin(state, d.id, d.startVal.x + dx, d.startVal.y + dy),
      );
    } else if (d.mode === "note" && d.id) {
      const dx = (e.clientX - d.startClient.x) / cam.z;
      const dy = (e.clientY - d.startClient.y) / cam.z;
      onChange(
        BoardEngine.moveNote(state, d.id, d.startVal.x + dx, d.startVal.y + dy),
      );
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch { /* noop */ }
    }
    dragRef.current = null;
  };

  // Start a pin drag
  const beginPinDrag = (e: ReactPointerEvent<HTMLDivElement>, pinId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const p = pinPos(pinId);
    dragRef.current = {
      mode: "pin",
      id: pinId,
      startClient: { x: e.clientX, y: e.clientY },
      startVal: { x: p.x, y: p.y },
    };
    // capture on viewport for smooth tracking
    viewportRef.current?.setPointerCapture(e.pointerId);
  };

  const beginNoteDrag = (
    e: ReactPointerEvent<HTMLDivElement>,
    noteId: string,
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const n = notes.find((x) => x.id === noteId);
    if (!n) return;
    dragRef.current = {
      mode: "note",
      id: noteId,
      startClient: { x: e.clientX, y: e.clientY },
      startVal: { x: n.x, y: n.y },
    };
    viewportRef.current?.setPointerCapture(e.pointerId);
  };

  const fitView = () => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const all: Vec[] = [
      ...state.pins.map((p) => pinPos(p.id)),
      ...notes.map((n) => ({ x: n.x, y: n.y })),
    ];
    if (all.length === 0) {
      setCam({ tx: rect.width / 2 - 240, ty: rect.height / 2 - 180, z: 1 });
      return;
    }
    const minX = Math.min(...all.map((p) => p.x)) - CARD_W / 2 - 40;
    const maxX = Math.max(...all.map((p) => p.x)) + CARD_W / 2 + 40;
    const minY = Math.min(...all.map((p) => p.y)) - CARD_H / 2 - 40;
    const maxY = Math.max(...all.map((p) => p.y)) + CARD_H / 2 + 40;
    const w = maxX - minX;
    const h = maxY - minY;
    const z = clamp(Math.min(rect.width / w, rect.height / h), 0.4, 1.6);
    setCam({
      tx: rect.width / 2 - ((minX + maxX) / 2) * z,
      ty: rect.height / 2 - ((minY + maxY) / 2) * z,
      z,
    });
  };

  // Initial fit
  useEffect(() => {
    const t = setTimeout(fitView, 30);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a handwritten note at viewport center
  const addNoteAtCenter = () => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const w = toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
    onChange(
      BoardEngine.addNote(state, { x: w.x - 90, y: w.y - 60, text: "" }),
    );
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {(["evidence", "suspect", "location", "timeline"] as BoardPinKind[]).map(
          (k) => {
            const tone = tones[k];
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
                {tone.label}
              </button>
            );
          },
        )}
        <button
          type="button"
          onClick={addNoteAtCenter}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-elevated px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <StickyNote className="h-3 w-3" />
          메모
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="축소"
            onClick={() => {
              const r = viewportRef.current?.getBoundingClientRect();
              if (r) zoomAt(r.left + r.width / 2, r.top + r.height / 2, 0.85);
            }}
            className="rounded-md border border-border/60 bg-surface-elevated p-1.5 text-muted-foreground transition hover:text-foreground"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-[10px] tabular-nums text-muted-foreground">
            {Math.round(cam.z * 100)}%
          </span>
          <button
            type="button"
            aria-label="확대"
            onClick={() => {
              const r = viewportRef.current?.getBoundingClientRect();
              if (r) zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.18);
            }}
            className="rounded-md border border-border/60 bg-surface-elevated p-1.5 text-muted-foreground transition hover:text-foreground"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="화면에 맞추기"
            onClick={fitView}
            className="rounded-md border border-border/60 bg-surface-elevated p-1.5 text-muted-foreground transition hover:text-foreground"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {selectedPinId && (
        <div className="rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1 text-[11px] text-primary">
          연결할 다른 핀을 선택하세요 ·{" "}
          <button
            type="button"
            onClick={() => setSelectedPinId(null)}
            className="underline underline-offset-2"
          >
            취소
          </button>
        </div>
      )}

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
            const rect = viewportRef.current?.getBoundingClientRect();
            const spawn = rect
              ? toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2)
              : undefined;
            onChange(BoardEngine.addPin(state, pickerOpen, refId, spawn));
            setPickerOpen(null);
          }}
          onClose={() => setPickerOpen(null)}
        />
      )}

      {/* Board viewport */}
      <div
        ref={viewportRef}
        onPointerDown={onViewportPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        className="relative h-[520px] w-full cursor-grab overflow-hidden rounded-xl border border-border/70 bg-[#0b0e17] shadow-inner active:cursor-grabbing"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0), linear-gradient(180deg, rgba(20,24,36,0.6), rgba(8,10,16,0.9))",
          backgroundSize: "22px 22px, 100% 100%",
        }}
      >
        {/* Corkboard fibres overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #b58863 0 2px, transparent 2px 6px)",
          }}
        />

        {state.pins.length === 0 && notes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <Move className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              보드가 비어 있습니다
            </p>
            <p className="text-[11px] text-muted-foreground">
              상단 도구로 핀·메모를 배치하세요 · 휠 확대 · 드래그 이동
            </p>
          </div>
        )}

        {/* World layer */}
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            transform: `translate3d(${cam.tx}px, ${cam.ty}px, 0) scale(${cam.z})`,
            transformOrigin: "0 0",
            transition: dragRef.current ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
        >
          {/* SVG connections layer (world coords) */}
          <svg
            className="pointer-events-none absolute"
            style={{ left: -4000, top: -4000, width: 8000, height: 8000, overflow: "visible" }}
          >
            <defs>
              <filter id="thread-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {state.connections.map((conn) => {
              const a = pinPos(conn.fromPinId);
              const b = pinPos(conn.toPinId);
              const from = state.pins.find((p) => p.id === conn.fromPinId);
              const to = state.pins.find((p) => p.id === conn.toPinId);
              if (!from || !to) return null;
              // offset by SVG bias
              const ax = a.x + 4000;
              const ay = a.y + 4000;
              const bx = b.x + 4000;
              const by = b.y + 4000;
              const mx = (ax + bx) / 2;
              const my = (ay + by) / 2;
              const stroke = tones[from.kind === to.kind ? from.kind : "evidence"].stroke;
              return (
                <g key={conn.id} className="pointer-events-auto">
                  <line
                    x1={ax}
                    y1={ay}
                    x2={bx}
                    y2={by}
                    stroke="rgba(220,38,38,0.75)"
                    strokeWidth={1.6}
                    strokeDasharray="6 5"
                    filter="url(#thread-glow)"
                  />
                  <circle cx={ax} cy={ay} r={4} fill="rgba(220,38,38,0.9)" />
                  <circle cx={bx} cy={by} r={4} fill={stroke} />
                  {/* Label chip */}
                  <foreignObject
                    x={mx - 70}
                    y={my - 14}
                    width={140}
                    height={28}
                    style={{ overflow: "visible" }}
                  >
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConnId(
                            editingConnId === conn.id ? null : conn.id,
                          );
                        }}
                        className="pointer-events-auto max-w-[130px] truncate rounded-full border border-rose-400/40 bg-[#12111a] px-2 py-0.5 text-[10px] text-rose-100/90 shadow-md backdrop-blur transition hover:border-rose-300"
                      >
                        {conn.label || "라벨 추가"}
                      </button>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Notes */}
          {notes.map((n) => (
            <div
              key={n.id}
              data-board-node
              onPointerDown={(e) => beginNoteDrag(e, n.id)}
              className={`absolute w-[184px] select-none rounded-[3px] p-3 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-black/10 ${NOTE_TINTS[n.tint ?? 0]}`}
              style={{
                left: n.x,
                top: n.y,
                transform: "rotate(-1.2deg)",
                fontFamily: "'Kalam', 'Caveat', cursive",
              }}
            >
              <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-rose-500 ring-2 ring-rose-300 shadow" />
              <textarea
                value={n.text}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(ev) =>
                  onChange(BoardEngine.updateNote(state, n.id, ev.target.value))
                }
                placeholder="손글씨 메모…"
                className="h-24 w-full resize-none bg-transparent text-[15px] leading-tight outline-none placeholder:opacity-40"
              />
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onChange(BoardEngine.removeNote(state, n.id))}
                className="absolute right-1 top-1 rounded p-0.5 opacity-40 transition hover:opacity-100"
                aria-label="메모 삭제"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Pins */}
          {state.pins.map((pin) => {
            const label = BoardEngine.labelFor(pin, c);
            if (!label) return null;
            const tone = tones[label.tone];
            const Icon = iconFor(pin.kind);
            const isSelected = selectedPinId === pin.id;
            const pos = pinPos(pin.id);
            return (
              <div
                key={pin.id}
                data-board-node
                onPointerDown={(e) => beginPinDrag(e, pin.id)}
                className={`group absolute select-none rounded-lg border ${tone.border} ${tone.bg} p-2.5 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-shadow ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)]"
                }`}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  left: pos.x - CARD_W / 2,
                  top: pos.y - CARD_H / 2,
                  cursor: "grab",
                }}
              >
                {/* Pushpin */}
                <div className="pointer-events-none absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-gradient-to-br from-red-400 to-red-700 shadow-[0_2px_4px_rgba(0,0,0,0.5)] ring-2 ring-red-300/70" />

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
                    onPointerDown={(e) => e.stopPropagation()}
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
                  onPointerDown={(e) => e.stopPropagation()}
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
          })}
        </div>

        {/* Connection label editor */}
        {editingConnId && (
          <ConnectionEditor
            connection={state.connections.find((c) => c.id === editingConnId)!}
            onSave={(label) => {
              onChange(
                BoardEngine.setConnectionLabel(state, editingConnId, label),
              );
              setEditingConnId(null);
            }}
            onDelete={() => {
              onChange(BoardEngine.removeConnection(state, editingConnId));
              setEditingConnId(null);
            }}
            onClose={() => setEditingConnId(null)}
          />
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">
        휠 = 확대/축소 · 빈 공간 드래그 = 이동 · 핀 드래그 = 재배치 · 라벨 클릭 = 편집
      </p>
    </div>
  );
}

interface EditorProps {
  connection: { id: string; label?: string };
  onSave: (label: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

function ConnectionEditor({ connection, onSave, onDelete, onClose }: EditorProps) {
  const [value, setValue] = useState(connection.label ?? "");
  return (
    <div className="absolute bottom-3 left-1/2 z-10 w-[320px] -translate-x-1/2 animate-fade-in rounded-lg border border-border/60 bg-[#12141d]/95 p-2.5 shadow-2xl backdrop-blur">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Pencil className="h-3 w-3" />
        연결 라벨
      </div>
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(value);
            if (e.key === "Escape") onClose();
          }}
          placeholder="예: 알리바이 모순 · 동일 지문"
          className="flex-1 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => onSave(value)}
          className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-border/60 p-1.5 text-rose-300 hover:bg-rose-500/10"
          aria-label="연결 삭제"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
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
        : kind === "location"
          ? (c.crimeScene?.hotspots ?? []).map((h) => ({
              refId: h.id,
              title: h.label,
              sub: h.hint ?? "현장 위치",
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
