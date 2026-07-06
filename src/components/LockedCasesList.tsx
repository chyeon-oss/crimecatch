import { Lock } from "lucide-react";
import type { Case } from "@/types";
import type { DetectiveProfile } from "@/types/progress";
import { ProgressEngine } from "@/engine";

export function LockedCasesList({
  cases,
  profile,
}: {
  cases: Case[];
  profile: DetectiveProfile;
}) {
  const locked = cases
    .map((c) => ({ c, gate: ProgressEngine.canUnlockCase(profile, c) }))
    .filter((x) => !x.gate.unlocked);

  if (locked.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        모든 사건 파일에 접근 권한이 있습니다.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {locked.map(({ c, gate }) => (
        <li
          key={c.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-elevated/60 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground/80">{c.title}</p>
            <p className="text-[11px] text-muted-foreground">{gate.reason}</p>
          </div>
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        </li>
      ))}
    </ul>
  );
}
