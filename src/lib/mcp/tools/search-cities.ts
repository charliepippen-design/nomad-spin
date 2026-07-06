import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { cities } from "../../data/cities.ts";

export default defineTool({
  name: "search_cities",
  title: "Search nomad cities",
  description:
    "Search the Digital Nomad Spin city database by name, country, region, or vibe tag. Returns matching cities with key stats.",
  inputSchema: {
    query: z.string().optional().describe("Free-text match on city name, country, or vibe tag."),
    region: z
      .enum(["Asia", "Europe", "LATAM", "Africa", "Oceania", "North America"])
      .optional()
      .describe("Filter by region."),
    maxCostUSD: z.number().positive().optional().describe("Max monthly cost in USD."),
    minSafety: z.number().min(0).max(10).optional().describe("Minimum safety rating (0-10)."),
    minInternetMbps: z.number().min(0).optional().describe("Minimum internet speed in Mbps."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, region, maxCostUSD, minSafety, minInternetMbps, limit }) => {
    const q = query?.toLowerCase().trim();
    const matches = cities
      .filter((c) => {
        if (region && c.region !== region) return false;
        if (maxCostUSD != null && c.costUSD > maxCostUSD) return false;
        if (minSafety != null && c.safety < minSafety) return false;
        if (minInternetMbps != null && c.internetMbps < minInternetMbps) return false;
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.vibe.some((v) => v.toLowerCase().includes(q))
        );
      })
      .slice(0, limit)
      .map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        region: c.region,
        costUSD: c.costUSD,
        safety: c.safety,
        internetMbps: c.internetMbps,
        vibe: c.vibe,
        visa: c.visa,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify({ count: matches.length, matches }, null, 2) }],
      structuredContent: { count: matches.length, matches },
    };
  },
});
