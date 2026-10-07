import { describe, expect, it } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("supabase client", () => {
  it("constructs without throwing when the module loads", () => {
    expect(supabase).toBeTruthy();
    expect(typeof supabase.auth.getSession).toBe("function");
  });
});
