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


    // Extra city data (language, tax, insurance, eSIM, legal notes) is read from
    // the stored records only: this function makes no outside calls.
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

    // No stored record for this city. Records are prepared ahead of time and the
    // page falls back to the base dataset, so an empty answer is a normal case.
    return new Response(JSON.stringify({}), {
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
