import type { Case } from "@/types";
import type { CaseHistoryEntry, CaseResultRecord } from "@/types/progress";

export function RecentSolvedList({
  history,
  resolve,
  caseResults = {},
}: {
  history: CaseHistoryEntry[];
  resolve: (id: string) => Case | undefined;
  caseResults?: Record<string, CaseResultRecord>;
}) {
  const solved = history.filter((h) => h.solved).slice(0, 5);
  if (solved.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 해결한 사건이 없습니다.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border/60">
      {solved.map((h) => {
        const c = resolve(h.caseId);
        const record = caseResults[h.caseId];
        const score = record?.bestScore ?? h.score;
        const rank = record?.bestRank ?? h.rank ?? null;
        return (
          <li key={`${h.caseId}-${h.at}`} className="flex items-center justify-between py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">
                {c?.title ?? h.caseId}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(h.at).toLocaleDateString()} ·{" "}
                {h.perfect ? "완벽 해결" : "해결"}
                {typeof score === "number" && score > 0 && (
                  <>
                    {" · "}
                    <span className="tabular-nums text-foreground/80">{score}점</span>
                    {rank && <span className="text-primary"> · {rank}</span>}
                  </>
                )}
              </p>
            </div>
            <span className="ml-3 shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
              CLOSED
            </span>
          </li>
        );
      })}
    </ul>
  );
}
