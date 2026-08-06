/**
 * Unsplash City Image Edge Function
 *
 * Endpoints:
 *   POST /city-image          — Resolve a city image (cache → Unsplash API → fallback)
 *   POST /city-image?action=download — Trigger Unsplash download event (required by API guidelines)
 *
 * Unsplash compliance:
 *   - Images are hotlinked via Unsplash CDN URLs (never re-hosted)
 *   - The download_location endpoint is triggered once per display
 *   - Photographer attribution data is stored and returned
 *   - API key is read from UNSPLASH_ACCESS_KEY secret
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UTM = "utm_source=digital_nomad_spin&utm_medium=referral";

/** Accept only plausible place names (letters, spaces, and common punctuation). */
function isSafeName(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= 80 &&
    /^[\p{L}\p{M}\p{N}\s'’.\-()/,]+$/u.test(v);
}

/** Deterministic, server-derived cache key. */
function makeSlug(cityName: string, country?: string | null): string {
  return `${cityName} ${country ?? ""}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const unsplashKey = Deno.env.get("UNSPLASH_ACCESS_KEY");

    // --- Download trigger endpoint ---
    if (body.action === "download") {
      const { downloadLocation } = body;
      // SSRF guard: only ever call the official Unsplash API host
      const isAllowed =
        typeof downloadLocation === "string" &&
        downloadLocation.length < 500 &&
        (() => {
          try {
            const u = new URL(downloadLocation);
            return u.protocol === "https:" && u.hostname === "api.unsplash.com";
          } catch {
            return false;
          }
        })();

      if (!isAllowed) {
        return new Response(JSON.stringify({ error: "Invalid downloadLocation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!unsplashKey) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const separator = downloadLocation.includes("?") ? "&" : "?";
      await fetch(`${downloadLocation}${separator}client_id=${unsplashKey}`);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Image resolve endpoint ---
    const { cityName, country } = body;
    if (!isSafeName(cityName) || (country != null && !isSafeName(country))) {
      return new Response(JSON.stringify({ error: "Invalid cityName or country" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Cache key is derived server-side from the validated city name/country,
    // never from a client-supplied slug (prevents cache poisoning of other cities).
    const slug = makeSlug(cityName, country);


    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check cache first
    const { data: cached } = await supabase
      .from("city_image_cache")
      .select("photo_id, image_url, photographer_name, photographer_url, unsplash_url, download_location")
      .eq("slug", slug)
      .maybeSingle();

    if (cached?.image_url) {
      return new Response(
        JSON.stringify({ ...cached, source: "cache" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!unsplashKey) {
      return new Response(
        JSON.stringify({ photo_id: null, source: "fallback", error: "No Unsplash key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const query = `${cityName} ${country || ""} cityscape`.trim();
    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

    const unsplashRes = await fetch(apiUrl, {
      headers: { Authorization: `Client-ID ${unsplashKey}` },
    });

    if (!unsplashRes.ok) {
      const errText = await unsplashRes.text();
      console.error("Unsplash error:", unsplashRes.status, errText);
      return new Response(
        JSON.stringify({ photo_id: null, source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const unsplashData = await unsplashRes.json();
    const photo = unsplashData.results?.[0];

    if (!photo) {
      return new Response(
        JSON.stringify({ photo_id: null, source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const record = {
      slug,
      photo_id: photo.id,
      image_url: photo.urls?.regular || photo.urls?.full,
      photographer_name: photo.user?.name || "Unknown",
      photographer_url: `${photo.user?.links?.html || "https://unsplash.com"}?${UTM}`,
      unsplash_url: `${photo.links?.html || "https://unsplash.com"}?${UTM}`,
      download_location: photo.links?.download_location || null,
      city_name: cityName,
      country: country || null,
    };

    // Cache it
    await supabase.from("city_image_cache").upsert(record);

    return new Response(
      JSON.stringify({ ...record, source: "unsplash" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("city-image error:", e);
    return new Response(
      JSON.stringify({ photo_id: null, source: "fallback", error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
