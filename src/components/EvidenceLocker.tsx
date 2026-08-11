import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Camera,
  FileText,
  FlaskConical,
  Smartphone,
  Video,
  Package,
  MapPin,
  Clock,
  Tag as TagIcon,
  Circle,
  Star,
  Flame,
  Zap,
  X,
} from "lucide-react";
import type {
  Evidence,
  EvidenceCategory,
  EvidenceImportance,
  EvidenceState,
} from "@/types";
import { IntelligenceEngine } from "@/engine";

interface Props {
  evidence: Evidence[];
  discoveredAt: Map<string, number>;
  onOpen: (e: Evidence) => void;
  stateOf: (e: Evidence) => EvidenceState;
}

const CATEGORY_META: Record<
  EvidenceCategory,
  { label: string; Icon: typeof Camera }
> = {
  PHOTO: { label: "PHOTO", Icon: Camera },
  DOCUMENT: { label: "DOCUMENT", Icon: FileText },
  FORENSIC: { label: "FORENSIC", Icon: FlaskConical },
  PHONE: { label: "PHONE", Icon: Smartphone },
  CCTV: { label: "CCTV", Icon: Video },
  OBJECT: { label: "OBJECT", Icon: Package },
};

const IMPORTANCE_ICONS = { Circle, Star, Flame, Zap };
const IMPORTANCES: EvidenceImportance[] = [
  "COMMON",
  "UNCOMMON",
  "IMPORTANT",
  "CRITICAL",
];

