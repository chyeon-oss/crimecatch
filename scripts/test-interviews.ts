/**
 * DETERMINISTIC INTERVIEW COMPLETION TESTS — CASE001 Scene 03 gate.
 *
 * Run: bun scripts/test-interviews.ts
 *
 * These tests model the exact reducer semantics the interview hook uses
 * (ask / choose / skip / room switch / reload) without React, so the Scene 03
 * completion gate is provable rather than observed.
 */
import { getCaseInterviews } from "../src/data/interviews";
import {
  emptySession,
  emptySuspectState,
  findInterview,
  isInterviewComplete,
  migrateSession,
  requiredProgress,
  suspectStateOf,
} from "../src/lib/interviewRuntime";
import type { InterviewSession, InterviewSuspectState } from "../src/types/interview";

let failures = 0;
function check(name: string, ok: boolean, extra?: unknown) {
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${extra !== undefined && !ok ? ` → ${JSON.stringify(extra)}` : ""}`,
  );
  if (!ok) failures++;
}

const pack = getCaseInterviews("midnight-office");
if (!pack) {
  console.log("FAIL  interview pack for midnight-office is missing");
  process.exit(1);
}

// --------------------------------------------------------------------------
// Minimal mirror of the hook reducer (same rules, no React).
// --------------------------------------------------------------------------

interface Sim {
  session: InterviewSession;
  completions: string[];
  notified: Set<string>;
}

const sim = (): Sim => ({ session: emptySession(), completions: [], notified: new Set() });

function patch(s: Sim, id: string, fn: (p: InterviewSuspectState) => InterviewSuspectState) {
  const prev = s.session.suspects[id] ?? emptySuspectState();
  s.session = { ...s.session, suspects: { ...s.session.suspects, [id]: fn(prev) } };
  notify(s);
}

/** Completion callback: exactly once per suspect per "mount". */
function notify(s: Sim) {
  for (const iv of pack!.suspects) {
    if (s.notified.has(iv.suspectId)) continue;
    if (!isInterviewComplete(iv, suspectStateOf(s.session, iv.suspectId))) continue;
    s.notified.add(iv.suspectId);
    s.completions.push(iv.suspectId);
  }
}

function ask(s: Sim, suspectId: string, topicId: string) {
  const iv = findInterview(pack, suspectId);
  const topic = iv?.topics.find((t) => t.id === topicId);
  if (!iv || !topic) return;
  const cur = suspectStateOf(s.session, suspectId);
  if (cur.completedTopicIds.includes(topicId)) return;
  if (cur.awaitingTopicId === topicId) return;
  patch(s, suspectId, (prev) => ({
    ...prev,
    entries: [...prev.entries, { id: `${topicId}-q`, kind: "CHOICE", text: topic.label } as never],
    awaitingTopicId: topic.choices?.length ? topicId : (prev.awaitingTopicId ?? null),
    completedTopicIds: topic.choices?.length
      ? prev.completedTopicIds
      : prev.completedTopicIds.includes(topicId)
        ? prev.completedTopicIds
        : [...prev.completedTopicIds, topicId],
  }));
}

function choose(s: Sim, suspectId: string, choiceId: string) {
  const iv = findInterview(pack, suspectId);
  const awaiting = suspectStateOf(s.session, suspectId).awaitingTopicId ?? null;
  const topic = iv?.topics.find((t) => t.id === awaiting);
  const choice = topic?.choices?.find((c) => c.id === choiceId);
  if (!iv || !topic || !choice) return;
  patch(s, suspectId, (prev) => ({
    ...prev,
    completedTopicIds: prev.completedTopicIds.includes(topic.id)
      ? prev.completedTopicIds
      : [...prev.completedTopicIds, topic.id],
    awaitingTopicId: null,
  }));
}

/** Room switch keeps awaiting state; only the transcript queue is flushed. */
function closeRoom(s: Sim) {
  s.session = { ...s.session, roomId: null };
}

/** Reload = serialise + migrate, then completion callbacks re-fire once. */
function reload(s: Sim): Sim {
  const restored = migrateSession(JSON.parse(JSON.stringify(s.session)));
  const next: Sim = { session: restored ?? emptySession(), completions: [], notified: new Set() };
  notify(next);
  return next;
}

function firstChoiceId(suspectId: string, topicId: string) {
  const iv = findInterview(pack, suspectId);
  return iv?.topics.find((t) => t.id === topicId)?.choices?.[0]?.id ?? null;
}

function completeRequired(s: Sim, suspectId: string) {
  const iv = findInterview(pack, suspectId)!;
  for (const topicId of iv.requiredTopicIds) {
    ask(s, suspectId, topicId);
    const c = firstChoiceId(suspectId, topicId);
    if (c) choose(s, suspectId, c);
  }
}

// --------------------------------------------------------------------------
// (a) requiredTopicIds validity
// --------------------------------------------------------------------------
for (const iv of pack.suspects) {
  const ids = new Set(iv.topics.filter((t) => (t.kind ?? "BASE") !== "PRESSURE").map((t) => t.id));
  const missing = iv.requiredTopicIds.filter((id) => !ids.has(id));
  check(`(a) ${iv.suspectId}: requiredTopicIds are all BASE topics`, missing.length === 0, missing);
  check(`(a) ${iv.suspectId}: requiredTopicIds are unique`, new Set(iv.requiredTopicIds).size === iv.requiredTopicIds.length);
}

// --------------------------------------------------------------------------
// (b) topic without choices completes on ask
// --------------------------------------------------------------------------
{
  const s = sim();
  const iv = findInterview(pack, "s1")!;
  const noChoice = iv.topics.find((t) => iv.requiredTopicIds.includes(t.id) && !t.choices?.length)!;
  ask(s, "s1", noChoice.id);
  check(
    "(b) choice-less topic completes on ask",
    suspectStateOf(s.session, "s1").completedTopicIds.includes(noChoice.id),
  );
}

// --------------------------------------------------------------------------
// (c) topic with choices completes only after the choice
// --------------------------------------------------------------------------
{
  const s = sim();
  const iv = findInterview(pack, "s1")!;
  const withChoice = iv.topics.find((t) => iv.requiredTopicIds.includes(t.id) && t.choices?.length)!;
  ask(s, "s1", withChoice.id);
  const midway = suspectStateOf(s.session, "s1");
  check("(c) awaiting choice → topic not complete", !midway.completedTopicIds.includes(withChoice.id));
  check("(c) awaiting topic recorded on the suspect", midway.awaitingTopicId === withChoice.id);
  choose(s, "s1", withChoice.choices![0].id);
  const after = suspectStateOf(s.session, "s1");
  check("(c) choice completes the topic", after.completedTopicIds.includes(withChoice.id));
  check("(c) awaiting cleared after choice", after.awaitingTopicId === null);
}

// --------------------------------------------------------------------------
// (d) idempotency: repeat asks and repeat choices
// --------------------------------------------------------------------------
{
  const s = sim();
  const iv = findInterview(pack, "s1")!;
  const withChoice = iv.topics.find((t) => iv.requiredTopicIds.includes(t.id) && t.choices?.length)!;
  ask(s, "s1", withChoice.id);
  ask(s, "s1", withChoice.id);
  ask(s, "s1", withChoice.id);
  const cid = withChoice.choices![0].id;
  choose(s, "s1", cid);
  choose(s, "s1", cid);
  ask(s, "s1", withChoice.id);
  const st = suspectStateOf(s.session, "s1");
  const dup = st.completedTopicIds.filter((id) => id === withChoice.id).length;
  const qLines = st.entries.filter((e) => e.kind === "CHOICE").length;
  check("(d) completion recorded exactly once", dup === 1, st.completedTopicIds);
  check("(d) question not duplicated in transcript", qLines === 1, qLines);
}

// --------------------------------------------------------------------------
// (e) room switch + reload round trip keeps the topic completable
// --------------------------------------------------------------------------
{
  let s = sim();
  const iv = findInterview(pack, "s1")!;
  const withChoice = iv.topics.find((t) => iv.requiredTopicIds.includes(t.id) && t.choices?.length)!;
  ask(s, "s1", withChoice.id);
  closeRoom(s); // left mid-choice
  s = reload(s);
  const afterReload = suspectStateOf(s.session, "s1");
  const resumable = afterReload.awaitingTopicId === withChoice.id;
  const reaskable = !afterReload.completedTopicIds.includes(withChoice.id);
  check("(e) reload leaves the topic resumable or re-askable", resumable || reaskable);
  if (resumable) {
    choose(s, "s1", withChoice.choices![0].id);
  } else {
    ask(s, "s1", withChoice.id);
    choose(s, "s1", withChoice.choices![0].id);
  }
  check(
    "(e) topic completes after room switch + reload",
    suspectStateOf(s.session, "s1").completedTopicIds.includes(withChoice.id),
  );
}

// --------------------------------------------------------------------------
// (f) awaiting state is suspect-scoped
// --------------------------------------------------------------------------
{
  const s = sim();
  const iv1 = findInterview(pack, "s1")!;
  const t1 = iv1.topics.find((t) => iv1.requiredTopicIds.includes(t.id) && t.choices?.length)!;
  ask(s, "s1", t1.id);
  completeRequired(s, "s2");
  check("(f) s1 awaiting untouched by s2 progress", suspectStateOf(s.session, "s1").awaitingTopicId === t1.id);
  check("(f) s2 completes while s1 awaits", isInterviewComplete(findInterview(pack, "s2")!, suspectStateOf(s.session, "s2")));
  check("(f) s1 still incomplete", !isInterviewComplete(iv1, suspectStateOf(s.session, "s1")));
}

// --------------------------------------------------------------------------
// (g) completion callback exactly once + reload resync
// --------------------------------------------------------------------------
{
  let s = sim();
  completeRequired(s, "s1");
  completeRequired(s, "s2");
  check("(g) s1+s2 report completion exactly once", JSON.stringify(s.completions) === '["s1","s2"]', s.completions);
  completeRequired(s, "s1");
  check("(g) re-asking does not re-report", s.completions.length === 2, s.completions);
  const p1 = requiredProgress(findInterview(pack, "s1")!, suspectStateOf(s.session, "s1"));
  check("(g) required progress is full for s1", p1.done === p1.total && p1.total === 3, p1);
  s = reload(s);
  check("(g) reload resyncs completion for both suspects", JSON.stringify(s.completions.sort()) === '["s1","s2"]', s.completions);
  check(
    "(g) scene gate satisfied (s1 + s2 complete)",
    ["s1", "s2"].every((id) => isInterviewComplete(findInterview(pack, id)!, suspectStateOf(s.session, id))),
  );
}

// --------------------------------------------------------------------------
// v1 → v2 migration safety
// --------------------------------------------------------------------------
{
  const legacy = {
    version: 1,
    roomId: "s1",
    suspects: { s1: { ...emptySuspectState(), completedTopicIds: ["s1-t-door"] } },
  };
  const migrated = migrateSession(legacy);
  check("(v2) v1 session migrates", migrated?.version === 2);
  check("(v2) v1 progress preserved", migrated?.suspects.s1?.completedTopicIds.includes("s1-t-door") === true);
  check("(v2) v1 awaiting normalised to null", migrated?.suspects.s1?.awaitingTopicId === null);
  check("(v2) unknown payload rejected", migrateSession({ version: 9 }) === null);
}

console.log(failures === 0 ? "\nALL INTERVIEW TESTS PASSED" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
