import type {
  Case,
  Objective,
  ObjectiveStatus,
  BoardState,
} from "@/types";

/**
 * ObjectivesEngine — derives detective task list from case content
 * and the current investigation state. Pure and case-agnostic.
 */

export interface ObjectivesInputs {
  case: Case;
  discoveredIds: Set<string>;
  readIds: Set<string>;
  investigatedHotspotIds: Set<string>;
  interrogatedSuspectIds?: Set<string>;
  board: BoardState;
  accusationSubmitted?: boolean;
}

function statusFrom(progress: number, gate = false): ObjectiveStatus {
  if (progress >= 1) return "completed";
  if (progress > 0) return "in_progress";
  return gate ? "locked" : "active";
}

export const ObjectivesEngine = {
  derive(inputs: ObjectivesInputs): Objective[] {
    const {
      case: c,
      discoveredIds,
      readIds,
      investigatedHotspotIds,
      interrogatedSuspectIds,
      board,
      accusationSubmitted,
    } = inputs;

    const list: Objective[] = [];

    // Scene hotspots — one aggregate + per-hotspot detail if named.
    const totalHotspots = c.crimeScene?.hotspots.length ?? 0;
    if (totalHotspots > 0) {
      const done = investigatedHotspotIds.size;
      list.push({
        id: "obj-scene",
        title: "Inspect Crime Scene",
        description: "현장의 모든 지점을 조사해 단서를 확보하세요.",
        category: "SCENE",
        priority: "critical",
        phase: "CRIME_SCENE_INVESTIGATION",
        status: statusFrom(done / totalHotspots),
        progress: done / totalHotspots,
        count: { current: done, total: totalHotspots },
      });
    }

    // Suspect interrogations — one per suspect.
    for (const s of c.suspects) {
      const done = interrogatedSuspectIds?.has(s.id) ? 1 : 0;
      list.push({
        id: `obj-suspect-${s.id}`,
        title: `Interview ${s.name}`,
        description: s.occupation,
        category: "INTERROGATION",
        priority: "high",
        phase: "SUSPECT_INVESTIGATION",
        status: statusFrom(done, discoveredIds.size === 0),
        progress: done,
      });
    }

    // Evidence analysis aggregate.
    const totalEv = c.evidence.length;
    if (totalEv > 0) {
      const analyzed = readIds.size;
      const discovered = discoveredIds.size;
      list.push({
        id: "obj-analyze",
        title: "Analyze Collected Evidence",
        description: "확보한 증거를 열람하고 단서를 파악하세요.",
        category: "ANALYSIS",
        priority: "high",
        phase: "EVIDENCE_ANALYSIS",
        status: statusFrom(
          discovered ? analyzed / discovered : 0,
          discovered === 0,
        ),
        progress: discovered ? analyzed / discovered : 0,
        count: { current: analyzed, total: Math.max(discovered, 1) },
      });
    }

    // Specific "priority" evidence — e.g. blood / cctv / camera keywords.
    for (const e of c.evidence) {
      const name = e.name?.toLowerCase() ?? "";
      const isPriority =
        /blood|혈흔|dna|cctv|카메라|camera|security|보안/.test(name);
      if (!isPriority) continue;
      const found = discoveredIds.has(e.id);
      const read = readIds.has(e.id);
      const progress = read ? 1 : found ? 0.5 : 0;
      list.push({
        id: `obj-ev-${e.id}`,
        title: `Analyze ${e.name}`,
        category: "EVIDENCE",
        priority: "critical",
        phase: "EVIDENCE_ANALYSIS",
        status: statusFrom(progress, !found),
        progress,
      });
    }

    // Theory building
    list.push({
      id: "obj-theory",
      title: "Build a Working Theory",
      description: "보드에 단서를 연결하고 가설을 세우세요.",
      category: "THEORY",
      priority: "normal",
      phase: "THEORY_BUILDING",
      status: statusFrom(
        board.theories.length > 0
          ? 1
          : Math.min(1, board.pins.length / 3) * 0.5,
        board.pins.length === 0,
      ),
      progress:
        board.theories.length > 0
          ? 1
          : Math.min(1, board.pins.length / 3) * 0.5,
    });

    // Final accusation
    list.push({
      id: "obj-accuse",
      title: "Name the Perpetrator",
      description: "충분한 근거를 확보하고 범인을 지목하세요.",
      category: "ACCUSATION",
      priority: "critical",
      phase: "FINAL_ACCUSATION",
      status: accusationSubmitted
        ? "completed"
        : board.theories.length > 0
          ? "active"
          : "locked",
      progress: accusationSubmitted ? 1 : 0,
    });

    return list;
  },

  summary(objectives: Objective[]) {
    const total = objectives.length;
    const completed = objectives.filter((o) => o.status === "completed").length;
    const active = objectives.filter(
      (o) => o.status === "active" || o.status === "in_progress",
    ).length;
    return { total, completed, active, ratio: total ? completed / total : 0 };
  },
};
