import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DialogueLine } from "@/types/dialogue";
import type {
  CaseInterviewPack,
  InterviewContradiction,
  InterviewSession,
  InterviewSuspectState,
  SuspectMood,
} from "@/types/interview";
import { lineDelay, makeEntry, type RequirementContext } from "@/lib/dialogueRuntime";
import {
  emptySession,
  emptySuspectState,
  findInterview,
  interviewProgress,
  requiredProgress,
  isInterviewComplete,
  loadSession,
  reactionFor,
  saveSession,
  speakerOf,
  suspectStateOf,
  topicsFor,
} from "@/lib/interviewRuntime";

interface Options {
  caseId: string;
  pack: CaseInterviewPack | null;
  requirementContext: RequirementContext;
  /** Fired once the suspect's base interview is substantively complete. */
  onInterviewComplete?: (suspectId: string) => void;
}

interface Pending {
  suspectId: string;
  /** Topic (or reaction) the queued lines belong to. */
  topicId: string | null;
  lines: DialogueLine[];
}

interface Effects {
  mood?: SuspectMood;
  note?: string;
  contradiction?: InterviewContradiction;
  unlocksTopicIds?: string[];
}

/**
 * React binding for authored suspect interviews. Owns the per-suspect
 * transcripts, moods, presented evidence, contradictions, typing cadence and
 * localStorage restore. It never touches the case runtime directly — base
 * interview completion is reported to the host via `onInterviewComplete`.
 */
