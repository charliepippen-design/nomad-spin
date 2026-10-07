import { describe, expect, it } from "vitest";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

describe("supabase client", () => {
  it("constructs without throwing when the module loads", () => {
    expect(supabase).toBeTruthy();
    expect(typeof supabase.auth.getSession).toBe("function");
    expect(typeof isSupabaseConfigured).toBe("boolean");
  });

  it("reports unconfigured when the Vite Supabase env is missing", () => {
    const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? "";
    const key = (
      (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
      (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
      ""
    ).trim();

    expect(isSupabaseConfigured).toBe(Boolean(url && key));
  });
});
