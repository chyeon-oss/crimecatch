import { Shield, Star } from "lucide-react";
import type { DetectiveProfile } from "@/types/progress";
import { ProgressEngine } from "@/engine";

export function DetectiveIDCard({ profile }: { profile: DetectiveProfile }) {
  const xp = ProgressEngine.xpProgress(profile);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-5 shadow-[var(--shadow-noir)] sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
          <Shield className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary/80">
            DETECTIVE ID · CASENOTE
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
            {profile.name}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {profile.title} · {profile.rank}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Lv</p>
          <p className="font-display text-3xl text-primary">{profile.level}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-xs text-muted-foreground">
          <span>XP {profile.xp}</span>
          <span>다음 레벨 {xp.nextLevelXp}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${xp.ratio * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Star className="h-3.5 w-3.5 text-primary/80" />
        평판 {profile.reputation} / 100
      </div>
    </section>
  );
}
