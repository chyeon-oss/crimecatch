import type { Case, Evidence, Suspect } from "@/types";

export type SuspectStatus =
  | "COOPERATIVE"
  | "PERSON_OF_INTEREST"
  | "UNDER_SUSPICION"
  | "PRIME_SUSPECT";

export interface SuspectFact {
  id: string;
  label: string;
  value: string;
  revealed: boolean;
  /** When true, this fact is meant to stay classified until further progress. */
  classified?: boolean;
}

export interface SuspectContradiction {
  evidenceId: string;
  evidenceTitle: string;
  explanation: string;
  revealed: boolean;
}

export interface SuspectDossier {
  suspect: Suspect;
  status: SuspectStatus;
  statusLabel: string;
  trust: number; // 0..100
  stress: number; // 0..100
  knownFacts: SuspectFact[];
  unknownFacts: SuspectFact[];
  contradictions: SuspectContradiction[];
  contradictionsFound: number;
  evidenceConnected: Evidence[];
  evidenceConnectedRead: number;
}

export interface SuspectIntelInputs {
  case: Case;
  discoveredIds: Set<string>;
  readIds: Set<string>;
}

const STATUS_LABEL: Record<SuspectStatus, string> = {
  COOPERATIVE: "협조적",
  PERSON_OF_INTEREST: "관심 대상",
  UNDER_SUSPICION: "요주의",
  PRIME_SUSPECT: "유력 용의자",
};

function statusFromScore(stress: number, contradictions: number): SuspectStatus {
  if (contradictions >= 2 || stress >= 75) return "PRIME_SUSPECT";
  if (contradictions >= 1 || stress >= 50) return "UNDER_SUSPICION";
  if (stress >= 25) return "PERSON_OF_INTEREST";
  return "COOPERATIVE";
}

export const SuspectIntelEngine = {
  dossier(s: Suspect, inputs: SuspectIntelInputs): SuspectDossier {
    const { case: c, discoveredIds, readIds } = inputs;

    const evidenceConnected = c.evidence.filter((e) =>
      (e.relatedSuspectIds ?? []).includes(s.id),
    );
    const evidenceRead = evidenceConnected.filter((e) => readIds.has(e.id));
    const readCount = evidenceRead.length;

    const contradictionPairs = c.solution.contradictionPairs.filter(
      (cp) => cp.suspectId === s.id,
    );
    const contradictions: SuspectContradiction[] = contradictionPairs.map(
      (cp) => {
        const ev = c.evidence.find((e) => e.id === cp.evidenceId);
        return {
          evidenceId: cp.evidenceId,
          evidenceTitle: ev?.title ?? "미상 증거",
          explanation: cp.explanation,
          revealed: readIds.has(cp.evidenceId),
        };
      },
    );
    const contradictionsFound = contradictions.filter((c) => c.revealed).length;

    const knownFacts: SuspectFact[] = [
      {
        id: "relationship",
        label: "피해자 관계",
        value: s.relationship,
        revealed: true,
      },
      {
        id: "statement",
        label: "최초 진술",
        value: s.initialStatement,
        revealed: true,
      },
      {
        id: "alibi",
        label: "알리바이",
        value: s.alibi,
        revealed: true,
      },
    ];

    const personalityRevealed = readCount >= 1;
    const motiveHintRevealed = contradictionsFound >= 1;
    const hiddenTruthRevealed = contradictionsFound >= 2;

    const unknownFacts: SuspectFact[] = [
      {
        id: "personality",
        label: "성격 프로파일",
        value: s.personality,
        revealed: personalityRevealed,
        classified: !personalityRevealed,
      },
      {
        id: "motive",
        label: "잠재적 동기",
        value:
          s.isCulprit && motiveHintRevealed
            ? c.solution.motive
            : "재무·감정·이해관계 분석 필요. 추가 증거로 잠금 해제.",
        revealed: motiveHintRevealed,
        classified: !motiveHintRevealed,
      },
      {
        id: "hidden",
        label: "숨겨진 진실",
        value: hiddenTruthRevealed
          ? s.hiddenTruth
          : "심층 취조 및 모순 증거 2건 이상 확보 시 해제됩니다.",
        revealed: hiddenTruthRevealed,
        classified: !hiddenTruthRevealed,
      },
    ];

    const stress = Math.min(
      100,
      contradictionsFound * 32 + readCount * 9 + (s.isCulprit ? 5 : 0),
    );
    const trust = Math.max(
      5,
      95 - contradictionsFound * 30 - readCount * 6,
    );
    const status = statusFromScore(stress, contradictionsFound);

    // "discoveredIds" reserved for future gating of suspects behind evidence.
    void discoveredIds;

    return {
      suspect: s,
      status,
      statusLabel: STATUS_LABEL[status],
      trust,
      stress,
      knownFacts,
      unknownFacts,
      contradictions,
      contradictionsFound,
      evidenceConnected,
      evidenceConnectedRead: readCount,
    };
  },

  all(inputs: SuspectIntelInputs): SuspectDossier[] {
    return inputs.case.suspects.map((s) => this.dossier(s, inputs));
  },
};
