import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CaseEngine } from "@/engine";

export default defineTool({
  name: "get_case",
  title: "Get case briefing",
  description:
    "Return the full case briefing (description, victim, incident time & location, suspects, evidence, timeline) for a given case id or slug. Does NOT reveal the solution.",
  inputSchema: {
    caseId: z.string().min(1).describe("Case id or slug (e.g. 'midnight-office')"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ caseId }) => {
    const c = CaseEngine.get(caseId);
    if (!c) {
      return {
        content: [{ type: "text", text: `Unknown case: ${caseId}` }],
        isError: true,
      };
    }
    const { solution: _s, hiddenFacts: _h, ...safe } = c;
    // Strip hiddenTruth / isCulprit from suspects
    const suspects = c.suspects.map(({ hiddenTruth: _t, isCulprit: _i, ...rest }) => rest);
    const payload = { ...safe, suspects };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
