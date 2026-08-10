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
  const [awaitingTopicId, setAwaitingTopicId] = useState<string | null>(null);

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
  const notifyIfComplete = useCallback(
    (suspectId: string, next: InterviewSuspectState) => {
      const interview = findInterview(pack, suspectId);
      if (!interview) return;
      if (notifiedRef.current.has(suspectId)) return;
      if (!isInterviewComplete(interview, next)) return;
      notifiedRef.current.add(suspectId);
      completeRef.current?.(suspectId);
    },
    [pack],
  );

  // Report interviews already completed in a restored session.
  useEffect(() => {
    if (!hydrated || !pack) return;
    for (const iv of pack.suspects) {
      notifyIfComplete(iv.suspectId, suspectStateOf(session, iv.suspectId));
    }
    // Only on hydration / pack change — later completions are reported inline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, pack]);

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
      setPending(rest.length ? { suspectId: pending.suspectId, lines: rest } : null);
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

  const markTopicDone = useCallback(
    (suspectId: string, topicId: string) => {
      setSession((s) => {
        const prev = s.suspects[suspectId] ?? emptySuspectState();
        if (prev.completedTopicIds.includes(topicId)) return s;
        const next: InterviewSuspectState = {
          ...prev,
          completedTopicIds: [...prev.completedTopicIds, topicId],
        };
        notifyIfComplete(suspectId, next);
        return { ...s, suspects: { ...s.suspects, [suspectId]: next } };
      });
    },
    [notifyIfComplete],
  );

  const ask = useCallback(
    (suspectId: string, topicId: string) => {
      const interview = findInterview(pack, suspectId);
      const topic = interview?.topics.find((t) => t.id === topicId);
      if (!interview || !topic) return;
      patch(suspectId, (prev) => ({
        ...prev,
        entries: [...prev.entries, makeEntry({ kind: "CHOICE", text: topic.label })],
      }));
      setPending({ suspectId, lines: topic.lines });
      applyEffects(suspectId, { mood: topic.mood, note: topic.note });
      if (topic.choices?.length) {
        setAwaitingTopicId(topicId);
      } else {
        markTopicDone(suspectId, topicId);
      }
    },
    [pack, patch, applyEffects, markTopicDone],
  );

  const choose = useCallback(
    (suspectId: string, choiceId: string) => {
      const interview = findInterview(pack, suspectId);
      const topic = interview?.topics.find((t) => t.id === awaitingTopicId);
      const choice = topic?.choices?.find((c) => c.id === choiceId);
      if (!interview || !topic || !choice) return;
      patch(suspectId, (prev) => ({
        ...prev,
        entries: [...prev.entries, makeEntry({ kind: "CHOICE", text: choice.text })],
      }));
      setAwaitingTopicId(null);
      setPending({ suspectId, lines: choice.reply });
      applyEffects(suspectId, {
        mood: choice.mood,
        note: choice.note,
        contradiction: choice.contradiction,
        unlocksTopicIds: choice.unlocksTopicIds,
      });
      markTopicDone(suspectId, topic.id);
    },
    [pack, awaitingTopicId, patch, applyEffects, markTopicDone],
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
      setPending({ suspectId, lines: reaction?.lines ?? interview.genericReaction });
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
      setAwaitingTopicId(null);
    },
    [],
  );

  const closeRoom = useCallback(() => {
    skip();
    setAwaitingTopicId(null);
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
        progress: interviewProgress(iv, st),
        complete: isInterviewComplete(iv, st),
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
    openRoom,
    closeRoom,
    ask,
    choose,
    presentEvidence,
    skip,
  };
}
