/**
 * CASE002 (inheritance-party) Scene 03 interview tests.
 *
 * Run: bun run scripts/test-case002-interviews.ts
 *
 * Mirrors the reducer semantics of useInterviewRuntime (ask / choose / room
 * switch / reload) without React, so the Scene 03 completion gate and the
 * spoiler isolation of the authored pack are provable.
 */
import { readFileSync } from "node:fs";
import { getCaseInterviews } from "@/data/interviews";
import { getRuntimeDefinition } from "@/data/runtime";
import { inheritanceParty } from "@/content/cases/inheritance-party";
import {
  emptySession,
  emptySuspectState,
  findInterview,
  isInterviewComplete,
  migrateSession,
  reactionFor,
  requiredProgress,
  suspectStateOf,
} from "@/lib/interviewRuntime";
import type { InterviewSession, InterviewSuspectState } from "@/types/interview";

let failures = 0;
function check(name: string, ok: boolean, extra?: unknown) {
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${extra !== undefined && !ok ? ` → ${JSON.stringify(extra)}` : ""}`,
  );
  if (!ok) failures++;
}

const CASE_ID = "inheritance-party";
const pack = getCaseInterviews(CASE_ID);
if (!pack) {
  console.log("FAIL  interview pack for inheritance-party is missing");
  process.exit(1);
}
const def = getRuntimeDefinition(CASE_ID)!;

// --------------------------------------------------------------------------
// Reducer mirror
// --------------------------------------------------------------------------
interface Sim {
  session: InterviewSession;
  completions: string[];
  notified: Set<string>;
}
const sim = (): Sim => ({ session: emptySession(), completions: [], notified: new Set() });

function notify(s: Sim) {
  for (const iv of pack!.suspects) {
    if (s.notified.has(iv.suspectId)) continue;
    if (!isInterviewComplete(iv, suspectStateOf(s.session, iv.suspectId))) continue;
    s.notified.add(iv.suspectId);
    s.completions.push(iv.suspectId);
  }
}
function patch(s: Sim, id: string, fn: (p: InterviewSuspectState) => InterviewSuspectState) {
  const prev = s.session.suspects[id] ?? emptySuspectState();
  s.session = { ...s.session, suspects: { ...s.session.suspects, [id]: fn(prev) } };
  notify(s);
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
/** Evidence presentation: records the reaction, mood, note, contradiction unlocks. */
function present(s: Sim, suspectId: string, evidenceId: string) {
  const iv = findInterview(pack, suspectId);
  if (!iv) return;
  const reaction = reactionFor(iv, evidenceId);
  patch(s, suspectId, (prev) => ({
    ...prev,
    presentedEvidenceIds: prev.presentedEvidenceIds.includes(evidenceId)
      ? prev.presentedEvidenceIds
      : [...prev.presentedEvidenceIds, evidenceId],
    mood: reaction?.mood ?? prev.mood,
    notes: reaction?.note ? [...prev.notes, reaction.note] : prev.notes,
    contradictions: reaction?.contradiction
      ? prev.contradictions.some((c) => c.id === reaction.contradiction!.id)
        ? prev.contradictions
        : [
            ...prev.contradictions,
            {
              id: reaction.contradiction.id,
              title: reaction.contradiction.title,
              detail: reaction.contradiction.detail,
            },
          ]
      : prev.contradictions,
    unlockedTopicIds: Array.from(
      new Set([...prev.unlockedTopicIds, ...(reaction?.contradiction?.unlocksTopicIds ?? [])]),
    ),
  }));
}
function closeRoom(s: Sim) {
  s.session = { ...s.session, roomId: null };
}
function reload(s: Sim): Sim {
  const restored = migrateSession(JSON.parse(JSON.stringify(s.session)));
  const next: Sim = { session: restored ?? emptySession(), completions: [], notified: new Set() };
  notify(next);
  return next;
}
function completeRequired(s: Sim, suspectId: string) {
  const iv = findInterview(pack, suspectId)!;
  for (const topicId of iv.requiredTopicIds) {
    ask(s, suspectId, topicId);
    const c = iv.topics.find((t) => t.id === topicId)?.choices?.[0]?.id;
    if (c) choose(s, suspectId, c);
  }
}

// --------------------------------------------------------------------------
// (a) structure
// --------------------------------------------------------------------------
check("(a) pack caseId matches CASE002", pack.caseId === CASE_ID);
check("(a) four suspects authored", pack.suspects.length === 4, pack.suspects.map((s) => s.suspectId));
const runtimeSuspects = new Set(def.suspectIds);
const evidenceIds = new Set(inheritanceParty.evidence.map((e) => e.id));
const speakerIds = new Set(pack.speakers.map((s) => s.id));

for (const iv of pack.suspects) {
  const base = iv.topics.filter((t) => (t.kind ?? "BASE") !== "PRESSURE");
  const baseIds = new Set(base.map((t) => t.id));
  const pressure = iv.topics.filter((t) => t.kind === "PRESSURE");
  const bubbles = iv.topics.reduce(
    (n, t) => n + t.lines.length + (t.choices ?? []).reduce((m, c) => m + c.reply.length, 0),
    0,
  );
  const choiceTopics = base.filter((t) => (t.choices?.length ?? 0) > 0);

  check(`(a) ${iv.suspectId} exists in runtime suspectIds`, runtimeSuspects.has(iv.suspectId));
  check(`(a) ${iv.suspectId} speaker resolves`, speakerIds.has(iv.speakerId));
  check(
    `(a) ${iv.suspectId} requiredTopicIds are BASE topics`,
    iv.requiredTopicIds.every((id) => baseIds.has(id)),
    iv.requiredTopicIds.filter((id) => !baseIds.has(id)),
  );
  check(
    `(a) ${iv.suspectId} requiredTopicIds unique and >= 3`,
    new Set(iv.requiredTopicIds).size === iv.requiredTopicIds.length &&
      iv.requiredTopicIds.length >= 3,
    iv.requiredTopicIds,
  );
  check(`(a) ${iv.suspectId} has 8~40 authored bubbles`, bubbles >= 8 && bubbles <= 40, bubbles);
  check(`(a) ${iv.suspectId} has 2~3 choice topics`, choiceTopics.length >= 2, choiceTopics.length);
  check(`(a) ${iv.suspectId} has at least one PRESSURE topic`, pressure.length >= 1);
  check(
    `(a) ${iv.suspectId} lines use known speakers`,
    iv.topics.every((t) =>
      [...t.lines, ...(t.choices ?? []).flatMap((c) => c.reply)].every((l) =>
        speakerIds.has(l.speakerId),
      ),
    ),
  );
  check(
    `(a) ${iv.suspectId} evidence reactions reference real evidence`,
    iv.evidenceReactions.every((r) => r.evidenceIds.every((id) => evidenceIds.has(id))),
    iv.evidenceReactions.flatMap((r) => r.evidenceIds).filter((id) => !evidenceIds.has(id)),
  );
  check(`(a) ${iv.suspectId} has a generic reaction`, iv.genericReaction.length >= 1);
}

// --------------------------------------------------------------------------
// (b) completion semantics
// --------------------------------------------------------------------------
{
  const s = sim();
  const iv = findInterview(pack, "s1")!;
  const noChoice = iv.topics.find((t) => iv.requiredTopicIds.includes(t.id) && !t.choices?.length)!;
  ask(s, "s1", noChoice.id);
  check(
    "(b) choice-less required topic completes on ask",
    suspectStateOf(s.session, "s1").completedTopicIds.includes(noChoice.id),
  );

  const withChoice = iv.topics.find((t) => iv.requiredTopicIds.includes(t.id) && t.choices?.length)!;
  ask(s, "s1", withChoice.id);
  check(
    "(b) awaiting choice → topic not complete",
    !suspectStateOf(s.session, "s1").completedTopicIds.includes(withChoice.id),
  );
  choose(s, "s1", withChoice.choices![0].id);
  check(
    "(b) choice completes the topic",
    suspectStateOf(s.session, "s1").completedTopicIds.includes(withChoice.id),
  );
  check("(b) opening a room alone does not complete", !isInterviewComplete(iv, suspectStateOf(s.session, "s1")));
}

// --------------------------------------------------------------------------
// (c) evidence reaction → contradiction → pressure unlock, per suspect
// --------------------------------------------------------------------------
for (const iv of pack.suspects) {
  const withContradiction = iv.evidenceReactions.filter((r) => r.contradiction);
  check(`(c) ${iv.suspectId} has >= 1 evidence contradiction`, withContradiction.length >= 1);
  const unlocks = withContradiction.flatMap((r) => r.contradiction!.unlocksTopicIds ?? []);
  const pressureIds = new Set(iv.topics.filter((t) => t.kind === "PRESSURE").map((t) => t.id));
  check(
    `(c) ${iv.suspectId} contradiction unlocks a PRESSURE topic`,
    unlocks.length >= 1 && unlocks.every((id) => pressureIds.has(id)),
    unlocks,
  );

  const s = sim();
  const trigger = withContradiction[0]!;
  present(s, iv.suspectId, trigger.evidenceIds[0]);
  const st = suspectStateOf(s.session, iv.suspectId);
  check(`(c) ${iv.suspectId} presenting records the contradiction`, st.contradictions.length === 1);
  check(
    `(c) ${iv.suspectId} pressure topic becomes available`,
    (trigger.contradiction!.unlocksTopicIds ?? []).every((id) => st.unlockedTopicIds.includes(id)),
  );
  present(s, iv.suspectId, trigger.evidenceIds[0]);
  check(
    `(c) ${iv.suspectId} re-presenting is idempotent`,
    suspectStateOf(s.session, iv.suspectId).contradictions.length === 1,
  );
  check(`(c) ${iv.suspectId} note recorded for the case file`, st.notes.length >= 1);
}

// --------------------------------------------------------------------------
// (d) spoiler isolation
// --------------------------------------------------------------------------
{
  const src = readFileSync("src/content/cases/inheritance-party/interviews.ts", "utf8");
  const importLines = (text: string) =>
    text.split("\n").filter((l) => /^\s*(import|export)\s.*from\s/.test(l)).join("\n");
  const banned = ["_spoilers", "_truth", "AUTHOR_BIBLE"];
  for (const token of banned) {
    check(`(d) interviews.ts does not import ${token}`, !importLines(src).includes(token));
  }
  for (const token of ["isCulprit", "hiddenTruth", "answerKey"]) {
    check(`(d) interviews.ts does not reference ${token}`, !src.includes(token));
  }
  const confession = ["제가 죽였", "제가 독을 넣었", "범인은 저", "자백"];
  for (const token of confession) {
    check(`(d) no confession prose ("${token}")`, !src.includes(token));
  }
  const dialogueSrc = readFileSync(
    "src/content/cases/inheritance-party/dialogue/scene03.ts",
    "utf8",
  );
  for (const token of ["_spoilers", "_truth", "AUTHOR_BIBLE"]) {
    check(`(d) scene03 dialogue does not import ${token}`, !importLines(dialogueSrc).includes(token));
  }
  for (const token of ["isCulprit", "hiddenTruth"]) {
    check(`(d) scene03 dialogue does not reference ${token}`, !dialogueSrc.includes(token));
  }
}

// --------------------------------------------------------------------------
// (e) reload / room switch / idempotency
// --------------------------------------------------------------------------
{
  let s = sim();
  const iv = findInterview(pack, "s2")!;
  const withChoice = iv.topics.find((t) => iv.requiredTopicIds.includes(t.id) && t.choices?.length)!;
  ask(s, "s2", withChoice.id);
  closeRoom(s);
  s = reload(s);
  const after = suspectStateOf(s.session, "s2");
  const resumable = after.awaitingTopicId === withChoice.id;
  check("(e) reload keeps the topic resumable", resumable);
  choose(s, "s2", withChoice.choices![0].id);
  check(
    "(e) topic completes after room switch + reload",
    suspectStateOf(s.session, "s2").completedTopicIds.includes(withChoice.id),
  );
  ask(s, "s2", withChoice.id);
  ask(s, "s2", withChoice.id);
  const st = suspectStateOf(s.session, "s2");
  check(
    "(e) completion recorded exactly once",
    st.completedTopicIds.filter((id) => id === withChoice.id).length === 1,
  );
  check(
    "(e) question not duplicated in the transcript",
    st.entries.filter((e) => e.kind === "CHOICE").length === 1,
  );
}

// --------------------------------------------------------------------------
// (f) s1 + s2 completion satisfies the Scene 03 gate
// --------------------------------------------------------------------------
{
  let s = sim();
  const scene03 = def.scenes.find((sc) => sc.id === "scene-03")!;
  const required = scene03.completionCondition?.requiresInterviewedSuspectIds ?? [];
  check("(f) Scene 03 requires s1 + s2 interviews", JSON.stringify(required) === '["s1","s2"]', required);

  completeRequired(s, "s1");
  completeRequired(s, "s2");
  check("(f) completion callbacks fire once each", JSON.stringify(s.completions) === '["s1","s2"]', s.completions);
  completeRequired(s, "s1");
  check("(f) re-asking does not re-report", s.completions.length === 2);
  for (const id of required) {
    const p = requiredProgress(findInterview(pack, id)!, suspectStateOf(s.session, id));
    check(`(f) ${id} required progress full`, p.done === p.total && p.total >= 3, p);
  }
  s = reload(s);
  check(
    "(f) reload resyncs the gate",
    JSON.stringify([...s.completions].sort()) === '["s1","s2"]',
    s.completions,
  );
  check(
    "(f) s3/s4 remain optional (incomplete)",
    ["s3", "s4"].every((id) => !isInterviewComplete(findInterview(pack, id)!, suspectStateOf(s.session, id))),
  );
}

// --------------------------------------------------------------------------
// (g) authored pack registered → route fallback cannot render
// --------------------------------------------------------------------------
{
  check("(g) getCaseInterviews resolves CASE002", getCaseInterviews(CASE_ID) !== null);
  const routeSrc = readFileSync("src/routes/case.$caseId.investigate.tsx", "utf8");
  check(
    "(g) statement-log fallback is gated on a missing pack",
    routeSrc.includes("!interviewPack && requiredInterviewIds.length > 0"),
  );
  check("(g) CASE001 pack untouched", getCaseInterviews("midnight-office")?.suspects.length === 4);
}

console.log(failures === 0 ? "\nALL CASE002 INTERVIEW TESTS PASSED" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
