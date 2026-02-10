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
      if (!downloadLocation || !unsplashKey) {
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
    const { slug, cityName, country, region } = body;
    if (!slug || !cityName) {
      return new Response(JSON.stringify({ error: "slug and cityName required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
