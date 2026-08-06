import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Accept only plausible place names (letters, spaces, and common punctuation). */
function isSafeName(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= 80 &&
    /^[\p{L}\p{M}\p{N}\s'’.\-()/,]+$/u.test(v);
}

/** Deterministic, server-derived cache key. */
function makeSlug(cityName: string, country: string): string {
  return `${cityName} ${country}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { cityName, country } = await req.json();
    if (!isSafeName(cityName) || !isSafeName(country)) {
      return new Response(JSON.stringify({ error: "Invalid cityName or country" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Cache key derived server-side from validated inputs so a request can never
    // overwrite the cached entry of an unrelated (real) city.
    const slug = makeSlug(cityName, country);


    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Check cache first
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const cacheRes = await fetch(`${SUPABASE_URL}/rest/v1/city_enrichment_cache?slug=eq.${encodeURIComponent(slug)}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const cached = await cacheRes.json();
    if (cached && cached.length > 0) {
      return new Response(JSON.stringify(cached[0].enrichment_data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call AI to enrich
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a travel data assistant. Return structured data about cities for digital nomads. Be factual and concise."
          },
          {
            role: "user",
            content: `Provide enrichment data for ${cityName}, ${country}. I need: primary language spoken, landscape type(s), income tax info for nomads, monthly health insurance cost estimate, eSIM availability, and any important legal notes (especially regarding drugs, prostitution, or unusual local laws). Use the provided tool to return structured data.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "enrich_city",
              description: "Return structured enrichment data for a city",
              parameters: {
                type: "object",
                properties: {
                  language: { type: "string", description: "Primary language spoken" },
                  landscape: {
                    type: "array",
                    items: { type: "string", enum: ["seaside", "mountain", "urban", "rural", "island", "desert"] },
                    description: "Landscape types that apply"
                  },
                  taxation: {
                    type: "object",
                    properties: {
                      incomeTax: { type: "string", description: "Brief tax rate description" },
                      notes: { type: "string", description: "Tax notes relevant to nomads" }
                    },
                    required: ["incomeTax", "notes"]
                  },
                  healthInsurance: {
                    type: "object",
                    properties: {
                      costMonthly: { type: "number", description: "Estimated monthly cost in USD" },
                      quality: { type: "number", description: "Quality rating 1-10" }
                    },
                    required: ["costMonthly", "quality"]
                  },
                  esim: {
                    type: "object",
                    properties: {
                      available: { type: "boolean" },
                      costMonthly: { type: "number", description: "Estimated monthly eSIM cost in USD" }
                    },
                    required: ["available", "costMonthly"]
                  },
                  legalNotes: {
                    type: "array",
                    items: { type: "string" },
                    description: "Important legal disclaimers about local laws"
                  }
                },
                required: ["language", "landscape", "taxation", "healthInsurance", "esim", "legalNotes"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "enrich_city" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI enrichment failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let enrichmentData: Record<string, unknown> = {};
    if (toolCall?.function?.arguments) {
      try {
        enrichmentData = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    // Cache the result
    await fetch(`${SUPABASE_URL}/rest/v1/city_enrichment_cache`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        slug,
        enrichment_data: enrichmentData,
        fetched_at: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify(enrichmentData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enrich-city error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
