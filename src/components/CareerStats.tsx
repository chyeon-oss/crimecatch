import { CheckCircle2, XCircle, Percent, Trophy } from "lucide-react";
import type { DetectiveProfile } from "@/types/progress";
import { ProgressEngine } from "@/engine";

export function CareerStats({ profile }: { profile: DetectiveProfile }) {
  const rate = ProgressEngine.successRate(profile);
  const items = [
    { icon: CheckCircle2, label: "해결", value: profile.solvedCaseIds.length },
    { icon: XCircle, label: "오답", value: profile.wrongAccusations },
    { icon: Percent, label: "성공률", value: `${rate}%` },
    { icon: Trophy, label: "업적", value: profile.achievementsUnlocked.length },
  ];
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-border/70 bg-surface-elevated p-3 text-center"
        >
          <it.icon className="mx-auto h-4 w-4 text-primary/80" />
          <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {it.label}
          </p>
          <p className="mt-0.5 font-display text-lg text-foreground">{it.value}</p>
        </div>
      ))}
    </section>
  );
}
