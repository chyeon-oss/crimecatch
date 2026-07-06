import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CaseEngine } from "@/engine";

export default defineTool({
  name: "investigate_hotspot",
  title: "Investigate a crime scene hotspot",
  description:
    "Simulate investigating a hotspot in a case's crime scene. Returns the evidence revealed at that hotspot (or an empty-scene message).",
  inputSchema: {
    caseId: z.string().min(1).describe("Case id or slug"),
    hotspotId: z.string().min(1).describe("Hotspot id from the case's crime scene"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ caseId, hotspotId }) => {
    const c = CaseEngine.get(caseId);
    if (!c) {
      return { content: [{ type: "text", text: `Unknown case: ${caseId}` }], isError: true };
    }
    const h = c.crimeScene?.hotspots.find((x) => x.id === hotspotId);
    if (!h) {
      const known = c.crimeScene?.hotspots.map((x) => x.id).join(", ") ?? "(none)";
      return {
        content: [{ type: "text", text: `Unknown hotspot '${hotspotId}'. Known: ${known}` }],
        isError: true,
      };
    }
    const discovered = h.revealsEvidenceIds
      .map((id) => c.evidence.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => !!e)
      .map(({ id, title, category, summary, detail, location }) => ({
        id,
        title,
        category,
        summary,
        detail,
        location,
      }));
    const payload = {
      hotspot: { id: h.id, label: h.label },
      discovered,
      emptyMessage: discovered.length === 0 ? (h.emptyMessage ?? "특별한 단서를 찾지 못했다.") : null,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
