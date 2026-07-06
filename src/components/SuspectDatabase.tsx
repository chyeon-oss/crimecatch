import { AlertTriangle, Fingerprint, ShieldAlert, User } from "lucide-react";
import type { SuspectDossier, SuspectStatus } from "@/engine/SuspectIntelEngine";

const STATUS_STYLES: Record<
  SuspectStatus,
  { chip: string; dot: string; ring: string }
> = {
  COOPERATIVE: {
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    ring: "ring-emerald-500/20",
  },
  PERSON_OF_INTEREST: {
    chip: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-400",
    ring: "ring-sky-500/20",
  },
  UNDER_SUSPICION: {
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
    ring: "ring-amber-500/25",
  },
  PRIME_SUSPECT: {
    chip: "border-rose-500/50 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
    ring: "ring-rose-500/30",
  },
};

interface MeterProps {
  label: string;
  value: number; // 0..100
  tone: "trust" | "stress";
}

function Meter({ label, value, tone }: MeterProps) {
  const barColor =
    tone === "trust"
      ? "from-emerald-500/70 to-emerald-400"
      : "from-amber-500/70 to-rose-500";
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground/80">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${Math.max(4, value)}%` }}
        />
      </div>
    </div>
  );
}

interface Props {
  dossiers: SuspectDossier[];
  onOpen: (d: SuspectDossier) => void;
}

export function SuspectDatabase({ dossiers, onOpen }: Props) {
  if (dossiers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-surface-elevated/50 py-8 text-center text-xs text-muted-foreground">
        등록된 용의자가 없습니다.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {dossiers.map((d) => {
        const style = STATUS_STYLES[d.status];
        const initials = d.suspect.name.slice(0, 1);
        return (
          <button
            key={d.suspect.id}
            onClick={() => onOpen(d)}
            className={`group relative overflow-hidden rounded-xl border border-border/70 bg-surface-elevated p-4 text-left shadow-[var(--shadow-noir)] ring-1 ${style.ring} transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-gold)]`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />

            <div className="flex items-start gap-3">
              <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-surface to-black/40">
                {d.suspect.profileImage ? (
                  <img
                    src={d.suspect.profileImage}
                    alt=""
                    className="h-full w-full object-cover grayscale"
                  />
                ) : (
                  <span className="font-display text-xl text-primary/80">
                    {initials}
                  </span>
                )}
                <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_2px,rgba(0,0,0,0.15)_2px_3px)]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-base text-foreground">
                    {d.suspect.name}
                  </p>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest ${style.chip}`}
                  >
                    <span
                      className={`h-1 w-1 rounded-full ${style.dot} animate-pulse`}
                    />
                    {d.statusLabel}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {d.suspect.age}세 · {d.suspect.occupation}
                </p>
                <p className="mt-1 line-clamp-1 text-[11px] text-foreground/70">
                  {d.suspect.relationship}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Meter label="Trust" value={d.trust} tone="trust" />
              <Meter label="Stress" value={d.stress} tone="stress" />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-widest">
              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface px-1.5 py-0.5 text-muted-foreground">
                <Fingerprint className="h-3 w-3" />
                증거 {d.evidenceConnectedRead}/{d.evidenceConnected.length}
              </span>
              {d.contradictionsFound > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-rose-300">
                  <AlertTriangle className="h-3 w-3" />
                  모순 {d.contradictionsFound}
                </span>
              )}
              {d.status === "PRIME_SUSPECT" && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-rose-500/50 bg-rose-500/15 px-1.5 py-0.5 text-rose-200">
                  <ShieldAlert className="h-3 w-3" />
                  1급
                </span>
              )}
              <User className="ml-auto h-3 w-3 text-muted-foreground/60 group-hover:text-primary" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
