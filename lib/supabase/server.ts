import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/env";

export function getSupabaseAdmin() {
  const url = getRequiredEnv("SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

