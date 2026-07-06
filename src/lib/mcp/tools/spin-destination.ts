import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { cities } from "../../../data/cities";

function score(cost: number, mbps: number, safety: number, budgetMax: number, mbpsMin: number, safetyMin: number): number {
  const budget = cost <= budgetMax ? 80 + (1 - cost / budgetMax) * 20 : Math.max(0, 80 - ((cost - budgetMax) / budgetMax) * 200);
  const net = mbps >= mbpsMin ? 60 + Math.min(40, ((mbps - mbpsMin) / Math.max(mbpsMin, 1)) * 20) : Math.max(0, (mbps / mbpsMin) * 40);
  const safe = safety >= safetyMin ? 60 + Math.min(40, (safety - safetyMin) * 8) : Math.max(0, (safety / safetyMin) * 30);
  return Math.round(budget * 0.4 + net * 0.3 + safe * 0.3);
}

export default defineTool({
  name: "spin_destination",
  title: "Spin for a destination",
  description:
    "Rank cities against nomad preferences (budget, internet, safety, region) and return the top matches with match scores.",
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
    const ranked = cities
      .filter((c) => {
        if (region && c.region !== region) return false;
        return c.costUSD <= maxBudgetUSD && c.internetMbps >= minInternetMbps && c.safety >= minSafety;
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        region: c.region,
        costUSD: c.costUSD,
        internetMbps: c.internetMbps,
        safety: c.safety,
        vibe: c.vibe,
        matchScore: score(c.costUSD, c.internetMbps, c.safety, maxBudgetUSD, minInternetMbps, minSafety),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, topN);

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
