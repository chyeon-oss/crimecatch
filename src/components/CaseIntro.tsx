import { useEffect, useState } from "react";

type Props = {
  caseId: string;
  caseCode?: string;
  caseTitle: string;
  emergencyTime?: string;
  arrivalTime?: string;
  onDone: () => void;
};

const STORAGE_PREFIX = "crimecatch:intro-seen:";

export function shouldShowIntro(caseId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !localStorage.getItem(STORAGE_PREFIX + caseId);
  } catch {
    return true;
  }
}

/**
 * 5–7s cinematic intro: logo → CASE title → timeline beats → fade out.
 * Fade-only transitions. Click or ESC skips. Persists a per-case seen flag.
 */
export function CaseIntro({
  caseId,
  caseCode = "CASE001",
  caseTitle,
  emergencyTime = "22:41",
  arrivalTime = "22:57",
  onDone,
}: Props) {
  // 0: logo, 1: black, 2: case title, 3: emergency beat, 4: arrival beat, 5: fade-out
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const finish = () => {
    if (closing) return;
    setClosing(true);
    try {
      localStorage.setItem(STORAGE_PREFIX + caseId, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(onDone, 500);
  };

  useEffect(() => {
    // Timings (ms cumulative from mount): total ~6.2s
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStep(1), 1200)); // fade to black
    timers.push(window.setTimeout(() => setStep(2), 1700)); // case title
    timers.push(window.setTimeout(() => setStep(3), 3200)); // emergency
    timers.push(window.setTimeout(() => setStep(4), 4500)); // arrival
    timers.push(window.setTimeout(() => finish(), 6200)); // fade out
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-label="Case intro"
      onClick={finish}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black cursor-pointer select-none transition-opacity duration-500 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Step 0: Logo */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
          step === 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center">
          <div className="text-3xl md:text-5xl font-semibold tracking-[0.35em] text-white/90">
            CRIME<span className="text-primary">CATCH</span>
          </div>
          <div className="mt-3 text-[10px] md:text-xs tracking-[0.5em] text-white/40">
            INVESTIGATION SYSTEM
          </div>
        </div>
      </div>

      {/* Step 2: Case title */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
          step === 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center">
          <div className="text-xs md:text-sm tracking-[0.6em] text-primary/80">
            {caseCode}
          </div>
          <div className="mt-4 text-3xl md:text-6xl font-light tracking-[0.25em] text-white">
            {caseTitle}
          </div>
          <div className="mx-auto mt-6 h-px w-24 bg-white/30" />
        </div>
      </div>

      {/* Step 3: Emergency call */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
          step === 3 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center">
          <div className="font-mono text-4xl md:text-6xl text-white/95 tabular-nums">
            {emergencyTime}
          </div>
          <div className="mt-4 text-xs md:text-sm tracking-[0.4em] uppercase text-white/60">
            Emergency Call Received
          </div>
        </div>
      </div>

      {/* Step 4: Detective arrived */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
          step === 4 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center">
          <div className="font-mono text-4xl md:text-6xl text-white/95 tabular-nums">
            {arrivalTime}
          </div>
          <div className="mt-4 text-xs md:text-sm tracking-[0.4em] uppercase text-white/60">
            Detective Arrived
          </div>
        </div>
      </div>

      {/* Skip hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] tracking-[0.4em] uppercase text-white/30">
        Click or press ESC to skip
      </div>
    </div>
  );
}
