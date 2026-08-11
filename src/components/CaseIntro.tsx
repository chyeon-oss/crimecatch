import { useEffect, useState } from "react";
import exteriorImg from "@/assets/intro/scene-exterior.jpg";
import hallwayImg from "@/assets/intro/scene-hallway.jpg";
import doorImg from "@/assets/intro/scene-door.jpg";

type Props = {
  caseId: string;
  caseCode?: string;
  caseTitle: string;
  emergencyTime?: string;
  arrivalTime?: string;
  onDone: () => void;
  storyImages?: string[];
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
 * Opening cinematic sequence (~10s):
 *   0 Logo → 1 Case title → 2 Emergency call → 3 Detective arrived
 *   → 4 Building exterior → 5 Hallway → 6 Taped door
 *   → 7 Final "Click to Enter Crime Scene" (waits for user)
 * ESC or click during timeline skips entirely. Persists a per-case seen flag.
 */
export function CaseIntro({
  caseId,
  caseCode = "CASE001",
  caseTitle,
  emergencyTime = "22:41",
  arrivalTime = "22:57",
  onDone,
  storyImages = [],
}: Props) {
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
    window.setTimeout(onDone, 600);
  };

  useEffect(() => {
    // Cumulative timings (ms). Total ~10s; step 7 waits for click.
    const schedule: Array<[number, number]> = [
      [1, 1400], // → case title
      [2, 3000], // → emergency call
      [3, 4400], // → detective arrived
      [4, 5800], // → building exterior
      [5, 7200], // → hallway
      [6, 8600], // → taped door
      [7, 10000], // → final CTA (hold)
    ];
    const timers = schedule.map(([s, t]) =>
      window.setTimeout(() => setStep(s), t),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    // On the final beat click = enter; before that, click skips the intro.
    finish();
  };

  const Scene = ({
    visible,
    image,
    dim = 0.55,
    children,
  }: {
    visible: boolean;
    image?: string;
    dim?: number;
    children?: React.ReactNode;
  }) => (
    <div
      className={`absolute inset-0 transition-opacity duration-[1100ms] ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${image})`,
              transform: visible ? "scale(1.06)" : "scale(1)",
              transition: "transform 6s ease-out",
            }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: dim }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
        </>
      )}
      <div className="relative flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-label="Case intro"
      onClick={handleClick}
      className={`fixed inset-0 z-[100] overflow-hidden bg-black cursor-pointer select-none transition-opacity duration-500 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 0 · Logo */}
      <Scene visible={step === 0}>
        <div className="text-center">
          <div className="text-3xl md:text-5xl font-semibold tracking-[0.35em] text-white/90">
            CRIME<span className="text-primary">CATCH</span>
          </div>
          <div className="mt-3 text-[10px] md:text-xs tracking-[0.5em] text-white/40">
            INVESTIGATION SYSTEM
          </div>
        </div>
      </Scene>

      {/* 1 · Case title */}
      <Scene visible={step === 1} image={storyImages[0]} dim={0.68}>
        <div className="text-center">
          <div className="text-xs md:text-sm tracking-[0.6em] text-primary/80">
            {caseCode}
          </div>
          <div className="mt-4 text-3xl md:text-6xl font-light tracking-[0.25em] text-white">
            {caseTitle}
          </div>
          <div className="mx-auto mt-6 h-px w-24 bg-white/30" />
        </div>
      </Scene>

      {/* 2 · Emergency call */}
      <Scene visible={step === 2}>
        <div className="text-center">
          <div className="font-mono text-4xl md:text-6xl text-white/95 tabular-nums">
            {emergencyTime}
          </div>
          <div className="mt-4 text-xs md:text-sm tracking-[0.4em] uppercase text-white/60">
            신고 접수 · Emergency Call Received
          </div>
        </div>
      </Scene>

      {/* 3 · Detective arrived */}
      <Scene visible={step === 3} image={storyImages[1]} dim={0.7}>
        <div className="text-center">
          <div className="font-mono text-4xl md:text-6xl text-white/95 tabular-nums">
            {arrivalTime}
          </div>
          <div className="mt-4 text-xs md:text-sm tracking-[0.4em] uppercase text-white/60">
            탐정 도착 · Detective Arrived
          </div>
        </div>
      </Scene>

      {/* 4 · Building exterior */}
      <Scene visible={step === 4} image={exteriorImg} dim={0.45}>
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <div className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/50">
            SEOUL · GANGNAM DISTRICT
          </div>
          <div className="mt-2 text-xl md:text-3xl font-light tracking-[0.2em] text-white/90">
            한 층에만 불이 켜져 있다.
          </div>
        </div>
      </Scene>

      {/* 5 · Hallway */}
      <Scene visible={step === 5} image={hallwayImg} dim={0.5}>
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <div className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/50">
            14F · CORRIDOR
          </div>
          <div className="mt-2 text-xl md:text-3xl font-light tracking-[0.2em] text-white/90">
            복도 끝, 조용한 발소리.
          </div>
        </div>
      </Scene>

      {/* 6 · Taped door */}
      <Scene visible={step === 6} image={doorImg} dim={0.35}>
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <div className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-primary/80">
            SCENE SECURED
          </div>
          <div className="mt-2 text-xl md:text-3xl font-light tracking-[0.2em] text-white/95">
            출입 통제선 너머, 사건이 기다린다.
          </div>
        </div>
      </Scene>

      {/* 7 · Final CTA */}
      <Scene visible={step === 7} image={doorImg} dim={0.55}>
        <div className="text-center">
          <div className="text-[10px] md:text-xs tracking-[0.6em] uppercase text-primary/80">
            {caseCode}
          </div>
          <div className="mt-3 text-2xl md:text-5xl font-light tracking-[0.25em] text-white">
            {caseTitle}
          </div>
          <div className="mx-auto mt-8 h-px w-24 bg-primary/50" />
          <div
            className="mt-8 inline-flex items-center gap-3 text-sm md:text-base tracking-[0.4em] uppercase text-white/90"
            style={{ animation: "cc-pulse-dot 2.2s ease-in-out infinite" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Click to Enter Crime Scene
          </div>
        </div>
      </Scene>

      {/* Skip hint */}
      {step < 7 && (
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-[10px] tracking-[0.4em] uppercase text-white/30">
          Click or press ESC to skip
        </div>
      )}
    </div>
  );
}
