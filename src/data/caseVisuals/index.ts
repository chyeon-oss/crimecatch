import lineup from "@/assets/cases/midnight-office/suspect-lineup.jpg";
import officeWitness from "@/assets/cases/midnight-office/office-witness.jpg";
import suspectS1 from "@/assets/cases/midnight-office/suspect-s1.jpg";
import suspectS2 from "@/assets/cases/midnight-office/suspect-s2.jpg";
import suspectS3 from "@/assets/cases/midnight-office/suspect-s3.jpg";
import suspectS4 from "@/assets/cases/midnight-office/suspect-s4.jpg";

export interface CaseVisuals {
  introImages?: string[];
  interviewHero?: string;
  suspectPortraits: Record<string, string>;
}

const REGISTRY: Record<string, CaseVisuals> = {
  "midnight-office": {
    introImages: [officeWitness, lineup],
    interviewHero: lineup,
    suspectPortraits: { s1: suspectS1, s2: suspectS2, s3: suspectS3, s4: suspectS4 },
  },
};

const FALLBACK: CaseVisuals = { suspectPortraits: {} };

export function getCaseVisuals(caseId: string): CaseVisuals {
  return REGISTRY[caseId] ?? FALLBACK;
}
