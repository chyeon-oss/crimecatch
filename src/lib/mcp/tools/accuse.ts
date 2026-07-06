import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CaseEngine } from "@/engine";

export default defineTool({
  name: "accuse_suspect",
  title: "Accuse a suspect",
  description:
    "Submit a final accusation for a case. Returns whether the suspect is the culprit and the full solution once submitted.",
  inputSchema: {
    caseId: z.string().min(1).describe("Case id or slug"),
    suspectId: z.string().min(1).describe("Suspect id being accused"),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: ({ caseId, suspectId }) => {
    const c = CaseEngine.get(caseId);
    if (!c) {
      return { content: [{ type: "text", text: `Unknown case: ${caseId}` }], isError: true };
    }
    const suspect = c.suspects.find((s) => s.id === suspectId);
    if (!suspect) {
      return {
        content: [{ type: "text", text: `Unknown suspect '${suspectId}'` }],
        isError: true,
      };
    }
    const correct = c.solution.culpritId === suspectId;
    const payload = {
      correct,
      accused: { id: suspect.id, name: suspect.name },
      solution: c.solution,
    };
    return {
      content: [
        {
          type: "text",
          text: `${correct ? "정답" : "오답"} — ${suspect.name}\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
      structuredContent: payload,
    };
  },
});
