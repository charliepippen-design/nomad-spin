import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug, cityName, country, region } = await req.json();
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
      .select("photo_id")
      .eq("slug", slug)
      .maybeSingle();

    if (cached?.photo_id) {
      return new Response(
        JSON.stringify({ photoId: cached.photo_id, source: "cache" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from Unsplash
    const unsplashKey = Deno.env.get("UNSPLASH_ACCESS_KEY");
    if (!unsplashKey) {
      return new Response(
        JSON.stringify({ photoId: null, source: "fallback", error: "No Unsplash key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const query = `${cityName} ${country || ""} cityscape`.trim();
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    console.log("Fetching Unsplash:", url);

    const unsplashRes = await fetch(url, {
      headers: { Authorization: `Client-ID ${unsplashKey}` },
    });

    if (!unsplashRes.ok) {
      const errText = await unsplashRes.text();
      console.error("Unsplash error:", unsplashRes.status, errText);
      return new Response(
        JSON.stringify({ photoId: null, source: "fallback", debug: `Unsplash ${unsplashRes.status}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const unsplashData = await unsplashRes.json();
    const photo = unsplashData.results?.[0];

    if (!photo) {
      return new Response(
        JSON.stringify({ photoId: null, source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the photo ID from the Unsplash URL
    // URLs look like: https://images.unsplash.com/photo-1234567890?...
    const rawUrl: string = photo.urls?.raw || photo.urls?.full || "";
    const match = rawUrl.match(/photo-([a-zA-Z0-9_-]+)/);
    const photoId = match ? match[1] : photo.id;

    // Cache it
    await supabase.from("city_image_cache").upsert({
      slug,
      photo_id: photoId,
      city_name: cityName,
      country: country || null,
    });

    return new Response(
      JSON.stringify({ photoId, source: "unsplash" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("city-image error:", e);
    return new Response(
      JSON.stringify({ photoId: null, source: "fallback", error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