function formatFoundTime(ts: number | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function autoTags(e: Evidence): string[] {
  if (e.tags?.length) return e.tags;
  const t: string[] = [CATEGORY_META[e.category].label];
  if (e.importance && e.importance !== "COMMON") t.push(e.importance);
  if (e.relatedSuspectIds?.length) t.push("SUSPECT-LINK");
  if (e.relatedTimelineTimes?.length) t.push("TIMELINE");
  return t;
}

export function EvidenceLocker({
  evidence,
  discoveredAt,
  onOpen,
  stateOf,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EvidenceCategory | "ALL">("ALL");
  const [location, setLocation] = useState<string>("ALL");
  const [importance, setImportance] = useState<EvidenceImportance | "ALL">(
    "ALL",
  );
  const [openingId, setOpeningId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<EvidenceCategory>();
    evidence.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [evidence]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach((e) => e.location && set.add(e.location));
    return Array.from(set);
  }, [evidence]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return evidence.filter((e) => {
      if (category !== "ALL" && e.category !== category) return false;
      if (location !== "ALL" && e.location !== location) return false;
      const imp = IntelligenceEngine.importanceOf(e);
      if (importance !== "ALL" && imp !== importance) return false;
      if (q) {
        const hay = [
          e.title,
          e.summary,
          e.detail,
          e.location ?? "",
          ...autoTags(e),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [evidence, query, category, location, importance]);

  const handleOpen = (e: Evidence) => {
    setOpeningId(e.id);
    window.setTimeout(() => {
      onOpen(e);
      setOpeningId(null);
    }, 300);
  };

  const activeFilters =
    (category !== "ALL" ? 1 : 0) +
    (location !== "ALL" ? 1 : 0) +
    (importance !== "ALL" ? 1 : 0) +
    (query.trim() ? 1 : 0);

  const clearAll = () => {
    setQuery("");
    setCategory("ALL");
    setLocation("ALL");
    setImportance("ALL");
  };

  return (
    <div className="space-y-4">
      {/* Search + filter header */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="증거 검색 · 이름, 설명, 위치, 태그"
            className="w-full rounded-lg border border-border/70 bg-surface-elevated py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="검색 지우기"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Filter className="h-3 w-3" />
            Filters
          </div>

          <FilterRow
            label="Category"
            all
            value={category}
            onChange={(v) => setCategory(v as EvidenceCategory | "ALL")}
            options={categories.map((c) => ({
              value: c,
              label: CATEGORY_META[c].label,
            }))}
          />

          {locations.length > 0 && (
            <FilterRow
              label="Location"
              all
              value={location}
              onChange={setLocation}
              options={locations.map((l) => ({ value: l, label: l }))}
            />
          )}

          <FilterRow
            label="Importance"
            all
            value={importance}
            onChange={(v) => setImportance(v as EvidenceImportance | "ALL")}
            options={IMPORTANCES.map((i) => ({
              value: i,
              label: IntelligenceEngine.styleFor(i).label,
            }))}
          />

          {activeFilters > 0 && (
            <button
              onClick={clearAll}
              className="ml-auto text-[10px] uppercase tracking-widest text-primary/80 hover:text-primary"
            >
              Clear ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 py-10 text-center text-xs text-muted-foreground">
          필터에 해당하는 증거가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((e) => (
            <EvidenceDossierCard
              key={e.id}
              evidence={e}
              foundAt={discoveredAt.get(e.id)}
              state={stateOf(e)}
              opening={openingId === e.id}
              onOpen={() => handleOpen(e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  value,
  onChange,
  options,
  all,
}: {
  label: string;
  value: T | "ALL";
  onChange: (v: T | "ALL") => void;
  options: { value: T; label: string }[];
  all?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground/70">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {all && (
          <Chip active={value === "ALL"} onClick={() => onChange("ALL" as T | "ALL")}>
            All
          </Chip>
        )}
        {options.map((o) => (
          <Chip
            key={o.value}
            active={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border/60 bg-surface-elevated text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* --------------------------- Dossier card --------------------------- */

function EvidenceDossierCard({
  evidence,
  foundAt,
  state,
  opening,
  onOpen,
}: {
  evidence: Evidence;
  foundAt: number | undefined;
  state: EvidenceState;
  opening: boolean;
  onOpen: () => void;
}) {
  const cat = CATEGORY_META[evidence.category];
  const CatIcon = cat.Icon;
  const importance = IntelligenceEngine.importanceOf(evidence);
  const impStyle = IntelligenceEngine.styleFor(importance);
  const ImpIcon = IMPORTANCE_ICONS[impStyle.icon];
  const tags = autoTags(evidence);

  return (
    <button
      onClick={onOpen}
      data-testid="evidence-card"
      data-evidence-id={evidence.id}
      data-evidence-state={state}
      data-read={state !== "NEW"}
      className={[
        "evidence-folder group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-0 text-left shadow-[var(--shadow-noir)]",
        opening ? "evidence-opening pointer-events-none" : "",
      ].join(" ")}
    >
      {/* Folder tab / flap */}
      <div className="evidence-folder-flap relative flex items-center justify-between border-b border-border/60 bg-surface-elevated/80 px-4 py-2">
        <div className="flex items-center gap-1.5 text-primary/80">
          <CatIcon className="h-3 w-3" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
            {cat.label}
          </span>
        </div>
        <span
          className={[
            "rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
            state === "NEW"
              ? "border-primary/60 bg-primary/20 text-primary"
              : state === "CONNECTED"
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                : "border-border/60 bg-surface text-muted-foreground",
          ].join(" ")}
        >
          {state}
        </span>
      </div>

      {/* Photo / evidence slate */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-surface via-surface-elevated to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <CatIcon className="h-10 w-10 text-primary/25" />
        </div>
        {/* subtle diagonal watermark */}
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-linear-gradient(45deg,transparent_0_8px,rgba(200,168,108,0.04)_8px_9px)]" />
        {/* corner stamp */}
        <div
          className={[
            "absolute right-2 top-2 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
            impStyle.badgeClass,
          ].join(" ")}
        >
          <span className="inline-flex items-center gap-1">
            <ImpIcon className="h-2.5 w-2.5" />
            {impStyle.label}
          </span>
        </div>
        {/* Evidence ID */}
        <div className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-primary/80 backdrop-blur">
          #{evidence.id.toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base leading-tight text-foreground">
          {evidence.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {evidence.summary}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary/60" />
            {formatFoundTime(foundAt)}
          </span>
          {evidence.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary/60" />
              {evidence.location}
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <TagIcon className="h-2.5 w-2.5 text-muted-foreground/70" />
            {tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded border border-border/60 bg-surface-elevated px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
