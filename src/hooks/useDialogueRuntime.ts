import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CaseDialoguePack,
  DialogueEffect,
  DialogueSession,
  TranscriptEntry,
} from "@/types/dialogue";
import {
  emptySession,
  findNode,
  findThread,
  isChoiceAvailable,
  lineDelay,
  loadSession,
  makeEntry,
  saveSession,
  type RequirementContext,
} from "@/lib/dialogueRuntime";

interface Options {
  caseId: string;
  pack: CaseDialoguePack | null;
  requirementContext: RequirementContext;
  /** Host executes focus/investigate/notebook/tab effects. */
  onEffect?: (effect: DialogueEffect) => void;
}

/**
 * React binding for the branching dialogue runtime.
 * Owns the transcript, typing cadence, choices, flags, and localStorage
 * session restore. It never touches the case runtime directly — side effects
 * are handed to the host through `onEffect`.
 */
export function useDialogueRuntime({ caseId, pack, requirementContext, onEffect }: Options) {
  const [session, setSession] = useState<DialogueSession>(emptySession);
  const [hydrated, setHydrated] = useState(false);

  // Restore any previous conversation for this case.
  useEffect(() => {
    const stored = loadSession(caseId);
    if (stored) setSession(stored);
    setHydrated(true);
  }, [caseId]);

  useEffect(() => {
    if (!hydrated) return;
    saveSession(caseId, session);
  }, [caseId, session, hydrated]);

  const effectRef = useRef(onEffect);
  useEffect(() => {
    effectRef.current = onEffect;
  }, [onEffect]);

  const thread = useMemo(
    () => findThread(pack ?? null, session.threadId),
    [pack, session.threadId],
  );
  const node = useMemo(() => findNode(thread, session.nodeId), [thread, session.nodeId]);

  const isTyping = !!node && session.revealed < node.lines.length;
  const awaitingChoice = !!node && !isTyping && (node.choices?.length ?? 0) > 0;

  const speakerName = useCallback(
    (speakerId: string) => pack?.speakers.find((s) => s.id === speakerId) ?? null,
    [pack],
  );

  const applyEffect = useCallback((effect: DialogueEffect | undefined) => {
    if (!effect) return;
    if (effect.setFlags?.length) {
      setSession((s) => ({
        ...s,
        flags: Array.from(new Set([...s.flags, ...effect.setFlags!])),
      }));
    }
    effectRef.current?.(effect);
  }, []);

  /** Reveal the next line of the active node (drives the typing cadence). */
  useEffect(() => {
    if (!node) return;
    if (session.revealed >= node.lines.length) {
      // No choices → auto-continue when authored.
      if ((node.choices?.length ?? 0) === 0 && node.autoNextNodeId) {
        const next = node.autoNextNodeId;
        const t = setTimeout(() => {
          setSession((s) => ({ ...s, nodeId: next, revealed: 0 }));
        }, 420);
        return () => clearTimeout(t);
      }
      if ((node.choices?.length ?? 0) === 0 && !node.autoNextNodeId) {
        const threadId = session.threadId;
        const t = setTimeout(() => {
          setSession((s) => ({
            ...s,
            threadId: null,
            nodeId: null,
            revealed: 0,
            completedThreadIds: threadId
              ? Array.from(new Set([...s.completedThreadIds, threadId]))
              : s.completedThreadIds,
          }));
        }, 320);
        return () => clearTimeout(t);
      }
      return;
    }
    const line = node.lines[session.revealed];
    const sp = speakerName(line.speakerId);
    const t = setTimeout(
      () => {
        setSession((s) => {
          if (s.nodeId !== node.id || s.revealed !== session.revealed) return s;
          return {
            ...s,
            revealed: s.revealed + 1,
            entries: [
              ...s.entries,
              makeEntry({
                kind: "LINE",
                speaker: sp?.name ?? "",
                role: sp?.role ?? "SYSTEM",
                text: line.text,
              }),
            ],
          };
        });
      },
      lineDelay(line.text, line.delayMs),
    );
    return () => clearTimeout(t);
  }, [node, session.revealed, session.threadId, speakerName]);

  /** Tap-to-skip: reveal every remaining line of the active node at once. */
  const skip = useCallback(() => {
    if (!node) return;
    setSession((s) => {
      if (s.nodeId !== node.id || s.revealed >= node.lines.length) return s;
      const rest = node.lines.slice(s.revealed).map((l) => {
        const sp = pack?.speakers.find((x) => x.id === l.speakerId);
        return makeEntry({
          kind: "LINE",
          speaker: sp?.name ?? "",
          role: sp?.role ?? "SYSTEM",
          text: l.text,
        });
      });
      return {
        ...s,
        revealed: node.lines.length,
        entries: [...s.entries, ...rest],
      };
    });
  }, [node, pack]);

  const startThread = useCallback(
    (threadId: string, opts?: { once?: boolean }) => {
      const t = findThread(pack ?? null, threadId);
      if (!t) return;
      setSession((s) => {
        if (s.threadId) return s;
        if (opts?.once && s.completedThreadIds.includes(threadId)) return s;
        return { ...s, threadId, nodeId: t.startNodeId, revealed: 0 };
      });
      const startNode = t.nodes.find((n) => n.id === t.startNodeId);
      applyEffect(startNode?.effectOnEnter);
    },
    [pack, applyEffect],
  );

  const choose = useCallback(
    (choiceId: string) => {
      if (!node) return;
      const choice = node.choices?.find((c) => c.id === choiceId);
      if (!choice) return;
      if (!isChoiceAvailable(choice, requirementContext)) return;

      setSession((s) => ({
        ...s,
        entries: [...s.entries, makeEntry({ kind: "CHOICE", text: choice.text })],
      }));
      applyEffect(choice.effect);

      const goTo = choice.effect?.goToNodeId;
      if (goTo) {
        setSession((s) => ({ ...s, nodeId: goTo, revealed: 0 }));
        const nextNode = thread?.nodes.find((n) => n.id === goTo);
        applyEffect(nextNode?.effectOnEnter);
      } else {
        const threadId = session.threadId;
        setSession((s) => ({
          ...s,
          threadId: null,
          nodeId: null,
          revealed: 0,
          completedThreadIds: threadId
            ? Array.from(new Set([...s.completedThreadIds, threadId]))
            : s.completedThreadIds,
        }));
      }
    },
    [node, thread, requirementContext, applyEffect, session.threadId],
  );

  /** Append an authored thread's lines to the transcript at once (scene beats). */
  const logThread = useCallback(
    (threadId: string) => {
      const t = findThread(pack ?? null, threadId);
      if (!t) return;
      const start = t.nodes.find((n) => n.id === t.startNodeId) ?? t.nodes[0];
      if (!start) return;
      const entries = start.lines.map((l) => {
        const sp = pack?.speakers.find((x) => x.id === l.speakerId);
        return makeEntry({
          kind: "LINE",
          speaker: sp?.name ?? "",
          role: sp?.role ?? "SYSTEM",
          text: l.text,
        });
      });
      setSession((s) => ({
        ...s,
        entries: [...s.entries, ...entries],
        completedThreadIds: Array.from(new Set([...s.completedThreadIds, threadId])),
      }));
    },
    [pack],
  );

  /** Push a system card (new evidence, new question, scene change). */
  const logSystem = useCallback((text: string, systemKind: TranscriptEntry["systemKind"]) => {
    setSession((s) =>
      s.entries.some((e) => e.kind === "SYSTEM" && e.text === text)
        ? s
        : {
            ...s,
            entries: [...s.entries, makeEntry({ kind: "SYSTEM", text, systemKind })],
          },
    );
  }, []);

  const availableChoices = useMemo(() => {
    if (!awaitingChoice || !node?.choices) return [];
    return node.choices.map((c) => ({
      choice: c,
      available: isChoiceAvailable(c, requirementContext),
    }));
  }, [awaitingChoice, node, requirementContext]);

  /** Lines of a thread, for scene-surface subtitles. */
  const threadBeats = useCallback(
    (threadId: string) => {
      const t = findThread(pack ?? null, threadId);
      const start = t?.nodes.find((n) => n.id === t.startNodeId) ?? t?.nodes[0];
      return (start?.lines ?? []).map((l) => ({
        speaker: pack?.speakers.find((x) => x.id === l.speakerId)?.name ?? "",
        text: l.text,
      }));
    },
    [pack],
  );

  return {
    hydrated,
    entries: session.entries,
    flags: session.flags,
    completedThreadIds: session.completedThreadIds,
    activeThreadTitle: thread?.title ?? null,
    isTyping,
    awaitingChoice,
    availableChoices,
    hasActiveThread: !!thread,
    startThread,
    choose,
    skip,
    logThread,
    logSystem,
    threadBeats,
  };
}
