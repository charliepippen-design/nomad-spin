import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { cities } from "../../data/cities.ts";

export default defineTool({
  name: "get_city",
  title: "Get city details",
  description:
    "Fetch the full destination profile (financials, infra, weather, visa, taxation, pros/cons) for one city by id or name.",
  inputSchema: {
    idOrName: z.string().min(1).describe("City id (e.g. 'lisbon') or display name (e.g. 'Lisbon')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ idOrName }) => {
    const needle = idOrName.toLowerCase().trim();
    const city = cities.find(
      (c) => c.id.toLowerCase() === needle || c.name.toLowerCase() === needle,
    );
    if (!city) {
      return {
        content: [{ type: "text", text: `No city found for "${idOrName}".` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(city, null, 2) }],
      structuredContent: { city },
    };
  },
});