export function useInterviewRuntime({
  caseId,
  pack,
  requirementContext,
  onInterviewComplete,
}: Options) {
  const [session, setSession] = useState<InterviewSession>(emptySession);
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    const stored = loadSession(caseId);
    if (stored) setSession(stored);
    setHydrated(true);
  }, [caseId]);

  useEffect(() => {
    if (!hydrated) return;
    saveSession(caseId, session);
  }, [caseId, session, hydrated]);

  const completeRef = useRef(onInterviewComplete);
  useEffect(() => {
    completeRef.current = onInterviewComplete;
  }, [onInterviewComplete]);

  const notifiedRef = useRef<Set<string>>(new Set());

  /**
   * Completion is reported from a single effect over the session, so a
   * completion committed inline and a completion restored from storage take
   * exactly the same path — and each suspect fires at most once per mount.
   */
  useEffect(() => {
    if (!hydrated || !pack) return;
    for (const iv of pack.suspects) {
      if (notifiedRef.current.has(iv.suspectId)) continue;
      if (!isInterviewComplete(iv, suspectStateOf(session, iv.suspectId))) continue;
      notifiedRef.current.add(iv.suspectId);
      completeRef.current?.(iv.suspectId);
    }
  }, [hydrated, pack, session]);

  const patch = useCallback(
    (suspectId: string, fn: (prev: InterviewSuspectState) => InterviewSuspectState) => {
      setSession((s) => {
        const prev = s.suspects[suspectId] ?? emptySuspectState();
        return { ...s, suspects: { ...s.suspects, [suspectId]: fn(prev) } };
      });
    },
    [],
  );

  const appendLine = useCallback(
    (suspectId: string, line: DialogueLine) => {
      const sp = speakerOf(pack, line.speakerId);
      patch(suspectId, (prev) => ({
        ...prev,
        entries: [
          ...prev.entries,
          makeEntry({
            kind: "LINE",
            speaker: sp?.name ?? "",
            role: sp?.role ?? "WITNESS",
            text: line.text,
          }),
        ],
      }));
    },
    [pack, patch],
  );

  /** Reveal queued lines one at a time (typing cadence). */
  useEffect(() => {
    if (!pending || pending.lines.length === 0) return;
    const [head, ...rest] = pending.lines;
    const t = setTimeout(() => {
      appendLine(pending.suspectId, head);
      setPending(
        rest.length ? { suspectId: pending.suspectId, topicId: pending.topicId, lines: rest } : null,
      );
    }, lineDelay(head.text, head.delayMs));
    return () => clearTimeout(t);
  }, [pending, appendLine]);

  const applyEffects = useCallback(
    (suspectId: string, fx: Effects) => {
      patch(suspectId, (prev) => {
        const next: InterviewSuspectState = { ...prev };
        if (fx.mood) next.mood = fx.mood;
        if (fx.note && !prev.notes.includes(fx.note)) next.notes = [...prev.notes, fx.note];
        const unlock = [
          ...(fx.unlocksTopicIds ?? []),
          ...(fx.contradiction?.unlocksTopicIds ?? []),
        ];
        if (unlock.length) {
          next.unlockedTopicIds = Array.from(new Set([...prev.unlockedTopicIds, ...unlock]));
        }
        if (fx.contradiction && !prev.contradictions.some((c) => c.id === fx.contradiction!.id)) {
          const c = fx.contradiction;
          next.contradictions = [
            ...prev.contradictions,
            { id: c.id, title: c.title, detail: c.detail },
          ];
          next.entries = [
            ...next.entries,
            makeEntry({
              kind: "SYSTEM",
              systemKind: "QUESTION",
              text: `모순 포착 — ${c.title}\n${c.detail}`,
            }),
          ];
        }
        return next;
      });
    },
    [patch],
  );

  const markTopicDone = useCallback((suspectId: string, topicId: string) => {
    setSession((s) => {
      const prev = s.suspects[suspectId] ?? emptySuspectState();
      const already = prev.completedTopicIds.includes(topicId);
      if (already && prev.awaitingTopicId !== topicId) return s;
      const next: InterviewSuspectState = {
        ...prev,
        completedTopicIds: already ? prev.completedTopicIds : [...prev.completedTopicIds, topicId],
        awaitingTopicId: prev.awaitingTopicId === topicId ? null : prev.awaitingTopicId,
      };
      return { ...s, suspects: { ...s.suspects, [suspectId]: next } };
    });
  }, []);

  const ask = useCallback(
    (suspectId: string, topicId: string) => {
      const interview = findInterview(pack, suspectId);
      const topic = interview?.topics.find((t) => t.id === topicId);
      if (!interview || !topic) return;
      const current = suspectStateOf(session, suspectId);
      // Idempotent: a double tap, or re-asking a finished / awaiting topic,
      // must not duplicate the transcript, note or completion.
      if (current.completedTopicIds.includes(topicId)) return;
      if (current.awaitingTopicId === topicId) return;
      patch(suspectId, (prev) => ({
        ...prev,
        entries: [...prev.entries, makeEntry({ kind: "CHOICE", text: topic.label })],
        awaitingTopicId: topic.choices?.length ? topicId : (prev.awaitingTopicId ?? null),
      }));
      setPending({ suspectId, topicId, lines: topic.lines });
      applyEffects(suspectId, { mood: topic.mood, note: topic.note });
      if (!topic.choices?.length) {
        // No response to pick — the question is answered the moment it is
        // asked, regardless of how the lines are revealed.
        markTopicDone(suspectId, topicId);
      }
    },
    [pack, session, patch, applyEffects, markTopicDone],
  );

  const choose = useCallback(
    (suspectId: string, choiceId: string) => {
      const interview = findInterview(pack, suspectId);
      const awaiting = suspectStateOf(session, suspectId).awaitingTopicId ?? null;
      const topic = interview?.topics.find((t) => t.id === awaiting);
      const choice = topic?.choices?.find((c) => c.id === choiceId);
      if (!interview || !topic || !choice) return;
      patch(suspectId, (prev) => ({
        ...prev,
        entries: [...prev.entries, makeEntry({ kind: "CHOICE", text: choice.text })],
      }));
      setPending({ suspectId, topicId: topic.id, lines: choice.reply });
      applyEffects(suspectId, {
        mood: choice.mood,
        note: choice.note,
        contradiction: choice.contradiction,
        unlocksTopicIds: choice.unlocksTopicIds,
      });
      markTopicDone(suspectId, topic.id);
    },
    [pack, session, patch, applyEffects, markTopicDone],
  );

  const presentEvidence = useCallback(
    (suspectId: string, evidenceId: string, evidenceTitle: string) => {
      const interview = findInterview(pack, suspectId);
      if (!interview) return;
      const reaction = reactionFor(interview, evidenceId);
      patch(suspectId, (prev) => ({
        ...prev,
        presentedEvidenceIds: Array.from(new Set([...prev.presentedEvidenceIds, evidenceId])),
        entries: [
          ...prev.entries,
          makeEntry({
            kind: "SYSTEM",
            systemKind: "EVIDENCE",
            text: `증거 제시 — ${evidenceTitle}`,
          }),
        ],
      }));
      setPending({ suspectId, topicId: null, lines: reaction?.lines ?? interview.genericReaction });
      if (reaction) {
        applyEffects(suspectId, {
          mood: reaction.mood,
          note: reaction.note,
          contradiction: reaction.contradiction,
        });
      }
    },
    [pack, patch, applyEffects],
  );

  /** Tap-to-skip: reveal every queued line at once. */
  const skip = useCallback(() => {
    if (!pending || pending.lines.length === 0) return;
    const { suspectId, lines } = pending;
    setPending(null);
    patch(suspectId, (prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        ...lines.map((l) => {
          const sp = speakerOf(pack, l.speakerId);
          return makeEntry({
            kind: "LINE",
            speaker: sp?.name ?? "",
            role: sp?.role ?? "WITNESS",
            text: l.text,
          });
        }),
      ],
    }));
  }, [pending, pack, patch]);

  const openRoom = useCallback(
    (suspectId: string) => {
      setSession((s) => ({
        ...s,
        roomId: suspectId,
        suspects: {
          ...s.suspects,
          [suspectId]: { ...(s.suspects[suspectId] ?? emptySuspectState()), unread: false },
        },
      }));
    },
    [],
  );

  const closeRoom = useCallback(() => {
    // Skip only flushes the queued lines. A topic awaiting a response stays
    // awaiting, so re-entering the room shows the same choices.
    skip();
    setSession((s) => ({ ...s, roomId: null }));
  }, [skip]);

  const roomId = session.roomId;
  const stateOf = useCallback(
    (suspectId: string) => suspectStateOf(session, suspectId),
    [session],
  );

  const rooms = useMemo(() => {
    if (!pack) return [];
    return pack.suspects.map((iv) => {
      const st = suspectStateOf(session, iv.suspectId);
      return {
        suspectId: iv.suspectId,
        progress: requiredProgress(iv, st),
        allTopicsProgress: interviewProgress(iv, st),
        complete: isInterviewComplete(iv, st),
        awaitingTopicId: st.awaitingTopicId ?? null,
        mood: st.mood,
        contradictions: st.contradictions,
        notes: st.notes,
        started: st.entries.length > 0,
        unread: st.unread,
      };
    });
  }, [pack, session]);

  const topics = useCallback(
    (suspectId: string) => {
      const iv = findInterview(pack, suspectId);
      if (!iv) return [];
      return topicsFor(iv, suspectStateOf(session, suspectId), requirementContext);
    },
    [pack, session, requirementContext],
  );

  const awaitingTopicId = roomId ? (suspectStateOf(session, roomId).awaitingTopicId ?? null) : null;

  const activeChoices = useMemo(() => {
    if (!roomId || !awaitingTopicId || pending) return [];
    const iv = findInterview(pack, roomId);
    const topic = iv?.topics.find((t) => t.id === awaitingTopicId);
    return topic?.choices ?? [];
  }, [roomId, awaitingTopicId, pending, pack]);

  const incompleteCount = rooms.filter((r) => !r.complete).length;

  return {
    hydrated,
    roomId,
    rooms,
    stateOf,
    topics,
    activeChoices,
    isTyping: !!pending && pending.lines.length > 0,
    incompleteCount,
    awaitingTopicId,
    openRoom,
    closeRoom,
    ask,
    choose,
    presentEvidence,
    skip,
  };
}
