import type { ReactNode } from "react";
import sceneHallway from "@/assets/intro/scene-hallway.jpg";
import sceneDoor from "@/assets/intro/scene-door.jpg";
import sceneExterior from "@/assets/intro/scene-exterior.jpg";
import evidencePhone from "@/assets/cases/midnight-office/evidence-phone.jpg";
import officeWitness from "@/assets/cases/midnight-office/office-witness.jpg";
import suspectLineup from "@/assets/cases/midnight-office/suspect-lineup.jpg";
import { hotspotLayout as midnightOfficeLayout } from "@/content/cases/midnight-office/hotspotLayout";
import { hotspotLayout as inheritancePartyLayout } from "@/content/cases/inheritance-party/hotspotLayout";

/**
 * Purely presentational per-case scene dressing: hotspot placement and the
 * scene backdrop. Nothing here affects the runtime — the engine and routes
 * only ask this registry for visuals, so a new case is a data-only addition.
 */
export interface ScenePresentation {
  layout: Record<string, { x: number; y: number }>;
  renderBackdrop: (sceneIndex: number) => ReactNode;
}

const imageBackdrop = (src: string) => (
  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
);

const OFFICE_IMAGES = [evidencePhone, officeWitness, suspectLineup, sceneHallway, sceneDoor, sceneExterior];

/** CASE002 has no photography yet; the mansion is dressed with CSS layers. */
const MANSION_LAYERS: Array<{ base: string; glow: string }> = [
  {
    base: "linear-gradient(180deg, hsl(28 22% 12%) 0%, hsl(24 18% 7%) 55%, hsl(220 18% 5%) 100%)",
    glow: "radial-gradient(120% 70% at 30% 22%, hsl(38 62% 58% / 0.28) 0%, transparent 62%)",
  },
  {
    base: "linear-gradient(180deg, hsl(206 20% 13%) 0%, hsl(210 22% 8%) 60%, hsl(220 20% 5%) 100%)",
    glow: "radial-gradient(110% 60% at 70% 28%, hsl(190 55% 62% / 0.22) 0%, transparent 60%)",
  },
  {
    base: "linear-gradient(180deg, hsl(12 26% 12%) 0%, hsl(16 20% 7%) 58%, hsl(220 18% 5%) 100%)",
    glow: "radial-gradient(120% 70% at 42% 68%, hsl(20 70% 52% / 0.24) 0%, transparent 62%)",
  },
];

const mansionBackdrop = (sceneIndex: number) => {
  const l = MANSION_LAYERS[sceneIndex % MANSION_LAYERS.length];
  return (
    <div className="absolute inset-0" style={{ backgroundImage: l.base }}>
      <div className="absolute inset-0" style={{ backgroundImage: l.glow }} />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, hsl(0 0% 100% / 0.5) 0px, hsl(0 0% 100% / 0.5) 1px, transparent 1px, transparent 26px)",
        }}
      />
      <div className="absolute inset-x-8 bottom-0 top-1/3 rounded-t-[40%] bg-background/40 blur-2xl" />
    </div>
  );
};

const REGISTRY: Record<string, ScenePresentation> = {
  "midnight-office": {
    layout: midnightOfficeLayout,
    renderBackdrop: (sceneIndex) => imageBackdrop(OFFICE_IMAGES[sceneIndex % OFFICE_IMAGES.length]),
  },
  "inheritance-party": {
    layout: inheritancePartyLayout,
    renderBackdrop: mansionBackdrop,
  },
};

const FALLBACK: ScenePresentation = {
  layout: {},
  renderBackdrop: mansionBackdrop,
};

export function getScenePresentation(caseId: string): ScenePresentation {
  return REGISTRY[caseId] ?? FALLBACK;
}
