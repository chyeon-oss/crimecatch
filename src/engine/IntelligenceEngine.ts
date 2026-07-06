import type {
  Case,
  Evidence,
  EvidenceImportance,
  EvidenceState,
  InvestigationQuestion,
  QuestionStatus,
} from "@/types";

export interface IntelligenceState {
  discoveredIds: Set<string>;
  readIds: Set<string>;
}

export function createIntelligenceState(): IntelligenceState {
  return { discoveredIds: new Set(), readIds: new Set() };
}

export interface ImportanceStyle {
  label: string;
  /** Icon name from lucide-react */
  icon: "Circle" | "Star" | "Flame" | "Zap";
  /** Tailwind classes for a filled badge */
  badgeClass: string;
  /** Tailwind text color for icon-only usage */
  textClass: string;
  /** Tailwind border color for chips */
  borderClass: string;
  /** Numeric weight for sorting (higher = more important) */
  weight: number;
}

const IMPORTANCE_STYLES: Record<EvidenceImportance, ImportanceStyle> = {
  COMMON: {
    label: "COMMON",
    icon: "Circle",
    badgeClass: "bg-muted text-muted-foreground border-border/60",
    textClass: "text-muted-foreground",
    borderClass: "border-border/60",
    weight: 0,
  },
  UNCOMMON: {
    label: "UNCOMMON",
    icon: "Star",
    badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    textClass: "text-sky-300",
    borderClass: "border-sky-500/40",
    weight: 1,
  },
  IMPORTANT: {
    label: "IMPORTANT",
    icon: "Flame",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    textClass: "text-amber-300",
    borderClass: "border-amber-500/40",
    weight: 2,
  },
  CRITICAL: {
    label: "CRITICAL",
    icon: "Zap",
    badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/50",
    textClass: "text-rose-300",
    borderClass: "border-rose-500/50",
    weight: 3,
  },
};

export type EvidenceSortMode = "discovery" | "importance" | "category";

export const IntelligenceEngine = {
  importanceOf(e: Evidence): EvidenceImportance {
    return e.importance ?? "COMMON";
  },

  styleFor(importance: EvidenceImportance): ImportanceStyle {
    return IMPORTANCE_STYLES[importance];
  },

  /**
   * Evidence state machine:
   *   NEW       — discovered but not yet opened
   *   READ      — opened by the player
   *   CONNECTED — read AND at least one related evidence has also been read
   */
  stateOf(e: Evidence, state: IntelligenceState): EvidenceState {
    if (!state.readIds.has(e.id)) return "NEW";
    const related = e.relatedEvidenceIds ?? [];
    const hasConnection = related.some((id) => state.readIds.has(id));
    return hasConnection ? "CONNECTED" : "READ";
  },

  sortEvidence(
    evidence: Evidence[],
    discoveryOrder: string[],
    mode: EvidenceSortMode,
  ): Evidence[] {
    const list = [...evidence];
    if (mode === "importance") {
      return list.sort(
        (a, b) =>
          this.styleFor(this.importanceOf(b)).weight -
          this.styleFor(this.importanceOf(a)).weight,
      );
    }
    if (mode === "category") {
      return list.sort((a, b) => a.category.localeCompare(b.category));
    }
    const rank = new Map(discoveryOrder.map((id, i) => [id, i]));
    return list.sort(
      (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
    );
  },

  /**
   * Compute question statuses from investigation progress.
   * Reserved: a future AI interrogation layer can inject flags that
   * activate additional questions here without touching the UI.
   */
  questionStatus(
    q: InvestigationQuestion,
    state: IntelligenceState,
  ): QuestionStatus {
    const gen = q.generatedByEvidenceIds ?? [];
    const isActive =
      gen.length === 0 || gen.some((id) => state.discoveredIds.has(id));
    if (!isActive) return "hidden";
    const solvers = q.solvedByEvidenceIds ?? [];
    if (solvers.length > 0 && solvers.every((id) => state.readIds.has(id))) {
      return "solved";
    }
    return "active";
  },

  visibleQuestions(c: Case, state: IntelligenceState) {
    return (c.questions ?? [])
      .map((q) => ({ question: q, status: this.questionStatus(q, state) }))
      .filter((x) => x.status !== "hidden");
  },
};
