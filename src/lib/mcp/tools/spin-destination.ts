import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { cities } from "../../data/cities";
import { calculateMatchScore, generateIntel } from "../../lib/scoring";

export default defineTool({
  name: "spin_destination",
  title: "Spin for a destination",
  description:
    "Run the Nomad Spin scoring engine and return the top matching destinations for the given preferences.",
  inputSchema: {
    maxBudgetUSD: z.number().positive().default(2000).describe("Max monthly cost in USD."),
    minInternetMbps: z.number().min(0).default(30).describe("Minimum internet speed in Mbps."),
    minSafety: z.number().min(0).max(10).default(6).describe("Minimum safety rating (0-10)."),
    region: z
      .enum(["Asia", "Europe", "LATAM", "Africa", "Oceania", "North America"])
      .optional(),
    topN: z.number().int().min(1).max(10).default(3),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: ({ maxBudgetUSD, minInternetMbps, minSafety, region, topN }) => {
    const pool = cities.filter((c) => {
      if (region && c.region !== region) return false;
      return (
        c.costUSD <= maxBudgetUSD &&
        c.internetMbps >= minInternetMbps &&
        c.safety >= minSafety
      );
    });

    const ranked = pool
      .map((c) => ({
        city: c,
        score: calculateMatchScore(c, maxBudgetUSD, minInternetMbps, minSafety, null),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map(({ city, score }) => ({
        id: city.id,
        name: city.name,
        country: city.country,
        region: city.region,
        costUSD: city.costUSD,
        internetMbps: city.internetMbps,
        safety: city.safety,
        matchScore: score,
        intel: generateIntel(city, maxBudgetUSD, minInternetMbps, null),
      }));

    const text = ranked.length
      ? `Top ${ranked.length} destinations:\n${ranked
          .map((r, i) => `${i + 1}. ${r.name}, ${r.country} — $${r.costUSD}/mo, ${r.internetMbps} Mbps, safety ${r.safety}/10 (score ${r.matchScore})`)
          .join("\n")}`
      : "No cities matched those preferences. Try relaxing budget, internet, or safety.";

    return {
      content: [{ type: "text", text }],
      structuredContent: { results: ranked },
    };
  },
});
