import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CaseEngine } from "@/engine";

export default defineTool({
  name: "list_cases",
  title: "List detective cases",
  description:
    "List every detective case available in this app, with id, slug, title, subtitle, difficulty, status, and estimated play time in minutes.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const items = CaseEngine.list().map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      difficulty: c.difficulty,
      status: c.status,
      estimatedMinutes: c.estimatedMinutes,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { cases: items },
    };
  },
});
