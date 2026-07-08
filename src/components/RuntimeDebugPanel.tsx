import type { CaseRuntimeState } from "@/types/runtime";

interface Props {
  state: CaseRuntimeState;
  availableHotspotIds: string[];
}

/**
 * RuntimeDebugPanel — visible only in DEV builds (`import.meta.env.DEV`).
 * Surfaces the raw runtime state so scene transitions, evidence matching
 * and gating conditions can be inspected without opening devtools.
 */
export function RuntimeDebugPanel({ state, availableHotspotIds }: Props) {
  if (!import.meta.env.DEV) return null;
  const Row = ({ k, v }: { k: string; v: string | number }) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 py-1 last:border-0">
      <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
        {k}
      </span>
      <span className="truncate text-right font-mono text-[11px] text-foreground/90">
        {v || "—"}
      </span>
    </div>
  );
  return (
    <details className="mt-4 rounded-lg border border-dashed border-primary/40 bg-surface-elevated/60 p-3 text-xs">
      <summary className="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-widest text-primary">
        🐞 Runtime Debug (dev only)
      </summary>
      <div className="mt-2 space-y-0">
        <Row k="currentSceneId" v={state.currentScene ?? "—"} />
        <Row k="gameStatus" v={state.gameStatus} />
        <Row k="completedScenes" v={state.completedScenes.join(", ")} />
        <Row k="discoveredEvidence" v={state.discoveredEvidence.join(", ")} />
        <Row k="availableHotspots" v={availableHotspotIds.join(", ")} />
        <Row k="unlockedHotspots" v={state.unlockedHotspots.join(", ")} />
        <Row k="interviewedSuspects" v={state.interviewedSuspects.join(", ")} />
        <Row k="activeQuestions" v={state.activeQuestions.join(", ")} />
        <Row k="solvedQuestions" v={state.solvedQuestions.join(", ")} />
      </div>
    </details>
  );
}
