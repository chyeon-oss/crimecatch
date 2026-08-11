import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const publicFiles = [
  "src/content/cases/midnight-office/briefing.ts",
  "src/content/cases/midnight-office/victim.ts",
  "src/content/cases/midnight-office/timeline.ts",
  "src/content/cases/midnight-office/scene.ts",
  "src/content/cases/midnight-office/dialogue/scene01.ts",
  "src/components/CaseIntro.tsx",
];
const combined = publicFiles.map(read).join("\n");

const forbidden = ["김도현", "노바코어", "14F", "22:31", "22:41", "22:57"];
const leaked = forbidden.filter((token) => combined.includes(token));
if (leaked.length) {
  throw new Error(`CASE001 legacy setting leak: ${leaked.join(", ")}`);
}

const required = ["한도윤", "블루웨이브 솔루션즈", "12층", "23:50", "23:52", "00:08"];
const missing = required.filter((token) => !combined.includes(token));
if (missing.length) {
  throw new Error(`CASE001 canonical setting missing: ${missing.join(", ")}`);
}

const runtimeSession = read("src/lib/runtimeSession.ts");
for (const action of [
  "INVESTIGATE_HOTSPOT",
  "READ_EVIDENCE",
  "INTERVIEW_SUSPECT",
  "SOLVE_QUESTION",
  "ADVANCE_SCENE",
]) {
  if (!runtimeSession.includes(`\"${action}\"`)) {
    throw new Error(`Existing-save replay action missing: ${action}`);
  }
}

const progressEngine = read("src/engine/ProgressEngine.ts");
if (!progressEngine.includes("migrate(raw: unknown)")) {
  throw new Error("Legacy progress migration is missing");
}

const dialogueRuntime = read("src/lib/dialogueRuntime.ts");
if (!dialogueRuntime.includes("LEGACY_TRANSCRIPT_REWRITES")) {
  throw new Error("Legacy CASE001 dialogue migration is missing");
}

console.log("CASE001 canonical content and save-compatibility checks passed");
