import { useMemo } from "react";

/**
 * Ambient cinematic background: slow drifting particles + soft moving spotlights.
 * Pure CSS, no JS animation loop. Deterministic per-mount via useMemo.
 */
export function CinematicBackdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 18,
        opacity: 0.15 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Slow-moving spotlights */}
      <div
        className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vh] rounded-full opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--gold) 22%, transparent), transparent 70%)",
          animation: "cc-drift-a 24s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[80vh] w-[80vh] rounded-full opacity-30 mix-blend-screen"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--blood) 25%, transparent), transparent 70%)",
          animation: "cc-drift-b 32s ease-in-out infinite",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            filter: "blur(0.5px)",
            boxShadow: "0 0 8px color-mix(in oklab, var(--gold) 60%, transparent)",
            animation: `cc-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Fine scanlines */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
        }}
      />
    </div>
  );
}
