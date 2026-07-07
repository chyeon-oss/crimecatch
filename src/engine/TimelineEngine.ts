import type { Case, Evidence, Suspect, TimelineEvent } from "@/types";

export interface TimelineEntry {
  event: TimelineEvent;
  visible: boolean;
  location?: string;
  people: Suspect[];
  evidence: Evidence[];
  /** True when this event's data becomes visible only because of discovery. */
  justRevealed?: boolean;
}

export interface TimelineInputs {
  case: Case;
  discoveredIds: Set<string>;
}

/**
 * TimelineEngine — derives the interactive investigation timeline.
 * An event is visible when it is initially known (no evidence pins it, or it
 * is flagged `initiallyVisible`), or when at least one discovered evidence
 * references its time via `relatedTimelineTimes`.
 */
export const TimelineEngine = {
  derive({ case: c, discoveredIds }: TimelineInputs): TimelineEntry[] {
    const suspectById = new Map(c.suspects.map((s) => [s.id, s]));
    const evidenceByTime = new Map<string, Evidence[]>();
    for (const e of c.evidence) {
      for (const t of e.relatedTimelineTimes ?? []) {
        if (!evidenceByTime.has(t)) evidenceByTime.set(t, []);
        evidenceByTime.get(t)!.push(e);
      }
    }

    const events = [...c.timeline].sort((a, b) =>
      a.time.localeCompare(b.time),
    );

    return events.map((event) => {
      const linkedEvidence = evidenceByTime.get(event.time) ?? [];
      const discoveredLinked = linkedEvidence.filter((e) =>
        discoveredIds.has(e.id),
      );
      const hasEvidencePin = linkedEvidence.length > 0;
      const visible =
        event.initiallyVisible === true ||
        !hasEvidencePin ||
        discoveredLinked.length > 0;

      const peopleIds = new Set<string>();
      if (event.relatedSuspectId) peopleIds.add(event.relatedSuspectId);
      for (const id of event.involvedSuspectIds ?? []) peopleIds.add(id);
      for (const e of discoveredLinked) {
        for (const id of e.relatedSuspectIds ?? []) peopleIds.add(id);
      }
      const people = Array.from(peopleIds)
        .map((id) => suspectById.get(id))
        .filter((s): s is Suspect => !!s);

      return {
        event,
        visible,
        location: event.location,
        people,
        evidence: discoveredLinked,
        justRevealed: visible && hasEvidencePin && discoveredLinked.length > 0,
      };
    });
  },

  summary(entries: TimelineEntry[]) {
    const total = entries.length;
    const revealed = entries.filter((e) => e.visible).length;
    return { total, revealed, hidden: total - revealed };
  },
};
