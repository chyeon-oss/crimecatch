import { defineMcp } from "@lovable.dev/mcp-js";
import listCasesTool from "./tools/list-cases";
import getCaseTool from "./tools/get-case";
import investigateHotspotTool from "./tools/investigate-hotspot";
import accuseSuspectTool from "./tools/accuse";

export default defineMcp({
  name: "casenote-mcp",
  title: "CaseNote Detective MCP",
  version: "0.1.0",
  instructions:
    "Tools for the CaseNote detective game. Use `list_cases` to discover cases, `get_case` for the briefing (no spoilers), `investigate_hotspot` to reveal evidence at a crime-scene location, and `accuse_suspect` to submit a final accusation.",
  tools: [listCasesTool, getCaseTool, investigateHotspotTool, accuseSuspectTool],
});
