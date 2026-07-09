import {
  AlertTriangle,
  EyeOff,
  Fingerprint,
  Lock,
  ShieldAlert,
  X,
} from "lucide-react";
import { useEffect } from "react";
import type { SuspectDossier } from "@/engine/SuspectIntelEngine";

interface Props {
  dossier: SuspectDossier | null;
  onClose: () => void;
}

function ClassifiedField({
  label,
  value,
  revealed,
}: {
  label: string;
  value: string;
  revealed: boolean;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-surface-elevated/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-primary/70">
          {label}
        </p>
        {!revealed && (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-rose-300">
            <Lock className="h-2.5 w-2.5" />
            CLASSIFIED
          </span>
        )}
      </div>
      <p
        className={`mt-1.5 text-sm leading-relaxed text-foreground/90 transition-all duration-300 ${
          revealed ? "" : "select-none blur-[6px] saturate-50"
        }`}
        aria-hidden={!revealed}
      >
        {value}
      </p>
      {!revealed && (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <EyeOff className="h-3 w-3" />
          추가 조사로 잠금 해제
        </p>
      )}
    </div>
  );
}

export function SuspectProfileModal({ dossier, onClose }: Props) {
  useEffect(() => {
    if (!dossier) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dossier, onClose]);

  if (!dossier) return null;
  const { suspect: s } = dossier;
  const caseNo =
    "S-" + s.id.replace(/[^0-9a-zA-Z]/g, "").slice(0, 6).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-[var(--shadow-noir)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — dossier band */}
        <div className="relative border-b border-border/60 bg-gradient-to-br from-surface-elevated to-black/50 p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border-2 border-primary/40 bg-black/50">
              {s.profileImage ? (
                <img
                  src={s.profileImage}
                  alt=""
                  className="h-full w-full object-cover grayscale contrast-110"
                />
              ) : (
                <span className="font-display text-3xl text-primary/80">
                  {s.name.slice(0, 1)}
                </span>
              )}
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_2px,rgba(0,0,0,0.2)_2px_3px)]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary/70">
                <span>FBI DOSSIER</span>
                <span className="text-muted-foreground/60">·</span>
                <span className="tabular-nums text-muted-foreground">
                  {caseNo}
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl text-foreground">
                {s.name}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {s.age}세 · {s.occupation}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                  <ShieldAlert className="h-3 w-3" />
                  {dossier.statusLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Fingerprint className="h-3 w-3" />
                  증거 연결 {dossier.evidenceConnectedRead}/{dossier.evidenceConnected.length}
                </span>
                {dossier.contradictionsFound > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-rose-300">
                    <AlertTriangle className="h-3 w-3" />
                    모순 {dossier.contradictionsFound}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* meters */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Trust Meter</span>
                <span className="tabular-nums text-emerald-300">
                  {dossier.trust}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.max(4, dossier.trust)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Stress Meter</span>
                <span className="tabular-nums text-rose-300">
                  {dossier.stress}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500/70 to-rose-500 transition-all duration-500"
                  style={{ width: `${Math.max(4, dossier.stress)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary/70">
              Known Facts
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {dossier.knownFacts.map((f) => (
                <div
                  key={f.id}
                  className="rounded-md border border-border/60 bg-surface-elevated/60 p-3"
                >
                  <p className="text-[10px] uppercase tracking-widest text-primary/70">
                    {f.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary/70">
              Unknown Facts
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {dossier.unknownFacts.map((f) => (
                <ClassifiedField
                  key={f.id}
                  label={f.label}
                  value={f.value}
                  revealed={f.revealed}
                />
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary/70">
              First-Round Interview
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {s.firstImpression && (
                <div className="rounded-md border border-border/60 bg-surface-elevated/60 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary/70">
                    첫인상
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {s.firstImpression}
                  </p>
                </div>
              )}
              {s.interviewNotes && (
                <div className="rounded-md border border-border/60 bg-surface-elevated/60 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary/70">
                    심문 메모
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {s.interviewNotes}
                  </p>
                </div>
              )}
              {s.pressurePoint && (
                <div className="rounded-md border border-border/60 bg-surface-elevated/60 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary/70">
                    압박 포인트
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {s.pressurePoint}
                  </p>
                </div>
              )}
              {s.visibleContradictionHint && (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary/70">
                    모순 힌트
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {s.visibleContradictionHint}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section>
            <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary/70">
              <AlertTriangle className="h-3 w-3 text-rose-300" />
              Contradictions
            </p>
            {dossier.contradictions.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/60 bg-surface-elevated/40 p-3 text-xs text-muted-foreground">
                아직 발견된 진술 모순이 없습니다.
              </div>
            ) : (
              <ul className="space-y-2">
                {dossier.contradictions.map((c) => (
                  <li
                    key={c.evidenceId}
                    className={`rounded-md border p-3 transition-all ${
                      c.revealed
                        ? "border-rose-500/40 bg-rose-500/5"
                        : "border-border/60 bg-surface-elevated/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground/90">
                        {c.revealed ? c.evidenceTitle : "미확인 증거"}
                      </p>
                      {!c.revealed && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                          <Lock className="h-2.5 w-2.5" />
                          잠김
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        c.revealed
                          ? "text-foreground/80"
                          : "select-none text-muted-foreground blur-[5px]"
                      }`}
                      aria-hidden={!c.revealed}
                    >
                      {c.explanation}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary/70">
              <Fingerprint className="h-3 w-3" />
              Evidence Connected
            </p>
            {dossier.evidenceConnected.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/60 bg-surface-elevated/40 p-3 text-xs text-muted-foreground">
                아직 이 용의자와 연결된 증거가 없습니다.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {dossier.evidenceConnected.map((e) => (
                  <span
                    key={e.id}
                    className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface px-2 py-1 text-[11px] text-foreground/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                    {e.title}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="border-t border-border/60 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-border bg-surface-elevated py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
